from pydantic import BaseModel, validator, Field
from typing import List, Optional
from datetime import datetime

class UserBase(BaseModel):
    username: str

class UserCreate(UserBase):
    password: str

class UserLogin(UserBase):
    password: str

class UserResponse(UserBase):
    id: int
    isPremium: bool
    stripeCustomerId: Optional[str] = None
    trialExpiresAt: Optional[datetime] = None
    
    class Config:
        from_attributes = True

class SocialLinkBase(BaseModel):
    platform: str
    url: str

class SocialLinkCreate(SocialLinkBase):
    pass

class SocialLinkResponse(SocialLinkBase):
    id: int
    profileId: int
    
    class Config:
        from_attributes = True

class ProfileBase(BaseModel):
    name: str
    displayName: str
    title: Optional[str] = None
    bio: Optional[str] = None
    photoUrl: Optional[str] = None
    qrStyle: str = "basic"
    qrColor: str = "#3B82F6"
    qrSize: int = 150
    qrPosition: str = "bottom"
    photoPosition: str = "top"
    layoutStyle: str = "standard"

class ProfileCreate(ProfileBase):
    slug: Optional[str] = None  # Will be generated on server if not provided
    socialLinks: List[SocialLinkBase]
    
    @validator('socialLinks')
    def validate_social_links(cls, v):
        if not v:
            return []
        return v

class ProfileUpdate(BaseModel):
    name: Optional[str] = None
    displayName: Optional[str] = None
    title: Optional[str] = None
    bio: Optional[str] = None
    photoUrl: Optional[str] = None
    qrStyle: Optional[str] = None
    qrColor: Optional[str] = None
    qrSize: Optional[int] = None
    qrPosition: Optional[str] = None
    photoPosition: Optional[str] = None
    layoutStyle: Optional[str] = None
    socialLinks: Optional[List[SocialLinkBase]] = None

class ProfileResponse(ProfileBase):
    id: int
    userId: int
    slug: str
    scanCount: int
    createdAt: datetime
    socialLinks: List[SocialLinkResponse] = []
    
    class Config:
        from_attributes = True

class ScanLogBase(BaseModel):
    ipAddress: Optional[str] = None
    userAgent: Optional[str] = None
    location: Optional[str] = None
    device: Optional[str] = None
    referrer: Optional[str] = None

class ScanLogCreate(ScanLogBase):
    pass

class ScanLogResponse(ScanLogBase):
    id: int
    profileId: int
    timestamp: datetime
    
    class Config:
        from_attributes = True