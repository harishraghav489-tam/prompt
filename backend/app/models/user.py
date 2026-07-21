from __future__ import annotations

from sqlalchemy import Column, String

from app.core.database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(String, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    college = Column(String, nullable=False)
    department = Column(String, nullable=False)
    role = Column(String, nullable=False, default="participant")
    password_hash = Column(String, nullable=False)


class AdminEmail(Base):
    __tablename__ = "admin_emails"

    email = Column(String, primary_key=True, index=True)
