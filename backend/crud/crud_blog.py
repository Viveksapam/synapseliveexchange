from sqlalchemy.orm import Session
from models.blog_models import BlogModel, BlogCommentModel
from schemas.blog_schemas import BlogCommentCreate

from sqlalchemy.orm import Session, joinedload

def get_blogs(db: Session, skip: int = 0, limit: int = 100):
    return db.query(BlogModel)\
             .options(joinedload(BlogModel.author), joinedload(BlogModel.community), joinedload(BlogModel.ai_analysis))\
             .offset(skip).limit(limit).all()

def get_blog_by_id(db: Session, blog_id: int):
    return db.query(BlogModel).filter(BlogModel.id == blog_id).first()

def get_blog_comments(db: Session, blog_id: int, skip: int = 0, limit: int = 100):
    return db.query(BlogCommentModel).filter(BlogCommentModel.blog_id == blog_id).offset(skip).limit(limit).all()

def create_blog_comment(db: Session, blog_id: int, comment: BlogCommentCreate):
    new_comment = BlogCommentModel(blog_id=blog_id, **comment.dict())
    db.add(new_comment)
    db.commit()
    db.refresh(new_comment)
    return new_comment

def get_featured_blogs(db: Session, skip: int = 0, limit: int = 100):
    from models.blog_models import FeaturedBlogModel, BlogModel
    features = db.query(FeaturedBlogModel)\
                 .options(joinedload(FeaturedBlogModel.blog).joinedload(BlogModel.author),
                          joinedload(FeaturedBlogModel.blog).joinedload(BlogModel.community),
                          joinedload(FeaturedBlogModel.blog).joinedload(BlogModel.ai_analysis))\
                 .offset(skip).limit(limit).all()
    # return the actual BlogModel objects mapped from the FeaturedBlogModel relationship
    return [f.blog for f in features if f.blog]

def add_featured_blog(db: Session, blog_id: int):
    from models.blog_models import FeaturedBlogModel
    existing = db.query(FeaturedBlogModel).filter(FeaturedBlogModel.blog_id == blog_id).first()
    if not existing:
        new_feature = FeaturedBlogModel(blog_id=blog_id)
        db.add(new_feature)
        db.commit()
        db.refresh(new_feature)
        return new_feature
    return existing

def remove_featured_blog(db: Session, blog_id: int):
    from models.blog_models import FeaturedBlogModel
    existing = db.query(FeaturedBlogModel).filter(FeaturedBlogModel.blog_id == blog_id).first()
    if existing:
        db.delete(existing)
        db.commit()
        return True
    return False

def toggle_reaction(db: Session, blog_id: int, user_id: int, emoji: str):
    from models.blog_models import PostReactionModel
    existing = db.query(PostReactionModel).filter(
        PostReactionModel.post_id == blog_id,
        PostReactionModel.user_id == user_id,
        PostReactionModel.emoji == emoji
    ).first()
    
    if existing:
        try:
            db.delete(existing)
            db.commit()
        except Exception:
            db.rollback()
            from fastapi import HTTPException
            raise HTTPException(status_code=500, detail="Failed to remove reaction")
        return {"status": "removed"}
    else:
        count = db.query(PostReactionModel).filter(
            PostReactionModel.post_id == blog_id,
            PostReactionModel.user_id == user_id
        ).count()
        if count >= 3:
            return {"status": "error", "message": "Maximum 3 reactions allowed per post"}
        
        new_reaction = PostReactionModel(post_id=blog_id, user_id=user_id, emoji=emoji)
        db.add(new_reaction)
        db.commit()
        return {"status": "added"}

def get_post_reactions(db: Session, blog_id: int):
    from models.blog_models import PostReactionModel
    from sqlalchemy import func
    
    reactions = db.query(
        PostReactionModel.emoji, 
        func.count(PostReactionModel.id).label('count')
    ).filter(PostReactionModel.post_id == blog_id).group_by(PostReactionModel.emoji).all()
    
    return {r.emoji: r.count for r in reactions}

def get_user_reactions(db: Session, blog_id: int, user_id: int):
    from models.blog_models import PostReactionModel
    reactions = db.query(PostReactionModel.emoji).filter(
        PostReactionModel.post_id == blog_id,
        PostReactionModel.user_id == user_id
    ).all()
    return [r.emoji for r in reactions]
