# Contributing Guide

## Prerequisites
- Java 25+
- Node 20+
- Docker (optional)
- PostgreSQL 15 (or Docker Compose)

## Local Setup
1. Copy `.env.example` to `.env.local` and adjust values.
2. Start the backend:
```bash
cd examen-backend
./gradlew bootRun
```
3. Start the frontend:
```bash
cd examen-frontend
npm install
npm start
```

## Branching and Commit Style
- Create short-lived branches from `main`.
- Prefer branch names in one of these forms:
  - `feat/<topic>`
  - `fix/<topic>`
  - `docs/<topic>`
  - `codex/<topic>`
- Use clear commit messages, e.g.:
  - `feat(profile): add weekly trend endpoint`
  - `fix(auth): enforce strong password on reset`

## Pull Request Expectations
- Keep PRs focused and scoped.
- Include a summary, rationale, and validation steps.
- Link relevant issues (`Closes #<id>` when applicable).
- Ensure CI passes before merge.

## Testing Checklist
Backend:
```bash
cd examen-backend
./gradlew test
```

Frontend:
```bash
cd examen-frontend
npm test -- --watch=false
npm run build
```

## Coding Standards
- Favor explicit domain naming over generic utility abstractions.
- Keep controller logic thin; move business rules to services.
- Use `ApiException` for business/HTTP-aware errors.
- Add or update tests for behavior changes.
- Preserve backward-compatible API behavior unless a change is intentional and documented.

## Security and Secrets
- Never commit secrets or production credentials.
- Use environment variables for JWT secrets, DB credentials, SMTP credentials, and API URLs.
- If a vulnerability is discovered, use private disclosure through repository security reporting.

## Governance
By participating, you agree to abide by the [Code of Conduct](CODE_OF_CONDUCT.md).
