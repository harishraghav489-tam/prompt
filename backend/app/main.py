from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.models.submission import Submission  # noqa: F401
from app.routers.admin import router as admin_router
from app.routers.auth import router as auth_router
from app.routers.challenge import router as challenge_router
from app.routers.leaderboard import router as leaderboard_router
from app.routers.resources import router as resources_router
from app.routers.submissions import router as submissions_router

app = FastAPI(title=settings.PROJECT_NAME, version="1.0.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router, prefix=settings.API_V1_PREFIX)
app.include_router(challenge_router, prefix=settings.API_V1_PREFIX)
app.include_router(submissions_router, prefix=settings.API_V1_PREFIX)
app.include_router(leaderboard_router, prefix=settings.API_V1_PREFIX)
app.include_router(resources_router, prefix=settings.API_V1_PREFIX)
app.include_router(admin_router, prefix=settings.API_V1_PREFIX)


from app.models.user import User, AdminEmail  # noqa: F401
import bcrypt


@app.on_event("startup")
def startup() -> None:
    Base.metadata.create_all(bind=engine)
    
    # Seed default admin emails and default admin user
    from app.core.database import SessionLocal
    db = SessionLocal()
    try:
        # Seed Admin Emails table
        admin_emails = ["admin@promptbench.dev", "harishraghavendram.al25@bitsathy.ac.in"]
        for email in admin_emails:
            existing_email = db.query(AdminEmail).filter(AdminEmail.email == email).first()
            if not existing_email:
                db.add(AdminEmail(email=email))
        db.commit()

        # Seed default admin user in users table
        admin_user = db.query(User).filter(User.email == "admin@promptbench.dev").first()
        if not admin_user:
            password_hash = bcrypt.hashpw("promptbench123".encode("utf-8"), bcrypt.gensalt()).decode("utf-8")
            db.add(User(
                id="admin-1",
                email="admin@promptbench.dev",
                name="PromptBench Admin",
                college="PromptBench",
                department="Platform",
                role="admin",
                password_hash=password_hash
            ))
            db.commit()
    except Exception as e:
        print(f"Error during database seeding: {e}")
    finally:
        db.close()


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok"}
