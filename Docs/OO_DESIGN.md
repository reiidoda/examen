# Object-Oriented Design

## Domain Model Highlights
- `User` is the identity root for all user-owned data.
- `ExaminationSession` models a bounded daily reflection event.
- `Answer` belongs to a session and references one `Question`.
- `DailyExamination` is a day-granularity aggregate snapshot.
- `Question` belongs to a `Category` and may be default or custom.

## Responsibility Partitioning
- Entities (`model/*`) hold domain state and relationships.
- Services (`service/*`) enforce business rules and workflows.
- Repositories (`repository/*`) provide persistence contracts.
- DTOs (`dto/*`) isolate transport concerns from domain entities.

## Encapsulation Decisions
- Business constraints are centralized in services (e.g., cooldown rules, ownership checks).
- API contracts do not expose entity graphs directly; they map to DTOs.
- Typed exceptions (`ApiException`) isolate domain/business errors from generic runtime failures.

## Aggregates and Invariants
- `ExaminationSession`
  - belongs to one user.
  - can be active or completed.
  - answers are immutable history after completion (operationally treated as such).
- `UserSettings`
  - one-to-one with `User`.
  - controls reminder channels and time configuration.
- `DailyExamination`
  - unique by `(user, examDate)`.
  - serves as analytics-friendly daily rollup.

## Composition and Collaboration
- Controllers compose service calls and HTTP semantics.
- Services collaborate with repositories and cross-service helpers.
- Scheduler collaborates with settings repository, mail service, and notification service.

## Testing Strategy (OO perspective)
- Unit tests validate service invariants and failure modes.
- Integration tests verify end-to-end behavior across web/security/persistence boundaries.
