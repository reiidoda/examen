# Architecture Overview

## Purpose
Examen is a reflective practice platform for daily examination of conscience.
It supports guided sessions, custom questions, personal analytics, reminders, journaling, gratitude, habits, and todo management.

## High-Level Architecture
- Frontend: Angular 21 (SSR-capable)
- Backend: Spring Boot 4 REST API (Java 25)
- Database: PostgreSQL 15
- Tooling/Ops: Docker Compose, Flyway, Swagger, Actuator

```mermaid
graph LR
  U[Browser] --> F[Angular App / SSR]
  F -->|/api| B[Spring Boot API]
  B --> D[(PostgreSQL)]
  B --> M[Mail Provider (SMTP)]
  B --> N[Scheduled Reminder Jobs]
```

## Layered Backend Structure
- `controller`: HTTP entry points and response contracts.
- `service` + `service/impl`: business orchestration and domain rules.
- `repository`: persistence abstraction via Spring Data JPA.
- `model`: JPA entities and domain state.
- `dto`: request/response contracts.
- `config`: security, JWT, CORS, seeding, typed properties.

## Frontend Structure
- `auth`: login/register/reset password.
- `shared/features/examination`: session workflow and answering UI.
- `shared/features/profile`: analytics, progress, growth metrics.
- `shared/features/todos`, `journal`, `questions`: personal tooling.
- `core/services`: API integration, auth/token and app-level utilities.

## Runtime Qualities
- Stateless backend authentication via JWT.
- Persistence-backed session and analytics history.
- Defensive scheduling for reminders by timezone.
- Production packaging via Docker images and Compose stacks.

## Current Tradeoffs
- Simple layered architecture accelerates iteration but requires discipline to avoid business logic in controllers.
- JPA + direct repositories are productive, but complex analytics may eventually benefit from dedicated query/read-model services.
- SSR improves perceived performance and SEO, at the cost of additional runtime complexity.
