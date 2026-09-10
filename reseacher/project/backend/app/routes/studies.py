from fastapi import APIRouter, Depends, HTTPException
from typing import List
from app.db.mongodb import get_db
from app.core.security import get_current_user
from app.core.permissions import require_role, require_study_access, require_organization_access
from app.models.study import StudyResponse, StudyCreate, StudyCriterionCreate
from app.models.participant import ParticipantResponse
from app.repositories import studies as study_repo
from app.repositories import participants as participant_repo
from app.repositories import study_participants as sp_repo

router = APIRouter()

@router.get("/", response_model=List[StudyResponse])
def read_studies(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    if current_user["role"] == "PLATFORM_ADMIN":
        return study_repo.list_all(db)
    elif current_user["role"] == "ORGANIZATION":
        return study_repo.list_by_org(db, current_user.get("organization_id"))
    elif current_user["role"] == "PRINCIPAL_INVESTIGATOR":
        return study_repo.list_by_pi(db, current_user.get("id"))
    else:
        return study_repo.list_all(db) # simplify for others

@router.post("/", response_model=StudyResponse)
def create_study(study_in: StudyCreate, db = Depends(get_db), current_user: dict = Depends(require_role("PLATFORM_ADMIN", "ORGANIZATION"))):
    if current_user["role"] == "ORGANIZATION":
        require_organization_access(current_user, study_in.organization_id)
    return study_repo.create(db, study_in.model_dump())

@router.get("/{id}", response_model=StudyResponse)
def read_study(id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_study_access(current_user, id, db)
    study = study_repo.get_by_id(db, id)
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
    return study

@router.put("/{id}")
def update_study(id: str, update_data: dict, db = Depends(get_db), current_user: dict = Depends(require_role("PLATFORM_ADMIN", "ORGANIZATION", "PRINCIPAL_INVESTIGATOR"))):
    require_study_access(current_user, id, db)
    success = study_repo.update(db, id, update_data)
    if not success:
        raise HTTPException(status_code=404, detail="Study not found")
    return {"status": "success"}

@router.get("/{id}/criteria")
def read_criteria(id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_study_access(current_user, id, db)
    study = study_repo.get_by_id(db, id)
    return study.get("criteria", [])

@router.post("/{id}/criteria")
def add_criteria(id: str, criteria: List[StudyCriterionCreate], db = Depends(get_db), current_user: dict = Depends(require_role("PLATFORM_ADMIN", "ORGANIZATION", "PRINCIPAL_INVESTIGATOR"))):
    require_study_access(current_user, id, db)
    study = study_repo.get_by_id(db, id)
    existing_criteria = study.get("criteria", [])
    new_criteria = [c.model_dump() for c in criteria]
    for i, nc in enumerate(new_criteria):
        nc["_id"] = str(i + len(existing_criteria))
    existing_criteria.extend(new_criteria)
    study_repo.update(db, id, {"criteria": existing_criteria})
    return existing_criteria

@router.get("/{id}/participants", response_model=List[ParticipantResponse])
def read_study_participants(id: str, db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    require_study_access(current_user, id, db)
    return participant_repo.list_by_study(db, id)

@router.post("/{id}/participants")
def add_participant_to_study(id: str, participant_id: str, db = Depends(get_db), current_user: dict = Depends(require_role("RESEARCH_COORDINATOR", "PRINCIPAL_INVESTIGATOR", "ORGANIZATION", "PLATFORM_ADMIN"))):
    require_study_access(current_user, id, db)
    if sp_repo.get(db, participant_id, id):
        raise HTTPException(status_code=400, detail="Participant already in study")
    sp_data = {"participant_id": participant_id, "study_id": id, "status": "IDENTIFIED"}
    return sp_repo.create(db, sp_data)
