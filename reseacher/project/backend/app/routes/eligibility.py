from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.mongodb import get_db
from app.core.security import get_current_user
from app.core.permissions import require_role
from app.models.eligibility import EligibilityReviewResponse, EligibilityDecision
from app.services.eligibility_service import submit_to_pi, approve_eligibility, reject_eligibility, request_more_info
from app.repositories import eligibility as el_repo

router = APIRouter()

@router.post("/submit")
def submit_eligibility(participant_id: str, study_id: str, notes: str = "", db = Depends(get_db), current_user: dict = Depends(require_role("RESEARCH_COORDINATOR"))):
    review_id = submit_to_pi(db, participant_id, study_id, current_user["id"], notes)
    return {"status": "success", "review_id": review_id}

@router.get("/pending", response_model=List[EligibilityReviewResponse])
def get_pending_reviews(db = Depends(get_db), current_user: dict = Depends(require_role("PRINCIPAL_INVESTIGATOR"))):
    return el_repo.list_pending_for_pi(db, current_user["id"])

@router.post("/{review_id}/approve")
def approve(review_id: str, decision: EligibilityDecision, db = Depends(get_db), current_user: dict = Depends(require_role("PRINCIPAL_INVESTIGATOR"))):
    approve_eligibility(db, review_id, current_user["id"], decision.reason)
    return {"status": "success"}

@router.post("/{review_id}/reject")
def reject(review_id: str, decision: EligibilityDecision, db = Depends(get_db), current_user: dict = Depends(require_role("PRINCIPAL_INVESTIGATOR"))):
    reject_eligibility(db, review_id, current_user["id"], decision.reason)
    return {"status": "success"}

@router.post("/{review_id}/request-info")
def req_info(review_id: str, decision: EligibilityDecision, db = Depends(get_db), current_user: dict = Depends(require_role("PRINCIPAL_INVESTIGATOR"))):
    request_more_info(db, review_id, current_user["id"], decision.reason)
    return {"status": "success"}
