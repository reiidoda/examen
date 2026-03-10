# Project Structure

## Repository Layout
```text
examen/
  Docs/                        # architecture and engineering documentation
  examen-backend/              # Spring Boot API (Java)
  examen-frontend/             # Angular SSR frontend (TypeScript)
  deploy/                      # production nginx configuration
  scripts/                     # operational scripts
  docker-compose.yml           # local stack orchestration
  docker-compose.prod.yml      # production-style stack orchestration
```

## Backend Structure
```text
examen-backend/src/main/java/com/rei/examenbackend/
  controller/                  # API entry points
  service/ and service/impl/   # business logic
  repository/                  # persistence contracts
  model/                       # domain entities
  dto/                         # transport models
  config/                      # security, jwt, reminders, seeding
```

## Frontend Structure
```text
examen-frontend/src/app/
  auth/                        # login/register/reset flows
  categories/                  # category CRUD
  settings/                    # user settings
  core/                        # guards, interceptors, shared services
  shared/features/             # dashboard, examination, profile, questions, todos, journal
```

## Documentation Layout
- Architecture and system docs live in `Docs/`.
- Governance docs live at repository root.
