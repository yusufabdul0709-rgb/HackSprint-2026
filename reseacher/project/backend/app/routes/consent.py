from fastapi import APIRouter, Depends, HTTPException
from app.db.mongodb import get_db
from app.core.security import get_current_user
from app.core.permissions import require_role
from app.models.consent import ConsentResponse, ConsentCreate
from app.services.workflow_service import submit_consent, verify_consent
from app.repositories import consent as consent_repo

router = APIRouter()

@router.post("/request", response_model=ConsentResponse)
def req_consent(c_in: ConsentCreate, db = Depends(get_db), current_user: dict = Depends(require_role("RESEARCH_COORDINATOR", "PRINCIPAL_INVESTIGATOR", "PLATFORM_ADMIN"))):
    return consent_repo.create(db, c_in.model_dump())

@router.post("/{id}/submit")
def do_submit_consent(id: str, db = Depends(get_db), current_user: dict = Depends(require_role("PARTICIPANT"))):
    # we need participant_id which is linked to user. In reality, get participant_id from user.
    participant_id = current_user["id"] # assuming user id == participant id for simplicity, or look it up
    
    # lookup real participant id
    p = db.participants.find_one({"user_id": current_user["id"]})
    pid = str(p["_id"]) if p else current_user["id"]
    
    submit_consent(db, id, pid)
    return {"status": "success"}

@router.post("/{id}/verify")
def do_verify_consent(id: str, db = Depends(get_db), current_user: dict = Depends(require_role("RESEARCH_COORDINATOR"))):
    verify_consent(db, id, current_user["id"])
    return {"status": "success"}

@router.post("/{id}/withdraw")
def withdraw_consent(id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    consent = consent_repo.get_by_id(db, id)
    if not consent:
        raise HTTPException(status_code=404, detail="Consent not found")
    consent_repo.update_status(db, id, {"status": "WITHDRAWN"})
    # Need to update study_participant status to WITHDRAWN
    db.study_participants.update_one(
        {"participant_id": consent["participant_id"], "study_id": consent["study_id"]},
        {"$set": {"status": "WITHDRAWN"}}
    )
    return {"status": "success"}
