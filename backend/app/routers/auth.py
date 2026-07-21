from __future__ import annotations

from datetime import datetime, timedelta, timezone
from typing import Annotated
from uuid import uuid4

import bcrypt
import jwt
from pydantic import EmailStr
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.core.config import settings
from app.schemas.auth import LoginRequest, RegisterRequest, TokenResponse, UserOut

router = APIRouter(prefix="/auth", tags=["auth"])
security = HTTPBearer(auto_error=False)


from sqlalchemy.orm import Session
from app.core.database import get_db
from app.models.user import User, AdminEmail


class DemoStore:
    # Retain for backward compatibility in case other modules import it
    users: dict[str, dict[str, object]] = {}


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def seed_demo_users() -> None:
    pass


seed_demo_users()


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.now(tz=timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES),
    }
    return jwt.encode(payload, settings.SECRET_KEY, algorithm=settings.ALGORITHM)


def validate_college_email(email: EmailStr | str) -> None:
    email_str = str(email).lower()
    allowed_domains = ["@bitsathy.ac.in", "@bitsathy.ac.in", "@promptbench.dev"]
    if not any(email_str.endswith(domain) for domain in allowed_domains):
        raise HTTPException(status_code=400, detail="Only college emails ending with @bitsathy.ac.in are allowed")


def get_current_user(credentials: Annotated[HTTPAuthorizationCredentials | None, Depends(security)], db: Session = Depends(get_db)) -> UserOut:
    if not credentials:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Missing token")

    try:
        payload = jwt.decode(credentials.credentials, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
    except jwt.PyJWTError as exc:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token") from exc

    user_id = str(payload.get("sub"))
    db_user = db.query(User).filter(User.id == user_id).first()
    if not db_user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

    return UserOut(
        id=db_user.id,
        email=db_user.email,
        name=db_user.name,
        college=db_user.college,
        department=db_user.department,
        role=db_user.role,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    validate_college_email(payload.email)
    db_user = db.query(User).filter(User.email.ilike(payload.email)).first()
    if not db_user:
        raise HTTPException(status_code=401, detail="Invalid credentials")

    if payload.password is None or not verify_password(str(payload.password), str(db_user.password_hash)):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    user_out = UserOut(
        id=db_user.id,
        email=db_user.email,
        name=db_user.name,
        college=db_user.college,
        department=db_user.department,
        role=db_user.role,
    )
    token = create_token(str(db_user.id))
    return TokenResponse(access_token=token, user=user_out)


@router.post("/register", response_model=TokenResponse)
def register(payload: RegisterRequest, db: Session = Depends(get_db)) -> TokenResponse:
    validate_college_email(payload.email)
    existing_user = db.query(User).filter(User.email.ilike(payload.email)).first()
    if existing_user:
        raise HTTPException(status_code=409, detail="Email already registered")

    # Determine if user is admin based on admin_emails table
    is_admin = db.query(AdminEmail).filter(AdminEmail.email.ilike(payload.email)).first() is not None
    role = "admin" if is_admin else "participant"

    user_id = f"user-{uuid4().hex[:8]}"
    db_user = User(
        id=user_id,
        email=payload.email,
        name=payload.name,
        college=payload.college,
        department=payload.department,
        role=role,
        password_hash=hash_password(payload.password),
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    user_out = UserOut(
        id=db_user.id,
        email=db_user.email,
        name=db_user.name,
        college=db_user.college,
        department=db_user.department,
        role=db_user.role,
    )
    token = create_token(user_id)
    return TokenResponse(access_token=token, user=user_out)


@router.get("/me", response_model=UserOut)
def me(current_user: Annotated[UserOut, Depends(get_current_user)]) -> UserOut:
    return current_user


@router.post("/logout")
def logout() -> dict[str, str]:
    return {"message": "Logged out"}
