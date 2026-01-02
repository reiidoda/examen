# <img src="examen-frontend/public/icon.png" alt="Examen icon" height="28"> Examen
[![Build](https://img.shields.io/github/actions/workflow/status/reiidoda/examen/ci.yml?branch=main&label=build&logo=githubactions&logoColor=white)](https://github.com/reiidoda/examen/actions/workflows/ci.yml) [![License](https://img.shields.io/github/license/reiidoda/examen?label=license)](LICENSE) [![Last Commit](https://img.shields.io/github/last-commit/reiidoda/examen?label=last%20commit)](https://github.com/reiidoda/examen/commits/main) [![Issues](https://img.shields.io/github/issues/reiidoda/examen?label=issues)](https://github.com/reiidoda/examen/issues)
[![Angular](https://img.shields.io/badge/angular-21-DD0031?logo=angular&logoColor=white)](https://angular.dev) [![Spring Boot](https://img.shields.io/badge/spring%20boot-4.0.0-6DB33F?logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot) [![Java](https://img.shields.io/badge/java-25-007396?logo=openjdk&logoColor=white)](https://openjdk.org) [![Node.js](https://img.shields.io/badge/node-20-339933?logo=node.js&logoColor=white)](https://nodejs.org) [![PostgreSQL](https://img.shields.io/badge/postgresql-15-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org) [![Docker](https://img.shields.io/badge/docker-2496ED?logo=docker&logoColor=white)](https://www.docker.com)

![Examen](/Docs/examen.png)

## Product summary
Examen is a platform for daily examination of conscience and reflective practice. It guides
users through structured questions, captures answers with mood and feeling scores, and turns that data
into profile analytics and growth insights. Users can extend the prompt library with custom questions,
track habits and gratitude, keep a journal, and manage todos alongside the examination workflow.

The system is delivered as an Angular SSR web app backed by a Spring Boot API and PostgreSQL database,
with Docker-based tooling for local development and production deployments.

## Key features
- Authentication and account safety: JWT-based login/register and password reset with email delivery and rate limiting.
- Examination workflow: 24h cooldown, active session guard, reflection answers + feeling scores, category scoring, daily log.
- Question library management: default prompt library plus custom user-owned questions and categories.
- Growth tools: gratitude and habit scoring endpoints, weekly summaries, meditation suggestions, and PDF export.
- Profile analytics: completion trends, mood/feeling trends, category breakdowns, and summaries.
- Notifications and reminders: reminder scheduling with email or in-app delivery, managed by user settings.
- Operational tooling: Swagger UI, Actuator health checks, Flyway migrations, Docker/Compose.

## System architecture
- Frontend: Angular 21 SSR (Node and Express) with SCSS
- Backend: Spring Boot 4 (Java 25), JWT security, validation, Spring Data JPA
- Database: PostgreSQL 15 with Flyway migrations
- Ops: Docker and Docker Compose, Nginx for production, Swagger UI, Actuator health

Request flow:
Browser -> Angular SSR or SPA -> /api -> Spring Boot -> PostgreSQL

## Backend design
- Controllers under `examen-backend/src/main/java/com/rei/examenbackend/controller` expose REST endpoints.
- Services under `examen-backend/src/main/java/com/rei/examenbackend/service` orchestrate domain logic.
- Repositories under `examen-backend/src/main/java/com/rei/examenbackend/repository` handle persistence.
- DTOs under `examen-backend/src/main/java/com/rei/examenbackend/dto` define API request/response models.
- Config under `examen-backend/src/main/java/com/rei/examenbackend/config` covers security, mail, and reminders.

## Frontend design
- Standalone Angular components organized by feature under `examen-frontend/src/app`.
- Core areas: `auth`, `settings`, and `shared/features` (examination, profile, questions, todos, journal).
- SSR runtime built by `npm run build` and served via `npm run serve:ssr:examen-frontend`.

## Data model (high level)
Users, user settings, examination sessions, answers, categories, questions, todo items,
journal entries, gratitude entries, habit scores, and user notifications.

## Repository structure
```
README.md
TODO.md
.env.example
Docs/
examen-backend/   # Spring Boot API, Flyway migrations, Dockerfile
examen-frontend/  # Angular SSR app, Dockerfile
deploy/           # nginx.conf and TLS mount points for prod compose
scripts/          # db-backup.sh, db-restore.sh
```

## Prerequisites
- JDK 25+
- Node 20+ and npm 11+
- PostgreSQL 15 (or Docker)
- Docker and Docker Compose (optional)

## Configuration
1) Copy `.env.example` to `.env.local`.
2) Update the values for your environment.

Docker Compose falls back to defaults if `POSTGRES_*` are not set.

## Build and run (local, no Docker)
1) Start PostgreSQL (local or `docker compose up postgres`).
2) Run the backend:
```
cd examen-backend
./gradlew bootRun
```
The API runs at http://localhost:8080 with Swagger at `/swagger-ui/index.html`.

