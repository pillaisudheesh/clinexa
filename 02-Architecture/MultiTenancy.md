# Clinexa Multi-Tenant Architecture

**Document Version:** 1.0 (Draft)
**Product:** Clinexa

---

# Table of Contents

1. Purpose
2. Multi-Tenant Overview
3. Design Goals
4. Tenant Model
5. Tenant Lifecycle
6. Tenant Isolation
7. Authentication & Tenant Resolution
8. Database Strategy
9. API Tenant Handling
10. Super Administrator Access
11. Tenant Configuration
12. Backup & Recovery
13. Monitoring
14. Future Evolution

---

# 1. Purpose

This document defines the multi-tenant architecture for Clinexa.

It describes how clinics are represented, isolated, secured, and managed throughout the platform.

The document ensures that tenant isolation is consistently implemented across the frontend, backend, APIs, and database.

---

# 2. Multi-Tenant Overview

Clinexa is designed as a Software-as-a-Service (SaaS) platform.

Each clinic is treated as an independent tenant.

All tenants share:

* Application
* Backend
* Database
* Infrastructure

Each tenant owns its own:

* Patients
* Doctors
* Users
* Appointments
* Consultations
* Prescriptions
* Billing
* Reports
* Settings

No tenant should be able to access another tenant's information.

---

# 3. Design Goals

The multi-tenant architecture is designed to provide:

* Strong tenant isolation
* Low operational cost
* Centralized deployment
* Simple upgrades
* High scalability
* Secure data access
* Efficient onboarding

---

# 4. Tenant Model

A tenant represents one outpatient clinic.

Example:

```text
Clinexa Platform

├── Sunrise Clinic
├── Family Care Clinic
├── City Health Clinic
└── Green Valley Clinic
```

Each tenant has:

* Unique identifier (UUID)
* Name
* Subscription status
* Configuration
* Branding
* Time zone
* Default language
* Contact information

---

# 5. Tenant Lifecycle

Every tenant progresses through the following lifecycle.

```text
Provisioned
      │
      ▼
Active
      │
      ▼
Suspended
      │
      ▼
Archived
```

## Provisioned

* Clinic record created
* Administrator account created
* Default configuration initialized

## Active

* Normal operation
* Users can authenticate
* Data can be created and modified

## Suspended

* Login disabled
* Read-only administrative access may be permitted
* No new transactions allowed

## Archived

* Clinic no longer active
* Data retained according to retention policies
* Access disabled

---

# 6. Tenant Isolation

Tenant isolation is enforced at multiple layers.

## Database

Every tenant-specific table includes:

* clinicId

Examples:

* Patient
* Doctor
* Appointment
* Consultation
* Invoice

---

## Backend

The backend must automatically apply tenant filters to every business query.

Clients must never provide or override the tenant identifier.

Example:

```text
Authenticated User
        │
        ▼
JWT
        │
        ▼
clinicId
        │
        ▼
Backend Query
        │
        ▼
WHERE clinicId = currentUser.clinicId
```

---

## Frontend

The frontend should never expose data outside the authenticated clinic.

Clinic-specific branding and settings should be loaded after successful authentication.

---

# 7. Authentication & Tenant Resolution

Upon successful login:

1. User credentials are validated.
2. User status is verified.
3. Tenant status is verified.
4. JWT is generated.

JWT should include:

* userId
* clinicId
* roles
* tokenVersion
* expiration

The backend resolves the tenant from the authenticated token rather than trusting client input.

---

# 8. Database Strategy

Version 1 adopts a **Shared Database / Shared Schema** approach.

Benefits:

* Lower operational cost
* Simpler deployment
* Easier maintenance
* Centralized schema migrations

Every tenant-aware query must include the tenant filter.

Composite indexes should include `clinicId` where appropriate.

Examples:

* (clinicId, patientNumber)
* (clinicId, appointmentDate)
* (clinicId, doctorId)

---

# 9. API Tenant Handling

Tenant information is derived from the authenticated session.

Clients must not send:

* clinicId
* tenantId

The backend is responsible for determining the tenant context.

Every protected endpoint must:

1. Authenticate the request.
2. Resolve the tenant.
3. Apply tenant filtering.
4. Perform authorization.
5. Execute business logic.

---

# 10. Super Administrator Access

Super Administrators operate outside the standard tenant scope.

Capabilities include:

* Create clinics
* Suspend clinics
* Activate clinics
* View platform metrics
* Manage subscriptions

Cross-tenant operations should be explicitly implemented and fully audited.

---

# 11. Tenant Configuration

Each clinic maintains its own configuration.

Examples include:

* Clinic name
* Logo
* Working hours
* Appointment duration
* Queue settings
* Invoice numbering
* Prescription templates
* Time zone
* Currency
* Language

Configuration changes affect only the owning clinic.

---

# 12. Backup & Recovery

Backup procedures should preserve tenant integrity.

The platform should support:

* Scheduled database backups
* Point-in-time recovery where available
* Tenant data export
* Full platform restore

Future enhancements may include tenant-level restore capabilities if supported by the operational architecture.

---

# 13. Monitoring

Operational monitoring should include:

* Active tenants
* Suspended tenants
* Storage usage
* User counts
* Authentication failures
* API usage
* Database growth

Platform metrics should be aggregated without exposing one tenant's data to another.

---

# 14. Future Evolution

The current shared-schema architecture supports the expected scale of Clinexa.

Future enhancements may include:

* Dedicated database per tenant
* Regional deployments
* Data residency options
* Tenant-specific encryption keys
* Tenant-specific storage
* Automated tenant migration
* White-label deployments

These enhancements should be achievable without changing the application domain model.

---

# Multi-Tenant Principles

Clinexa follows these principles for multi-tenancy:

* Every clinic is treated as an independent tenant.
* Tenant isolation is enforced at the application and database layers.
* The backend determines tenant context from authenticated identity.
* Cross-tenant operations are restricted to platform administrators.
* Tenant-specific configuration and data remain isolated throughout the system.
* The architecture is designed to evolve from a shared-schema model to more isolated deployment models if future business needs require it.

> **Tenant isolation is a foundational architectural guarantee in Clinexa. Every request, query, and business operation is designed to ensure that each clinic's data remains private, secure, and logically separated from all other tenants.**
