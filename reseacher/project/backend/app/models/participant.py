from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from typing import Optional, Dict, Any
from datetime import datetime

class ClinicalAttributes(BaseModel):
    age: Optional[int] = None
    gender: Optional[str] = None
    conditions: Optional[list] = []
    medications: Optional[list] = []
    lab_results: Optional[Dict[str, Any]] = {}
    vital_signs: Optional[Dict[str, Any]] = {}

class ParticipantBase(BaseModel):
    participant_code: str
    organization_id: str
    site_id: Optional[str] = None
    user_id: Optional[str] = None
    status: str = "ACTIVE"
    clinical_attributes: ClinicalAttributes = Field(default_factory=ClinicalAttributes)

class ParticipantCreate(ParticipantBase):
    pass

class ParticipantInDB(ParticipantBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(populate_by_name=True)

class ParticipantResponse(ParticipantBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    created_at: datetime
    model_config = ConfigDict(populate_by_name=True)

class StudyParticipantBase(BaseModel):
    participant_id: str
    study_id: str
    status: str = "IDENTIFIED"

class StudyParticipantCreate(StudyParticipantBase):
    pass

class StudyParticipantInDB(StudyParticipantBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    added_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(populate_by_name=True)

class StudyParticipantResponse(StudyParticipantBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    added_at: datetime
    model_config = ConfigDict(populate_by_name=True)