3) Run the frontend dev server:
```
cd examen-frontend
npm install
npm start
```
The dev server runs at http://localhost:4200 and targets http://localhost:8080/api.

4) Run the SSR build (optional):
```
cd examen-frontend
npm run build
API_URL=http://localhost:8080/api PORT=4000 npm run serve:ssr:examen-frontend
```

## Docker Compose
- Standard stack:
```
docker compose up --build
```
Exposes PostgreSQL `5432`, backend `8080`, frontend `4001` (proxying container port 4000).

- Production style stack with Nginx:
```
docker compose -f docker-compose.prod.yml up --build
```
Place `fullchain.pem` and `privkey.pem` under `deploy/certs/` for HTTPS termination.

## Testing
- Backend:
```
cd examen-backend
./gradlew test
```
- Frontend:
```
cd examen-frontend
npm test
```

## Environment variables
Define these in `.env.local` (git ignored). See `.env.example` for defaults.

| Name | Description |
|------|-------------|
| POSTGRES_USER | PostgreSQL username |
| POSTGRES_PASSWORD | PostgreSQL password |
| POSTGRES_DB | PostgreSQL database name |
| SPRING_DATASOURCE_URL | JDBC URL for local dev |
| SPRING_DATASOURCE_USERNAME | JDBC username |
| SPRING_DATASOURCE_PASSWORD | JDBC password |
| APP_JWT_SECRET | JWT signing secret (HS256) |
| API_URL | Frontend SSR API base |
| APP_PASSWORD_RESET_URL | Frontend reset page URL |
| APP_PASSWORD_RESET_FROM | Email "from" address for reset mail |
| APP_PASSWORD_RESET_MAX_REQUESTS | Max reset requests per window |
| APP_PASSWORD_RESET_WINDOW_MINUTES | Rate limit window in minutes |
| APP_PASSWORD_RESET_TOKEN_TTL_MINUTES | Reset token expiry in minutes |
| APP_PASSWORD_RESET_MAIL_ENABLED | Toggle mail delivery |
| SPRING_MAIL_HOST | SMTP host |
| SPRING_MAIL_PORT | SMTP port |
| SPRING_MAIL_USERNAME | SMTP username |
| SPRING_MAIL_PASSWORD | SMTP password |
| SPRING_MAIL_SMTP_AUTH | SMTP auth flag |
| SPRING_MAIL_SMTP_STARTTLS_ENABLE | SMTP STARTTLS flag |
| APP_REMINDER_ENABLED | Toggle reminder scheduling |
| APP_REMINDER_MAIL_ENABLED | Toggle reminder email delivery |
| APP_REMINDER_FROM | Reminder email "from" address |
| APP_REMINDER_SUBJECT | Reminder email subject |
| APP_REMINDER_APP_URL | Link used in reminder emails |
| APP_REMINDER_IN_APP_TITLE | In-app reminder title |
| APP_REMINDER_IN_APP_MESSAGE | In-app reminder body |
| APP_REMINDER_CRON | Reminder schedule (cron) |

## API reference
- Swagger UI: `http://localhost:8080/swagger-ui/index.html`
- Auth: `/api/auth/*`
- Sessions: `/api/sessions/*`
- Catalog: `/api/categories`, `/api/questions/*`
- Todos: `/api/todos`
- Journal: `/api/journal`
- Profile: `/api/profile/*`
- Growth: `/api/growth/*`
- Settings: `/api/settings`
- Notifications: `/api/notifications`
- Insights: `/api/insights/*`
- Health: `/actuator/health`

## Scripts
- `scripts/db-backup.sh`
- `scripts/db-restore.sh`

## Notes
- Flyway migrations live under `examen-backend/src/main/resources/db/migration`.
