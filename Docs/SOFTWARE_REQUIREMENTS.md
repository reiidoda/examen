# Software Requirements

## Functional Requirements
- FR1: User registration, login, and password reset.
- FR2: One active examination session per user at a time.
- FR3: Session submission with answers, reflection text, and feeling metrics.
- FR4: CRUD for user categories and custom questions.
- FR5: Profile analytics and period summaries.
- FR6: Todo and journal management.
- FR7: Reminder and notification management.
- FR8: Insight endpoints for summaries and prompt suggestions.

## Non-Functional Requirements
- NFR1 Availability: 99.9 percent for core session workflow.
- NFR2 Latency: p95 under 250 ms for primary read endpoints.
- NFR3 Security: no critical unresolved vulnerabilities in production.
- NFR4 Reliability: resilient external integrations and retry policies.
- NFR5 Maintainability: modular code, typed contracts, test coverage targets.
- NFR6 Auditability: traceable changes, logs, and deployment records.

## Constraints
- Java 25 and Spring Boot backend stack.
- Angular SSR frontend stack.
- PostgreSQL persistence with migration-based schema control.
- Cloud-agnostic deployment through containers.

## Acceptance Baseline
- Functional E2E workflows pass for all tier-1 user scenarios.
- Security and performance gates pass in CI and pre-release checks.
