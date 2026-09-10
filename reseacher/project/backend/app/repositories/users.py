from bson import ObjectId
from typing import List, Optional

def create(db, user_data: dict) -> dict:
    result = db.users.insert_one(user_data)
    user_data["_id"] = str(result.inserted_id)
    return user_data

def get_by_id(db, user_id: str) -> Optional[dict]:
    user = db.users.find_one({"_id": ObjectId(user_id)})
    if user:
        user["_id"] = str(user["_id"])
    return user

def get_by_email(db, email: str) -> Optional[dict]:
    user = db.users.find_one({"email": email})
    if user:
        user["_id"] = str(user["_id"])
    return user

def list_all(db) -> List[dict]:
    users = list(db.users.find())
    for user in users:
        user["_id"] = str(user["_id"])
    return users

def update(db, user_id: str, update_data: dict) -> bool:
    result = db.users.update_one({"_id": ObjectId(user_id)}, {"$set": update_data})
    return result.modified_count > 0

def delete(db, user_id: str) -> bool:
    result = db.users.delete_one({"_id": ObjectId(user_id)})
    return result.deleted_count > 0
