import bcrypt
import datetime
import jwt
from uuid import uuid4

from django.conf import settings as django_settings
from rest_framework import status
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.response import Response

from api.models import User, AdminEmail, Submission
from app.services.prompt_validator import PromptValidator
from app.services.prompt_analyzer import PromptAnalyzer
from app.services.scoring_engine import ScoringEngine

# In-memory stores for challenges and resources to match FastAPI implementation
challenges_store = [
    {
        "id": "challenge-1",
        "title": "PromptBench Challenge",
        "difficulty": "MEDIUM",
        "problemStatement": "Design a prompt that instructs an LLM to generate a concise deployment checklist for a production FastAPI service.",
        "imageUrl": "https://images.unsplash.com/photo-1516321497487-e288fb19713f?auto=format&fit=crop&w=900&q=80",
        "submissionSecondsRemaining": 7200,
    }
]

resources_store = [
    {
        "id": "resource-1",
        "title": "Prompt Engineering Handbook",
        "type": "markdown",
        "url": "/resources/prompt-engineering-handbook.md",
        "uploadedAt": "2026-07-20T00:00:00Z",
    }
]


def create_token(user_id: str) -> str:
    payload = {
        "sub": user_id,
        "exp": datetime.datetime.now(datetime.timezone.utc) + datetime.timedelta(minutes=60),
    }
    return jwt.encode(payload, django_settings.SECRET_KEY, algorithm='HS256')


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(password: str, hashed: str) -> bool:
    return bcrypt.checkpw(password.encode("utf-8"), hashed.encode("utf-8"))


def validate_college_email(email: str) -> bool:
    email_str = email.lower()
    if email_str == "admin@promptbench.dev":
        return True
    return email_str.endswith("@bitsathy.ac.in")


def serialize_user(user: User) -> dict:
    return {
        "id": user.id,
        "email": user.email,
        "name": user.name,
        "college": user.college,
        "department": user.department,
        "role": user.role,
    }


# Auth Endpoints

