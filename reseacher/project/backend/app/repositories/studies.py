from bson import ObjectId
from typing import List, Optional

def create(db, study_data: dict) -> dict:
    result = db.studies.insert_one(study_data)
    study_data["_id"] = str(result.inserted_id)
    return study_data

def get_by_id(db, study_id: str) -> Optional[dict]:
    study = db.studies.find_one({"_id": ObjectId(study_id)})
    if study:
        study["_id"] = str(study["_id"])
    return study

def list_all(db) -> List[dict]:
    studies = list(db.studies.find())
    for s in studies:
        s["_id"] = str(s["_id"])
    return studies

def list_by_org(db, org_id: str) -> List[dict]:
    studies = list(db.studies.find({"organization_id": org_id}))
    for s in studies:
        s["_id"] = str(s["_id"])
    return studies

def list_by_pi(db, pi_id: str) -> List[dict]:
    studies = list(db.studies.find({"principal_investigator_id": pi_id}))
    for s in studies:
        s["_id"] = str(s["_id"])
    return studies

def update(db, study_id: str, update_data: dict) -> bool:
    result = db.studies.update_one({"_id": ObjectId(study_id)}, {"$set": update_data})
    return result.modified_count > 0
