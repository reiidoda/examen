# 🚀 Examen – Full Stack Examination Platform

<img title="Examen" alt="Alt text" src="/Docs/examen.png">

Full-stack daily examination platform built with Angular SSR and Spring Boot. Current capabilities include JWT auth, daily session tracking with mood/notes, category and question management (with default prompts), todos, journaling, growth metrics, and a profile dashboard with streak/progress analytics. The stack is fully dockerized with Flyway migrations and health checks.

## Current Capabilities
- JWT auth (register/login) with password reset tokens
- Examination sessions: start/active session guard, 24h cooldown, submit answers with mood/notes, category scoring, daily log
- Categories and questions: CRUD, default seed questions, custom user questions with ownership rules
- Profile dashboard: streak and completion summaries, progress timeline, weekly/monthly summaries, category/mood analytics
- Productivity/growth: todos with due times, journal entries, gratitude and habit scoring endpoints, meditation tips, PDF export placeholder
- User settings: time zone, reminder time, theme, email/in-app reminder flags
- Ops: Flyway migrations, actuator health, Swagger UI, Docker/Docker Compose (dev + nginx-based prod)

## Tech Stack
| Layer | Technology |
|-------|------------|
| Frontend | Angular 21, Standalone Components, SSR (Node/Express wrapper), SCSS |
| Backend | Spring Boot 4 (Java 25), JWT security, Validation, Spring Data JPA |
| Database | PostgreSQL 15 + Flyway migrations |
| Docs/Ops | springdoc-openapi, Actuator health, Docker/Compose, Nginx (prod) |

## Project Layout
```
README.md
docker-compose.yml / docker-compose.prod.yml
examen-backend/   # Spring Boot API, Flyway migrations, Dockerfile
examen-frontend/  # Angular 21 SSR app, Dockerfile
deploy/           # nginx.conf and TLS mount points for prod compose
scripts/db-backup.sh, scripts/db-restore.sh
Docs/examen.png
```

## Local Development (without Docker)
Requirements: JDK 25+, Node 20+/npm 11, PostgreSQL 15.

1) Start PostgreSQL (local or `docker compose up postgres`). Create a local `.env.local` (kept out of git) with your own credentials:
```
SPRING_DATASOURCE_URL=jdbc:postgresql://localhost:5432/<your_db_name>
SPRING_DATASOURCE_USERNAME=<your_db_user>
SPRING_DATASOURCE_PASSWORD=<your_db_password>
APP_JWT_SECRET=<long-random-secret>
POSTGRES_USER=<your_db_user>
POSTGRES_PASSWORD=<your_db_password>
POSTGRES_DB=<your_db_name>
```
Use strong, unique values and do not commit this file; Docker Compose will fall back to its own defaults if these vars are unset.

2) Backend
```
cd examen-backend
./gradlew bootRun
```
API runs on http://localhost:8080 with Swagger at `/swagger-ui/index.html`.

3) Frontend (dev server, HMR)
```
cd examen-frontend
npm install
npm start
```
Angular dev server runs on http://localhost:4200 and targets the backend at http://localhost:8080/api.

4) Frontend (SSR runtime, optional)
```
cd examen-frontend
npm run build
API_URL=http://localhost:8080/api PORT=4000 npm run serve:ssr:examen-frontend
```

## Docker Compose
- Default compose builds backend + frontend + Postgres:
```
docker compose up --build
```
Exposes PostgreSQL `5432`, backend `8080`, frontend `4001` (proxying container port 4000).

- Production-style stack with nginx/TLS passthrough:
```
docker compose -f docker-compose.prod.yml up --build
```
Place `fullchain.pem` and `privkey.pem` under `deploy/certs/` for HTTPS termination. nginx forwards `/api` to the backend and everything else to the SSR frontend.

### Environment Variables
| Name | Description | Default |
|------|-------------|---------|
| POSTGRES_USER | PostgreSQL user | set in local env/.env (no secret in repo) |
| POSTGRES_PASSWORD | PostgreSQL password | set in local env/.env (no secret in repo) |
| POSTGRES_DB | PostgreSQL database | set in local env/.env (no secret in repo) |
| SPRING_DATASOURCE_URL | JDBC URL (override for local dev) | defaults to `jdbc:postgresql://postgres:5432/${POSTGRES_DB}` when using Compose |
| APP_JWT_SECRET | JWT signing secret (HS256) | required; set a long random value locally |
| API_URL | Frontend SSR API base (used by Node server) | http://backend:8080/api |

## APIs
- Auth: `/api/auth/login`, `/api/auth/register`, `/api/auth/reset/*`
- Sessions: `/api/sessions/start`, `/api/sessions/{id}/submit`, `/api/sessions/active`, `/api/sessions/me`
- Catalog: `/api/categories`, `/api/questions`, `/api/questions/custom`, `/api/questions/my`
- Todos: `/api/todos`
- Journal: `/api/journal`
- Profile: `/api/profile/summary`, `/progress`, `/summary/weekly`, `/summary/monthly`, `/analytics`
- Growth/metrics: `/api/growth/gratitude`, `/habits`, `/weekly-summary`, `/meditation-suggestions`, `/export/pdf`
- Settings: `/api/settings`
- Health: `/actuator/health`

## Notes
- Examination UI currently uses the backend for session start/load but submits locally; wire it to `/api/sessions/{id}/submit` to persist answers/mood (see TODO.md).
- Migrations run automatically on startup; Flyway scripts live in `examen-backend/src/main/resources/db/migration`.
- Utility scripts for DB backup/restore live under `scripts/`.
