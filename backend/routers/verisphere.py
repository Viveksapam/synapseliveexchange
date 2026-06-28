from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from crud import crud_blog, crud_portfolio
from schemas.blog_schemas import BlogResponse, BlogCommentResponse, BlogCommentCreate
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