@api_view(["POST"])
@permission_classes([AllowAny])
def register(request):
    email = request.data.get("email")
    password = request.data.get("password")
    name = request.data.get("name")
    college = request.data.get("college")
    department = request.data.get("department")

    if not email or not password or not name or not college or not department:
        return Response({"detail": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

    if not validate_college_email(email):
        return Response({"detail": "Only college emails ending with @bitsathy.ac.in are allowed"}, status=status.HTTP_400_BAD_REQUEST)

    if User.objects.filter(email__iexact=email).exists():
        return Response({"detail": "Email already registered"}, status=status.HTTP_409_CONFLICT)

    is_admin = AdminEmail.objects.filter(email__iexact=email).exists()
    role = "admin" if is_admin else "participant"

    user_id = f"user-{uuid4().hex[:8]}"
    password_hash = hash_password(password)

    user = User.objects.create(
        id=user_id,
        email=email,
        name=name,
        college=college,
        department=department,
        role=role,
        password_hash=password_hash,
    )

    token = create_token(user_id)
    return Response({
        "access_token": token,
        "user": serialize_user(user)
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([AllowAny])
def login(request):
    email = request.data.get("email")
    password = request.data.get("password")

    if not email or not password:
        return Response({"detail": "Missing email or password"}, status=status.HTTP_400_BAD_REQUEST)

    if not validate_college_email(email):
        return Response({"detail": "Only college emails ending with @bitsathy.ac.in are allowed"}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = User.objects.get(email__iexact=email)
    except User.DoesNotExist:
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    if not verify_password(password, user.password_hash):
        return Response({"detail": "Invalid credentials"}, status=status.HTTP_401_UNAUTHORIZED)

    token = create_token(user.id)
    return Response({
        "access_token": token,
        "user": serialize_user(user)
    }, status=status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def me(request):
    return Response(serialize_user(request.user))


@api_view(["POST"])
@permission_classes([AllowAny])
def logout(request):
    return Response({"message": "Logged out"})


# Challenge Endpoints

@api_view(["GET"])
@permission_classes([AllowAny])
def challenge_timer(request):
    return Response({
        "preparationSecondsRemaining": 0,
        "submissionSecondsRemaining": 7200,
        "challengeUnlocked": True,
    })


@api_view(["GET"])
@permission_classes([AllowAny])
def active_challenge(request):
    if not challenges_store:
        return Response({"detail": "No active challenge"}, status=status.HTTP_404_NOT_FOUND)
    challenge = challenges_store[-1]
    return Response({
        "id": challenge["id"],
        "title": challenge["title"],
        "difficulty": challenge["difficulty"],
        "problemStatement": challenge["problemStatement"],
        "imageUrl": challenge["imageUrl"],
        "submissionSecondsRemaining": challenge["submissionSecondsRemaining"],
    })


# Resource Endpoints

@api_view(["GET"])
@permission_classes([AllowAny])
def list_resources(request):
    return Response(resources_store)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_resource(request, resource_id):
    resource = next((item for item in resources_store if item["id"] == resource_id), None)
    if not resource:
        return Response({"detail": "Resource not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response(resource)


# Submission Endpoints

@api_view(["POST", "GET"])
@permission_classes([IsAuthenticated])
def submissions_handler(request):
    if request.method == "POST":
        prompt = request.data.get("prompt")
        challenge_id = request.data.get("challengeId")

        if not prompt or not challenge_id:
            return Response({"detail": "Missing fields"}, status=status.HTTP_400_BAD_REQUEST)

        validation_result = PromptValidator.validate(prompt)
        if not validation_result["valid"]:
            return Response({
                "message": "Prompt validation failed",
                "issues": validation_result["issues"]
            }, status=status.HTTP_422_UNPROCESSABLE_ENTITY)

        score_result = ScoringEngine.score(prompt)
        
        total_subs = Submission.objects.count()
        submission_id = f"submission-{total_subs + 1}"
        submitted_at_str = datetime.datetime.now(datetime.timezone.utc).isoformat()

        submission = Submission.objects.create(
            id=submission_id,
            challenge_id=challenge_id,
            prompt=prompt,
            user_id=request.user.id,
            status="evaluated",
            score=round(score_result["overall_score"], 2),
            submitted_at=submitted_at_str,
        )

        return Response({
            "id": submission.id,
            "challengeId": submission.challenge_id,
            "prompt": submission.prompt,
            "submittedAt": submission.submitted_at,
            "status": submission.status,
            "score": submission.score,
        }, status=status.HTTP_200_OK)

    elif request.method == "GET":
        # Note: Frontend GET list my submissions
        subs = Submission.objects.filter(user_id=request.user.id)
        return Response([
            {
                "id": s.id,
                "challengeId": s.challenge_id,
                "prompt": s.prompt,
                "submittedAt": s.submitted_at or "2026-07-20T00:00:00Z",
                "status": s.status,
                "score": s.score,
            }
            for s in subs
        ])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def list_my_submissions(request):
    subs = Submission.objects.filter(user_id=request.user.id)
    return Response([
        {
            "id": s.id,
            "challengeId": s.challenge_id,
            "prompt": s.prompt,
            "submittedAt": s.submitted_at or "2026-07-20T00:00:00Z",
            "status": s.status,
            "score": s.score,
        }
        for s in subs
    ])


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_submission(request, submission_id):
    try:
        s = Submission.objects.get(id=submission_id)
    except Submission.DoesNotExist:
        return Response({"detail": "Submission not found"}, status=status.HTTP_404_NOT_FOUND)
    return Response({
        "id": s.id,
        "challengeId": s.challenge_id,
        "prompt": s.prompt,
        "submittedAt": s.submitted_at or "2026-07-20T00:00:00Z",
        "status": s.status,
        "score": s.score,
    })


# Leaderboard Endpoint

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def get_leaderboard(request):
    submissions = Submission.objects.all().order_by("-score")
    
    rows = []
    seen_users = set()
    rank = 1
    
    for s in submissions:
        if s.user_id in seen_users:
            continue
        seen_users.add(s.user_id)
        
        try:
            user = User.objects.get(id=s.user_id)
        except User.DoesNotExist:
            continue
            
        rows.append({
            "rank": rank,
            "name": user.name,
            "college": user.college,
            "department": user.department,
            "score": s.score or 0.0,
            "isCurrentUser": user.id == request.user.id,
        })
        rank += 1
        
    return Response(rows)


# Admin Helper

def require_admin(request):
    if not request.user.is_authenticated or request.user.role != "admin":
        return False
    return True


# Admin Endpoints

@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_stats(request):
    if not require_admin(request):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
    total_users = User.objects.count()
    total_subs = Submission.objects.count()
    evaluated_subs = Submission.objects.filter(status="evaluated").count()
    pending_subs = total_subs - evaluated_subs
    
    return Response({
        "totalParticipants": total_users,
        "totalSubmissions": total_subs,
        "evaluated": evaluated_subs,
        "pending": pending_subs,
    })


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_submissions_recent(request):
    if not require_admin(request):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
    subs = Submission.objects.all()
    # Sort in memory by submitted_at desc
    sorted_subs = sorted(subs, key=lambda s: str(s.submitted_at or ""), reverse=True)[:8]
    
    recent = []
    for s in sorted_subs:
        try:
            user = User.objects.get(id=s.user_id)
        except User.DoesNotExist:
            user = None
            
        recent.append({
            "id": s.id,
            "name": user.name if user else "Participant",
            "college": user.college if user else "College",
            "submittedAt": s.submitted_at or "2026-07-20T00:00:00Z",
            "status": s.status,
            "score": s.score,
        })
    return Response(recent)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_submissions(request):
    return admin_submissions_recent(request)


@api_view(["GET"])
@permission_classes([IsAuthenticated])
def admin_participants(request):
    if not require_admin(request):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
    users = User.objects.all()
    participants = []
    for u in users:
        participants.append({
            "id": u.id,
            "name": u.name,
            "email": u.email,
            "college": u.college,
            "department": u.department,
            "registeredAt": "2026-01-01T00:00:00Z",
        })
    return Response(participants)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_challenges(request):
    if not require_admin(request):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
    title = request.data.get("title")
    difficulty = request.data.get("difficulty")
    problem_statement = request.data.get("problemStatement")
    submission_timer_minutes = int(request.data.get("submissionTimerMinutes", 60))
    
    # Files are in request.FILES if multipart
    image_file = request.FILES.get("image")
    image_name = image_file.name if image_file else "challenge.png"
    
    challenge = {
        "id": f"challenge-{uuid4().hex[:8]}",
        "title": title,
        "difficulty": difficulty,
        "problemStatement": problem_statement,
        "imageUrl": f"/uploads/{image_name}",
        "submissionSecondsRemaining": submission_timer_minutes * 60,
    }
    challenges_store.append(challenge)
    return Response(challenge, status=status.HTTP_200_OK)


@api_view(["POST"])
@permission_classes([IsAuthenticated])
def admin_resources(request):
    if not require_admin(request):
        return Response({"detail": "Admin access required"}, status=status.HTTP_403_FORBIDDEN)
        
    title = request.data.get("title")
    resource_file = request.FILES.get("file")
    content_type = resource_file.content_type if resource_file else "markdown"
    file_name = resource_file.name if resource_file else "resource.txt"
    
    resource = {
        "id": f"resource-{uuid4().hex[:8]}",
        "title": title,
        "type": content_type,
        "url": f"/uploads/{file_name}",
        "uploadedAt": "2026-07-20T00:00:00Z",
    }
    resources_store.append(resource)
    return Response(resource, status=status.HTTP_200_OK)
