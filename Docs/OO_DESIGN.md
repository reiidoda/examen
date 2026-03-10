# Object-Oriented Design

## Design Goals
- Keep domain rules explicit and centralized.
- Minimize coupling between transport and domain models.
- Maintain testability through dependency inversion.

## Core Aggregates
- `User`: owner aggregate for user-scoped entities.
- `ExaminationSession`: lifecycle aggregate for daily reflection.
- `Question` and `Category`: catalog aggregate.
- `UserSettings`: policy aggregate for reminders and preferences.

## OO Principles Applied
- Single responsibility: controllers only orchestrate request-response behavior.
- Open/closed: strategy abstractions for pluggable insight providers.
- Liskov substitution: interfaces used for service contracts.
- Interface segregation: narrow repository and client interfaces.
- Dependency inversion: core services depend on abstractions.

## Collaboration Contracts
- Service-to-repository interactions remain transactional.
- DTO mapping boundaries prevent accidental domain exposure.
- Validation and authorization are explicit preconditions.

## Refactoring Guidance
- Extract domain services when behavior appears in multiple service classes.
- Keep aggregate invariants enforced in one place.
- Avoid utility classes that hide business meaning.
