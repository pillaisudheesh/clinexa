# Clinexa Master Data Management (MDM)

**Document Version:** 1.0 (Draft)

**Product:** Clinexa

---

# Table of Contents

1. Purpose
2. Scope
3. Design Principles
4. Master Data Categories
5. Reference Data Model
6. Clinic-Level vs Platform-Level Data
7. Versioning
8. Lifecycle
9. API Design
10. Security
11. Audit Requirements
12. Future Enhancements

---

# 1. Purpose

Master Data Management (MDM) provides a centralized mechanism for managing reference data used throughout Clinexa.

Instead of storing free-text values in transactional records, modules reference standardized master data.

Examples include:

* Blood Groups
* Departments
* Doctor Specializations
* Consultation Types
* Payment Methods

---

# 2. Scope

Master Data includes:

* Clinical reference data
* Administrative reference data
* Financial reference data
* Geographic reference data
* System configuration lists

It excludes transactional data such as patients, appointments, invoices, and consultations.

---

# 3. Design Principles

The master data system should be:

* Centralized
* Configurable
* Reusable
* Auditable
* Tenant-aware where applicable
* Extensible

---

# 4. Master Data Categories

## Clinical

* Departments
* Medical Specializations
* Consultation Types
* Allergy Types
* Diagnosis Categories
* Medication Routes
* Medication Frequencies
* Units of Measure
* Laboratory Test Categories (future)

---

## Patient

* Blood Groups
* Gender
* Marital Status
* Occupation
* Nationality
* Languages

---

## Administrative

* Countries
* States / Provinces
* Cities
* Time Zones
* Clinic Types

---

## Appointment

* Appointment Status
* Appointment Type
* Visit Type
* Cancellation Reason
* Queue Status

---

## Billing

* Payment Methods
* Invoice Status
* Tax Categories
* Discount Types

---

## User Management

* User Roles
* Permission Groups
* Account Status

---

# 5. Reference Data Model

Every master data entity follows a common structure.

| Field        | Description                  |
| ------------ | ---------------------------- |
| id           | UUID                         |
| category     | Logical grouping             |
| code         | Unique business code         |
| name         | Display name                 |
| description  | Optional explanation         |
| isActive     | Availability flag            |
| displayOrder | UI ordering                  |
| clinicId     | Null for platform-level data |
| createdAt    | Creation timestamp           |
| updatedAt    | Last update timestamp        |

---

# 6. Clinic-Level vs Platform-Level Data

## Platform-Level

Shared by every clinic.

Examples:

* Blood Groups
* Countries
* Payment Methods
* Units of Measure

These values are managed only by Super Administrators.

---

## Clinic-Level

Specific to an individual clinic.

Examples:

* Departments
* Consultation Types
* Doctor Specializations
* Appointment Types
* Invoice Number Prefixes

Clinic Administrators manage these values.

---

# 7. Versioning

Reference data should support:

* Activation
* Deactivation
* Soft deletion
* Historical references

Transactional records should continue to reference inactive values for historical accuracy.

---

# 8. Lifecycle

```text
Create

↓

Active

↓

Inactive

↓

Archived
```

Inactive values cannot be selected for new records but remain visible on existing records.

---

# 9. API Design

Typical endpoints:

| Method | Endpoint                | Description     |
| ------ | ----------------------- | --------------- |
| GET    | /master-data            | List categories |
| GET    | /master-data/{category} | List values     |
| POST   | /master-data/{category} | Create value    |
| PUT    | /master-data/{id}       | Update value    |
| DELETE | /master-data/{id}       | Archive value   |

---

# 10. Security

Platform-level data:

* Super Administrator only

Clinic-level data:

* Clinic Administrator
* Super Administrator

All modifications require authorization and audit logging.

---

# 11. Audit Requirements

Audit events include:

* Value created
* Value updated
* Value activated
* Value deactivated
* Value archived

Audit records should capture:

* User
* Clinic
* Timestamp
* Category
* Previous value
* New value

---

# 12. Future Enhancements

Future capabilities may include:

* Bulk import/export
* Localization and multilingual labels
* Effective date ranges
* Tenant-specific overrides of platform defaults
* External terminology integration (e.g., ICD-10, SNOMED CT, LOINC)
* API caching for frequently used reference data

---

# Master Data Principles

Master data is the authoritative source for reusable reference values across Clinexa.

It ensures:

* Consistent terminology
* Reliable reporting
* Easier maintenance
* Configurable business rules
* Reduced duplication

> **Centralized master data improves data quality, simplifies administration, and ensures that every module in Clinexa uses a consistent vocabulary and set of reference values.**
