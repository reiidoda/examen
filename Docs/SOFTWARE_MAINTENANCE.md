# Software Maintenance

## Maintainability Strategy
- Keep architecture decision records current.
- Refactor in small increments with regression tests.
- Enforce coding standards and API consistency.

## Consistency
- Strong consistency for single-context writes.
- Eventual consistency for cross-context derived views.
- Reconciliation jobs for long-running distributed workflows.

## Availability and Reliability
- Redundant deployment topology with health-based routing.
- Failure isolation using bulkheads and timeout policies.
- SLO monitoring with proactive alerting and runbooks.

## Operability
- Incident management process with severity tiers.
- Post-incident reviews and permanent corrective actions.
- Capacity planning using observed growth and seasonal patterns.

## Lifecycle Maintenance
- Dependency patch cadence and security patch SLAs.
- Schema migration compatibility and rollback planning.
- Data archival and retention to control operational cost.
