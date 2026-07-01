from sqlalchemy import Column, Integer, String, Text, DateTime, Date, ForeignKey, Float, BigInteger
from sqlalchemy.orm import relationship
from database import Base
import datetime
from models.user_models import UserModel

class CommunityModel(Base):
    __tablename__ = "blog_communitymodel"

    id = Column(Integer, primary_key=True, index=True)
    strName = Column(String(255), nullable=False)
    strDescription = Column(Text, nullable=True)

class BlogModel(Base):
    __tablename__ = "blog_blogmodel"

    id = Column(Integer, primary_key=True, index=True)
    author_id = Column(BigInteger, ForeignKey("user_usermodel.id", ondelete="SET NULL"), nullable=True)
    community_id = Column(Integer, ForeignKey("blog_communitymodel.id", ondelete="SET NULL"), nullable=True)
    strTitle = Column(String(255))
    strSummary = Column(Text)
    strContent = Column(Text)
    strThemeColor = Column(String(50), default="#4f46e5")
    datePublished = Column(Date, default=datetime.date.today)
    strMediaUrl = Column(String(500), nullable=True)
    numUpvotes = Column(Integer, default=0)
    comments_count = Column(Integer, default=0)

    author = relationship("UserModel")
    community = relationship("CommunityModel")
    comments = relationship("BlogCommentModel", back_populates="blog")
    ai_analysis = relationship("BlogAIAnalysisModel", back_populates="blog", uselist=False)
    @property
    def strAuthorUsername(self):
        return self.author.username if self.author else 'System'

    @property
    def objCommunity(self):
        return self.community_id

    @property
    def strCommunityName(self):
        return self.community.strName if self.community else 'General'

    @property
    def verifiable(self):
        return self.ai_analysis.verifiable if self.ai_analysis else 'yes'

    @property
    def logical_soundness(self):
        return self.ai_analysis.logical_soundness if self.ai_analysis else 0.99

    @property
    def ai_summary(self):
        return self.ai_analysis.ai_summary if self.ai_analysis else None

class BlogAIAnalysisModel(Base):
    __tablename__ = "blog_blogaianalysismodel"

    blog_id = Column(Integer, ForeignKey("blog_blogmodel.id", ondelete="CASCADE"), primary_key=True)
    verifiable = Column(String(50), default='yes')
    logical_soundness = Column(Float, default=0.99)
    ai_summary = Column(Text, nullable=True)

    blog = relationship("BlogModel", back_populates="ai_analysis")

class BlogCommentModel(Base):
    __tablename__ = "blog_blogcommentmodel"

    id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey("blog_blogmodel.id", ondelete="CASCADE"))
    parent_comment_id = Column(Integer, ForeignKey("blog_blogcommentmodel.id", ondelete="CASCADE"), nullable=True, index=True)
    strAuthor = Column(String(255), default="Anonymous")
    strContent = Column(Text)
    datePosted = Column(DateTime, default=datetime.datetime.utcnow)

    blog = relationship("BlogModel", back_populates="comments")
    analysis = relationship("CommentAnalysisModel", back_populates="comment", uselist=False)

class CommentAnalysisModel(Base):
    __tablename__ = "blog_commentanalysismodel"

    comment_id = Column(Integer, ForeignKey("blog_blogcommentmodel.id", ondelete="CASCADE"), primary_key=True)
    sentiment = Column(String(50), nullable=True)
    relevance_score = Column(Float, default=0.5)
    ai_summary = Column(Text, nullable=True)

    comment = relationship("BlogCommentModel", back_populates="analysis")

class FeaturedBlogModel(Base):
    __tablename__ = "blog_featuredblogmodel"

    blog_id = Column(Integer, ForeignKey("blog_blogmodel.id", ondelete="CASCADE"), primary_key=True)
    blog = relationship("BlogModel")

class PostReactionModel(Base):
    __tablename__ = "blog_postreactionmodel"

    id = Column(Integer, primary_key=True, index=True)
    post_id = Column(Integer, ForeignKey("blog_blogmodel.id", ondelete="CASCADE"), index=True)
    user_id = Column(BigInteger, ForeignKey("user_usermodel.id", ondelete="CASCADE"), index=True)
    emoji = Column(String(50), index=True)

    post = relationship("BlogModel")

class BlogContextModel(Base):
    __tablename__ = "blog_blogcontextmodel"

    id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey("blog_blogmodel.id", ondelete="CASCADE"), index=True)
    strTitle = Column(String(255))
    strDescription = Column(Text, nullable=True)
    dtCreatedAt = Column(DateTime, default=datetime.datetime.utcnow)

    blog = relationship("BlogModel")
    sources = relationship("BlogSourceModel", back_populates="context")

class BlogSourceModel(Base):
    __tablename__ = "blog_blogsourcemodel"

    id = Column(Integer, primary_key=True, index=True)
    context_id = Column(Integer, ForeignKey("blog_blogcontextmodel.id", ondelete="CASCADE"), index=True)
    strTitle = Column(String(255))
    strUrl = Column(String(500))
    strDescription = Column(Text, nullable=True)
    strAuthor = Column(String(255), nullable=True)
    review_status = Column(String(20), default='pending', nullable=False)
    dtCreatedAt = Column(DateTime, default=datetime.datetime.utcnow)

    context = relationship("BlogContextModel", back_populates="sources")

class RecentContributionModel(Base):
    __tablename__ = "blog_recentcontributionmodel"

    id = Column(Integer, primary_key=True, index=True)
    featured_blog_id = Column(Integer, ForeignKey("blog_featuredblogmodel.blog_id", ondelete="CASCADE"), index=True)
    position = Column(Integer, unique=True)  # 1, 2, 3 for top 3
    added_at = Column(DateTime, default=datetime.datetime.utcnow)
    added_by_id = Column(BigInteger, ForeignKey("user_usermodel.id", ondelete="SET NULL"), nullable=True)

    featured_blog = relationship("FeaturedBlogModel")

class BlogAuditCollectionModel(Base):
    __tablename__ = "blog_auditcollectionmodel"

    id = Column(Integer, primary_key=True, index=True)
    blog_id = Column(Integer, ForeignKey("blog_blogmodel.id", ondelete="CASCADE"), index=True)

    comment_ids = Column(Text)
    source_ids = Column(Text)
    context_ids = Column(Text)

    collected_data = Column(Text)
    llm_response = Column(Text, nullable=True)

    status = Column(String(50), default="pending")
    error_message = Column(Text, nullable=True)
    collected_at = Column(DateTime, default=datetime.datetime.utcnow)
    processed_at = Column(DateTime, nullable=True)

    blog = relationship("BlogModel")
