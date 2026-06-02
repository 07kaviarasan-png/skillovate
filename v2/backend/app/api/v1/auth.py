"""
Skillovate V2 — Auth Router
"""
from fastapi import APIRouter, Depends, Response, status
from app.schemas.auth import RegisterRequest, LoginRequest, RefreshTokenRequest, UserBriefResponse
from app.schemas.common import MessageResponse
from app.services.auth_service import AuthService
from app.dependencies import get_auth_service
from app.core.rbac import get_current_user
from app.models.user import User

router = APIRouter(prefix="/auth", tags=["Authentication"])


def _legacy_user(user: UserBriefResponse):
    data = user.model_dump()
    data["_id"] = str(user.id)
    data["collegeId"] = user.college_id
    return data


def _token_payload(token_response):
    user = _legacy_user(token_response.user)
    return {
        "success": True,
        "access_token": token_response.access_token,
        "refresh_token": token_response.refresh_token,
        "token_type": token_response.token_type,
        "expires_in": token_response.expires_in,
        "user": token_response.user,
        "token": token_response.access_token,
        "data": {"user": user, "token": token_response.access_token},
    }


def _set_token_cookie(response: Response, token: str, expires_in: int):
    response.set_cookie("token", token, httponly=True, samesite="lax", max_age=expires_in, path="/")


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    data: dict,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Register a new user account."""
    role = data.get("role") or "student"
    if role == "hr":
        role = "recruiter"
    request = RegisterRequest(
        email=data.get("email"),
        password=data.get("password"),
        name=data.get("name"),
        role=role,
        college_id=data.get("college_id") or data.get("collegeId"),
        department=data.get("department"),
        student_id=data.get("student_id") or data.get("studentId"),
        year=data.get("year"),
        company_name=data.get("company_name") or data.get("company"),
    )
    auth_service.register(request)
    token_response = auth_service.login(LoginRequest(email=request.email, password=request.password))
    _set_token_cookie(response, token_response.access_token, token_response.expires_in)
    return _token_payload(token_response)


@router.post("/login")
def login(
    data: dict,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Login and receive access & refresh tokens."""
    if data.get("studentId") and not data.get("email"):
        token_response = auth_service.login_with_student_id(
            data["studentId"],
            data.get("password", ""),
            data.get("collegeId") or data.get("college_id"),
        )
    else:
        token_response = auth_service.login(LoginRequest(email=data.get("email"), password=data.get("password", "")))
    _set_token_cookie(response, token_response.access_token, token_response.expires_in)
    return _token_payload(token_response)


@router.post("/refresh")
def refresh_token(
    data: RefreshTokenRequest,
    response: Response,
    auth_service: AuthService = Depends(get_auth_service)
):
    """Refresh an access token using a valid refresh token (token rotation enabled)."""
    token_response = auth_service.refresh_token(data.refresh_token)
    _set_token_cookie(response, token_response.access_token, token_response.expires_in)
    return _token_payload(token_response)


@router.post("/logout", response_model=MessageResponse)
def logout(
    current_user: User = Depends(get_current_user),
    auth_service: AuthService = Depends(get_auth_service)
):
    """Logout the user by revoking all their refresh tokens."""
    auth_service.logout(current_user.id)
    return MessageResponse(message="Successfully logged out")


@router.get("/me", response_model=UserBriefResponse)
def get_me(
    current_user: User = Depends(get_current_user)
):
    """Get the current authenticated user's profile info."""
    return UserBriefResponse.model_validate(current_user)


from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.auth import UpdateProfileRequest

@router.put("/update", response_model=UserBriefResponse)
def update_profile(
    data: UpdateProfileRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user profile."""
    if data.name is not None:
        current_user.name = data.name
    if data.department is not None:
        current_user.department = data.department
    if data.avatar_url is not None:
        current_user.avatar_url = data.avatar_url

    if data.company_name is not None and current_user.role == "recruiter":
        if current_user.recruiter_profile:
            current_user.recruiter_profile.company_name = data.company_name

    db.commit()
    db.refresh(current_user)
    return UserBriefResponse.model_validate(current_user)
