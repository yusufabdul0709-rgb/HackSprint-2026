from app.db.mongodb import startup_connect, get_db
from app.core.security import hash_password
from datetime import datetime
import os

def seed():
    # Ensure env variables are loaded (using python-dotenv)
    from dotenv import load_dotenv
    load_dotenv()
    
    startup_connect()
    db = get_db()
    
    # Drop existing databases (for clean state in demo)
    for coll in db.list_collection_names():
        db[coll].drop()

    # 1. Organizations
    orgs_data = [
        {"name": "City Hospital", "type": "HOSPITAL", "status": "ACTIVE"},
        {"name": "Sunshine Medical Center", "type": "CLINIC", "status": "ACTIVE"},
        {"name": "Metro Care Research", "type": "RESEARCH_SITE", "status": "ACTIVE"},
        {"name": "Global Health University", "type": "UNIVERSITY", "status": "ACTIVE"},
        {"name": "LifeCare Hospital", "type": "HOSPITAL", "status": "ACTIVE"}
    ]
    org_ids = {}
    for o in orgs_data:
        res = db.organizations.insert_one(o)
        org_ids[o["name"]] = str(res.inserted_id)

    # 2. Users
    users_data = [
        {"email": "sarah.chen@trialbridge.io", "name": "Sarah Chen", "role": "PLATFORM_ADMIN", "password": "demo123"},
        {"email": "m.torres@pharmaco.com", "name": "Maria Torres", "role": "ORGANIZATION", "organization_id": org_ids["City Hospital"], "password": "demo123"},
        {"email": "j.patel@cityhospital.org", "name": "Dr. J Patel", "role": "PRINCIPAL_INVESTIGATOR", "organization_id": org_ids["City Hospital"], "password": "demo123"},
        {"email": "a.sharma@sunshine.org", "name": "Dr. A Sharma", "role": "PRINCIPAL_INVESTIGATOR", "organization_id": org_ids["Sunshine Medical Center"], "password": "demo123"},
        {"email": "maya.r@trialbridge.io", "name": "Maya R", "role": "RESEARCH_COORDINATOR", "organization_id": org_ids["City Hospital"], "password": "demo123"},
        {"email": "rahul.mehta@email.com", "name": "Rahul Mehta", "role": "PARTICIPANT", "password": "demo123"},
        {"email": "deepa.raj@email.com", "name": "Deepa Raj", "role": "PARTICIPANT", "password": "demo123"}
    ]
    user_ids = {}
    for u in users_data:
        pwd = u.pop("password")
        u["hashed_password"] = hash_password(pwd)
        u["is_active"] = True
        u["created_at"] = datetime.utcnow()
        res = db.users.insert_one(u)
        user_ids[u["email"]] = str(res.inserted_id)

    # 3. Research Sites
    sites_data = [
        {"name": "City Hospital Main", "organization_id": org_ids["City Hospital"], "principal_investigator_id": user_ids["j.patel@cityhospital.org"], "address": "123 Main St", "status": "ACTIVE"},
        {"name": "Sunshine Branch", "organization_id": org_ids["Sunshine Medical Center"], "principal_investigator_id": user_ids["a.sharma@sunshine.org"], "address": "456 Sun St", "status": "ACTIVE"}
    ]
    site_ids = []
    for s in sites_data:
        res = db.research_sites.insert_one(s)
        site_ids.append(str(res.inserted_id))

    # 4. Studies
    studies_data = [
        {"study_code": "DB-101", "title": "Diabetes Study", "description": "Type 2 Diabetes", "organization_id": org_ids["City Hospital"], "principal_investigator_id": user_ids["j.patel@cityhospital.org"], "status": "ACTIVE", "phase": "Phase 2", "criteria": [{"name": "HbA1c", "type": "lab", "description": "HbA1c > 6.5", "operator": ">", "value": "6.5", "is_inclusion": True}]},
        {"study_code": "CD-202", "title": "Cardiac Study", "description": "Heart failure", "organization_id": org_ids["City Hospital"], "principal_investigator_id": user_ids["j.patel@cityhospital.org"], "status": "ACTIVE", "phase": "Phase 3", "criteria": []},
        {"study_code": "ON-303", "title": "Oncology Study", "description": "Breast cancer", "organization_id": org_ids["Sunshine Medical Center"], "principal_investigator_id": user_ids["a.sharma@sunshine.org"], "status": "PLANNING", "phase": "Phase 1", "criteria": []},
        {"study_code": "NR-404", "title": "Neurology Study", "description": "Alzheimer's", "organization_id": org_ids["Sunshine Medical Center"], "principal_investigator_id": user_ids["a.sharma@sunshine.org"], "status": "ACTIVE", "phase": "Phase 2", "criteria": []}
    ]
    study_ids = {}
    for s in studies_data:
        s["created_at"] = datetime.utcnow()
        res = db.studies.insert_one(s)
        study_ids[s["study_code"]] = str(res.inserted_id)

    # 5. Participants
    participants_data = [
        {"participant_code": "P-001", "organization_id": org_ids["City Hospital"], "site_id": site_ids[0], "user_id": user_ids["rahul.mehta@email.com"], "status": "ACTIVE", "clinical_attributes": {"age": 45, "hba1c": 7.0}},
        {"participant_code": "P-002", "organization_id": org_ids["City Hospital"], "site_id": site_ids[0], "user_id": user_ids["deepa.raj@email.com"], "status": "ACTIVE", "clinical_attributes": {"age": 50, "hba1c": 6.1}},
    ]
    for i in range(3, 11):
        participants_data.append({"participant_code": f"P-{i:03d}", "organization_id": org_ids["City Hospital"], "status": "ACTIVE", "clinical_attributes": {"age": 40+i}})
        
    p_ids = []
    for p in participants_data:
        p["created_at"] = datetime.utcnow()
        res = db.participants.insert_one(p)
        p_ids.append(str(res.inserted_id))

    # 6. Study Participants
    for i in range(10):
        db.study_participants.insert_one({
            "participant_id": p_ids[i],
            "study_id": study_ids["DB-101"],
            "status": "IDENTIFIED",
            "added_at": datetime.utcnow()
        })

    # 7. Screening Results, Eligibility, Consent, Enrollment
    # Just creating a few mock records for P-001
    p_id = p_ids[0]
    s_id = study_ids["DB-101"]
    
    db.screening_results.insert_one({
        "participant_id": p_id, "study_id": s_id, "match_score": 95.0, "ai_confidence": 92.5, "run_at": datetime.utcnow(),
        "results": [{"criterion_id": "1", "name": "HbA1c", "status": "MATCH", "evidence": "Value 7.0 > 6.5"}]
    })
    
    db.eligibility_reviews.insert_one({
        "study_id": s_id, "participant_id": p_id, "coordinator_id": user_ids["maya.r@trialbridge.io"], "assigned_to_pi": user_ids["j.patel@cityhospital.org"], "status": "APPROVED", "pi_notes": "Looks good", "created_at": datetime.utcnow(), "updated_at": datetime.utcnow()
    })
    
    db.consents.insert_one({
        "participant_id": p_id, "study_id": s_id, "status": "VERIFIED", "version": "1.0", "created_at": datetime.utcnow(), "signed_at": datetime.utcnow(), "verified_at": datetime.utcnow(), "verified_by": user_ids["maya.r@trialbridge.io"]
    })
    
    db.enrollments.insert_one({
        "participant_id": p_id, "study_id": s_id, "status": "APPROVED", "enrolled_by": user_ids["maya.r@trialbridge.io"], "approved_at": datetime.utcnow(), "approved_by": user_ids["j.patel@cityhospital.org"], "created_at": datetime.utcnow()
    })
    
    db.study_participants.update_one({"participant_id": p_id, "study_id": s_id}, {"$set": {"status": "ENROLLED"}})
    
    # 8. Visits, Tasks, Documents, Messages, Notifications, Audit
    db.visits.insert_one({"participant_id": p_id, "study_id": s_id, "visit_name": "Baseline", "date": datetime.utcnow(), "status": "COMPLETED", "created_at": datetime.utcnow()})
    
    db.tasks.insert_one({"title": "Review P-002", "description": "Review screening", "assignee_id": user_ids["maya.r@trialbridge.io"], "study_id": s_id, "status": "TODO", "created_by": user_ids["j.patel@cityhospital.org"], "created_at": datetime.utcnow()})
    
    db.documents.insert_one({"title": "Protocol", "type": "PROTOCOL", "file_url": "s3://doc.pdf", "study_id": s_id, "uploaded_by": user_ids["j.patel@cityhospital.org"], "created_at": datetime.utcnow()})
    
    db.messages.insert_one({"from_id": user_ids["maya.r@trialbridge.io"], "to_id": user_ids["j.patel@cityhospital.org"], "content": "Please review P-002", "read": False, "sent_at": datetime.utcnow()})
    
    db.notifications.insert_one({"recipient_id": user_ids["j.patel@cityhospital.org"], "type": "TASK", "title": "New Task", "message": "Review P-002", "read": False, "created_at": datetime.utcnow()})
    
    db.audit_logs.insert_one({"user_id": user_ids["maya.r@trialbridge.io"], "role": "RESEARCH_COORDINATOR", "action": "LOGIN", "entity_type": "user", "entity_id": user_ids["maya.r@trialbridge.io"], "timestamp": datetime.utcnow()})

    print("Seeding complete.")

if __name__ == "__main__":
    seed()
