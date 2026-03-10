# API Design and Security

## API Design Guidelines
- Resource-oriented URLs with clear ownership boundaries.
- Stable contracts through versioning policy.
- Strong request and response schemas.
- Pagination, filtering, and sorting for list endpoints.
- Idempotency keys for retriable mutating operations.

## Error Model
- Typed error envelope with machine-readable codes.
- Distinction between validation, authorization, not-found, and conflict errors.
- Correlation IDs for traceability.

## Security Controls
- Authentication: JWT bearer tokens with strict validation.
- Authorization: role and ownership checks.
- Input protection: whitelist validation and payload size guards.
- Transport security: TLS-only and HSTS at edge.
- Secret management: environment-backed secrets and rotation policies.

## OWASP API Security Alignment
- API1 BOLA: strict object ownership enforcement.
- API2 Auth: token validation and least privilege.
- API3 Excessive data exposure: DTO boundary and field-level filtering.
- API4 Resource consumption: rate limits and quotas.
- API8 Security misconfiguration: hardened defaults and automation checks.

## Operational Security
- Audit logs for sensitive actions.
- Abuse detection on auth and write-heavy routes.
- Continuous dependency vulnerability scanning.
- Incident playbooks for token leakage and endpoint abuse.
