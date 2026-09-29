# LOK SETU

**Report issues. Track progress. Build a better community.**

LOK SETU ("people's bridge") is a civic issue-reporting web app. Citizens can
report problems like broken streetlights, potholes, water and sewage
issues, or electricity faults — with or without creating an account — and
track their status. Every report can optionally be shown on a public feed
so the whole neighbourhood can see what's been raised and what's been fixed.

This repository is a complete full-stack project:

| Layer      | Tech |
|------------|------|
| Frontend   | Vanilla HTML / CSS / JavaScript (no build step, no framework) |
| Backend    | Node.js + Express (REST API) |
| Database   | SQLite (file-based, via `better-sqlite3`) |
| Auth       | JWT for registered users, an anonymous "guest id" for guest reporting |
| Uploads    | Local disk storage via Multer (report photos) |
| Deployment | Docker / Docker Compose, plus notes for Render, Railway and a plain VM |

The Express server serves **both** the API (`/api/*`) and the static
frontend files from a single port, so there's exactly one process to run
and one place to deploy.

---

## 1. Project structure

```
lok-setu/
├── backend/
│   ├── config/db.js            # SQLite connection + schema bootstrap
│   ├── controllers/            # Route handler logic
│   ├── middleware/              # auth (JWT/guest), upload (multer)
│   ├── routes/                 # /api/auth, /api/reports
│   ├── database/schema.sql     # Table definitions
│   ├── uploads/                # Uploaded report photos (created at runtime)
│   ├── server.js               # App entry point
│   ├── package.json
│   ├── .env.example
│   └── Dockerfile
├── frontend/
│   ├── index.html              # Landing page
│   ├── login.html              # Login / register
│   ├── user.html               # Dashboard (sidebar + "Your Impact")
│   ├── report.html             # Select category + submit a complaint
│   ├── public-reports.html     # All public reports, filterable by status
│   ├── admin.html              # Admin console (update report status)
│   ├── css/style.css
│   └── js/                     # config.js, api.js, helpers.js, page scripts
├── docker-compose.yml
└── README.md   ← you are here
```

---

## 2. Running it locally (no Docker)

Requirements: **Node.js 18+**

```bash
cd backend
cp .env.example .env      # then edit JWT_SECRET / ADMIN_KEY
npm install
npm start
```

Open **http://localhost:3000** — that's it. The frontend, API, and a fresh
SQLite database (`backend/database/loksetu.db`) are all served from that
one address. The database file and its tables are created automatically
on first boot.

For auto-restart during development:

```bash
npm run dev   # uses nodemon
```

---

## 3. Running it with Docker

Requirements: **Docker** and **Docker Compose**

```bash
cp backend/.env.example .env    # docker-compose reads JWT_SECRET/ADMIN_KEY from here
# edit .env and set real values for JWT_SECRET and ADMIN_KEY

docker compose up --build
```

Open **http://localhost:3000**. The SQLite database and uploaded photos
are persisted on the host under `./data/` (see `docker-compose.yml`), so
`docker compose down` / rebuilding the image does not lose data.

To run it as a single plain container without Compose:

```bash
docker build -f backend/Dockerfile -t lok-setu .
docker run -p 3000:3000 \
  -e JWT_SECRET=your_long_random_secret \
  -e ADMIN_KEY=your_admin_key \
  -v $(pwd)/data/database:/app/backend/database \
  -v $(pwd)/data/uploads:/app/backend/uploads \
  lok-setu
```

---

## 4. Deploying

### Option A — Render / Railway / Fly.io (single service)

These platforms build directly from a Dockerfile, which keeps the
frontend + backend + database together as one deployable unit:

1. Push this repo to GitHub.
2. Create a new **Web Service** (Render) or **Project** (Railway) and
   point it at the repo, using `backend/Dockerfile` as the Dockerfile path
   (build context = repo root).
3. Set environment variables in the platform's dashboard:
   `JWT_SECRET`, `ADMIN_KEY`, `CORS_ORIGIN` (usually `*` or your domain).
4. Attach a **persistent volume/disk** mounted at `/app/backend/database`
   and `/app/backend/uploads` — otherwise the SQLite file and uploaded
   photos are wiped on every redeploy. (Render: "Disks". Railway: "Volumes".)
