# Lok Setu – Let's fix the city together
Civic issue reporting: citizen app + admin panel + Node/Express API.

## Quick preview (no install)
Open `frontend/index.html` in any browser. Data stays in that browser (localStorage). Admin password: `admin123`.

## Full stack (shared data for everyone)
```
cd backend && cp .env.example .env    # set ADMIN_PASSWORD
npm install && npm start              # http://localhost:3000
```
Or Docker: `docker compose up --build`.
The page auto-detects the API; the "🟢 Connected to live server" toast confirms it.

## Deploy so anyone can open the link
Push this folder to GitHub and deploy on Render / Railway / Fly.io (start command `npm start` in `backend`, set `ADMIN_PASSWORD`). Persist `backend/data`, or swap the JSON file for MongoDB/Postgres.

## API
GET /api/reports · POST /api/reports · POST /api/reports/:id/vote · POST /api/login · PATCH|DELETE /api/reports/:id (admin token header `x-admin-token`)
