# Clinexa Domain Model

**Document Version:** 1.0 (Draft)
**Product:** Clinexa
**Domain:** Outpatient Clinic Management Platform

---

# Table of Contents

1. Purpose
2. Domain Overview
3. Ubiquitous Language
4. Core Business Domains
5. Aggregate Roots
6. Domain Entities
7. Value Objects
8. Business Rules
9. Entity Relationships
10. State Models
11. Domain Events
12. Cross-Cutting Concepts
13. Future Domain Expansion

---

# 1. Purpose

This document defines the business domain model for Clinexa.

It provides a shared understanding of the core business concepts, their relationships, lifecycle, and rules. It serves as the bridge between the Software Requirements Specification (SRS) and the technical implementation.

The domain model should be used by product owners, developers, testers, and architects to ensure consistent terminology and behavior throughout the platform.

---

# 2. Domain Overview

Clinexa is a cloud-based platform that manages the complete outpatient journey of a patient.

The platform supports the following high-level workflow:

```text
Patient Registration
        │
        ▼
Appointment Booking
        │
        ▼
Patient Check-In
        │
        ▼
Consultation
        │
        ▼
Prescription
        │
        ▼
Billing & Payment
        │
        ▼
Follow-Up
```

Every interaction should become part of the patient's longitudinal clinical record.

---

# 3. Ubiquitous Language

The following terms have specific meanings within Clinexa and should be used consistently.

| Term                 | Meaning                                                       |
| -------------------- | ------------------------------------------------------------- |
| Clinic               | A healthcare organization using Clinexa. Represents a tenant. |
| Patient              | A person receiving medical care.                              |
| Doctor               | A licensed healthcare provider delivering consultations.      |
| Appointment          | A scheduled visit between a patient and a doctor.             |
| Consultation         | The clinical encounter during an appointment.                 |
| Prescription         | A set of medications prescribed during a consultation.        |
| Invoice              | A financial record representing services provided.            |
| Payment              | Settlement of an invoice.                                     |
| Clinic Administrator | User responsible for managing clinic operations.              |
| Super Administrator  | Platform administrator with access across all clinics.        |

These definitions should remain consistent across documentation, APIs, UI labels, and source code.

---

# 4. Core Business Domains

Clinexa is divided into the following domains.

## Platform

Responsible for platform administration.

Entities:

* Clinic
* User
* Role
* Permission

---

## Clinical

Responsible for patient care.

Entities:

* Patient
* Doctor
* Appointment
* Consultation
* Prescription

---

## Financial

Responsible for revenue management.

Entities:

* Invoice
* Invoice Item
* Payment

---

## Administration

Responsible for configuration and auditing.

Entities:

* Settings
* Notification
* Audit Log

---

# 5. Aggregate Roots

Aggregate roots own the lifecycle of related entities and enforce business rules.

## Clinic

Owns:

* Users
* Doctors
* Patients
* Appointments
* Settings

---

## Patient

Owns:

* Medical History
* Allergies
* Documents
* Emergency Contacts

---

## Appointment

Owns:

* Consultation
* Billing Reference

---

## Consultation

Owns:

* Diagnosis
* Clinical Notes
* Prescription
* Follow-Up Plan

---

## Invoice

Owns:

* Invoice Items
* Payments

Business operations affecting child entities should be performed through their aggregate root.

---

# 6. Domain Entities

## Clinic

Represents an outpatient clinic registered on the Clinexa platform.

Responsibilities:

* Maintain clinic information
* Manage users
* Configure clinic settings

---

## User

Represents an authenticated person using the system.

Responsibilities:

* Authentication
* Authorization
* Audit ownership

---

## Doctor

Represents a medical practitioner associated with a clinic.

Responsibilities:

* Conduct consultations
* Maintain availability
* Issue prescriptions

---

## Patient

Represents an individual receiving medical care.

Responsibilities:

* Maintain demographic information
* Maintain clinical history
* Participate in appointments

---

## Appointment

Represents a scheduled interaction between a patient and a doctor.

Responsibilities:

* Scheduling
* Queue management
* Consultation initiation

---

## Consultation

Represents the clinical encounter.

Responsibilities:

* Capture symptoms
* Record diagnosis
* Record observations
* Generate prescriptions

---

## Prescription

Represents medication prescribed during a consultation.

Responsibilities:

* Medicine selection
* Dosage instructions
* Treatment duration

---

## Invoice

