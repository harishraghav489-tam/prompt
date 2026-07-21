from __future__ import annotations

from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, UploadFile, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.submission import Submission
from app.routers.auth import get_current_user
from app.routers.challenge import challenges_store
from app.routers.resources import resources_store
from app.schemas.auth import UserOut
from app.schemas.competition import AdminStatsOut, ChallengeOut

router = APIRouter(prefix="/admin", tags=["admin"])


def require_admin(current_user: UserOut = Depends(get_current_user)) -> UserOut:
    if current_user.role != "admin":
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user


@router.get("/stats", response_model=AdminStatsOut)
def get_stats(current_user: UserOut = Depends(require_admin), db: Session = Depends(get_db)) -> AdminStatsOut:
    total_users = db.query(User).count()
    total_subs = db.query(Submission).count()
    evaluated_subs = db.query(Submission).filter(Submission.status == "evaluated").count()
    pending_subs = total_subs - evaluated_subs
    return AdminStatsOut(
        totalParticipants=total_users,
        totalSubmissions=total_subs,
        evaluated=evaluated_subs,
        pending=pending_subs,
    )


@router.get("/submissions/recent", response_model=list[dict[str, object]])
def get_recent_submissions(current_user: UserOut = Depends(require_admin), db: Session = Depends(get_db)) -> list[dict[str, object]]:
    # Get all submissions sorted by submitted_at desc
    subs = db.query(Submission).all()
    # Sort in memory since submitted_at is string and can be null
    sorted_subs = sorted(subs, key=lambda s: str(s.submitted_at or ""), reverse=True)[:8]
    
    recent = []
    for s in sorted_subs:
        user = db.query(User).filter(User.id == s.user_id).first()
        recent.append({
            "id": s.id,
            "name": user.name if user else "Participant",
            "college": user.college if user else "College",
            "submittedAt": s.submitted_at or "2026-07-20T00:00:00Z",
            "status": s.status,
            "score": s.score,
        })
    return recent


@router.get("/submissions", response_model=list[dict[str, object]])
def get_submissions(current_user: UserOut = Depends(require_admin), db: Session = Depends(get_db)) -> list[dict[str, object]]:
    return get_recent_submissions(current_user, db)


@router.get("/participants", response_model=list[dict[str, object]])
def get_participants(current_user: UserOut = Depends(require_admin), db: Session = Depends(get_db)) -> list[dict[str, object]]:
    users = db.query(User).all()
    participants = []
    for user in users:
        participants.append({
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "college": user.college,
            "department": user.department,
            "registeredAt": "2026-01-01T00:00:00Z",
        })
    return participants


@router.post("/challenges", response_model=ChallengeOut)
def create_challenge(
    title: str = Form(...),
    difficulty: str = Form(...),
    problemStatement: str = Form(...),
    image: UploadFile = File(...),
    preparationTimerMinutes: int = Form(15),
    submissionTimerMinutes: int = Form(60),
    current_user: UserOut = Depends(require_admin),
) -> ChallengeOut:
    challenge = {
        "id": f"challenge-{uuid4().hex[:8]}",
        "title": title,
        "difficulty": difficulty,
        "problemStatement": problemStatement,
        "imageUrl": f"/uploads/{image.filename or 'challenge.png'}",
        "submissionSecondsRemaining": submissionTimerMinutes * 60,
    }
    challenges_store.append(challenge)
    return ChallengeOut(**challenge)


@router.post("/resources")
def upload_resource(
    title: str = Form(...),
    file: UploadFile = File(...),
    current_user: UserOut = Depends(require_admin),
) -> dict[str, object]:
    resource = {
        "id": f"resource-{uuid4().hex[:8]}",
        "title": title,
        "type": file.content_type or "markdown",
        "url": f"/uploads/{file.filename or 'resource.txt'}",
        "uploadedAt": "2026-07-20T00:00:00Z",
    }
    resources_store.append(resource)
    return resource
