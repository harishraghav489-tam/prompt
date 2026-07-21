from pydantic import BaseModel


class TimerResponse(BaseModel):
    preparationSecondsRemaining: int
    submissionSecondsRemaining: int
    challengeUnlocked: bool


class ChallengeOut(BaseModel):
    id: str
    title: str
    difficulty: str
    problemStatement: str
    imageUrl: str
    submissionSecondsRemaining: int


class SubmissionCreate(BaseModel):
    challengeId: str
    prompt: str


class SubmissionOut(BaseModel):
    id: str
    challengeId: str
    prompt: str
    submittedAt: str
    status: str
    score: float | None = None


class LeaderboardEntryOut(BaseModel):
    rank: int
    name: str
    college: str
    department: str
    score: float
    isCurrentUser: bool | None = None


class AdminStatsOut(BaseModel):
    totalParticipants: int
    totalSubmissions: int
    evaluated: int
    pending: int
