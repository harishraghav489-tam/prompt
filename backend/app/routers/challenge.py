from __future__ import annotations

from fastapi import APIRouter

from app.schemas.competition import ChallengeOut, TimerResponse

router = APIRouter(prefix="/challenge", tags=["challenge"])

challenges_store: list[dict[str, object]] = [
    {
        "id": "challenge-1",
        "title": "PromptBench Challenge",
        "difficulty": "MEDIUM",
        "problemStatement": "Design a prompt that instructs an LLM to generate a concise deployment checklist for a production FastAPI service.",
        "imageUrl": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
        "submissionSecondsRemaining": 7200,
    }
]


@router.get("/timer", response_model=TimerResponse)
def get_timer() -> TimerResponse:
    return TimerResponse(
        preparationSecondsRemaining=0,
        submissionSecondsRemaining=7200,
        challengeUnlocked=True,
    )


@router.get("/active", response_model=ChallengeOut)
def get_active_challenge() -> ChallengeOut:
    challenge = challenges_store[-1]
    return ChallengeOut(
        id=str(challenge["id"]),
        title=str(challenge["title"]),
        difficulty=str(challenge["difficulty"]),
        problemStatement=str(challenge["problemStatement"]),
        imageUrl=str(challenge["imageUrl"]),
        submissionSecondsRemaining=int(challenge["submissionSecondsRemaining"]),
    )
