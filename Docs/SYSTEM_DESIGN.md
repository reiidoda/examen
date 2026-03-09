# System Design

## Core Use Cases
- User registration/login/password reset.
- Start one examination session per 24h cooldown.
- Submit reflective answers with feeling scores.
- Track profile analytics, progress, and weekly/monthly summaries.
- Manage personal reminders and notifications.
- Maintain journals, gratitude entries, habit scores, and todos.

## Data Design (Primary Aggregates)
- `User`
- `ExaminationSession` + `Answer`
- `DailyExamination`
- `Question` + `Category`
- `UserSettings` + `UserNotification`
- `JournalEntry`, `GratitudeEntry`, `HabitScore`, `ToDoItem`

## Key Flows
### 1) Authentication
1. Client posts credentials to `/api/auth/login`.
2. Backend authenticates via `AuthenticationManager`.
3. JWT token returned to client.
4. Client stores token and sends it in `Authorization: Bearer ...`.

### 2) Examination Session Lifecycle
1. Client calls `/api/sessions/start`.
2. Service enforces cooldown + active-session guard.
3. Client submits answers via `/api/sessions/{id}/submit`.
4. Service computes scores and upserts daily aggregate data.
5. Profile endpoints read session + aggregate data for dashboards.

### 3) Reminder Delivery
1. Scheduler runs on configured cron.
2. Candidate users resolved from `UserSettings`.
3. Per-user timezone/time window checks are applied.
4. Email and/or in-app notifications are delivered.
5. `lastReminderSentDate` prevents duplicate same-day sends.

## Reliability and Safety
- Validation on DTO inputs and typed error responses (`ApiException`).
- Role/ownership checks for protected operations.
- Migrations managed with Flyway.
- Health endpoint available via Actuator.

## Scalability Notes
- Current single service + relational DB design is appropriate for small/medium workloads.
- Future scaling options:
  - Introduce read-optimized analytics projections.
  - Move reminder delivery to queue-based workers.
  - Add caching for static catalog data (questions/categories).

## Security Notes
- JWT-based stateless auth.
- Passwords hashed with BCrypt.
- Password reset tokens persisted with expiration and used-flag.
- Secret material supplied by environment variables.

## Verification Strategy
- Backend integration coverage includes an authenticated end-to-end user journey across auth,
  profile, growth, insights, notifications, todos, journal, categories, questions, sessions, and settings.
- Frontend service tests validate HTTP contracts for each feature service.
- Playwright browser tests validate user interactions for:
  - auth login + password reset
  - categories and custom questions
  - examination session completion
  - profile growth/insights/notifications flows
  - todos, settings, and journal features
