# Software Configuration Management

## Source Control
- Trunk-based integration with short-lived feature branches.
- Protected default branch with required checks.
- Conventional commit semantics for release readability.

## Build and Release
- Deterministic CI build pipeline for backend and frontend.
- Artifact versioning with immutable references.
- Promotion path: dev -> staging -> production.

## Environment Management
- Environment-specific variables stored in secret managers.
- Infrastructure definitions version-controlled with change reviews.
- Drift detection between desired and deployed state.

## Release Governance
- Release checklist covering tests, security scan, and rollback plan.
- Rollback strategy documented per service.
- Post-release verification and incident review.
