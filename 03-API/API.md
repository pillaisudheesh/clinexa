# Clinexa API Specification

**Document Version:** 1.0 (Draft)
**Product:** Clinexa
**API Style:** REST
**Format:** JSON over HTTPS
**Authentication:** JWT Bearer Token

---

# Table of Contents

1. Purpose
2. API Design Principles
3. Base URL
4. Authentication
5. Authorization
6. Standard Request Headers
7. Standard Response Format
8. Error Response Format
9. Pagination
10. Filtering & Sorting
11. API Versioning
12. Endpoint Specifications
13. Common HTTP Status Codes
14. Rate Limiting
15. API Security
16. Future Enhancements

---

# 1. Purpose

This document defines the REST API standards and endpoint specifications for Clinexa.

It serves as the contract between frontend and backend teams, ensuring consistency across all modules.

---

# 2. API Design Principles

The Clinexa APIs follow these principles:

* RESTful resource design
* JSON request and response bodies
* Stateless communication
* Versioned endpoints
* Consistent response structure
* Secure by default
* Tenant-aware operations
* Idempotent updates where applicable

---

# 3. Base URL

Development

```text
http://localhost:3000/api/v1
```

Production

```text
https://api.clinexa.com/api/v1
```

---

# 4. Authentication

Protected endpoints require a JWT Bearer Token.

Example:

```http
Authorization: Bearer <access_token>
```

Authentication endpoints:

| Method | Endpoint              | Description            |
| ------ | --------------------- | ---------------------- |
| POST   | /auth/login           | Authenticate user      |
| POST   | /auth/logout          | Logout current user    |
| POST   | /auth/refresh         | Refresh access token   |
| POST   | /auth/forgot-password | Request password reset |
| POST   | /auth/reset-password  | Reset password         |

---

# 5. Authorization

Role-Based Access Control (RBAC) is enforced for protected resources.

Typical roles include:

* Super Administrator
* Clinic Administrator
* Doctor
* Receptionist
* Nurse

Authorization is evaluated using:

* User role
* Assigned permissions
* Clinic context

---

# 6. Standard Request Headers

| Header        | Required | Description            |
| ------------- | -------- | ---------------------- |
| Authorization | Yes*     | JWT Bearer Token       |
| Content-Type  | Yes      | application/json       |
| Accept        | Yes      | application/json       |
| X-Request-Id  | Optional | Request correlation ID |

* Public endpoints such as login do not require authentication.

---

# 7. Standard Response Format

Successful responses should follow a consistent structure.

```json
{
  "success": true,
  "message": "Patient retrieved successfully.",
  "data": {},
  "meta": {}
}
```

Field descriptions:

| Field   | Description                       |
| ------- | --------------------------------- |
| success | Indicates operation status        |
| message | Human-readable message            |
| data    | Response payload                  |
| meta    | Pagination or additional metadata |

---

# 8. Error Response Format

All errors should follow a consistent structure.

```json
{
  "success": false,
  "message": "Validation failed.",
  "error": {
    "code": "VALIDATION_ERROR",
    "details": [
      {
        "field": "mobileNumber",
        "message": "Mobile number is required."
      }
    ]
  }
}
```

---

# 9. Pagination

List endpoints should support pagination.

Query Parameters

```text
?page=1
&pageSize=20
```

Response Example

```json
"meta": {
  "page": 1,
  "pageSize": 20,
  "totalRecords": 350,
  "totalPages": 18
}
```

---

# 10. Filtering & Sorting

Common query parameters:

```text
?search=John
?status=ACTIVE
?doctorId=<uuid>
?sortBy=createdAt
?sortOrder=desc
```

Filtering should be supported wherever practical.

---

# 11. API Versioning

Versioning is implemented through the URL.

Example:

```text
/api/v1/patients
```

Future versions:

```text
/api/v2/patients
```

Breaking changes should only be introduced in new API versions.

---

# 12. Endpoint Specifications

## Authentication

| Method | Endpoint      | Description          |
| ------ | ------------- | -------------------- |
| POST   | /auth/login   | User login           |
| POST   | /auth/logout  | Logout               |
| POST   | /auth/refresh | Refresh JWT          |
| GET    | /auth/profile | Current user profile |

---

## Clinics

