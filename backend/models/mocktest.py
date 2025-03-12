from sqlalchemy import Column, Integer, String, TIMESTAMP, ForeignKey, Text, Enum
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from core.database import Base
import enum

class DifficultyEnum(str, enum.Enum):
    EASY = "EASY"
    MEDIUM = "MEDIUM"
    HARD = "HARD"

class MockTest(Base):
    __tablename__ = "mock_tests"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id", ondelete="CASCADE"), nullable=False)
    title = Column(String(250), nullable=False)
    description = Column(Text, nullable=True)
    difficult_level = Column(Enum(DifficultyEnum), nullable=False)
    create_dt = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User", back_populates="mock_tests")
    conversations = relationship("MockTestConversation", back_populates="mock_test", cascade="all, delete")

class MockTestConversation(Base):
    __tablename__ = "mock_test_conversations"

    id = Column(Integer, primary_key=True, index=True)
    mock_test_id = Column(Integer, ForeignKey("mock_tests.id", ondelete="CASCADE"), nullable=False)
    question = Column(Text, nullable=False)
    user_answer = Column(Text, nullable=False)
    ai_review = Column(Text, nullable=True)
    created_at = Column(TIMESTAMP, server_default=func.now())

    mock_test = relationship("MockTest", back_populates="conversations")
