# Clinexa System Architecture

**Document Version:** 1.0 (Draft)
**Product:** Clinexa
**Architecture Style:** Modular Monolith
**Prepared By:** Clinexa Product Team

---

# Table of Contents

1. Purpose
2. Architectural Goals
3. Guiding Principles
4. System Overview
5. High-Level Architecture
6. Frontend Architecture
7. Backend Architecture
8. Database Architecture
9. Authentication & Authorization
10. Multi-Tenant Architecture
11. API Architecture
12. Application Modules
13. Security Architecture
14. Logging & Monitoring
15. Deployment Architecture
16. Scalability Strategy
17. Future Architecture

---

# 1. Purpose

This document defines the overall system architecture for Clinexa.

It describes the architectural style, major components, communication patterns, security model, deployment strategy, and design principles that guide the development of the platform.

---

# 2. Architectural Goals

The architecture is designed to achieve the following goals:

* Simplicity
* Scalability
* Maintainability
* Security
* High Performance
* Tenant Isolation
* Extensibility
* Cloud Readiness
* Mobile-First User Experience

---

# 3. Guiding Principles

## Feature-First Design

The application is organized around business domains rather than technical layers.

Examples:

* Patient Management
* Appointment Management
* Consultation
* Billing

---

## Modular Architecture

Each feature is implemented as an independent module with clear boundaries.

Modules should have minimal coupling and communicate through well-defined interfaces.

---

## API-First Development

REST APIs are designed before frontend implementation to ensure a consistent contract between client and server.

---

## Security by Default

Every API endpoint is authenticated unless explicitly marked as public.

Role-based authorization is enforced at the service boundary.

---

## Tenant Isolation by Default

All tenant-specific data access is scoped to the authenticated clinic.

Cross-tenant access is permitted only for platform-level administrative operations.

---

## Documentation as Code

Architecture, APIs, database design, and operational decisions should be maintained alongside the source code and updated as the system evolves.

---

# 4. System Overview

Clinexa is implemented as a cloud-ready modular monolith.

The application consists of:

* React Web Application (Progressive Web App)
* NestJS REST API
* PostgreSQL Database
* Prisma ORM

The frontend communicates with the backend through secure REST APIs over HTTPS.

---

# 5. High-Level Architecture

```text
+------------------------------------------------------+
|                  React PWA (Webpack)                 |
+--------------------------+---------------------------+
                           |
                           | HTTPS / REST
                           v
+------------------------------------------------------+
|                  NestJS Application                  |
|------------------------------------------------------|
| Auth | Clinic | Users | Patients | Doctors | Billing |
| Appointments | Consultation | Reports | Shared       |
+--------------------------+---------------------------+
                           |
                           | Prisma ORM
                           v
+------------------------------------------------------+
|                 PostgreSQL Database                  |
+------------------------------------------------------+
```

---

# 6. Frontend Architecture

The frontend is developed using:

* React
* TypeScript
* Webpack
* Tailwind CSS
* React Router
* TanStack Query
* React Hook Form
* Zod
* Axios

Recommended structure:

```text
src/
├── app/
├── components/
├── layouts/
├── modules/
│   ├── auth/
│   ├── patients/
│   ├── doctors/
│   ├── appointments/
│   ├── consultations/
│   ├── prescriptions/
│   ├── billing/
│   └── reports/
├── hooks/
├── services/
├── utils/
└── types/
```

Shared UI components should be reusable across all modules.

---

# 7. Backend Architecture

The backend is implemented using NestJS with a modular architecture.

Recommended module structure:

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
├── shared/
└── common/
```

Each module should contain:

* Controller
* Service
* DTOs
* Validation
* Repository / Data Access
* Tests

Modules communicate through services rather than directly accessing each other's data.

---

# 8. Database Architecture

Clinexa uses PostgreSQL with Prisma ORM.

Key characteristics:

* Shared database
* Shared schema
* UUID primary keys
* Foreign key constraints
* Soft delete for business entities
* Audit logging
* Indexed tenant-specific queries

Refer to the Database Design document for detailed entity definitions.

---

# 9. Authentication & Authorization

Authentication:

* JWT-based authentication
* Secure password hashing
* Refresh token support (planned)

Authorization:

* Role-Based Access Control (RBAC)
* Permission-based feature access
* Tenant-aware authorization

Typical request flow:

```text
User Login
      │
      ▼
JWT Issued
      │
      ▼
Authenticated Request
      │
      ▼
Role Validation
      │
      ▼
Tenant Validation
      │
      ▼
Business Logic
```

---

# 10. Multi-Tenant Architecture

Clinexa uses a shared database with tenant isolation.

Each tenant-specific record includes a `clinicId`.

Application services automatically scope all queries to the authenticated clinic.

Benefits:

* Lower infrastructure cost
* Easier maintenance
* Centralized deployment
* Simplified upgrades

---

# 11. API Architecture

Clinexa exposes REST APIs.

API principles:

* Resource-oriented endpoints
* JSON request/response format
* Versioned APIs
* Standard HTTP status codes
* Consistent error handling

Example endpoint structure:

```text
/api/v1/auth
/api/v1/patients
/api/v1/doctors
/api/v1/appointments
/api/v1/consultations
/api/v1/billing
```

---

# 12. Application Modules

## Core Modules

* Authentication
* Clinic Management
* User Management
* Roles & Permissions

## Clinical Modules

* Patient Management
* Doctor Management
* Appointment Scheduling
* Consultation
* Prescription

## Administrative Modules

* Billing
* Reports
* Settings
* Notifications

Each module should be independently testable and maintain clear ownership of its business logic.

---

# 13. Security Architecture

Clinexa follows a defense-in-depth approach.

Security measures include:

* HTTPS for all communication
* JWT authentication
* RBAC authorization
* Tenant isolation
* Password hashing
* Input validation
* Audit logging
* Secure HTTP headers
* Rate limiting (planned)

Sensitive patient data should never be exposed outside authorized contexts.

---

# 14. Logging & Monitoring

Application logging should include:

* Authentication events
* API requests
* Exceptions
* Database errors
* Business events

Future monitoring integrations may include:

* OpenTelemetry
* Grafana
* Prometheus
* Centralized log aggregation

---

# 15. Deployment Architecture

Initial deployment targets:

Frontend:

* Vercel

Backend:

* Render

Database:

* Neon PostgreSQL

Deployment characteristics:

* HTTPS
* Environment-based configuration
* Automated CI/CD
* Daily database backups (where supported)
* Health check endpoints

---

# 16. Scalability Strategy

Version 1 focuses on a modular monolith.

Scalability is achieved through:

* Stateless backend services
* Optimized database indexes
* Efficient API design
* Modular feature boundaries

As the platform grows, individual modules can be extracted into independent services if operational requirements justify the added complexity.

---

# 17. Future Architecture

Planned architectural enhancements include:

* AI Clinical Assistant
* Notification Service
* Reporting Service
* Public API Gateway
* Mobile Applications
* Patient Portal
* Telemedicine
* Laboratory Integration
* Pharmacy Integration

These capabilities should build upon the existing modular architecture without requiring changes to the core clinical workflows.

---

# Architecture Principles Summary

* Build simple solutions first.
* Optimize only when necessary.
* Keep business logic within feature modules.
* Enforce tenant isolation throughout the stack.
* Favor composition over duplication.
* Treat documentation as part of the product.
* Design with future growth in mind, while avoiding unnecessary complexity in the present.

> **Clinexa is designed as a cloud-native, secure, and extensible outpatient clinic platform where modular design, tenant isolation, and maintainability are foundational architectural principles.**
