from pydantic import AliasChoices, BaseModel, EmailStr, ConfigDict, Field
from typing import Optional
from datetime import datetime

class UserBase(BaseModel):
    email: EmailStr
    name: str
    role: str
    organization_id: Optional[str] = None
    is_active: bool = True

class UserCreate(UserBase):
    password: str

class UserInDB(UserBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    hashed_password: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
    
    model_config = ConfigDict(populate_by_name=True)

class UserResponse(UserBase):
    id: str = Field(validation_alias=AliasChoices("_id", "id"))
    email: EmailStr
    name: str
    role: str
    organization_id: Optional[str] = None
    is_active: bool
    created_at: datetime
    model_config = ConfigDict(populate_by_name=True)

class UserLogin(BaseModel):
    email: EmailStr
    password: str
