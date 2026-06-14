from typing import List
from fastapi import Depends, HTTPException, status
from app.models import User
from app.routers.auth import get_current_user

class RoleChecker:
    def __init__(self, allowed_roles: List[str]):
        self.allowed_roles = allowed_roles

    def __call__(self, current_user: User = Depends(get_current_user)):
        # Role hierarchy logic
        role_hierarchy = {
            "super_admin": 4,
            "college_admin": 3,
            "faculty": 2,
            "recruiter": 1,
            "student": 0
        }
        
        user_role_level = role_hierarchy.get(current_user.role, -1)
        
        # Check if user has at least one of the allowed roles 
        # OR if they have a higher role in the hierarchy than the required ones
        max_allowed_level = max([role_hierarchy.get(role, -1) for role in self.allowed_roles])
        
        if user_role_level < max_allowed_level:
            # Special case: if user_role is exactly in allowed_roles, let them in
            if current_user.role not in self.allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="You do not have enough permissions to perform this action"
                )
        
        return current_user

# Usage examples:
# @router.post("/", dependencies=[Depends(RoleChecker(["super_admin"]))])
# @router.get("/college-data", dependencies=[Depends(RoleChecker(["college_admin", "faculty"]))])
