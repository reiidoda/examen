# Software Design

## Design Approach
- Domain-oriented decomposition by bounded context.
- Contract-first APIs and DTO boundaries.
- Explicit ownership of data and behavior.

## Structural Design
- Presentation layer: Angular feature modules and shared components.
- Application layer: controller and orchestrator services.
- Domain layer: business logic, invariants, and policies.
- Infrastructure layer: persistence, messaging, and external providers.

## Behavioral Design
- Command-like writes with transactional guarantees.
- Query paths optimized for read models.
- Event notifications for cross-context reactions.

## Design Tradeoff Rules
- Prefer simple synchronous flows for low-latency critical paths.
- Use asynchronous event-driven flows for decoupling and scalability.
- Keep domain consistency local; use eventual consistency across boundaries.
