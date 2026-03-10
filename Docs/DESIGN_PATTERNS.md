# Design Patterns

## Patterns in Use
- Layered architecture: controller -> service -> repository.
- Repository pattern: data access contracts in dedicated interfaces.
- DTO pattern: explicit transport contracts for API stability.
- Strategy pattern: `InsightsClient` supports pluggable implementations.
- Builder pattern: clear object construction for DTO and model creation.
- Factory method style: centralized response/exception creation paths.

## Patterns for Enterprise Evolution
- Outbox pattern: reliable event publication from transactional writes.
- Saga choreography: multi-context workflow coordination without distributed transactions.
- CQRS read models: optimized analytics projections.
- Circuit breaker and bulkhead: resilience for dependency failures.
- Cache-aside: controlled cache population for read-heavy endpoints.

## Pattern Selection Rules
- Introduce a pattern only when it removes recurring complexity.
- Keep pattern implementations observable and testable.
- Prefer explicit domain naming over abstract generic helpers.
