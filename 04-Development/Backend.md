# Clinexa Backend Development Guide

**Document Version:** 1.0 (Draft)
**Product:** Clinexa

---

# Table of Contents

1. Purpose
2. Technology Stack
3. Architectural Principles
4. Project Structure
5. Request Lifecycle
6. Module Structure
7. Dependency Injection
8. Authentication
9. Authorization
10. Multi-Tenancy
11. Database Access
12. DTOs & Validation
13. Exception Handling
14. Logging
15. Configuration Management
16. Background Jobs
17. File Storage
18. Caching
19. Testing
20. Performance Guidelines
21. Security Checklist
22. Development Workflow

---

# 1. Purpose

This document defines the backend architecture, coding practices, and development standards for Clinexa.

It serves as the primary implementation guide for developers working on the NestJS backend.

---

# 2. Technology Stack

| Component         | Technology                                 |
| ----------------- | ------------------------------------------ |
| Runtime           | Node.js (LTS)                              |
| Framework         | NestJS                                     |
| Language          | TypeScript                                 |
| ORM               | Prisma                                     |
| Database          | PostgreSQL                                 |
| Authentication    | JWT                                        |
| Validation        | class-validator, class-transformer         |
| API Documentation | Swagger (OpenAPI)                          |
| Testing           | Jest                                       |
| Logging           | NestJS Logger (extensible to Pino/Winston) |

---

# 3. Architectural Principles

The backend follows these principles:

* Modular Monolith architecture
* Feature-based modules
* Dependency Injection
* Single Responsibility Principle
* Repository abstraction through Prisma services
* Thin controllers, rich services
* Explicit DTOs
* Secure by default
* Tenant-aware data access

---

# 4. Project Structure

```text
src/
├── auth/
├── clinics/
├── users/
├── roles/
├── patients/
├── doctors/
├── appointments/
├── consultations/
├── prescriptions/
├── billing/
├── reports/
├── settings/
├── common/
│   ├── decorators/
│   ├── filters/
│   ├── guards/
│   ├── interceptors/
│   ├── middleware/
│   ├── pipes/
│   └── utils/
├── prisma/
│   ├── prisma.module.ts
│   └── prisma.service.ts
├── config/
├── app.module.ts
└── main.ts
```

Shared utilities belong under `common/`. Business logic belongs within feature modules.

---

# 5. Request Lifecycle

Every HTTP request follows the same processing pipeline.

```text
Client
   │
   ▼
Middleware
   │
   ▼
Guards (Authentication)
   │
   ▼
Guards (Authorization)
   │
   ▼
Pipes (Validation)
   │
   ▼
Controller
   │
   ▼
Service
   │
   ▼
Prisma
   │
   ▼
PostgreSQL
```

Interceptors may execute before and after the controller to support logging, response transformation, or metrics.

---

# 6. Module Structure

Each feature module follows a consistent layout.

```text
patients/
├── dto/
│   ├── create-patient.dto.ts
│   └── update-patient.dto.ts
├── entities/
├── patient.controller.ts
├── patient.service.ts
├── patient.module.ts
├── patient.repository.ts
└── tests/
```

Responsibilities:

* **Controller**: HTTP endpoints and request mapping.
* **Service**: Business rules.
* **Repository**: Database interactions.
* **DTOs**: Input and output contracts.
* **Module**: Dependency wiring.

---

# 7. Dependency Injection

Use NestJS dependency injection for all services.

Guidelines:

* Avoid manual object creation.
* Register providers in the module.
* Inject abstractions where appropriate.
* Keep constructors focused and manageable.

---

# 8. Authentication

Authentication uses JWT access tokens.

Flow:

1. User submits credentials.
2. Credentials are verified.
3. User and clinic status are validated.
4. JWT is issued.
5. JWT is verified for protected requests.

Protected routes must use authentication guards.

---

# 9. Authorization

Authorization is based on the RBAC model.

