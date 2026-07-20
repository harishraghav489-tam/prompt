# PromptBench

A production-ready prompt engineering hackathon platform with a Next.js frontend and a FastAPI backend.

## What is included

- Participant auth, dashboard, challenge submission, resources, and leaderboard
- Admin auth, stats, participant/submission views, challenge creation, and resource uploads
- Rule-based prompt analyzer and scoring engine with no AI API dependency
- Docker deployment scaffolding for frontend, backend, and PostgreSQL

## Run locally

### Backend

```bash
cd backend
python -m pip install -r requirements.txt
python -m uvicorn app.main:app --app-dir . --host 127.0.0.1 --port 8000
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

### Demo credentials

- Admin: admin@promptbench.dev / promptbench123

### API base URL

The frontend expects:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api/v1
```

### Google auth

To enable Google sign-in, add Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

Then configure the OAuth redirect URL in Supabase:

- http://localhost:3000/auth/callback
- https://your-domain.vercel.app/auth/callback

## Docker

```bash
docker compose up --build
```
