from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=False)
    phone = Column(String)
    address = Column(String)
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    user_skills = relationship("UserSkill", back_populates="user", cascade="all, delete")
    resumes = relationship("Resume", back_populates="user", cascade="all, delete")
    mock_tests = relationship("MockTest", back_populates="user", cascade="all, delete")


class UserSkill(Base):
    __tablename__ = "user_skill"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    skill = Column(String, nullable=False)

    user = relationship("User", back_populates="user_skills")
