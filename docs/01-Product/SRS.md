# Clinexa Software Requirements Specification (SRS)

**Document Version:** 1.0 (Draft)
**Product Name:** Clinexa
**Tagline:** *Smarter Care. Simplified.*
**Document Status:** Draft
**Prepared By:** Clinexa Product Team
**Date:** July 26, 2026

---

# Revision History

| Version | Date          | Author               | Description   |
| ------- | ------------- | -------------------- | ------------- |
| 1.0     | July 26, 2026 | Clinexa Product Team | Initial draft |

---

# Table of Contents

1. Introduction
2. Product Vision
3. Product Scope
4. Business Objectives
5. Target Customers
6. Product Principles
7. Stakeholders
8. User Roles
9. Functional Requirements
10. Non-Functional Requirements
11. Technology Stack
12. High-Level Architecture
13. Data Management
14. Security Requirements
15. Future Roadmap

---

# 1. Introduction

## 1.1 Purpose

Clinexa is a cloud-based, multi-tenant outpatient clinic management platform designed to simplify the daily operations of healthcare providers.

The platform enables clinics to manage patients, appointments, consultations, prescriptions, billing, and reports through a secure, intuitive, and mobile-friendly application.

Clinexa aims to reduce administrative effort while improving the quality of patient care through efficient digital workflows.

---

## 1.2 Vision

**To become the preferred digital platform for outpatient clinics by providing a modern, secure, and easy-to-use solution that allows healthcare professionals to focus more on patient care and less on administration.**

---

## 1.3 Mission

Deliver an affordable, scalable, and user-friendly clinic management platform that can be adopted by clinics of any size without requiring complex infrastructure or extensive staff training.

---

# 2. Product Vision

Clinexa is designed as a **Software-as-a-Service (SaaS)** platform for outpatient clinics.

The platform supports multiple independent clinics from a single deployment while ensuring complete tenant isolation and data security.

Every patient interaction—from registration to consultation, prescription, billing, and follow-up—forms a single continuous digital journey.

---

# 3. Product Scope

## Included in Version 1.0

### Core Platform

* Authentication
* Multi-tenant architecture
* User management
* Role management
* Clinic configuration

### Clinical

* Patient Management
* Doctor Management
* Appointment Scheduling
* Consultation Notes
* Digital Prescriptions

### Administration

* Billing
* Payments
* Dashboard
* Reports
* Audit Logs
* Clinic Settings

---

## Out of Scope (Version 1)

The following features are intentionally excluded from the MVP:

* Inpatient admission
* Ward management
* ICU management
* Bed allocation
* Operating theatre management
* Blood bank
* Ambulance management
* Emergency room management

These may be introduced as optional modules in future releases.

---

# 4. Business Objectives

The objectives of Clinexa are:

* Digitize outpatient clinic operations.
* Reduce patient waiting time.
* Improve doctor productivity.
* Eliminate paper-based records.
* Improve billing accuracy.
* Enable secure access from desktop, tablet, and mobile devices.
* Provide a scalable platform capable of serving multiple clinics.

---

# 5. Target Customers

Clinexa is designed primarily for:

* General Practice Clinics
* Family Medicine Clinics
* Pediatric Clinics
* Dermatology Clinics
* Orthopedic Clinics
* ENT Clinics
* Gynecology Clinics

Future editions may support:

* Dental Clinics
* Physiotherapy Centers
* Diagnostic Centers
* Specialty Clinics

---

# 6. Product Principles

## Mobile First

Every screen shall be optimized for mobile phones, tablets, laptops, and desktops.

---

## Multi-Tenant by Design

A single deployment shall securely host multiple clinics while maintaining complete data isolation.

---

## Simplicity

The application should be easy to learn and require minimal training.

---

## Speed

Common workflows shall be optimized for minimal clicks and rapid task completion.

---

## Security

Patient data shall be protected using authentication, authorization, encryption, audit logging, and secure communication.

---

## Extensibility

The architecture shall support future modules without requiring significant redesign.

---

# 7. Stakeholders

The primary stakeholders include:

