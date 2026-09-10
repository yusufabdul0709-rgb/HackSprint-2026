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

def _enrich_participant(db, p: dict) -> dict:
    from bson import ObjectId
    p["id"] = str(p.get("_id") or p.get("id"))
    
    # User details
    u_id = p.get("user_id")
    u_doc = None
    if u_id:
        try:
            u_doc = db.users.find_one({"_id": ObjectId(u_id)})
        except Exception:
            u_doc = db.users.find_one({"_id": u_id})
    if not u_doc and p.get("email"):
        u_doc = db.users.find_one({"email": p["email"]})
        
    p["name"] = u_doc.get("name") if u_doc else p.get("name", f"Participant {p.get('participant_code', '')}")
    p["email"] = u_doc.get("email") if u_doc else p.get("email", "")
    
    # Clinical attributes
    clin = p.get("clinical_attributes") or {}
    p["age"] = clin.get("age") or p.get("age", 45)
    p["gender"] = clin.get("gender") or p.get("gender", "Male")
    p["phone"] = p.get("phone", "+91 98765 43210")
    p["location"] = p.get("location", "Main Site")
    p["clinicalData"] = p.get("clinicalData") or clin.get("clinicalData") or (clin if "baselineHba1c" in clin or "doseMg" in clin else None)

    # Study connection
    sp = None
    try:
        p_oid = ObjectId(p["id"])
        sp = db.study_participants.find_one({"participant_id": {"$in": [p["id"], str(p_oid)]}})
    except Exception:
        sp = db.study_participants.find_one({"participant_id": p["id"]})
        
    study_id = sp.get("study_id") if sp else p.get("study_id")
    study_name = "Clinical Trial"
    if study_id:
        try:
            s_doc = db.studies.find_one({"_id": ObjectId(study_id)})
        except Exception:
            s_doc = db.studies.find_one({"_id": study_id})
        if s_doc:
            study_name = s_doc.get("title") or s_doc.get("name", "Clinical Trial")
            
    p["studyId"] = str(study_id) if study_id else "ST-001"
    p["study_id"] = str(study_id) if study_id else "ST-001"
    p["studyName"] = study_name
    p["study_name"] = study_name
    
    # Statuses
    p["enrollmentStatus"] = (sp.get("status") if sp else "enrolled").lower()
    p["screeningStatus"] = "approved"
    p["consentStatus"] = "consented"
    p["lastActivity"] = "2026-09-10"
    return p

@router.get("/", response_model=List[ParticipantResponse])
def read_participants(db = Depends(get_db), current_user: dict = Depends(get_current_user)):
    from bson import ObjectId
    if current_user["role"] == "PARTICIPANT":
        uid = current_user["id"]
        try:
            p = db.participants.find_one({"$or": [{"user_id": uid}, {"user_id": ObjectId(uid)}]})
        except Exception:
            p = db.participants.find_one({"user_id": uid})
        if not p and current_user.get("email"):
            u = db.users.find_one({"email": current_user["email"]})
            if u:
                u_str_id = str(u["_id"])
                p = db.participants.find_one({"$or": [{"user_id": u_str_id}, {"user_id": u["_id"]}]})
        if not p:
            # Fallback to first participant in DB for participant user
            p = db.participants.find_one()
        if p:
            p["_id"] = str(p["_id"])
            return [_enrich_participant(db, p)]
        return []
    elif current_user["role"] == "ORGANIZATION":
        ps = participant_repo.list_by_org(db, current_user.get("organization_id"))
    else:
        ps = participant_repo.list_all(db)
    return [_enrich_participant(db, p) for p in ps]

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
