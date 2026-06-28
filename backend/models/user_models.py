from sqlalchemy import Column, Integer, String, Text, Boolean, DateTime, BigInteger
from database import Base
import datetime

class UserModel(Base):
    __tablename__ = "user_usermodel"

    id = Column(BigInteger, primary_key=True, index=True)
    password = Column(String)
    last_login = Column(DateTime(timezone=True), nullable=True)
    is_superuser = Column(Boolean, default=False)
    username = Column(String, unique=True, index=True)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    email = Column(String, unique=True, index=True)
    is_staff = Column(Boolean, default=False)
    is_active = Column(Boolean, default=True)
    date_joined = Column(DateTime(timezone=True), default=datetime.datetime.utcnow)
    
    strBio = Column(Text, nullable=True)
    strProfilePicUrl = Column(Text, nullable=True)
    strVerificationCode = Column(String, nullable=True)
