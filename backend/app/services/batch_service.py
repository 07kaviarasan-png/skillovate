from typing import List, Optional, Tuple
from sqlalchemy.orm import Session
from app.repositories.batch_repo import batch_repo
from app.models import Batch
from app.schemas import BatchCreate, BatchUpdate

class BatchService:
    def get_batch(self, db: Session, batch_id: int) -> Optional[Batch]:
        return batch_repo.get(db, id=batch_id)

    def get_batches(self, db: Session, skip: int = 0, limit: int = 100) -> Tuple[List[Batch], int]:
        batches = batch_repo.get_multi(db, skip=skip, limit=limit)
        total = batch_repo.count(db)
        return batches, total

    def create_batch(self, db: Session, batch_in: BatchCreate) -> Batch:
        return batch_repo.create(db, obj_in=batch_in)

    def update_batch(self, db: Session, batch_id: int, batch_in: BatchUpdate) -> Optional[Batch]:
        batch = batch_repo.get(db, id=batch_id)
        if not batch:
            return None
        return batch_repo.update(db, db_obj=batch, obj_in=batch_in)

    def delete_batch(self, db: Session, batch_id: int) -> Optional[Batch]:
        return batch_repo.remove(db, id=batch_id)

batch_service = BatchService()
