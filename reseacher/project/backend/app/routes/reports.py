from fastapi import APIRouter, Depends
from app.db.mongodb import get_db
from app.core.security import get_current_user

router = APIRouter()

@router.get("/dashboard/{role}")
def get_dashboard(role: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Mock dashboard metrics
    return {
        "active_studies": db.studies.count_documents({"status": "ACTIVE"}),
        "total_participants": db.participants.count_documents({}),
        "pending_reviews": db.eligibility_reviews.count_documents({"status": "PENDING_PI_REVIEW"})
    }

@router.get("/enrollment")
def get_enrollment_report(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Mock enrollment stats
    return {"enrolled": db.enrollments.count_documents({"status": "APPROVED"})}

@router.get("/screening")
def get_screening_report(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    # Mock screening stats
    return {"total_screened": db.screening_results.count_documents({})}
