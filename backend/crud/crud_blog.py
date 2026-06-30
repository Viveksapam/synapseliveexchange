from sqlalchemy.orm import Session
from models.blog_models import BlogModel, BlogCommentModel
from schemas.blog_schemas import BlogCommentCreate

from sqlalchemy.orm import Session, joinedload
import json
import datetime

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

def update_blog_comment(db: Session, comment_id: int, author: str = None, content: str = None):
    comment = db.query(BlogCommentModel).filter(BlogCommentModel.id == comment_id).first()
    if comment:
        if author:
            comment.strAuthor = author
        if content:
            comment.strContent = content
        db.commit()
        db.refresh(comment)
        return comment
    return None

def delete_blog_comment(db: Session, comment_id: int):
    comment = db.query(BlogCommentModel).filter(BlogCommentModel.id == comment_id).first()
    if comment:
        db.delete(comment)
        db.commit()
        return True
    return False

def get_comment_replies(db: Session, comment_id: int, skip: int = 0, limit: int = 100):
    return db.query(BlogCommentModel).filter(BlogCommentModel.parent_comment_id == comment_id).offset(skip).limit(limit).all()

def create_comment_reply(db: Session, blog_id: int, parent_comment_id: int, author: str, content: str):
    reply = BlogCommentModel(blog_id=blog_id, parent_comment_id=parent_comment_id, strAuthor=author, strContent=content)
    db.add(reply)
    db.commit()
    db.refresh(reply)
    return reply

def get_comment_analysis(db: Session, comment_id: int):
    from models.blog_models import CommentAnalysisModel
    return db.query(CommentAnalysisModel).filter(CommentAnalysisModel.comment_id == comment_id).first()

def create_or_update_comment_analysis(db: Session, comment_id: int, sentiment: str = None, relevance_score: float = None, ai_summary: str = None):
    from models.blog_models import CommentAnalysisModel
    analysis = db.query(CommentAnalysisModel).filter(CommentAnalysisModel.comment_id == comment_id).first()
    if analysis:
        if sentiment:
            analysis.sentiment = sentiment
        if relevance_score is not None:
            analysis.relevance_score = relevance_score
        if ai_summary:
            analysis.ai_summary = ai_summary
    else:
        analysis = CommentAnalysisModel(comment_id=comment_id, sentiment=sentiment, relevance_score=relevance_score or 0.5, ai_summary=ai_summary)
        db.add(analysis)
    db.commit()
    db.refresh(analysis)
    return analysis

def delete_comment_analysis(db: Session, comment_id: int):
    from models.blog_models import CommentAnalysisModel
    analysis = db.query(CommentAnalysisModel).filter(CommentAnalysisModel.comment_id == comment_id).first()
    if analysis:
        db.delete(analysis)
        db.commit()
        return True
    return False

def create_audit_collection(db: Session, blog_id: int):
    from models.blog_models import BlogAuditCollectionModel

    blog = get_blog_by_id(db, blog_id)
    if not blog:
        return None

    comments = get_blog_comments(db, blog_id, skip=0, limit=1000)
    contexts = get_blog_contexts(db, blog_id)

    source_ids = []
    for context in contexts:
        sources = get_context_sources(db, context.id)
        source_ids.extend([s.id for s in sources])

    collected_data = {
        "blog": {
            "id": blog.id,
            "strTitle": blog.strTitle,
            "strSummary": blog.strSummary,
            "strContent": blog.strContent,
            "strThemeColor": blog.strThemeColor,
            "datePublished": str(blog.datePublished),
            "numUpvotes": blog.numUpvotes,
            "strAuthorUsername": blog.strAuthorUsername,
            "strCommunityName": blog.strCommunityName
        },
        "contexts": [
            {
                "id": c.id,
                "strTitle": c.strTitle,
                "strDescription": c.strDescription,
                "dtCreatedAt": str(c.dtCreatedAt)
            }
            for c in contexts
        ],
        "sources": [
            {
                "id": s.id,
                "context_id": s.context_id,
                "strTitle": s.strTitle,
                "strUrl": s.strUrl,
                "strAuthor": s.strAuthor,
                "dtCreatedAt": str(s.dtCreatedAt)
            }
            for context in contexts
            for s in get_context_sources(db, context.id)
        ],
        "comments": [
            {
                "id": c.id,
                "blog_id": c.blog_id,
                "parent_comment_id": c.parent_comment_id,
                "strAuthor": c.strAuthor,
                "strContent": c.strContent,
                "datePosted": str(c.datePosted)
            }
            for c in comments
        ]
    }

    comment_ids = [c.id for c in comments]

    collection = BlogAuditCollectionModel(
        blog_id=blog_id,
        collected_data=json.dumps(collected_data),
        comment_ids=json.dumps(comment_ids),
        source_ids=json.dumps(source_ids),
        context_ids=json.dumps([c.id for c in contexts]),
        status="pending"
    )
    db.add(collection)
    db.commit()
    db.refresh(collection)
    return collection