5. Expose port `3000`.

> SQLite is great for a small/medium civic app on a single instance. If you
> outgrow one instance (need multiple replicas), swap `better-sqlite3` for
> a hosted Postgres/MySQL database — the SQL in `database/schema.sql` and
> `config/db.js` is intentionally small and easy to port.

### Option B — Any VM / VPS

```bash
git clone <your-repo-url>
cd lok-setu
docker compose up --build -d
```

Put a reverse proxy (Nginx, Caddy) in front of port 3000 for HTTPS/TLS.

### Option C — Split hosting (static frontend + separate API host)

If you'd rather host the frontend on a static host (Netlify, Vercel,
GitHub Pages) and the backend elsewhere:

1. Deploy `backend/` alone (Docker or `node server.js`) to your API host.
2. Deploy the contents of `frontend/` to your static host.
3. Edit `frontend/js/config.js` and set
   `window.API_BASE = 'https://your-api-host.example/api';`
4. Set `CORS_ORIGIN` on the backend to your static host's URL.

---

## 5. Environment variables (`backend/.env`)

| Variable         | Description                                              | Example |
|------------------|-----------------------------------------------------------|---------|
| `PORT`           | Port the server listens on                                 | `3000` |
| `JWT_SECRET`     | Secret used to sign login tokens — **make this long & random** | `a9f...` |
| `JWT_EXPIRES_IN` | How long a login session lasts                              | `7d` |
| `ADMIN_KEY`      | Shared key required to use the admin console / status API  | `super-secret-key` |
| `DB_PATH`        | Path to the SQLite file                                     | `./database/loksetu.db` |
| `CORS_ORIGIN`    | Allowed origin(s) for the API, comma-separated, or `*`      | `*` |

---

## 6. How reporting works (guest vs. registered)

- On first visit, the frontend generates a random **guest id** (stored in
  `localStorage`) and sends it as an `x-guest-id` header. This is enough
  to submit reports and see "Your Impact" / "Your Recent Issues" without
  ever creating an account — matching the "Guest User" experience in the
  UI.
- Registering (`login.html`) exchanges name/email/password for a JWT,
  stored in `localStorage` and sent as `Authorization: Bearer <token>`.
  Reports made afterwards are tied to the account instead of the guest id,
  so they follow you across devices.

## 7. API reference

Base URL: `/api`

| Method | Path                     | Auth              | Description |
|--------|--------------------------|-------------------|-------------|
| POST   | `/auth/register`         | –                 | Create an account: `{ name, email, password }` |
| POST   | `/auth/login`            | –                 | Log in: `{ email, password }` |
| GET    | `/auth/me`               | Bearer token      | Current user |
| GET    | `/reports/categories`    | –                 | List of report categories (icon + label) |
| POST   | `/reports`               | Bearer token or `x-guest-id` | Create a report. `multipart/form-data`: `category, title, description, location, isPublic, image` |
| GET    | `/reports/mine`          | Bearer token or `x-guest-id` | Your reports + your stats |
| GET    | `/reports/public`        | –                 | All public reports. Query: `?category=`, `?status=` |
| GET    | `/reports/:id`           | optional          | A single report (private ones require ownership) |
| GET    | `/reports/all`           | `x-admin-key` header | Every report, public or private (admin console) |
| PATCH  | `/reports/:id/status`    | `x-admin-key` header | Update status: `{ status: "pending" \| "in_progress" \| "resolved" }` |

## 8. Admin console

Open **`/admin.html`**, enter the `ADMIN_KEY` you set in `.env`, and you'll
see every report (public and private) with a dropdown to move it between
Pending → In progress → Resolved.

---

## 9. Notes & next steps

- Photos are stored on local disk under `backend/uploads/`. For a
  multi-instance deployment, point this at S3-compatible object storage
  instead.
- There's no email/SMS notification when a status changes — a good next
  feature to add in `reportController.updateStatus`.
- The admin key is a simple shared secret for demo/small-deployment
  purposes; for a public production rollout, replace it with real admin
  accounts and roles in the `users` table.
