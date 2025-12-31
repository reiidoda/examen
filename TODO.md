# ✅ TODO – Current Backlog

## Baseline already in place
- Auth with JWT, password reset tokens, CORS, Swagger UI, actuator health
- Examination sessions with 24h cooldown, mood/notes capture, scoring, daily log, profile analytics
- Categories and questions: CRUD plus default seed questions and custom user library
- Productivity/growth: todos with due time, journal entries, gratitude/habit endpoints, user settings (timezone/reminders/theme)
- Infrastructure: Flyway migrations, Docker/Compose builds (dev + nginx prod), DB backup/restore scripts

## Next up
- [ ] Wire Angular examination submission to `POST /api/sessions/{id}/submit` (send `AnswerRequest` payload with questionId/examinationSessionId, notes, mood), and refresh history/profile from the API instead of the local mock submit
- [ ] Expose the growth endpoints (gratitude, habits, weekly summary, PDF export) in the UI or hide them until screens are ready
- [ ] Add automated tests: backend integration (auth + session lifecycle + scoring) on H2/Flyway; frontend component/service tests for auth, todos, and question CRUD
- [ ] Set up CI (GitHub Actions) to run backend Gradle tests, frontend build/tests, and Docker image build
- [ ] Provide a `.env.example` covering Postgres/JWT/API_URL values and align port notes with compose (frontend is 4001 on the host)
- [ ] Implement password reset delivery (email) instead of returning the token; add rate limiting
- [ ] Clean up frontend interceptors (remove unused `jwt.interceptor.ts`, add 401 handling to force logout)

## Later / enhancements
- [ ] Replace the placeholder PDF export with a real report (mood trend, gratitude, todos)
- [ ] Deliver reminders using `UserSettings.reminderTime` (email or in-app notifications)
- [ ] Seed starter categories/questions beyond the reflection defaults for new users
- [ ] Add AI/insights service (analysis, summaries, question generation) and a client in the backend when the contract is defined
