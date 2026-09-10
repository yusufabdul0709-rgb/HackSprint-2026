from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from typing import Optional
from datetime import datetime

class EligibilityReviewBase(BaseModel):
    study_id: str
    participant_id: str
    assigned_to_pi: str
    status: str = "PENDING_PI_REVIEW"
    coordinator_notes: Optional[str] = None
    pi_notes: Optional[str] = None

class EligibilityReviewCreate(EligibilityReviewBase):
    coordinator_id: str

class EligibilityReviewInDB(EligibilityReviewBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    coordinator_id: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(populate_by_name=True)

class EligibilityReviewResponse(EligibilityReviewBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    coordinator_id: str
    created_at: datetime
    updated_at: datetime
    model_config = ConfigDict(populate_by_name=True)

class EligibilityDecision(BaseModel):
    reason: str