Every protected endpoint declares the required permission.

Example:

```typescript
@Permissions('patient:create')
@Post()
createPatient() {}
```

Authorization guards validate:

* Authentication
* Tenant
* Role
* Permission
* Ownership (when required)

---

# 10. Multi-Tenancy

Tenant context is derived from the authenticated JWT.

Rules:

* Never accept `clinicId` from the client.
* Automatically scope database queries.
* Restrict access to the authenticated clinic.
* Audit cross-tenant administrative actions.

---

# 11. Database Access

All database operations use Prisma.

Guidelines:

* Avoid raw SQL unless necessary.
* Use transactions for multi-step updates.
* Fetch only required fields.
* Use pagination for collections.
* Apply tenant filters consistently.

Every entity should include audit fields and support soft deletion where applicable.

---

# 12. DTOs & Validation

All incoming requests must use DTOs.

Validation should include:

* Required fields
* Type validation
* String length
* Number ranges
* Enum values
* Date validation

Enable NestJS `ValidationPipe` globally.

---

# 13. Exception Handling

Use centralized exception filters.

Guidelines:

* Return consistent error responses.
* Do not expose stack traces in production.
* Include correlation IDs when available.
* Map domain errors to appropriate HTTP status codes.

---

# 14. Logging

Log key application events, including:

* Authentication attempts
* Authorization failures
* Business events
* Exceptions
* External service calls

Avoid logging:

* Passwords
* Tokens
* Personally identifiable patient information
* Secrets

Use structured logs to support monitoring and troubleshooting.

---

# 15. Configuration Management

Store configuration in environment variables.

Typical settings include:

* Database URL
* JWT secret
* Token expiration
* SMTP settings
* Storage configuration
* Logging level

Use NestJS `ConfigModule` to centralize configuration access.

---

# 16. Background Jobs

Long-running or asynchronous tasks should execute outside the request lifecycle.

Examples:

* Email notifications
* Report generation
* Data exports
* Scheduled cleanup tasks

These should be implemented using a queue or scheduler as the application evolves.

---

# 17. File Storage

Uploaded files should:

* Be validated before storage.
* Use unique filenames.
* Store metadata in the database.
* Enforce file size and type restrictions.

Storage implementations should remain abstract to support local or cloud storage providers.

---

# 18. Caching

Introduce caching only where performance measurements justify it.

Potential candidates:

* Clinic settings
* Permission lookups
* Frequently accessed reference data

Ensure cached data respects tenant boundaries.

---

# 19. Testing

Backend testing includes:

* Unit tests for services
* Integration tests for repositories
* End-to-end tests for APIs

Use dependency injection and mocks to isolate units under test.

---

# 20. Performance Guidelines

* Use pagination for large datasets.
* Select only required columns.
* Avoid N+1 queries.
* Index frequently queried fields.
* Use database transactions appropriately.
* Monitor slow queries.

Performance optimization should be driven by measurement.

---

# 21. Security Checklist

Before merging backend code:

* Input validation implemented.
* Authentication enforced where required.
* Authorization verified.
* Tenant filtering applied.
* Sensitive data protected.
* Errors sanitized.
* Audit logging considered.
* Tests updated.

---

# 22. Development Workflow

Recommended workflow:

1. Create a feature branch.
2. Implement DTOs.
3. Implement service logic.
4. Implement controller endpoints.
5. Add validation.
6. Write tests.
7. Update API documentation.
8. Run linting and formatting.
9. Submit pull request.
10. Complete code review before merging.

---

# Backend Development Principles

The Clinexa backend is designed to be:

* Modular
* Secure
* Testable
* Tenant-aware
* Maintainable
* Consistent

Every module should follow the same architectural patterns to reduce complexity and improve developer productivity.

> **A predictable backend architecture allows developers to focus on business logic rather than framework conventions. Consistency across modules is a key objective of the Clinexa backend.**
