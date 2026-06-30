from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from crud import crud_blog, crud_portfolio
from schemas.blog_schemas import BlogResponse, BlogCommentResponse, BlogCommentCreate, BlogSourceResponse, BlogSourceCreate, CommentAnalysisResponse, CommentAnalysisCreate, BlogContextResponse, BlogContextCreate, BlogAuditCollectionResponse
from pydantic import BaseModel as PydanticBaseModel

class RecentContributionPositionRequest(PydanticBaseModel):
    featured_blog_id: int
    position: int
from schemas.portfolio_schemas import VideoResponse

router = APIRouter(prefix="/api/verisphere", tags=["Verisphere"])

from core.deps import get_current_admin_user
from models.user_models import UserModel

@router.get("/blogs/featured/", response_model=List[BlogResponse])
def get_featured_blogs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_blog.get_featured_blogs(db, skip=skip, limit=limit)

@router.post("/blogs/featured/{blog_id}")
def add_featured_blog(blog_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
    crud_blog.add_featured_blog(db, blog_id)
    return {"message": "Blog featured successfully"}

@router.delete("/blogs/featured/{blog_id}")
def remove_featured_blog(blog_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
    crud_blog.remove_featured_blog(db, blog_id)
    return {"message": "Blog removed from featured list"}

@router.get("/blogs/", response_model=List[BlogResponse])
def get_blogs(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    blogs = crud_blog.get_blogs(db, skip=skip, limit=limit)
    featured_blogs = crud_blog.get_featured_blogs(db, skip=0, limit=1000)
    featured_ids = {b.id for b in featured_blogs}
    
    for blog in blogs:
        blog.boolIsFeatured = blog.id in featured_ids
        
    return blogs

@router.get("/blogs/{blog_id}/comments/", response_model=List[BlogCommentResponse])
def get_blog_comments(blog_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    blog = crud_blog.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return crud_blog.get_blog_comments(db, blog_id, skip=skip, limit=limit)

@router.post("/blogs/{blog_id}/comments/", response_model=BlogCommentResponse)
def post_blog_comment(blog_id: int, comment: BlogCommentCreate, db: Session = Depends(get_db)):
    blog = crud_blog.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return crud_blog.create_blog_comment(db, blog_id, comment)

@router.put("/blogs/{blog_id}/comments/{comment_id}", response_model=BlogCommentResponse)
def update_blog_comment(blog_id: int, comment_id: int, comment: BlogCommentCreate, db: Session = Depends(get_db)):
    updated = crud_blog.update_blog_comment(db, comment_id, comment.strAuthor, comment.strContent)
    if not updated:
        raise HTTPException(status_code=404, detail="Comment not found")
    return updated

@router.delete("/blogs/{blog_id}/comments/{comment_id}")
def delete_blog_comment(blog_id: int, comment_id: int, db: Session = Depends(get_db)):
    success = crud_blog.delete_blog_comment(db, comment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Comment not found")
    return {"message": "Comment deleted successfully"}

@router.get("/videos/", response_model=List[VideoResponse])
def get_videos(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return crud_portfolio.get_videos(db, skip=skip, limit=limit)

from pydantic import BaseModel
class ReactionRequest(BaseModel):
    emoji: str
    user_id: int

@router.post("/blogs/{blog_id}/react")
def toggle_reaction(blog_id: int, req: ReactionRequest, db: Session = Depends(get_db)):
    return crud_blog.toggle_reaction(db, blog_id, req.user_id, req.emoji)

@router.get("/blogs/{blog_id}/reactions")
def get_reactions(blog_id: int, user_id: int = 3, db: Session = Depends(get_db)):
    all_reactions = crud_blog.get_post_reactions(db, blog_id)
    user_reactions = crud_blog.get_user_reactions(db, blog_id, user_id)
    return {"reactions": all_reactions, "user_reacted": {emoji: True for emoji in user_reactions}}

@router.get("/blogs/{blog_id}/contexts/", response_model=List[BlogContextResponse])
def get_contexts(blog_id: int, db: Session = Depends(get_db)):
    blog = crud_blog.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return crud_blog.get_blog_contexts(db, blog_id)

@router.post("/blogs/{blog_id}/contexts/", response_model=BlogContextResponse)
def add_context(blog_id: int, context: BlogContextCreate, db: Session = Depends(get_db)):
    blog = crud_blog.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return crud_blog.create_blog_context(db, blog_id, context.strTitle, context.strDescription)

@router.put("/blogs/{blog_id}/contexts/{context_id}", response_model=BlogContextResponse)
def update_context(blog_id: int, context_id: int, context: BlogContextCreate, db: Session = Depends(get_db)):
    updated = crud_blog.update_blog_context(db, context_id, context.strTitle, context.strDescription)
    if not updated:
        raise HTTPException(status_code=404, detail="Context not found")
    return updated

@router.delete("/blogs/{blog_id}/contexts/{context_id}")
def delete_context(blog_id: int, context_id: int, db: Session = Depends(get_db)):
    success = crud_blog.delete_blog_context(db, context_id)
    if not success:
        raise HTTPException(status_code=404, detail="Context not found")
    return {"message": "Context deleted successfully"}

@router.get("/contexts/{context_id}/sources/", response_model=List[BlogSourceResponse])
def get_sources(context_id: int, db: Session = Depends(get_db)):
    return crud_blog.get_context_sources(db, context_id)

@router.post("/contexts/{context_id}/sources/", response_model=BlogSourceResponse)
def add_source(context_id: int, source: BlogSourceCreate, db: Session = Depends(get_db)):
    return crud_blog.create_source_in_context(db, context_id, source.strTitle, source.strUrl, source.strAuthor)

@router.put("/sources/{source_id}", response_model=BlogSourceResponse)
def update_source(source_id: int, source: BlogSourceCreate, db: Session = Depends(get_db)):
    updated = crud_blog.update_blog_source(db, source_id, source.strTitle, source.strUrl, source.strAuthor)
    if not updated:
        raise HTTPException(status_code=404, detail="Source not found")
    return updated

@router.delete("/sources/{source_id}")
def delete_source(source_id: int, db: Session = Depends(get_db)):
    success = crud_blog.delete_blog_source(db, source_id)
    if not success:
        raise HTTPException(status_code=404, detail="Source not found")
    return {"message": "Source deleted successfully"}

@router.get("/recent-contributions/")
def get_recent_contributions(db: Session = Depends(get_db)):
    contributions = crud_blog.get_recent_contributions(db)
    return [{"id": c.id, "blog_id": c.featured_blog_id, "position": c.position, "added_at": c.added_at} for c in contributions]

@router.post("/recent-contributions/")
def add_recent_contribution(req: RecentContributionPositionRequest, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
    contribution = crud_blog.add_to_recent_contributions(db, req.featured_blog_id, req.position, current_user.id)
    return {"id": contribution.id, "blog_id": contribution.featured_blog_id, "position": contribution.position}

@router.put("/recent-contributions/{contribution_id}/position/")
def update_contribution_position(contribution_id: int, position: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
    updated = crud_blog.update_contribution_position(db, contribution_id, position)
    if not updated:
        raise HTTPException(status_code=404, detail="Contribution not found")
    return {"id": updated.id, "blog_id": updated.featured_blog_id, "position": updated.position}

@router.delete("/recent-contributions/{contribution_id}/")
def delete_recent_contribution(contribution_id: int, db: Session = Depends(get_db), current_user: UserModel = Depends(get_current_admin_user)):
    success = crud_blog.remove_from_recent_contributions(db, contribution_id)
    if not success:
        raise HTTPException(status_code=404, detail="Contribution not found")
    return {"message": "Contribution removed successfully"}

@router.post("/blogs/{blog_id}/audit/collect/", response_model=BlogAuditCollectionResponse)
def collect_audit_data(blog_id: int, db: Session = Depends(get_db)):
    blog = crud_blog.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    collection = crud_blog.create_audit_collection(db, blog_id)
    if not collection:
        raise HTTPException(status_code=400, detail="Failed to create collection")
    return collection

@router.get("/audit/collections/{collection_id}/", response_model=BlogAuditCollectionResponse)
def get_audit_collection(collection_id: int, db: Session = Depends(get_db)):
    collection = crud_blog.get_audit_collection(db, collection_id)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return collection

@router.get("/blogs/{blog_id}/audit/collections/", response_model=List[BlogAuditCollectionResponse])
def get_blog_audit_collections(blog_id: int, db: Session = Depends(get_db)):
    blog = crud_blog.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return crud_blog.get_blog_audit_collections(db, blog_id)

@router.post("/audit/collections/{collection_id}/llm-response/")
def set_llm_response(collection_id: int, llm_response: dict, db: Session = Depends(get_db)):
    collection = crud_blog.update_audit_collection_response(db, collection_id, llm_response)
    if not collection:
        raise HTTPException(status_code=404, detail="Collection not found")
    return {"message": "LLM response stored", "status": collection.status}

@router.get("/blogs/{blog_id}/comments/{comment_id}/replies/", response_model=List[BlogCommentResponse])
def get_replies(blog_id: int, comment_id: int, skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    comment = crud_blog.get_blog_by_id(db, blog_id)
    if not comment:
        raise HTTPException(status_code=404, detail="Blog not found")
    return crud_blog.get_comment_replies(db, comment_id, skip=skip, limit=limit)

@router.post("/blogs/{blog_id}/comments/{comment_id}/replies/", response_model=BlogCommentResponse)
def add_reply(blog_id: int, comment_id: int, reply: BlogCommentCreate, db: Session = Depends(get_db)):
    blog = crud_blog.get_blog_by_id(db, blog_id)
    if not blog:
        raise HTTPException(status_code=404, detail="Blog not found")
    return crud_blog.create_comment_reply(db, blog_id, comment_id, reply.strAuthor or "Anonymous", reply.strContent)

@router.get("/comments/{comment_id}/analysis/", response_model=CommentAnalysisResponse)
def get_comment_analysis(comment_id: int, db: Session = Depends(get_db)):
    analysis = crud_blog.get_comment_analysis(db, comment_id)
    if not analysis:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return analysis

@router.post("/comments/{comment_id}/analysis/", response_model=CommentAnalysisResponse)
def create_comment_analysis(comment_id: int, analysis: CommentAnalysisCreate, db: Session = Depends(get_db)):
    return crud_blog.create_or_update_comment_analysis(db, comment_id, analysis.sentiment, analysis.relevance_score, analysis.ai_summary)

@router.delete("/comments/{comment_id}/analysis/")
def delete_comment_analysis(comment_id: int, db: Session = Depends(get_db)):
    success = crud_blog.delete_comment_analysis(db, comment_id)
    if not success:
        raise HTTPException(status_code=404, detail="Analysis not found")
    return {"message": "Analysis deleted successfully"}
