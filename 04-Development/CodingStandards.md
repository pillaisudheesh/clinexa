# Clinexa Coding Standards

**Document Version:** 1.0 (Draft)
**Product:** Clinexa

---

# Table of Contents

1. Purpose
2. General Principles
3. Project Structure
4. Naming Conventions
5. TypeScript Standards
6. React Standards
7. NestJS Standards
8. Prisma Standards
9. API Standards
10. Error Handling
11. Logging
12. Validation
13. Testing Standards
14. Git Standards
15. Code Review Checklist
16. Performance Guidelines
17. Security Guidelines
18. Documentation Standards

---

# 1. Purpose

This document defines the coding standards for the Clinexa platform.

The objective is to maintain a clean, consistent, secure, and maintainable codebase across all components of the application.

These standards apply to all contributors.

---

# 2. General Principles

Every contribution should follow these principles:

* Write readable code before clever code.
* Prefer simplicity over premature optimization.
* Keep business logic within feature modules.
* Avoid duplicated code.
* Design for maintainability.
* Keep functions focused on a single responsibility.
* Favor composition over inheritance.
* Write self-documenting code.

---

# 3. Project Structure

Frontend

```text
src/
├── app/
├── components/
├── hooks/
├── layouts/
├── modules/
├── services/
├── types/
├── utils/
└── styles/
```

Backend

```text
src/
├── auth/
├── clinics/
├── users/
├── doctors/
├── patients/
├── appointments/
├── consultations/
├── prescriptions/
├── billing/
├── reports/
├── shared/
└── common/
```

Every feature should be isolated within its own module.

---

# 4. Naming Conventions

## Files

Use kebab-case.

Examples:

```text
patient.service.ts
appointment.controller.ts
doctor-card.tsx
```

---

## Classes

Use PascalCase.

Examples:

```typescript
PatientService
AppointmentController
DoctorRepository
```

---

## Interfaces

Prefix interfaces with `I` only when they represent domain contracts shared across modules; otherwise, prefer descriptive type aliases or interfaces without prefixes.

Examples:

```typescript
Patient
CreatePatientRequest
AppointmentSummary
```

---

## Variables

Use camelCase.

Examples:

```typescript
patientId
appointmentDate
consultationStatus
```

---

## Constants

Use UPPER_SNAKE_CASE.

Examples:

```typescript
MAX_APPOINTMENTS_PER_DAY
DEFAULT_PAGE_SIZE
```

---

# 5. TypeScript Standards

* Enable `strict` mode.
* Avoid the `any` type.
* Prefer explicit return types for exported functions.
* Use enums sparingly; prefer string union types when appropriate.
* Use readonly properties for immutable values.
* Prefer async/await over Promise chains.

Example:

```typescript
async function getPatient(id: string): Promise<Patient> {
  return patientRepository.findById(id);
}
```

---

# 6. React Standards

* Use functional components only.
* Use hooks instead of class components.
* Keep components focused on a single responsibility.
* Extract reusable UI into shared components.
* Avoid inline functions in frequently rendered lists when practical.
* Keep business logic out of UI components.

Example folder structure:

```text
modules/
└── patients/
    ├── pages/
    ├── components/
    ├── hooks/
    ├── services/
    └── types/
```

---

# 7. NestJS Standards

Each feature module should contain:

```text
patients/
├── patient.controller.ts
├── patient.service.ts
├── patient.module.ts
├── dto/
├── entities/
├── repositories/
└── tests/
```

Guidelines:

* Controllers handle HTTP concerns only.
* Services contain business logic.
* Repositories encapsulate data access.
* DTOs define API contracts.
* Validation is performed before business logic.

---

# 8. Prisma Standards

* Use Prisma Client for all database access.
* Avoid raw SQL unless justified and reviewed.
* Use transactions for multi-step updates.
* Define meaningful relations in the schema.
* Use UUID primary keys.

Every entity should include audit fields where applicable:

* createdAt
* updatedAt
* createdBy
* updatedBy

---

# 9. API Standards

* Use RESTful endpoints.
* Return consistent response structures.
* Validate all incoming requests.
* Use appropriate HTTP status codes.
* Version APIs using `/api/v1`.

Avoid exposing internal implementation details in responses.

---

# 10. Error Handling

* Throw domain-specific exceptions.
* Do not expose stack traces in production.
* Use centralized exception filters.
* Return consistent error responses.

Every error should include:

* Error code
* Message
* Correlation ID (when available)

---

# 11. Logging

Log:

* Authentication events
* Authorization failures
* Business events
* Exceptions
* External service failures

Never log:

* Passwords
* Tokens
* Sensitive patient data

Use structured logging to support filtering and monitoring.

---

# 12. Validation

Validate all external input.

Frontend:

* React Hook Form
* Zod

Backend:

* class-validator
* DTO validation
* Global ValidationPipe

Validation should occur before business logic execution.

---

# 13. Testing Standards

Testing pyramid:

* Unit Tests
* Integration Tests
* End-to-End Tests

Minimum expectations:

* Business logic should have unit tests.
* Critical workflows should have integration tests.
* Authentication and authorization should have end-to-end tests.

---

# 14. Git Standards

Branch naming:

```text
feature/patient-management
bugfix/login-timeout
hotfix/invoice-calculation
docs/security-document
```

Commit messages should follow the Conventional Commits specification.

Examples:

```text
feat(patient): add patient registration

fix(auth): resolve token expiration issue

docs(api): update appointment endpoints
```

---

# 15. Code Review Checklist

Before approving a pull request, reviewers should verify:

* Code follows naming conventions.
* Tests are included or updated.
* Documentation is updated where required.
* Security implications have been considered.
* Validation is implemented.
* Error handling is appropriate.
* Logging is sufficient.
* No sensitive information is exposed.
* Performance impact has been considered.

---

# 16. Performance Guidelines

* Avoid unnecessary database queries.
* Use pagination for list endpoints.
* Select only required fields.
* Index frequently queried columns.
* Avoid N+1 query patterns.
* Lazy-load frontend modules where appropriate.

Measure performance before optimizing.

---

# 17. Security Guidelines

* Validate all input.
* Never trust client-provided identifiers.
* Enforce tenant isolation.
* Enforce RBAC.
* Escape or sanitize user input where applicable.
* Store secrets outside source control.
* Keep dependencies up to date.

---

# 18. Documentation Standards

Documentation must be updated when changes affect:

* Architecture
* APIs
* Database schema
* Security
* Deployment
* User workflows

Public APIs should include OpenAPI documentation.

Major architectural decisions should be recorded as ADRs.

---

# Coding Principles Summary

Every contribution to Clinexa should strive to be:

* Readable
* Consistent
* Secure
* Tested
* Documented
* Maintainable
* Modular

Code quality is a shared responsibility. Every pull request should improve or preserve the health of the codebase.

> **Clinexa values maintainable software over clever software. Consistent coding standards enable faster development, safer changes, and a codebase that remains understandable as the platform grows.**
