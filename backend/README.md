# Prompt War Backend (FastAPI)

Backend integration placeholder. Implement these modules when connecting to PostgreSQL.

## Planned Structure

```
backend/
├── app/
│   ├── main.py                 # FastAPI app entry
│   ├── config.py               # Settings and env vars
│   ├── database.py             # SQLAlchemy engine and session
│   ├── models/                 # SQLAlchemy models
│   │   ├── user.py
│   │   ├── challenge.py
│   │   ├── resource.py
│   │   ├── submission.py
│   │   └── leaderboard.py
│   ├── schemas/                # Pydantic schemas
│   ├── routers/                # API route handlers
│   │   ├── auth.py             # POST /auth/login, /register, /me
│   │   ├── resources.py        # GET /resources
│   │   ├── challenge.py        # GET /challenge/active, /timer
│   │   ├── submissions.py      # POST /submissions
│   │   ├── leaderboard.py      # GET /leaderboard
│   │   └── admin.py            # Admin CRUD + uploads
│   ├── services/               # Business logic
│   │   ├── auth_service.py     # JWT creation/validation
│   │   ├── evaluation_service.py  # OpenAI API scoring
│   │   └── upload_service.py   # File storage
│   └── dependencies.py         # Auth dependencies, role checks
├── alembic/                    # Database migrations
├── requirements.txt
└── .env.example
```

## API Endpoints (Frontend Contract)

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v1/auth/login` | JWT login |
| POST | `/api/v1/auth/register` | Participant registration |
| GET | `/api/v1/auth/me` | Current user profile |
| GET | `/api/v1/challenge/timer` | Preparation/submission timers |
| GET | `/api/v1/challenge/active` | Active challenge details |
| GET | `/api/v1/resources` | List study materials |
| POST | `/api/v1/submissions` | Submit prompt |
| GET | `/api/v1/leaderboard` | Rankings |
| GET | `/api/v1/admin/stats` | Admin dashboard stats |
| POST | `/api/v1/admin/challenges` | Create challenge (multipart) |
| POST | `/api/v1/admin/resources` | Upload resource (multipart) |

## Role Protection

Admin routes must return `403 Forbidden` for non-admin users. The frontend Axios interceptor redirects participants to `/dashboard`.

## Tech Stack

- FastAPI, PostgreSQL, SQLAlchemy, JWT, OpenAI API
