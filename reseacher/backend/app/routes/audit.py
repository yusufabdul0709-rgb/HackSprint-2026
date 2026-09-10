from fastapi import APIRouter, Depends
from typing import List
from app.db.mongodb import get_db
from app.core.security import get_current_user
from app.core.permissions import require_role
from app.models.audit import AuditLogResponse
from app.repositories import audit as audit_repo

router = APIRouter()

@router.get("/", response_model=List[AuditLogResponse])
def get_logs(db = Depends(get_db), current_user: dict = Depends(require_role("PLATFORM_ADMIN", "PRINCIPAL_INVESTIGATOR"))):
    return audit_repo.list_all(db)
