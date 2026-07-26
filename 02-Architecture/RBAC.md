# Clinexa Role-Based Access Control (RBAC)

**Document Version:** 1.0 (Draft)
**Product:** Clinexa

---

# Table of Contents

1. Purpose
2. RBAC Overview
3. Design Principles
4. Roles
5. Permission Model
6. Module Permissions
7. Role Permission Matrix
8. Resource Ownership
9. Permission Evaluation
10. API Authorization
11. UI Authorization
12. Future Enhancements

---

# 1. Purpose

This document defines the authorization model for Clinexa.

It specifies:

* User roles
* Permissions
* Access rules
* Resource ownership
* Authorization strategy

This document is the source of truth for backend authorization guards and frontend feature visibility.

---

# 2. RBAC Overview

Clinexa uses **Role-Based Access Control (RBAC)**.

Every authenticated user is assigned one or more roles.

Roles grant permissions.

Permissions determine which operations can be performed on resources.

```text
User
   │
   ▼
Role
   │
   ▼
Permission
   │
   ▼
Resource
```

---

# 3. Design Principles

The authorization model follows these principles:

* Least privilege
* Explicit permission assignment
* Role independence
* Tenant-aware authorization
* Backend-enforced authorization
* Frontend visibility based on permissions
* Default deny

---

# 4. Roles

## Super Administrator

Platform-wide administrator.

Responsibilities:

* Manage clinics
* Manage subscriptions
* Manage platform configuration
* Access all tenants

---

## Clinic Administrator

Responsible for one clinic.

Responsibilities:

* Manage users
* Configure clinic
* View reports
* Configure doctors

---

## Doctor

Responsibilities:

* View assigned appointments
* Conduct consultations
* Create prescriptions
* View patient history

---

## Receptionist

Responsibilities:

* Register patients
* Schedule appointments
* Check in patients
* Generate invoices
* Record payments

---

## Nurse

Responsibilities:

* Record vitals
* Update observations
* Assist consultations

---

# 5. Permission Model

Permissions follow the format:

```text
<module>:<action>
```

Examples:

```text
patient:view
patient:create
patient:update
patient:delete

appointment:view
appointment:create
appointment:update

consultation:complete

billing:create

report:view
```

Actions include:

* view
* create
* update
* delete
* approve
* export
* assign
* complete
* cancel

---

# 6. Module Permissions

## Clinic

* clinic:view
* clinic:update

---

## Users

* user:view
* user:create
* user:update
* user:delete
* user:assignRole

---

## Patients

* patient:view
* patient:create
* patient:update
* patient:delete
* patient:export

---

## Doctors

* doctor:view
* doctor:create
* doctor:update
* doctor:delete

---

## Appointments

* appointment:view
* appointment:create
* appointment:update
* appointment:cancel
* appointment:checkin

---

## Consultations

* consultation:view
* consultation:create
* consultation:update
* consultation:complete

---

## Prescriptions

* prescription:view
* prescription:create
* prescription:update
* prescription:print

---

## Billing

* invoice:view
* invoice:create
* payment:create
* payment:refund

---

## Reports

* report:view
* report:export

---

# 7. Role Permission Matrix

| Module       | Permission | Super Admin | Clinic Admin |  Doctor  | Receptionist |   Nurse  |
| ------------ | ---------- | :---------: | :----------: | :------: | :----------: | :------: |
| Patient      | View       |      ✅      |       ✅      |     ✅    |       ✅      |     ✅    |
| Patient      | Create     |      ✅      |       ✅      |     ❌    |       ✅      |     ❌    |
| Patient      | Update     |      ✅      |       ✅      |  Limited |       ✅      |  Limited |
| Patient      | Delete     |      ✅      |    Limited   |     ❌    |       ❌      |     ❌    |
| Appointment  | View       |      ✅      |       ✅      | Assigned |       ✅      | Assigned |
| Appointment  | Create     |      ✅      |       ✅      |     ❌    |       ✅      |     ❌    |
| Consultation | Complete   |      ✅      |       ❌      |     ✅    |       ❌      |     ❌    |
| Prescription | Create     |      ✅      |       ❌      |     ✅    |       ❌      |     ❌    |
| Invoice      | Create     |      ✅      |       ✅      |     ❌    |       ✅      |     ❌    |
| Reports      | View       |      ✅      |       ✅      |  Limited |    Limited   |     ❌    |

**Limited** indicates access constrained by ownership or business rules. **Assigned** indicates access only to records assigned to that user.

---

# 8. Resource Ownership

Some permissions require ownership checks in addition to role checks.

Examples:

* Doctors may access only consultations they created.
* Nurses may access patients assigned to them where applicable.
* Receptionists may update appointments for their clinic.
* Clinic Administrators may manage only users within their own clinic.

Ownership validation is enforced after permission validation.

---

# 9. Permission Evaluation

Authorization is evaluated in the following order:

```text
Authentication
      │
      ▼
Tenant Validation
      │
      ▼
Role Validation
      │
      ▼
Permission Validation
      │
      ▼
Ownership Validation
      │
      ▼
Business Rule Validation
```

Access is granted only if every validation succeeds.

---

# 10. API Authorization

Every protected API endpoint should declare the required permission.

Example:

| Endpoint              | Permission     |
| --------------------- | -------------- |
| GET /patients         | patient:view   |
| POST /patients        | patient:create |
| PUT /patients/{id}    | patient:update |
| DELETE /patients/{id} | patient:delete |

NestJS authorization guards should evaluate permissions before executing controller logic.

---

# 11. UI Authorization

The frontend should use permissions to control:

* Navigation menus
* Buttons
* Actions
* Page access
* Form fields
* Administrative features

UI restrictions improve usability but do **not** replace backend authorization.

---

# 12. Future Enhancements

The authorization model is designed to support future capabilities such as:

* Custom roles
* Clinic-defined roles
* Permission groups
* Temporary permissions
* Attribute-Based Access Control (ABAC)
* Delegated administration
* Emergency ("break-glass") access with enhanced auditing

---

# RBAC Principles Summary

Clinexa authorization is built on the following principles:

* Every action requires explicit permission.
* Backend authorization is mandatory for all protected operations.
* Permissions are assigned through roles.
* Ownership checks complement role-based authorization.
* Tenant isolation is always enforced.
* Access is denied by default unless explicitly granted.

> **Clinexa's authorization model ensures that every user has access only to the information and functionality required to perform their responsibilities, protecting patient data while enabling efficient clinical workflows.**
