# UniDZ Portal — Technical Documentation

> **University Student Academic Portal**  
> Stack: Spring Boot 3.2.3 · PostgreSQL 15 · Nginx · Docker Compose  
> Java 17 · Maven · Spring Data JPA · Lombok

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Architecture](#2-architecture)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Database Schema](#5-database-schema)
6. [Backend — Spring Boot](#6-backend--spring-boot)
7. [Frontend](#7-frontend)
8. [Authentication](#8-authentication)
9. [API Reference](#9-api-reference)
10. [Docker & Deployment](#10-docker--deployment)
11. [Bug Fixes & Changes](#11-bug-fixes--changes)
12. [Quick Start](#12-quick-start)

---

## 1. Project Overview

**UniDZ Portal** is a web-based academic portal that allows university students to securely log in and view their academic records — including module grades, unit averages, credits earned, semester averages, and class rankings — across up to three tracked semesters.

The system is fully containerised and designed to work on any machine with Docker installed, with no manual environment configuration required.

---

## 2. Architecture

The application follows a classic **three-tier architecture** deployed as three Docker containers managed by Docker Compose:

```
Browser
  │
  ▼
┌─────────────────────────────┐
│  Nginx (port 80)            │  ← Serves static HTML/CSS/JS
│  frontend container         │  ← Proxies /api/* → backend
└──────────────┬──────────────┘
               │ HTTP (internal Docker network)
               ▼
┌─────────────────────────────┐
│  Spring Boot (port 8080)    │  ← REST API
│  backend-api container      │  ← Business logic + auth
└──────────────┬──────────────┘
               │ JDBC
               ▼
┌─────────────────────────────┐
│  PostgreSQL 15 (port 5432)  │  ← Persistent data store
│  postgres-db container      │  ← Auto-initialised via SQL scripts
└─────────────────────────────┘
```

**Container startup order (enforced by healthchecks):**

```
postgres-db  →  backend-api  →  frontend
```

---

## 3. Technology Stack

| Layer | Technology | Version |
|---|---|---|
| Backend Framework | Spring Boot | 3.2.3 |
| Language | Java | 17 |
| Build Tool | Maven | (via wrapper) |
| ORM | Spring Data JPA / Hibernate | — |
| Database | PostgreSQL | 15-alpine |
| Web Server / Proxy | Nginx | alpine |
| Containerisation | Docker / Docker Compose | v3.8 |
| Boilerplate Reduction | Lombok | latest |
| Health Monitoring | Spring Boot Actuator | — |

---

## 4. Project Structure

```
unidz-portal/
├── docker-compose.yml          ← 3-service orchestration
├── Dockerfile                  ← Backend image (JDK 17 + wget)
├── nginx.conf                  ← Static serving + /api proxy
├── pom.xml                     ← Maven dependencies
│
├── src/main/
│   ├── java/com/unidz/portal/
│   │   ├── PortalApplication.java          ← Entry point
│   │   ├── controller/
│   │   │   └── PortalController.java       ← REST endpoints
│   │   ├── service/
│   │   │   └── PortalService.java          ← Business logic
│   │   ├── model/
│   │   │   ├── Student.java
│   │   │   ├── Login.java
│   │   │   ├── Result.java
│   │   │   ├── Semester1.java
│   │   │   ├── Semester2.java
│   │   │   └── Semester3.java
│   │   └── repository/
│   │       ├── LoginRepository.java
│   │       ├── StudentRepository.java
│   │       ├── ResultRepository.java
│   │       ├── Semester1Repository.java
│   │       ├── Semester2Repository.java
│   │       └── Semester3Repository.java
│   └── resources/
│       └── application.properties
│
├── frontend/
│   ├── login.html
│   ├── home.html
│   ├── style.css
│   └── JS/
│       ├── login.js
│       └── home.js
│
└── init-scripts/               ← Auto-run by Postgres on first start
    ├── 01_tables.sql
    ├── 02_student.sql
    ├── 03_login.sql
    ├── 04_semester1.sql
    ├── 05_semester2.sql
    ├── 06_semester3.sql
    └── 07_result.sql
```

---

## 5. Database Schema

### `student`
Stores core student profile information.

| Column | Type | Description |
|---|---|---|
| `id` | INT (PK) | Unique student ID |
| `fname` | VARCHAR(100) | First name |
| `lname` | VARCHAR(100) | Last name |
| `student_code` | VARCHAR(50) | National student code (used as username) |
| `field` | VARCHAR(255) | Field of study |
| `major` | VARCHAR(255) | Major / branch |
| `specialty` | VARCHAR(255) | Specialty (nullable) |
| `cycle` | VARCHAR(100) | Academic cycle (e.g., Licence) |
| `level` | INT | Year of study |
| `group_num` | INT | Group / section number |

### `login`
Maps each student to their hashed credentials.

| Column | Type | Description |
|---|---|---|
| `id` | INT (PK, FK → student) | Student ID |
| `username` | VARCHAR(20) | Login username (= student_code) |
| `password` | VARCHAR(256) | SHA-256 hex digest |

### `semester1`, `semester2`, `semester3`
Each table stores per-student module grades and unit averages for its respective semester. Common structure:

| Column | Type | Description |
|---|---|---|
| `ID` | INT (PK, FK → student) | Student ID |
| Module columns (e.g. `ASD1`, `IOS1`) | DECIMAL(5,2) | Individual module grade |
| `Avg_UEFx`, `Avg_UED`, `Avg_UET`, `Avg_UEM` | DECIMAL(5,2) | Unit averages |
| `Credit_UEFx`, `Credit_UED`, ... | INT | Credits per unit |
| `Credit_Sem` | INT | Total semester credits |
| `Avg_Sem` | DECIMAL(5,2) | Semester average |
| `rank` | INT | Rank in class for the semester |

#### Semester 1 Modules
- **UEF1:** ASD1 (Algorithms & Data Structures 1), IOS1 (Introduction to OS), SM (Systems & Methods)
- **UEF2:** Algebra1, Calculus1
- **UED:** Electronics
- **UET:** Technical English (TE)

#### Semester 2 Modules
- **UEF1:** ASD2, ADO (Advanced Data Organisation)
- **UEF2:** Algebra2, Calculus2, LM (Logic & Mathematics)
- **UEM:** PST1 (Probability & Statistics 1)
- **UET:** OET (Oral Expression & Technical Writing)

#### Semester 3 Modules
- **UEF1:** ASD3, ISI (Information Systems), OOP1
- **UEF2:** Algebre3, Calculus3
- **UEM:** PST2
- **UET:** Entrepreneurship

### `result`
Aggregated cross-semester performance record per student.

| Column | Type | Description |
|---|---|---|
| `id` | INT (PK, FK → student) | Student ID |
| `avg_s1` – `avg_s4` | DECIMAL(5,2) | Average per semester |
| `avg` | DECIMAL(5,2) | Overall cumulative average |
| `rank` | INT | Overall class rank |

---

## 6. Backend — Spring Boot

### Entry Point

`PortalApplication.java` — standard `@SpringBootApplication` bootstrapper.

### Controller — `PortalController`

Base path: `/api/portal`  
Annotation: `@RestController`, `@CrossOrigin(origins = "*")`

#### Endpoints

| Method | Path | Description |
|---|---|---|
| `POST` | `/api/portal/login` | Authenticate student, return profile + metrics |
| `GET` | `/api/portal/semester/{semNum}?studentId=X` | Return semester grade record |

### Service — `PortalService`

Provides `authenticateAndFetchProfile(username, rawPassword)` and `getPerformanceMetrics(studentId)` as reusable service-layer methods using constructor injection.

### Models (JPA Entities)

All models use `@Entity`, `@Table`, Lombok `@Getter`/`@Setter`.

- **Student** — maps `student` table
- **Login** — maps `login` table
- **Result** — maps `result` table, fields use `BigDecimal`
- **Semester1/2/3** — map respective semester tables, all grades as `BigDecimal`

### Repositories

All extend `JpaRepository<Model, Integer>`. `LoginRepository` additionally declares `findByUsername(String username)`.

---

## 7. Frontend

The frontend is a static two-page web app served by Nginx.

### Pages

| File | Description |
|---|---|
| `login.html` | Student login form |
| `home.html` | Dashboard — student info, semester tabs, grade tables |

### JavaScript

- `login.js` — Sends `POST /api/portal/login`, stores response in `sessionStorage`, redirects to `home.html`
- `home.js` — Reads `sessionStorage` for profile, fetches semester data on tab switch via `GET /api/portal/semester/{n}?studentId=X`, renders grade tables dynamically

### API Base URL

`API_BASE` is set to `""` (empty string). All requests are relative (`/api/portal/...`) and Nginx proxies them to the backend container. No hardcoded hostnames or ports.

---

## 8. Authentication

Authentication is hash-based with no external library.

### Algorithm

```
password_stored = SHA-256( "science" + student_code.substring(4) )
```

Example: for student code `232335488809`  
→ salt string = `"science" + "35488809"` = `"science35488809"`  
→ stored password = SHA-256(`"science35488809"`) as lowercase hex

This is initialised in `init-scripts/03_login.sql` using PostgreSQL's native `sha256()`:

```sql
encode(sha256(concat('science', substring(student_code from 5))::bytea), 'hex')
```

The backend replicates this in Java using `MessageDigest.getInstance("SHA-256")`.

### Flow

1. Student submits `student_code` as username and derived password
2. Backend looks up `login` record by username
3. Backend validates username length (≥ 5 chars) before computing hash
4. Backend computes SHA-256 and compares (case-insensitive hex match)
5. On success, loads `Student` and `Result` records and returns them in the response

---

## 9. API Reference

### `POST /api/portal/login`

**Request body:**
```json
{
  "username": "232335488809",
  "password": "science35488809"
}
```

**Success response (200):**
```json
{
  "student": {
    "id": 36,
    "fname": "BELLIL",
    "lname": "ilyes abdelfetah",
    "studentCode": "232335488809",
    "field": "Mathematics and Computer Science",
    "major": "Computer Science",
    "specialty": "Common Core of Computer Science",
    "cycle": "Engineering",
    "level": 2,
    "groupNum": 4
  },
  "metrics": {
    "id": 36,
    "avgS1": 15.10,
    "avgS2": 16.54,
    "avgS3": 15.79,
    "avg": 15.81,
    "rank": 2
  }
}
```

**Error responses:**

| Status | Condition |
|---|---|
| 400 | Missing username or password |
| 401 | Username not found, code too short, or wrong password |
| 404 | Linked student profile not found (data integrity error) |

---

### `GET /api/portal/semester/{semNum}?studentId={id}`

**Path parameter:** `semNum` — integer (1, 2, or 3)  
**Query parameter:** `studentId` — integer

**Success response (200):** Full semester record as JSON object with all module grades and averages.

**Error responses:**

| Status | Condition |
|---|---|
| 400 | Missing `studentId` or `semNum` out of range |
| 404 | No record found for that student/semester |

---

## 10. Docker & Deployment

### `docker-compose.yml` — Service Overview

#### `postgres-db`
- Image: `postgres:15-alpine`
- Mounts `./init-scripts` → auto-executes SQL in order on first run
- Healthcheck: `pg_isready -U engine_admin -d unidz_portal` every 5s, 10 retries

#### `backend-api`
- Built from `./Dockerfile` (Spring Boot fat JAR on JDK 17 Alpine + wget)
- Environment variables pass DB connection details at runtime
- Healthcheck: `wget -qO- http://localhost:8080/actuator/health` every 10s
- `depends_on: postgres-db: condition: service_healthy`

#### `frontend`
- Image: `nginx:alpine`
- Serves `./frontend` as static files on port 80
- Mounts `./nginx.conf` for `/api/*` proxy config
- `depends_on: backend-api: condition: service_healthy`

### `nginx.conf`

```nginx
server {
  listen 80;
  root /usr/share/nginx/html;
  index login.html;

  location /api/ {
    proxy_pass http://backend-api:8080;
  }
}
```

### Environment Variables (backend-api)

| Variable | Value |
|---|---|
| `SPRING_DATASOURCE_URL` | `jdbc:postgresql://postgres-db:5432/unidz_portal` |
| `SPRING_DATASOURCE_USERNAME` | `engine_admin` |
| `SPRING_DATASOURCE_PASSWORD` | `VaultSecurePassword2026` |
| `SPRING_JPA_HIBERNATE_DDL_AUTO` | `update` |

---

## 11. Bug Fixes & Changes

### Fix 1 — CORS errors when opening `login.html` directly
**Problem:** Frontend was opened as a local file, causing CORS errors on API calls to `localhost:8080`.  
**Solution:** Added Nginx container that serves the frontend and proxies `/api/*` to the backend over the internal Docker network.

### Fix 2 — Race condition: backend started before database was ready
**Problem:** On fresh `docker compose up --build`, the backend started before PostgreSQL finished initialising, causing connection-refused crashes.  
**Solution:** Added PostgreSQL `healthcheck` using `pg_isready`; backend uses `condition: service_healthy`.

### Fix 3 — Nginx started before Spring Boot was ready (502 errors)
**Problem:** Nginx container started before the JVM finished Spring Boot startup, serving 502 Bad Gateway briefly.  
**Solution:** Added `/actuator/health` healthcheck to the backend; frontend uses `condition: service_healthy`. Added `spring-boot-starter-actuator` to `pom.xml` and `wget` to the Docker image.

### Fix 4 — Hardcoded `http://localhost:8080` in JavaScript
**Problem:** Portal only worked on the developer's machine. Other network users got connection errors.  
**Solution:** Set `API_BASE = ""` in all JS files. All fetch calls use relative URLs (`/api/portal/...`). Nginx proxies to the backend by container name.

---

## 12. Quick Start

### Prerequisites
- Docker Desktop (or Docker Engine + Docker Compose)

### Steps

```bash
# 1. Clean up any old data volumes (first-time or fresh start)
docker compose down -v

# 2. Build images and start all services
docker compose up --build
```

Startup is fully automatic: **Postgres → Backend → Nginx**

### Access the Portal

Open **`http://localhost`** in any browser.

### Login

| Field | Value |
|---|---|
| Username | Any `student_code` from the student table (e.g. `232335488809`) |
| Password | `"science"` + characters after position 4 of the student code |

**Example:**  
Student code: `232335488809`  
Password: `science35488809`

---

*Documentation generated for UniDZ Portal v1.0.0*