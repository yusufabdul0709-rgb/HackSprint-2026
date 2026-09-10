from bson import ObjectId
from datetime import datetime
from app.services.audit_service import log_action
from app.services.notification_service import create_notification
from fastapi import HTTPException

def submit_to_pi(db, participant_id: str, study_id: str, coordinator_id: str, coordinator_notes: str):
    study = db.studies.find_one({"_id": ObjectId(study_id)})
    if not study:
        raise HTTPException(status_code=404, detail="Study not found")
        
    er_data = {
        "study_id": study_id,
        "participant_id": participant_id,
        "coordinator_id": coordinator_id,
        "assigned_to_pi": study["principal_investigator_id"],
        "status": "PENDING_PI_REVIEW",
        "coordinator_notes": coordinator_notes,
        "created_at": datetime.utcnow(),
        "updated_at": datetime.utcnow()
    }
    result = db.eligibility_reviews.insert_one(er_data)
    
    db.study_participants.update_one(
        {"participant_id": participant_id, "study_id": study_id},
        {"$set": {"status": "IN_REVIEW"}}
    )
    
    create_notification(
        db, study["principal_investigator_id"], "ELIGIBILITY_REVIEW",
        "New Eligibility Review", f"Participant {participant_id} needs review",
        "eligibility_review", str(result.inserted_id)
    )
    
    log_action(db, coordinator_id, "RESEARCH_COORDINATOR", "SUBMIT_ELIGIBILITY", "eligibility_review", str(result.inserted_id))
    return str(result.inserted_id)

def approve_eligibility(db, review_id: str, pi_id: str, reason: str):
    review = db.eligibility_reviews.find_one({"_id": ObjectId(review_id)})
    if not review or review["assigned_to_pi"] != pi_id:
        raise HTTPException(status_code=404, detail="Review not found or not assigned to you")
        
    db.eligibility_reviews.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": {"status": "APPROVED", "pi_notes": reason, "updated_at": datetime.utcnow()}}
    )
    
    db.study_participants.update_one(
        {"participant_id": review["participant_id"], "study_id": review["study_id"]},
        {"$set": {"status": "ELIGIBLE"}}
    )
    
    create_notification(
        db, review["coordinator_id"], "ELIGIBILITY_DECISION",
        "Eligibility Approved", f"PI approved participant {review['participant_id']}",
        "eligibility_review", review_id
    )
    
    log_action(db, pi_id, "PRINCIPAL_INVESTIGATOR", "APPROVE_ELIGIBILITY", "eligibility_review", review_id, "PENDING_PI_REVIEW", "APPROVED", reason)
    return True

def reject_eligibility(db, review_id: str, pi_id: str, reason: str):
    review = db.eligibility_reviews.find_one({"_id": ObjectId(review_id)})
    if not review or review["assigned_to_pi"] != pi_id:
        raise HTTPException(status_code=404, detail="Review not found or not assigned to you")
        
    db.eligibility_reviews.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": {"status": "REJECTED", "pi_notes": reason, "updated_at": datetime.utcnow()}}
    )
    
    db.study_participants.update_one(
        {"participant_id": review["participant_id"], "study_id": review["study_id"]},
        {"$set": {"status": "NOT_ELIGIBLE"}}
    )
    
    create_notification(
        db, review["coordinator_id"], "ELIGIBILITY_DECISION",
        "Eligibility Rejected", f"PI rejected participant {review['participant_id']}",
        "eligibility_review", review_id
    )
    
    log_action(db, pi_id, "PRINCIPAL_INVESTIGATOR", "REJECT_ELIGIBILITY", "eligibility_review", review_id, "PENDING_PI_REVIEW", "REJECTED", reason)
    return True

def request_more_info(db, review_id: str, pi_id: str, reason: str):
    review = db.eligibility_reviews.find_one({"_id": ObjectId(review_id)})
    if not review or review["assigned_to_pi"] != pi_id:
        raise HTTPException(status_code=404, detail="Review not found or not assigned to you")
        
    db.eligibility_reviews.update_one(
        {"_id": ObjectId(review_id)},
        {"$set": {"status": "INFO_REQUESTED", "pi_notes": reason, "updated_at": datetime.utcnow()}}
    )
    
    # Create task for coordinator
    task_data = {
        "title": "Provide more info for eligibility",
        "description": reason,
        "assignee_id": review["coordinator_id"],
        "study_id": review["study_id"],
        "status": "TODO",
        "created_by": pi_id,
        "created_at": datetime.utcnow()
    }
    db.tasks.insert_one(task_data)
    
    create_notification(
        db, review["coordinator_id"], "INFO_REQUEST",
        "More Info Requested", f"PI requested more info for participant {review['participant_id']}",
        "eligibility_review", review_id
    )
    
    log_action(db, pi_id, "PRINCIPAL_INVESTIGATOR", "REQUEST_INFO_ELIGIBILITY", "eligibility_review", review_id, "PENDING_PI_REVIEW", "INFO_REQUESTED", reason)
    return True
