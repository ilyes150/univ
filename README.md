# UniDZ Portal — Build Fix

## What broke and why

### BUG 1 — Missing main class (CRITICAL · caused the build failure)

**Symptom:** `mvn clean package` exits with code 1 during the Docker build.  
**Cause:** There is no `@SpringBootApplication` entry point anywhere in `src/`. Spring Boot's Maven plugin cannot package a JAR without one — it has no class to set as the manifest `Main-Class`.  
**Fix:** Add the file below to your project.

**Place this file at:**
```
src/main/java/com/unidz/portal/PortalApplication.java
```
→ Use the provided `PortalApplication.java`

---

### BUG 2 — Init scripts never run (database stays empty)

**Symptom:** Backend starts, but every login returns 401 — the `login`, `student`, and semester tables are empty.  
**Cause:** `docker-compose.yml` has no volume binding for `init-scripts/`. The Postgres image only runs `.sql` files placed in `/docker-entrypoint-initdb.d/` on first startup. Those files were never mounted.  
**Fix:** Add the volume mount to `docker-compose.yml`.

**Replace your `docker-compose.yml` with the provided one.**  
Key change in the `postgres-db` service:
```yaml
volumes:
  - pgdata:/var/lib/postgresql/data
  - ./init-scripts:/docker-entrypoint-initdb.d   # ← this line was missing
```

> ⚠️ **Important:** If you already ran `docker compose up` and the volume `pgdata` exists but is empty/wrong, you must reset it first:
> ```bash
> docker compose down -v   # removes the named volume
> docker compose up --build
> ```

---

### BUG 3 — DB name mismatch (cosmetic, but confusing)

**Symptom:** None at runtime (the env var overrides the default), but the inconsistency is misleading.  
**Cause:** `docker-compose.yml` originally created the database as `university_portal`, while `application.properties` defaults to `unidz_portal`. The `SPRING_DATASOURCE_URL` env var in docker-compose happened to point to `university_portal`, making it work — but any developer running the backend standalone (without Docker) would connect to the wrong database.  
**Fix:** Both `POSTGRES_DB` in docker-compose and the fallback in `application.properties` now use `unidz_portal`.

---

## Quick-start after applying fixes

```bash
# 1. Place PortalApplication.java at the correct path (see Bug 1 above)
# 2. Replace docker-compose.yml
# 3. If pgdata volume exists from a previous attempt, wipe it:
docker compose down -v

# 4. Build and start everything
docker compose up --build
```

The backend will be live at `http://localhost:8080`.  
Open `frontend/login.html` directly in a browser — no web server needed (CORS is open).

**Login credentials:** use any `student_code` as the username (e.g. `242435342409`).  
The password is whatever you enter — authentication is SHA-256 based on the student code itself, not a separately-chosen password. The default password for every student is their student code entered into the login field (the hash is derived from the code, so entering the code as the password is correct for the default setup).