Represents billable services.

Responsibilities:

* Calculate charges
* Record payments
* Track outstanding balance

---

# 7. Value Objects

Value objects describe attributes that have meaning but no independent identity.

Examples include:

* Address
* Contact Information
* Money
* Time Slot
* Vital Signs
* Blood Pressure
* Temperature
* Height
* Weight
* Body Mass Index (BMI)

Value objects should be immutable wherever practical.

---

# 8. Business Rules

## Clinic

* Every clinic is isolated from other clinics.
* Clinic data cannot be accessed by another clinic.

---

## User

* Every user belongs to exactly one clinic.
* A user may have one or more roles.
* Authentication is required before accessing protected resources.

---

## Patient

* A patient belongs to one clinic.
* Patient mobile numbers should be unique within a clinic.
* Date of birth cannot be in the future.
* Patients with clinical records cannot be permanently deleted.

---

## Doctor

* Doctors may define working schedules.
* Doctors cannot be assigned overlapping appointments.
* Doctors may be temporarily unavailable due to leave.

---

## Appointment

* An appointment belongs to one patient.
* An appointment belongs to one doctor.
* Appointment time must be within the doctor's schedule.
* Cancelled appointments cannot transition directly to completed.

---

## Consultation

* Consultations require a valid appointment.
* Only the assigned doctor can finalize a consultation.
* Finalized consultations should not be modified without audit tracking.

---

## Prescription

* Prescriptions require an associated consultation.
* At least one medication must be included before finalization.

---

## Invoice

* Invoice totals must equal the sum of invoice items.
* Payments cannot exceed the outstanding balance.
* Fully paid invoices cannot receive additional payments unless a refund process exists.

---

# 9. Entity Relationships

High-level relationships include:

* One Clinic → Many Users
* One Clinic → Many Doctors
* One Clinic → Many Patients
* One Patient → Many Appointments
* One Doctor → Many Appointments
* One Appointment → One Consultation
* One Consultation → One Prescription
* One Invoice → Many Invoice Items
* One Invoice → Many Payments

Detailed entity relationship diagrams are documented in the Database Design document.

---

# 10. State Models

## Appointment Lifecycle

```text
Scheduled
    │
    ▼
Checked In
    │
    ▼
In Consultation
    │
    ▼
Completed
```

Alternative transitions:

```text
Scheduled
    │
    ├──► Cancelled
    └──► No Show
```

---

## Invoice Lifecycle

```text
Draft
   │
   ▼
Issued
   │
   ▼
Partially Paid
   │
   ▼
Paid
```

Alternative transition:

```text
Issued
   │
   ▼
Voided
```

---

# 11. Domain Events

The following events represent meaningful business actions.

* ClinicCreated
* UserCreated
* PatientRegistered
* AppointmentBooked
* AppointmentCancelled
* PatientCheckedIn
* ConsultationStarted
* ConsultationCompleted
* PrescriptionIssued
* InvoiceGenerated
* PaymentReceived

These events may later support notifications, integrations, analytics, and audit processing.

---

# 12. Cross-Cutting Concepts

## Multi-Tenancy

Every business entity is associated with a clinic.

Tenant isolation is enforced at the application and database levels.

---

## Auditability

Business actions should be traceable through centralized audit logging.

---

## Soft Delete

Clinical and financial records should be retained through soft deletion where applicable.

---

## Security

Role-Based Access Control (RBAC) governs access to system functionality.

Sensitive patient information must only be accessible to authorized users.

---

# 13. Future Domain Expansion

The domain model has been designed to accommodate future healthcare modules, including:

* Laboratory
* Radiology
* Pharmacy
* Inventory Management
* Insurance Claims
* Telemedicine
* Patient Portal
* AI Clinical Assistant
* Appointment Reminders
* Electronic Health Record (EHR) integrations

Future modules should integrate with the existing aggregates and business rules while maintaining tenant isolation and data integrity.

---

# Domain Model Principles

The Clinexa domain model is guided by the following principles:

* Use a shared business vocabulary across the organization.
* Model real-world clinical workflows rather than database tables.
* Keep business rules close to the entities that own them.
* Preserve patient history and clinical integrity.
* Design for extensibility without introducing unnecessary complexity.
* Ensure every business operation is traceable and secure.

> **Clinexa models healthcare around the patient journey, ensuring that every business decision, workflow, and technical implementation supports safe, efficient, and consistent outpatient care.**
