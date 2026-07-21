from __future__ import annotations

from sqlalchemy import Column, Float, String, Text

from app.core.database import Base


class Submission(Base):
    __tablename__ = "submissions"

    id = Column(String, primary_key=True, index=True)
    challenge_id = Column(String, nullable=False)
    prompt = Column(Text, nullable=False)
    user_id = Column(String, nullable=False)
    status = Column(String, default="evaluated")
    score = Column(Float, nullable=True)
    submitted_at = Column(String, nullable=True)
