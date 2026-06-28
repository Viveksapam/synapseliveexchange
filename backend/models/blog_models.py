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
    strAuthor = Column(String(255), default="Anonymous")
    strContent = Column(Text)
    datePosted = Column(DateTime, default=datetime.datetime.utcnow)

    blog = relationship("BlogModel", back_populates="comments")

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
    # Using string for relationship to avoid circular imports if user_models isn't imported here
    user = relationship("UserModel", primaryjoin="PostReactionModel.user_id == foreign(UserModel.id)")
