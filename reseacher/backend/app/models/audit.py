from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class AuditLogBase(BaseModel):
    user_id: str
    role: str
    action: str
    entity_type: str
    entity_id: str
    old_status: Optional[str] = None
    new_status: Optional[str] = None
    reason: Optional[str] = None

class AuditLogCreate(AuditLogBase):
    pass

class AuditLogInDB(AuditLogBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    timestamp: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(populate_by_name=True)

class AuditLogResponse(AuditLogBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    timestamp: datetime
    model_config = ConfigDict(populate_by_name=True)
