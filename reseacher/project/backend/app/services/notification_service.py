from datetime import datetime

def create_notification(db, recipient_id: str, type: str, title: str, message: str, entity_type: str = None, entity_id: str = None):
    notif_data = {
        "recipient_id": recipient_id,
        "type": type,
        "title": title,
        "message": message,
        "entity_type": entity_type,
        "entity_id": entity_id,
        "read": False,
        "created_at": datetime.utcnow()
    }
    result = db.notifications.insert_one(notif_data)
    return str(result.inserted_id)

def notify_role_for_study(db, study_id: str, role: str, title: str, message: str, entity_type: str = None, entity_id: str = None):
    study = db.studies.find_one({"_id": {"$in": [study_id, type(study_id) == str and __import__("bson").ObjectId(study_id) or study_id]}})
    if not study:
        return
    
    if role == "PRINCIPAL_INVESTIGATOR":
        pi_id = study.get("principal_investigator_id")
        if pi_id:
            create_notification(db, pi_id, "STUDY_UPDATE", title, message, entity_type, entity_id)
            
    # Add other role resolution logic here if needed
