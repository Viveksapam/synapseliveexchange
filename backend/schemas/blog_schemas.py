from pydantic import BaseModel
from typing import Optional
from datetime import date, datetime

class BlogCommentBase(BaseModel):
    strAuthor: Optional[str] = "Anonymous"
    strContent: str

class BlogCommentCreate(BlogCommentBase):
    pass

class BlogCommentResponse(BlogCommentBase):
    id: int
    blog_id: int
    datePosted: datetime

    class Config:
        orm_mode = True

class BlogResponse(BaseModel):
    id: int
    strTitle: str
    strSummary: str
    strContent: str
    strThemeColor: str
    datePublished: date
    strMediaUrl: Optional[str] = None
    strAuthorUsername: Optional[str] = 'System'
    objCommunity: Optional[int] = 1
    strCommunityName: Optional[str] = 'General'
    numUpvotes: Optional[int] = 0
    comments_count: Optional[int] = 0
    verifiable: Optional[str] = 'yes'
    logical_soundness: Optional[float] = 0.99
    ai_summary: Optional[str] = None
    boolIsFeatured: Optional[bool] = False
    
    # Not including comments here directly to keep payload small, as they fetch it via /comments endpoint

    class Config:
        orm_mode = True
