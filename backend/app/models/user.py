from datetime import datetime, timezone
from typing import Optional, List
from pydantic import BaseModel, Field

class UserBase(BaseModel):
    email: str = Field(..., description="Parent contact email address")
    name: str = Field(..., description="Full display name")
    role: str = Field(default="parent", description="Account role: parent or educator")

class UserCreate(UserBase):
    password: str = Field(..., min_length=6, description="Raw password to be hashed before storage")

class UserInDB(UserBase):
    id: str = Field(..., alias="_id", description="Unique MongoDB user identifier")
    password_hash: str = Field(..., description="Bcrypt salted password hash")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True

class UserResponse(UserBase):
    id: str
    created_at: Optional[datetime] = None

class ChildProfileBase(BaseModel):
    name: str = Field(..., description="Child display name")
    username: str = Field(..., description="Unique classroom explorer username")
    parent_id: str = Field(..., description="Associated parent identifier")
    role: str = Field(default="student", description="Role identifier")
    grade_band: str = Field(default="Grade 3-4", description="Target academic grade band")

class ChildProfileCreate(ChildProfileBase):
    pin: str = Field(..., min_length=4, max_length=6, description="Child login PIN")

class ChildProfileInDB(ChildProfileBase):
    id: str = Field(..., alias="_id", description="Unique MongoDB child identifier")
    pin_hash: str = Field(..., description="Bcrypt salted PIN hash")
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))

    class Config:
        populate_by_name = True

class ChildProfileResponse(ChildProfileBase):
    id: str
    created_at: Optional[datetime] = None