* Platform Owner
* Clinic Owner
* Clinic Administrator
* Doctors
* Receptionists
* Nurses
* Patients

---

# 8. User Roles

## Super Administrator

Responsible for managing the entire Clinexa platform.

Responsibilities:

* Manage clinics
* Manage subscriptions
* Manage platform settings
* Monitor system health

---

## Clinic Administrator

Responsible for administration within a single clinic.

Responsibilities:

* Manage staff
* Configure clinic settings
* View reports
* Manage doctors

---

## Doctor

Responsibilities:

* View appointments
* Record consultations
* Create prescriptions
* Access patient history

---

## Receptionist

Responsibilities:

* Register patients
* Schedule appointments
* Collect payments
* Generate invoices

---

## Nurse

Responsibilities:

* Record patient vitals
* Assist consultations
* Update patient observations

---

# 9. Functional Requirements

## Authentication

The system shall:

* Support secure login.
* Support logout.
* Support password reset.
* Support role-based authorization.
* Support session expiration.

---

## Clinic Management

The system shall allow:

* Create clinic
* Update clinic
* Activate or deactivate clinic
* Configure clinic information
* Upload clinic logo

---

## Patient Management

The system shall allow:

* Register patients
* Search patients
* Edit patient information
* Maintain patient history
* Upload documents

---

## Doctor Management

The system shall allow:

* Create doctor profiles
* Configure schedules
* Configure consultation fees
* Manage availability

---

## Appointment Management

The system shall allow:

* Book appointments
* Cancel appointments
* Reschedule appointments
* Queue management
* Token generation

---

## Consultation

The system shall allow doctors to record:

* Vitals
* Symptoms
* Diagnosis
* Clinical notes
* Follow-up recommendations

---

## Prescription

The system shall allow:

* Add medicines
* Configure dosage
* Configure duration
* Print prescription
* Export PDF

---

## Billing

The system shall support:

* Invoice generation
* Payment recording
* Discounts
* Receipt generation

---

## Reporting

The system shall provide:

* Daily appointments
* Revenue reports
* Patient statistics
* Doctor activity
* Billing summaries

---

# 10. Non-Functional Requirements

## Performance

* Login should complete within 2 seconds.
* Patient search should return results within 2 seconds.
* Dashboard should load within 3 seconds.

---

## Availability

Target system availability shall be **99.5%**.

---

## Security

The system shall implement:

* JWT Authentication
* Role-Based Access Control
* HTTPS
* Password hashing
* Audit logging

---

## Scalability

The architecture shall support:

* Multiple clinics
* Thousands of patient records
* Concurrent users across clinics

---

# 11. Technology Stack

## Frontend

* React
* TypeScript
* Webpack
* Tailwind CSS
* React Router
* TanStack Query
* React Hook Form
* Zod
* Lucide React
* Axios

## Backend

* NestJS
* Prisma ORM
* PostgreSQL
* JWT Authentication
* Swagger

## Deployment

* Vercel
* Render
* Neon PostgreSQL

---

# 12. High-Level Architecture

Client (React PWA)

↓

REST API (NestJS)

↓

Prisma ORM

↓

PostgreSQL

---

# 13. Data Management

The platform shall use a shared PostgreSQL database with tenant isolation implemented using a `clinicId` foreign key on tenant-specific entities.

Every business record shall include:

* clinicId
* createdAt
* updatedAt
* createdBy
* updatedBy

---

# 14. Security Requirements

The system shall:

* Encrypt passwords.
* Enforce role-based authorization.
* Prevent unauthorized tenant access.
* Record audit logs.
* Support secure HTTPS communication.

---

# 15. Future Roadmap

Future versions may include:

* AI Clinical Assistant
* Voice-to-text consultation notes
* Laboratory Management
* Pharmacy Management
* Inventory Management
* Patient Portal
* Telemedicine
* Mobile Applications
* WhatsApp Notifications

---

# Product Philosophy

> **One Patient. One Digital Journey.**

Every patient interaction—from registration through appointments, consultations, prescriptions, billing, and follow-up—should be connected in a single, continuous digital record that supports efficient care and minimizes duplicate data entry.
