# Clinexa Database Design

**Document Version:** 1.0 (Draft)

**Product:** Clinexa

**Database:** PostgreSQL

**ORM:** Prisma

---

# Table of Contents

1. Purpose
2. Database Overview
3. Design Principles
4. Multi-Tenant Strategy
5. Data Classification
6. Standard Entity Structure
7. Audit Strategy
8. Soft Delete Strategy
9. Entity Modules
10. Entity Relationships
11. Indexing Strategy
12. Naming Standards
13. Future Expansion

---

# 1. Purpose

This document defines the logical database architecture for Clinexa.

It serves as the single source of truth for:

* Entity design
* Relationships
* Naming conventions
* Multi-tenancy
* Audit strategy
* Performance guidelines
* Future extensibility

---

# 2. Database Overview

Clinexa uses **PostgreSQL** as its primary relational database.

The application follows a **Shared Database / Shared Schema** multi-tenant architecture.

Each clinic is treated as an independent tenant while sharing the same database schema.

Tenant isolation is achieved through the use of a **clinicId** foreign key across tenant-specific entities.

---

# 3. Design Principles

The database shall follow these principles.

## 3.1 Multi-Tenant by Design

Every tenant-specific entity shall reference a clinic.

---

## 3.2 Normalized Data

The schema shall follow Third Normal Form (3NF) where practical to reduce duplication and improve consistency.

---

## 3.3 UUID Primary Keys

Every primary key shall use UUID instead of auto-increment integers.

Benefits include:

* Better security
* Easier data migration
* Global uniqueness
* Distributed system compatibility

---

## 3.4 Referential Integrity

Foreign key relationships shall enforce data consistency.

Cascade deletes shall be avoided for transactional medical data.

---

## 3.5 Immutable Clinical Records

Clinical records should never be physically deleted.

Changes must be traceable through audit logging.

---

# 4. Multi-Tenant Strategy

Clinexa uses a **Shared Database / Shared Schema** architecture.

Example:

```text
Clinic A
 ├── Patients
 ├── Doctors
 └── Appointments

Clinic B
 ├── Patients
 ├── Doctors
 └── Appointments
```

Each record contains a `clinicId` that identifies its owning clinic.

Application services must automatically scope queries to the authenticated user's clinic unless the user has Super Administrator privileges.

---

# 5. Data Classification

## Core Data

* Clinic
* User
* Role
* Permission

---

## Master Data

* Doctor
* Specialization
* Medicine
* Payment Method

---

## Transactional Data

* Patient
* Appointment
* Consultation
* Prescription
* Invoice
* Payment

---

## Configuration Data

* Settings
* Notification Templates

---

## Audit Data

* Audit Log
* Login History

---

# 6. Standard Entity Structure

Every tenant-specific business entity shall contain the following fields where applicable.

| Field     | Purpose                          |
| --------- | -------------------------------- |
| id        | Primary Key (UUID)               |
| clinicId  | Tenant Identifier                |
| createdAt | Record Creation Time             |
| createdBy | User who created the record      |
| updatedAt | Last Update Time                 |
| updatedBy | User who last updated the record |
| isDeleted | Soft Delete Flag                 |
| deletedAt | Soft Delete Timestamp            |

This provides:

* Tenant isolation
* Auditability
* Soft delete support
* Consistent entity structure

---

# 7. Audit Strategy

Clinexa maintains a centralized Audit Log.

Audit records should capture:

* User
* Clinic
* Entity
* Action
* Previous Value (where appropriate)
* New Value (where appropriate)
* Timestamp
* IP Address (optional)
* Device Information (optional)

Examples of audited actions:

* Patient created
* Appointment cancelled
* Prescription updated
* Invoice generated
* User login

---

# 8. Soft Delete Strategy

Transactional records shall not be permanently deleted.

Instead:

* isDeleted = true
* deletedAt = current timestamp

Queries should ignore soft-deleted records unless explicitly requested.

Medical records should remain recoverable for audit and legal purposes.

---

# 9. Entity Modules

## Core

* Clinic
* User
* Role
* Permission
* UserRole

---

## Patient Management

* Patient
* EmergencyContact
* PatientDocument
* PatientAllergy
* PatientMedicalHistory

---

## Doctor Management

* Doctor
* DoctorSchedule
* DoctorLeave
* DoctorSpecialization

---

## Appointment Management

* Appointment
* AppointmentStatusHistory
* Token

---

## Consultation

* Consultation
* Vitals
* Diagnosis
* ClinicalNote
* FollowUp

---

## Prescription

* Prescription
* PrescriptionItem
* Medicine
* MedicineCategory

---

## Billing

* Invoice
* InvoiceItem
* Payment
* PaymentMethod

---

## Administration

* Settings
* AuditLog
* Notification

---

# 10. Entity Relationships

High-level relationships:

* One Clinic → Many Users
* One Clinic → Many Doctors
* One Clinic → Many Patients
* One Patient → Many Appointments
* One Appointment → One Consultation
* One Consultation → One Prescription
* One Invoice → Many Invoice Items
* One Invoice → One or Many Payments

Detailed ER diagrams will be added in future revisions.

---

# 11. Indexing Strategy

Indexes should be created on frequently queried fields.

Recommended indexes include:

* clinicId
* patientNumber
* phone
* doctorId
* appointmentDate
* invoiceNumber
* email
* username

Composite indexes may be used where appropriate, for example:

* (clinicId, patientNumber)
* (clinicId, appointmentDate)
* (clinicId, doctorId)

---

# 12. Naming Standards

## Tables

Use singular nouns.

Examples:

* Patient
* Doctor
* Appointment

---

## Columns

Use camelCase.

Examples:

* clinicId
* createdAt
* updatedBy

---

## Foreign Keys

Use the referenced entity name followed by "Id".

Examples:

* clinicId
* patientId
* doctorId
* appointmentId

---

## Junction Tables

Use descriptive names.

Examples:

* UserRole
* DoctorSpecialization

---

# 13. Future Expansion

The database design should support future modules without requiring changes to the core entities.

Planned modules include:

* Laboratory
* Pharmacy
* Inventory
* Radiology
* Telemedicine
* Patient Portal
* AI Clinical Assistant
* Mobile Applications

These modules should integrate through well-defined relationships while preserving the integrity of the core clinical data model.

---

# Database Design Philosophy

Clinexa follows these guiding principles:

* Design for scalability from day one.
* Keep tenant data securely isolated.
* Preserve clinical history through audit and soft-delete mechanisms.
* Normalize data while avoiding unnecessary complexity.
* Build reusable, extensible entities that support future healthcare modules.

> **A well-designed database is the foundation of a reliable healthcare platform.**