def get_audit_collection(db: Session, collection_id: int):
    from models.blog_models import BlogAuditCollectionModel
    return db.query(BlogAuditCollectionModel).filter(BlogAuditCollectionModel.id == collection_id).first()

def update_audit_collection_response(db: Session, collection_id: int, llm_response: dict):
    from models.blog_models import BlogAuditCollectionModel
    collection = db.query(BlogAuditCollectionModel).filter(BlogAuditCollectionModel.id == collection_id).first()
    if collection:
        collection.llm_response = json.dumps(llm_response)
        collection.status = "processed"
        collection.processed_at = datetime.datetime.utcnow()
        db.commit()
        db.refresh(collection)
        return collection
    return None

def get_blog_audit_collections(db: Session, blog_id: int):
    from models.blog_models import BlogAuditCollectionModel
    return db.query(BlogAuditCollectionModel).filter(BlogAuditCollectionModel.blog_id == blog_id).all()

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
        db.delete(existing)
        db.commit()
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

def get_blog_contexts(db: Session, blog_id: int):
    from models.blog_models import BlogContextModel
    return db.query(BlogContextModel).filter(BlogContextModel.blog_id == blog_id).all()

def create_blog_context(db: Session, blog_id: int, title: str, description: str = None):
    from models.blog_models import BlogContextModel
    context = BlogContextModel(blog_id=blog_id, strTitle=title, strDescription=description)
    db.add(context)
    db.commit()
    db.refresh(context)
    return context

def update_blog_context(db: Session, context_id: int, title: str = None, description: str = None):
    from models.blog_models import BlogContextModel
    context = db.query(BlogContextModel).filter(BlogContextModel.id == context_id).first()
    if context:
        if title:
            context.strTitle = title
        if description is not None:
            context.strDescription = description
        db.commit()
        db.refresh(context)
        return context
    return None

def delete_blog_context(db: Session, context_id: int):
    from models.blog_models import BlogContextModel
    context = db.query(BlogContextModel).filter(BlogContextModel.id == context_id).first()
    if context:
        db.delete(context)
        db.commit()
        return True
    return False

def get_context_sources(db: Session, context_id: int):
    from models.blog_models import BlogSourceModel
    return db.query(BlogSourceModel).filter(BlogSourceModel.context_id == context_id).all()

def create_source_in_context(db: Session, context_id: int, title: str, url: str, author: str = None):
    from models.blog_models import BlogSourceModel
    source = BlogSourceModel(context_id=context_id, strTitle=title, strUrl=url, strAuthor=author)
    db.add(source)
    db.commit()
    db.refresh(source)
    return source

def update_blog_source(db: Session, source_id: int, title: str = None, url: str = None, author: str = None):
    from models.blog_models import BlogSourceModel
    source = db.query(BlogSourceModel).filter(BlogSourceModel.id == source_id).first()
    if source:
        if title:
            source.strTitle = title
        if url:
            source.strUrl = url
        if author is not None:
            source.strAuthor = author
        db.commit()
        db.refresh(source)
        return source
    return None

def delete_blog_source(db: Session, source_id: int):
    from models.blog_models import BlogSourceModel
    source = db.query(BlogSourceModel).filter(BlogSourceModel.id == source_id).first()
    if source:
        db.delete(source)
        db.commit()
        return True
    return False
