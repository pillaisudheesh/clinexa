# Patient Management Module Specification

**Module:** Patient Management

**Version:** 1.0

---

# Table of Contents

1. Purpose
2. Scope
3. Goals
4. Actors
5. Patient Lifecycle
6. Features
7. Patient Registration
8. Patient Profile
9. Medical Information
10. Search & Identification
11. Business Rules
12. Validation Rules
13. API Endpoints
14. Database Entities
15. User Interface
16. Audit Events
17. Error Scenarios
18. Acceptance Criteria
19. Future Enhancements

---

# 1. Purpose

The Patient Management module is responsible for maintaining a complete, accurate, and secure patient record throughout the patient's relationship with the clinic.

It serves as the central source of patient demographic and clinical information used by other modules.

---

# 2. Scope

This module includes:

* Patient registration
* Patient profile management
* Contact information
* Emergency contacts
* Medical history
* Allergies
* Search and lookup
* Patient status management

This version excludes:

* National health record integration
* Biometric identification
* Patient self-service portal

---

# 3. Goals

The module should:

* Register patients quickly and accurately.
* Prevent duplicate patient records.
* Support efficient patient search.
* Maintain a longitudinal patient profile.
* Provide secure access to patient information.
* Integrate with appointments and consultations.

---

# 4. Actors

* Receptionist
* Doctor
* Nurse
* Clinic Administrator
* Super Administrator

---

# 5. Patient Lifecycle

```text
New

↓

Registered

↓

Active

↓

Inactive

↓

Archived
```

## Registered

Patient record created.

## Active

Patient can book appointments and receive care.

## Inactive

Patient has not visited for an extended period or is temporarily inactive.

## Archived

Record retained for historical and legal purposes.
No further modifications except by authorized administrators.

---

# 6. Features

## Patient Registration

Create a new patient.

Capture:

* Full name
* Date of birth
* Gender
* Mobile number
* Email (optional)
* Address
* Blood group
* Emergency contact

System-generated:

* Patient ID
* Registration date

---

## Patient Profile

Maintain demographic information.

Sections include:

* Personal information
* Contact details
* Emergency contacts
* Medical summary
* Visit history
* Billing summary

---

## Emergency Contacts

Support multiple emergency contacts.

Each contact stores:

* Name
* Relationship
* Phone number

---

## Medical Information

Record:

* Allergies
* Chronic conditions
* Current medications
* Past surgeries
* Family medical history
* Lifestyle information (optional)

---

## Search

Search by:

* Patient ID
* Name
* Mobile number
* Email
* Date of birth

Support:

* Partial matches
* Pagination
* Sorting

---

# 7. Patient Registration Workflow

```text
Receptionist

↓

Enter Patient Details

↓

Validate Information

↓

Duplicate Check

↓

Generate Patient ID

↓

Save Record

↓

Registration Complete
```

---

# 8. Patient Profile

The profile should display:

### Personal Information

* Patient ID
* Full name
* Date of birth
* Age (calculated)
* Gender
* Blood group

### Contact Information

* Mobile
* Email
* Address

### Clinical Summary

* Allergies
* Chronic illnesses
* Active medications

### Administrative Summary

* Registration date
* Last visit
* Status

---

# 9. Medical Information

Medical information should be maintained separately from demographic data to support future clinical expansion.

Examples:

* Allergies
* Diagnoses
* Surgical history
* Vaccinations (future)
* Clinical notes (consultation module)

---

# 10. Search & Identification

Every patient receives a unique Patient ID.

Format (example):

```text
PAT-2026-000123
```

Search results should display:

* Patient ID
* Name
* Age
* Gender
* Mobile
* Last visit

---

# 11. Business Rules

* Every patient belongs to one clinic.
* Patient IDs are unique within the platform.
* Duplicate detection should check combinations of name, date of birth, and mobile number.
* Archived patients cannot be modified.
* Soft delete should be used instead of permanent deletion.
* All changes must be audited.

---

# 12. Validation Rules

### Required Fields

* First name
* Last name
* Date of birth
* Gender
* Mobile number

### Optional Fields

* Email
* Blood group
* Address

### Validation

* Valid email format
* Mobile number format
* Date of birth cannot be in the future
* Age calculated automatically

---

# 13. API Endpoints

| Method | Endpoint         | Description      |
| ------ | ---------------- | ---------------- |
| GET    | /patients        | List patients    |
| POST   | /patients        | Register patient |
| GET    | /patients/{id}   | Patient details  |
| PUT    | /patients/{id}   | Update patient   |
| DELETE | /patients/{id}   | Archive patient  |
| GET    | /patients/search | Search patients  |

---

# 14. Database Entities

Primary entities:

* Patient
* PatientContact
* EmergencyContact
* PatientAllergy
* PatientMedicalHistory

Relationships:

* Patient → Appointments
* Patient → Consultations
* Patient → Prescriptions
* Patient → Invoices

---

# 15. User Interface

Primary screens:

* Patient List
* Patient Registration
* Patient Details
* Edit Patient
* Medical History
* Emergency Contacts

Patient List should provide:

* Search
* Filters
* Pagination
* Export (permission-based)

---

# 16. Audit Events

Record the following events:

* Patient created
* Patient updated
* Patient archived
* Contact updated
* Allergy added
* Allergy removed
* Medical history updated

Each event should capture:

* User
* Timestamp
* Clinic
* Action
* Entity identifier

---

# 17. Error Scenarios

Examples:

* Duplicate patient detected
* Invalid mobile number
* Invalid date of birth
* Patient not found
* Unauthorized update
* Archived patient modification attempted

Return clear, consistent error responses.

---

# 18. Acceptance Criteria

* Patients can be registered successfully.
* Duplicate detection prevents accidental duplicates.
* Patient profiles display demographic and medical summaries.
* Search returns accurate results.
* Updates are audited.
* Tenant isolation is enforced.
* Archived patients are protected from modification.

---

# 19. Future Enhancements

Potential future capabilities:

* Patient photo
* QR code / barcode identification
* National ID integration
* Insurance information
* Family grouping
* Consent management
* Patient portal access
* Document uploads
* Biometric identification
* FHIR Patient resource interoperability

---

# Module Principles

The Patient Management module is the authoritative source for patient demographic information within Clinexa.

It must provide:

* Accurate patient identification
* Secure handling of personal information
* Efficient retrieval of patient records
* Seamless integration with all clinical workflows
* Complete auditability of patient data changes

> **Every clinical interaction in Clinexa begins with a trusted patient record. The quality, integrity, and accessibility of patient data directly influence the safety and efficiency of care delivered through the platform.**
