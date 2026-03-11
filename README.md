# PrideArc

Full-stack scaffold: React + Vite + Tailwind CSS · FastAPI · PostgreSQL

## One-command startup

```bash
docker-compose up --build
```

| Service  | URL                          |
|----------|------------------------------|
| Frontend | http://localhost:5173        |
| Backend  | http://localhost:8000        |
| Health   | http://localhost:8000/health |
| Docs     | http://localhost:8000/docs   |
| Postgres | localhost:5432               |

## Project structure

```
pride-arc/
├── frontend/          # React + Vite + Tailwind CSS
│   ├── src/
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css
│   ├── Dockerfile
│   ├── vite.config.js
│   └── package.json
├── backend/           # FastAPI (Python)
│   ├── main.py
│   ├── requirements.txt
│   └── Dockerfile
├── docker-compose.yml
├── .env               # DB credentials (gitignored)
├── .env.example       # Commit this, not .env
└── README.md
```

## Environment variables

Copy `.env.example` to `.env` and set your credentials:

```bash
cp .env.example .env
```

| Variable            | Description               |
|---------------------|---------------------------|
| `POSTGRES_DB`       | Database name             |
| `POSTGRES_USER`     | Database user             |
| `POSTGRES_PASSWORD` | Database password         |
| `DATABASE_URL`      | Full connection string    |

## Development (without Docker)

**Backend**
```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --reload
```

**Frontend**
```bash
cd frontend
npm install
npm run dev
```

> Note: When running locally, update the Vite proxy target in `vite.config.js` to `http://localhost:8000`.