| Method | Endpoint             |
| ------ | -------------------- |
| GET    | /clinics             |
| GET    | /clinics/{id}        |
| POST   | /clinics             |
| PUT    | /clinics/{id}        |
| PATCH  | /clinics/{id}/status |

---

## Users

| Method | Endpoint    |
| ------ | ----------- |
| GET    | /users      |
| GET    | /users/{id} |
| POST   | /users      |
| PUT    | /users/{id} |
| DELETE | /users/{id} |

---

## Doctors

| Method | Endpoint      |
| ------ | ------------- |
| GET    | /doctors      |
| GET    | /doctors/{id} |
| POST   | /doctors      |
| PUT    | /doctors/{id} |
| DELETE | /doctors/{id} |

---

## Patients

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /patients      |
| GET    | /patients/{id} |
| POST   | /patients      |
| PUT    | /patients/{id} |
| DELETE | /patients/{id} |

Additional endpoints:

| Method | Endpoint                     |
| ------ | ---------------------------- |
| GET    | /patients/{id}/appointments  |
| GET    | /patients/{id}/consultations |
| GET    | /patients/{id}/prescriptions |
| GET    | /patients/{id}/billing       |

---

## Appointments

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | /appointments             |
| GET    | /appointments/{id}        |
| POST   | /appointments             |
| PUT    | /appointments/{id}        |
| PATCH  | /appointments/{id}/status |
| DELETE | /appointments/{id}        |

---

## Consultations

| Method | Endpoint                     |
| ------ | ---------------------------- |
| GET    | /consultations               |
| GET    | /consultations/{id}          |
| POST   | /consultations               |
| PUT    | /consultations/{id}          |
| POST   | /consultations/{id}/complete |

---

## Prescriptions

| Method | Endpoint                  |
| ------ | ------------------------- |
| GET    | /prescriptions            |
| GET    | /prescriptions/{id}       |
| POST   | /prescriptions            |
| PUT    | /prescriptions/{id}       |
| GET    | /prescriptions/{id}/print |

---

## Billing

| Method | Endpoint       |
| ------ | -------------- |
| GET    | /invoices      |
| GET    | /invoices/{id} |
| POST   | /invoices      |
| POST   | /payments      |
| GET    | /payments/{id} |

---

## Reports

| Method | Endpoint              |
| ------ | --------------------- |
| GET    | /reports/dashboard    |
| GET    | /reports/revenue      |
| GET    | /reports/appointments |
| GET    | /reports/patients     |

---

## Settings

| Method | Endpoint  |
| ------ | --------- |
| GET    | /settings |
| PUT    | /settings |

---

# 13. Common HTTP Status Codes

| Status | Meaning               |
| ------ | --------------------- |
| 200    | OK                    |
| 201    | Created               |
| 204    | No Content            |
| 400    | Bad Request           |
| 401    | Unauthorized          |
| 403    | Forbidden             |
| 404    | Not Found             |
| 409    | Conflict              |
| 422    | Validation Error      |
| 429    | Too Many Requests     |
| 500    | Internal Server Error |

---

# 14. Rate Limiting

Recommended defaults:

* Anonymous requests: 60 requests/minute
* Authenticated users: 300 requests/minute

Limits may vary by endpoint based on operational requirements.

---

# 15. API Security

The API should enforce:

* HTTPS only
* JWT authentication
* RBAC authorization
* Tenant isolation
* Request validation
* SQL injection prevention via Prisma
* Cross-Origin Resource Sharing (CORS) policy
* Audit logging for sensitive operations

Sensitive fields should never be returned unless explicitly required by the requesting role.

---

# 16. Future Enhancements

The API is designed to support future capabilities including:

* OpenAPI (Swagger) generation
* WebSocket notifications
* Public integration APIs
* HL7/FHIR interoperability
* AI-powered clinical services
* Mobile application support

---

# API Design Principles Summary

* Use nouns rather than verbs for resources.
* Return consistent response structures.
* Validate all input.
* Keep endpoints tenant-aware.
* Use HTTP status codes appropriately.
* Maintain backward compatibility within the same API version.
* Design APIs to be self-descriptive and easy to consume.

> **The Clinexa API is designed as a secure, consistent, and scalable contract that enables independent frontend and backend development while preserving data integrity and tenant isolation.**
