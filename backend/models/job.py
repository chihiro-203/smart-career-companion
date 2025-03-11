from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Text, Boolean, DECIMAL, ARRAY
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base

class JobCategory(Base):
    __tablename__ = "job_category"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), unique=True)
    skills = Column(ARRAY(String))
    created_at = Column(TIMESTAMP, server_default=func.now())
    updated_at = Column(TIMESTAMP, server_default=func.now(), onupdate=func.now())

    jobs = relationship("Job", back_populates="category", cascade="all, delete")

class Job(Base):
    __tablename__ = "job"

    id = Column(Integer, primary_key=True, index=True)
    job_category_id = Column(Integer, ForeignKey("job_category.id", ondelete="SET NULL"), nullable=True)
    requirements = Column(Text, nullable=True)
    allowance = Column(DECIMAL(10,2), nullable=True)
    level = Column(String(50), nullable=True)
    competitive = Column(Boolean, default=False)
    link = Column(Text, nullable=True)

    category = relationship("JobCategory", back_populates="jobs")
    skills = relationship("JobSkill", back_populates="job", cascade="all, delete")

class JobSkill(Base):
    __tablename__ = "job_skill"

    id = Column(Integer, primary_key=True, index=True)
    job_id = Column(Integer, ForeignKey("job.id", ondelete="CASCADE"), nullable=False)
    skill = Column(String(255), nullable=False)

    job = relationship("Job", back_populates="skills")
