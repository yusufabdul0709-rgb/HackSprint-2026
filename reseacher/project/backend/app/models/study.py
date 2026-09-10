from pydantic import AliasChoices, BaseModel, ConfigDict, Field
from typing import List, Optional
from datetime import datetime

class StudyCriterionBase(BaseModel):
    name: str
    type: str
    description: str
    operator: str
    value: str
    is_inclusion: bool

class StudyCriterionCreate(StudyCriterionBase):
    pass

class StudyCriterionInDB(StudyCriterionBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    model_config = ConfigDict(populate_by_name=True)

class StudyBase(BaseModel):
    study_code: str
    title: str
    description: str
    organization_id: str
    principal_investigator_id: str
    status: str = "PLANNING"
    phase: str

class StudyCreate(StudyBase):
    criteria: Optional[List[StudyCriterionCreate]] = []

class StudyInDB(StudyBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    criteria: List[dict] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(populate_by_name=True)

class StudyResponse(StudyBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    criteria: List[dict] = []
    created_at: datetime
    model_config = ConfigDict(populate_by_name=True)
