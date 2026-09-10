from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class NotificationBase(BaseModel):
    recipient_id: str
    type: str
    title: str
    message: str
    entity_type: Optional[str] = None
    entity_id: Optional[str] = None
    read: bool = False

class NotificationCreate(NotificationBase):
    pass

class NotificationInDB(NotificationBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(populate_by_name=True)

class NotificationResponse(NotificationBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    created_at: datetime
    model_config = ConfigDict(populate_by_name=True)
