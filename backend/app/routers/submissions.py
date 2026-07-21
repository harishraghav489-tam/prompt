from __future__ import annotations

from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.core.database import Base, SessionLocal, engine, get_db
from app.models.submission import Submission
from app.routers.auth import DemoStore, get_current_user
from app.schemas.auth import UserOut
from app.schemas.competition import SubmissionCreate, SubmissionOut
from app.services.prompt_analyzer import PromptAnalyzer
from app.services.scoring_engine import ScoringEngine
from app.services.prompt_validator import PromptValidator

router = APIRouter(prefix="/submissions", tags=["submissions"])

submissions_store: list[dict[str, object]] = []


@router.post("", response_model=SubmissionOut)
def submit_submission(payload: SubmissionCreate, current_user: UserOut = Depends(get_current_user), db: Session = Depends(get_db)) -> SubmissionOut:
    validation_result = PromptValidator.validate(payload.prompt)
    if not validation_result["valid"]:
        raise HTTPException(status_code=422, detail={"message": "Prompt validation failed", "issues": validation_result["issues"]})

    metrics = PromptAnalyzer.analyze(payload.prompt)
    score_result = ScoringEngine.score(payload.prompt)
    
    # We can query count of submissions to generate id
    total_subs = db.query(Submission).count()
    submission_id = f"submission-{total_subs + 1}"
    submitted_at_str = datetime.now(timezone.utc).isoformat()

    db_submission = Submission(
        id=submission_id,
        challenge_id=payload.challengeId,
        prompt=payload.prompt,
        user_id=str(current_user.id),
        status="evaluated",
        score=round(score_result["overall_score"], 2),
        submitted_at=submitted_at_str,
    )
    db.add(db_submission)
    db.commit()
    db.refresh(db_submission)

    return SubmissionOut(
        id=db_submission.id,
        challengeId=db_submission.challenge_id,
        prompt=db_submission.prompt,
        submittedAt=db_submission.submitted_at,
        status=db_submission.status,
        score=db_submission.score,
    )


@router.get("/me", response_model=list[SubmissionOut])
def list_my_submissions(current_user: UserOut = Depends(get_current_user), db: Session = Depends(get_db)) -> list[SubmissionOut]:
    db_submissions = db.query(Submission).filter(Submission.user_id == current_user.id).all()
    return [
        SubmissionOut(
            id=s.id,
            challengeId=s.challenge_id,
            prompt=s.prompt,
            submittedAt=s.submitted_at or "2026-07-20T00:00:00Z",
            status=s.status,
            score=s.score,
        )
        for s in db_submissions
    ]


@router.get("/{submission_id}", response_model=SubmissionOut)
def get_submission(submission_id: str, db: Session = Depends(get_db)) -> SubmissionOut:
    s = db.query(Submission).filter(Submission.id == submission_id).first()
    if not s:
        raise HTTPException(status_code=404, detail="Submission not found")
    return SubmissionOut(
        id=s.id,
        challengeId=s.challenge_id,
        prompt=s.prompt,
        submittedAt=s.submitted_at or "2026-07-20T00:00:00Z",
        status=s.status,
        score=s.score,
    )
