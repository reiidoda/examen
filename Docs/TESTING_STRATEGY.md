# Testing Strategy

## Testing Pyramid
- Unit tests: service/domain behavior and invariants.
- Integration tests: controller-security-persistence interactions.
- End-to-end tests: user journeys through browser automation.

## Test Scope Matrix
- Auth: login/register/reset + policy enforcement.
- Session: start/submit/cooldown/history lifecycle.
- Catalog: categories and custom questions CRUD.
- Profile: summary/progress/analytics/growth/insights/notifications.
- Productivity: todo and journal operations.
- Settings: reminder preferences and persistence.

## Quality Gates
- Backend tests must pass on every merge.
- Frontend unit tests and build must pass on every merge.
- E2E smoke suite must pass before production release.
- Security checks include dependency and API abuse scenarios.

## Environments
- Local: fast feedback with mocked dependencies.
- CI: deterministic execution with isolated databases.
- Staging: production-like topology and test data masking.
- Production: canary release validation with synthetic checks.

## Coverage Targets
- Service layer branch coverage target: at least 80 percent.
- API contract coverage target: all public endpoints have at least one contract test.
- E2E coverage target: all tier-1 user journeys.
