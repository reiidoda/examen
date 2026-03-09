# Design Patterns In Use

## 1) Layered Architecture
- Controller -> Service -> Repository.
- Separates transport, business rules, and persistence concerns.

## 2) Dependency Injection (IoC)
- Spring injects dependencies across controllers, services, and config classes.
- Promotes testability through mockable constructor dependencies.

## 3) Repository Pattern
- Spring Data repositories abstract persistence mechanics.
- Keeps services focused on domain logic instead of query plumbing.

## 4) DTO Pattern
- API request/response DTOs decouple external contracts from JPA entities.
- Reduces accidental over-exposure of internal object graphs.

## 5) Strategy-like Pluggability (`InsightsClient`)
- `InsightsService` depends on `InsightsClient` abstraction.
- Current default implementation is `StubInsightsClient`; future AI-backed clients can replace it without changing orchestration logic.

## 6) Builder Pattern
- Many domain and DTO objects expose builder APIs.
- Improves readability in object construction for tests and service code.

## 7) Guard Clauses
- Services use early-return/early-throw validation for invalid states (ownership, cooldown, missing resources).
- Keeps workflow logic explicit and maintainable.

## Pattern Opportunities
- Introduce dedicated domain services for scoring rules if analytics complexity grows.
- Introduce mapper components if DTO transformation logic expands significantly.
