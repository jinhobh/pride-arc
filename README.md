# PrideArc

An RPG-gamified learning tracker that turns a 6-month backend engineering study plan into a quest. Complete tasks, earn XP, level up 10 individual skills, and watch your character grow — all wrapped in a Studio Ghibli-inspired pixel-art interface.

## Quick Start

### Prerequisites

- [Docker Desktop](https://www.docker.com/products/docker-desktop/) (includes Docker Compose)
  - Windows/Mac: install Docker Desktop and make sure it's running
  - Linux: install [Docker Engine](https://docs.docker.com/engine/install/) + [Docker Compose](https://docs.docker.com/compose/install/)
- [Git](https://git-scm.com/downloads)

### Setup (3 steps)

```bash
# 1. Clone the repo
git clone https://github.com/jinhobh/pride-arc.git
cd pride-arc

# 2. Create your environment file (default values work out of the box)
cp .env.example .env

# 3. Build and run everything
docker-compose up --build
```

That's it. Wait for the build to finish, then open **http://localhost:5173** in your browser.

> First build takes 1-2 minutes to download images and install dependencies. Subsequent runs are much faster.

### What's Running

| Service  | URL                         | Description |
|----------|-----------------------------|-------------|
| Frontend | http://localhost:5173       | React app   |
| Backend  | http://localhost:8000       | FastAPI server |
| API Docs | http://localhost:8000/docs  | Interactive Swagger UI |
| Database | localhost:5432              | PostgreSQL (not exposed to browser) |

### Stopping & Resetting

```bash
# Stop the app
docker-compose down

# Stop and wipe all data (fresh start)
docker-compose down -v
docker-compose up --build
```

## Tech Stack

| Layer     | Technology                                |
|-----------|-------------------------------------------|
| Frontend  | React 18 + Vite 5 + Tailwind CSS 3       |
| Backend   | FastAPI 0.115 + SQLAlchemy 2 (async)      |
| Database  | PostgreSQL 16 (asyncpg driver)            |
| Orchestration | Docker Compose (3 services)           |

## Project Structure

```
pride-arc/
├── docker-compose.yml
├── .env.example
│
├── backend/
│   ├── main.py              # FastAPI app, lifespan seeding, all routes
│   ├── models.py            # 10+ SQLAlchemy ORM models
│   ├── schemas.py           # Pydantic request/response models
│   ├── database.py          # Async engine & session factory
│   ├── crud.py              # All async DB operations
│   ├── plan_data.py         # 91 tasks, 36 checkpoints, 5 habits, XP thresholds
│   ├── requirements.txt
│   └── Dockerfile
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx          # Router setup
│   │   ├── pages/
│   │   │   ├── Dashboard.jsx    # Main hub
│   │   │   ├── MonthPage.jsx    # Month detail view
│   │   │   ├── PlanPage.jsx     # 6-month roadmap + Studio editor
│   │   │   └── StatsPage.jsx    # Progress analytics
│   │   ├── components/
│   │   │   ├── HeaderBar.jsx        # Streak, XP, check-in button
│   │   │   ├── BottomNav.jsx        # Tab navigation
│   │   │   ├── CharacterHero.jsx    # Animated character sprite
│   │   │   ├── StatPanel.jsx        # Skill stat cards grid
│   │   │   ├── WeeklyHabits.jsx     # Daily habit checklist
│   │   │   ├── QuestChapters.jsx    # Month scroll cards
│   │   │   ├── BossBanner.jsx       # Boss HP bar
│   │   │   ├── TaskSection.jsx      # Task list by frequency
│   │   │   ├── ActivityHeatmap.jsx  # 180-day heatmap
│   │   │   ├── WeeklySummary.jsx    # 7-day breakdown
│   │   │   ├── RecentActivity.jsx   # Activity feed
│   │   │   └── OnTrackMeter.jsx     # Pace tracker
│   │   ├── hooks/
│   │   │   └── useApi.js       # Data fetching & mutations
│   │   └── constants/
│   │       └── planData.js     # Skill metadata, thresholds, month info
│   ├── vite.config.js          # Proxy /api -> backend:8000
│   ├── tailwind.config.js
│   ├── package.json
│   └── Dockerfile
```

## Game Mechanics

### Skills (10 tracks)

| Skill | Icon | Start Level |
|-------|------|-------------|
| DSA | ⚔️ | 1 |
| ML/AI | 🧠 | 2 |
| Backend | 🔧 | 1 |
| DevOps | 🐳 | 1 |
| Cloud | ☁️ | 1 |
| System Design | 🏗️ | 1 |
| Project | 🚀 | 1 |
| Networking | 🤝 | 1 |
| Interviewing | 🎯 | 1 |
| Career | 💼 | 1 |

Each skill levels from 1 to 10. Thresholds: `0, 25, 75, 150, 250, 375, 525, 700, 900, 1150` cumulative XP.

### Character Level

A global level (1–25+) based on total XP across all skills. Titles progress from Wanderer through Apprentice, Builder, Architect, Expert, all the way up to Mythic.

### Tasks

- **Once** — One-time completions (e.g., "Complete Arrays & Strings section")
- **Daily** — Resets each day (e.g., "Solve 2 LeetCode Easy")
- **Weekly** — Resets each week (e.g., "Read 1 ML paper")

91 tasks across 6 months. Each awards XP to its associated skill and to global XP.

### Checkpoints

36 milestone missions (~6 per month). Completing **all** checkpoints in a month awards a chapter badge + bonus XP.

### Habits

5 recurring habits (meditation, LeetCode, reading, etc.) tracked daily with optional count fields. Unlockable at specific months.

### Streaks

Daily check-in increments your streak. Miss a day and it resets. The character sprite visually desaturates after missed days.

## The 6-Month Arc

| Month | Theme | Focus |
|-------|-------|-------|
| 1 | Foundations & Gaps | Backend + DSA fundamentals |
| 2 | DevOps & ML Sharpening | Docker, PyTorch, CI/CD |
| 3 | Cloud Deployment | AWS, HuggingFace, live deploy |
| 4 | System Design & Resume | Advanced algorithms, interview prep |
| 5 | Mock Interviews | Applications & practice |
| 6 | Polish & Peak | Final push before job search |

## API Routes

### Core
| Method | Path | Description |
|--------|------|-------------|
| GET | `/health` | Health check with DB status |
| GET | `/state` | Full user state (XP, level, streak, stats, badges) |
| POST | `/checkin` | Daily check-in (increments streak) |

### Tasks & Checkpoints
| Method | Path | Description |
|--------|------|-------------|
| POST | `/task/complete` | Complete a task (awards XP) |
| POST | `/task/uncomplete` | Undo a task completion |
| POST | `/checkpoint/complete` | Complete a checkpoint |
| GET | `/current-tasks` | Tasks for current month grouped by frequency |

### Habits
| Method | Path | Description |
|--------|------|-------------|
| POST | `/habit/log` | Log a habit (upsert) |
| GET | `/habits/{date}` | Habit status for a given date |

### Progress & Analytics
| Method | Path | Description |
|--------|------|-------------|
| GET | `/progress` | Total XP, level, per-month & per-skill breakdown |
| GET | `/activity?days=N` | Daily XP totals + dominant skill |
| GET | `/activity-feed?limit=N` | Recent completions feed |
| GET | `/activity-habits?days=N` | Habit completion heatmap data |
| GET | `/weekly-summary` | Last 7 days: XP, problems, skills |
| GET | `/streak-status` | Current/longest streak, days missed |
| GET | `/plan/pace` | On-track meter (expected vs earned XP) |

### Plan & Studio
| Method | Path | Description |
|--------|------|-------------|
| GET | `/plan/month/{n}` | Full month data (sections, tasks, checkpoints) |
| GET | `/plan/studio/{month}` | Editable plan data for Studio |
| POST/PATCH/DELETE | `/plan/task/{id}` | CRUD for tasks |
| POST/PATCH/DELETE | `/plan/checkpoint/{id}` | CRUD for checkpoints |
| POST/PATCH/DELETE | `/plan/habit/{id}` | CRUD for habits |

All routes are prefixed with `/api` from the frontend (Vite proxy).

## Design System

- **Theme:** Studio Ghibli pixel-art RPG — dark backgrounds with warm accents
- **Fonts:** Shippori Mincho (display), Inter (body), VT323 (stats/numbers)
- **Colors:** Deep night sky background, warm amber accents (lantern glow), sage green secondary, skill-specific Tailwind palette
- **Animations:** Character float, streak bounce, XP float-up, shimmer cards, particle effects, mist drift

## Environment Variables

The `.env.example` file has working defaults — you only need to change them if you want custom credentials.

| Variable | Default | Description |
|----------|---------|-------------|
| `POSTGRES_DB` | `pridearc` | Database name |
| `POSTGRES_USER` | `pridearc` | Database user |
| `POSTGRES_PASSWORD` | `changeme` | Database password |
| `DATABASE_URL` | `postgresql://pridearc:changeme@postgres:5432/pridearc` | Full connection string (must match the above) |

## Development Without Docker

If you prefer running things natively, you'll need **Python 3.11+**, **Node 20+**, and a **PostgreSQL** instance running locally.

**1. Database** — create a PostgreSQL database and update `.env` with your connection string (change `postgres` hostname to `localhost`).

**2. Backend:**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```

**3. Frontend:**
```bash
cd frontend
npm install
npm run dev
```

**4. Update the Vite proxy** — in `frontend/vite.config.js`, change the proxy target from `http://backend:8000` to `http://localhost:8000`.

Then open http://localhost:5173.

## Key Design Decisions

- **Single-user** — No authentication; assumes one player per deployment
- **Async-first** — All DB operations use asyncpg + SQLAlchemy async sessions
- **Badges are permanent** — Uncompleting a task never revokes earned badges
- **Streaks auto-reset** — Computed dynamically from `last_checkin_date`; no background jobs
- **Plan data in DB** — Seeded from `plan_data.py` but editable via Studio CRUD routes
