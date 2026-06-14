from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.repositories.user_repo import user_repo
from app.models import User
from app.schemas import UserCreate, UserUpdate

class UserService:
    def get_user(self, db: Session, user_id: int) -> Optional[User]:
        return user_repo.get(db, id=user_id)

    def get_users(self, db: Session, skip: int = 0, limit: int = 100) -> Tuple[List[User], int]:
        users = user_repo.get_multi(db, skip=skip, limit=limit)
        total = user_repo.count(db)
        return users, total

    def search_users(self, db: Session, query: str, skip: int = 0, limit: int = 100) -> Tuple[List[User], int]:
        users = user_repo.search(db, query=query, skip=skip, limit=limit)
        # Simplified count for search
        total = len(users) if len(users) < limit else user_repo.count(db) # Approximation
        return users, total

    def create_user(self, db: Session, user_in: UserCreate) -> User:
        return user_repo.create(db, obj_in=user_in)

    def update_user(self, db: Session, user_id: int, user_in: UserUpdate) -> Optional[User]:
        user = user_repo.get(db, id=user_id)
        if not user:
            return None
        return user_repo.update(db, db_obj=user, obj_in=user_in)

    def delete_user(self, db: Session, user_id: int) -> Optional[User]:
        return user_repo.remove(db, id=user_id)

user_service = UserService()
