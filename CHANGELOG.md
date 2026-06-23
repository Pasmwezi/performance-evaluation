# Changelog

All notable changes to the Performance Evaluation App (PerfEval) will be documented in this file.

## [1.1.0] - 2026-06-23
### Added
- **Security Hardening**:
  - Migrated standard Next.js `middleware.ts` to `proxy.ts` (Next.js 16 compliant).
  - Added secure HTTP headers: Content Security Policy (CSP), HSTS, X-Frame-Options (Clickjacking protection), and Referrer-Policy.
  - Configured JWT and Session timeouts to 8 hours maxAge.
  - Added secure cookie settings in production environments.
  - Implemented in-memory sliding window IP-based rate limiting for authentication and user registration endpoints.
  - Added admin-initiated password resets with password complexity requirements.
- **Defensibility & Audit Trails**:
  - Created an immutable database-backed `AuditLog` table capturing logins, registrations, password resets, and evaluation creations.
  - Built an Admin Audit Log viewer interface with paginated and filtered view of security events.
  - Enforced a required narrative "Low Score Justification" block whenever any score is 7/20 or less.
  - Introduced the new `EVALUATOR` user role to restrict administrative actions while allowing evaluation entries.
- **Product UX & Reporting**:
  - Integrated evaluator attribution on evaluation detail sheets.
- **Engineering Quality**:
  - Configured GitHub Actions CI pipeline running linting, typechecking, Prisma schema validation, build, and tests.
  - Expanded unit test suites for rate limits, score scaling, and access policies.

## [1.0.0] - 2026-06-21
### Added
- **Core Functionality**:
  - Core dashboard list with Contractor and Consultant evaluations.
  - Dynamic interactive forms for Contractor (CPERF 2913) and Consultant evaluation sheets.
  - Automated PDF parsing module to pre-fill evaluations using uploaded CPERF PDF files.
  - Supported N/A (Not Applicable) criteria checkboxes with scaled score calculations.
  - Protected file storage with authorized downloads routing.
  - Integrated Vitest testing framework for database and parser units.
