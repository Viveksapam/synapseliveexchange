from pydantic import BaseModel
from typing import Optional, List
from datetime import date, datetime

class BlogCommentBase(BaseModel):
    strAuthor: Optional[str] = "Anonymous"
    strContent: str
    parent_comment_id: Optional[int] = None

class BlogCommentCreate(BlogCommentBase):
    pass

class CommentAnalysisBase(BaseModel):
    sentiment: Optional[str] = None
    relevance_score: Optional[float] = 0.5
    ai_summary: Optional[str] = None

class CommentAnalysisCreate(CommentAnalysisBase):
    pass

class CommentAnalysisResponse(CommentAnalysisBase):
    comment_id: int

    class Config:
        orm_mode = True

class BlogCommentResponse(BlogCommentBase):
    id: int
    blog_id: int
    datePosted: datetime

    class Config:
        orm_mode = True

class BlogContextBase(BaseModel):
    strTitle: str
    strDescription: Optional[str] = None

class BlogContextCreate(BlogContextBase):
    pass

class BlogSourceBase(BaseModel):
    strTitle: str
    strUrl: str
    strDescription: Optional[str] = None
    strAuthor: Optional[str] = None

class BlogSourceCreate(BlogSourceBase):
    pass

class BlogSourceResponse(BlogSourceBase):
    id: int
    context_id: int
    review_status: str = "pending"
    dtCreatedAt: datetime

    class Config:
        orm_mode = True

class BlogContextResponse(BlogContextBase):
    id: int
    blog_id: int
    dtCreatedAt: datetime
    sources: List[BlogSourceResponse] = []

    class Config:
        orm_mode = True

class BlogAuditCollectionResponse(BaseModel):
    id: int
    blog_id: int
    comment_ids: Optional[str] = None
    source_ids: Optional[str] = None
    context_ids: Optional[str] = None
    collected_data: Optional[str] = None
    llm_response: Optional[str] = None
    status: str
    error_message: Optional[str] = None
    collected_at: datetime
    processed_at: Optional[datetime] = None

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
