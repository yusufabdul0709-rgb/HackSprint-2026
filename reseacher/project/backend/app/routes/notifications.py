from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.mongodb import get_db
from app.core.security import get_current_user
from app.models.notification import NotificationResponse
from app.repositories import notifications as notif_repo

router = APIRouter()

@router.get("/", response_model=List[NotificationResponse])
def get_notifs(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    return notif_repo.list_by_recipient(db, current_user["id"])

@router.patch("/{id}/read")
def mark_read(id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    success = notif_repo.mark_read(db, id)
    if not success:
        raise HTTPException(status_code=404, detail="Not found")
    return {"status": "success"}

@router.patch("/read-all")
def mark_all_read(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    notif_repo.mark_all_read(db, current_user["id"])
    return {"status": "success"}
