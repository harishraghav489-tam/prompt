from __future__ import annotations

from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.models.user import User
from app.models.submission import Submission
from app.schemas.auth import UserOut
from app.schemas.competition import LeaderboardEntryOut
from app.routers.auth import get_current_user

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])


@router.get("", response_model=list[LeaderboardEntryOut])
def get_leaderboard(current_user: UserOut = Depends(get_current_user), db: Session = Depends(get_db)) -> list[LeaderboardEntryOut]:
    # Query all submissions sorted by score desc
    submissions = db.query(Submission).order_by(Submission.score.desc()).all()
    
    rows: list[LeaderboardEntryOut] = []
    seen_users = set()
    rank = 1
    
    for submission in submissions:
        if submission.user_id in seen_users:
            continue  # only show user's highest score on the leaderboard
        seen_users.add(submission.user_id)
        
        user = db.query(User).filter(User.id == submission.user_id).first()
        if not user:
            continue
            
        rows.append(
            LeaderboardEntryOut(
                rank=rank,
                name=user.name,
                college=user.college,
                department=user.department,
                score=submission.score or 0.0,
                isCurrentUser=user.id == current_user.id,
            )
        )
        rank += 1
        
    return rows
