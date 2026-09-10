from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.mongodb import get_db
from app.core.security import get_current_user
from app.core.permissions import require_role, require_participant_self_access
from app.models.participant import ParticipantResponse, ParticipantCreate
from app.models.study import StudyResponse
from app.repositories import participants as participant_repo
from app.repositories import study_participants as sp_repo
from app.repositories import studies as study_repo

router = APIRouter()

@router.get("/", response_model=List[ParticipantResponse])
def read_participants(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "PARTICIPANT":
        raise HTTPException(status_code=403, detail="Not authorized")
    elif current_user["role"] == "ORGANIZATION":
        return participant_repo.list_by_org(db, current_user.get("organization_id"))
    return participant_repo.list_all(db)

@router.post("/", response_model=ParticipantResponse)
def create_participant(p_in: ParticipantCreate, db = Depends(get_db), current_user: dict = Depends(require_role("PLATFORM_ADMIN", "ORGANIZATION", "RESEARCH_COORDINATOR"))):
    return participant_repo.create(db, p_in.model_dump())

@router.get("/{id}", response_model=ParticipantResponse)
def read_participant(id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_participant_self_access(current_user, id, db)
    p = participant_repo.get_by_id(db, id)
    if not p:
        raise HTTPException(status_code=404, detail="Participant not found")
    return p

@router.get("/{id}/studies", response_model=List[StudyResponse])
def read_participant_studies(id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_participant_self_access(current_user, id, db)
    sps = sp_repo.list_by_participant(db, id)
    studies = []
    for sp in sps:
        s = study_repo.get_by_id(db, sp["study_id"])
        if s:
            s["status"] = sp["status"] # override status for context
            studies.append(s)
    return studies
