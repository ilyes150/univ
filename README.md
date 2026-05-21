# UniDZ Portal — Fix Summary

## What was broken and what was fixed

---

### FIX 1 — Frontend had no container (opening `login.html` directly = CORS errors)

**Symptom:** You had to open `frontend/login.html` as a local file. API calls to
`http://localhost:8080` triggered CORS errors in some browsers, and nothing worked
from another machine on the same network.

**Fix:** Added an **Nginx container** (`frontend` service in `docker-compose.yml`) that:
- Serves `frontend/` as static files on **port 80**
- **Proxies `/api/*`** to the Spring Boot backend internally (no more hardcoded `localhost:8080`)

After the fix, just open **`http://localhost`** in any browser.

---

### FIX 2 — Race condition: backend started before database was ready

**Symptom:** On a fresh `docker compose up --build` the backend container often started
before PostgreSQL finished initialising, causing a connection-refused crash.
Docker would restart it, but it was flaky and slow.

**Fix:** Added a `healthcheck` to the `postgres-db` service:
```yaml
healthcheck:
  test: ["CMD-SHELL", "pg_isready -U engine_admin -d unidz_portal"]
  interval: 5s
  retries: 10
```
The `backend-api` service now uses `condition: service_healthy` instead of just
`depends_on`, so it only starts once Postgres is genuinely accepting connections.

---

### FIX 3 — Nginx frontend waited for backend healthcheck, but backend had none

**Symptom:** The `frontend` Nginx service would start before Spring Boot finished its
slow JVM startup, returning 502 Bad Gateway for a few seconds.

**Fix:** Added a healthcheck to `backend-api` using `/actuator/health` (Spring Boot
Actuator), and `frontend` now uses `condition: service_healthy` too.
`spring-boot-starter-actuator` was added to `pom.xml`. `wget` was added to the
Alpine runtime image so the healthcheck command actually works.

---

### FIX 4 — Hardcoded `http://localhost:8080` in every JS file

**Symptom:** The portal only worked on the machine running Docker. Anyone else on the
same network got connection errors.

**Fix:** `API_BASE` is now `""` (empty string) in both `login.html` and `home.html`.
All fetch calls become relative (`/api/portal/login`, etc.) and Nginx proxies them
to the backend container by name (`backend-api:8080`) — no IP or hostname needed.

---

## Project structure after fixes

```
unidz-portal/
├── docker-compose.yml        ← 3 services: postgres, backend, frontend(nginx)
├── nginx.conf                ← NEW: serves static files + proxies /api/*
├── Dockerfile                ← added wget for healthcheck
├── pom.xml                   ← added spring-boot-starter-actuator
├── src/main/resources/
│   └── application.properties ← actuator health endpoint exposed
├── frontend/
│   ├── login.html            ← API_BASE = "" (relative URLs)
│   ├── home.html             ← API_BASE = "" (relative URLs)
│   └── Style.css             ← unchanged
└── init-scripts/             ← unchanged (01–07 SQL files)
```

---

## Quick start

```bash
# If you have an old pgdata volume from a previous attempt, wipe it first:
docker compose down -v

# Build everything and start all three containers:
docker compose up --build
```

Startup order is automatic: **Postgres → Backend → Nginx**.

Open **`http://localhost`** in your browser — the login page appears immediately.

### Login credentials

Use any `student_code` from the student table as the username (e.g. `242435342409`).

The password is derived from the student code itself:

```
password_input = "science" + student_code[4:]
```

So for code `242435342409`, type `science35342409` as the password.

> The SHA-256 hash of that string is what's stored in the `login` table, and it's
> what the backend verifies against.
