from bson import ObjectId
from typing import List, Optional

def create(db, consent_data: dict) -> dict:
    result = db.consents.insert_one(consent_data)
    consent_data["_id"] = str(result.inserted_id)
    return consent_data

def get_by_id(db, consent_id: str) -> Optional[dict]:
    consent = db.consents.find_one({"_id": ObjectId(consent_id)})
    if consent:
        consent["_id"] = str(consent["_id"])
    return consent

def get_by_participant_study(db, participant_id: str, study_id: str) -> Optional[dict]:
    consent = db.consents.find_one({"participant_id": participant_id, "study_id": study_id})
    if consent:
        consent["_id"] = str(consent["_id"])
    return consent

def update_status(db, consent_id: str, update_data: dict) -> bool:
    result = db.consents.update_one({"_id": ObjectId(consent_id)}, {"$set": update_data})
    return result.modified_count > 0
