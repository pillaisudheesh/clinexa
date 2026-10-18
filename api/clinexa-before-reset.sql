--
-- PostgreSQL database dump
--

\restrict cW3xDwCGmrMZhEDaNa64oBYsH0X19GbbqGoB09WGTfMfI4dfRpNqCRPioeJhEQF

-- Dumped from database version 17.10 (Debian 17.10-1.pgdg13+1)
-- Dumped by pg_dump version 17.10 (Debian 17.10-1.pgdg13+1)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET transaction_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

--
-- Name: AppointmentPriority; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."AppointmentPriority" AS ENUM (
    'ROUTINE',
    'URGENT',
    'EMERGENCY'
);


ALTER TYPE public."AppointmentPriority" OWNER TO clinexa;

--
-- Name: AppointmentStatus; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."AppointmentStatus" AS ENUM (
    'SCHEDULED',
    'CONFIRMED',
    'CHECKED_IN',
    'IN_CONSULTATION',
    'COMPLETED',
    'CANCELLED',
    'NO_SHOW'
);


ALTER TYPE public."AppointmentStatus" OWNER TO clinexa;

--
-- Name: AppointmentType; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."AppointmentType" AS ENUM (
    'NEW_CONSULTATION',
    'FOLLOW_UP',
    'EMERGENCY',
    'TELECONSULTATION',
    'PROCEDURE'
);


ALTER TYPE public."AppointmentType" OWNER TO clinexa;

--
-- Name: BloodGroup; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."BloodGroup" AS ENUM (
    'A_POSITIVE',
    'A_NEGATIVE',
    'B_POSITIVE',
    'B_NEGATIVE',
    'AB_POSITIVE',
    'AB_NEGATIVE',
    'O_POSITIVE',
    'O_NEGATIVE'
);


ALTER TYPE public."BloodGroup" OWNER TO clinexa;

--
-- Name: DoctorTitle; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."DoctorTitle" AS ENUM (
    'DR',
    'PROF',
    'MR',
    'MS',
    'MRS'
);


ALTER TYPE public."DoctorTitle" OWNER TO clinexa;

--
-- Name: EmploymentType; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."EmploymentType" AS ENUM (
    'FULL_TIME',
    'PART_TIME',
    'VISITING',
    'CONSULTANT',
    'RESIDENT'
);


ALTER TYPE public."EmploymentType" OWNER TO clinexa;

--
-- Name: Gender; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."Gender" AS ENUM (
    'MALE',
    'FEMALE',
    'OTHER'
);


ALTER TYPE public."Gender" OWNER TO clinexa;

--
-- Name: InventoryTransactionType; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."InventoryTransactionType" AS ENUM (
    'PURCHASE',
    'ADJUSTMENT_IN',
    'ADJUSTMENT_OUT',
    'DISPENSE',
    'RETURN',
    'EXPIRED'
);


ALTER TYPE public."InventoryTransactionType" OWNER TO clinexa;

--
-- Name: InvoiceStatus; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."InvoiceStatus" AS ENUM (
    'DRAFT',
    'ISSUED',
    'PARTIALLY_PAID',
    'PAID',
    'CANCELLED',
    'REFUNDED'
);


ALTER TYPE public."InvoiceStatus" OWNER TO clinexa;

--
-- Name: InvoiceType; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."InvoiceType" AS ENUM (
    'CONSULTATION',
    'LABORATORY',
    'PHARMACY',
    'OTHER'
);


ALTER TYPE public."InvoiceType" OWNER TO clinexa;

--
-- Name: LabOrderItemStatus; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."LabOrderItemStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."LabOrderItemStatus" OWNER TO clinexa;

--
-- Name: LabOrderStatus; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."LabOrderStatus" AS ENUM (
    'PENDING',
    'IN_PROGRESS',
    'COMPLETED',
    'CANCELLED'
);


ALTER TYPE public."LabOrderStatus" OWNER TO clinexa;

--
-- Name: MaritalStatus; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."MaritalStatus" AS ENUM (
    'SINGLE',
    'MARRIED',
    'DIVORCED',
    'WIDOWED'
);


ALTER TYPE public."MaritalStatus" OWNER TO clinexa;

--
-- Name: PaymentMethod; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."PaymentMethod" AS ENUM (
    'CASH',
    'CARD',
    'UPI',
    'BANK_TRANSFER',
    'OTHER'
);


ALTER TYPE public."PaymentMethod" OWNER TO clinexa;

--
-- Name: PaymentStatus; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."PaymentStatus" AS ENUM (
    'PENDING',
    'PARTIALLY_PAID',
    'PAID',
    'REFUNDED',
    'SUCCESS'
);


ALTER TYPE public."PaymentStatus" OWNER TO clinexa;

--
-- Name: PharmacyDispensingStatus; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."PharmacyDispensingStatus" AS ENUM (
    'COMPLETED',
    'CANCELLED',
    'PARTIALLY_DISPENSED'
);


ALTER TYPE public."PharmacyDispensingStatus" OWNER TO clinexa;

--
-- Name: UserStatus; Type: TYPE; Schema: public; Owner: clinexa
--

CREATE TYPE public."UserStatus" AS ENUM (
    'ACTIVE',
    'INACTIVE',
    'LOCKED'
);


ALTER TYPE public."UserStatus" OWNER TO clinexa;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: Appointment; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Appointment" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    "appointmentNumber" text NOT NULL,
    "patientId" text NOT NULL,
    "doctorId" text NOT NULL,
    "appointmentDate" timestamp(3) without time zone NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    type public."AppointmentType" DEFAULT 'NEW_CONSULTATION'::public."AppointmentType" NOT NULL,
    status public."AppointmentStatus" DEFAULT 'SCHEDULED'::public."AppointmentStatus" NOT NULL,
    priority public."AppointmentPriority" DEFAULT 'ROUTINE'::public."AppointmentPriority" NOT NULL,
    reason text,
    notes text,
    "cancellationReason" text,
    "consultationFee" numeric(10,2),
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Appointment" OWNER TO clinexa;

--
-- Name: Clinic; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Clinic" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    email text,
    phone text,
    website text,
    "addressLine1" text,
    "addressLine2" text,
    city text,
    state text,
    country text,
    "postalCode" text,
    timezone text DEFAULT 'UTC'::text NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "prescriptionSequence" integer DEFAULT 0 NOT NULL,
    "invoiceSequence" integer DEFAULT 0 NOT NULL
);


ALTER TABLE public."Clinic" OWNER TO clinexa;

--
-- Name: ClinicWorkingHours; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."ClinicWorkingHours" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    "openingTime" text DEFAULT '09:00'::text NOT NULL,
    "closingTime" text DEFAULT '18:00'::text NOT NULL,
    "defaultAppointmentDuration" integer DEFAULT 30 NOT NULL,
    "workingDays" text DEFAULT 'MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY'::text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."ClinicWorkingHours" OWNER TO clinexa;

--
-- Name: Department; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Department" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isSystem" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Department" OWNER TO clinexa;

--
-- Name: Diagnosis; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Diagnosis" (
    id text NOT NULL,
    "medicalRecordId" text NOT NULL,
    code text,
    name text NOT NULL,
    "isPrimary" boolean DEFAULT false NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Diagnosis" OWNER TO clinexa;

--
-- Name: Doctor; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Doctor" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    "doctorNumber" text NOT NULL,
    title public."DoctorTitle" DEFAULT 'DR'::public."DoctorTitle" NOT NULL,
    "firstName" text NOT NULL,
    "middleName" text,
    "lastName" text NOT NULL,
    gender public."Gender" NOT NULL,
    "dateOfBirth" timestamp(3) without time zone,
    email text,
    phone text,
    "photoUrl" text,
    "registrationNumber" text,
    biography text,
    "yearsOfExperience" integer,
    "employmentType" public."EmploymentType" DEFAULT 'FULL_TIME'::public."EmploymentType" NOT NULL,
    "departmentId" text NOT NULL,
    "primarySpecialtyId" text NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "registrationCouncilId" text
);


ALTER TABLE public."Doctor" OWNER TO clinexa;

--
-- Name: DoctorConsultationFee; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."DoctorConsultationFee" (
    "doctorId" text NOT NULL,
    "consultationFee" numeric(10,2) NOT NULL,
    "followUpFee" numeric(10,2),
    "emergencyFee" numeric(10,2),
    "teleConsultationFee" numeric(10,2),
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DoctorConsultationFee" OWNER TO clinexa;

--
-- Name: DoctorLanguage; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."DoctorLanguage" (
    "doctorId" text NOT NULL,
    "languageId" text NOT NULL
);


ALTER TABLE public."DoctorLanguage" OWNER TO clinexa;

--
-- Name: DoctorQualification; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."DoctorQualification" (
    "doctorId" text NOT NULL,
    "qualificationId" text NOT NULL,
    institution text,
    "yearCompleted" integer
);


ALTER TABLE public."DoctorQualification" OWNER TO clinexa;

--
-- Name: DoctorSchedule; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."DoctorSchedule" (
    id text NOT NULL,
    "doctorId" text NOT NULL,
    "slotDuration" integer DEFAULT 15 NOT NULL,
    "bufferTime" integer DEFAULT 0 NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."DoctorSchedule" OWNER TO clinexa;

--
-- Name: DoctorScheduleSlot; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."DoctorScheduleSlot" (
    id text NOT NULL,
    "scheduleId" text NOT NULL,
    "dayOfWeek" integer NOT NULL,
    "startTime" text NOT NULL,
    "endTime" text NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."DoctorScheduleSlot" OWNER TO clinexa;

--
-- Name: DoctorSpecialty; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."DoctorSpecialty" (
    "doctorId" text NOT NULL,
    "specialtyId" text NOT NULL
);


ALTER TABLE public."DoctorSpecialty" OWNER TO clinexa;

--
-- Name: InventoryTransaction; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."InventoryTransaction" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    "medicineBatchId" text NOT NULL,
    type public."InventoryTransactionType" NOT NULL,
    quantity integer NOT NULL,
    "previousQuantity" integer NOT NULL,
    "newQuantity" integer NOT NULL,
    "referenceId" text,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."InventoryTransaction" OWNER TO clinexa;

--
-- Name: Invoice; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Invoice" (
    id text NOT NULL,
    "invoiceNumber" text NOT NULL,
    "clinicId" text NOT NULL,
    "patientId" text NOT NULL,
    "appointmentId" text NOT NULL,
    status public."InvoiceStatus" DEFAULT 'DRAFT'::public."InvoiceStatus" NOT NULL,
    subtotal numeric(12,2) NOT NULL,
    discount numeric(12,2) DEFAULT 0 NOT NULL,
    tax numeric(12,2) DEFAULT 0 NOT NULL,
    total numeric(12,2) NOT NULL,
    "amountPaid" numeric(12,2) DEFAULT 0 NOT NULL,
    "balanceDue" numeric(12,2) DEFAULT 0 NOT NULL,
    notes text,
    "issuedAt" timestamp(3) without time zone,
    "dueAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    type public."InvoiceType" DEFAULT 'CONSULTATION'::public."InvoiceType" NOT NULL
);


ALTER TABLE public."Invoice" OWNER TO clinexa;

--
-- Name: InvoiceItem; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."InvoiceItem" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    description text NOT NULL,
    quantity numeric(12,2) NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    amount numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "labOrderItemId" text,
    "pharmacyDispensingItemId" text
);


ALTER TABLE public."InvoiceItem" OWNER TO clinexa;

--
-- Name: LabOrder; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."LabOrder" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    "patientId" text NOT NULL,
    "doctorId" text NOT NULL,
    "appointmentId" text NOT NULL,
    status public."LabOrderStatus" DEFAULT 'PENDING'::public."LabOrderStatus" NOT NULL,
    notes text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LabOrder" OWNER TO clinexa;

--
-- Name: LabOrderItem; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."LabOrderItem" (
    id text NOT NULL,
    "labOrderId" text NOT NULL,
    "labTestId" text NOT NULL,
    price numeric(12,2) NOT NULL,
    status public."LabOrderItemStatus" DEFAULT 'PENDING'::public."LabOrderItemStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LabOrderItem" OWNER TO clinexa;

--
-- Name: LabResult; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."LabResult" (
    id text NOT NULL,
    "labOrderItemId" text NOT NULL,
    result text NOT NULL,
    notes text,
    "performedAt" timestamp(3) without time zone,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LabResult" OWNER TO clinexa;

--
-- Name: LabTest; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."LabTest" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    category text,
    price numeric(12,2) NOT NULL,
    unit text,
    "normalRange" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."LabTest" OWNER TO clinexa;

--
-- Name: Language; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Language" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isSystem" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Language" OWNER TO clinexa;

--
-- Name: MedicalRecord; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."MedicalRecord" (
    id text NOT NULL,
    "patientId" text NOT NULL,
    "doctorId" text NOT NULL,
    "appointmentId" text NOT NULL,
    "chiefComplaint" text,
    "historyOfPresentIllness" text,
    "examinationNotes" text,
    assessment text,
    "treatmentPlan" text,
    "followUpInstructions" text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MedicalRecord" OWNER TO clinexa;

--
-- Name: Medicine; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Medicine" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    name text NOT NULL,
    "genericName" text,
    manufacturer text,
    category text,
    strength text,
    form text,
    unit text,
    price numeric(12,2) NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Medicine" OWNER TO clinexa;

--
-- Name: MedicineBatch; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."MedicineBatch" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    "medicineId" text NOT NULL,
    "batchNumber" text NOT NULL,
    "expiryDate" timestamp(3) without time zone NOT NULL,
    "purchasePrice" numeric(12,2) NOT NULL,
    "sellingPrice" numeric(12,2) NOT NULL,
    quantity integer DEFAULT 0 NOT NULL,
    "reorderLevel" integer DEFAULT 0 NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."MedicineBatch" OWNER TO clinexa;

--
-- Name: Patient; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Patient" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    "patientNumber" text NOT NULL,
    "firstName" text NOT NULL,
    "middleName" text,
    "lastName" text NOT NULL,
    gender public."Gender" NOT NULL,
    "dateOfBirth" timestamp(3) without time zone NOT NULL,
    phone text,
    email text,
    "bloodGroup" public."BloodGroup",
    "maritalStatus" public."MaritalStatus",
    "addressLine1" text,
    "addressLine2" text,
    city text,
    state text,
    country text,
    "postalCode" text,
    "emergencyContactName" text,
    "emergencyContactPhone" text,
    "emergencyContactRelation" text,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Patient" OWNER TO clinexa;

--
-- Name: Payment; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Payment" (
    id text NOT NULL,
    "invoiceId" text NOT NULL,
    amount numeric(12,2) NOT NULL,
    method public."PaymentMethod" NOT NULL,
    status public."PaymentStatus" DEFAULT 'SUCCESS'::public."PaymentStatus" NOT NULL,
    "transactionReference" text,
    notes text,
    "paidAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."Payment" OWNER TO clinexa;

--
-- Name: Permission; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Permission" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "isSystem" boolean DEFAULT true NOT NULL,
    "permissionGroupId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Permission" OWNER TO clinexa;

--
-- Name: PermissionGroup; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."PermissionGroup" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isSystem" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PermissionGroup" OWNER TO clinexa;

--
-- Name: PharmacyDispensing; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."PharmacyDispensing" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    "prescriptionId" text NOT NULL,
    "invoiceId" text,
    status public."PharmacyDispensingStatus" DEFAULT 'COMPLETED'::public."PharmacyDispensingStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."PharmacyDispensing" OWNER TO clinexa;

--
-- Name: PharmacyDispensingItem; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."PharmacyDispensingItem" (
    id text NOT NULL,
    "dispensingId" text NOT NULL,
    "medicineId" text NOT NULL,
    "medicineBatchId" text NOT NULL,
    quantity integer NOT NULL,
    "unitPrice" numeric(12,2) NOT NULL,
    amount numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."PharmacyDispensingItem" OWNER TO clinexa;

--
-- Name: Prescription; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Prescription" (
    id text NOT NULL,
    "medicalRecordId" text NOT NULL,
    "medicationName" text NOT NULL,
    dosage text NOT NULL,
    frequency text NOT NULL,
    route text,
    duration text,
    quantity text,
    instructions text,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "medicineId" text NOT NULL,
    "prescriptionNumber" text NOT NULL
);


ALTER TABLE public."Prescription" OWNER TO clinexa;

--
-- Name: Qualification; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Qualification" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isSystem" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Qualification" OWNER TO clinexa;

--
-- Name: RefreshToken; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."RefreshToken" (
    id text NOT NULL,
    token text NOT NULL,
    "expiresAt" timestamp(3) without time zone NOT NULL,
    revoked boolean DEFAULT false NOT NULL,
    "ipAddress" text,
    "userAgent" text,
    "userId" text NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RefreshToken" OWNER TO clinexa;

--
-- Name: RegistrationCouncil; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."RegistrationCouncil" (
    id text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    country text,
    "isSystem" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL
);


ALTER TABLE public."RegistrationCouncil" OWNER TO clinexa;

--
-- Name: Role; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Role" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    name text NOT NULL,
    code text NOT NULL,
    description text,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isSystem" boolean DEFAULT false NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Role" OWNER TO clinexa;

--
-- Name: RolePermission; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."RolePermission" (
    "roleId" text NOT NULL,
    "permissionId" text NOT NULL,
    "assignedAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."RolePermission" OWNER TO clinexa;

--
-- Name: Specialty; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."Specialty" (
    id text NOT NULL,
    "departmentId" text NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    description text,
    "displayOrder" integer DEFAULT 0 NOT NULL,
    "isSystem" boolean DEFAULT true NOT NULL,
    "isActive" boolean DEFAULT true NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL
);


ALTER TABLE public."Specialty" OWNER TO clinexa;

--
-- Name: StockReceipt; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."StockReceipt" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    "receiptNumber" text NOT NULL,
    "supplierName" text,
    "supplierInvoiceNumber" text,
    notes text,
    "totalAmount" numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StockReceipt" OWNER TO clinexa;

--
-- Name: StockReceiptItem; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."StockReceiptItem" (
    id text NOT NULL,
    "receiptId" text NOT NULL,
    "medicineId" text NOT NULL,
    "medicineBatchId" text NOT NULL,
    quantity integer NOT NULL,
    "purchasePrice" numeric(12,2) NOT NULL,
    "sellingPrice" numeric(12,2) NOT NULL,
    amount numeric(12,2) NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL
);


ALTER TABLE public."StockReceiptItem" OWNER TO clinexa;

--
-- Name: User; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."User" (
    id text NOT NULL,
    "clinicId" text NOT NULL,
    "firstName" text NOT NULL,
    "lastName" text,
    email text NOT NULL,
    "passwordHash" text NOT NULL,
    status public."UserStatus" DEFAULT 'ACTIVE'::public."UserStatus" NOT NULL,
    "createdAt" timestamp(3) without time zone DEFAULT CURRENT_TIMESTAMP NOT NULL,
    "updatedAt" timestamp(3) without time zone NOT NULL,
    "isPlatformAdmin" boolean DEFAULT false NOT NULL
);


ALTER TABLE public."User" OWNER TO clinexa;

--
-- Name: UserRole; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public."UserRole" (
    "userId" text NOT NULL,
    "roleId" text NOT NULL
);


ALTER TABLE public."UserRole" OWNER TO clinexa;

--
-- Name: _prisma_migrations; Type: TABLE; Schema: public; Owner: clinexa
--

CREATE TABLE public._prisma_migrations (
    id character varying(36) NOT NULL,
    checksum character varying(64) NOT NULL,
    finished_at timestamp with time zone,
    migration_name character varying(255) NOT NULL,
    logs text,
    rolled_back_at timestamp with time zone,
    started_at timestamp with time zone DEFAULT now() NOT NULL,
    applied_steps_count integer DEFAULT 0 NOT NULL
);


ALTER TABLE public._prisma_migrations OWNER TO clinexa;

--
-- Name: clinic_code_seq; Type: SEQUENCE; Schema: public; Owner: clinexa
--

CREATE SEQUENCE public.clinic_code_seq
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER SEQUENCE public.clinic_code_seq OWNER TO clinexa;

--
-- Data for Name: Appointment; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Appointment" (id, "clinicId", "appointmentNumber", "patientId", "doctorId", "appointmentDate", "startTime", "endTime", type, status, priority, reason, notes, "cancellationReason", "consultationFee", "createdAt", "updatedAt") FROM stdin;
69e2d297-40a0-4cb8-84f5-b2e824ab7d3e	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00001	9f4c0755-0236-4c53-b6f8-553b823c8bcc	180b3a62-0f8a-44dc-8742-df32235ef847	2026-08-20 00:00:00	09:00	09:15	NEW_CONSULTATION	CANCELLED	ROUTINE	Fever	\N	not able to reach	700.00	2026-08-19 07:45:28.572	2026-08-19 11:01:49.903
96bd6a1d-94df-4456-a5e7-0227322cfa32	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00004	d5de0008-7abe-4d7b-854f-bd9f9639ce03	4c0cc13e-b989-4e46-ac02-49b58fc3661f	2026-08-20 00:00:00	09:00	09:15	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	800.00	2026-08-19 17:12:32.629	2026-08-19 17:28:41.478
f5069b14-4898-4860-8fa8-ee60b8af37cb	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00003	71a5e98d-5472-4b27-b597-65c4bd31f652	5a97a895-9245-40ca-ab30-66290bb80368	2026-08-19 00:00:00	17:00	17:15	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	1200.00	2026-08-19 08:14:58.963	2026-08-19 18:51:09.59
cc4fbdb9-f0d7-46e0-81f5-acea8ee5fdcb	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00005	3097a220-18be-492b-b6ee-0109e4c797f8	d80aaf36-57f5-44f5-97c1-eb0ee261cede	2026-08-20 00:00:00	14:00	14:15	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	1300.00	2026-08-19 18:56:52.29	2026-08-20 20:43:56.695
bcb4bd34-1810-4e9c-8059-a7893e847aea	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00007	723b3147-97c5-4739-977d-64b6a499f66d	180b3a62-0f8a-44dc-8742-df32235ef847	2026-08-21 00:00:00	09:20	09:35	NEW_CONSULTATION	SCHEDULED	ROUTINE	\N	\N	\N	700.00	2026-08-20 20:52:40.502	2026-08-20 20:52:40.502
d27da97c-4277-465f-a6b9-710d4f28114e	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00008	6874ff96-2ecb-4b1d-bfc4-2793b1a8aef3	180b3a62-0f8a-44dc-8742-df32235ef847	2026-08-21 00:00:00	09:40	09:55	NEW_CONSULTATION	SCHEDULED	ROUTINE	\N	\N	\N	700.00	2026-08-20 20:52:47.518	2026-08-20 20:52:47.518
64a0d500-0c2c-4fd1-91df-406a4b7b7b51	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00010	d9f173db-b013-46b6-8eef-94cdc4c82249	0f296b02-cc35-4300-907b-875c56ea58ae	2026-08-21 00:00:00	09:00	09:15	NEW_CONSULTATION	SCHEDULED	ROUTINE	\N	\N	\N	800.00	2026-08-20 20:53:37.186	2026-08-20 20:53:37.186
2e3279da-c3dc-44cc-83cb-4ba37ae6526e	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00012	3097a220-18be-492b-b6ee-0109e4c797f8	4c0cc13e-b989-4e46-ac02-49b58fc3661f	2026-09-08 00:00:00	12:40	12:55	NEW_CONSULTATION	SCHEDULED	ROUTINE	\N	\N	\N	800.00	2026-09-07 17:53:12.986	2026-09-07 17:53:12.986
3e625820-f622-40dc-a787-262dc1209983	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00013	723b3147-97c5-4739-977d-64b6a499f66d	184d5081-3076-412d-881e-ce4fc83e0337	2026-09-08 00:00:00	12:30	12:50	NEW_CONSULTATION	SCHEDULED	ROUTINE	\N	\N	\N	1200.00	2026-09-07 18:35:54.11	2026-09-07 18:35:54.11
6d380320-262d-494c-baac-ae9add49c9dd	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00015	ae495ce2-e25b-4780-93e9-5ebd8b39d3e1	184d5081-3076-412d-881e-ce4fc83e0337	2026-09-08 00:00:00	12:55	13:15	NEW_CONSULTATION	SCHEDULED	ROUTINE	\N	\N	\N	1200.00	2026-09-07 18:37:42.689	2026-09-07 18:37:42.689
95d223fb-647d-4ea6-b1be-5f636239aeb2	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00009	fe1d62c9-017e-4758-8816-1591044dc96a	550403a7-6ed6-4aa7-b59d-bd934f1798aa	2026-08-21 00:00:00	10:00	10:20	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	900.00	2026-08-20 20:52:58.66	2026-09-07 19:29:24.94
9c81d91c-db9f-46f2-83db-3dba45e8a041	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00014	cba9c2ba-36f3-4b99-a40f-1ae60b6e4a93	4c0cc13e-b989-4e46-ac02-49b58fc3661f	2026-09-08 00:00:00	11:40	11:55	NEW_CONSULTATION	CONFIRMED	ROUTINE	\N	\N	\N	800.00	2026-09-07 18:36:20.012	2026-09-08 05:56:26.12
288c49d6-c776-4880-b2df-f9794cdf19e9	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00016	d2125b21-dd24-41ae-850b-18932c3712e4	d80aaf36-57f5-44f5-97c1-eb0ee261cede	2026-09-08 00:00:00	12:20	12:35	NEW_CONSULTATION	CONFIRMED	ROUTINE	\N	\N	\N	1300.00	2026-09-07 18:37:54.005	2026-09-08 05:56:28.105
86234bce-b8e8-49e1-afbc-e57027946fcf	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00011	5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	d80aaf36-57f5-44f5-97c1-eb0ee261cede	2026-09-08 00:00:00	09:00	09:15	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	1300.00	2026-09-07 17:52:57.406	2026-09-08 05:58:46.458
02b66477-2b61-45ec-94b3-c114400cc1fe	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00002	fe1d62c9-017e-4758-8816-1591044dc96a	550403a7-6ed6-4aa7-b59d-bd934f1798aa	2026-08-20 00:00:00	10:00	10:20	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	900.00	2026-08-19 07:52:21.397	2026-09-13 20:09:48.941
9c76a2bf-0c38-4148-a924-5cb5e3f2d124	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00006	71a5e98d-5472-4b27-b597-65c4bd31f652	180b3a62-0f8a-44dc-8742-df32235ef847	2026-08-21 00:00:00	09:00	09:15	FOLLOW_UP	COMPLETED	ROUTINE	\N	\N	\N	450.00	2026-08-20 20:30:04.99	2026-09-13 20:45:34.034
7e678f9a-793e-4b1a-9bd0-95c4bae2f813	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00017	5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	4c0cc13e-b989-4e46-ac02-49b58fc3661f	2026-09-14 00:00:00	09:00	09:15	NEW_CONSULTATION	SCHEDULED	ROUTINE	\N	\N	\N	800.00	2026-09-13 20:56:11.036	2026-09-13 20:56:11.036
be1891db-73fa-4a49-8a7b-47da55fbda91	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00018	6874ff96-2ecb-4b1d-bfc4-2793b1a8aef3	180b3a62-0f8a-44dc-8742-df32235ef847	2026-09-14 00:00:00	09:20	09:35	NEW_CONSULTATION	SCHEDULED	ROUTINE	\N	\N	\N	700.00	2026-09-13 20:56:21.296	2026-09-13 20:56:21.296
ee303724-5dc2-45ed-86f9-d9c4a36e5b69	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00019	d5de0008-7abe-4d7b-854f-bd9f9639ce03	5a97a895-9245-40ca-ab30-66290bb80368	2026-09-14 00:00:00	17:40	17:55	NEW_CONSULTATION	SCHEDULED	ROUTINE	\N	\N	\N	1200.00	2026-09-13 20:56:29.244	2026-09-13 20:56:29.244
582cc5b8-8954-4dd2-9cbe-5279c46dc5c4	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00020	fe1d62c9-017e-4758-8816-1591044dc96a	550403a7-6ed6-4aa7-b59d-bd934f1798aa	2026-09-14 00:00:00	12:55	13:15	FOLLOW_UP	SCHEDULED	ROUTINE	\N	\N	\N	600.00	2026-09-13 20:58:23.815	2026-09-13 20:58:23.815
7edf6df3-c70b-4b43-a5c4-64c9ea9811d9	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00021	3097a220-18be-492b-b6ee-0109e4c797f8	180b3a62-0f8a-44dc-8742-df32235ef847	2026-10-01 00:00:00	12:40	12:55	NEW_CONSULTATION	CONFIRMED	ROUTINE	\N	\N	\N	700.00	2026-10-01 05:57:06.908	2026-10-01 06:00:54.009
64485b85-981b-4156-9ca3-7a56418c553e	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00022	5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	180b3a62-0f8a-44dc-8742-df32235ef847	2026-10-01 00:00:00	12:20	12:35	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	700.00	2026-10-01 05:57:16.823	2026-10-01 07:51:12.155
65e63467-fe2f-41d5-97a6-46d55a8a44d2	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00024	d5de0008-7abe-4d7b-854f-bd9f9639ce03	d80aaf36-57f5-44f5-97c1-eb0ee261cede	2026-10-06 00:00:00	09:00	09:15	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	1300.00	2026-10-05 09:13:50.297	2026-10-05 09:14:54.535
7e531988-3141-4ece-bacb-6b7d52603b35	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00023	5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	0f296b02-cc35-4300-907b-875c56ea58ae	2026-10-05 00:00:00	12:40	12:55	NEW_CONSULTATION	CONFIRMED	ROUTINE	\N	\N	\N	800.00	2026-10-02 09:09:23.645	2026-10-05 09:47:27.742
d60d6b64-1672-4ff9-a6af-93ad77162b4d	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00026	692ff06f-e317-44f2-9ff3-12aa5a7ba890	0f296b02-cc35-4300-907b-875c56ea58ae	2026-10-07 00:00:00	14:00	14:15	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	800.00	2026-10-06 18:41:46.28	2026-10-06 18:43:04.439
c1248205-21a9-44fa-9a18-fa79ad2e86ba	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00025	6874ff96-2ecb-4b1d-bfc4-2793b1a8aef3	174c789a-7711-4f26-85b9-1c04c4cbd634	2026-10-07 00:00:00	09:30	09:50	NEW_CONSULTATION	IN_CONSULTATION	ROUTINE	\N	\N	\N	1200.00	2026-10-06 18:30:25.966	2026-10-06 19:34:31.23
690de29c-c067-4eb3-bf68-a3fd43489c52	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00027	6ef52290-78d8-47cb-bbfa-3b531e676cbd	550403a7-6ed6-4aa7-b59d-bd934f1798aa	2026-10-07 00:00:00	10:00	10:20	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	900.00	2026-10-06 19:37:13.168	2026-10-06 19:38:23.533
9132cece-ca82-49bf-8511-5470b0f8c26f	599b0d53-c901-47b1-95f4-d3e84420d02c	APT-2026-00028	6bdcb5bb-d772-46fb-9d84-cae2e8d214df	174c789a-7711-4f26-85b9-1c04c4cbd634	2026-10-07 00:00:00	12:25	12:45	NEW_CONSULTATION	COMPLETED	ROUTINE	\N	\N	\N	1200.00	2026-10-07 05:26:55.586	2026-10-07 05:28:21.135
6365f6f0-d411-4a6b-a33b-76a28fbc70c3	68dbd989-a659-454e-9492-e5490f18bea1	APT-2026-00001	004308c3-76e1-404c-8ca9-f18ade54066a	bc1c6954-a25c-42f5-8b5b-825f943faec1	2026-10-13 00:00:00	17:00	17:30	NEW_CONSULTATION	CANCELLED	ROUTINE	\N	\N		\N	2026-10-13 08:23:02.162	2026-10-13 10:46:20.285
f55c8310-45bf-48ff-b459-fb6c0d5e7ad8	68dbd989-a659-454e-9492-e5490f18bea1	APT-2026-00003	004308c3-76e1-404c-8ca9-f18ade54066a	bc1c6954-a25c-42f5-8b5b-825f943faec1	2026-10-13 00:00:00	18:00	18:30	NEW_CONSULTATION	CHECKED_IN	ROUTINE	\N	\N	\N	300.00	2026-10-13 10:46:33.911	2026-10-13 10:46:39.419
da1c991d-e97a-4e1b-957a-0ee2cc69ce01	68dbd989-a659-454e-9492-e5490f18bea1	APT-2026-00002	a888ab03-53f7-4de3-b33a-80f6967942c0	04193cd8-f1de-4d9f-b877-fa29143482a1	2026-10-13 00:00:00	16:30	17:00	NEW_CONSULTATION	IN_CONSULTATION	ROUTINE	\N	\N	\N	300.00	2026-10-13 08:40:22.131	2026-10-13 11:06:52.593
\.


--
-- Data for Name: Clinic; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Clinic" (id, code, name, email, phone, website, "addressLine1", "addressLine2", city, state, country, "postalCode", timezone, "isActive", "createdAt", "updatedAt", "prescriptionSequence", "invoiceSequence") FROM stdin;
599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001	Clinexa Demo Clinic	admin@clinexa.com	+1-555-123-4567	https://clinexa.demo	123 Main Street	\N	New York	New York	USA	10001	America/New_York	t	2026-08-03 11:30:47.436	2026-10-07 05:28:13.525	10	0
addf97cb-4609-4983-9072-523b427b7ed8	CLN-000001	Sai Oja	sudheesh.s@gmail.com	09895068679	\N	\N	\N	Kochi	Kerala	India	683102	Asia/Kolkata	t	2026-10-12 08:35:37.703	2026-10-12 08:35:37.703	0	0
e64604ef-6994-4f55-9a90-1045b2cebff9	CLN-000002	Total health	sudheesh.s@gmail.com	09895068679	\N	\N	\N	Kochi	Kerala	India	683102	Asia/Kolkata	t	2026-10-12 09:41:03.092	2026-10-12 09:41:03.092	0	0
20ef8a32-80e8-4068-8601-0b69ffabe027	CLN-000003	Clinic World	admin@clinicworld.com	9895068679	\N	\N	\N	Aluva	Kerala	India	\N	Asia/Kolkata	t	2026-10-13 08:02:49.471	2026-10-13 08:03:03.08	0	0
68dbd989-a659-454e-9492-e5490f18bea1	CLN-000004	Premier Health Center	admin@premierhealthcenter.com	5563333	\N	\N	\N	Aluva	Kerala	India	\N	Asia/Kolkata	t	2026-10-13 08:10:00.37	2026-10-13 08:10:39.86	0	0
\.


--
-- Data for Name: ClinicWorkingHours; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."ClinicWorkingHours" (id, "clinicId", "openingTime", "closingTime", "defaultAppointmentDuration", "workingDays", "createdAt", "updatedAt") FROM stdin;
e55b3666-05a6-465e-9e97-49d8fccbb263	68dbd989-a659-454e-9492-e5490f18bea1	09:00	22:00	30	MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY	2026-10-13 08:28:29.634	2026-10-13 08:29:21.355
935df975-4adb-4624-ae8d-58bdc3c7746f	599b0d53-c901-47b1-95f4-d3e84420d02c	09:00	18:00	30	MONDAY,TUESDAY,WEDNESDAY,THURSDAY,FRIDAY,SATURDAY	2026-10-13 08:42:14.997	2026-10-13 08:42:14.997
\.


--
-- Data for Name: Department; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Department" (id, "clinicId", code, name, description, "displayOrder", "isSystem", "isActive", "createdAt", "updatedAt") FROM stdin;
5a030306-27c1-4748-95e2-fd96adcbafb2	68dbd989-a659-454e-9492-e5490f18bea1	GENERAL_MEDICINE	General Medicine	\N	1	t	t	2026-10-13 08:10:00.409	2026-10-13 08:10:00.409
94b8f6ae-2dfa-4ac2-8806-68e7a4640bec	68dbd989-a659-454e-9492-e5490f18bea1	CARDIOLOGY	Cardiology	\N	2	t	t	2026-10-13 08:10:00.414	2026-10-13 08:10:00.414
62093139-7025-4ae9-b9d4-13a715cf218f	68dbd989-a659-454e-9492-e5490f18bea1	NEUROLOGY	Neurology	\N	3	t	t	2026-10-13 08:10:00.417	2026-10-13 08:10:00.417
86897b00-9dae-4d93-a7f7-721709f125de	68dbd989-a659-454e-9492-e5490f18bea1	ORTHOPEDICS	Orthopedics	\N	4	t	t	2026-10-13 08:10:00.421	2026-10-13 08:10:00.421
df87cf71-4827-4f73-986d-f2eb15482357	68dbd989-a659-454e-9492-e5490f18bea1	PEDIATRICS	Pediatrics	\N	5	t	t	2026-10-13 08:10:00.424	2026-10-13 08:10:00.424
e6eaf59c-96ed-4c4c-81db-42f3c4b9c052	68dbd989-a659-454e-9492-e5490f18bea1	OBSTETRICS_GYNECOLOGY	Obstetrics & Gynecology	\N	6	t	t	2026-10-13 08:10:00.427	2026-10-13 08:10:00.427
0c9845cb-a1df-4363-b2e8-c3ab6f6557ab	68dbd989-a659-454e-9492-e5490f18bea1	DERMATOLOGY	Dermatology	\N	7	t	t	2026-10-13 08:10:00.431	2026-10-13 08:10:00.431
a356d50e-dc03-423f-bfa8-242afd8b851d	68dbd989-a659-454e-9492-e5490f18bea1	OPHTHALMOLOGY	Ophthalmology	\N	8	t	t	2026-10-13 08:10:00.435	2026-10-13 08:10:00.435
4be9b787-2a98-44b0-a751-fe8c7191ddfc	68dbd989-a659-454e-9492-e5490f18bea1	ENT	ENT	\N	9	t	t	2026-10-13 08:10:00.439	2026-10-13 08:10:00.439
a731704b-f286-456e-bab3-eb4788c11d8c	68dbd989-a659-454e-9492-e5490f18bea1	PSYCHIATRY	Psychiatry	\N	10	t	t	2026-10-13 08:10:00.444	2026-10-13 08:10:00.444
38dcc381-ab3a-473a-89cc-094f1949e914	68dbd989-a659-454e-9492-e5490f18bea1	PULMONOLOGY	Pulmonology	\N	11	t	t	2026-10-13 08:10:00.448	2026-10-13 08:10:00.448
db52b208-0549-458c-8756-a7829971552b	68dbd989-a659-454e-9492-e5490f18bea1	GASTROENTEROLOGY	Gastroenterology	\N	12	t	t	2026-10-13 08:10:00.454	2026-10-13 08:10:00.454
b3cc3725-ef95-49dc-bd0d-aecf68f3c0d2	68dbd989-a659-454e-9492-e5490f18bea1	NEPHROLOGY	Nephrology	\N	13	t	t	2026-10-13 08:10:00.46	2026-10-13 08:10:00.46
1cfcc7b7-f126-4314-8814-e9470898c326	68dbd989-a659-454e-9492-e5490f18bea1	UROLOGY	Urology	\N	14	t	t	2026-10-13 08:10:00.465	2026-10-13 08:10:00.465
93f9b67e-a6e4-47b9-9495-f0a3dbb4f60b	68dbd989-a659-454e-9492-e5490f18bea1	ONCOLOGY	Oncology	\N	15	t	t	2026-10-13 08:10:00.471	2026-10-13 08:10:00.471
f46e98a8-bf8f-41f3-81e8-dbc5fcdcac85	599b0d53-c901-47b1-95f4-d3e84420d02c	GENERAL_MEDICINE	General Medicine	\N	1	t	t	2026-08-06 10:18:02.17	2026-10-13 08:08:05.402
fa9223cc-5ecd-43fa-9fdd-5e06dd85d0fa	599b0d53-c901-47b1-95f4-d3e84420d02c	CARDIOLOGY	Cardiology	\N	2	t	t	2026-08-06 10:18:02.172	2026-10-13 08:08:05.405
4b857bfe-830b-4ff2-a298-6be709034534	599b0d53-c901-47b1-95f4-d3e84420d02c	NEUROLOGY	Neurology	\N	3	t	t	2026-08-06 10:18:02.173	2026-10-13 08:08:05.406
1c588d86-37e2-4fb1-bb04-126a3bd683df	599b0d53-c901-47b1-95f4-d3e84420d02c	ORTHOPEDICS	Orthopedics	\N	4	t	t	2026-08-06 10:18:02.173	2026-10-13 08:08:05.408
a8e9dc89-8342-4741-8878-c98b7a095be0	599b0d53-c901-47b1-95f4-d3e84420d02c	PEDIATRICS	Pediatrics	\N	5	t	t	2026-08-06 10:18:02.174	2026-10-13 08:08:05.409
dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	599b0d53-c901-47b1-95f4-d3e84420d02c	OBSTETRICS_GYNECOLOGY	Obstetrics & Gynecology	\N	6	t	t	2026-08-06 10:18:02.174	2026-10-13 08:08:05.411
9171c530-5a36-45cd-abec-c98e433458a9	68dbd989-a659-454e-9492-e5490f18bea1	ENDOCRINOLOGY	Endocrinology	\N	16	t	t	2026-10-13 08:10:00.476	2026-10-13 08:10:00.476
22bac55b-0f07-4387-8078-b5a2651154c9	68dbd989-a659-454e-9492-e5490f18bea1	EMERGENCY_MEDICINE	Emergency Medicine	\N	17	t	t	2026-10-13 08:10:00.483	2026-10-13 08:10:00.483
a8add53c-cadd-4753-9e12-ddcff41f4c83	68dbd989-a659-454e-9492-e5490f18bea1	ICU	Intensive Care Unit	\N	18	t	t	2026-10-13 08:10:00.491	2026-10-13 08:10:00.491
f732d2a5-4f73-4a8d-ad7a-32513678017d	68dbd989-a659-454e-9492-e5490f18bea1	RADIOLOGY	Radiology	\N	19	t	t	2026-10-13 08:10:00.498	2026-10-13 08:10:00.498
1ef18686-a2ed-47a0-bfd6-0745652a6090	68dbd989-a659-454e-9492-e5490f18bea1	LABORATORY_MEDICINE	Laboratory Medicine	\N	20	t	t	2026-10-13 08:10:00.504	2026-10-13 08:10:00.504
6da2623c-ddaa-4df7-9602-146080e42d06	68dbd989-a659-454e-9492-e5490f18bea1	ANESTHESIOLOGY	Anesthesiology	\N	21	t	t	2026-10-13 08:10:00.511	2026-10-13 08:10:00.511
123ebbbf-609c-477a-bd7e-cdc8e953215f	68dbd989-a659-454e-9492-e5490f18bea1	DENTISTRY	Dentistry	\N	22	t	t	2026-10-13 08:10:00.517	2026-10-13 08:10:00.517
0a6ef5f5-9124-4487-a27c-5881cd90c685	68dbd989-a659-454e-9492-e5490f18bea1	PHYSIOTHERAPY	Physiotherapy & Rehabilitation	\N	23	t	t	2026-10-13 08:10:00.532	2026-10-13 08:10:00.532
73333e5f-8c2d-49cf-8a00-8845683436e6	68dbd989-a659-454e-9492-e5490f18bea1	TRADITIONAL_MEDICINE	Traditional Medicine	\N	24	t	t	2026-10-13 08:10:00.538	2026-10-13 08:10:00.538
c23d3379-cc7d-4945-a226-fa9bcf0dec3a	68dbd989-a659-454e-9492-e5490f18bea1	INTEGRATIVE_MEDICINE	Integrative Medicine	\N	25	t	t	2026-10-13 08:10:00.542	2026-10-13 08:10:00.542
9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	68dbd989-a659-454e-9492-e5490f18bea1	VETERINARY_MEDICINE	Veterinary Medicine	\N	26	t	t	2026-10-13 08:10:00.547	2026-10-13 08:10:00.547
8fe0be3c-a682-4c5c-9093-e67c4e3d5769	599b0d53-c901-47b1-95f4-d3e84420d02c	VET	Vet	\N	0	t	f	2026-10-13 07:38:39.443	2026-10-13 07:38:44.246
9af408a7-ca74-4286-a830-93af3fda2909	599b0d53-c901-47b1-95f4-d3e84420d02c	DERMATOLOGY	Dermatology	\N	7	t	t	2026-08-06 10:18:02.175	2026-10-13 08:08:05.412
502cb19e-65ee-4abf-80ab-5c360c4f6bc9	599b0d53-c901-47b1-95f4-d3e84420d02c	OPHTHALMOLOGY	Ophthalmology	\N	8	t	t	2026-08-06 10:18:02.176	2026-10-13 08:08:05.413
575101e5-40e0-45ce-b65c-a90cfcb18b6e	599b0d53-c901-47b1-95f4-d3e84420d02c	ENT	ENT	\N	9	t	t	2026-08-06 10:18:02.176	2026-10-13 08:08:05.414
a23a6fcf-36f4-482a-8338-41f16c335b40	599b0d53-c901-47b1-95f4-d3e84420d02c	PSYCHIATRY	Psychiatry	\N	10	t	t	2026-08-06 10:18:02.176	2026-10-13 08:08:05.415
8b0ef4f0-4699-47c8-a0ef-13abcde15deb	599b0d53-c901-47b1-95f4-d3e84420d02c	PULMONOLOGY	Pulmonology	\N	11	t	t	2026-08-06 10:18:02.177	2026-10-13 08:08:05.416
04e5bbaf-ea4d-41c4-8873-b5e4f6f28984	599b0d53-c901-47b1-95f4-d3e84420d02c	GASTROENTEROLOGY	Gastroenterology	\N	12	t	t	2026-08-06 10:18:02.178	2026-10-13 08:08:05.418
f79f3504-0423-4df9-ab81-63a0495250b9	599b0d53-c901-47b1-95f4-d3e84420d02c	NEPHROLOGY	Nephrology	\N	13	t	t	2026-08-06 10:18:02.178	2026-10-13 08:08:05.419
bf9ddfbe-4570-47e0-bdc2-8a2fbe027d7b	599b0d53-c901-47b1-95f4-d3e84420d02c	UROLOGY	Urology	\N	14	t	t	2026-08-06 10:18:02.179	2026-10-13 08:08:05.42
a70c2898-e286-4f24-b4e6-baa8c1402971	599b0d53-c901-47b1-95f4-d3e84420d02c	ONCOLOGY	Oncology	\N	15	t	t	2026-08-06 10:18:02.179	2026-10-13 08:08:05.421
1a6bf34c-3822-40cc-9dde-9e9a2b5cbf01	599b0d53-c901-47b1-95f4-d3e84420d02c	ENDOCRINOLOGY	Endocrinology	\N	16	t	t	2026-08-06 10:18:02.18	2026-10-13 08:08:05.423
1f7ef252-e8ba-47d3-bcc4-fde3588089e4	599b0d53-c901-47b1-95f4-d3e84420d02c	EMERGENCY_MEDICINE	Emergency Medicine	\N	17	t	t	2026-08-06 10:18:02.18	2026-10-13 08:08:05.424
aa833e8d-1b79-40bf-b923-2383f45ee290	599b0d53-c901-47b1-95f4-d3e84420d02c	ICU	Intensive Care Unit	\N	18	t	t	2026-08-06 10:18:02.181	2026-10-13 08:08:05.425
c7de8d67-492d-4219-afa5-48fbccfb99f1	599b0d53-c901-47b1-95f4-d3e84420d02c	RADIOLOGY	Radiology	\N	19	t	t	2026-08-06 10:18:02.181	2026-10-13 08:08:05.426
5602036d-8abb-489d-828a-48526b50f48c	599b0d53-c901-47b1-95f4-d3e84420d02c	LABORATORY_MEDICINE	Laboratory Medicine	\N	20	t	t	2026-08-06 10:18:02.182	2026-10-13 08:08:05.427
9b20acfd-af86-4659-9dbc-240e40ef4d13	599b0d53-c901-47b1-95f4-d3e84420d02c	ANESTHESIOLOGY	Anesthesiology	\N	21	t	t	2026-08-06 10:18:02.182	2026-10-13 08:08:05.428
75731436-117e-433c-8622-3dfbed434233	e64604ef-6994-4f55-9a90-1045b2cebff9	GENMED	General Medicine	General Medicine	1	t	t	2026-10-13 07:51:10.481	2026-10-13 08:08:05.619
be199746-e7df-4d33-831b-ec273e7c8e02	addf97cb-4609-4983-9072-523b427b7ed8	EMERGENCY_MEDICINE	Emergency Medicine	\N	17	t	t	2026-10-13 07:58:09.49	2026-10-13 08:08:05.533
68f6cd6c-55aa-4456-9257-e855d1174533	addf97cb-4609-4983-9072-523b427b7ed8	ICU	Intensive Care Unit	\N	18	t	t	2026-10-13 07:58:09.49	2026-10-13 08:08:05.534
0f066d2e-27c5-4a46-8a3c-66f250570bd0	599b0d53-c901-47b1-95f4-d3e84420d02c	DENTISTRY	Dentistry	\N	22	t	t	2026-08-06 10:18:02.183	2026-10-13 08:08:05.429
7b69bc96-ca0f-40bf-91f3-7d9149faef7f	599b0d53-c901-47b1-95f4-d3e84420d02c	PHYSIOTHERAPY	Physiotherapy & Rehabilitation	\N	23	t	t	2026-08-06 10:18:02.183	2026-10-13 08:08:05.431
9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	599b0d53-c901-47b1-95f4-d3e84420d02c	TRADITIONAL_MEDICINE	Traditional Medicine	\N	24	t	t	2026-08-06 10:18:02.184	2026-10-13 08:08:05.432
0308bcf6-b65a-4971-83b3-9be8585c7c2d	599b0d53-c901-47b1-95f4-d3e84420d02c	INTEGRATIVE_MEDICINE	Integrative Medicine	\N	25	t	t	2026-08-06 10:18:02.184	2026-10-13 08:08:05.433
6ab49a23-e8a7-420d-8007-94c20201bbf9	599b0d53-c901-47b1-95f4-d3e84420d02c	VETERINARY_MEDICINE	Veterinary Medicine	\N	26	t	t	2026-08-06 10:18:02.184	2026-10-13 08:08:05.434
5ef46dc4-127c-4ba5-9627-ce1c0e699393	addf97cb-4609-4983-9072-523b427b7ed8	GENERAL_MEDICINE	General Medicine	\N	1	t	t	2026-10-13 07:58:09.476	2026-10-13 08:08:05.516
38da9b66-c8d8-4d2b-b20c-61efd4a8e78b	addf97cb-4609-4983-9072-523b427b7ed8	CARDIOLOGY	Cardiology	\N	2	t	t	2026-10-13 07:58:09.478	2026-10-13 08:08:05.517
155159c7-f651-435b-997c-4768ba17089d	addf97cb-4609-4983-9072-523b427b7ed8	NEUROLOGY	Neurology	\N	3	t	t	2026-10-13 07:58:09.478	2026-10-13 08:08:05.518
cd00d903-4c25-4d9b-803f-330e0bc916c0	addf97cb-4609-4983-9072-523b427b7ed8	ORTHOPEDICS	Orthopedics	\N	4	t	t	2026-10-13 07:58:09.479	2026-10-13 08:08:05.519
71f94d81-490c-4069-9988-31d6b4aaadd9	addf97cb-4609-4983-9072-523b427b7ed8	PEDIATRICS	Pediatrics	\N	5	t	t	2026-10-13 07:58:09.48	2026-10-13 08:08:05.52
9bb1b527-5e5f-445c-8007-5c764196e856	addf97cb-4609-4983-9072-523b427b7ed8	OBSTETRICS_GYNECOLOGY	Obstetrics & Gynecology	\N	6	t	t	2026-10-13 07:58:09.481	2026-10-13 08:08:05.521
2d4ec760-5554-466e-99d3-239173d41b4c	addf97cb-4609-4983-9072-523b427b7ed8	DERMATOLOGY	Dermatology	\N	7	t	t	2026-10-13 07:58:09.482	2026-10-13 08:08:05.522
21080a0c-35b7-4e73-a2e3-2f8488f52200	addf97cb-4609-4983-9072-523b427b7ed8	OPHTHALMOLOGY	Ophthalmology	\N	8	t	t	2026-10-13 07:58:09.483	2026-10-13 08:08:05.523
585130da-ec68-42a1-8638-89e3c73673e7	addf97cb-4609-4983-9072-523b427b7ed8	ENT	ENT	\N	9	t	t	2026-10-13 07:58:09.484	2026-10-13 08:08:05.524
ae095c2b-b111-4924-abf3-59d1f99272cc	addf97cb-4609-4983-9072-523b427b7ed8	PSYCHIATRY	Psychiatry	\N	10	t	t	2026-10-13 07:58:09.484	2026-10-13 08:08:05.525
c83de349-d82f-4527-aeb1-e2e2f2e07bff	addf97cb-4609-4983-9072-523b427b7ed8	PULMONOLOGY	Pulmonology	\N	11	t	t	2026-10-13 07:58:09.485	2026-10-13 08:08:05.526
47f7dc6b-1965-4ff2-98fe-504b9c5c020e	addf97cb-4609-4983-9072-523b427b7ed8	GASTROENTEROLOGY	Gastroenterology	\N	12	t	t	2026-10-13 07:58:09.486	2026-10-13 08:08:05.527
2ea39a01-8a33-4412-adb9-cbcda29c8bfe	addf97cb-4609-4983-9072-523b427b7ed8	NEPHROLOGY	Nephrology	\N	13	t	t	2026-10-13 07:58:09.486	2026-10-13 08:08:05.529
8ed8b829-6914-4ec5-bd33-0bba7f165b97	addf97cb-4609-4983-9072-523b427b7ed8	UROLOGY	Urology	\N	14	t	t	2026-10-13 07:58:09.487	2026-10-13 08:08:05.53
48ad266b-e9d8-4864-bbb6-a7130663b915	addf97cb-4609-4983-9072-523b427b7ed8	ONCOLOGY	Oncology	\N	15	t	t	2026-10-13 07:58:09.488	2026-10-13 08:08:05.531
5b819a8f-835c-447e-90db-831f62f3372c	addf97cb-4609-4983-9072-523b427b7ed8	ENDOCRINOLOGY	Endocrinology	\N	16	t	t	2026-10-13 07:58:09.489	2026-10-13 08:08:05.532
9bcc704e-3add-4b65-abe4-8d0a797438df	e64604ef-6994-4f55-9a90-1045b2cebff9	CARDIOLOGY	Cardiology	\N	2	t	t	2026-10-13 08:00:23.005	2026-10-13 08:08:05.62
71645e76-3de4-42e1-bdc2-e4556a9e3e98	e64604ef-6994-4f55-9a90-1045b2cebff9	NEUROLOGY	Neurology	\N	3	t	t	2026-10-13 08:00:23.006	2026-10-13 08:08:05.621
921c207c-8b4d-4760-84e1-6e372fd77ed2	e64604ef-6994-4f55-9a90-1045b2cebff9	ORTHOPEDICS	Orthopedics	\N	4	t	t	2026-10-13 08:00:23.007	2026-10-13 08:08:05.622
20676aa7-1c8e-4c2a-ab21-2e2041784487	e64604ef-6994-4f55-9a90-1045b2cebff9	PEDIATRICS	Pediatrics	\N	5	t	t	2026-10-13 08:00:23.008	2026-10-13 08:08:05.623
92b64fcf-c00c-46b9-884f-68e0979550d8	e64604ef-6994-4f55-9a90-1045b2cebff9	OBSTETRICS_GYNECOLOGY	Obstetrics & Gynecology	\N	6	t	t	2026-10-13 08:00:23.009	2026-10-13 08:08:05.624
5242df9d-1d36-4bff-b234-6be2e68f1611	e64604ef-6994-4f55-9a90-1045b2cebff9	DERMATOLOGY	Dermatology	\N	7	t	t	2026-10-13 08:00:23.01	2026-10-13 08:08:05.625
352442c9-8993-4efb-9ed1-22e96170667b	e64604ef-6994-4f55-9a90-1045b2cebff9	OPHTHALMOLOGY	Ophthalmology	\N	8	t	t	2026-10-13 08:00:23.011	2026-10-13 08:08:05.626
c2e25fd6-a20c-444e-8657-d016c03e0054	e64604ef-6994-4f55-9a90-1045b2cebff9	ENT	ENT	\N	9	t	t	2026-10-13 08:00:23.013	2026-10-13 08:08:05.628
b9739b6f-0a62-4651-9d06-4234041126c3	20ef8a32-80e8-4068-8601-0b69ffabe027	GENERAL_MEDICINE	General Medicine	\N	1	t	t	2026-10-13 08:02:49.48	2026-10-13 08:08:05.723
9759c2db-5e94-45ad-98a2-66e5b6bb6b7e	20ef8a32-80e8-4068-8601-0b69ffabe027	CARDIOLOGY	Cardiology	\N	2	t	t	2026-10-13 08:02:49.486	2026-10-13 08:08:05.724
e508ed59-09a7-402d-b85d-f7b66386770e	20ef8a32-80e8-4068-8601-0b69ffabe027	NEUROLOGY	Neurology	\N	3	t	t	2026-10-13 08:02:49.49	2026-10-13 08:08:05.725
67653898-f8f8-4050-aac4-9fcc275eea0e	20ef8a32-80e8-4068-8601-0b69ffabe027	ORTHOPEDICS	Orthopedics	\N	4	t	t	2026-10-13 08:02:49.494	2026-10-13 08:08:05.726
9d6ddbb0-e11c-464d-8e53-04aded80262f	20ef8a32-80e8-4068-8601-0b69ffabe027	PEDIATRICS	Pediatrics	\N	5	t	t	2026-10-13 08:02:49.501	2026-10-13 08:08:05.727
f5f65033-ce50-4764-a47d-e4c2d3d2b148	20ef8a32-80e8-4068-8601-0b69ffabe027	OBSTETRICS_GYNECOLOGY	Obstetrics & Gynecology	\N	6	t	t	2026-10-13 08:02:49.509	2026-10-13 08:08:05.728
d81e7b9a-22d3-43e8-91cb-94100e932839	20ef8a32-80e8-4068-8601-0b69ffabe027	DERMATOLOGY	Dermatology	\N	7	t	t	2026-10-13 08:02:49.516	2026-10-13 08:08:05.729
00defb80-77ed-461a-9961-bd00a0afc4e3	20ef8a32-80e8-4068-8601-0b69ffabe027	OPHTHALMOLOGY	Ophthalmology	\N	8	t	t	2026-10-13 08:02:49.522	2026-10-13 08:08:05.73
bd17449b-5812-40ed-9c94-b8f1494701e3	20ef8a32-80e8-4068-8601-0b69ffabe027	ENT	ENT	\N	9	t	t	2026-10-13 08:02:49.529	2026-10-13 08:08:05.73
de3b66d5-d89b-45aa-b008-827ef3d23050	20ef8a32-80e8-4068-8601-0b69ffabe027	PSYCHIATRY	Psychiatry	\N	10	t	t	2026-10-13 08:02:49.535	2026-10-13 08:08:05.731
74683990-27b5-49f0-863e-d2aafa8fdfb6	20ef8a32-80e8-4068-8601-0b69ffabe027	PULMONOLOGY	Pulmonology	\N	11	t	t	2026-10-13 08:02:49.542	2026-10-13 08:08:05.732
7e2f0842-8a1a-4311-893a-c28ea2d0a37f	20ef8a32-80e8-4068-8601-0b69ffabe027	GASTROENTEROLOGY	Gastroenterology	\N	12	t	t	2026-10-13 08:02:49.549	2026-10-13 08:08:05.733
75b5fbd6-cef2-4874-b9e1-5c053195ac2e	20ef8a32-80e8-4068-8601-0b69ffabe027	NEPHROLOGY	Nephrology	\N	13	t	t	2026-10-13 08:02:49.555	2026-10-13 08:08:05.734
2ae661a6-d369-447f-a57f-79f3878b4017	20ef8a32-80e8-4068-8601-0b69ffabe027	UROLOGY	Urology	\N	14	t	t	2026-10-13 08:02:49.561	2026-10-13 08:08:05.735
35cc8b8b-da38-4cfc-a435-ae4465de8236	20ef8a32-80e8-4068-8601-0b69ffabe027	ONCOLOGY	Oncology	\N	15	t	t	2026-10-13 08:02:49.565	2026-10-13 08:08:05.736
bee94992-0eb9-4d08-bf5f-5571bd7d7520	20ef8a32-80e8-4068-8601-0b69ffabe027	ENDOCRINOLOGY	Endocrinology	\N	16	t	t	2026-10-13 08:02:49.569	2026-10-13 08:08:05.737
fc778883-d8ca-4334-aece-641cbd92dffd	addf97cb-4609-4983-9072-523b427b7ed8	RADIOLOGY	Radiology	\N	19	t	t	2026-10-13 07:58:09.491	2026-10-13 08:08:05.535
24fa769d-fa1b-4ff7-a98e-89662368932d	addf97cb-4609-4983-9072-523b427b7ed8	LABORATORY_MEDICINE	Laboratory Medicine	\N	20	t	t	2026-10-13 07:58:09.492	2026-10-13 08:08:05.536
54541c64-2f48-4993-b407-1b5e4c64c11f	addf97cb-4609-4983-9072-523b427b7ed8	ANESTHESIOLOGY	Anesthesiology	\N	21	t	t	2026-10-13 07:58:09.492	2026-10-13 08:08:05.537
947c9334-0027-4557-bdf5-bfd754708c6b	addf97cb-4609-4983-9072-523b427b7ed8	DENTISTRY	Dentistry	\N	22	t	t	2026-10-13 07:58:09.493	2026-10-13 08:08:05.538
7a3c787f-cdb7-4579-a8a9-4988ed559df8	addf97cb-4609-4983-9072-523b427b7ed8	PHYSIOTHERAPY	Physiotherapy & Rehabilitation	\N	23	t	t	2026-10-13 07:58:09.494	2026-10-13 08:08:05.539
a89aad0c-8942-4b31-aad5-033b2e6e8588	addf97cb-4609-4983-9072-523b427b7ed8	TRADITIONAL_MEDICINE	Traditional Medicine	\N	24	t	t	2026-10-13 07:58:09.495	2026-10-13 08:08:05.54
07fac518-776a-4351-a046-1c7ad6a49786	addf97cb-4609-4983-9072-523b427b7ed8	INTEGRATIVE_MEDICINE	Integrative Medicine	\N	25	t	t	2026-10-13 07:58:09.495	2026-10-13 08:08:05.541
1877b85d-32c0-4e2e-8650-c8cd3fd5143d	addf97cb-4609-4983-9072-523b427b7ed8	VETERINARY_MEDICINE	Veterinary Medicine	\N	26	t	t	2026-10-13 07:58:09.496	2026-10-13 08:08:05.542
dc1742af-6b2b-4b74-9647-4aee9943360b	e64604ef-6994-4f55-9a90-1045b2cebff9	PSYCHIATRY	Psychiatry	\N	10	t	t	2026-10-13 08:00:23.014	2026-10-13 08:08:05.629
44190a4c-7ed6-4ff3-bf38-9adc86084fa5	e64604ef-6994-4f55-9a90-1045b2cebff9	PULMONOLOGY	Pulmonology	\N	11	t	t	2026-10-13 08:00:23.015	2026-10-13 08:08:05.63
ab895e58-a718-462c-8518-be10b8258cc8	e64604ef-6994-4f55-9a90-1045b2cebff9	GASTROENTEROLOGY	Gastroenterology	\N	12	t	t	2026-10-13 08:00:23.016	2026-10-13 08:08:05.631
24c8b8d4-2f88-4cd6-9c1f-b664ad4b40b3	e64604ef-6994-4f55-9a90-1045b2cebff9	NEPHROLOGY	Nephrology	\N	13	t	t	2026-10-13 08:00:23.017	2026-10-13 08:08:05.632
6089edc9-20a5-449d-b408-70378bc3c442	e64604ef-6994-4f55-9a90-1045b2cebff9	UROLOGY	Urology	\N	14	t	t	2026-10-13 08:00:23.018	2026-10-13 08:08:05.633
43cac77a-437a-4088-b404-0c453b9b2e12	e64604ef-6994-4f55-9a90-1045b2cebff9	ONCOLOGY	Oncology	\N	15	t	t	2026-10-13 08:00:23.019	2026-10-13 08:08:05.634
6b6aa58a-561c-4457-9e5f-93960c6418c2	e64604ef-6994-4f55-9a90-1045b2cebff9	ENDOCRINOLOGY	Endocrinology	\N	16	t	t	2026-10-13 08:00:23.02	2026-10-13 08:08:05.635
72034b7c-3705-4fc8-b265-668fe2ab87cf	e64604ef-6994-4f55-9a90-1045b2cebff9	EMERGENCY_MEDICINE	Emergency Medicine	\N	17	t	t	2026-10-13 08:00:23.021	2026-10-13 08:08:05.636
522ca35e-55db-418a-9c9d-d2b9dcec0e3f	e64604ef-6994-4f55-9a90-1045b2cebff9	ICU	Intensive Care Unit	\N	18	t	t	2026-10-13 08:00:23.022	2026-10-13 08:08:05.637
9c5f7370-a121-4ff5-8a04-d544a2153704	e64604ef-6994-4f55-9a90-1045b2cebff9	RADIOLOGY	Radiology	\N	19	t	t	2026-10-13 08:00:23.023	2026-10-13 08:08:05.638
e2a2b678-7ea2-40d4-a5d9-8d0aec5a9981	e64604ef-6994-4f55-9a90-1045b2cebff9	LABORATORY_MEDICINE	Laboratory Medicine	\N	20	t	t	2026-10-13 08:00:23.024	2026-10-13 08:08:05.639
1bf25831-6a87-4f1a-9466-deb69dbbf81a	e64604ef-6994-4f55-9a90-1045b2cebff9	ANESTHESIOLOGY	Anesthesiology	\N	21	t	t	2026-10-13 08:00:23.025	2026-10-13 08:08:05.64
b306d6f4-50a9-49f2-94e7-a12f8994b8d5	e64604ef-6994-4f55-9a90-1045b2cebff9	DENTISTRY	Dentistry	\N	22	t	t	2026-10-13 08:00:23.026	2026-10-13 08:08:05.641
086c82ae-35e3-455c-9ff0-c5a3ade3194c	e64604ef-6994-4f55-9a90-1045b2cebff9	PHYSIOTHERAPY	Physiotherapy & Rehabilitation	\N	23	t	t	2026-10-13 08:00:23.027	2026-10-13 08:08:05.642
e5050c50-6d94-4ee8-8f23-49602b168289	e64604ef-6994-4f55-9a90-1045b2cebff9	TRADITIONAL_MEDICINE	Traditional Medicine	\N	24	t	t	2026-10-13 08:00:23.028	2026-10-13 08:08:05.643
43cf7367-4d41-4ab7-ae99-69a005a0512d	e64604ef-6994-4f55-9a90-1045b2cebff9	INTEGRATIVE_MEDICINE	Integrative Medicine	\N	25	t	t	2026-10-13 08:00:23.029	2026-10-13 08:08:05.644
554d604e-f126-452f-812f-2ad31e5d2202	e64604ef-6994-4f55-9a90-1045b2cebff9	VETERINARY_MEDICINE	Veterinary Medicine	\N	26	t	t	2026-10-13 08:00:23.03	2026-10-13 08:08:05.645
3c6bf88d-1b48-4b11-b5e7-efa15bf37700	20ef8a32-80e8-4068-8601-0b69ffabe027	EMERGENCY_MEDICINE	Emergency Medicine	\N	17	t	t	2026-10-13 08:02:49.573	2026-10-13 08:08:05.738
4daeae5d-dff6-45cf-b26a-f52ef030eccc	20ef8a32-80e8-4068-8601-0b69ffabe027	ICU	Intensive Care Unit	\N	18	t	t	2026-10-13 08:02:49.577	2026-10-13 08:08:05.739
9df30012-caf8-4118-9eaa-b2ca71dddb60	20ef8a32-80e8-4068-8601-0b69ffabe027	RADIOLOGY	Radiology	\N	19	t	t	2026-10-13 08:02:49.581	2026-10-13 08:08:05.74
7acd4146-3a18-4556-a109-6422cc7aa3f6	20ef8a32-80e8-4068-8601-0b69ffabe027	LABORATORY_MEDICINE	Laboratory Medicine	\N	20	t	t	2026-10-13 08:02:49.586	2026-10-13 08:08:05.741
849ed192-bec2-49b3-a735-6b5cccd712bc	20ef8a32-80e8-4068-8601-0b69ffabe027	ANESTHESIOLOGY	Anesthesiology	\N	21	t	t	2026-10-13 08:02:49.591	2026-10-13 08:08:05.742
2dae8e6c-417a-4932-ba3b-aae96054dd53	20ef8a32-80e8-4068-8601-0b69ffabe027	DENTISTRY	Dentistry	\N	22	t	t	2026-10-13 08:02:49.596	2026-10-13 08:08:05.743
fb8eb4c8-664e-49f5-98de-250cc4ab4ee4	20ef8a32-80e8-4068-8601-0b69ffabe027	PHYSIOTHERAPY	Physiotherapy & Rehabilitation	\N	23	t	t	2026-10-13 08:02:49.601	2026-10-13 08:08:05.744
f05a8c7e-d467-461e-a895-aedc2b1223b3	20ef8a32-80e8-4068-8601-0b69ffabe027	TRADITIONAL_MEDICINE	Traditional Medicine	\N	24	t	t	2026-10-13 08:02:49.605	2026-10-13 08:08:05.745
56260d0b-ab0b-4e9c-863f-4da28965cb99	20ef8a32-80e8-4068-8601-0b69ffabe027	INTEGRATIVE_MEDICINE	Integrative Medicine	\N	25	t	t	2026-10-13 08:02:49.609	2026-10-13 08:08:05.746
94542a63-a144-48c1-8e64-03f0ecb6783e	20ef8a32-80e8-4068-8601-0b69ffabe027	VETERINARY_MEDICINE	Veterinary Medicine	\N	26	t	t	2026-10-13 08:02:49.612	2026-10-13 08:08:05.747
\.


--
-- Data for Name: Diagnosis; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Diagnosis" (id, "medicalRecordId", code, name, "isPrimary", notes, "createdAt") FROM stdin;
22a8b783-c9ff-4b83-af6b-116bef4b431d	fd9a119c-2712-459b-8fad-32cfd89fccc3	GG.209	Diagnosis	t	test	2026-08-19 18:51:04.491
fb91b1bd-6eb7-4401-961b-68ec0ef04b44	d6eb6e20-d8ee-43e5-bd92-bc82caca0302	102 F	Fever	f	\N	2026-08-20 18:30:48.685
d93d5502-45f6-4db6-94ea-da135e3f97a7	d6eb6e20-d8ee-43e5-bd92-bc82caca0302	12.6	Hemoglobin	f	\N	2026-08-20 18:31:47.923
18a8075a-a5a8-4c6e-8a16-36b7277f39c5	de92efa8-c7aa-41b8-b466-e61db708ae01	101	Fever	t	\N	2026-09-07 19:10:31.915
fe418ea1-5ef4-4e1f-a6af-dc0c3e6efda8	de92efa8-c7aa-41b8-b466-e61db708ae01	212	Cholestrol	f	\N	2026-09-07 19:10:46.88
b2933a0a-1409-4562-b31a-995c66e3ab07	347e2d45-36cf-4dd8-b2e2-86a89b624c93	101	Fever	f	\N	2026-09-08 05:57:45.496
1a2a398f-90b8-4c5d-b629-b449610a2753	ce1b7f9c-046e-49d6-a800-ed377fd1ca56	test	tset	t	\N	2026-09-13 20:09:08.592
ce8da487-0c96-47cf-bf17-a2b2743c4b82	ce1b7f9c-046e-49d6-a800-ed377fd1ca56	test	tset	f	tset	2026-09-13 20:09:14.418
eee45f7f-c50b-4244-98c3-3c8edf457041	bf3ad5a2-ff03-4398-9e93-7aa65e80cc70	test	test	f	test	2026-09-13 20:45:00.561
5cc08211-24d2-4020-85ce-da7672041971	bf3ad5a2-ff03-4398-9e93-7aa65e80cc70	se	ser	f	sfd	2026-09-13 20:45:05.388
3fa7a7a2-620e-4dd9-81c3-d1d7095311e9	ac726de3-36e3-4cb9-ba58-3281a304c0ce	102	Fever	t	\N	2026-10-01 07:50:35.585
000cd42a-b543-4c77-8f8b-1d15e9e35e4c	5a874540-89c4-45df-8d47-c7d4347859ae	test	test	f	test	2026-10-05 09:14:36.267
f6bb7df3-30dc-4589-8166-b83faef06c24	083d2b2e-cd08-4dab-98e3-0aab767e694c	test	test	f	test	2026-10-06 18:42:46.622
4c6fa0fc-ac30-4ecb-8447-8e94f360f5a3	e7e39f18-cc75-4cde-8713-e91d6551ac57	test	test	f	test	2026-10-06 19:34:45.311
b73bab42-1ef5-48f7-8f6d-bf5d6c5374b8	1bb4bacf-08e6-48fb-84b6-f13e9198fc2c	etst	test	f	test	2026-10-06 19:37:38.98
3ab73ca3-bc6c-47d4-81d8-320ebbac64a3	a756c765-24a9-4023-969f-4d10814f905b	test	test	f	test	2026-10-07 05:27:49.958
c17cf98f-aa8e-40b4-bc77-6299c525a8d9	917c5a02-75fe-45fa-8568-09171e271a86	test	test	f	test	2026-10-13 11:07:07.596
\.


--
-- Data for Name: Doctor; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Doctor" (id, "clinicId", "doctorNumber", title, "firstName", "middleName", "lastName", gender, "dateOfBirth", email, phone, "photoUrl", "registrationNumber", biography, "yearsOfExperience", "employmentType", "departmentId", "primarySpecialtyId", "isSystem", "isActive", "createdAt", "updatedAt", "registrationCouncilId") FROM stdin;
0f296b02-cc35-4300-907b-875c56ea58ae	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0003	DR	Meera	\N	Nair	FEMALE	1986-07-22 00:00:00	meera.nair@clinexa.demo	+919810000003	\N	NMC-100003	\N	13	FULL_TIME	f46e98a8-bf8f-41f3-81e8-dbc5fcdcac85	6f3a3d15-f9d0-4489-b117-4f9b32bac6f5	f	t	2026-08-11 20:46:25.972	2026-08-14 18:14:48.591	488855a9-5a5a-4fb1-bb3d-2431361d99a2
174c789a-7711-4f26-85b9-1c04c4cbd634	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0004	DR	Priya	\N	Krishnan	FEMALE	1984-05-19 00:00:00	priya.krishnan@clinexa.demo	+919810000004	\N	NMC-100004	\N	17	FULL_TIME	fa9223cc-5ecd-43fa-9fdd-5e06dd85d0fa	53130bdc-236d-4b80-8fd3-a300a01b365f	f	t	2026-08-11 20:46:25.979	2026-08-14 18:14:48.598	488855a9-5a5a-4fb1-bb3d-2431361d99a2
d80aaf36-57f5-44f5-97c1-eb0ee261cede	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0005	DR	Arjun	\N	Iyer	MALE	1981-09-08 00:00:00	arjun.iyer@clinexa.demo	+919810000005	\N	NMC-100005	\N	20	CONSULTANT	fa9223cc-5ecd-43fa-9fdd-5e06dd85d0fa	769ac502-2715-4e96-a656-65b69b0faa39	f	t	2026-08-11 20:46:25.985	2026-08-14 18:14:48.606	488855a9-5a5a-4fb1-bb3d-2431361d99a2
184d5081-3076-412d-881e-ce4fc83e0337	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0006	DR	Rahul	\N	Nambiar	MALE	1983-06-14 00:00:00	rahul.nambiar@clinexa.demo	+919810000006	\N	NMC-100006	\N	16	FULL_TIME	4b857bfe-830b-4ff2-a298-6be709034534	92e7c7a2-020b-4f7c-b875-3ac2295623b9	f	t	2026-08-11 20:46:25.991	2026-08-14 18:14:48.613	488855a9-5a5a-4fb1-bb3d-2431361d99a2
5a97a895-9245-40ca-ab30-66290bb80368	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0007	DR	Karthik	\N	Menon	MALE	1982-02-21 00:00:00	karthik.menon@clinexa.demo	+919810000007	\N	NMC-100007	\N	17	CONSULTANT	1c588d86-37e2-4fb1-bb04-126a3bd683df	0ee734a4-b4bc-48e2-ace4-8a28d480e406	f	t	2026-08-11 20:46:25.997	2026-08-14 18:14:48.62	488855a9-5a5a-4fb1-bb3d-2431361d99a2
4c0cc13e-b989-4e46-ac02-49b58fc3661f	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0008	DR	Aparna	\N	Suresh	FEMALE	1983-10-29 00:00:00	aparna.suresh@clinexa.demo	+919810000008	\N	NMC-100008	\N	16	FULL_TIME	a8e9dc89-8342-4741-8878-c98b7a095be0	b6b220cd-33d5-4f27-ba36-a95594bec868	f	t	2026-08-11 20:46:26.002	2026-08-14 18:14:48.627	488855a9-5a5a-4fb1-bb3d-2431361d99a2
78513231-3782-42b6-b875-ffad63410246	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0009	DR	Nikhil	\N	George	MALE	1986-08-07 00:00:00	nikhil.george@clinexa.demo	+919810000009	\N	NMC-100009	\N	13	CONSULTANT	a8e9dc89-8342-4741-8878-c98b7a095be0	0f261ea7-223e-41d6-99ee-5d269e7cec45	f	t	2026-08-11 20:46:26.007	2026-08-14 18:14:48.634	488855a9-5a5a-4fb1-bb3d-2431361d99a2
1342f6ed-14c0-4499-b972-ff056a915547	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0010	DR	Swetha	\N	Reddy	FEMALE	1985-11-20 00:00:00	swetha.reddy@clinexa.demo	+919810000010	\N	NMC-100010	\N	14	FULL_TIME	dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	6ac2458f-0f57-4eb4-bcda-155861ab7abb	f	t	2026-08-11 20:46:26.013	2026-08-14 18:14:48.641	488855a9-5a5a-4fb1-bb3d-2431361d99a2
febb532c-34ff-41c3-8a1b-8f78be6c11e8	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0011	DR	Neha	\N	Thomas	FEMALE	1990-02-24 00:00:00	neha.thomas@clinexa.demo	+919810000011	\N	NMC-100011	\N	9	FULL_TIME	9af408a7-ca74-4286-a830-93af3fda2909	d5ffe1eb-8790-49e0-98e2-08412c5d1ef5	f	t	2026-08-11 20:46:26.019	2026-08-14 18:14:48.647	488855a9-5a5a-4fb1-bb3d-2431361d99a2
835cf67e-f838-4876-8f65-84c796ad667b	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0012	DR	Harish	\N	Bhat	MALE	1984-12-22 00:00:00	harish.bhat@clinexa.demo	+919810000012	\N	NMC-100012	\N	15	CONSULTANT	502cb19e-65ee-4abf-80ab-5c360c4f6bc9	d7b5484c-1c2f-482f-8d4f-c0fcae3bdf71	f	t	2026-08-11 20:46:26.024	2026-08-14 18:14:48.654	488855a9-5a5a-4fb1-bb3d-2431361d99a2
f9a42b2f-4bfb-47b0-aa6e-20690807096c	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0013	DR	Mohammed	\N	Faizal	MALE	1981-09-14 00:00:00	mohammed.faizal@clinexa.demo	+919810000013	\N	NMC-100013	\N	18	FULL_TIME	575101e5-40e0-45ce-b65c-a90cfcb18b6e	ee681c5c-1b53-4dd3-a430-680789206fe4	f	t	2026-08-11 20:46:26.029	2026-08-14 18:14:48.66	488855a9-5a5a-4fb1-bb3d-2431361d99a2
7fe5270c-75cf-482c-89d2-9addfddf7b26	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0014	DR	Maya	\N	Fernandes	FEMALE	1988-06-06 00:00:00	maya.fernandes@clinexa.demo	+919810000014	\N	NMC-100014	\N	11	FULL_TIME	a23a6fcf-36f4-482a-8338-41f16c335b40	68eac97e-9e8b-43d5-975d-94a676d96a29	f	t	2026-08-11 20:46:26.034	2026-08-14 18:14:48.667	488855a9-5a5a-4fb1-bb3d-2431361d99a2
10f619db-d99d-4116-ae4a-ff3ef9bed7a5	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0015	DR	Rohit	\N	Kulkarni	MALE	1983-09-23 00:00:00	rohit.kulkarni@clinexa.demo	+919810000015	\N	NMC-100015	\N	16	FULL_TIME	8b0ef4f0-4699-47c8-a0ef-13abcde15deb	8f3a58fb-3d1d-41c8-913f-66dfee5b083b	f	t	2026-08-11 20:46:26.04	2026-08-14 18:14:48.673	488855a9-5a5a-4fb1-bb3d-2431361d99a2
28d5754d-ee15-442a-8e1c-60d1ccdd875f	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0016	DR	Siddharth	\N	Joshi	MALE	1980-11-17 00:00:00	siddharth.joshi@clinexa.demo	+919810000016	\N	NMC-100016	\N	19	CONSULTANT	04e5bbaf-ea4d-41c4-8873-b5e4f6f28984	86942091-8bac-45a1-86c3-0c39b6e35e9b	f	t	2026-08-11 20:46:26.045	2026-08-14 18:14:48.68	488855a9-5a5a-4fb1-bb3d-2431361d99a2
92784d11-7cc2-4cca-a518-53c56b04ec4b	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0017	DR	Aditya	\N	Verma	MALE	1987-03-15 00:00:00	aditya.verma@clinexa.demo	+919810000017	\N	NMC-100017	\N	12	FULL_TIME	f79f3504-0423-4df9-ab81-63a0495250b9	c4dfd2b6-627e-407f-8d77-779260a805ea	f	t	2026-08-11 20:46:26.051	2026-08-14 18:14:48.686	488855a9-5a5a-4fb1-bb3d-2431361d99a2
43a69a6f-aee7-4657-81ae-50b76d55772e	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0018	DR	George	\N	Kurian	MALE	1977-05-25 00:00:00	george.kurian@clinexa.demo	+919810000018	\N	NMC-100018	\N	24	CONSULTANT	bf9ddfbe-4570-47e0-bdc2-8a2fbe027d7b	86cddef3-2c37-4cd6-8dc9-58245c219cb3	f	t	2026-08-11 20:46:26.057	2026-08-14 18:14:48.691	488855a9-5a5a-4fb1-bb3d-2431361d99a2
1bba5118-bbc8-4a76-9a83-acfd4f11a4dd	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0019	DR	Sowmya	\N	Hegde	FEMALE	1986-09-03 00:00:00	sowmya.hegde@clinexa.demo	+919810000019	\N	NMC-100019	\N	13	CONSULTANT	a70c2898-e286-4f24-b4e6-baa8c1402971	1a722c77-ea5c-4b96-9bf8-f87c71bacc6b	f	t	2026-08-11 20:46:26.062	2026-08-14 18:14:48.698	488855a9-5a5a-4fb1-bb3d-2431361d99a2
777afbad-dd8a-4ad1-a4cd-af5270121e43	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0020	DR	Pooja	\N	Desai	FEMALE	1989-11-26 00:00:00	pooja.desai@clinexa.demo	+919810000020	\N	NMC-100020	\N	10	FULL_TIME	1a6bf34c-3822-40cc-9dde-9e9a2b5cbf01	a28e377b-44c4-456b-b28c-a53ff3101ea7	f	t	2026-08-11 20:46:26.067	2026-08-14 18:14:48.704	488855a9-5a5a-4fb1-bb3d-2431361d99a2
54d01649-3552-4e2b-907e-820961ee92d2	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0021	DR	Varun	\N	Nambiar	MALE	1985-02-13 00:00:00	varun.nambiar@clinexa.demo	+919810000021	\N	NMC-100021	\N	14	FULL_TIME	1f7ef252-e8ba-47d3-bcc4-fde3588089e4	c32758ec-f2ed-486f-89d4-41a68103c099	f	t	2026-08-11 20:46:26.073	2026-08-14 18:14:48.71	488855a9-5a5a-4fb1-bb3d-2431361d99a2
a0fa7373-f8f7-4659-84e8-11d81177cd5d	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0022	DR	Thomas	\N	Mathew	MALE	1980-12-04 00:00:00	thomas.mathew@clinexa.demo	+919810000022	\N	NMC-100022	\N	19	CONSULTANT	aa833e8d-1b79-40bf-b923-2383f45ee290	38660968-a479-4096-9a79-7f1eb5ee36c7	f	t	2026-08-11 20:46:26.078	2026-08-14 18:14:48.716	488855a9-5a5a-4fb1-bb3d-2431361d99a2
02bb5091-f691-4ab4-9b17-43cb4284c568	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0023	DR	Ravi	\N	Chandra	MALE	1981-06-11 00:00:00	ravi.chandra@clinexa.demo	+919810000023	\N	NMC-100023	\N	18	CONSULTANT	c7de8d67-492d-4219-afa5-48fbccfb99f1	260eb8ad-26ae-40fa-95cd-7f33b8c4dabb	f	t	2026-08-11 20:46:26.083	2026-08-14 18:14:48.722	488855a9-5a5a-4fb1-bb3d-2431361d99a2
550403a7-6ed6-4aa7-b59d-bd934f1798aa	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0002	DR	Vivek	\N	Sharma	MALE	1979-11-02 00:00:00	vivek.sharma@clinexa.demo	+919810000002	\N	NMC-100002	\N	21	CONSULTANT	f46e98a8-bf8f-41f3-81e8-dbc5fcdcac85	9f7ce7a3-0c7e-4bf5-b482-04b54f5b5339	f	t	2026-08-11 20:46:25.965	2026-08-14 18:14:48.583	488855a9-5a5a-4fb1-bb3d-2431361d99a2
c3671d81-49dc-4081-b11e-bffcd8ff9390	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0026	DR	Ajay	\N	Mohan	MALE	1976-07-06 00:00:00	ajay.mohan@clinexa.demo	+919810000026	\N	DCI-100026	\N	24	CONSULTANT	0f066d2e-27c5-4a46-8a3c-66f250570bd0	48edf507-896a-4260-8e2e-3e7fabc0e2a1	f	t	2026-08-11 20:46:26.1	2026-08-14 18:14:48.74	c60852b8-bf92-48a7-a7b9-424202c7d93f
9d54836e-7a9e-40e0-99a0-0176ed0c2de8	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0027	DR	Shalini	\N	Menon	FEMALE	1983-05-10 00:00:00	shalini.menon@clinexa.demo	+919810000027	\N	RCI-100027	\N	17	FULL_TIME	7b69bc96-ca0f-40bf-91f3-7d9149faef7f	0c0f2674-8a1b-4e89-9537-796f51be93c5	f	t	2026-08-11 20:46:26.105	2026-08-14 18:14:48.746	f161bcd5-0308-4863-bf6d-aff63f3f04e6
c02dd68f-6967-44f3-a773-45d3c76730bd	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0028	DR	Suresh	\N	Kumar	MALE	1979-01-23 00:00:00	suresh.kumar@clinexa.demo	+919810000028	\N	AYU-100028	\N	21	CONSULTANT	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	5de96d58-0be9-4113-8a2e-734c475291a6	f	t	2026-08-11 20:46:26.111	2026-08-14 18:14:48.752	fd580c1c-805c-43d7-86fd-8fa2bbb12c4a
172c7927-eda7-4fe5-8046-e399f6e3c003	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0029	DR	Madhavi	\N	Rajan	FEMALE	1982-11-15 00:00:00	madhavi.rajan@clinexa.demo	+919810000029	\N	AYU-100029	\N	17	CONSULTANT	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	83c71b7a-50cb-4515-a35a-38d696fff28b	f	t	2026-08-11 20:46:26.116	2026-08-14 18:14:48.758	fd580c1c-805c-43d7-86fd-8fa2bbb12c4a
10ce291a-2fa2-4883-83ba-40c646ae19d5	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0030	DR	Kavya	\N	Raman	FEMALE	1989-08-12 00:00:00	kavya.raman@clinexa.demo	+919810000030	\N	NMC-100030	\N	10	CONSULTANT	0308bcf6-b65a-4971-83b3-9be8585c7c2d	ccf26db6-c8ef-41ef-be37-8e72a37c4405	f	t	2026-08-11 20:46:26.122	2026-08-14 18:14:48.764	488855a9-5a5a-4fb1-bb3d-2431361d99a2
f001ac2c-6ee1-4a7d-9dc6-1d83aaf5f796	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0031	DR	Asha	\N	Krishnan	FEMALE	1987-01-17 00:00:00	asha.krishnan@clinexa.demo	+919810000031	\N	NMC-100031	\N	12	FULL_TIME	0308bcf6-b65a-4971-83b3-9be8585c7c2d	58be48bd-2d30-4391-8497-2581dd2ceefe	f	t	2026-08-11 20:46:26.127	2026-08-14 18:14:48.77	488855a9-5a5a-4fb1-bb3d-2431361d99a2
066d66b0-90bc-49bd-8f01-6c7c5253c73b	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0032	DR	Ramesh	\N	Iyer	MALE	1975-08-18 00:00:00	ramesh.iyer@clinexa.demo	+919810000032	\N	VET-100032	\N	25	CONSULTANT	6ab49a23-e8a7-420d-8007-94c20201bbf9	e919c7fe-820f-4fb3-951a-fda89f372854	f	t	2026-08-11 20:46:26.133	2026-08-14 18:14:48.776	4092df0a-fe5f-409f-ba2c-ca4789fe3350
7abf4f1e-166f-44b3-bc74-2ec2cc1a3d07	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0033	DR	Anjali	\N	Menon	FEMALE	1988-05-21 00:00:00	anjali.menon@clinexa.demo	+919810000033	\N	VET-100033	\N	11	FULL_TIME	6ab49a23-e8a7-420d-8007-94c20201bbf9	a9192f6f-a676-4672-b535-dbfc168e2ff9	f	t	2026-08-11 20:46:26.138	2026-08-14 18:14:48.782	4092df0a-fe5f-409f-ba2c-ca4789fe3350
76d3fbfc-6273-4edb-8d4e-4c2455f6f7cb	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0034	DR	Divya	\N	Nandakumar	FEMALE	1987-04-02 00:00:00	divya.nandakumar@clinexa.demo	+919810000034	\N	AYUSH-100034	\N	12	FULL_TIME	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	7c7711cd-5195-4686-9324-f21f6a83ca29	f	t	2026-08-11 20:46:26.144	2026-08-14 18:14:48.788	fd580c1c-805c-43d7-86fd-8fa2bbb12c4a
91defdda-4ead-40b7-aab7-fefa3280ac4e	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0035	DR	Faisal	\N	Rahman	MALE	1980-06-27 00:00:00	faisal.rahman@clinexa.demo	+919810000035	\N	UNANI-100035	\N	19	CONSULTANT	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	870e867f-8e12-4f9b-a3fd-f4125cef86cd	f	t	2026-08-11 20:46:26.15	2026-08-14 18:14:48.794	fd580c1c-805c-43d7-86fd-8fa2bbb12c4a
4661d8e1-f639-4102-a9bc-16f742b69474	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0036	DR	Vikram	\N	Nair	MALE	1981-07-10 00:00:00	vikram.nair@clinexa.demo	+919810000036	\N	NMC-100036	\N	18	CONSULTANT	a70c2898-e286-4f24-b4e6-baa8c1402971	d55ca554-1b0d-4657-8b55-5e099fd64949	f	t	2026-08-11 20:46:26.155	2026-08-14 18:14:48.8	488855a9-5a5a-4fb1-bb3d-2431361d99a2
3c71e208-61f5-4fbd-9238-75e99ffae8b9	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0037	DR	Radhika	\N	Pillai	FEMALE	1982-02-09 00:00:00	radhika.pillai@clinexa.demo	+919810000037	\N	NMC-100037	\N	17	CONSULTANT	dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	443a3afb-5152-41de-902d-6802fdd36e6d	f	t	2026-08-11 20:46:26.163	2026-08-14 18:14:48.806	488855a9-5a5a-4fb1-bb3d-2431361d99a2
abf00b97-965d-4899-9bf8-77909631a24a	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0038	DR	Sneha	\N	Joseph	FEMALE	1989-03-28 00:00:00	sneha.joseph@clinexa.demo	+919810000038	\N	NMC-100038	\N	10	FULL_TIME	502cb19e-65ee-4abf-80ab-5c360c4f6bc9	d19649a1-3bbe-4493-aa3c-cce2b6600188	f	t	2026-08-11 20:46:26.168	2026-08-14 18:14:48.812	488855a9-5a5a-4fb1-bb3d-2431361d99a2
3d4b017e-1564-4ef4-b89d-e5ce060c81dc	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0039	DR	Sanjay	\N	Deshmukh	MALE	1977-12-05 00:00:00	sanjay.deshmukh@clinexa.demo	+919810000039	\N	NMC-100039	\N	22	CONSULTANT	9af408a7-ca74-4286-a830-93af3fda2909	2fd27a6b-fdc4-420e-90ab-5c90fb28d0c9	f	t	2026-08-11 20:46:26.173	2026-08-14 18:14:48.818	488855a9-5a5a-4fb1-bb3d-2431361d99a2
08bdc1f9-3ebd-4f3b-ac43-15d1c6ceba46	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0040	DR	Anu	\N	Joseph	FEMALE	1987-04-11 00:00:00	anu.joseph@clinexa.demo	+919810000040	\N	NMC-100040	\N	12	CONSULTANT	575101e5-40e0-45ce-b65c-a90cfcb18b6e	9e93d6dd-3aa8-402f-8464-e77f2e28af8b	f	t	2026-08-11 20:46:26.178	2026-08-14 18:14:48.824	488855a9-5a5a-4fb1-bb3d-2431361d99a2
01dbad9b-1f7a-452e-bbb5-6f2490ffba75	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0041	DR	Vivek	\N	Menon	MALE	1985-11-16 00:00:00	vivek.menon@clinexa.demo	+919810000041	\N	NMC-100041	\N	14	CONSULTANT	a23a6fcf-36f4-482a-8338-41f16c335b40	70928f63-c1f9-472e-8d19-5dedc38eb4e4	f	t	2026-08-11 20:46:26.183	2026-08-14 18:14:48.83	488855a9-5a5a-4fb1-bb3d-2431361d99a2
2b323394-8265-4b09-ac80-0bfa05d41fcf	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0042	DR	Amrita	\N	Sen	FEMALE	1985-01-08 00:00:00	amrita.sen@clinexa.demo	+919810000042	\N	NMC-100042	\N	14	CONSULTANT	8b0ef4f0-4699-47c8-a0ef-13abcde15deb	169c66c5-86e2-4165-96d4-4f4e04ad2bbd	f	t	2026-08-11 20:46:26.189	2026-08-14 18:14:48.835	488855a9-5a5a-4fb1-bb3d-2431361d99a2
ca170426-0794-48e8-8383-578eeac92d3c	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0043	DR	Deepa	\N	Nair	FEMALE	1984-03-31 00:00:00	deepa.nair@clinexa.demo	+919810000043	\N	NMC-100043	\N	15	FULL_TIME	04e5bbaf-ea4d-41c4-8873-b5e4f6f28984	ab57fd17-971a-4bb8-9db7-da807a62afbb	f	t	2026-08-11 20:46:26.193	2026-08-14 18:14:48.841	488855a9-5a5a-4fb1-bb3d-2431361d99a2
2c315d70-7794-4e53-bfbe-84fe3bde8e11	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0044	DR	Sanjay	\N	Rao	MALE	1978-03-12 00:00:00	sanjay.rao@clinexa.demo	+919810000044	\N	NMC-100044	\N	21	CONSULTANT	f46e98a8-bf8f-41f3-81e8-dbc5fcdcac85	e093c3b4-767b-426c-afe5-604dbeb0a96f	f	t	2026-08-11 20:46:26.199	2026-08-14 18:14:48.847	488855a9-5a5a-4fb1-bb3d-2431361d99a2
531e25da-61c1-42e7-bc9e-7c207bcb3a4f	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0045	DR	Lakshmi	\N	Varma	FEMALE	1987-06-17 00:00:00	lakshmi.varma@clinexa.demo	+919810000045	\N	NMC-100045	\N	12	FULL_TIME	1c588d86-37e2-4fb1-bb04-126a3bd683df	2db19c3a-029c-4aba-b931-3aae0dfff64f	f	t	2026-08-11 20:46:26.205	2026-08-14 18:14:48.853	488855a9-5a5a-4fb1-bb3d-2431361d99a2
20de8703-8180-464b-95b4-2454bd3e33d8	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0046	DR	Priyanka	\N	Das	FEMALE	1988-10-03 00:00:00	priyanka.das@clinexa.demo	+919810000046	\N	NMC-100046	\N	11	CONSULTANT	4b857bfe-830b-4ff2-a298-6be709034534	f2787921-adc2-4d48-838e-550ed116ce4f	f	t	2026-08-11 20:46:26.21	2026-08-14 18:14:48.859	488855a9-5a5a-4fb1-bb3d-2431361d99a2
4c27dc21-51c0-4d19-b6e1-1966f75d3da8	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0025	DR	Manoj	\N	Prasad	MALE	1978-10-09 00:00:00	manoj.prasad@clinexa.demo	+919810000025	\N	NMC-100025	\N	23	CONSULTANT	9b20acfd-af86-4659-9dbc-240e40ef4d13	0c13279b-6464-4e56-bd5a-d63bcd24987a	f	t	2026-08-11 20:46:26.094	2026-08-14 18:14:48.733	488855a9-5a5a-4fb1-bb3d-2431361d99a2
04193cd8-f1de-4d9f-b877-fa29143482a1	68dbd989-a659-454e-9492-e5490f18bea1	CLN-000004-DOC-000002	DR	Ann	\N	Pillai	FEMALE	1990-03-01 00:00:00	\N	+919902002001	\N	234234	\N	2	FULL_TIME	df87cf71-4827-4f73-986d-f2eb15482357	ee157e0a-60fe-490f-a9bd-6ed10c354986	f	t	2026-10-13 08:38:51.38	2026-10-13 08:38:51.38	488855a9-5a5a-4fb1-bb3d-2431361d99a2
bc1c6954-a25c-42f5-8b5b-825f943faec1	68dbd989-a659-454e-9492-e5490f18bea1	CLN-000004-DOC-000001	DR	Anjana	\N	Aravind	FEMALE	1983-10-05 00:00:00	\N	+918089930714	\N	123	\N	22	FULL_TIME	5a030306-27c1-4748-95e2-fd96adcbafb2	9913d9df-d4e7-40d2-9821-21d4dbbf39a3	f	t	2026-10-13 08:13:52.786	2026-10-13 10:45:54.002	488855a9-5a5a-4fb1-bb3d-2431361d99a2
d625bfae-ad48-465d-9f25-25f6c183d20a	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0024	DR	Irene	\N	DSouza	FEMALE	1983-12-30 00:00:00	irene.dsouza@clinexa.demo	+919810000024	\N	NMC-100024	\N	17	FULL_TIME	5602036d-8abb-489d-828a-48526b50f48c	3afb2ad7-3292-4536-bb58-04c7d68251d7	f	t	2026-08-11 20:46:26.089	2026-08-14 18:14:48.728	488855a9-5a5a-4fb1-bb3d-2431361d99a2
4680fff0-faf5-413d-aaff-fa98cfc3b071	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0047	DR	Nandita	\N	Shah	FEMALE	1986-02-16 00:00:00	nandita.shah@clinexa.demo	+919810000047	\N	NMC-100047	\N	13	FULL_TIME	0308bcf6-b65a-4971-83b3-9be8585c7c2d	e0256f27-f125-49f8-b84e-5d14615f74b0	f	t	2026-08-11 20:46:26.215	2026-08-14 18:14:48.864	488855a9-5a5a-4fb1-bb3d-2431361d99a2
6695e1ab-54ee-4a34-b468-0f2cd45442c7	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0048	DR	Faisal	\N	Rahman	MALE	1980-06-27 00:00:00	faisal.rahman2@clinexa.demo	+919810000048	\N	UNANI-100048	\N	19	CONSULTANT	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	870e867f-8e12-4f9b-a3fd-f4125cef86cd	f	t	2026-08-11 20:46:26.22	2026-08-14 18:14:48.871	fd580c1c-805c-43d7-86fd-8fa2bbb12c4a
c4a0f666-e165-4d48-944f-2827dbb3614d	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0049	DR	Anjali	\N	Menon	FEMALE	1988-05-21 00:00:00	anjali.menon2@clinexa.demo	+919810000049	\N	VET-100049	\N	11	FULL_TIME	6ab49a23-e8a7-420d-8007-94c20201bbf9	af8e61a5-6c43-45d5-a885-a0f2259c5f21	f	t	2026-08-11 20:46:26.225	2026-08-14 18:14:48.876	4092df0a-fe5f-409f-ba2c-ca4789fe3350
c05c8060-2b18-476b-ac5e-20e5ab07cf90	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0050	DR	Kavita	\N	Thomas	FEMALE	1987-01-27 00:00:00	kavita.thomas@clinexa.demo	+919810000050	\N	NMC-100050	\N	12	FULL_TIME	fa9223cc-5ecd-43fa-9fdd-5e06dd85d0fa	666451cd-114a-4f02-968d-5e7e2b8e0c2c	f	t	2026-08-11 20:46:26.231	2026-08-14 18:14:48.882	488855a9-5a5a-4fb1-bb3d-2431361d99a2
1a223b6c-d1b0-4d53-897d-3ce83ce9ca59	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-DOC-000001	DR	Aam	\N	Pillai	MALE	1980-04-19 00:00:00	sudheesh.s@gmail.com	+919895068679	\N	123	\N	10	FULL_TIME	f46e98a8-bf8f-41f3-81e8-dbc5fcdcac85	71b8b4e5-dcbf-4924-957a-6dc7a5adba2b	f	t	2026-10-02 09:07:34.939	2026-10-02 09:07:34.939	fd580c1c-805c-43d7-86fd-8fa2bbb12c4a
cdb4ae06-6b69-45e4-85f1-d0972be261a6	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-DOC-000002	DR	Sadhana	\N	Sargam	FEMALE	1990-03-01 00:00:00	sudheesh.s@gmail.com	+919895068679	\N	2222	\N	15	FULL_TIME	1c588d86-37e2-4fb1-bb04-126a3bd683df	352e7de7-6468-4c6d-94c2-63cf6b8b2572	f	t	2026-10-02 09:12:49.848	2026-10-02 09:12:49.848	488855a9-5a5a-4fb1-bb3d-2431361d99a2
180b3a62-0f8a-44dc-8742-df32235ef847	599b0d53-c901-47b1-95f4-d3e84420d02c	DOC-0001	DR	Ananya	\N	Menon	FEMALE	1982-04-18 00:00:00	ananya.menon@clinexa.demo	+919810000001	\N	NMC-100001	\N	16	FULL_TIME	f46e98a8-bf8f-41f3-81e8-dbc5fcdcac85	71b8b4e5-dcbf-4924-957a-6dc7a5adba2b	f	t	2026-08-11 20:46:25.952	2026-10-05 06:12:22.416	488855a9-5a5a-4fb1-bb3d-2431361d99a2
f4c10da7-4759-4fed-ac9d-81a741016178	e64604ef-6994-4f55-9a90-1045b2cebff9	CLN-000002-DOC-000001	DR	Anjana	\N	Aravind	MALE	\N	\N	+918089930714	\N	123	\N	22	FULL_TIME	75731436-117e-433c-8622-3dfbed434233	97cf598e-debe-41f1-90ea-7f477b58937b	f	t	2026-10-13 08:01:21.214	2026-10-13 08:01:21.214	488855a9-5a5a-4fb1-bb3d-2431361d99a2
\.


--
-- Data for Name: DoctorConsultationFee; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."DoctorConsultationFee" ("doctorId", "consultationFee", "followUpFee", "emergencyFee", "teleConsultationFee", "updatedAt") FROM stdin;
777afbad-dd8a-4ad1-a4cd-af5270121e43	1100.00	700.00	1600.00	850.00	2026-08-14 18:14:48.708
54d01649-3552-4e2b-907e-820961ee92d2	1000.00	650.00	1800.00	800.00	2026-08-14 18:14:48.714
a0fa7373-f8f7-4659-84e8-11d81177cd5d	1200.00	800.00	2200.00	950.00	2026-08-14 18:14:48.719
02bb5091-f691-4ab4-9b17-43cb4284c568	1000.00	650.00	1500.00	750.00	2026-08-14 18:14:48.725
d625bfae-ad48-465d-9f25-25f6c183d20a	900.00	550.00	1400.00	700.00	2026-08-14 18:14:48.731
4c27dc21-51c0-4d19-b6e1-1966f75d3da8	1200.00	800.00	1800.00	950.00	2026-08-14 18:14:48.737
c3671d81-49dc-4081-b11e-bffcd8ff9390	1000.00	650.00	1600.00	700.00	2026-08-14 18:14:48.743
9d54836e-7a9e-40e0-99a0-0176ed0c2de8	600.00	400.00	800.00	450.00	2026-08-14 18:14:48.749
c02dd68f-6967-44f3-a773-45d3c76730bd	700.00	450.00	1000.00	550.00	2026-08-14 18:14:48.755
172c7927-eda7-4fe5-8046-e399f6e3c003	850.00	550.00	1100.00	650.00	2026-08-14 18:14:48.761
10ce291a-2fa2-4883-83ba-40c646ae19d5	800.00	500.00	1200.00	650.00	2026-08-14 18:14:48.767
f001ac2c-6ee1-4a7d-9dc6-1d83aaf5f796	700.00	450.00	1000.00	550.00	2026-08-14 18:14:48.773
066d66b0-90bc-49bd-8f01-6c7c5253c73b	800.00	500.00	1300.00	600.00	2026-08-14 18:14:48.779
7abf4f1e-166f-44b3-bc74-2ec2cc1a3d07	1000.00	650.00	1600.00	750.00	2026-08-14 18:14:48.786
76d3fbfc-6273-4edb-8d4e-4c2455f6f7cb	700.00	450.00	1000.00	550.00	2026-08-14 18:14:48.792
91defdda-4ead-40b7-aab7-fefa3280ac4e	650.00	400.00	900.00	500.00	2026-08-14 18:14:48.798
4661d8e1-f639-4102-a9bc-16f742b69474	1400.00	900.00	2300.00	1100.00	2026-08-14 18:14:48.804
3c71e208-61f5-4fbd-9238-75e99ffae8b9	1300.00	850.00	2000.00	1000.00	2026-08-14 18:14:48.809
abf00b97-965d-4899-9bf8-77909631a24a	1000.00	650.00	1600.00	800.00	2026-08-14 18:14:48.815
2b323394-8265-4b09-ac80-0bfa05d41fcf	1100.00	700.00	1800.00	900.00	2026-08-14 18:14:48.839
ca170426-0794-48e8-8383-578eeac92d3c	1100.00	700.00	1800.00	900.00	2026-08-14 18:14:48.845
2c315d70-7794-4e53-bfbe-84fe3bde8e11	900.00	600.00	1500.00	750.00	2026-08-14 18:14:48.851
531e25da-61c1-42e7-bc9e-7c207bcb3a4f	1000.00	650.00	1700.00	800.00	2026-08-14 18:14:48.856
20de8703-8180-464b-95b4-2454bd3e33d8	1100.00	700.00	1700.00	900.00	2026-08-14 18:14:48.862
4680fff0-faf5-413d-aaff-fa98cfc3b071	900.00	600.00	1300.00	750.00	2026-08-14 18:14:48.868
6695e1ab-54ee-4a34-b468-0f2cd45442c7	650.00	400.00	900.00	500.00	2026-08-14 18:14:48.874
c4a0f666-e165-4d48-944f-2827dbb3614d	950.00	600.00	1500.00	700.00	2026-08-14 18:14:48.88
c05c8060-2b18-476b-ac5e-20e5ab07cf90	1200.00	800.00	1900.00	950.00	2026-08-14 18:14:48.886
04193cd8-f1de-4d9f-b877-fa29143482a1	300.00	\N	300.00	300.00	2026-10-13 08:38:51.386
bc1c6954-a25c-42f5-8b5b-825f943faec1	300.00	200.00	500.00	300.00	2026-10-13 10:45:54.028
180b3a62-0f8a-44dc-8742-df32235ef847	700.00	450.00	1200.00	600.00	2026-08-14 18:14:48.58
550403a7-6ed6-4aa7-b59d-bd934f1798aa	900.00	600.00	1500.00	750.00	2026-08-14 18:14:48.588
0f296b02-cc35-4300-907b-875c56ea58ae	800.00	500.00	1300.00	650.00	2026-08-14 18:14:48.595
174c789a-7711-4f26-85b9-1c04c4cbd634	1200.00	800.00	2000.00	1000.00	2026-08-14 18:14:48.603
d80aaf36-57f5-44f5-97c1-eb0ee261cede	1300.00	850.00	2200.00	1100.00	2026-08-14 18:14:48.61
184d5081-3076-412d-881e-ce4fc83e0337	1200.00	800.00	1900.00	950.00	2026-08-14 18:14:48.617
5a97a895-9245-40ca-ab30-66290bb80368	1200.00	750.00	2000.00	950.00	2026-08-14 18:14:48.625
4c0cc13e-b989-4e46-ac02-49b58fc3661f	800.00	500.00	1300.00	650.00	2026-08-14 18:14:48.632
78513231-3782-42b6-b875-ffad63410246	1100.00	700.00	1800.00	900.00	2026-08-14 18:14:48.638
1342f6ed-14c0-4499-b972-ff056a915547	1000.00	650.00	1800.00	800.00	2026-08-14 18:14:48.645
febb532c-34ff-41c3-8a1b-8f78be6c11e8	900.00	600.00	1400.00	750.00	2026-08-14 18:14:48.651
835cf67e-f838-4876-8f65-84c796ad667b	900.00	600.00	1500.00	700.00	2026-08-14 18:14:48.658
f9a42b2f-4bfb-47b0-aa6e-20690807096c	900.00	600.00	1400.00	750.00	2026-08-14 18:14:48.665
7fe5270c-75cf-482c-89d2-9addfddf7b26	1000.00	650.00	1500.00	800.00	2026-08-14 18:14:48.671
10f619db-d99d-4116-ae4a-ff3ef9bed7a5	1000.00	650.00	1700.00	800.00	2026-08-14 18:14:48.677
28d5754d-ee15-442a-8e1c-60d1ccdd875f	1200.00	800.00	1900.00	950.00	2026-08-14 18:14:48.683
92784d11-7cc2-4cca-a518-53c56b04ec4b	1100.00	700.00	1700.00	850.00	2026-08-14 18:14:48.689
43a69a6f-aee7-4657-81ae-50b76d55772e	1200.00	800.00	2000.00	1000.00	2026-08-14 18:14:48.695
1bba5118-bbc8-4a76-9a83-acfd4f11a4dd	1500.00	1000.00	2500.00	1200.00	2026-08-14 18:14:48.702
3d4b017e-1564-4ef4-b89d-e5ce060c81dc	1100.00	700.00	1700.00	900.00	2026-08-14 18:14:48.821
08bdc1f9-3ebd-4f3b-ac43-15d1c6ceba46	900.00	600.00	1400.00	750.00	2026-08-14 18:14:48.827
01dbad9b-1f7a-452e-bbb5-6f2490ffba75	1100.00	700.00	1600.00	850.00	2026-08-14 18:14:48.833
\.


--
-- Data for Name: DoctorLanguage; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."DoctorLanguage" ("doctorId", "languageId") FROM stdin;
550403a7-6ed6-4aa7-b59d-bd934f1798aa	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
550403a7-6ed6-4aa7-b59d-bd934f1798aa	d5994d02-cced-4214-9b59-401f70e88046
0f296b02-cc35-4300-907b-875c56ea58ae	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
0f296b02-cc35-4300-907b-875c56ea58ae	6d83edea-a308-4972-ab6f-49d18cdf2c3e
0f296b02-cc35-4300-907b-875c56ea58ae	74af52f8-d90d-4d91-ba8a-47234c79684b
174c789a-7711-4f26-85b9-1c04c4cbd634	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
174c789a-7711-4f26-85b9-1c04c4cbd634	6d83edea-a308-4972-ab6f-49d18cdf2c3e
174c789a-7711-4f26-85b9-1c04c4cbd634	d5994d02-cced-4214-9b59-401f70e88046
d80aaf36-57f5-44f5-97c1-eb0ee261cede	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
d80aaf36-57f5-44f5-97c1-eb0ee261cede	6d83edea-a308-4972-ab6f-49d18cdf2c3e
d80aaf36-57f5-44f5-97c1-eb0ee261cede	74af52f8-d90d-4d91-ba8a-47234c79684b
184d5081-3076-412d-881e-ce4fc83e0337	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
184d5081-3076-412d-881e-ce4fc83e0337	6d83edea-a308-4972-ab6f-49d18cdf2c3e
184d5081-3076-412d-881e-ce4fc83e0337	d5994d02-cced-4214-9b59-401f70e88046
5a97a895-9245-40ca-ab30-66290bb80368	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
5a97a895-9245-40ca-ab30-66290bb80368	6d83edea-a308-4972-ab6f-49d18cdf2c3e
5a97a895-9245-40ca-ab30-66290bb80368	d5994d02-cced-4214-9b59-401f70e88046
4c0cc13e-b989-4e46-ac02-49b58fc3661f	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
4c0cc13e-b989-4e46-ac02-49b58fc3661f	6d83edea-a308-4972-ab6f-49d18cdf2c3e
4c0cc13e-b989-4e46-ac02-49b58fc3661f	d5994d02-cced-4214-9b59-401f70e88046
78513231-3782-42b6-b875-ffad63410246	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
78513231-3782-42b6-b875-ffad63410246	6d83edea-a308-4972-ab6f-49d18cdf2c3e
78513231-3782-42b6-b875-ffad63410246	74af52f8-d90d-4d91-ba8a-47234c79684b
1342f6ed-14c0-4499-b972-ff056a915547	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
1342f6ed-14c0-4499-b972-ff056a915547	d5994d02-cced-4214-9b59-401f70e88046
1342f6ed-14c0-4499-b972-ff056a915547	eebaca0c-b98b-4557-b38c-29d9af4028db
febb532c-34ff-41c3-8a1b-8f78be6c11e8	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
febb532c-34ff-41c3-8a1b-8f78be6c11e8	6d83edea-a308-4972-ab6f-49d18cdf2c3e
835cf67e-f838-4876-8f65-84c796ad667b	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
835cf67e-f838-4876-8f65-84c796ad667b	d5994d02-cced-4214-9b59-401f70e88046
835cf67e-f838-4876-8f65-84c796ad667b	f862af3c-aa11-42f5-ba09-05d2188df03b
f9a42b2f-4bfb-47b0-aa6e-20690807096c	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
f9a42b2f-4bfb-47b0-aa6e-20690807096c	6d83edea-a308-4972-ab6f-49d18cdf2c3e
f9a42b2f-4bfb-47b0-aa6e-20690807096c	77f63852-acac-42b1-9e1c-bedc151ce436
7fe5270c-75cf-482c-89d2-9addfddf7b26	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
7fe5270c-75cf-482c-89d2-9addfddf7b26	6d83edea-a308-4972-ab6f-49d18cdf2c3e
7fe5270c-75cf-482c-89d2-9addfddf7b26	d5994d02-cced-4214-9b59-401f70e88046
10f619db-d99d-4116-ae4a-ff3ef9bed7a5	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
10f619db-d99d-4116-ae4a-ff3ef9bed7a5	d5994d02-cced-4214-9b59-401f70e88046
10f619db-d99d-4116-ae4a-ff3ef9bed7a5	964e2d92-c622-4019-8e00-cc34bb41d33f
28d5754d-ee15-442a-8e1c-60d1ccdd875f	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
28d5754d-ee15-442a-8e1c-60d1ccdd875f	d5994d02-cced-4214-9b59-401f70e88046
28d5754d-ee15-442a-8e1c-60d1ccdd875f	964e2d92-c622-4019-8e00-cc34bb41d33f
92784d11-7cc2-4cca-a518-53c56b04ec4b	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
92784d11-7cc2-4cca-a518-53c56b04ec4b	d5994d02-cced-4214-9b59-401f70e88046
43a69a6f-aee7-4657-81ae-50b76d55772e	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
43a69a6f-aee7-4657-81ae-50b76d55772e	6d83edea-a308-4972-ab6f-49d18cdf2c3e
43a69a6f-aee7-4657-81ae-50b76d55772e	d5994d02-cced-4214-9b59-401f70e88046
1bba5118-bbc8-4a76-9a83-acfd4f11a4dd	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
1bba5118-bbc8-4a76-9a83-acfd4f11a4dd	d5994d02-cced-4214-9b59-401f70e88046
1bba5118-bbc8-4a76-9a83-acfd4f11a4dd	f862af3c-aa11-42f5-ba09-05d2188df03b
777afbad-dd8a-4ad1-a4cd-af5270121e43	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
777afbad-dd8a-4ad1-a4cd-af5270121e43	d5994d02-cced-4214-9b59-401f70e88046
777afbad-dd8a-4ad1-a4cd-af5270121e43	d5883233-4612-47a6-979f-cefe686078af
54d01649-3552-4e2b-907e-820961ee92d2	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
54d01649-3552-4e2b-907e-820961ee92d2	6d83edea-a308-4972-ab6f-49d18cdf2c3e
54d01649-3552-4e2b-907e-820961ee92d2	d5994d02-cced-4214-9b59-401f70e88046
a0fa7373-f8f7-4659-84e8-11d81177cd5d	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
a0fa7373-f8f7-4659-84e8-11d81177cd5d	6d83edea-a308-4972-ab6f-49d18cdf2c3e
02bb5091-f691-4ab4-9b17-43cb4284c568	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
02bb5091-f691-4ab4-9b17-43cb4284c568	d5994d02-cced-4214-9b59-401f70e88046
02bb5091-f691-4ab4-9b17-43cb4284c568	eebaca0c-b98b-4557-b38c-29d9af4028db
d625bfae-ad48-465d-9f25-25f6c183d20a	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
d625bfae-ad48-465d-9f25-25f6c183d20a	6d83edea-a308-4972-ab6f-49d18cdf2c3e
d625bfae-ad48-465d-9f25-25f6c183d20a	d5994d02-cced-4214-9b59-401f70e88046
4c27dc21-51c0-4d19-b6e1-1966f75d3da8	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
4c27dc21-51c0-4d19-b6e1-1966f75d3da8	6d83edea-a308-4972-ab6f-49d18cdf2c3e
4c27dc21-51c0-4d19-b6e1-1966f75d3da8	d5994d02-cced-4214-9b59-401f70e88046
c3671d81-49dc-4081-b11e-bffcd8ff9390	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
c3671d81-49dc-4081-b11e-bffcd8ff9390	6d83edea-a308-4972-ab6f-49d18cdf2c3e
c3671d81-49dc-4081-b11e-bffcd8ff9390	d5994d02-cced-4214-9b59-401f70e88046
9d54836e-7a9e-40e0-99a0-0176ed0c2de8	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
9d54836e-7a9e-40e0-99a0-0176ed0c2de8	6d83edea-a308-4972-ab6f-49d18cdf2c3e
9d54836e-7a9e-40e0-99a0-0176ed0c2de8	d5994d02-cced-4214-9b59-401f70e88046
c02dd68f-6967-44f3-a773-45d3c76730bd	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
c02dd68f-6967-44f3-a773-45d3c76730bd	6d83edea-a308-4972-ab6f-49d18cdf2c3e
c02dd68f-6967-44f3-a773-45d3c76730bd	d5994d02-cced-4214-9b59-401f70e88046
172c7927-eda7-4fe5-8046-e399f6e3c003	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
172c7927-eda7-4fe5-8046-e399f6e3c003	6d83edea-a308-4972-ab6f-49d18cdf2c3e
172c7927-eda7-4fe5-8046-e399f6e3c003	74af52f8-d90d-4d91-ba8a-47234c79684b
10ce291a-2fa2-4883-83ba-40c646ae19d5	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
10ce291a-2fa2-4883-83ba-40c646ae19d5	6d83edea-a308-4972-ab6f-49d18cdf2c3e
10ce291a-2fa2-4883-83ba-40c646ae19d5	74af52f8-d90d-4d91-ba8a-47234c79684b
f001ac2c-6ee1-4a7d-9dc6-1d83aaf5f796	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
f001ac2c-6ee1-4a7d-9dc6-1d83aaf5f796	6d83edea-a308-4972-ab6f-49d18cdf2c3e
f001ac2c-6ee1-4a7d-9dc6-1d83aaf5f796	d5994d02-cced-4214-9b59-401f70e88046
066d66b0-90bc-49bd-8f01-6c7c5253c73b	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
066d66b0-90bc-49bd-8f01-6c7c5253c73b	6d83edea-a308-4972-ab6f-49d18cdf2c3e
066d66b0-90bc-49bd-8f01-6c7c5253c73b	74af52f8-d90d-4d91-ba8a-47234c79684b
7abf4f1e-166f-44b3-bc74-2ec2cc1a3d07	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
7abf4f1e-166f-44b3-bc74-2ec2cc1a3d07	6d83edea-a308-4972-ab6f-49d18cdf2c3e
7abf4f1e-166f-44b3-bc74-2ec2cc1a3d07	d5994d02-cced-4214-9b59-401f70e88046
76d3fbfc-6273-4edb-8d4e-4c2455f6f7cb	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
76d3fbfc-6273-4edb-8d4e-4c2455f6f7cb	6d83edea-a308-4972-ab6f-49d18cdf2c3e
76d3fbfc-6273-4edb-8d4e-4c2455f6f7cb	d5994d02-cced-4214-9b59-401f70e88046
91defdda-4ead-40b7-aab7-fefa3280ac4e	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
91defdda-4ead-40b7-aab7-fefa3280ac4e	d5994d02-cced-4214-9b59-401f70e88046
91defdda-4ead-40b7-aab7-fefa3280ac4e	617afc22-6db8-43d6-b7e9-fd9fcb2aed40
4661d8e1-f639-4102-a9bc-16f742b69474	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
4661d8e1-f639-4102-a9bc-16f742b69474	6d83edea-a308-4972-ab6f-49d18cdf2c3e
4661d8e1-f639-4102-a9bc-16f742b69474	d5994d02-cced-4214-9b59-401f70e88046
3c71e208-61f5-4fbd-9238-75e99ffae8b9	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
3c71e208-61f5-4fbd-9238-75e99ffae8b9	6d83edea-a308-4972-ab6f-49d18cdf2c3e
3c71e208-61f5-4fbd-9238-75e99ffae8b9	d5994d02-cced-4214-9b59-401f70e88046
abf00b97-965d-4899-9bf8-77909631a24a	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
abf00b97-965d-4899-9bf8-77909631a24a	6d83edea-a308-4972-ab6f-49d18cdf2c3e
3d4b017e-1564-4ef4-b89d-e5ce060c81dc	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
3d4b017e-1564-4ef4-b89d-e5ce060c81dc	d5994d02-cced-4214-9b59-401f70e88046
3d4b017e-1564-4ef4-b89d-e5ce060c81dc	964e2d92-c622-4019-8e00-cc34bb41d33f
08bdc1f9-3ebd-4f3b-ac43-15d1c6ceba46	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
08bdc1f9-3ebd-4f3b-ac43-15d1c6ceba46	6d83edea-a308-4972-ab6f-49d18cdf2c3e
08bdc1f9-3ebd-4f3b-ac43-15d1c6ceba46	d5994d02-cced-4214-9b59-401f70e88046
01dbad9b-1f7a-452e-bbb5-6f2490ffba75	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
01dbad9b-1f7a-452e-bbb5-6f2490ffba75	6d83edea-a308-4972-ab6f-49d18cdf2c3e
01dbad9b-1f7a-452e-bbb5-6f2490ffba75	d5994d02-cced-4214-9b59-401f70e88046
2b323394-8265-4b09-ac80-0bfa05d41fcf	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
2b323394-8265-4b09-ac80-0bfa05d41fcf	d5994d02-cced-4214-9b59-401f70e88046
2b323394-8265-4b09-ac80-0bfa05d41fcf	60648b43-ddfb-49f7-a692-30e9abeedb84
ca170426-0794-48e8-8383-578eeac92d3c	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
ca170426-0794-48e8-8383-578eeac92d3c	6d83edea-a308-4972-ab6f-49d18cdf2c3e
ca170426-0794-48e8-8383-578eeac92d3c	74af52f8-d90d-4d91-ba8a-47234c79684b
2c315d70-7794-4e53-bfbe-84fe3bde8e11	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
2c315d70-7794-4e53-bfbe-84fe3bde8e11	d5994d02-cced-4214-9b59-401f70e88046
2c315d70-7794-4e53-bfbe-84fe3bde8e11	f862af3c-aa11-42f5-ba09-05d2188df03b
531e25da-61c1-42e7-bc9e-7c207bcb3a4f	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
531e25da-61c1-42e7-bc9e-7c207bcb3a4f	6d83edea-a308-4972-ab6f-49d18cdf2c3e
20de8703-8180-464b-95b4-2454bd3e33d8	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
20de8703-8180-464b-95b4-2454bd3e33d8	d5994d02-cced-4214-9b59-401f70e88046
20de8703-8180-464b-95b4-2454bd3e33d8	60648b43-ddfb-49f7-a692-30e9abeedb84
4680fff0-faf5-413d-aaff-fa98cfc3b071	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
4680fff0-faf5-413d-aaff-fa98cfc3b071	d5994d02-cced-4214-9b59-401f70e88046
4680fff0-faf5-413d-aaff-fa98cfc3b071	d5883233-4612-47a6-979f-cefe686078af
6695e1ab-54ee-4a34-b468-0f2cd45442c7	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
6695e1ab-54ee-4a34-b468-0f2cd45442c7	d5994d02-cced-4214-9b59-401f70e88046
6695e1ab-54ee-4a34-b468-0f2cd45442c7	617afc22-6db8-43d6-b7e9-fd9fcb2aed40
c4a0f666-e165-4d48-944f-2827dbb3614d	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
c4a0f666-e165-4d48-944f-2827dbb3614d	6d83edea-a308-4972-ab6f-49d18cdf2c3e
c4a0f666-e165-4d48-944f-2827dbb3614d	d5994d02-cced-4214-9b59-401f70e88046
c05c8060-2b18-476b-ac5e-20e5ab07cf90	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
c05c8060-2b18-476b-ac5e-20e5ab07cf90	6d83edea-a308-4972-ab6f-49d18cdf2c3e
1a223b6c-d1b0-4d53-897d-3ce83ce9ca59	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
1a223b6c-d1b0-4d53-897d-3ce83ce9ca59	6d83edea-a308-4972-ab6f-49d18cdf2c3e
cdb4ae06-6b69-45e4-85f1-d0972be261a6	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
cdb4ae06-6b69-45e4-85f1-d0972be261a6	d5994d02-cced-4214-9b59-401f70e88046
180b3a62-0f8a-44dc-8742-df32235ef847	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
180b3a62-0f8a-44dc-8742-df32235ef847	6d83edea-a308-4972-ab6f-49d18cdf2c3e
180b3a62-0f8a-44dc-8742-df32235ef847	d5994d02-cced-4214-9b59-401f70e88046
f4c10da7-4759-4fed-ac9d-81a741016178	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
f4c10da7-4759-4fed-ac9d-81a741016178	6d83edea-a308-4972-ab6f-49d18cdf2c3e
04193cd8-f1de-4d9f-b877-fa29143482a1	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
04193cd8-f1de-4d9f-b877-fa29143482a1	6d83edea-a308-4972-ab6f-49d18cdf2c3e
bc1c6954-a25c-42f5-8b5b-825f943faec1	7c25ce1f-ce6e-470d-9126-fa2ef7bbba21
bc1c6954-a25c-42f5-8b5b-825f943faec1	6d83edea-a308-4972-ab6f-49d18cdf2c3e
\.


--
-- Data for Name: DoctorQualification; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."DoctorQualification" ("doctorId", "qualificationId", institution, "yearCompleted") FROM stdin;
550403a7-6ed6-4aa7-b59d-bd934f1798aa	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
550403a7-6ed6-4aa7-b59d-bd934f1798aa	d789306d-ffd2-4bba-9c14-a50b5124cd15	\N	\N
0f296b02-cc35-4300-907b-875c56ea58ae	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
0f296b02-cc35-4300-907b-875c56ea58ae	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
174c789a-7711-4f26-85b9-1c04c4cbd634	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
174c789a-7711-4f26-85b9-1c04c4cbd634	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
174c789a-7711-4f26-85b9-1c04c4cbd634	5e276ccd-da10-4507-845b-43bb6420ed17	\N	\N
d80aaf36-57f5-44f5-97c1-eb0ee261cede	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
d80aaf36-57f5-44f5-97c1-eb0ee261cede	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
d80aaf36-57f5-44f5-97c1-eb0ee261cede	5e276ccd-da10-4507-845b-43bb6420ed17	\N	\N
184d5081-3076-412d-881e-ce4fc83e0337	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
184d5081-3076-412d-881e-ce4fc83e0337	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
184d5081-3076-412d-881e-ce4fc83e0337	7d64edc9-be56-452c-a71a-ea77dfdabf6c	\N	\N
5a97a895-9245-40ca-ab30-66290bb80368	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
5a97a895-9245-40ca-ab30-66290bb80368	3952e024-a4f0-4a15-9a68-bfbfc2efbd22	\N	\N
4c0cc13e-b989-4e46-ac02-49b58fc3661f	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
4c0cc13e-b989-4e46-ac02-49b58fc3661f	fe27c6a7-ad84-4830-a950-7624a4a2ecf0	\N	\N
78513231-3782-42b6-b875-ffad63410246	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
78513231-3782-42b6-b875-ffad63410246	fe27c6a7-ad84-4830-a950-7624a4a2ecf0	\N	\N
78513231-3782-42b6-b875-ffad63410246	eacdf9da-072d-44ca-8288-1cafd06d9195	\N	\N
1342f6ed-14c0-4499-b972-ff056a915547	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
1342f6ed-14c0-4499-b972-ff056a915547	5470f2cc-0238-4697-9620-5e809c18a0ee	\N	\N
febb532c-34ff-41c3-8a1b-8f78be6c11e8	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
febb532c-34ff-41c3-8a1b-8f78be6c11e8	57f56a93-dcdb-424f-977a-ecc8a010ae64	\N	\N
835cf67e-f838-4876-8f65-84c796ad667b	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
835cf67e-f838-4876-8f65-84c796ad667b	0ce7be6c-84cd-40f3-b80c-b181287bfba5	\N	\N
f9a42b2f-4bfb-47b0-aa6e-20690807096c	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
f9a42b2f-4bfb-47b0-aa6e-20690807096c	6a45d73f-85cc-4d63-91b8-5ae9e909a045	\N	\N
7fe5270c-75cf-482c-89d2-9addfddf7b26	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
7fe5270c-75cf-482c-89d2-9addfddf7b26	8b6f63be-8bf4-4303-8551-1e3293ede524	\N	\N
10f619db-d99d-4116-ae4a-ff3ef9bed7a5	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
10f619db-d99d-4116-ae4a-ff3ef9bed7a5	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
28d5754d-ee15-442a-8e1c-60d1ccdd875f	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
28d5754d-ee15-442a-8e1c-60d1ccdd875f	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
28d5754d-ee15-442a-8e1c-60d1ccdd875f	be319dd0-dfa0-4704-abeb-a62b3fdd96f7	\N	\N
92784d11-7cc2-4cca-a518-53c56b04ec4b	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
92784d11-7cc2-4cca-a518-53c56b04ec4b	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
92784d11-7cc2-4cca-a518-53c56b04ec4b	afb0c74c-0dbe-4ed9-a429-65fd0e97a2e5	\N	\N
43a69a6f-aee7-4657-81ae-50b76d55772e	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
43a69a6f-aee7-4657-81ae-50b76d55772e	1c459629-1551-4bef-9bf2-5339817d2c8c	\N	\N
43a69a6f-aee7-4657-81ae-50b76d55772e	0179d57b-c33d-42ff-ac52-b48acbde6555	\N	\N
1bba5118-bbc8-4a76-9a83-acfd4f11a4dd	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
1bba5118-bbc8-4a76-9a83-acfd4f11a4dd	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
1bba5118-bbc8-4a76-9a83-acfd4f11a4dd	72ed8eb4-450c-4fdb-90ce-3a1aed8442c2	\N	\N
777afbad-dd8a-4ad1-a4cd-af5270121e43	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
777afbad-dd8a-4ad1-a4cd-af5270121e43	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
777afbad-dd8a-4ad1-a4cd-af5270121e43	ce640549-f86e-42b6-9149-4ee72f1b4c8f	\N	\N
54d01649-3552-4e2b-907e-820961ee92d2	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
54d01649-3552-4e2b-907e-820961ee92d2	7fc512b7-1d07-419f-8dae-7e589a3391b1	\N	\N
a0fa7373-f8f7-4659-84e8-11d81177cd5d	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
a0fa7373-f8f7-4659-84e8-11d81177cd5d	abf58eff-8833-4d4f-b412-249cd6419f00	\N	\N
02bb5091-f691-4ab4-9b17-43cb4284c568	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
02bb5091-f691-4ab4-9b17-43cb4284c568	b17d7752-59c5-43f1-89cf-c4dba6454650	\N	\N
d625bfae-ad48-465d-9f25-25f6c183d20a	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
d625bfae-ad48-465d-9f25-25f6c183d20a	85156268-de00-4fec-a9f5-cf9579ca1fec	\N	\N
4c27dc21-51c0-4d19-b6e1-1966f75d3da8	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
4c27dc21-51c0-4d19-b6e1-1966f75d3da8	abf58eff-8833-4d4f-b412-249cd6419f00	\N	\N
4c27dc21-51c0-4d19-b6e1-1966f75d3da8	6b8924b2-7c67-4be5-bb34-5abfd5c42117	\N	\N
c3671d81-49dc-4081-b11e-bffcd8ff9390	f1bab254-8e8e-42f6-af62-f6ef8935608d	\N	\N
c3671d81-49dc-4081-b11e-bffcd8ff9390	b463f269-22a3-4818-9939-1b80466cf7a4	\N	\N
9d54836e-7a9e-40e0-99a0-0176ed0c2de8	46b20d0c-0bcc-4c7b-b5c3-311b6313f065	\N	\N
9d54836e-7a9e-40e0-99a0-0176ed0c2de8	6c7fbb18-2c2d-4827-b7e7-7104a2ac6c00	\N	\N
c02dd68f-6967-44f3-a773-45d3c76730bd	5a60d0c0-610f-4524-bbd8-f15926a93e36	\N	\N
c02dd68f-6967-44f3-a773-45d3c76730bd	f2e1f45c-cf72-4d18-999a-981155967519	\N	\N
172c7927-eda7-4fe5-8046-e399f6e3c003	5a60d0c0-610f-4524-bbd8-f15926a93e36	\N	\N
172c7927-eda7-4fe5-8046-e399f6e3c003	f2e1f45c-cf72-4d18-999a-981155967519	\N	\N
10ce291a-2fa2-4883-83ba-40c646ae19d5	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
10ce291a-2fa2-4883-83ba-40c646ae19d5	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
f001ac2c-6ee1-4a7d-9dc6-1d83aaf5f796	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
f001ac2c-6ee1-4a7d-9dc6-1d83aaf5f796	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
066d66b0-90bc-49bd-8f01-6c7c5253c73b	e95211f5-5c0c-46b3-b782-46e552f780e2	\N	\N
066d66b0-90bc-49bd-8f01-6c7c5253c73b	29a9b00b-82be-4660-87a1-8b91fe698cff	\N	\N
7abf4f1e-166f-44b3-bc74-2ec2cc1a3d07	e95211f5-5c0c-46b3-b782-46e552f780e2	\N	\N
7abf4f1e-166f-44b3-bc74-2ec2cc1a3d07	29a9b00b-82be-4660-87a1-8b91fe698cff	\N	\N
76d3fbfc-6273-4edb-8d4e-4c2455f6f7cb	47d158f3-d0e5-49b4-a91d-717432f7e395	\N	\N
91defdda-4ead-40b7-aab7-fefa3280ac4e	a81f0ee7-05a7-4b48-ab57-7974f87bcd72	\N	\N
91defdda-4ead-40b7-aab7-fefa3280ac4e	f07c8e82-413c-4e1c-989f-efdb2af01ae9	\N	\N
4661d8e1-f639-4102-a9bc-16f742b69474	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
4661d8e1-f639-4102-a9bc-16f742b69474	1c459629-1551-4bef-9bf2-5339817d2c8c	\N	\N
3c71e208-61f5-4fbd-9238-75e99ffae8b9	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
3c71e208-61f5-4fbd-9238-75e99ffae8b9	5470f2cc-0238-4697-9620-5e809c18a0ee	\N	\N
abf00b97-965d-4899-9bf8-77909631a24a	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
abf00b97-965d-4899-9bf8-77909631a24a	0ce7be6c-84cd-40f3-b80c-b181287bfba5	\N	\N
3d4b017e-1564-4ef4-b89d-e5ce060c81dc	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
3d4b017e-1564-4ef4-b89d-e5ce060c81dc	57f56a93-dcdb-424f-977a-ecc8a010ae64	\N	\N
08bdc1f9-3ebd-4f3b-ac43-15d1c6ceba46	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
08bdc1f9-3ebd-4f3b-ac43-15d1c6ceba46	6a45d73f-85cc-4d63-91b8-5ae9e909a045	\N	\N
01dbad9b-1f7a-452e-bbb5-6f2490ffba75	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
01dbad9b-1f7a-452e-bbb5-6f2490ffba75	8b6f63be-8bf4-4303-8551-1e3293ede524	\N	\N
2b323394-8265-4b09-ac80-0bfa05d41fcf	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
2b323394-8265-4b09-ac80-0bfa05d41fcf	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
ca170426-0794-48e8-8383-578eeac92d3c	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
ca170426-0794-48e8-8383-578eeac92d3c	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
ca170426-0794-48e8-8383-578eeac92d3c	be319dd0-dfa0-4704-abeb-a62b3fdd96f7	\N	\N
2c315d70-7794-4e53-bfbe-84fe3bde8e11	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
2c315d70-7794-4e53-bfbe-84fe3bde8e11	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
531e25da-61c1-42e7-bc9e-7c207bcb3a4f	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
531e25da-61c1-42e7-bc9e-7c207bcb3a4f	3952e024-a4f0-4a15-9a68-bfbfc2efbd22	\N	\N
20de8703-8180-464b-95b4-2454bd3e33d8	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
20de8703-8180-464b-95b4-2454bd3e33d8	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
20de8703-8180-464b-95b4-2454bd3e33d8	7d64edc9-be56-452c-a71a-ea77dfdabf6c	\N	\N
4680fff0-faf5-413d-aaff-fa98cfc3b071	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
4680fff0-faf5-413d-aaff-fa98cfc3b071	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
6695e1ab-54ee-4a34-b468-0f2cd45442c7	a81f0ee7-05a7-4b48-ab57-7974f87bcd72	\N	\N
6695e1ab-54ee-4a34-b468-0f2cd45442c7	f07c8e82-413c-4e1c-989f-efdb2af01ae9	\N	\N
c4a0f666-e165-4d48-944f-2827dbb3614d	e95211f5-5c0c-46b3-b782-46e552f780e2	\N	\N
c4a0f666-e165-4d48-944f-2827dbb3614d	29a9b00b-82be-4660-87a1-8b91fe698cff	\N	\N
c05c8060-2b18-476b-ac5e-20e5ab07cf90	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
c05c8060-2b18-476b-ac5e-20e5ab07cf90	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
c05c8060-2b18-476b-ac5e-20e5ab07cf90	5e276ccd-da10-4507-845b-43bb6420ed17	\N	\N
1a223b6c-d1b0-4d53-897d-3ce83ce9ca59	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
1a223b6c-d1b0-4d53-897d-3ce83ce9ca59	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
cdb4ae06-6b69-45e4-85f1-d0972be261a6	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
cdb4ae06-6b69-45e4-85f1-d0972be261a6	3952e024-a4f0-4a15-9a68-bfbfc2efbd22	\N	\N
180b3a62-0f8a-44dc-8742-df32235ef847	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
180b3a62-0f8a-44dc-8742-df32235ef847	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
04193cd8-f1de-4d9f-b877-fa29143482a1	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
04193cd8-f1de-4d9f-b877-fa29143482a1	ab721fcd-18eb-42c6-938b-ab88586553f8	\N	\N
bc1c6954-a25c-42f5-8b5b-825f943faec1	c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	\N	\N
\.


--
-- Data for Name: DoctorSchedule; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."DoctorSchedule" (id, "doctorId", "slotDuration", "bufferTime", "createdAt", "updatedAt") FROM stdin;
e5e270ee-7869-4fc1-8992-c623747b4223	180b3a62-0f8a-44dc-8742-df32235ef847	15	5	2026-08-14 18:14:48.896	2026-08-14 18:14:48.896
e22cd7c4-38e6-4897-9d54-710e514f2563	550403a7-6ed6-4aa7-b59d-bd934f1798aa	20	5	2026-08-14 18:14:48.899	2026-08-14 18:14:48.899
c3a40589-4bdd-4e22-8147-27e969621003	0f296b02-cc35-4300-907b-875c56ea58ae	15	5	2026-08-14 18:14:48.901	2026-08-14 18:14:48.901
30d004bf-f00e-4795-93a6-c3d5a1484c69	174c789a-7711-4f26-85b9-1c04c4cbd634	20	5	2026-08-14 18:14:48.903	2026-08-14 18:14:48.903
aade5097-f5d0-41dc-9f65-9594bf4aac59	d80aaf36-57f5-44f5-97c1-eb0ee261cede	15	10	2026-08-14 18:14:48.905	2026-08-14 18:14:48.905
90f64853-d915-49fe-8571-58ab82b5cbf2	184d5081-3076-412d-881e-ce4fc83e0337	20	5	2026-08-14 18:14:48.906	2026-08-14 18:14:48.906
e42b0d87-79be-4a96-b7fc-c1b21c4ef3f9	5a97a895-9245-40ca-ab30-66290bb80368	15	5	2026-08-14 18:14:48.908	2026-08-14 18:14:48.908
2950e4ea-8025-42a9-9e4e-0efe5ac94bb4	4c0cc13e-b989-4e46-ac02-49b58fc3661f	15	5	2026-08-14 18:14:48.91	2026-08-14 18:14:48.91
1faa8a79-49a4-499b-9d5d-87c1dbe27b4c	78513231-3782-42b6-b875-ffad63410246	20	5	2026-08-14 18:14:48.912	2026-08-14 18:14:48.912
92cc05bb-e810-4ed1-badd-865600ae0786	1342f6ed-14c0-4499-b972-ff056a915547	15	5	2026-08-14 18:14:48.913	2026-08-14 18:14:48.913
fb74f153-20d3-4b80-878b-ca9296da5e40	04193cd8-f1de-4d9f-b877-fa29143482a1	30	0	2026-10-13 08:38:51.393	2026-10-13 08:38:51.393
5d257e52-319e-4fa9-88e3-f8cded498e44	bc1c6954-a25c-42f5-8b5b-825f943faec1	30	0	2026-10-13 08:44:55.17	2026-10-13 10:45:54.018
\.


--
-- Data for Name: DoctorScheduleSlot; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."DoctorScheduleSlot" (id, "scheduleId", "dayOfWeek", "startTime", "endTime", "isAvailable") FROM stdin;
cd41bfa8-db1d-4a9a-847c-fade299ae9f3	e5e270ee-7869-4fc1-8992-c623747b4223	1	09:00	13:00	t
022acc88-afdf-4e52-8940-7e95f6131a2a	e5e270ee-7869-4fc1-8992-c623747b4223	2	09:00	13:00	t
f3095f54-5c2f-4643-bf20-ac3a688ecf65	e5e270ee-7869-4fc1-8992-c623747b4223	3	09:00	13:00	t
b11b446e-c2af-496d-93bf-80bcdafddb24	e5e270ee-7869-4fc1-8992-c623747b4223	4	09:00	13:00	t
9d054d2a-5d10-4231-8f5d-087d170f6439	e5e270ee-7869-4fc1-8992-c623747b4223	5	09:00	13:00	t
da1ff479-c3da-4045-addf-582fb503ef01	e5e270ee-7869-4fc1-8992-c623747b4223	6	09:00	12:00	t
6ea5b82e-45c4-4101-a0d3-1364eeeafb60	e22cd7c4-38e6-4897-9d54-710e514f2563	1	10:00	14:00	t
e748281d-9d87-4620-96ce-c90dd3aed1bf	e22cd7c4-38e6-4897-9d54-710e514f2563	2	10:00	14:00	t
c0dea2b1-b5f0-4a58-926d-1f9ee66c172a	e22cd7c4-38e6-4897-9d54-710e514f2563	3	10:00	14:00	t
55de4f31-2603-44dc-b037-2849ace1f968	e22cd7c4-38e6-4897-9d54-710e514f2563	4	10:00	14:00	t
6afb3421-58ce-4c8c-81c1-8da01f63c717	e22cd7c4-38e6-4897-9d54-710e514f2563	5	10:00	14:00	t
00b4ced4-d96f-4fb0-a5cc-ced950e6fcf4	c3a40589-4bdd-4e22-8147-27e969621003	1	09:00	13:00	t
f6cc1152-d71f-4aee-ad8d-97a7a12b04bf	c3a40589-4bdd-4e22-8147-27e969621003	2	09:00	13:00	t
6d94fcee-385f-477f-a366-82ef483da9dd	c3a40589-4bdd-4e22-8147-27e969621003	3	14:00	18:00	t
5adc2d7a-9a79-434a-a5cb-9aa78cce0a76	c3a40589-4bdd-4e22-8147-27e969621003	4	09:00	13:00	t
5fd52dfb-a210-4007-abc0-28a82cd5803a	c3a40589-4bdd-4e22-8147-27e969621003	5	09:00	13:00	t
4f4e8c5f-7143-4c32-b4b4-f6dbb8ff2ee7	30d004bf-f00e-4795-93a6-c3d5a1484c69	1	09:30	13:30	t
311d7bd2-d4b2-4542-a27d-f95e048316a5	30d004bf-f00e-4795-93a6-c3d5a1484c69	3	09:30	13:30	t
0d1ef36c-cbe1-4b91-8d7a-84ab1fdbea31	30d004bf-f00e-4795-93a6-c3d5a1484c69	5	09:30	13:30	t
09f5e5f8-e92e-42a1-822a-7e653f9eaea2	aade5097-f5d0-41dc-9f65-9594bf4aac59	1	09:00	13:00	t
39798dde-df99-4800-9508-b93ea30bda21	aade5097-f5d0-41dc-9f65-9594bf4aac59	2	09:00	13:00	t
4a372afc-1603-483e-b97c-54ea49673add	aade5097-f5d0-41dc-9f65-9594bf4aac59	3	09:00	13:00	t
104220cd-a005-40b1-b82f-183eed1c8cd4	aade5097-f5d0-41dc-9f65-9594bf4aac59	4	14:00	18:00	t
a1a774ff-8d4c-4531-a0d1-e21805388d48	aade5097-f5d0-41dc-9f65-9594bf4aac59	5	09:00	13:00	t
0e6c23a8-6600-4add-af0e-7e73edd7b74b	90f64853-d915-49fe-8571-58ab82b5cbf2	2	10:00	14:00	t
99c2f079-0b0b-43e0-9916-20d9ee7179de	90f64853-d915-49fe-8571-58ab82b5cbf2	4	10:00	14:00	t
bb209c70-5c4f-4636-a341-f9079b96c6b0	90f64853-d915-49fe-8571-58ab82b5cbf2	6	09:00	13:00	t
85ea16c6-d37c-46de-bc2c-b1e05eda54fd	e42b0d87-79be-4a96-b7fc-c1b21c4ef3f9	1	14:00	18:00	t
f47f5c7d-cb7b-41ad-9a24-f7ce9095acc5	e42b0d87-79be-4a96-b7fc-c1b21c4ef3f9	3	14:00	18:00	t
5d150d32-9833-4d80-80c0-7a1460b1bae1	e42b0d87-79be-4a96-b7fc-c1b21c4ef3f9	5	14:00	18:00	t
3987549f-0c03-44e2-9f19-b52108df2a74	2950e4ea-8025-42a9-9e4e-0efe5ac94bb4	1	09:00	13:00	t
00dbe602-cfbf-4591-8940-7a99362018ee	2950e4ea-8025-42a9-9e4e-0efe5ac94bb4	2	09:00	13:00	t
97b60f6a-9139-4c00-80c3-5e59be5ba1e3	2950e4ea-8025-42a9-9e4e-0efe5ac94bb4	3	09:00	13:00	t
7249610a-3273-404f-a0e2-a946ab51fdb8	2950e4ea-8025-42a9-9e4e-0efe5ac94bb4	4	09:00	13:00	t
3620b749-3aa9-46ab-bb0c-8ebf93fae4fd	2950e4ea-8025-42a9-9e4e-0efe5ac94bb4	5	09:00	13:00	t
9f2f56c5-7b1a-420f-a8b8-386357612319	1faa8a79-49a4-499b-9d5d-87c1dbe27b4c	2	10:00	14:00	t
4d98f6d0-ad5a-43f8-8aa4-0d0a1dcad4ff	1faa8a79-49a4-499b-9d5d-87c1dbe27b4c	4	10:00	14:00	t
f0ccb03c-726f-4f8e-a1fd-d00861a556ec	1faa8a79-49a4-499b-9d5d-87c1dbe27b4c	6	10:00	13:00	t
d77bb852-58cb-4edd-aadd-0b03faadb94d	92cc05bb-e810-4ed1-badd-865600ae0786	1	09:00	13:00	t
1ee2368f-7b4f-4e49-80b0-e9855bc9dbb6	92cc05bb-e810-4ed1-badd-865600ae0786	2	09:00	13:00	t
42130088-7c2b-42f3-97c9-30a9543f33ba	92cc05bb-e810-4ed1-badd-865600ae0786	4	14:00	18:00	t
136e6874-67b0-4383-b1c7-d5e054aece61	92cc05bb-e810-4ed1-badd-865600ae0786	5	09:00	13:00	t
36629c61-fbee-45ad-adfe-ad3df6b979f0	fb74f153-20d3-4b80-878b-ca9296da5e40	1	09:00	17:00	t
0ff83d72-9875-450a-885b-25b6da01ae52	fb74f153-20d3-4b80-878b-ca9296da5e40	2	09:00	17:00	t
c31277cb-71ec-46f8-b72e-3afa55a0011b	fb74f153-20d3-4b80-878b-ca9296da5e40	3	09:00	17:00	t
6762e626-67d3-4233-b8a2-32f6738447ef	fb74f153-20d3-4b80-878b-ca9296da5e40	4	09:00	17:00	t
0f99d206-a0f4-489a-9070-4e62c7ec9582	fb74f153-20d3-4b80-878b-ca9296da5e40	5	09:00	17:00	t
d96f4394-13a0-4e93-9920-27d46a4771cf	fb74f153-20d3-4b80-878b-ca9296da5e40	6	09:00	17:00	t
1abea4fa-c20a-42b6-828d-13768250638c	5d257e52-319e-4fa9-88e3-f8cded498e44	1	09:00	19:00	t
1ef10bd5-54c9-4669-b3b2-28d2b54ea3cc	5d257e52-319e-4fa9-88e3-f8cded498e44	2	09:00	19:00	t
00212e79-fa3c-4b06-808f-3ba9a05d5051	5d257e52-319e-4fa9-88e3-f8cded498e44	3	09:00	19:00	t
4b573e0e-1360-4f9f-b5fb-6acc91d13bed	5d257e52-319e-4fa9-88e3-f8cded498e44	4	09:00	19:00	t
56adc1a2-cb0a-4204-bbd0-01c80c72320f	5d257e52-319e-4fa9-88e3-f8cded498e44	5	09:00	19:00	t
\.


--
-- Data for Name: DoctorSpecialty; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."DoctorSpecialty" ("doctorId", "specialtyId") FROM stdin;
550403a7-6ed6-4aa7-b59d-bd934f1798aa	9f7ce7a3-0c7e-4bf5-b482-04b54f5b5339
550403a7-6ed6-4aa7-b59d-bd934f1798aa	e093c3b4-767b-426c-afe5-604dbeb0a96f
0f296b02-cc35-4300-907b-875c56ea58ae	6f3a3d15-f9d0-4489-b117-4f9b32bac6f5
0f296b02-cc35-4300-907b-875c56ea58ae	71b8b4e5-dcbf-4924-957a-6dc7a5adba2b
174c789a-7711-4f26-85b9-1c04c4cbd634	53130bdc-236d-4b80-8fd3-a300a01b365f
174c789a-7711-4f26-85b9-1c04c4cbd634	fc66a773-f49d-460f-92d8-f86b61e3ed5c
d80aaf36-57f5-44f5-97c1-eb0ee261cede	769ac502-2715-4e96-a656-65b69b0faa39
d80aaf36-57f5-44f5-97c1-eb0ee261cede	666451cd-114a-4f02-968d-5e7e2b8e0c2c
184d5081-3076-412d-881e-ce4fc83e0337	92e7c7a2-020b-4f7c-b875-3ac2295623b9
184d5081-3076-412d-881e-ce4fc83e0337	f2787921-adc2-4d48-838e-550ed116ce4f
5a97a895-9245-40ca-ab30-66290bb80368	0ee734a4-b4bc-48e2-ace4-8a28d480e406
5a97a895-9245-40ca-ab30-66290bb80368	2db19c3a-029c-4aba-b931-3aae0dfff64f
4c0cc13e-b989-4e46-ac02-49b58fc3661f	b6b220cd-33d5-4f27-ba36-a95594bec868
4c0cc13e-b989-4e46-ac02-49b58fc3661f	42c099c3-36d4-408d-abc6-886ef5c84bea
78513231-3782-42b6-b875-ffad63410246	0f261ea7-223e-41d6-99ee-5d269e7cec45
78513231-3782-42b6-b875-ffad63410246	5541262f-02b6-455a-aa9d-e78a121dfe40
1342f6ed-14c0-4499-b972-ff056a915547	6ac2458f-0f57-4eb4-bcda-155861ab7abb
1342f6ed-14c0-4499-b972-ff056a915547	c32ea0b3-54c0-4ae3-bf27-13ced94ee5b3
febb532c-34ff-41c3-8a1b-8f78be6c11e8	d5ffe1eb-8790-49e0-98e2-08412c5d1ef5
febb532c-34ff-41c3-8a1b-8f78be6c11e8	2fd27a6b-fdc4-420e-90ab-5c90fb28d0c9
835cf67e-f838-4876-8f65-84c796ad667b	d7b5484c-1c2f-482f-8d4f-c0fcae3bdf71
835cf67e-f838-4876-8f65-84c796ad667b	d19649a1-3bbe-4493-aa3c-cce2b6600188
f9a42b2f-4bfb-47b0-aa6e-20690807096c	9e93d6dd-3aa8-402f-8464-e77f2e28af8b
f9a42b2f-4bfb-47b0-aa6e-20690807096c	ee681c5c-1b53-4dd3-a430-680789206fe4
7fe5270c-75cf-482c-89d2-9addfddf7b26	68eac97e-9e8b-43d5-975d-94a676d96a29
7fe5270c-75cf-482c-89d2-9addfddf7b26	d79a20f3-1a8f-41e3-93b2-38d1e869b0a7
10f619db-d99d-4116-ae4a-ff3ef9bed7a5	169c66c5-86e2-4165-96d4-4f4e04ad2bbd
10f619db-d99d-4116-ae4a-ff3ef9bed7a5	8f3a58fb-3d1d-41c8-913f-66dfee5b083b
28d5754d-ee15-442a-8e1c-60d1ccdd875f	ab57fd17-971a-4bb8-9db7-da807a62afbb
28d5754d-ee15-442a-8e1c-60d1ccdd875f	86942091-8bac-45a1-86c3-0c39b6e35e9b
92784d11-7cc2-4cca-a518-53c56b04ec4b	c4dfd2b6-627e-407f-8d77-779260a805ea
92784d11-7cc2-4cca-a518-53c56b04ec4b	e83da862-7763-4619-a565-06e71be1853c
43a69a6f-aee7-4657-81ae-50b76d55772e	86cddef3-2c37-4cd6-8dc9-58245c219cb3
43a69a6f-aee7-4657-81ae-50b76d55772e	788abef5-fdb7-4f1b-9b3a-a0d917a660ef
1bba5118-bbc8-4a76-9a83-acfd4f11a4dd	1a722c77-ea5c-4b96-9bf8-f87c71bacc6b
1bba5118-bbc8-4a76-9a83-acfd4f11a4dd	f7c276be-c276-4fe9-be3b-ef86c4e51eab
777afbad-dd8a-4ad1-a4cd-af5270121e43	a28e377b-44c4-456b-b28c-a53ff3101ea7
777afbad-dd8a-4ad1-a4cd-af5270121e43	9cd9e274-ffd7-4f41-8b01-98362f074080
54d01649-3552-4e2b-907e-820961ee92d2	c32758ec-f2ed-486f-89d4-41a68103c099
54d01649-3552-4e2b-907e-820961ee92d2	e7bdab48-e81b-4bc2-9331-a82b6f35ab9a
a0fa7373-f8f7-4659-84e8-11d81177cd5d	38660968-a479-4096-9a79-7f1eb5ee36c7
a0fa7373-f8f7-4659-84e8-11d81177cd5d	a9f99304-d0b2-4504-aa46-76a4545b1e44
02bb5091-f691-4ab4-9b17-43cb4284c568	f9d28240-78a1-4e93-b157-e6538d14a1ff
02bb5091-f691-4ab4-9b17-43cb4284c568	260eb8ad-26ae-40fa-95cd-7f33b8c4dabb
d625bfae-ad48-465d-9f25-25f6c183d20a	3afb2ad7-3292-4536-bb58-04c7d68251d7
d625bfae-ad48-465d-9f25-25f6c183d20a	3b408d2d-98e0-4bf7-b56a-2d9d4999291a
4c27dc21-51c0-4d19-b6e1-1966f75d3da8	0c13279b-6464-4e56-bd5a-d63bcd24987a
4c27dc21-51c0-4d19-b6e1-1966f75d3da8	7077595c-5ffc-4cd9-8b0d-0b6e52f21458
c3671d81-49dc-4081-b11e-bffcd8ff9390	2d630856-2203-43b8-8d40-5770fc7a6bac
c3671d81-49dc-4081-b11e-bffcd8ff9390	48edf507-896a-4260-8e2e-3e7fabc0e2a1
9d54836e-7a9e-40e0-99a0-0176ed0c2de8	4b43ac12-35c9-4bc5-b5b4-f0f050d7673b
9d54836e-7a9e-40e0-99a0-0176ed0c2de8	0c0f2674-8a1b-4e89-9537-796f51be93c5
c02dd68f-6967-44f3-a773-45d3c76730bd	5de96d58-0be9-4113-8a2e-734c475291a6
c02dd68f-6967-44f3-a773-45d3c76730bd	83c71b7a-50cb-4515-a35a-38d696fff28b
172c7927-eda7-4fe5-8046-e399f6e3c003	83c71b7a-50cb-4515-a35a-38d696fff28b
172c7927-eda7-4fe5-8046-e399f6e3c003	3dee7209-5f76-4e0e-83d8-b4a744602c99
10ce291a-2fa2-4883-83ba-40c646ae19d5	ccf26db6-c8ef-41ef-be37-8e72a37c4405
f001ac2c-6ee1-4a7d-9dc6-1d83aaf5f796	58be48bd-2d30-4391-8497-2581dd2ceefe
f001ac2c-6ee1-4a7d-9dc6-1d83aaf5f796	e0256f27-f125-49f8-b84e-5d14615f74b0
066d66b0-90bc-49bd-8f01-6c7c5253c73b	e919c7fe-820f-4fb3-951a-fda89f372854
066d66b0-90bc-49bd-8f01-6c7c5253c73b	e8c24d78-9a66-4d88-be19-9e26f50a599b
7abf4f1e-166f-44b3-bc74-2ec2cc1a3d07	a9192f6f-a676-4672-b535-dbfc168e2ff9
7abf4f1e-166f-44b3-bc74-2ec2cc1a3d07	af8e61a5-6c43-45d5-a885-a0f2259c5f21
76d3fbfc-6273-4edb-8d4e-4c2455f6f7cb	7c7711cd-5195-4686-9324-f21f6a83ca29
91defdda-4ead-40b7-aab7-fefa3280ac4e	870e867f-8e12-4f9b-a3fd-f4125cef86cd
4661d8e1-f639-4102-a9bc-16f742b69474	d55ca554-1b0d-4657-8b55-5e099fd64949
4661d8e1-f639-4102-a9bc-16f742b69474	95a17f21-d335-4a6d-91b6-84c12a892630
3c71e208-61f5-4fbd-9238-75e99ffae8b9	443a3afb-5152-41de-902d-6802fdd36e6d
3c71e208-61f5-4fbd-9238-75e99ffae8b9	d1b8850d-8b78-4ef3-b76f-2cf71c0a682a
abf00b97-965d-4899-9bf8-77909631a24a	d19649a1-3bbe-4493-aa3c-cce2b6600188
abf00b97-965d-4899-9bf8-77909631a24a	a6af4398-e5a0-4b33-8d3a-aafce6abe516
3d4b017e-1564-4ef4-b89d-e5ce060c81dc	2fd27a6b-fdc4-420e-90ab-5c90fb28d0c9
3d4b017e-1564-4ef4-b89d-e5ce060c81dc	07b9f6c5-82e3-4616-93a8-fbd415880dd7
08bdc1f9-3ebd-4f3b-ac43-15d1c6ceba46	9e93d6dd-3aa8-402f-8464-e77f2e28af8b
08bdc1f9-3ebd-4f3b-ac43-15d1c6ceba46	dce04821-10f7-4d7d-b78d-32b8d5332bf6
01dbad9b-1f7a-452e-bbb5-6f2490ffba75	70928f63-c1f9-472e-8d19-5dedc38eb4e4
01dbad9b-1f7a-452e-bbb5-6f2490ffba75	29a2acb6-a5a0-47f6-8ece-55a993098867
2b323394-8265-4b09-ac80-0bfa05d41fcf	169c66c5-86e2-4165-96d4-4f4e04ad2bbd
2b323394-8265-4b09-ac80-0bfa05d41fcf	8f3a58fb-3d1d-41c8-913f-66dfee5b083b
ca170426-0794-48e8-8383-578eeac92d3c	ab57fd17-971a-4bb8-9db7-da807a62afbb
ca170426-0794-48e8-8383-578eeac92d3c	9b0cacf6-a1fb-4b7e-bd6e-184ba28bbbc3
2c315d70-7794-4e53-bfbe-84fe3bde8e11	e093c3b4-767b-426c-afe5-604dbeb0a96f
2c315d70-7794-4e53-bfbe-84fe3bde8e11	71b8b4e5-dcbf-4924-957a-6dc7a5adba2b
531e25da-61c1-42e7-bc9e-7c207bcb3a4f	2db19c3a-029c-4aba-b931-3aae0dfff64f
531e25da-61c1-42e7-bc9e-7c207bcb3a4f	c3c721b8-5bad-4e2a-8bca-6352d2a1ec85
20de8703-8180-464b-95b4-2454bd3e33d8	4a378777-d850-4ccf-9298-dfcf15d3209b
20de8703-8180-464b-95b4-2454bd3e33d8	f2787921-adc2-4d48-838e-550ed116ce4f
4680fff0-faf5-413d-aaff-fa98cfc3b071	e0256f27-f125-49f8-b84e-5d14615f74b0
4680fff0-faf5-413d-aaff-fa98cfc3b071	b74f0227-38f3-4556-aeb5-f89468ba034f
6695e1ab-54ee-4a34-b468-0f2cd45442c7	870e867f-8e12-4f9b-a3fd-f4125cef86cd
c4a0f666-e165-4d48-944f-2827dbb3614d	af8e61a5-6c43-45d5-a885-a0f2259c5f21
c4a0f666-e165-4d48-944f-2827dbb3614d	b62b949c-fa73-4e0e-b8f7-918596146442
c05c8060-2b18-476b-ac5e-20e5ab07cf90	3ec16cc9-8967-4989-b330-9eb7c9a50548
c05c8060-2b18-476b-ac5e-20e5ab07cf90	666451cd-114a-4f02-968d-5e7e2b8e0c2c
1a223b6c-d1b0-4d53-897d-3ce83ce9ca59	71b8b4e5-dcbf-4924-957a-6dc7a5adba2b
cdb4ae06-6b69-45e4-85f1-d0972be261a6	352e7de7-6468-4c6d-94c2-63cf6b8b2572
180b3a62-0f8a-44dc-8742-df32235ef847	71b8b4e5-dcbf-4924-957a-6dc7a5adba2b
180b3a62-0f8a-44dc-8742-df32235ef847	6f3a3d15-f9d0-4489-b117-4f9b32bac6f5
180b3a62-0f8a-44dc-8742-df32235ef847	9f7ce7a3-0c7e-4bf5-b482-04b54f5b5339
f4c10da7-4759-4fed-ac9d-81a741016178	97cf598e-debe-41f1-90ea-7f477b58937b
04193cd8-f1de-4d9f-b877-fa29143482a1	ee157e0a-60fe-490f-a9bd-6ed10c354986
bc1c6954-a25c-42f5-8b5b-825f943faec1	9913d9df-d4e7-40d2-9821-21d4dbbf39a3
\.


--
-- Data for Name: InventoryTransaction; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."InventoryTransaction" (id, "clinicId", "medicineBatchId", type, quantity, "previousQuantity", "newQuantity", "referenceId", notes, "createdAt") FROM stdin;
5299b3f1-e156-4c06-8bac-18dc1df9bdad	599b0d53-c901-47b1-95f4-d3e84420d02c	bcf90e92-8032-4258-91da-adf51c034e14	PURCHASE	100	0	100	156147a7-ee32-44a1-aa88-8fc7681c5480	Stock received - GRN-2026-000001	2026-09-12 09:03:01.392
5f11b5ad-5f74-4729-9b11-113ecfe5f3aa	599b0d53-c901-47b1-95f4-d3e84420d02c	a6a65546-544b-4e1e-8edb-0a30cb6d9a72	PURCHASE	100	0	100	0255883d-701e-4f73-acf0-dcdba60188de	Stock received - GRN-2026-000002	2026-09-12 09:12:58.21
80ac3d65-2ebe-4195-8027-70f89f26ac3b	599b0d53-c901-47b1-95f4-d3e84420d02c	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	PURCHASE	100	0	100	0255883d-701e-4f73-acf0-dcdba60188de	Stock received - GRN-2026-000002	2026-09-12 09:12:58.221
9a702cce-f5cd-4a8a-bc78-9c7ad9273cd8	599b0d53-c901-47b1-95f4-d3e84420d02c	bcf90e92-8032-4258-91da-adf51c034e14	DISPENSE	4	100	96	119c43a4-e29e-4dbe-9fad-2e115dc6684d	Dispensed for prescription a0ef0506-eab9-4a16-8bf0-d3d50af56218	2026-09-13 18:52:33.069
76d2ed28-29ab-49d2-a370-8bdefa929c11	599b0d53-c901-47b1-95f4-d3e84420d02c	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	DISPENSE	3	100	97	dff732b6-aad7-4de0-a901-c25882f10c12	Dispensed for prescription 9a699e0d-c737-4494-9ebf-1f1b501358b8	2026-09-13 19:00:35.244
a5c99268-6f5e-4947-ab2e-3adfa2247290	599b0d53-c901-47b1-95f4-d3e84420d02c	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	DISPENSE	1	97	96	dff732b6-aad7-4de0-a901-c25882f10c12	Dispensed for prescription 9a699e0d-c737-4494-9ebf-1f1b501358b8	2026-09-13 20:39:50.528
e28efc65-94cf-481a-b637-610c96030962	599b0d53-c901-47b1-95f4-d3e84420d02c	a6a65546-544b-4e1e-8edb-0a30cb6d9a72	DISPENSE	12	100	88	966a1ac5-4cd3-4322-880a-1c7827d43932	Dispensed for prescription d08f0889-b6c9-4a1c-8056-d8cd6fcd2af3	2026-09-13 20:44:21.785
15a56c2c-eb56-45aa-8b16-3af98477464c	599b0d53-c901-47b1-95f4-d3e84420d02c	bcf90e92-8032-4258-91da-adf51c034e14	DISPENSE	1	96	95	41c62036-8183-46be-a00c-588250fd4f46	Dispensed for prescription d915e716-30c0-46f9-8143-f58850fe7d7f	2026-09-13 20:46:40.273
606ef537-d6ba-4771-9741-6d9e634fc57c	599b0d53-c901-47b1-95f4-d3e84420d02c	bcf90e92-8032-4258-91da-adf51c034e14	DISPENSE	7	95	88	41c62036-8183-46be-a00c-588250fd4f46	Dispensed for prescription d915e716-30c0-46f9-8143-f58850fe7d7f	2026-09-13 20:48:30.746
f2779136-726f-4d04-b2e1-3a0750ec6312	599b0d53-c901-47b1-95f4-d3e84420d02c	a6a65546-544b-4e1e-8edb-0a30cb6d9a72	DISPENSE	1	88	87	8d1dc5cd-6d25-4a58-a7bb-cd0860c054a2	Dispensed for prescription e8c112bd-07a1-4e4e-94bb-a28073c152a1	2026-10-06 19:32:51.577
1ff4248b-6584-4f19-9c1d-63fc80008133	599b0d53-c901-47b1-95f4-d3e84420d02c	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	DISPENSE	3	96	93	8b335ffd-73be-45d1-afb2-ca4989edf98b	Dispensed for prescription 041c452d-7d9a-497e-8fe9-360a6fdf0358	2026-10-06 19:38:37.691
9d2e09a6-3ff2-426b-a6fa-7d5889282015	599b0d53-c901-47b1-95f4-d3e84420d02c	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	DISPENSE	3	93	90	8b335ffd-73be-45d1-afb2-ca4989edf98b	Dispensed for prescription 041c452d-7d9a-497e-8fe9-360a6fdf0358	2026-10-06 19:57:42.852
cb442db8-1bf1-47e1-907b-db195ad3db46	599b0d53-c901-47b1-95f4-d3e84420d02c	a6a65546-544b-4e1e-8edb-0a30cb6d9a72	DISPENSE	1	87	86	6a95d614-b4f8-4e83-971d-200a2725242a	Dispensed for prescription e4b10566-4872-4aa8-b999-a3f48ee7757c	2026-10-06 20:21:14.976
74fd99d1-9fb9-4991-930f-eb535b735c98	599b0d53-c901-47b1-95f4-d3e84420d02c	a6a65546-544b-4e1e-8edb-0a30cb6d9a72	RETURN	1	86	87	6a95d614-b4f8-4e83-971d-200a2725242a	Stock returned due to cancellation of dispensing 6a95d614-b4f8-4e83-971d-200a2725242a	2026-10-06 20:21:53.807
2a52db75-0419-4fb8-99f1-e4312399ca1f	599b0d53-c901-47b1-95f4-d3e84420d02c	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	DISPENSE	6	90	84	ec460e53-c6b5-4028-be8c-f42b9ae1f0a0	Dispensed for prescription 258b1ed6-6ae6-4613-9ce4-c00be6e10f3d	2026-10-06 20:25:06.219
76596998-ddf9-4bbe-abb9-8e3583e52b0f	599b0d53-c901-47b1-95f4-d3e84420d02c	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	RETURN	6	84	90	ec460e53-c6b5-4028-be8c-f42b9ae1f0a0	Stock returned due to cancellation of dispensing ec460e53-c6b5-4028-be8c-f42b9ae1f0a0	2026-10-06 20:25:22.584
2f682425-abf4-4e5c-9308-18585c8e5a96	599b0d53-c901-47b1-95f4-d3e84420d02c	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	DISPENSE	5	90	85	9dc90262-7533-4c12-ad89-1ecd9e989076	Dispensed for prescription 1bc4174e-4bea-4b6a-bcb7-80e5d9803fb9	2026-10-07 05:29:26.042
dba537dc-d224-4a14-b158-8baab713d81c	68dbd989-a659-454e-9492-e5490f18bea1	e1281b14-1a80-420f-a006-554280efd90c	PURCHASE	1	0	1	3a3323c2-c1ad-48c4-ad7f-bb693b92827f	Stock received - GRN-2026-000001	2026-10-13 11:10:04.258
\.


--
-- Data for Name: Invoice; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Invoice" (id, "invoiceNumber", "clinicId", "patientId", "appointmentId", status, subtotal, discount, tax, total, "amountPaid", "balanceDue", notes, "issuedAt", "dueAt", "createdAt", "updatedAt", type) FROM stdin;
408d7c49-37b9-4975-8873-0b1a57f34570	INV-CLINIC001-2026-000001	599b0d53-c901-47b1-95f4-d3e84420d02c	d5de0008-7abe-4d7b-854f-bd9f9639ce03	96bd6a1d-94df-4456-a5e7-0227322cfa32	DRAFT	800.00	0.00	0.00	800.00	0.00	800.00	\N	\N	\N	2026-08-19 17:28:41.469	2026-08-19 17:28:41.469	CONSULTATION
29bace4d-e5b9-4010-ad89-9c7f8f75e806	INV-CLINIC001-2026-000002	599b0d53-c901-47b1-95f4-d3e84420d02c	71a5e98d-5472-4b27-b597-65c4bd31f652	f5069b14-4898-4860-8fa8-ee60b8af37cb	DRAFT	1200.00	0.00	0.00	1200.00	0.00	1200.00	\N	\N	\N	2026-08-19 18:51:09.581	2026-08-19 18:51:09.581	CONSULTATION
2b660836-ca2a-4f72-9369-9350d1fae5a6	INV-CLINIC001-2026-000003	599b0d53-c901-47b1-95f4-d3e84420d02c	3097a220-18be-492b-b6ee-0109e4c797f8	cc4fbdb9-f0d7-46e0-81f5-acea8ee5fdcb	DRAFT	1300.00	0.00	0.00	1300.00	0.00	1300.00	\N	\N	\N	2026-08-20 20:43:56.683	2026-08-20 20:43:56.683	CONSULTATION
b018e3b8-0438-4456-afd1-059e23a7a390	INV-CLINIC001-2026-000004	599b0d53-c901-47b1-95f4-d3e84420d02c	fe1d62c9-017e-4758-8816-1591044dc96a	95d223fb-647d-4ea6-b1be-5f636239aeb2	DRAFT	900.00	0.00	0.00	900.00	0.00	900.00	\N	\N	\N	2026-09-07 19:29:24.931	2026-09-07 19:29:24.931	CONSULTATION
8831435d-24ae-4198-8ff8-5eaf749d8ca4	INV-CLINIC001-2026-000008	599b0d53-c901-47b1-95f4-d3e84420d02c	5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	64485b85-981b-4156-9ca3-7a56418c553e	PAID	700.00	0.00	0.00	700.00	700.00	0.00	\N	2026-10-05 08:05:38	\N	2026-10-01 07:51:12.143	2026-10-05 08:16:29.688	CONSULTATION
0ac4b600-7e36-4908-a8e9-6596377e29e1	INV-CLINIC001-2026-000006	599b0d53-c901-47b1-95f4-d3e84420d02c	fe1d62c9-017e-4758-8816-1591044dc96a	02b66477-2b61-45ec-94b3-c114400cc1fe	CANCELLED	900.00	0.00	0.00	900.00	0.00	900.00	\N	2026-10-05 08:21:42.416	\N	2026-09-13 20:09:48.928	2026-10-05 08:22:09.02	CONSULTATION
1102c56b-befc-43c8-9298-245125138a5d	INV-CLINIC001-2026-000005	599b0d53-c901-47b1-95f4-d3e84420d02c	5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	86234bce-b8e8-49e1-afbc-e57027946fcf	DRAFT	1300.00	50.00	0.00	1250.00	0.00	1250.00	\N	\N	\N	2026-09-08 05:58:46.448	2026-10-05 09:11:41.638	CONSULTATION
a3d110e2-bf56-4d40-bec6-10d0dbfbe963	INV-CLINIC001-2026-000009	599b0d53-c901-47b1-95f4-d3e84420d02c	d5de0008-7abe-4d7b-854f-bd9f9639ce03	65e63467-fe2f-41d5-97a6-46d55a8a44d2	PAID	1300.00	0.00	0.00	1300.00	1300.00	0.00	\N	2026-10-05 09:21:04.688	\N	2026-10-05 09:14:54.524	2026-10-05 09:21:07.903	CONSULTATION
3aed330c-b583-45ba-aaec-62bc2e41d6bc	INV-CLINIC001-2026-000007	599b0d53-c901-47b1-95f4-d3e84420d02c	71a5e98d-5472-4b27-b597-65c4bd31f652	9c76a2bf-0c38-4148-a924-5cb5e3f2d124	PAID	450.00	0.00	0.00	450.00	450.00	0.00	\N	2026-10-05 08:27:36.447	\N	2026-09-13 20:45:34.028	2026-10-05 09:21:41.986	CONSULTATION
311e6913-2cb0-417d-aee2-ab2737ce132b	INV-CLINIC001-2026-000011	599b0d53-c901-47b1-95f4-d3e84420d02c	692ff06f-e317-44f2-9ff3-12aa5a7ba890	d60d6b64-1672-4ff9-a6af-93ad77162b4d	PAID	900.00	0.00	0.00	900.00	900.00	0.00	\N	2026-10-06 19:17:45.703	\N	2026-10-06 19:04:12.438	2026-10-06 19:17:48.412	LABORATORY
02a43747-892b-4362-b964-3538148987e9	INV-CLN-000004-2026-000002	68dbd989-a659-454e-9492-e5490f18bea1	004308c3-76e1-404c-8ca9-f18ade54066a	f55c8310-45bf-48ff-b459-fb6c0d5e7ad8	DRAFT	300.00	0.00	0.00	300.00	0.00	300.00	\N	\N	\N	2026-10-13 10:46:39.409	2026-10-13 10:46:39.409	CONSULTATION
a82dcebb-5a71-40fe-bd34-4ea52be91a38	INV-CLINIC001-2026-000015	599b0d53-c901-47b1-95f4-d3e84420d02c	6ef52290-78d8-47cb-bbfa-3b531e676cbd	690de29c-c067-4eb3-bf68-a3fd43489c52	PAID	60.00	0.00	0.00	60.00	60.00	0.00	\N	2026-10-06 20:02:37.461	\N	2026-10-06 19:38:37.67	2026-10-06 20:02:44.002	PHARMACY
630e7551-c294-4caf-a389-991b4db37b32	INV-CLINIC001-2026-000014	599b0d53-c901-47b1-95f4-d3e84420d02c	6ef52290-78d8-47cb-bbfa-3b531e676cbd	690de29c-c067-4eb3-bf68-a3fd43489c52	PAID	900.00	0.00	0.00	900.00	900.00	0.00	\N	2026-10-06 20:08:15.873	\N	2026-10-06 19:37:19.715	2026-10-06 20:08:19.458	CONSULTATION
92df6b6c-1a05-4536-aa4a-aa1a6df035df	INV-CLINIC001-2026-000013	599b0d53-c901-47b1-95f4-d3e84420d02c	692ff06f-e317-44f2-9ff3-12aa5a7ba890	d60d6b64-1672-4ff9-a6af-93ad77162b4d	PAID	2.00	0.00	0.00	2.00	2.00	0.00	\N	2026-10-06 20:08:33.582	\N	2026-10-06 19:32:51.568	2026-10-06 20:08:35.569	PHARMACY
a5034c03-ddb8-4394-a753-6ca68e9d3a0e	INV-CLINIC001-2026-000012	599b0d53-c901-47b1-95f4-d3e84420d02c	692ff06f-e317-44f2-9ff3-12aa5a7ba890	d60d6b64-1672-4ff9-a6af-93ad77162b4d	PAID	880.00	0.00	0.00	880.00	880.00	0.00	\N	2026-10-06 19:17:30.693	\N	2026-10-06 19:16:41.596	2026-10-06 20:08:48.098	LABORATORY
61fbba40-a7d4-4b6e-9f81-91c0880867e9	INV-CLINIC001-2026-000010	599b0d53-c901-47b1-95f4-d3e84420d02c	692ff06f-e317-44f2-9ff3-12aa5a7ba890	d60d6b64-1672-4ff9-a6af-93ad77162b4d	DRAFT	800.00	60.00	0.00	740.00	0.00	740.00	\N	\N	\N	2026-10-06 18:41:53.813	2026-10-06 20:13:10.512	CONSULTATION
94fc1793-7c9d-4d4f-ac9a-ae18ad28e7c7	INV-CLINIC001-2026-000016	599b0d53-c901-47b1-95f4-d3e84420d02c	d5de0008-7abe-4d7b-854f-bd9f9639ce03	65e63467-fe2f-41d5-97a6-46d55a8a44d2	DRAFT	0.00	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	2026-10-06 20:21:14.955	2026-10-06 20:21:53.819	PHARMACY
22fa4396-c90d-4b2c-9a22-fea736d13a77	INV-CLINIC001-2026-000017	599b0d53-c901-47b1-95f4-d3e84420d02c	6874ff96-2ecb-4b1d-bfc4-2793b1a8aef3	c1248205-21a9-44fa-9a18-fa79ad2e86ba	CANCELLED	0.00	0.00	0.00	0.00	0.00	0.00	\N	\N	\N	2026-10-06 20:25:06.202	2026-10-06 20:25:22.594	PHARMACY
f86a7576-3657-455a-85d3-d01794a4418e	INV-CLINIC001-2026-000018	599b0d53-c901-47b1-95f4-d3e84420d02c	6bdcb5bb-d772-46fb-9d84-cae2e8d214df	9132cece-ca82-49bf-8511-5470b0f8c26f	PAID	1200.00	0.00	0.00	1200.00	1200.00	0.00	\N	2026-10-07 05:27:18.94	\N	2026-10-07 05:27:03.924	2026-10-07 05:27:23.752	CONSULTATION
d73bc281-f86f-4a96-9b0a-6c30af623b89	INV-CLINIC001-2026-000019	599b0d53-c901-47b1-95f4-d3e84420d02c	6bdcb5bb-d772-46fb-9d84-cae2e8d214df	9132cece-ca82-49bf-8511-5470b0f8c26f	PAID	1430.00	0.00	0.00	1430.00	1430.00	0.00	\N	2026-10-07 05:29:02.029	\N	2026-10-07 05:28:46.405	2026-10-07 05:29:06.693	LABORATORY
04c1cb69-cd5f-40e6-ba56-fe4ad279b91f	INV-CLINIC001-2026-000020	599b0d53-c901-47b1-95f4-d3e84420d02c	6bdcb5bb-d772-46fb-9d84-cae2e8d214df	9132cece-ca82-49bf-8511-5470b0f8c26f	PAID	50.00	0.00	0.00	50.00	50.00	0.00	\N	2026-10-07 05:29:34.232	\N	2026-10-07 05:29:26.025	2026-10-07 05:29:37.574	PHARMACY
8cce8db5-b5c2-4798-a68c-ece3dc63658e	INV-CLN-000004-2026-000001	68dbd989-a659-454e-9492-e5490f18bea1	a888ab03-53f7-4de3-b33a-80f6967942c0	da1c991d-e97a-4e1b-957a-0ee2cc69ce01	PAID	300.00	0.00	0.00	300.00	300.00	0.00	\N	2026-10-13 10:45:25.765	\N	2026-10-13 08:40:29.041	2026-10-13 10:45:29.188	CONSULTATION
\.


--
-- Data for Name: InvoiceItem; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."InvoiceItem" (id, "invoiceId", description, quantity, "unitPrice", amount, "createdAt", "labOrderItemId", "pharmacyDispensingItemId") FROM stdin;
d624164e-955a-4d66-9ba7-43f4b7d48301	408d7c49-37b9-4975-8873-0b1a57f34570	Consultation	1.00	800.00	800.00	2026-08-19 17:28:41.469	\N	\N
43a29bf1-91b0-4e25-80fb-1d74f7ec10d5	29bace4d-e5b9-4010-ad89-9c7f8f75e806	Consultation	1.00	1200.00	1200.00	2026-08-19 18:51:09.581	\N	\N
2682dd20-9cbb-4de1-8254-018086322466	2b660836-ca2a-4f72-9369-9350d1fae5a6	Consultation	1.00	1300.00	1300.00	2026-08-20 20:43:56.683	\N	\N
6ea9f6e3-8ce6-418a-945a-f66c65d07209	b018e3b8-0438-4456-afd1-059e23a7a390	Consultation	1.00	900.00	900.00	2026-09-07 19:29:24.931	\N	\N
2e47d387-5afa-4c32-ba7e-88b16cf4a0e1	1102c56b-befc-43c8-9298-245125138a5d	Consultation	1.00	1300.00	1300.00	2026-09-08 05:58:46.448	\N	\N
01b3e19a-d964-4695-a39c-6844e0b12066	0ac4b600-7e36-4908-a8e9-6596377e29e1	Consultation	1.00	900.00	900.00	2026-09-13 20:09:48.928	\N	\N
452f3abb-eaa9-4c53-ad74-e47385dde905	3aed330c-b583-45ba-aaec-62bc2e41d6bc	Consultation	1.00	450.00	450.00	2026-09-13 20:45:34.028	\N	\N
3ff5fe04-9ef7-4949-829f-192d107ede81	8831435d-24ae-4198-8ff8-5eaf749d8ca4	Consultation	1.00	700.00	700.00	2026-10-01 07:51:12.143	\N	\N
36cacb8c-89ed-453a-9559-47fa3cffe689	a3d110e2-bf56-4d40-bec6-10d0dbfbe963	Consultation	1.00	1300.00	1300.00	2026-10-05 09:14:54.524	\N	\N
596c8f25-05ab-4115-abab-623731680b06	61fbba40-a7d4-4b6e-9f81-91c0880867e9	Consultation	1.00	800.00	800.00	2026-10-06 18:41:53.813	\N	\N
c2018c39-a825-46a6-ac7c-5fd7eec1fbb2	311e6913-2cb0-417d-aee2-ab2737ce132b	Blood Culture	1.00	900.00	900.00	2026-10-06 19:04:12.438	\N	\N
06de674b-8ac9-4922-a9ff-2de00f8feeda	a5034c03-ddb8-4394-a753-6ca68e9d3a0e	Blood Urea	1.00	180.00	180.00	2026-10-06 19:16:41.596	\N	\N
c76331a7-11f0-4f3f-a3f1-62048f73154b	a5034c03-ddb8-4394-a753-6ca68e9d3a0e	C-Reactive Protein	1.00	350.00	350.00	2026-10-06 19:16:41.596	\N	\N
3c9f77ef-71f1-4ee4-b163-02ecff4b362b	a5034c03-ddb8-4394-a753-6ca68e9d3a0e	Complete Blood Count	1.00	350.00	350.00	2026-10-06 19:16:41.596	\N	\N
7633431e-4c99-4c46-821a-e0354a39c0be	92df6b6c-1a05-4536-aa4a-aa1a6df035df	Medicine - Cetrizine	1.00	2.00	2.00	2026-10-06 19:32:51.585	\N	4dc64d87-3b16-4960-92c9-9e5041036164
7998e431-d72f-44d1-b449-4b26fc178f81	630e7551-c294-4caf-a389-991b4db37b32	Consultation	1.00	900.00	900.00	2026-10-06 19:37:19.715	\N	\N
6ebcf40f-8786-40d5-9378-3780f4984ba5	a82dcebb-5a71-40fe-bd34-4ea52be91a38	Medicine - Tylenol	3.00	10.00	30.00	2026-10-06 19:38:37.706	\N	b536c960-70ae-4d12-a05f-21aa7c78defc
79e75af3-b4f4-4042-b3f9-54ed471870e5	a82dcebb-5a71-40fe-bd34-4ea52be91a38	Medicine - Tylenol	3.00	10.00	30.00	2026-10-06 19:57:42.865	\N	fe254e74-a2b5-4952-9517-ea97c2fc97c6
8200d90d-a1e4-4614-86c1-c2e2b45c6477	f86a7576-3657-455a-85d3-d01794a4418e	Consultation	1.00	1200.00	1200.00	2026-10-07 05:27:03.924	\N	\N
d76811a8-5509-4f7d-b5c7-e68d495a2e45	d73bc281-f86f-4a96-9b0a-6c30af623b89	Blood Urea	1.00	180.00	180.00	2026-10-07 05:28:46.405	\N	\N
b5a23257-1ab0-4179-a7fb-043c1dbaff09	d73bc281-f86f-4a96-9b0a-6c30af623b89	Blood Culture	1.00	900.00	900.00	2026-10-07 05:28:46.405	\N	\N
8c790e9b-f0a3-4d0f-9b34-e573e45e94d5	d73bc281-f86f-4a96-9b0a-6c30af623b89	Complete Blood Count	1.00	350.00	350.00	2026-10-07 05:28:46.405	\N	\N
746780a0-d4f5-4467-9685-d72839c4ea5f	04c1cb69-cd5f-40e6-ba56-fe4ad279b91f	Medicine - Tylenol	5.00	10.00	50.00	2026-10-07 05:29:26.057	\N	00ef7f31-af45-4140-a69a-5c71363d56f6
cbba3473-c3e4-48d9-bd13-0a7aef8780b9	8cce8db5-b5c2-4798-a68c-ece3dc63658e	Consultation	1.00	300.00	300.00	2026-10-13 08:40:29.041	\N	\N
72f9c708-2e39-42a2-a562-b9146b573be3	02a43747-892b-4362-b964-3538148987e9	Consultation	1.00	300.00	300.00	2026-10-13 10:46:39.409	\N	\N
\.


--
-- Data for Name: LabOrder; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."LabOrder" (id, "clinicId", "patientId", "doctorId", "appointmentId", status, notes, "createdAt", "updatedAt") FROM stdin;
2645b46d-ee3e-4660-a616-73949379753a	599b0d53-c901-47b1-95f4-d3e84420d02c	5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	4c0cc13e-b989-4e46-ac02-49b58fc3661f	7e678f9a-793e-4b1a-9bd0-95c4bae2f813	COMPLETED	\N	2026-10-01 07:51:39.691	2026-10-01 07:52:58.246
b42e09fd-3550-4b5b-9c8d-71a4b64a270f	599b0d53-c901-47b1-95f4-d3e84420d02c	5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	180b3a62-0f8a-44dc-8742-df32235ef847	64485b85-981b-4156-9ca3-7a56418c553e	PENDING	\N	2026-10-01 07:54:20.094	2026-10-01 07:54:20.094
0334cc82-0adf-4115-94d0-a9c21d399b35	599b0d53-c901-47b1-95f4-d3e84420d02c	3097a220-18be-492b-b6ee-0109e4c797f8	180b3a62-0f8a-44dc-8742-df32235ef847	7edf6df3-c70b-4b43-a5c4-64c9ea9811d9	IN_PROGRESS	\N	2026-10-01 09:08:36.448	2026-10-01 09:15:24.285
456a3b4e-7c4f-4c04-b8f2-bd1677bdffcd	599b0d53-c901-47b1-95f4-d3e84420d02c	692ff06f-e317-44f2-9ff3-12aa5a7ba890	0f296b02-cc35-4300-907b-875c56ea58ae	d60d6b64-1672-4ff9-a6af-93ad77162b4d	COMPLETED	\N	2026-10-06 19:04:12.413	2026-10-06 19:06:39.298
ed4d5069-01fc-451f-a1ca-df631c6d106a	599b0d53-c901-47b1-95f4-d3e84420d02c	692ff06f-e317-44f2-9ff3-12aa5a7ba890	0f296b02-cc35-4300-907b-875c56ea58ae	d60d6b64-1672-4ff9-a6af-93ad77162b4d	COMPLETED	\N	2026-10-06 19:16:41.571	2026-10-07 05:25:39.281
02c38ddb-a807-41c4-a062-ce75622c8907	599b0d53-c901-47b1-95f4-d3e84420d02c	6bdcb5bb-d772-46fb-9d84-cae2e8d214df	174c789a-7711-4f26-85b9-1c04c4cbd634	9132cece-ca82-49bf-8511-5470b0f8c26f	COMPLETED	\N	2026-10-07 05:28:46.388	2026-10-07 19:24:14.188
\.


--
-- Data for Name: LabOrderItem; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."LabOrderItem" (id, "labOrderId", "labTestId", price, status, "createdAt", "updatedAt") FROM stdin;
7f0338ea-4076-4514-997d-ebf3c9011526	2645b46d-ee3e-4660-a616-73949379753a	03eafd72-7ecc-4e0b-beb8-31b73b478ec1	900.00	COMPLETED	2026-10-01 07:51:39.691	2026-10-01 07:52:58.241
fedb3361-6def-4a00-a5cc-ae5d7c6c980b	b42e09fd-3550-4b5b-9c8d-71a4b64a270f	808d590a-100c-429c-989b-4e0f98712815	180.00	PENDING	2026-10-01 07:54:20.094	2026-10-01 07:54:20.094
06e03ce5-91f2-4334-8cc3-efc723f1e752	0334cc82-0adf-4115-94d0-a9c21d399b35	03eafd72-7ecc-4e0b-beb8-31b73b478ec1	900.00	PENDING	2026-10-01 09:08:36.448	2026-10-01 09:08:36.448
0012eec8-2621-45d8-8588-8b964fea39bf	0334cc82-0adf-4115-94d0-a9c21d399b35	0951dfd0-5e4a-433c-b081-c2d463bef766	350.00	PENDING	2026-10-01 09:08:36.448	2026-10-01 09:08:36.448
1d919fb4-7a4c-4e54-bfb7-0f9d401b8852	0334cc82-0adf-4115-94d0-a9c21d399b35	808d590a-100c-429c-989b-4e0f98712815	180.00	COMPLETED	2026-10-01 09:08:36.448	2026-10-01 09:15:24.277
6d66f62d-85e2-4d43-aa49-f1fb22b41470	456a3b4e-7c4f-4c04-b8f2-bd1677bdffcd	03eafd72-7ecc-4e0b-beb8-31b73b478ec1	900.00	COMPLETED	2026-10-06 19:04:12.413	2026-10-06 19:06:39.292
b9d1d1de-ac91-48d0-80d9-fd70f12a7b6d	ed4d5069-01fc-451f-a1ca-df631c6d106a	480fde1c-95fa-4d03-8ae2-a421ad9b6ed3	350.00	COMPLETED	2026-10-06 19:16:41.571	2026-10-07 05:25:31.836
fbb3843a-3cc9-494f-b66c-80d1cda144ca	ed4d5069-01fc-451f-a1ca-df631c6d106a	808d590a-100c-429c-989b-4e0f98712815	180.00	COMPLETED	2026-10-06 19:16:41.571	2026-10-07 05:25:35.802
c72131d5-36df-474f-bef4-0faf4a9a3a94	ed4d5069-01fc-451f-a1ca-df631c6d106a	0951dfd0-5e4a-433c-b081-c2d463bef766	350.00	COMPLETED	2026-10-06 19:16:41.571	2026-10-07 05:25:39.277
f04a44c1-24d9-4bb2-8885-ff123b729bab	02c38ddb-a807-41c4-a062-ce75622c8907	808d590a-100c-429c-989b-4e0f98712815	180.00	COMPLETED	2026-10-07 05:28:46.388	2026-10-07 19:24:03.762
69b42cbb-4c89-46a9-81a7-8081c438fc31	02c38ddb-a807-41c4-a062-ce75622c8907	0951dfd0-5e4a-433c-b081-c2d463bef766	350.00	COMPLETED	2026-10-07 05:28:46.388	2026-10-07 19:24:09.814
31246d79-1d96-4aea-afff-bebf831e38b3	02c38ddb-a807-41c4-a062-ce75622c8907	03eafd72-7ecc-4e0b-beb8-31b73b478ec1	900.00	COMPLETED	2026-10-07 05:28:46.388	2026-10-07 19:24:14.182
\.


--
-- Data for Name: LabResult; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."LabResult" (id, "labOrderItemId", result, notes, "performedAt", "createdAt", "updatedAt") FROM stdin;
0910b3a2-fe72-45de-9f13-c27e077e6d4a	7f0338ea-4076-4514-997d-ebf3c9011526	None	\N	2026-10-01 07:52:58.236	2026-10-01 07:52:58.237	2026-10-01 07:52:58.237
e4f394cc-b124-40c7-aa80-0098bd66d85b	1d919fb4-7a4c-4e54-bfb7-0f9d401b8852	16	\N	2026-10-01 09:15:24.271	2026-10-01 09:15:24.272	2026-10-01 09:15:24.272
e5dc133f-99dd-4689-93fb-c9714c09635c	6d66f62d-85e2-4d43-aa49-f1fb22b41470	twrwa	\N	2026-10-06 19:06:39.287	2026-10-06 19:06:39.288	2026-10-06 19:06:39.288
87f24b36-c870-4204-bdaf-e0ffc278b41f	b9d1d1de-ac91-48d0-80d9-fd70f12a7b6d	44	\N	2026-10-07 05:25:31.833	2026-10-07 05:25:31.834	2026-10-07 05:25:31.834
2b87bb93-3108-41f0-bce4-d9b917bb73f3	fbb3843a-3cc9-494f-b66c-80d1cda144ca	4344	\N	2026-10-07 05:25:35.798	2026-10-07 05:25:27.838	2026-10-07 05:25:35.799
4221b99d-3e98-41cf-b041-e2febf801e1f	c72131d5-36df-474f-bef4-0faf4a9a3a94	33	\N	2026-10-07 05:25:39.274	2026-10-07 05:25:39.275	2026-10-07 05:25:39.275
4ddb42cf-8840-41aa-be9a-2280bc1681b9	f04a44c1-24d9-4bb2-8885-ff123b729bab	22	\N	2026-10-07 19:24:03.755	2026-10-07 19:24:03.756	2026-10-07 19:24:03.756
e445f3a6-7802-45c5-9362-8c506eb474cf	69b42cbb-4c89-46a9-81a7-8081c438fc31	34	\N	2026-10-07 19:24:09.81	2026-10-07 19:24:09.811	2026-10-07 19:24:09.811
d96f2458-299b-47cb-b7ee-3de489cd5160	31246d79-1d96-4aea-afff-bebf831e38b3	33	\N	2026-10-07 19:24:14.177	2026-10-07 19:24:14.178	2026-10-07 19:24:14.178
\.


--
-- Data for Name: LabTest; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."LabTest" (id, "clinicId", code, name, description, category, price, unit, "normalRange", "isActive", "createdAt", "updatedAt") FROM stdin;
e6702938-217e-4794-b4e6-45aa15d1e795	599b0d53-c901-47b1-95f4-d3e84420d02c	ESR	Erythrocyte Sedimentation Rate	\N	Hematology	150.00	mm/hr	Adult male: 0–15; adult female: 0–20	t	2026-10-01 07:27:27.635	2026-10-01 07:33:21.442
49a10e37-31c0-45c3-bef5-ecb1caf7a34a	599b0d53-c901-47b1-95f4-d3e84420d02c	HB	Hemoglobin	\N	Hematology	100.00	g/dL	Adult male: 13–18; adult female: 12–16	t	2026-10-01 07:27:27.636	2026-10-01 07:33:21.442
b13e86cf-bc3b-4a22-9a7a-81e45c469b2f	599b0d53-c901-47b1-95f4-d3e84420d02c	PCV	Packed Cell Volume	\N	Hematology	100.00	%	Adult male: 40–55; adult female: 36–48	t	2026-10-01 07:27:27.637	2026-10-01 07:33:21.443
cfc53b1f-d1d1-4075-937e-cdeb9a612f81	599b0d53-c901-47b1-95f4-d3e84420d02c	PLT	Platelet Count	\N	Hematology	150.00	10^3/µL	150–400	t	2026-10-01 07:27:27.637	2026-10-01 07:33:21.443
d6cd842e-eff1-4be9-b349-46be6848e680	599b0d53-c901-47b1-95f4-d3e84420d02c	RETIC	Reticulocyte Count	\N	Hematology	250.00	%	Adults: approximately 0.5–2.5	t	2026-10-01 07:27:27.638	2026-10-01 07:33:21.444
bb0d26f5-5c71-45a1-b62c-15de9f6e7a2c	599b0d53-c901-47b1-95f4-d3e84420d02c	RBS	Random Blood Sugar	Random blood glucose measurement; interpretation depends on timing and clinical context.	Biochemistry	120.00	mg/dL	No single universal reference interval; interpret with timing and clinical context	t	2026-10-01 07:27:27.639	2026-10-01 07:33:21.445
2929b4fd-00ae-4750-9d8c-2b9fcf56ab0b	599b0d53-c901-47b1-95f4-d3e84420d02c	HBA1C	HbA1c	Glycated hemoglobin.	Biochemistry	450.00	%	Approximately 4.0–5.6% in non-diabetic adults; diagnostic thresholds are separate	t	2026-10-01 07:27:27.64	2026-10-01 07:33:21.446
16d8651a-612f-44e8-a3aa-73cbc6551aa0	599b0d53-c901-47b1-95f4-d3e84420d02c	LFT	Liver Function Test	Panel of commonly requested liver function parameters.	Biochemistry	850.00	\N	See individual component reference intervals	t	2026-10-01 07:27:27.641	2026-10-01 07:33:21.446
016ecd25-568b-49f1-a7f2-b1a9ffb29562	599b0d53-c901-47b1-95f4-d3e84420d02c	RFT	Renal Function Test	Panel of commonly requested renal function parameters.	Biochemistry	750.00	\N	See individual component reference intervals	t	2026-10-01 07:27:27.641	2026-10-01 07:33:21.447
808d590a-100c-429c-989b-4e0f98712815	599b0d53-c901-47b1-95f4-d3e84420d02c	UREA	Blood Urea	\N	Biochemistry	180.00	mg/dL	Approx. 15–45	t	2026-10-01 07:27:27.642	2026-10-01 07:33:21.447
7c6f4b26-8f32-4b6a-8d4b-51e4483c8fa8	599b0d53-c901-47b1-95f4-d3e84420d02c	URIC	Uric Acid	\N	Biochemistry	200.00	mg/dL	Adult male: approx. 3.4–7.0; adult female: approx. 2.4–6.0	t	2026-10-01 07:27:27.643	2026-10-01 07:33:21.448
c89090ea-d0b7-48f0-80e0-45afb4e6a20e	599b0d53-c901-47b1-95f4-d3e84420d02c	NA	Serum Sodium	\N	Biochemistry	200.00	mmol/L	135–145	t	2026-10-01 07:27:27.643	2026-10-01 07:33:21.449
a93baf1e-518a-44ac-9f51-c4af56bad0ad	599b0d53-c901-47b1-95f4-d3e84420d02c	K	Serum Potassium	\N	Biochemistry	200.00	mmol/L	3.5–5.0	t	2026-10-01 07:27:27.644	2026-10-01 07:33:21.449
2592aa7c-1425-4bc4-bdb7-c9034aa71559	599b0d53-c901-47b1-95f4-d3e84420d02c	CL	Serum Chloride	\N	Biochemistry	200.00	mmol/L	98–106	t	2026-10-01 07:27:27.644	2026-10-01 07:33:21.45
15c3abcd-c42c-4e83-a248-0678cd4202db	599b0d53-c901-47b1-95f4-d3e84420d02c	CA	Serum Calcium	\N	Biochemistry	200.00	mg/dL	8.5–10.5	t	2026-10-01 07:27:27.645	2026-10-01 07:33:21.45
5c5d6a45-5e2f-4052-8daf-38fe191125d8	599b0d53-c901-47b1-95f4-d3e84420d02c	PHOS	Serum Phosphorus	\N	Biochemistry	250.00	mg/dL	Adults: approximately 2.5–4.5	t	2026-10-01 07:27:27.645	2026-10-01 07:33:21.451
4abdb2e2-31c5-4cbd-ac22-070655cf7298	599b0d53-c901-47b1-95f4-d3e84420d02c	MG	Serum Magnesium	\N	Biochemistry	300.00	mg/dL	Approximately 1.7–2.2	t	2026-10-01 07:27:27.646	2026-10-01 07:33:21.451
63a35bc2-e5e2-4118-ba02-21f8633a7681	599b0d53-c901-47b1-95f4-d3e84420d02c	TC	Total Cholesterol	\N	Biochemistry	180.00	mg/dL	Desirable: <200; interpretation should use cardiovascular risk context	t	2026-10-01 07:27:27.647	2026-10-01 07:33:21.452
06ddbdce-7d7b-4c20-9635-4860445e5270	599b0d53-c901-47b1-95f4-d3e84420d02c	HDL	HDL Cholesterol	\N	Biochemistry	180.00	mg/dL	Common adult reference: male >40; female >50; higher is generally associated with lower risk	t	2026-10-01 07:27:27.647	2026-10-01 07:33:21.453
fc8a76cf-23d8-4e7c-9a26-6024f61670e0	599b0d53-c901-47b1-95f4-d3e84420d02c	TG	Triglycerides	\N	Biochemistry	180.00	mg/dL	<150 fasting	t	2026-10-01 07:27:27.648	2026-10-01 07:33:21.454
d1a7ed1b-5844-44bc-b081-17e0a0ff0221	599b0d53-c901-47b1-95f4-d3e84420d02c	TFT	Thyroid Function Test	Routine thyroid function panel.	Endocrinology	650.00	\N	See individual component reference intervals	f	2026-10-01 07:27:27.648	2026-10-01 07:33:21.454
5f1c2614-9665-4861-aa34-75bac0177057	599b0d53-c901-47b1-95f4-d3e84420d02c	TSH	Thyroid Stimulating Hormone	\N	Endocrinology	350.00	µIU/mL	Approximately 0.4–4.0	f	2026-10-01 07:27:27.649	2026-10-01 07:33:21.454
b2f972f7-12a8-4b3d-98c0-7517f568e9f2	599b0d53-c901-47b1-95f4-d3e84420d02c	FT3	Free T3	\N	Endocrinology	350.00	pg/mL	Approximately 2.3–4.2	t	2026-10-01 07:27:27.649	2026-10-01 07:33:21.455
44f75f09-8ab8-42f1-a220-68d8059e575f	599b0d53-c901-47b1-95f4-d3e84420d02c	FT4	Free T4	\N	Endocrinology	350.00	ng/dL	Approximately 0.8–1.8	t	2026-10-01 07:27:27.65	2026-10-01 07:33:21.455
ddb5af49-b3b7-4050-bf04-d9c3b717e9c0	599b0d53-c901-47b1-95f4-d3e84420d02c	VITB12	Vitamin B12	\N	Immunology	750.00	pg/mL	Approximately 200–900	t	2026-10-01 07:27:27.651	2026-10-01 07:33:21.456
e0b2f1dd-07ea-4f7e-adc3-a4d3036a9e1a	599b0d53-c901-47b1-95f4-d3e84420d02c	FERRITIN	Ferritin	\N	Immunology	650.00	ng/mL	Sex- and laboratory-dependent; commonly adult male ~24–336, female ~11–307	t	2026-10-01 07:27:27.651	2026-10-01 07:33:21.457
d1a83558-3e81-4c0e-9544-3e94cc60ba8b	599b0d53-c901-47b1-95f4-d3e84420d02c	IRON	Serum Iron	\N	Biochemistry	300.00	µg/dL	Adult male: approximately 65–175; adult female: approximately 50–170	t	2026-10-01 07:27:27.652	2026-10-01 07:33:21.457
480fde1c-95fa-4d03-8ae2-a421ad9b6ed3	599b0d53-c901-47b1-95f4-d3e84420d02c	CRP	C-Reactive Protein	\N	Immunology	350.00	mg/L	<10	t	2026-10-01 07:27:27.652	2026-10-01 07:33:21.457
7ecff344-dd58-46e6-ac27-b0672717be6d	599b0d53-c901-47b1-95f4-d3e84420d02c	URINE_RM	Urine Routine Microscopy	Routine physical, chemical and microscopic urine examination.	Urinalysis	250.00	\N	Typically negative for protein/glucose/ketones/blood; microscopy reference values are method-specific	t	2026-10-01 07:27:27.653	2026-10-01 07:33:21.459
ac50d5af-0111-4ddd-ac7c-5192e7365d37	599b0d53-c901-47b1-95f4-d3e84420d02c	STOOL_RM	Stool Routine Examination	\N	Microbiology	250.00	\N	Typically negative for occult blood, ova, parasites and pathogenic organisms; method-specific	f	2026-10-01 07:27:27.654	2026-10-01 07:33:21.46
7c2a46fa-16de-4454-b6b4-e7c66234e9a7	599b0d53-c901-47b1-95f4-d3e84420d02c	STOOL_CULTURE	Stool Culture	\N	Microbiology	650.00	\N	No pathogenic bacterial growth	t	2026-10-01 07:27:27.655	2026-10-01 07:33:21.46
03eafd72-7ecc-4e0b-beb8-31b73b478ec1	599b0d53-c901-47b1-95f4-d3e84420d02c	BLOOD_CULTURE	Blood Culture	Blood culture with organism identification and susceptibility where indicated.	Microbiology	900.00	\N	No growth	t	2026-10-01 07:27:27.655	2026-10-01 07:33:21.461
14b7edb3-df0e-4bc2-898a-d1fbfc09505b	599b0d53-c901-47b1-95f4-d3e84420d02c	HBSAG	HBsAg	Hepatitis B surface antigen screening assay.	Serology	450.00	\N	Non-reactive / negative	t	2026-10-01 07:27:27.656	2026-10-01 07:33:21.461
5951e54e-02ab-496a-b374-d76c40330dfe	599b0d53-c901-47b1-95f4-d3e84420d02c	HCV	Anti-HCV	Hepatitis C antibody screening assay.	Serology	500.00	\N	Non-reactive / negative	t	2026-10-01 07:27:27.656	2026-10-01 07:33:21.462
0951dfd0-5e4a-433c-b081-c2d463bef766	599b0d53-c901-47b1-95f4-d3e84420d02c	CBC	Complete Blood Count	Complete blood count including major hematological parameters.	Hematology	350.00	\N	See component reference intervals	t	2026-10-01 07:27:27.634	2026-10-01 07:33:21.44
1bec9a4a-e5f3-4881-950f-59d06ffac9d3	599b0d53-c901-47b1-95f4-d3e84420d02c	FBS	Fasting Blood Sugar	Fasting plasma glucose measurement.	Biochemistry	120.00	mg/dL	70–99 (adult fasting reference; diagnostic thresholds are separate)	t	2026-10-01 07:27:27.639	2026-10-01 07:33:21.444
fc6fb760-fc21-41f7-aade-60b533a1c634	599b0d53-c901-47b1-95f4-d3e84420d02c	PPBS	Postprandial Blood Sugar	Postprandial blood glucose measurement, commonly interpreted at 2 hours after a meal.	Biochemistry	120.00	mg/dL	<140 at 2 hours after a meal is commonly used as a normal/decision threshold; local protocol applies	t	2026-10-01 07:27:27.64	2026-10-01 07:33:21.446
bf66b0f7-8724-4f68-b223-bdce36827c51	599b0d53-c901-47b1-95f4-d3e84420d02c	CREAT	Serum Creatinine	\N	Biochemistry	180.00	mg/dL	Adult male: approx. 0.7–1.3; adult female: approx. 0.6–1.1	t	2026-10-01 07:27:27.642	2026-10-01 07:33:21.448
c48cfba3-145b-4d44-ab5e-e99d631b69d5	599b0d53-c901-47b1-95f4-d3e84420d02c	LIPID	Lipid Profile	Routine lipid profile.	Biochemistry	650.00	\N	See individual component values; clinical targets depend on cardiovascular risk	t	2026-10-01 07:27:27.646	2026-10-01 07:33:21.452
e0ff5ed5-8657-49b8-a15e-d926eac783d6	599b0d53-c901-47b1-95f4-d3e84420d02c	LDL	LDL Cholesterol	\N	Biochemistry	180.00	mg/dL	Target depends on cardiovascular risk; <100 is commonly used as a general reference target	t	2026-10-01 07:27:27.648	2026-10-01 07:33:21.453
e8c68056-da85-4dd1-abe7-48c1096c4c49	599b0d53-c901-47b1-95f4-d3e84420d02c	VITD	Vitamin D	25-hydroxy Vitamin D.	Immunology	900.00	ng/mL	25-hydroxy Vitamin D: ≥20 is generally considered adequate for most people; laboratory interpretation applies	t	2026-10-01 07:27:27.65	2026-10-01 07:33:21.456
9e7fff0a-91df-446e-86ae-6a2a14144e5e	599b0d53-c901-47b1-95f4-d3e84420d02c	HSCRP	High Sensitivity C-Reactive Protein	\N	Immunology	650.00	mg/L	<1 low cardiovascular risk; 1–3 average; >3 higher risk (after excluding acute inflammation)	t	2026-10-01 07:27:27.652	2026-10-01 07:33:21.458
d01f85f7-c2e0-4b33-b352-a037fbfb006e	599b0d53-c901-47b1-95f4-d3e84420d02c	URINE_CULTURE	Urine Culture	Urine culture with antimicrobial susceptibility where indicated.	Microbiology	600.00	\N	No clinically significant growth / interpretation is organism- and colony-count-specific	t	2026-10-01 07:27:27.653	2026-10-01 07:33:21.459
fd3a7d9e-4600-45cc-9886-1c6baece1977	599b0d53-c901-47b1-95f4-d3e84420d02c	HIV	HIV 1 & 2 Screening	HIV screening assay; exact methodology depends on the laboratory.	Serology	500.00	\N	Non-reactive / negative	t	2026-10-01 07:27:27.657	2026-10-01 07:33:21.462
c095a71a-f01c-47b6-b16a-c474b489d1f7	599b0d53-c901-47b1-95f4-d3e84420d02c	DENGUE_NS1	Dengue NS1 Antigen	\N	Serology	500.00	\N	Negative / not detected	t	2026-10-01 07:27:27.657	2026-10-01 07:33:21.462
8e20b3fb-1a92-4fd3-a151-bc9d4aa36a8b	599b0d53-c901-47b1-95f4-d3e84420d02c	DENGUE_IGG_IGM	Dengue IgG/IgM	\N	Serology	650.00	\N	Negative / non-reactive; assay-specific interpretation	t	2026-10-01 07:27:27.658	2026-10-01 07:33:21.463
2ddd3d12-0a22-481e-9724-08a1243bf4b2	599b0d53-c901-47b1-95f4-d3e84420d02c	MALARIA	Malaria Parasite Test	Malaria screening by the laboratory's validated method.	Microbiology	300.00	\N	No malaria parasite detected	t	2026-10-01 07:27:27.658	2026-10-01 07:33:21.463
ccb341c9-210d-47f3-a92f-f616d17749b2	599b0d53-c901-47b1-95f4-d3e84420d02c	PT_INR	Prothrombin Time / INR	Prothrombin time with INR; reference values are strongly method/reagent dependent.	Hematology	400.00	\N	PT: method/reagent/instrument dependent; INR in patients not receiving anticoagulation is commonly around 0.8–1.2	t	2026-10-01 07:27:27.659	2026-10-01 07:33:21.464
86789505-048b-489e-ad9b-a8cd287a31e9	599b0d53-c901-47b1-95f4-d3e84420d02c	APTT	Activated Partial Thromboplastin Time	Activated partial thromboplastin time; reference values are reagent/instrument dependent.	Hematology	400.00	seconds	Approximately 25–35 seconds; reagent/instrument dependent	t	2026-10-01 07:27:27.659	2026-10-01 07:33:21.464
\.


--
-- Data for Name: Language; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Language" (id, code, name, "displayOrder", "isSystem", "isActive", "createdAt", "updatedAt") FROM stdin;
7c25ce1f-ce6e-470d-9126-fa2ef7bbba21	EN	English	1	t	t	2026-08-11 20:32:39.643	2026-10-01 07:33:21.48
6d83edea-a308-4972-ab6f-49d18cdf2c3e	ML	Malayalam	2	t	t	2026-08-11 20:32:39.644	2026-10-01 07:33:21.481
d5994d02-cced-4214-9b59-401f70e88046	HI	Hindi	3	t	t	2026-08-11 20:32:39.644	2026-10-01 07:33:21.481
74af52f8-d90d-4d91-ba8a-47234c79684b	TA	Tamil	4	t	t	2026-08-11 20:32:39.644	2026-10-01 07:33:21.482
eebaca0c-b98b-4557-b38c-29d9af4028db	TE	Telugu	5	t	t	2026-08-11 20:32:39.645	2026-10-01 07:33:21.482
f862af3c-aa11-42f5-ba09-05d2188df03b	KN	Kannada	6	t	t	2026-08-11 20:32:39.645	2026-10-01 07:33:21.482
964e2d92-c622-4019-8e00-cc34bb41d33f	MR	Marathi	7	t	t	2026-08-11 20:32:39.646	2026-10-01 07:33:21.483
d5883233-4612-47a6-979f-cefe686078af	GU	Gujarati	8	t	t	2026-08-11 20:32:39.646	2026-10-01 07:33:21.483
60648b43-ddfb-49f7-a692-30e9abeedb84	BN	Bengali	9	t	t	2026-08-11 20:32:39.647	2026-10-01 07:33:21.483
2a680101-381d-43c4-844f-0299ae1a3e54	PA	Punjabi	10	t	t	2026-08-11 20:32:39.647	2026-10-01 07:33:21.484
617afc22-6db8-43d6-b7e9-fd9fcb2aed40	UR	Urdu	11	t	t	2026-08-11 20:32:39.647	2026-10-01 07:33:21.484
77f63852-acac-42b1-9e1c-bedc151ce436	AR	Arabic	12	t	t	2026-08-11 20:32:39.648	2026-10-01 07:33:21.484
245ac2ca-0220-4fc9-816b-b700c236eb9d	AS	Assamese	13	t	t	2026-08-11 20:32:39.648	2026-10-01 07:33:21.485
854f0fe3-48ad-419f-8878-7e13d0364069	OR	Odia	14	t	t	2026-08-11 20:32:39.649	2026-10-01 07:33:21.485
7261bc61-bf3a-417b-a3c5-e74282aad5c7	KOK	Konkani	15	t	t	2026-08-11 20:32:39.649	2026-10-01 07:33:21.485
4c5d0861-3e50-4218-b836-7c417e5546d6	SA	Sanskrit	16	t	t	2026-08-11 20:32:39.649	2026-10-01 07:33:21.486
\.


--
-- Data for Name: MedicalRecord; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."MedicalRecord" (id, "patientId", "doctorId", "appointmentId", "chiefComplaint", "historyOfPresentIllness", "examinationNotes", assessment, "treatmentPlan", "followUpInstructions", "createdAt", "updatedAt") FROM stdin;
b966d30d-836e-438b-8e8c-de175c273835	d5de0008-7abe-4d7b-854f-bd9f9639ce03	4c0cc13e-b989-4e46-ac02-49b58fc3661f	96bd6a1d-94df-4456-a5e7-0227322cfa32	Fever and headache	Fever for last 2 days	High fever with 102	High fever consistant with viral fever	Dolo 500 mg	\N	2026-08-19 17:27:27.632	2026-08-19 17:28:38.441
fd9a119c-2712-459b-8fad-32cfd89fccc3	71a5e98d-5472-4b27-b597-65c4bd31f652	5a97a895-9245-40ca-ab30-66290bb80368	f5069b14-4898-4860-8fa8-ee60b8af37cb	test	test	test	test	test	test	2026-08-19 18:45:45.546	2026-08-19 18:51:08.485
d6eb6e20-d8ee-43e5-bd92-bc82caca0302	3097a220-18be-492b-b6ee-0109e4c797f8	d80aaf36-57f5-44f5-97c1-eb0ee261cede	cc4fbdb9-f0d7-46e0-81f5-acea8ee5fdcb	Fever and Headache	Fever for last 3 days	Fever 102 F	Viral Fever	Provide antibiotics for fever	After 5 days if fever persists	2026-08-20 18:30:18.427	2026-08-20 20:43:54.843
de92efa8-c7aa-41b8-b466-e61db708ae01	fe1d62c9-017e-4758-8816-1591044dc96a	550403a7-6ed6-4aa7-b59d-bd934f1798aa	95d223fb-647d-4ea6-b1be-5f636239aeb2	Fever and body pain	For last 5 days fever and body pain	Fever at 101	Viral Fever	Provide capsule	After 5 days	2026-09-07 19:10:08.203	2026-09-07 19:10:48.364
1bb4bacf-08e6-48fb-84b6-f13e9198fc2c	6ef52290-78d8-47cb-bbfa-3b531e676cbd	550403a7-6ed6-4aa7-b59d-bd934f1798aa	690de29c-c067-4eb3-bf68-a3fd43489c52	test	test	test	test	test	test	2026-10-06 19:37:28.244	2026-10-06 19:38:22.76
347e2d45-36cf-4dd8-b2e2-86a89b624c93	5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	d80aaf36-57f5-44f5-97c1-eb0ee261cede	86234bce-b8e8-49e1-afbc-e57027946fcf	Fever and headache	Fever for last 2 days	Fever at 101	Viral Fever	Antiobiotic/ Paracetamol for 5 days	After 5 days	2026-09-08 05:57:34.582	2026-09-08 05:58:45.703
ce1b7f9c-046e-49d6-a800-ed377fd1ca56	fe1d62c9-017e-4758-8816-1591044dc96a	550403a7-6ed6-4aa7-b59d-bd934f1798aa	02b66477-2b61-45ec-94b3-c114400cc1fe	test	test	test	tset	test	test	2026-09-13 20:09:01.459	2026-09-13 20:09:45.579
bf3ad5a2-ff03-4398-9e93-7aa65e80cc70	71a5e98d-5472-4b27-b597-65c4bd31f652	180b3a62-0f8a-44dc-8742-df32235ef847	9c76a2bf-0c38-4148-a924-5cb5e3f2d124	tset	test	test	test	test	test	2026-09-13 20:44:54.953	2026-09-13 20:45:31.683
ac726de3-36e3-4cb9-ba58-3281a304c0ce	5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	180b3a62-0f8a-44dc-8742-df32235ef847	64485b85-981b-4156-9ca3-7a56418c553e	Fever and Headache	For last 3 days	High fever	Viral Fever	Antibiotic for 5 days	Return for check up if there are any symptoms after 5 days	2026-10-01 07:50:16.39	2026-10-01 07:51:07.585
e7e39f18-cc75-4cde-8713-e91d6551ac57	6874ff96-2ecb-4b1d-bfc4-2793b1a8aef3	174c789a-7711-4f26-85b9-1c04c4cbd634	c1248205-21a9-44fa-9a18-fa79ad2e86ba	test	test	test	test	test	test	2026-10-06 19:34:39.787	2026-10-07 05:26:30.43
5a874540-89c4-45df-8d47-c7d4347859ae	d5de0008-7abe-4d7b-854f-bd9f9639ce03	d80aaf36-57f5-44f5-97c1-eb0ee261cede	65e63467-fe2f-41d5-97a6-46d55a8a44d2	test	test	etst	test	test	test	2026-10-05 09:14:28.555	2026-10-05 09:14:53.351
083d2b2e-cd08-4dab-98e3-0aab767e694c	692ff06f-e317-44f2-9ff3-12aa5a7ba890	0f296b02-cc35-4300-907b-875c56ea58ae	d60d6b64-1672-4ff9-a6af-93ad77162b4d	test	test	test	test	test	test	2026-10-06 18:42:39.744	2026-10-06 18:43:02.669
a756c765-24a9-4023-969f-4d10814f905b	6bdcb5bb-d772-46fb-9d84-cae2e8d214df	174c789a-7711-4f26-85b9-1c04c4cbd634	9132cece-ca82-49bf-8511-5470b0f8c26f	test	test	test	test	test	test	2026-10-07 05:27:43.716	2026-10-07 05:28:20.292
917c5a02-75fe-45fa-8568-09171e271a86	a888ab03-53f7-4de3-b33a-80f6967942c0	04193cd8-f1de-4d9f-b877-fa29143482a1	da1c991d-e97a-4e1b-957a-0ee2cc69ce01	test	test	test	test	test	test	2026-10-13 11:07:01.268	2026-10-13 11:07:09.186
\.


--
-- Data for Name: Medicine; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Medicine" (id, "clinicId", name, "genericName", manufacturer, category, strength, form, unit, price, "isActive", "createdAt", "updatedAt") FROM stdin;
9b5df426-3446-486a-b40b-a3a0f99be383	599b0d53-c901-47b1-95f4-d3e84420d02c	Dolo 500mg	Paracetamol	iSync Pharam	Antiviral	500mg	Tablet	100	5.00	t	2026-08-20 20:39:24.454	2026-09-12 08:15:28.832
f6897a9e-9e3f-4d88-9676-6e1651738b2d	599b0d53-c901-47b1-95f4-d3e84420d02c	Cetrizine	Cetirizine	Zyrtec	Antihistamine	10 mg	Tablet	100	2.00	t	2026-08-20 20:58:06.602	2026-09-12 09:21:42.032
3c62245f-4b20-412c-8095-c617566c9d6e	599b0d53-c901-47b1-95f4-d3e84420d02c	Tylenol	Paracetamol	Kenvue Pharma	Analgesic	325 mg	Tablet	100	10.00	t	2026-08-20 20:42:26.431	2026-09-12 09:21:54.393
8ab42012-7560-46a3-9997-99e39247d6ed	68dbd989-a659-454e-9492-e5490f18bea1	Dolo 500	Paracetamol	ABC pharma	Antipyretic	500mg	Tablet	100	10.00	t	2026-10-13 11:08:09.496	2026-10-13 11:08:09.496
\.


--
-- Data for Name: MedicineBatch; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."MedicineBatch" (id, "clinicId", "medicineId", "batchNumber", "expiryDate", "purchasePrice", "sellingPrice", quantity, "reorderLevel", "isActive", "createdAt", "updatedAt") FROM stdin;
bcf90e92-8032-4258-91da-adf51c034e14	599b0d53-c901-47b1-95f4-d3e84420d02c	9b5df426-3446-486a-b40b-a3a0f99be383	CLIN001-26-09-01A	2027-01-12 00:00:00	3.00	5.00	88	80	t	2026-09-12 09:03:01.373	2026-09-13 20:48:30.741
a6a65546-544b-4e1e-8edb-0a30cb6d9a72	599b0d53-c901-47b1-95f4-d3e84420d02c	f6897a9e-9e3f-4d88-9676-6e1651738b2d	BAT-26-09-002A	2027-02-12 00:00:00	1.00	2.00	87	80	t	2026-09-12 09:12:58.204	2026-10-06 20:21:53.802
bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	599b0d53-c901-47b1-95f4-d3e84420d02c	3c62245f-4b20-412c-8095-c617566c9d6e	BAT-26-09-002B	2027-02-17 00:00:00	5.00	10.00	85	80	t	2026-09-12 09:12:58.214	2026-10-07 05:29:26.038
e1281b14-1a80-420f-a006-554280efd90c	68dbd989-a659-454e-9492-e5490f18bea1	8ab42012-7560-46a3-9997-99e39247d6ed	B-01-2026-10-01	2027-11-30 00:00:00	10.00	15.00	1	0	t	2026-10-13 11:10:04.248	2026-10-13 11:10:04.248
\.


--
-- Data for Name: Patient; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Patient" (id, "clinicId", "patientNumber", "firstName", "middleName", "lastName", gender, "dateOfBirth", phone, email, "bloodGroup", "maritalStatus", "addressLine1", "addressLine2", city, state, country, "postalCode", "emergencyContactName", "emergencyContactPhone", "emergencyContactRelation", "isActive", "createdAt", "updatedAt") FROM stdin;
bfe18d53-9439-4497-9c0b-10e849ae8096	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000001	Arun	\N	Nair	MALE	1975-01-01 00:00:00	+919900000001	arun.nair1@clinexa.demo	O_POSITIVE	SINGLE	\N	\N	Kochi	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.074	2026-08-03 13:02:03.074
e2772d60-5a14-4e2e-a9f5-c53e96d91773	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000002	Rahul	\N	Menon	MALE	1976-02-02 00:00:00	+919900000002	rahul.menon2@clinexa.demo	A_POSITIVE	MARRIED	\N	\N	Thrissur	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.079	2026-08-03 13:02:03.079
709c558d-fcfb-4ee0-b6a4-6c2d65562271	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000003	Vivek	\N	Pillai	MALE	1977-03-03 00:00:00	+919900000003	vivek.pillai3@clinexa.demo	B_POSITIVE	DIVORCED	\N	\N	Kottayam	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.081	2026-08-03 13:02:03.081
0d72e317-0f28-4bdd-ae11-f1a020480fba	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000004	Anil	\N	Varghese	MALE	1978-04-04 00:00:00	+919900000004	anil.varghese4@clinexa.demo	AB_POSITIVE	WIDOWED	\N	\N	Kozhikode	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.084	2026-08-03 13:02:03.084
14a66641-2223-41dc-b7b3-d66bfee15b1d	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000005	Suresh	\N	Joseph	MALE	1979-05-05 00:00:00	+919900000005	suresh.joseph5@clinexa.demo	O_NEGATIVE	SINGLE	\N	\N	Thiruvananthapuram	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.086	2026-08-03 13:02:03.086
ed5a7280-e95c-4535-8fef-efd0d4e05fb9	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000006	Manoj	\N	Thomas	MALE	1980-06-06 00:00:00	+919900000006	manoj.thomas6@clinexa.demo	A_NEGATIVE	MARRIED	\N	\N	Kannur	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.088	2026-08-03 13:02:03.088
aa2ac347-2a9a-4dd3-a88b-8133770f243b	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000007	Rakesh	\N	Mathew	MALE	1981-07-07 00:00:00	+919900000007	rakesh.mathew7@clinexa.demo	B_NEGATIVE	DIVORCED	\N	\N	Palakkad	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.09	2026-08-03 13:02:03.09
a5a2d945-3ac1-4424-b379-93aed51b0a69	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000008	Nikhil	\N	Kurian	MALE	1982-08-08 00:00:00	+919900000008	nikhil.kurian8@clinexa.demo	AB_NEGATIVE	WIDOWED	\N	\N	Alappuzha	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.091	2026-08-03 13:02:03.091
c724c1ec-380c-4dc9-ba71-042c657c8e37	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000009	Akhil	\N	Kumar	MALE	1983-09-09 00:00:00	+919900000009	akhil.kumar9@clinexa.demo	O_POSITIVE	SINGLE	\N	\N	Malappuram	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.092	2026-08-03 13:02:03.092
3f46cae7-41db-4bf6-af68-7677cf44492c	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000010	Kiran	\N	Rajan	MALE	1984-10-10 00:00:00	+919900000010	kiran.rajan10@clinexa.demo	A_POSITIVE	MARRIED	\N	\N	Ernakulam	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.094	2026-08-03 13:02:03.094
4974b579-4494-46d0-a20c-1c8aaf583048	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000011	Ajay	\N	Krishnan	MALE	1985-11-11 00:00:00	+919900000011	ajay.krishnan11@clinexa.demo	B_POSITIVE	DIVORCED	\N	\N	Kochi	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.097	2026-08-03 13:02:03.097
56b47820-c856-4fe3-b65c-2596c40a8b18	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000012	Prakash	\N	Das	MALE	1986-12-12 00:00:00	+919900000012	prakash.das12@clinexa.demo	AB_POSITIVE	WIDOWED	\N	\N	Thrissur	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.099	2026-08-03 13:02:03.099
bb838bd7-7132-4f60-880d-baff995d4dd8	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000013	Sanjay	\N	Babu	MALE	1987-01-13 00:00:00	+919900000013	sanjay.babu13@clinexa.demo	O_NEGATIVE	SINGLE	\N	\N	Kottayam	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.1	2026-08-03 13:02:03.1
9081e047-2556-4b50-a549-d7aca64d9f59	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000014	Deepak	\N	George	MALE	1988-02-14 00:00:00	+919900000014	deepak.george14@clinexa.demo	A_NEGATIVE	MARRIED	\N	\N	Kozhikode	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.101	2026-08-03 13:02:03.101
6c9381e9-1dc5-4ac4-a7ed-856e3b636c22	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000015	Ashwin	\N	Antony	MALE	1989-03-15 00:00:00	+919900000015	ashwin.antony15@clinexa.demo	B_NEGATIVE	DIVORCED	\N	\N	Thiruvananthapuram	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.103	2026-08-03 13:02:03.103
6bdcb5bb-d772-46fb-9d84-cae2e8d214df	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000016	Rohit	\N	Fernandes	MALE	1990-04-16 00:00:00	+919900000016	rohit.fernandes16@clinexa.demo	AB_NEGATIVE	WIDOWED	\N	\N	Kannur	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.105	2026-08-03 13:02:03.105
47e5cfdc-2deb-4e7d-becf-aa81642f8335	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000017	Arvind	\N	Sharma	MALE	1991-05-17 00:00:00	+919900000017	arvind.sharma17@clinexa.demo	O_POSITIVE	SINGLE	\N	\N	Palakkad	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.106	2026-08-03 13:02:03.106
52e32c73-62b9-4ff8-a6ca-1237e73cf56b	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000018	Joseph	\N	Patel	MALE	1992-06-18 00:00:00	+919900000018	joseph.patel18@clinexa.demo	A_POSITIVE	MARRIED	\N	\N	Alappuzha	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.108	2026-08-03 13:02:03.108
2a456cec-8050-4899-90bc-6034d194dd56	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000019	Thomas	\N	Reddy	MALE	1993-07-19 00:00:00	+919900000019	thomas.reddy19@clinexa.demo	B_POSITIVE	DIVORCED	\N	\N	Malappuram	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.109	2026-08-03 13:02:03.109
1b6f33ca-0ab5-4e41-bdfe-3ce44bb11000	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000020	Mathew	\N	Iyer	MALE	1994-08-20 00:00:00	+919900000020	mathew.iyer20@clinexa.demo	AB_POSITIVE	WIDOWED	\N	\N	Ernakulam	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.111	2026-08-03 13:02:03.111
e9f829df-57d4-4a49-9646-c5268dea0b1e	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000021	Biju	\N	Namboodiri	MALE	1975-09-21 00:00:00	+919900000021	biju.namboodiri21@clinexa.demo	O_NEGATIVE	SINGLE	\N	\N	Kochi	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.112	2026-08-03 13:02:03.112
f4165972-3861-419f-9912-adeebbdab1b7	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000022	Sajin	\N	Paul	MALE	1976-10-22 00:00:00	+919900000022	sajin.paul22@clinexa.demo	A_NEGATIVE	MARRIED	\N	\N	Thrissur	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.113	2026-08-03 13:02:03.113
602f9762-d32a-4a18-824e-d6d0fc11d1fd	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000023	Sandeep	\N	Philip	MALE	1977-11-23 00:00:00	+919900000023	sandeep.philip23@clinexa.demo	B_NEGATIVE	DIVORCED	\N	\N	Kottayam	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.115	2026-08-03 13:02:03.115
19ab4437-2bb2-4e12-80ba-d075cf391667	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000024	Abhilash	\N	Sebastian	MALE	1978-12-24 00:00:00	+919900000024	abhilash.sebastian24@clinexa.demo	AB_NEGATIVE	WIDOWED	\N	\N	Kozhikode	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.116	2026-08-03 13:02:03.116
90485fe0-0fca-4c36-af8d-6d417dddbbb1	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000025	Vinod	\N	Singh	MALE	1979-01-25 00:00:00	+919900000025	vinod.singh25@clinexa.demo	O_POSITIVE	SINGLE	\N	\N	Thiruvananthapuram	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.118	2026-08-03 13:02:03.118
c103ae08-ecbf-470e-ad61-9ac8fd17eb70	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000026	Anjali	\N	Kurian	FEMALE	1978-04-06 00:00:00	+919900000026	anjali.kurian26@clinexa.demo	A_POSITIVE	MARRIED	\N	\N	Kannur	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.119	2026-08-03 13:02:03.119
7ea591db-567b-4d93-99b4-4be1479b54ac	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000027	Meera	\N	Kumar	FEMALE	1979-05-07 00:00:00	+919900000027	meera.kumar27@clinexa.demo	B_POSITIVE	DIVORCED	\N	\N	Palakkad	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.121	2026-08-03 13:02:03.121
445bb70b-7676-450d-96e7-cc8cacf0d2d7	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000028	Lakshmi	\N	Rajan	FEMALE	1980-06-08 00:00:00	+919900000028	lakshmi.rajan28@clinexa.demo	AB_POSITIVE	WIDOWED	\N	\N	Alappuzha	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.123	2026-08-03 13:02:03.123
1f69a5fc-5c1f-47b9-9068-91d0d39782b1	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000029	Asha	\N	Krishnan	FEMALE	1981-07-09 00:00:00	+919900000029	asha.krishnan29@clinexa.demo	O_NEGATIVE	SINGLE	\N	\N	Malappuram	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.124	2026-08-03 13:02:03.124
cba9c2ba-36f3-4b99-a40f-1ae60b6e4a93	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000030	Priya	\N	Das	FEMALE	1982-08-10 00:00:00	+919900000030	priya.das30@clinexa.demo	A_NEGATIVE	MARRIED	\N	\N	Ernakulam	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.125	2026-08-03 13:02:03.125
ae495ce2-e25b-4780-93e9-5ebd8b39d3e1	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000031	Sneha	\N	Babu	FEMALE	1983-09-11 00:00:00	+919900000031	sneha.babu31@clinexa.demo	B_NEGATIVE	DIVORCED	\N	\N	Kochi	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.127	2026-08-03 13:02:03.127
692ff06f-e317-44f2-9ff3-12aa5a7ba890	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000032	Divya	\N	George	FEMALE	1984-10-12 00:00:00	+919900000032	divya.george32@clinexa.demo	AB_NEGATIVE	WIDOWED	\N	\N	Thrissur	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.129	2026-08-03 13:02:03.129
12d0c893-24ee-4ac5-8516-77e673d3d151	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000033	Neethu	\N	Antony	FEMALE	1985-11-13 00:00:00	+919900000033	neethu.antony33@clinexa.demo	O_POSITIVE	SINGLE	\N	\N	Kottayam	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.13	2026-08-03 13:02:03.13
7378b647-fda1-4134-a9b4-775606f1aecc	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000034	Reshma	\N	Fernandes	FEMALE	1986-12-14 00:00:00	+919900000034	reshma.fernandes34@clinexa.demo	A_POSITIVE	MARRIED	\N	\N	Kozhikode	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.132	2026-08-03 13:02:03.132
60552f5e-7a3b-47e0-b473-711e692419b8	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000035	Nisha	\N	Sharma	FEMALE	1987-01-15 00:00:00	+919900000035	nisha.sharma35@clinexa.demo	B_POSITIVE	DIVORCED	\N	\N	Thiruvananthapuram	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.133	2026-08-03 13:02:03.133
d28090c5-cfce-4a8c-b388-2f9a08a741e5	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000036	Deepa	\N	Patel	FEMALE	1988-02-16 00:00:00	+919900000036	deepa.patel36@clinexa.demo	AB_POSITIVE	WIDOWED	\N	\N	Kannur	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.135	2026-08-03 13:02:03.135
6ef52290-78d8-47cb-bbfa-3b531e676cbd	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000037	Anu	\N	Reddy	FEMALE	1989-03-17 00:00:00	+919900000037	anu.reddy37@clinexa.demo	O_NEGATIVE	SINGLE	\N	\N	Palakkad	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.136	2026-08-03 13:02:03.136
6098c3ca-628e-4c81-bc2b-f1bd968f1398	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000038	Keerthana	\N	Iyer	FEMALE	1990-04-18 00:00:00	+919900000038	keerthana.iyer38@clinexa.demo	A_NEGATIVE	MARRIED	\N	\N	Alappuzha	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.137	2026-08-03 13:02:03.137
319d8a92-9468-467a-993a-8c89a28b6ed2	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000039	Arya	\N	Namboodiri	FEMALE	1991-05-19 00:00:00	+919900000039	arya.namboodiri39@clinexa.demo	B_NEGATIVE	DIVORCED	\N	\N	Malappuram	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.139	2026-08-03 13:02:03.139
bbebe46b-0968-47ed-9419-49d222598714	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000040	Parvathy	\N	Paul	FEMALE	1992-06-20 00:00:00	+919900000040	parvathy.paul40@clinexa.demo	AB_NEGATIVE	WIDOWED	\N	\N	Ernakulam	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.14	2026-08-03 13:02:03.14
523966e1-701e-4d9c-97af-0f0ba89ff28e	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000041	Sandra	\N	Philip	FEMALE	1993-07-21 00:00:00	+919900000041	sandra.philip41@clinexa.demo	O_POSITIVE	SINGLE	\N	\N	Kochi	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.141	2026-08-03 13:02:03.141
d9f173db-b013-46b6-8eef-94cdc4c82249	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000042	Aparna	\N	Sebastian	FEMALE	1994-08-22 00:00:00	+919900000042	aparna.sebastian42@clinexa.demo	A_POSITIVE	MARRIED	\N	\N	Thrissur	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.143	2026-08-03 13:02:03.143
d2125b21-dd24-41ae-850b-18932c3712e4	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000043	Gayathri	\N	Singh	FEMALE	1995-09-23 00:00:00	+919900000043	gayathri.singh43@clinexa.demo	B_POSITIVE	DIVORCED	\N	\N	Kottayam	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.144	2026-08-03 13:02:03.144
723b3147-97c5-4739-977d-64b6a499f66d	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000044	Maria	\N	Nair	FEMALE	1996-10-24 00:00:00	+919900000044	maria.nair44@clinexa.demo	AB_POSITIVE	WIDOWED	\N	\N	Kozhikode	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.146	2026-08-03 13:02:03.146
3097a220-18be-492b-b6ee-0109e4c797f8	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000045	Elsa	\N	Menon	FEMALE	1997-11-25 00:00:00	+919900000045	elsa.menon45@clinexa.demo	O_NEGATIVE	SINGLE	\N	\N	Thiruvananthapuram	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.147	2026-08-03 13:02:03.147
d5de0008-7abe-4d7b-854f-bd9f9639ce03	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000046	Riya	\N	Pillai	FEMALE	1978-12-26 00:00:00	+919900000046	riya.pillai46@clinexa.demo	A_NEGATIVE	MARRIED	\N	\N	Kannur	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.149	2026-08-03 13:02:03.149
71a5e98d-5472-4b27-b597-65c4bd31f652	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000047	Pooja	\N	Varghese	FEMALE	1979-01-27 00:00:00	+919900000047	pooja.varghese47@clinexa.demo	B_NEGATIVE	DIVORCED	\N	\N	Palakkad	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.15	2026-08-03 13:02:03.15
6874ff96-2ecb-4b1d-bfc4-2793b1a8aef3	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000048	Kavya	\N	Joseph	FEMALE	1980-02-01 00:00:00	+919900000048	kavya.joseph48@clinexa.demo	AB_NEGATIVE	WIDOWED	\N	\N	Alappuzha	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.152	2026-08-03 13:02:03.152
5651b975-fa8a-4dc3-9e0c-1c3cd11f69fb	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000049	Shilpa	\N	Thomas	FEMALE	1981-03-02 00:00:00	+919900000049	shilpa.thomas49@clinexa.demo	O_POSITIVE	SINGLE	\N	\N	Malappuram	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.154	2026-08-03 13:02:03.154
c5e8de63-d3f0-4f2a-b5bb-04bcd636a21d	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000052	Anjana	\N	Aravind	FEMALE	1983-10-05 00:00:00	+918089930714	anjana.aravind@gmail.com	O_POSITIVE	\N	Vadakke Kunnath, Near Chendamangalam Panchayath Office and Ambady Seva kendra	\N	Ernakulam	Kerala	India	683521	\N	\N	\N	t	2026-10-02 09:09:57.905	2026-10-12 06:26:38.196
1c772231-769f-4100-82fd-217013905dc3	e64604ef-6994-4f55-9a90-1045b2cebff9	CLN-000002-PAT-000001	Sudheesh	\N	Sukumaran Pillai	MALE	1980-04-19 00:00:00	+919895068679	sudheesh.s@gmail.com	AB_NEGATIVE	MARRIED	Kizhakkethil, Subhash Lane, U C College P.O, Aluva	\N	Kochi	Kerala	India	683102	\N	\N	\N	t	2026-10-13 06:37:50.547	2026-10-13 06:37:50.547
004308c3-76e1-404c-8ca9-f18ade54066a	68dbd989-a659-454e-9492-e5490f18bea1	CLN-000004-PAT-000001	Sudheesh	\N	Sukumaran Pillai	MALE	1980-04-19 00:00:00	+919895068679	sudheesh.s@gmail.com	AB_NEGATIVE	\N	Kizhakkethil, Subhash Lane, U C College P.O, Aluva	\N	Kochi	Kerala	India	683102	\N	\N	\N	t	2026-10-13 08:13:11.402	2026-10-13 08:13:11.402
a888ab03-53f7-4de3-b33a-80f6967942c0	68dbd989-a659-454e-9492-e5490f18bea1	CLN-000004-PAT-000002	Lis	\N	Beth	FEMALE	2018-03-03 00:00:00	+919895068679	sudheesh.s2@gmail.com	B_NEGATIVE	\N	Kizhakkethil, Subhash Lane, U C College P.O, Aluva	\N	Kochi	Kerala	India	683102	\N	\N	\N	t	2026-10-13 08:40:01.764	2026-10-13 08:40:01.764
9f4c0755-0236-4c53-b6f8-553b823c8bcc	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000051	Sudheesh	\N	Sukumara Pillai	MALE	1980-04-19 00:00:00	+919895068679	sudheesh.s@gmail.com	AB_NEGATIVE	MARRIED	Kizhakkethil, Subhash Lane,U C College P.O, Aluva	U C College P.O, Aluva	Kochi	Kerala	India	683102	\N	\N	\N	t	2026-08-19 04:18:43.814	2026-08-19 05:01:38.06
fe1d62c9-017e-4758-8816-1591044dc96a	599b0d53-c901-47b1-95f4-d3e84420d02c	CLINIC001-PAT-000050	Nandana	\N	Mathew	FEMALE	1982-04-03 00:00:00	+919900000050	nandana.mathew50@clinexa.demo	A_POSITIVE	MARRIED	\N	\N	Ernakulam	Kerala	India	\N	\N	\N	\N	t	2026-08-03 13:02:03.155	2026-09-13 20:58:12.785
\.


--
-- Data for Name: Payment; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Payment" (id, "invoiceId", amount, method, status, "transactionReference", notes, "paidAt", "createdAt") FROM stdin;
037d4ece-04a5-44ec-b06b-8e951d9b829c	8831435d-24ae-4198-8ff8-5eaf749d8ca4	700.00	CASH	SUCCESS	\N	\N	2026-10-05 08:16:29.68	2026-10-05 08:16:29.68
bf8f071d-ee7e-49c6-8f45-f877de5f2c1c	a3d110e2-bf56-4d40-bec6-10d0dbfbe963	1300.00	CASH	SUCCESS	\N	\N	2026-10-05 09:21:07.9	2026-10-05 09:21:07.9
1cb9bc5c-04ab-41b7-9b28-024a36121a6a	3aed330c-b583-45ba-aaec-62bc2e41d6bc	350.00	CASH	SUCCESS	\N	\N	2026-10-05 09:21:30.84	2026-10-05 09:21:30.84
676e5346-2d61-4136-b2bf-8144b5e59476	3aed330c-b583-45ba-aaec-62bc2e41d6bc	100.00	CASH	SUCCESS	\N	\N	2026-10-05 09:21:41.984	2026-10-05 09:21:41.984
5832895b-f6ce-40d8-8147-4499cdb78341	311e6913-2cb0-417d-aee2-ab2737ce132b	900.00	CASH	SUCCESS	\N	\N	2026-10-06 19:17:48.407	2026-10-06 19:17:48.407
62a6b835-35d1-40aa-8e9b-1334296ad982	a82dcebb-5a71-40fe-bd34-4ea52be91a38	60.00	UPI	SUCCESS	\N	\N	2026-10-06 20:02:43.996	2026-10-06 20:02:43.996
10dcf83d-09d6-4894-8c23-51ea50991d19	630e7551-c294-4caf-a389-991b4db37b32	900.00	CASH	SUCCESS	\N	\N	2026-10-06 20:08:19.454	2026-10-06 20:08:19.454
35012978-f29c-4627-b8c6-1d27688140c3	92df6b6c-1a05-4536-aa4a-aa1a6df035df	2.00	CASH	SUCCESS	\N	\N	2026-10-06 20:08:35.565	2026-10-06 20:08:35.565
59bb27c8-733b-4261-8945-5559584ece9b	a5034c03-ddb8-4394-a753-6ca68e9d3a0e	880.00	UPI	SUCCESS	\N	\N	2026-10-06 20:08:48.093	2026-10-06 20:08:48.093
0c79e002-0aee-45a4-9f82-673392b97c2b	f86a7576-3657-455a-85d3-d01794a4418e	1200.00	UPI	SUCCESS	\N	\N	2026-10-07 05:27:23.747	2026-10-07 05:27:23.747
b26a8eb2-9949-4660-a751-cb01e87fad24	d73bc281-f86f-4a96-9b0a-6c30af623b89	1430.00	CASH	SUCCESS	\N	\N	2026-10-07 05:29:06.687	2026-10-07 05:29:06.687
e66b4e60-5d37-4947-b169-b1e7642d19b9	04c1cb69-cd5f-40e6-ba56-fe4ad279b91f	50.00	CASH	SUCCESS	\N	\N	2026-10-07 05:29:37.571	2026-10-07 05:29:37.571
8257e060-5854-4b51-ad38-c5e0c883f8ab	8cce8db5-b5c2-4798-a68c-ece3dc63658e	300.00	CASH	SUCCESS	\N	\N	2026-10-13 10:45:29.185	2026-10-13 10:45:29.185
\.


--
-- Data for Name: Permission; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Permission" (id, code, name, description, "isSystem", "permissionGroupId", "createdAt", "updatedAt") FROM stdin;
50a285ea-a12d-4d2c-a480-5c209314ba55	PATIENT_DELETE	Delete Patients	\N	t	73a8c3c5-de04-48f0-ac59-460473f65dbc	2026-08-03 11:30:47.459	2026-10-01 07:33:21.144
17f13669-7062-445c-8c49-7aafd88ef81a	DOCTOR_CREATE	Create Doctors	\N	t	ccd44ec9-d933-4626-b18b-4a997f98c05a	2026-08-03 11:30:47.461	2026-10-01 07:33:21.145
25f64f57-fcd2-4327-a966-c5aa9ae82edc	ROLE_UPDATE	Update Roles	\N	t	d75b2c23-43d6-4d5e-b0bb-dd07b0f1af29	2026-08-03 11:30:47.456	2026-10-01 07:33:21.138
bce87669-2ebc-4214-983a-66e03bc431c4	APPOINTMENT_READ	View Appointments	\N	t	0ae6fa74-d297-450e-bde1-60443fac9c1d	2026-08-03 11:30:47.462	2026-10-01 07:33:21.147
081cad89-876d-48d4-9f61-03a39951b49c	APPOINTMENT_CREATE	Create Appointments	\N	t	0ae6fa74-d297-450e-bde1-60443fac9c1d	2026-08-03 11:30:47.463	2026-10-01 07:33:21.148
4642731e-ab76-4665-a20a-747bc1995bb5	APPOINTMENT_UPDATE	Update Appointments	\N	t	0ae6fa74-d297-450e-bde1-60443fac9c1d	2026-08-03 11:30:47.463	2026-10-01 07:33:21.148
7e798bb2-731b-46fd-8d27-694320d45f57	APPOINTMENT_CANCEL	Cancel Appointments	\N	t	0ae6fa74-d297-450e-bde1-60443fac9c1d	2026-08-03 11:30:47.464	2026-10-01 07:33:21.149
1f7c8766-46de-4d50-b116-375cc09df426	MEDICAL_RECORD_READ	View Medical Records	\N	t	1405eeed-0e76-41a9-b9a1-2fd2badf212b	2026-08-03 11:30:47.464	2026-10-01 07:33:21.15
ffca2a5d-5642-48ac-9ae9-af9de6c8669d	MEDICAL_RECORD_CREATE	Create Medical Records	\N	t	1405eeed-0e76-41a9-b9a1-2fd2badf212b	2026-08-03 11:30:47.465	2026-10-01 07:33:21.15
438e8734-029a-4d06-a567-c58f1c945053	MEDICAL_RECORD_UPDATE	Update Medical Records	\N	t	1405eeed-0e76-41a9-b9a1-2fd2badf212b	2026-08-03 11:30:47.465	2026-10-01 07:33:21.151
ae6f0b26-93bc-4be2-9df2-7a9d09ce83dc	MEDICAL_RECORD_DELETE	Delete Medical Records	\N	t	1405eeed-0e76-41a9-b9a1-2fd2badf212b	2026-08-03 11:30:47.466	2026-10-01 07:33:21.151
8a1f8922-5c88-4db7-abc3-7733639f5bc0	LAB_READ	View Laboratory	\N	t	c3728e81-57cc-408b-9769-0c47aa34ec9d	2026-08-03 11:30:47.466	2026-10-01 07:33:21.157
08476e55-bfdf-4216-a2a5-9fd27f3c8deb	LAB_CREATE	Create Laboratory Tests	\N	t	c3728e81-57cc-408b-9769-0c47aa34ec9d	2026-08-03 11:30:47.467	2026-10-01 07:33:21.158
67464de8-359e-4f37-bd52-48a92d0bc616	LAB_UPDATE	Update Laboratory Tests	\N	t	c3728e81-57cc-408b-9769-0c47aa34ec9d	2026-08-03 11:30:47.467	2026-10-01 07:33:21.158
d68f1450-38c6-4d97-8229-83845f49d1f9	USER_UPDATE	Update Users	\N	t	d75b2c23-43d6-4d5e-b0bb-dd07b0f1af29	2026-08-03 11:30:47.454	2026-10-01 07:33:21.137
ab6ed9a2-d1b4-4b0e-be6f-5b024550a413	LAB_DELETE	Delete Laboratory Tests	\N	t	c3728e81-57cc-408b-9769-0c47aa34ec9d	2026-08-03 11:30:47.468	2026-10-01 07:33:21.158
602712c8-d2fe-40f7-85f0-760285b3c617	ROLE_READ	View Roles	\N	t	d75b2c23-43d6-4d5e-b0bb-dd07b0f1af29	2026-08-03 11:30:47.456	2026-10-01 07:33:21.137
da29b701-894a-4d65-bf5a-c4281898d923	PHARMACY_READ	View Medicines	\N	t	4ff8dfeb-80e8-497d-93b2-ec8bb8d981ca	2026-08-03 11:30:47.468	2026-10-01 07:33:21.159
fec4403c-1ed4-46f4-9676-6a237461bb1e	PHARMACY_CREATE	Create Medicines	\N	t	4ff8dfeb-80e8-497d-93b2-ec8bb8d981ca	2026-08-03 11:30:47.469	2026-10-01 07:33:21.16
3fe19280-7b43-424c-8b84-7af25e2b5aba	PHARMACY_UPDATE	Update Medicines	\N	t	4ff8dfeb-80e8-497d-93b2-ec8bb8d981ca	2026-08-03 11:30:47.47	2026-10-01 07:33:21.16
fcf591ca-f5a3-40a9-bb20-1ccfa81e1efa	PHARMACY_DELETE	Delete Medicines	\N	t	4ff8dfeb-80e8-497d-93b2-ec8bb8d981ca	2026-08-03 11:30:47.47	2026-10-01 07:33:21.161
d8b42c8a-a598-46b6-b8f6-f245262a15d7	BILLING_READ	View Billing	\N	t	e0b6f3a1-064a-40a8-9e0f-418051fae29c	2026-08-03 11:30:47.472	2026-10-01 07:33:21.162
dfab1a33-0bba-42c2-ba15-92d16495b54c	BILLING_CREATE	Create Invoices	\N	t	e0b6f3a1-064a-40a8-9e0f-418051fae29c	2026-08-03 11:30:47.473	2026-10-01 07:33:21.162
cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	BILLING_UPDATE	Update Invoices	\N	t	e0b6f3a1-064a-40a8-9e0f-418051fae29c	2026-08-03 11:30:47.473	2026-10-01 07:33:21.163
dcf0bf5a-f52a-4bd6-9978-cada53cd3b00	BILLING_REFUND	Refund Invoices	\N	t	e0b6f3a1-064a-40a8-9e0f-418051fae29c	2026-08-03 11:30:47.474	2026-10-01 07:33:21.163
d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	INVENTORY_READ	View Inventory	\N	t	cef59b37-3865-40f5-84ba-6885df58cdda	2026-08-03 11:30:47.475	2026-10-01 07:33:21.164
91ac8c55-faf2-41c1-9b25-709ef83008c8	INVENTORY_CREATE	Create Inventory	\N	t	cef59b37-3865-40f5-84ba-6885df58cdda	2026-08-03 11:30:47.475	2026-10-01 07:33:21.164
f0485505-9af4-4278-8785-2f44621cdbea	INVENTORY_UPDATE	Update Inventory	\N	t	cef59b37-3865-40f5-84ba-6885df58cdda	2026-08-03 11:30:47.475	2026-10-01 07:33:21.165
27609b22-85ee-4f49-8623-524e2c9e7216	INVENTORY_DELETE	Delete Inventory	\N	t	cef59b37-3865-40f5-84ba-6885df58cdda	2026-08-03 11:30:47.476	2026-10-01 07:33:21.165
3ce3e42e-3f92-4013-a44d-fe35f3a83a76	REPORT_READ	View Reports	\N	t	b94ae94d-cd85-41bc-bdbf-7542537e904d	2026-08-03 11:30:47.477	2026-10-01 07:33:21.166
68882f19-9744-4f0e-a77c-e43ed45f0dda	REPORT_EXPORT	Export Reports	\N	t	b94ae94d-cd85-41bc-bdbf-7542537e904d	2026-08-03 11:30:47.477	2026-10-01 07:33:21.167
97f8aeb0-1f28-4413-9057-5829142baf23	SETTINGS_READ	View Settings	\N	t	b5b63176-e2f2-46e9-9db7-c02d4e7dedf3	2026-08-03 11:30:47.478	2026-10-01 07:33:21.167
2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	SETTINGS_UPDATE	Update Settings	\N	t	b5b63176-e2f2-46e9-9db7-c02d4e7dedf3	2026-08-03 11:30:47.478	2026-10-01 07:33:21.168
02e0f2a9-937f-4eff-b922-60161249c463	DEPARTMENT_READ	View Departments	\N	t	6927238d-fd79-4805-8758-a38bbd8755b5	2026-08-11 20:32:39.365	2026-10-01 07:33:21.169
36774315-0855-460e-963b-096145c6f140	DEPARTMENT_CREATE	Create Departments	\N	t	6927238d-fd79-4805-8758-a38bbd8755b5	2026-08-11 20:32:39.366	2026-10-01 07:33:21.169
b9e2d35c-3103-4048-8ed6-4f01c50ec94c	DEPARTMENT_UPDATE	Update Departments	\N	t	6927238d-fd79-4805-8758-a38bbd8755b5	2026-08-11 20:32:39.367	2026-10-01 07:33:21.169
fcf39650-8669-4fc9-af12-527676b8a04a	DEPARTMENT_DELETE	Delete Departments	\N	t	6927238d-fd79-4805-8758-a38bbd8755b5	2026-08-11 20:32:39.367	2026-10-01 07:33:21.17
e1881f57-3ee9-49f2-ba3d-63de0a24423b	USER_READ	View Users	\N	t	d75b2c23-43d6-4d5e-b0bb-dd07b0f1af29	2026-08-03 11:30:47.452	2026-10-01 07:33:21.135
eb83e3ba-c57a-43f1-8dda-55d0a418791f	PERMISSION_READ	View Permissions	\N	t	d75b2c23-43d6-4d5e-b0bb-dd07b0f1af29	2026-08-03 11:30:47.457	2026-10-01 07:33:21.14
a4e72793-ee62-43da-8abb-5845867d2c84	PATIENT_READ	View Patients	\N	t	73a8c3c5-de04-48f0-ac59-460473f65dbc	2026-08-03 11:30:47.458	2026-10-01 07:33:21.143
86a5bd2d-98cc-404e-9c8c-b106824085b5	PATIENT_CREATE	Create Patients	\N	t	73a8c3c5-de04-48f0-ac59-460473f65dbc	2026-08-03 11:30:47.458	2026-10-01 07:33:21.143
00733de3-2a71-4392-b6ca-1d429c3dfe71	PATIENT_UPDATE	Update Patients	\N	t	73a8c3c5-de04-48f0-ac59-460473f65dbc	2026-08-03 11:30:47.459	2026-10-01 07:33:21.144
f7a067e9-a97c-423b-be80-96e454b23edf	DOCTOR_READ	View Doctors	\N	t	ccd44ec9-d933-4626-b18b-4a997f98c05a	2026-08-03 11:30:47.46	2026-10-01 07:33:21.145
c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	DOCTOR_UPDATE	Update Doctors	\N	t	ccd44ec9-d933-4626-b18b-4a997f98c05a	2026-08-03 11:30:47.461	2026-10-01 07:33:21.146
7b1acadd-e604-4f51-a307-fc70407f63f4	DOCTOR_DELETE	Delete Doctors	\N	t	ccd44ec9-d933-4626-b18b-4a997f98c05a	2026-08-03 11:30:47.462	2026-10-01 07:33:21.146
993a4016-30db-4535-a507-fdba51e22b04	USER_CREATE	Create Users	\N	t	d75b2c23-43d6-4d5e-b0bb-dd07b0f1af29	2026-08-03 11:30:47.453	2026-10-01 07:33:21.136
c4b54570-7e4f-4ed4-a70f-b836c4d95c97	USER_DELETE	Delete Users	\N	t	d75b2c23-43d6-4d5e-b0bb-dd07b0f1af29	2026-08-03 11:30:47.455	2026-10-01 07:33:21.137
9fa27428-934e-4572-bf59-7d8534bea584	ROLE_CREATE	Create Roles	\N	t	d75b2c23-43d6-4d5e-b0bb-dd07b0f1af29	2026-08-03 11:30:47.456	2026-10-01 07:33:21.138
18363a37-70d3-422d-8542-defe75e088fe	ROLE_DELETE	Delete Roles	\N	t	d75b2c23-43d6-4d5e-b0bb-dd07b0f1af29	2026-08-03 11:30:47.457	2026-10-01 07:33:21.139
e8bcfd66-42c5-46ec-8d41-e11986589ed5	REGISTRATION_COUNCIL_UPDATE	Update Registration Councils	\N	t	238b183e-c856-4cdf-8723-3f2290484d7d	2026-08-11 20:32:39.375	2026-10-01 07:33:21.178
1f466d06-e977-47e8-8114-f8d374dbd679	REGISTRATION_COUNCIL_DELETE	Delete Registration Councils	\N	t	238b183e-c856-4cdf-8723-3f2290484d7d	2026-08-11 20:32:39.376	2026-10-01 07:33:21.179
8ebf2df5-cec8-4ec4-83f7-281aab573265	PRESCRIPTION_READ	View Prescriptions	\N	t	96214673-87e3-4901-b255-6036d7de7416	2026-08-20 19:58:01.414	2026-10-01 07:33:21.154
8502c2e6-be17-449a-98e0-497369f534c5	PRESCRIPTION_CREATE	Create Prescriptions	\N	t	96214673-87e3-4901-b255-6036d7de7416	2026-08-20 19:58:01.416	2026-10-01 07:33:21.155
a2943b86-1c02-42f9-a14c-d62f3eda6620	PRESCRIPTION_UPDATE	Update Prescriptions	\N	t	96214673-87e3-4901-b255-6036d7de7416	2026-08-20 19:58:01.416	2026-10-01 07:33:21.155
98d307f4-86ac-4787-ab21-76d7e963740f	PRESCRIPTION_DELETE	Delete Prescriptions	\N	t	96214673-87e3-4901-b255-6036d7de7416	2026-08-20 19:58:01.417	2026-10-01 07:33:21.156
79bc0a91-27bf-46f5-96c3-79287c6e82f8	SPECIALTY_READ	View Specialties	\N	t	f317bf74-86f0-498a-b1c1-ed4ee581845a	2026-08-11 20:32:39.368	2026-10-01 07:33:21.171
68b62ead-3a09-4ee7-b78a-91ea2e38926e	SPECIALTY_CREATE	Create Specialties	\N	t	f317bf74-86f0-498a-b1c1-ed4ee581845a	2026-08-11 20:32:39.368	2026-10-01 07:33:21.171
53d323ce-6511-4930-9043-330bf1085b22	SPECIALTY_UPDATE	Update Specialties	\N	t	f317bf74-86f0-498a-b1c1-ed4ee581845a	2026-08-11 20:32:39.369	2026-10-01 07:33:21.172
cce72d8f-8f06-4cb7-8225-3e290a86f7e9	SPECIALTY_DELETE	Delete Specialties	\N	t	f317bf74-86f0-498a-b1c1-ed4ee581845a	2026-08-11 20:32:39.369	2026-10-01 07:33:21.172
989609d1-dfa9-481f-ba96-2d4027703721	QUALIFICATION_READ	View Qualifications	\N	t	b713f05c-0122-434a-9290-fa86fd9418d0	2026-08-11 20:32:39.37	2026-10-01 07:33:21.173
09777e17-7293-40f9-9a7f-1953197a24d6	QUALIFICATION_CREATE	Create Qualifications	\N	t	b713f05c-0122-434a-9290-fa86fd9418d0	2026-08-11 20:32:39.371	2026-10-01 07:33:21.173
af8e0ae4-f1ab-4410-8c75-10947a248ad9	QUALIFICATION_UPDATE	Update Qualifications	\N	t	b713f05c-0122-434a-9290-fa86fd9418d0	2026-08-11 20:32:39.371	2026-10-01 07:33:21.174
1bf8b755-81df-4e88-b9f5-7fcc41b45048	QUALIFICATION_DELETE	Delete Qualifications	\N	t	b713f05c-0122-434a-9290-fa86fd9418d0	2026-08-11 20:32:39.372	2026-10-01 07:33:21.174
2c275b11-01ee-4470-b57b-45ca7c9adb78	LANGUAGE_READ	View Languages	\N	t	15ae0e5c-3893-4979-96e6-b4f9aeaef550	2026-08-11 20:32:39.372	2026-10-01 07:33:21.175
b7f459de-a8a2-4697-9914-4c46c68c3b97	LANGUAGE_CREATE	Create Languages	\N	t	15ae0e5c-3893-4979-96e6-b4f9aeaef550	2026-08-11 20:32:39.373	2026-10-01 07:33:21.175
366e4a28-eb96-44cd-ad55-3ba91f597f65	CLINIC_READ	View Clinics	\N	t	8d4e9c2f-93e5-44e6-b4c6-116cdacf7e44	2026-08-14 19:42:45.477	2026-10-01 07:33:21.14
bf5e233e-cd25-4ec7-8ae2-21c74da62554	CLINIC_CREATE	Create Clinics	\N	t	8d4e9c2f-93e5-44e6-b4c6-116cdacf7e44	2026-08-14 19:42:45.478	2026-10-01 07:33:21.141
623e6d2d-fb84-4d85-99b5-7bfe8a4dd635	CLINIC_UPDATE	Update Clinics	\N	t	8d4e9c2f-93e5-44e6-b4c6-116cdacf7e44	2026-08-14 19:42:45.479	2026-10-01 07:33:21.141
38a2c8c3-df8e-4435-a078-40649c76fea2	CLINIC_DELETE	Delete Clinics	\N	t	8d4e9c2f-93e5-44e6-b4c6-116cdacf7e44	2026-08-14 19:42:45.479	2026-10-01 07:33:21.142
baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	LANGUAGE_UPDATE	Update Languages	\N	t	15ae0e5c-3893-4979-96e6-b4f9aeaef550	2026-08-11 20:32:39.373	2026-10-01 07:33:21.176
d226b756-bd24-4733-adca-486e20e0cebd	LANGUAGE_DELETE	Delete Languages	\N	t	15ae0e5c-3893-4979-96e6-b4f9aeaef550	2026-08-11 20:32:39.374	2026-10-01 07:33:21.176
76ccea81-8aa7-4e3c-8650-b7a17275c050	REGISTRATION_COUNCIL_READ	View Registration Councils	\N	t	238b183e-c856-4cdf-8723-3f2290484d7d	2026-08-11 20:32:39.375	2026-10-01 07:33:21.177
d6f82e75-98ca-44a2-abbd-9a84a5543aa6	REGISTRATION_COUNCIL_CREATE	Create Registration Councils	\N	t	238b183e-c856-4cdf-8723-3f2290484d7d	2026-08-11 20:32:39.375	2026-10-01 07:33:21.178
3b02c811-f7a7-46f9-97d3-848e6b1f7d10	DIAGNOSIS_READ	View Diagnoses	\N	t	e6facfca-8b5b-48d6-afb2-92a31d34b153	2026-08-19 18:42:09.526	2026-10-01 07:33:21.152
01c72f75-2559-41ab-95e1-14d16912d5cd	DIAGNOSIS_CREATE	Create Diagnoses	\N	t	e6facfca-8b5b-48d6-afb2-92a31d34b153	2026-08-19 18:42:09.527	2026-10-01 07:33:21.153
c1063d2b-e4cf-4a77-8378-da93b76cb0d0	DIAGNOSIS_UPDATE	Update Diagnoses	\N	t	e6facfca-8b5b-48d6-afb2-92a31d34b153	2026-08-19 18:42:09.527	2026-10-01 07:33:21.153
26c7e5d1-1620-4d4c-b42a-36bb60b51490	DIAGNOSIS_DELETE	Delete Diagnoses	\N	t	e6facfca-8b5b-48d6-afb2-92a31d34b153	2026-08-19 18:42:09.528	2026-10-01 07:33:21.154
\.


--
-- Data for Name: PermissionGroup; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."PermissionGroup" (id, code, name, description, "displayOrder", "isSystem", "createdAt", "updatedAt") FROM stdin;
d75b2c23-43d6-4d5e-b0bb-dd07b0f1af29	ADMINISTRATION	Administration	\N	1	t	2026-08-03 11:30:47.444	2026-10-01 07:33:21.117
6927238d-fd79-4805-8758-a38bbd8755b5	DEPARTMENT	Department Management	\N	2	t	2026-08-11 20:32:39.328	2026-10-01 07:33:21.119
f317bf74-86f0-498a-b1c1-ed4ee581845a	SPECIALTY	Specialty Management	\N	3	t	2026-08-11 20:32:39.329	2026-10-01 07:33:21.12
b713f05c-0122-434a-9290-fa86fd9418d0	QUALIFICATION	Qualification Management	\N	4	t	2026-08-11 20:32:39.33	2026-10-01 07:33:21.121
15ae0e5c-3893-4979-96e6-b4f9aeaef550	LANGUAGE	Language Management	\N	5	t	2026-08-11 20:32:39.331	2026-10-01 07:33:21.122
238b183e-c856-4cdf-8723-3f2290484d7d	REGISTRATION_COUNCIL	Registration Council Management	\N	6	t	2026-08-11 20:32:39.332	2026-10-01 07:33:21.123
73a8c3c5-de04-48f0-ac59-460473f65dbc	PATIENT	Patient Management	\N	7	t	2026-08-03 11:30:47.446	2026-10-01 07:33:21.124
ccd44ec9-d933-4626-b18b-4a997f98c05a	DOCTOR	Doctor Management	\N	8	t	2026-08-03 11:30:47.447	2026-10-01 07:33:21.125
0ae6fa74-d297-450e-bde1-60443fac9c1d	APPOINTMENT	Appointment Management	\N	9	t	2026-08-03 11:30:47.447	2026-10-01 07:33:21.126
1405eeed-0e76-41a9-b9a1-2fd2badf212b	MEDICAL_RECORD	Medical Records	\N	10	t	2026-08-03 11:30:47.448	2026-10-01 07:33:21.127
96214673-87e3-4901-b255-6036d7de7416	PRESCRIPTION	Prescriptions	\N	11	t	2026-08-20 19:58:01.389	2026-10-01 07:33:21.127
e6facfca-8b5b-48d6-afb2-92a31d34b153	DIAGNOSIS	Diagnosis	\N	12	t	2026-08-19 18:42:09.496	2026-10-01 07:33:21.128
c3728e81-57cc-408b-9769-0c47aa34ec9d	LABORATORY	Laboratory	\N	13	t	2026-08-03 11:30:47.448	2026-10-01 07:33:21.129
4ff8dfeb-80e8-497d-93b2-ec8bb8d981ca	PHARMACY	Pharmacy	\N	14	t	2026-08-03 11:30:47.449	2026-10-01 07:33:21.129
e0b6f3a1-064a-40a8-9e0f-418051fae29c	BILLING	Billing	\N	15	t	2026-08-03 11:30:47.45	2026-10-01 07:33:21.13
cef59b37-3865-40f5-84ba-6885df58cdda	INVENTORY	Inventory	\N	16	t	2026-08-03 11:30:47.45	2026-10-01 07:33:21.131
b94ae94d-cd85-41bc-bdbf-7542537e904d	REPORTS	Reports	\N	17	t	2026-08-03 11:30:47.451	2026-10-01 07:33:21.131
b5b63176-e2f2-46e9-9db7-c02d4e7dedf3	SETTINGS	System Settings	\N	18	t	2026-08-03 11:30:47.451	2026-10-01 07:33:21.132
8d4e9c2f-93e5-44e6-b4c6-116cdacf7e44	CLINIC	Clinics	\N	0	t	2026-08-14 19:42:45.471	2026-10-01 07:33:21.133
\.


--
-- Data for Name: PharmacyDispensing; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."PharmacyDispensing" (id, "clinicId", "prescriptionId", "invoiceId", status, "createdAt", "updatedAt") FROM stdin;
119c43a4-e29e-4dbe-9fad-2e115dc6684d	599b0d53-c901-47b1-95f4-d3e84420d02c	a0ef0506-eab9-4a16-8bf0-d3d50af56218	\N	COMPLETED	2026-09-13 18:52:33.057	2026-09-13 18:52:33.057
dff732b6-aad7-4de0-a901-c25882f10c12	599b0d53-c901-47b1-95f4-d3e84420d02c	9a699e0d-c737-4494-9ebf-1f1b501358b8	\N	COMPLETED	2026-09-13 19:00:35.235	2026-09-13 20:39:50.534
966a1ac5-4cd3-4322-880a-1c7827d43932	599b0d53-c901-47b1-95f4-d3e84420d02c	d08f0889-b6c9-4a1c-8056-d8cd6fcd2af3	\N	COMPLETED	2026-09-13 20:44:21.777	2026-09-13 20:44:21.791
41c62036-8183-46be-a00c-588250fd4f46	599b0d53-c901-47b1-95f4-d3e84420d02c	d915e716-30c0-46f9-8143-f58850fe7d7f	\N	COMPLETED	2026-09-13 20:46:40.269	2026-09-13 20:48:30.755
8d1dc5cd-6d25-4a58-a7bb-cd0860c054a2	599b0d53-c901-47b1-95f4-d3e84420d02c	e8c112bd-07a1-4e4e-94bb-a28073c152a1	92df6b6c-1a05-4536-aa4a-aa1a6df035df	COMPLETED	2026-10-06 19:32:51.573	2026-10-06 19:32:51.582
8b335ffd-73be-45d1-afb2-ca4989edf98b	599b0d53-c901-47b1-95f4-d3e84420d02c	041c452d-7d9a-497e-8fe9-360a6fdf0358	a82dcebb-5a71-40fe-bd34-4ea52be91a38	COMPLETED	2026-10-06 19:38:37.683	2026-10-06 19:57:42.86
6a95d614-b4f8-4e83-971d-200a2725242a	599b0d53-c901-47b1-95f4-d3e84420d02c	e4b10566-4872-4aa8-b999-a3f48ee7757c	94fc1793-7c9d-4d4f-ac9a-ae18ad28e7c7	CANCELLED	2026-10-06 20:21:14.968	2026-10-06 20:21:53.823
ec460e53-c6b5-4028-be8c-f42b9ae1f0a0	599b0d53-c901-47b1-95f4-d3e84420d02c	258b1ed6-6ae6-4613-9ce4-c00be6e10f3d	22fa4396-c90d-4b2c-9a22-fea736d13a77	CANCELLED	2026-10-06 20:25:06.213	2026-10-06 20:25:22.596
9dc90262-7533-4c12-ad89-1ecd9e989076	599b0d53-c901-47b1-95f4-d3e84420d02c	1bc4174e-4bea-4b6a-bcb7-80e5d9803fb9	04c1cb69-cd5f-40e6-ba56-fe4ad279b91f	COMPLETED	2026-10-07 05:29:26.035	2026-10-07 05:29:26.049
\.


--
-- Data for Name: PharmacyDispensingItem; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."PharmacyDispensingItem" (id, "dispensingId", "medicineId", "medicineBatchId", quantity, "unitPrice", amount, "createdAt") FROM stdin;
396fba69-84b5-4ee0-a20e-fa971091c36a	119c43a4-e29e-4dbe-9fad-2e115dc6684d	9b5df426-3446-486a-b40b-a3a0f99be383	bcf90e92-8032-4258-91da-adf51c034e14	4	5.00	20.00	2026-09-13 18:52:33.074
93ac408e-add6-43b8-9866-135957f60549	dff732b6-aad7-4de0-a901-c25882f10c12	3c62245f-4b20-412c-8095-c617566c9d6e	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	3	10.00	30.00	2026-09-13 19:00:35.248
173d2763-00e8-43cd-9efc-cb815bfd2578	dff732b6-aad7-4de0-a901-c25882f10c12	3c62245f-4b20-412c-8095-c617566c9d6e	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	1	10.00	10.00	2026-09-13 20:39:50.531
e3675d50-818f-4ba2-b7ba-1829a2abe104	966a1ac5-4cd3-4322-880a-1c7827d43932	f6897a9e-9e3f-4d88-9676-6e1651738b2d	a6a65546-544b-4e1e-8edb-0a30cb6d9a72	12	2.00	24.00	2026-09-13 20:44:21.788
1288b290-32bc-47eb-a9ce-dc052542f6cc	41c62036-8183-46be-a00c-588250fd4f46	9b5df426-3446-486a-b40b-a3a0f99be383	bcf90e92-8032-4258-91da-adf51c034e14	1	5.00	5.00	2026-09-13 20:46:40.276
6f6a7b77-6920-487c-ab02-d482e4100d50	41c62036-8183-46be-a00c-588250fd4f46	9b5df426-3446-486a-b40b-a3a0f99be383	bcf90e92-8032-4258-91da-adf51c034e14	7	5.00	35.00	2026-09-13 20:48:30.75
4dc64d87-3b16-4960-92c9-9e5041036164	8d1dc5cd-6d25-4a58-a7bb-cd0860c054a2	f6897a9e-9e3f-4d88-9676-6e1651738b2d	a6a65546-544b-4e1e-8edb-0a30cb6d9a72	1	2.00	2.00	2026-10-06 19:32:51.579
b536c960-70ae-4d12-a05f-21aa7c78defc	8b335ffd-73be-45d1-afb2-ca4989edf98b	3c62245f-4b20-412c-8095-c617566c9d6e	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	3	10.00	30.00	2026-10-06 19:38:37.695
fe254e74-a2b5-4952-9517-ea97c2fc97c6	8b335ffd-73be-45d1-afb2-ca4989edf98b	3c62245f-4b20-412c-8095-c617566c9d6e	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	3	10.00	30.00	2026-10-06 19:57:42.857
e3d30e62-4284-4a51-b304-dba40be029a7	6a95d614-b4f8-4e83-971d-200a2725242a	f6897a9e-9e3f-4d88-9676-6e1651738b2d	a6a65546-544b-4e1e-8edb-0a30cb6d9a72	1	2.00	2.00	2026-10-06 20:21:14.979
11b7b6f7-0193-41e9-a726-00225111d60d	ec460e53-c6b5-4028-be8c-f42b9ae1f0a0	3c62245f-4b20-412c-8095-c617566c9d6e	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	6	10.00	60.00	2026-10-06 20:25:06.224
00ef7f31-af45-4140-a69a-5c71363d56f6	9dc90262-7533-4c12-ad89-1ecd9e989076	3c62245f-4b20-412c-8095-c617566c9d6e	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	5	10.00	50.00	2026-10-07 05:29:26.046
\.


--
-- Data for Name: Prescription; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Prescription" (id, "medicalRecordId", "medicationName", dosage, frequency, route, duration, quantity, instructions, "createdAt", "medicineId", "prescriptionNumber") FROM stdin;
9a699e0d-c737-4494-9ebf-1f1b501358b8	de92efa8-c7aa-41b8-b466-e61db708ae01	Tylenol	1	Twice daily	Oral	2	4	Take after food	2026-09-07 19:29:19.925	3c62245f-4b20-412c-8095-c617566c9d6e	RX-2026-000001
a0ef0506-eab9-4a16-8bf0-d3d50af56218	347e2d45-36cf-4dd8-b2e2-86a89b624c93	Dolo 500mg	1	Twice daily	Oral	2	4	Take after food	2026-09-08 05:58:44.468	9b5df426-3446-486a-b40b-a3a0f99be383	RX-2026-000002
d08f0889-b6c9-4a1c-8056-d8cd6fcd2af3	ce1b7f9c-046e-49d6-a800-ed377fd1ca56	Cetrizine	1	Three times daily	Oral	4	12	after food	2026-09-13 20:09:44.51	f6897a9e-9e3f-4d88-9676-6e1651738b2d	RX-2026-000003
d915e716-30c0-46f9-8143-f58850fe7d7f	bf3ad5a2-ff03-4398-9e93-7aa65e80cc70	Dolo 500mg	1	Twice daily	Oral	4	8	take after food	2026-09-13 20:45:30.331	9b5df426-3446-486a-b40b-a3a0f99be383	RX-2026-000004
d241503e-6f2b-460a-8db2-a7711f4523b8	ac726de3-36e3-4cb9-ba58-3281a304c0ce	Dolo 500mg	1	Twice daily	Oral	5	\N	Take after food	2026-10-01 07:51:05.963	9b5df426-3446-486a-b40b-a3a0f99be383	RX-2026-000005
e4b10566-4872-4aa8-b999-a3f48ee7757c	5a874540-89c4-45df-8d47-c7d4347859ae	Cetrizine	1	Once daily	Oral	1	1	\N	2026-10-05 09:14:51.78	f6897a9e-9e3f-4d88-9676-6e1651738b2d	RX-2026-000006
e8c112bd-07a1-4e4e-94bb-a28073c152a1	083d2b2e-cd08-4dab-98e3-0aab767e694c	Cetrizine	1	Once daily	Oral	1	1	\N	2026-10-06 18:43:01.679	f6897a9e-9e3f-4d88-9676-6e1651738b2d	RX-2026-000007
258b1ed6-6ae6-4613-9ce4-c00be6e10f3d	e7e39f18-cc75-4cde-8713-e91d6551ac57	Tylenol	1	Once daily	Oral	6	6	\N	2026-10-06 19:35:13.748	3c62245f-4b20-412c-8095-c617566c9d6e	RX-2026-000008
041c452d-7d9a-497e-8fe9-360a6fdf0358	1bb4bacf-08e6-48fb-84b6-f13e9198fc2c	Tylenol	1 tablet	Once daily	Oral	6	6	After fod	2026-10-06 19:38:12.479	3c62245f-4b20-412c-8095-c617566c9d6e	RX-2026-000009
1bc4174e-4bea-4b6a-bcb7-80e5d9803fb9	a756c765-24a9-4023-969f-4d10814f905b	Tylenol	1 tablet	Twice daily	Oral	5	5	\N	2026-10-07 05:28:13.53	3c62245f-4b20-412c-8095-c617566c9d6e	RX-2026-000010
\.


--
-- Data for Name: Qualification; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Qualification" (id, code, name, "displayOrder", "isSystem", "isActive", "createdAt", "updatedAt") FROM stdin;
c207ca83-995d-4bed-b0d2-8ab3d4adfb5b	MBBS	Bachelor of Medicine and Bachelor of Surgery	1	t	t	2026-08-11 20:32:39.625	2026-10-01 07:33:21.465
ab721fcd-18eb-42c6-938b-ab88586553f8	MD_MEDICINE	Doctor of Medicine - Internal Medicine	2	t	t	2026-08-11 20:32:39.626	2026-10-01 07:33:21.465
fe27c6a7-ad84-4830-a950-7624a4a2ecf0	MD_PEDIATRICS	Doctor of Medicine - Pediatrics	3	t	t	2026-08-11 20:32:39.627	2026-10-01 07:33:21.466
57f56a93-dcdb-424f-977a-ecc8a010ae64	MD_DERMATOLOGY	Doctor of Medicine - Dermatology	4	t	t	2026-08-11 20:32:39.627	2026-10-01 07:33:21.466
8b6f63be-8bf4-4303-8551-1e3293ede524	MD_PSYCHIATRY	Doctor of Medicine - Psychiatry	5	t	t	2026-08-11 20:32:39.628	2026-10-01 07:33:21.467
b17d7752-59c5-43f1-89cf-c4dba6454650	MD_RADIOLOGY	Doctor of Medicine - Radiology	6	t	t	2026-08-11 20:32:39.628	2026-10-01 07:33:21.467
85156268-de00-4fec-a9f5-cf9579ca1fec	MD_PATHOLOGY	Doctor of Medicine - Pathology	7	t	t	2026-08-11 20:32:39.629	2026-10-01 07:33:21.467
abf58eff-8833-4d4f-b412-249cd6419f00	MD_ANAESTHESIOLOGY	Doctor of Medicine - Anaesthesiology	8	t	t	2026-08-11 20:32:39.629	2026-10-01 07:33:21.468
3952e024-a4f0-4a15-9a68-bfbfc2efbd22	MS_ORTHOPAEDICS	Master of Surgery - Orthopaedics	21	t	t	2026-08-11 20:32:39.631	2026-10-01 07:33:21.469
6a45d73f-85cc-4d63-91b8-5ae9e909a045	MS_ENT	Master of Surgery - ENT	22	t	t	2026-08-11 20:32:39.631	2026-10-01 07:33:21.469
0ce7be6c-84cd-40f3-b80c-b181287bfba5	MS_OPHTHALMOLOGY	Master of Surgery - Ophthalmology	23	t	t	2026-08-11 20:32:39.631	2026-10-01 07:33:21.47
5470f2cc-0238-4697-9620-5e809c18a0ee	MS_OBSTETRICS_GYNECOLOGY	Master of Surgery - Obstetrics and Gynecology	24	t	t	2026-08-11 20:32:39.632	2026-10-01 07:33:21.47
5e276ccd-da10-4507-845b-43bb6420ed17	DM_CARDIOLOGY	Doctorate of Medicine - Cardiology	30	t	t	2026-08-11 20:32:39.632	2026-10-01 07:33:21.471
7d64edc9-be56-452c-a71a-ea77dfdabf6c	DM_NEUROLOGY	Doctorate of Medicine - Neurology	31	t	t	2026-08-11 20:32:39.633	2026-10-01 07:33:21.471
eacdf9da-072d-44ca-8288-1cafd06d9195	DM_NEONATOLOGY	Doctorate of Medicine - Neonatology	32	t	t	2026-08-11 20:32:39.633	2026-10-01 07:33:21.471
be319dd0-dfa0-4704-abeb-a62b3fdd96f7	DM_GASTROENTEROLOGY	Doctorate of Medicine - Gastroenterology	33	t	t	2026-08-11 20:32:39.633	2026-10-01 07:33:21.472
afb0c74c-0dbe-4ed9-a429-65fd0e97a2e5	DM_NEPHROLOGY	Doctorate of Medicine - Nephrology	34	t	t	2026-08-11 20:32:39.634	2026-10-01 07:33:21.472
0179d57b-c33d-42ff-ac52-b48acbde6555	MCH_UROLOGY	Master of Chirurgiae - Urology	38	t	t	2026-08-11 20:32:39.635	2026-10-01 07:33:21.473
f1bab254-8e8e-42f6-af62-f6ef8935608d	BDS	Bachelor of Dental Surgery	50	t	t	2026-08-11 20:32:39.636	2026-10-01 07:33:21.474
b463f269-22a3-4818-9939-1b80466cf7a4	MDS	Master of Dental Surgery	51	t	t	2026-08-11 20:32:39.636	2026-10-01 07:33:21.474
5a60d0c0-610f-4524-bbd8-f15926a93e36	BAMS	Bachelor of Ayurvedic Medicine and Surgery	60	t	t	2026-08-11 20:32:39.637	2026-10-01 07:33:21.475
f2e1f45c-cf72-4d18-999a-981155967519	MD_AYURVEDA	Doctor of Medicine - Ayurveda	61	t	t	2026-08-11 20:32:39.637	2026-10-01 07:33:21.475
2c8529b3-583f-4686-9ba7-50a2238af62b	BHMS	Bachelor of Homeopathic Medicine and Surgery	70	t	t	2026-08-11 20:32:39.637	2026-10-01 07:33:21.476
759c62e3-0593-4406-81f4-36adef237fa1	MD_HOMEOPATHY	Doctor of Medicine - Homeopathy	71	t	t	2026-08-11 20:32:39.638	2026-10-01 07:33:21.476
92db33fc-49d1-49c4-ba33-d465a463dc1f	BSMS	Bachelor of Siddha Medicine and Surgery	80	t	t	2026-08-11 20:32:39.638	2026-10-01 07:33:21.477
f90b14c9-86a5-4c12-a129-5d0c9d0eb58b	MD_SIDDHA	Doctor of Medicine - Siddha	81	t	t	2026-08-11 20:32:39.639	2026-10-01 07:33:21.477
a81f0ee7-05a7-4b48-ab57-7974f87bcd72	BUMS	Bachelor of Unani Medicine and Surgery	90	t	t	2026-08-11 20:32:39.639	2026-10-01 07:33:21.477
6c7fbb18-2c2d-4827-b7e7-7104a2ac6c00	MPT	Master of Physiotherapy	111	t	t	2026-08-11 20:32:39.641	2026-10-01 07:33:21.479
e95211f5-5c0c-46b3-b782-46e552f780e2	BVSC	Bachelor of Veterinary Science	120	t	t	2026-08-11 20:32:39.641	2026-10-01 07:33:21.479
29a9b00b-82be-4660-87a1-8b91fe698cff	MVSC	Master of Veterinary Science	121	t	t	2026-08-11 20:32:39.642	2026-10-01 07:33:21.479
6b8924b2-7c67-4be5-bb34-5abfd5c42117	FIPM	Fellowship in Pain Medicine	130	t	t	2026-08-11 20:32:39.642	2026-10-01 07:33:21.48
7fc512b7-1d07-419f-8dae-7e589a3391b1	MD_EMERGENCY_MEDICINE	Doctor of Medicine - Emergency Medicine	9	t	t	2026-08-11 20:32:39.629	2026-10-01 07:33:21.468
d789306d-ffd2-4bba-9c14-a50b5124cd15	MD_FAMILY_MEDICINE	Doctor of Medicine - Family Medicine	10	t	t	2026-08-11 20:32:39.63	2026-10-01 07:33:21.468
1c459629-1551-4bef-9bf2-5339817d2c8c	MS_GENERAL_SURGERY	Master of Surgery - General Surgery	20	t	t	2026-08-11 20:32:39.63	2026-10-01 07:33:21.469
ce640549-f86e-42b6-9149-4ee72f1b4c8f	DM_ENDOCRINOLOGY	Doctorate of Medicine - Endocrinology	35	t	t	2026-08-11 20:32:39.634	2026-10-01 07:33:21.472
72ed8eb4-450c-4fdb-90ce-3a1aed8442c2	DM_ONCOLOGY	Doctorate of Medicine - Medical Oncology	36	t	t	2026-08-11 20:32:39.635	2026-10-01 07:33:21.473
1cf9309a-0e8b-4250-9290-56fb25679c5b	DM_RHEUMATOLOGY	Doctorate of Medicine - Rheumatology	37	t	t	2026-08-11 20:32:39.635	2026-10-01 07:33:21.473
f07c8e82-413c-4e1c-989f-efdb2af01ae9	MD_UNANI	Doctor of Medicine - Unani	91	t	t	2026-08-11 20:32:39.64	2026-10-01 07:33:21.478
47d158f3-d0e5-49b4-a91d-717432f7e395	BNYS	Bachelor of Naturopathy and Yogic Sciences	100	t	t	2026-08-11 20:32:39.64	2026-10-01 07:33:21.478
46b20d0c-0bcc-4c7b-b5c3-311b6313f065	BPT	Bachelor of Physiotherapy	110	t	t	2026-08-11 20:32:39.641	2026-10-01 07:33:21.478
\.


--
-- Data for Name: RefreshToken; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."RefreshToken" (id, token, "expiresAt", revoked, "ipAddress", "userAgent", "userId", "createdAt") FROM stdin;
\.


--
-- Data for Name: RegistrationCouncil; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."RegistrationCouncil" (id, code, name, country, "isSystem", "isActive") FROM stdin;
488855a9-5a5a-4fb1-bb3d-2431361d99a2	NMC	National Medical Commission	India	t	t
c60852b8-bf92-48a7-a7b9-424202c7d93f	DCI	Dental Council of India	India	t	t
fd580c1c-805c-43d7-86fd-8fa2bbb12c4a	NCISM	National Commission for Indian System of Medicine	India	t	t
9e27763f-f293-4faa-91b4-5a7a0b353c64	NCH	National Commission for Homoeopathy	India	t	t
4092df0a-fe5f-409f-ba2c-ca4789fe3350	VCI	Veterinary Council of India	India	t	t
f161bcd5-0308-4863-bf6d-aff63f3f04e6	RCI	Rehabilitation Council of India	India	t	t
\.


--
-- Data for Name: Role; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Role" (id, "clinicId", name, code, description, "displayOrder", "isSystem", "isActive", "createdAt", "updatedAt") FROM stdin;
c5e14f7f-47ab-4378-b988-264418ec8189	addf97cb-4609-4983-9072-523b427b7ed8	Clinic Administrator	CLINIC_ADMIN	Clinic administrator	2	t	t	2026-10-12 09:39:45.333	2026-10-12 10:16:25.322
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	addf97cb-4609-4983-9072-523b427b7ed8	Doctor	DOCTOR	Medical practitioner	3	t	t	2026-10-12 09:39:45.335	2026-10-12 10:16:25.322
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	addf97cb-4609-4983-9072-523b427b7ed8	Nurse	NURSE	Clinic nurse	4	t	t	2026-10-12 09:39:45.336	2026-10-12 10:16:25.323
7163fe87-f6dc-4d52-857d-f3e031761c0a	addf97cb-4609-4983-9072-523b427b7ed8	Receptionist	RECEPTIONIST	Reception staff	5	t	t	2026-10-12 09:39:45.338	2026-10-12 10:16:25.323
363f9769-3556-47eb-a82b-99f58c9bd294	e64604ef-6994-4f55-9a90-1045b2cebff9	Super Administrator	SUPER_ADMIN	Full platform administrator	1	t	t	2026-10-12 09:41:03.096	2026-10-12 10:16:25.334
857e8618-fc23-4787-ab4b-b568f1afb41d	e64604ef-6994-4f55-9a90-1045b2cebff9	Clinic Administrator	CLINIC_ADMIN	Clinic administrator	2	t	t	2026-10-12 09:41:03.096	2026-10-12 10:16:25.334
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	e64604ef-6994-4f55-9a90-1045b2cebff9	Doctor	DOCTOR	Medical practitioner	3	t	t	2026-10-12 09:41:03.096	2026-10-12 10:16:25.334
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	e64604ef-6994-4f55-9a90-1045b2cebff9	Nurse	NURSE	Clinic nurse	4	t	t	2026-10-12 09:41:03.096	2026-10-12 10:16:25.335
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	e64604ef-6994-4f55-9a90-1045b2cebff9	Receptionist	RECEPTIONIST	Reception staff	5	t	t	2026-10-12 09:41:03.096	2026-10-12 10:16:25.335
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	20ef8a32-80e8-4068-8601-0b69ffabe027	Super Administrator	SUPER_ADMIN	Full platform administrator	1	t	t	2026-10-13 08:08:05.711	2026-10-13 08:08:05.711
e23bc923-fe97-404b-adb1-6147b64bb420	20ef8a32-80e8-4068-8601-0b69ffabe027	Clinic Administrator	CLINIC_ADMIN	Clinic administrator	2	t	t	2026-10-13 08:08:05.713	2026-10-13 08:08:05.713
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	20ef8a32-80e8-4068-8601-0b69ffabe027	Doctor	DOCTOR	Medical practitioner	3	t	t	2026-10-13 08:08:05.713	2026-10-13 08:08:05.713
55de1768-50da-4249-9849-31d80c57f1f9	20ef8a32-80e8-4068-8601-0b69ffabe027	Nurse	NURSE	Clinic nurse	4	t	t	2026-10-13 08:08:05.714	2026-10-13 08:08:05.714
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	20ef8a32-80e8-4068-8601-0b69ffabe027	Receptionist	RECEPTIONIST	Reception staff	5	t	t	2026-10-13 08:08:05.715	2026-10-13 08:08:05.715
4cb02209-38bf-4260-be81-1d9539a6a50e	68dbd989-a659-454e-9492-e5490f18bea1	Super Administrator	SUPER_ADMIN	Full platform administrator	1	t	t	2026-10-13 08:10:00.372	2026-10-13 08:10:00.372
dffc868a-92f9-4fae-bade-3cd9ce91028d	68dbd989-a659-454e-9492-e5490f18bea1	Clinic Administrator	CLINIC_ADMIN	Clinic administrator	2	t	t	2026-10-13 08:10:00.372	2026-10-13 08:10:00.372
849301d4-7c77-417e-a9f7-c6c92d16ad82	68dbd989-a659-454e-9492-e5490f18bea1	Doctor	DOCTOR	Medical practitioner	3	t	t	2026-10-13 08:10:00.372	2026-10-13 08:10:00.372
06428f37-680b-451c-9498-5430a197e44a	68dbd989-a659-454e-9492-e5490f18bea1	Nurse	NURSE	Clinic nurse	4	t	t	2026-10-13 08:10:00.372	2026-10-13 08:10:00.372
af3152de-2623-40ce-86f5-ff1425466f9a	68dbd989-a659-454e-9492-e5490f18bea1	Receptionist	RECEPTIONIST	Reception staff	5	t	t	2026-10-13 08:10:00.372	2026-10-13 08:10:00.372
58024084-8809-4297-9f43-de88d6a629b3	599b0d53-c901-47b1-95f4-d3e84420d02c	Therapist	THERAPIST		0	f	t	2026-10-11 20:01:11.197	2026-10-13 10:50:19.19
95fa5ff9-6f19-4b05-96a9-80e12b667f42	599b0d53-c901-47b1-95f4-d3e84420d02c	Super Administrator	SUPER_ADMIN	Full platform administrator	1	t	t	2026-08-03 11:30:47.479	2026-10-12 10:16:25.296
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	599b0d53-c901-47b1-95f4-d3e84420d02c	Clinic Administrator	CLINIC_ADMIN	Clinic administrator	2	t	t	2026-08-03 11:30:47.48	2026-10-12 10:16:25.299
c293413f-5401-424e-9c7b-4a2066ce5405	599b0d53-c901-47b1-95f4-d3e84420d02c	Doctor	DOCTOR	Medical practitioner	3	t	t	2026-08-03 11:30:47.48	2026-10-12 10:16:25.3
652610e5-f1b5-4150-a09a-aab3307b9f0d	599b0d53-c901-47b1-95f4-d3e84420d02c	Nurse	NURSE	Clinic nurse	4	t	t	2026-08-03 11:30:47.481	2026-10-12 10:16:25.301
926ec506-321c-4d47-9a9d-20676a1b9fc5	599b0d53-c901-47b1-95f4-d3e84420d02c	Receptionist	RECEPTIONIST	Reception staff	5	t	t	2026-08-03 11:30:47.481	2026-10-12 10:16:25.302
33ef99ea-a6e9-4219-8b0f-92f056214505	addf97cb-4609-4983-9072-523b427b7ed8	Super Administrator	SUPER_ADMIN	Full platform administrator	1	t	t	2026-10-12 09:39:45.331	2026-10-12 10:16:25.321
\.


--
-- Data for Name: RolePermission; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."RolePermission" ("roleId", "permissionId", "assignedAt") FROM stdin;
95fa5ff9-6f19-4b05-96a9-80e12b667f42	e1881f57-3ee9-49f2-ba3d-63de0a24423b	2026-08-03 11:30:47.483
95fa5ff9-6f19-4b05-96a9-80e12b667f42	993a4016-30db-4535-a507-fdba51e22b04	2026-08-03 11:30:47.484
95fa5ff9-6f19-4b05-96a9-80e12b667f42	d68f1450-38c6-4d97-8229-83845f49d1f9	2026-08-03 11:30:47.485
95fa5ff9-6f19-4b05-96a9-80e12b667f42	c4b54570-7e4f-4ed4-a70f-b836c4d95c97	2026-08-03 11:30:47.486
95fa5ff9-6f19-4b05-96a9-80e12b667f42	602712c8-d2fe-40f7-85f0-760285b3c617	2026-08-03 11:30:47.487
95fa5ff9-6f19-4b05-96a9-80e12b667f42	9fa27428-934e-4572-bf59-7d8534bea584	2026-08-03 11:30:47.488
95fa5ff9-6f19-4b05-96a9-80e12b667f42	25f64f57-fcd2-4327-a966-c5aa9ae82edc	2026-08-03 11:30:47.489
95fa5ff9-6f19-4b05-96a9-80e12b667f42	18363a37-70d3-422d-8542-defe75e088fe	2026-08-03 11:30:47.49
95fa5ff9-6f19-4b05-96a9-80e12b667f42	eb83e3ba-c57a-43f1-8dda-55d0a418791f	2026-08-03 11:30:47.491
95fa5ff9-6f19-4b05-96a9-80e12b667f42	a4e72793-ee62-43da-8abb-5845867d2c84	2026-08-03 11:30:47.492
95fa5ff9-6f19-4b05-96a9-80e12b667f42	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-08-03 11:30:47.493
95fa5ff9-6f19-4b05-96a9-80e12b667f42	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-08-03 11:30:47.494
95fa5ff9-6f19-4b05-96a9-80e12b667f42	50a285ea-a12d-4d2c-a480-5c209314ba55	2026-08-03 11:30:47.495
95fa5ff9-6f19-4b05-96a9-80e12b667f42	f7a067e9-a97c-423b-be80-96e454b23edf	2026-08-03 11:30:47.496
95fa5ff9-6f19-4b05-96a9-80e12b667f42	17f13669-7062-445c-8c49-7aafd88ef81a	2026-08-03 11:30:47.497
95fa5ff9-6f19-4b05-96a9-80e12b667f42	c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	2026-08-03 11:30:47.498
95fa5ff9-6f19-4b05-96a9-80e12b667f42	7b1acadd-e604-4f51-a307-fc70407f63f4	2026-08-03 11:30:47.499
95fa5ff9-6f19-4b05-96a9-80e12b667f42	bce87669-2ebc-4214-983a-66e03bc431c4	2026-08-03 11:30:47.5
95fa5ff9-6f19-4b05-96a9-80e12b667f42	081cad89-876d-48d4-9f61-03a39951b49c	2026-08-03 11:30:47.501
95fa5ff9-6f19-4b05-96a9-80e12b667f42	4642731e-ab76-4665-a20a-747bc1995bb5	2026-08-03 11:30:47.502
95fa5ff9-6f19-4b05-96a9-80e12b667f42	7e798bb2-731b-46fd-8d27-694320d45f57	2026-08-03 11:30:47.502
95fa5ff9-6f19-4b05-96a9-80e12b667f42	1f7c8766-46de-4d50-b116-375cc09df426	2026-08-03 11:30:47.503
95fa5ff9-6f19-4b05-96a9-80e12b667f42	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-08-03 11:30:47.504
95fa5ff9-6f19-4b05-96a9-80e12b667f42	438e8734-029a-4d06-a567-c58f1c945053	2026-08-03 11:30:47.505
95fa5ff9-6f19-4b05-96a9-80e12b667f42	ae6f0b26-93bc-4be2-9df2-7a9d09ce83dc	2026-08-03 11:30:47.506
95fa5ff9-6f19-4b05-96a9-80e12b667f42	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-08-03 11:30:47.507
95fa5ff9-6f19-4b05-96a9-80e12b667f42	08476e55-bfdf-4216-a2a5-9fd27f3c8deb	2026-08-03 11:30:47.508
95fa5ff9-6f19-4b05-96a9-80e12b667f42	67464de8-359e-4f37-bd52-48a92d0bc616	2026-08-03 11:30:47.509
95fa5ff9-6f19-4b05-96a9-80e12b667f42	ab6ed9a2-d1b4-4b0e-be6f-5b024550a413	2026-08-03 11:30:47.51
95fa5ff9-6f19-4b05-96a9-80e12b667f42	da29b701-894a-4d65-bf5a-c4281898d923	2026-08-03 11:30:47.51
95fa5ff9-6f19-4b05-96a9-80e12b667f42	fec4403c-1ed4-46f4-9676-6a237461bb1e	2026-08-03 11:30:47.511
95fa5ff9-6f19-4b05-96a9-80e12b667f42	3fe19280-7b43-424c-8b84-7af25e2b5aba	2026-08-03 11:30:47.512
95fa5ff9-6f19-4b05-96a9-80e12b667f42	fcf591ca-f5a3-40a9-bb20-1ccfa81e1efa	2026-08-03 11:30:47.513
95fa5ff9-6f19-4b05-96a9-80e12b667f42	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-08-03 11:30:47.514
95fa5ff9-6f19-4b05-96a9-80e12b667f42	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-08-03 11:30:47.515
95fa5ff9-6f19-4b05-96a9-80e12b667f42	cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	2026-08-03 11:30:47.516
95fa5ff9-6f19-4b05-96a9-80e12b667f42	dcf0bf5a-f52a-4bd6-9978-cada53cd3b00	2026-08-03 11:30:47.517
95fa5ff9-6f19-4b05-96a9-80e12b667f42	d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	2026-08-03 11:30:47.518
95fa5ff9-6f19-4b05-96a9-80e12b667f42	91ac8c55-faf2-41c1-9b25-709ef83008c8	2026-08-03 11:30:47.519
95fa5ff9-6f19-4b05-96a9-80e12b667f42	f0485505-9af4-4278-8785-2f44621cdbea	2026-08-03 11:30:47.52
95fa5ff9-6f19-4b05-96a9-80e12b667f42	27609b22-85ee-4f49-8623-524e2c9e7216	2026-08-03 11:30:47.521
95fa5ff9-6f19-4b05-96a9-80e12b667f42	3ce3e42e-3f92-4013-a44d-fe35f3a83a76	2026-08-03 11:30:47.522
95fa5ff9-6f19-4b05-96a9-80e12b667f42	68882f19-9744-4f0e-a77c-e43ed45f0dda	2026-08-03 11:30:47.523
95fa5ff9-6f19-4b05-96a9-80e12b667f42	97f8aeb0-1f28-4413-9057-5829142baf23	2026-08-03 11:30:47.524
95fa5ff9-6f19-4b05-96a9-80e12b667f42	2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	2026-08-03 11:30:47.525
95fa5ff9-6f19-4b05-96a9-80e12b667f42	02e0f2a9-937f-4eff-b922-60161249c463	2026-08-11 20:32:39.428
95fa5ff9-6f19-4b05-96a9-80e12b667f42	36774315-0855-460e-963b-096145c6f140	2026-08-11 20:32:39.43
95fa5ff9-6f19-4b05-96a9-80e12b667f42	b9e2d35c-3103-4048-8ed6-4f01c50ec94c	2026-08-11 20:32:39.431
95fa5ff9-6f19-4b05-96a9-80e12b667f42	fcf39650-8669-4fc9-af12-527676b8a04a	2026-08-11 20:32:39.432
95fa5ff9-6f19-4b05-96a9-80e12b667f42	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-08-11 20:32:39.433
95fa5ff9-6f19-4b05-96a9-80e12b667f42	68b62ead-3a09-4ee7-b78a-91ea2e38926e	2026-08-11 20:32:39.434
95fa5ff9-6f19-4b05-96a9-80e12b667f42	53d323ce-6511-4930-9043-330bf1085b22	2026-08-11 20:32:39.435
95fa5ff9-6f19-4b05-96a9-80e12b667f42	cce72d8f-8f06-4cb7-8225-3e290a86f7e9	2026-08-11 20:32:39.436
95fa5ff9-6f19-4b05-96a9-80e12b667f42	989609d1-dfa9-481f-ba96-2d4027703721	2026-08-11 20:32:39.437
95fa5ff9-6f19-4b05-96a9-80e12b667f42	09777e17-7293-40f9-9a7f-1953197a24d6	2026-08-11 20:32:39.438
95fa5ff9-6f19-4b05-96a9-80e12b667f42	af8e0ae4-f1ab-4410-8c75-10947a248ad9	2026-08-11 20:32:39.438
95fa5ff9-6f19-4b05-96a9-80e12b667f42	1bf8b755-81df-4e88-b9f5-7fcc41b45048	2026-08-11 20:32:39.439
95fa5ff9-6f19-4b05-96a9-80e12b667f42	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-08-11 20:32:39.44
95fa5ff9-6f19-4b05-96a9-80e12b667f42	b7f459de-a8a2-4697-9914-4c46c68c3b97	2026-08-11 20:32:39.441
95fa5ff9-6f19-4b05-96a9-80e12b667f42	baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	2026-08-11 20:32:39.442
95fa5ff9-6f19-4b05-96a9-80e12b667f42	d226b756-bd24-4733-adca-486e20e0cebd	2026-08-11 20:32:39.443
95fa5ff9-6f19-4b05-96a9-80e12b667f42	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-08-11 20:32:39.444
95fa5ff9-6f19-4b05-96a9-80e12b667f42	d6f82e75-98ca-44a2-abbd-9a84a5543aa6	2026-08-11 20:32:39.445
95fa5ff9-6f19-4b05-96a9-80e12b667f42	e8bcfd66-42c5-46ec-8d41-e11986589ed5	2026-08-11 20:32:39.445
95fa5ff9-6f19-4b05-96a9-80e12b667f42	1f466d06-e977-47e8-8114-f8d374dbd679	2026-08-11 20:32:39.446
95fa5ff9-6f19-4b05-96a9-80e12b667f42	366e4a28-eb96-44cd-ad55-3ba91f597f65	2026-08-14 19:42:45.569
95fa5ff9-6f19-4b05-96a9-80e12b667f42	bf5e233e-cd25-4ec7-8ae2-21c74da62554	2026-08-14 19:42:45.571
95fa5ff9-6f19-4b05-96a9-80e12b667f42	623e6d2d-fb84-4d85-99b5-7bfe8a4dd635	2026-08-14 19:42:45.572
95fa5ff9-6f19-4b05-96a9-80e12b667f42	38a2c8c3-df8e-4435-a078-40649c76fea2	2026-08-14 19:42:45.574
95fa5ff9-6f19-4b05-96a9-80e12b667f42	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-08-19 18:42:09.634
95fa5ff9-6f19-4b05-96a9-80e12b667f42	01c72f75-2559-41ab-95e1-14d16912d5cd	2026-08-19 18:42:09.636
95fa5ff9-6f19-4b05-96a9-80e12b667f42	c1063d2b-e4cf-4a77-8378-da93b76cb0d0	2026-08-19 18:42:09.637
95fa5ff9-6f19-4b05-96a9-80e12b667f42	26c7e5d1-1620-4d4c-b42a-36bb60b51490	2026-08-19 18:42:09.638
95fa5ff9-6f19-4b05-96a9-80e12b667f42	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-08-20 19:58:01.494
95fa5ff9-6f19-4b05-96a9-80e12b667f42	8502c2e6-be17-449a-98e0-497369f534c5	2026-08-20 19:58:01.497
95fa5ff9-6f19-4b05-96a9-80e12b667f42	a2943b86-1c02-42f9-a14c-d62f3eda6620	2026-08-20 19:58:01.498
95fa5ff9-6f19-4b05-96a9-80e12b667f42	98d307f4-86ac-4787-ab21-76d7e963740f	2026-08-20 19:58:01.499
c293413f-5401-424e-9c7b-4a2066ce5405	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 05:04:54.738
58024084-8809-4297-9f43-de88d6a629b3	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 05:08:35.173
c293413f-5401-424e-9c7b-4a2066ce5405	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	438e8734-029a-4d06-a567-c58f1c945053	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	01c72f75-2559-41ab-95e1-14d16912d5cd	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	c1063d2b-e4cf-4a77-8378-da93b76cb0d0	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	8502c2e6-be17-449a-98e0-497369f534c5	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	a2943b86-1c02-42f9-a14c-d62f3eda6620	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	08476e55-bfdf-4216-a2a5-9fd27f3c8deb	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	67464de8-359e-4f37-bd52-48a92d0bc616	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-12 10:16:25.311
c293413f-5401-424e-9c7b-4a2066ce5405	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-12 10:16:25.311
652610e5-f1b5-4150-a09a-aab3307b9f0d	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	438e8734-029a-4d06-a567-c58f1c945053	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-12 10:16:25.314
652610e5-f1b5-4150-a09a-aab3307b9f0d	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.314
926ec506-321c-4d47-9a9d-20676a1b9fc5	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.315
926ec506-321c-4d47-9a9d-20676a1b9fc5	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.315
926ec506-321c-4d47-9a9d-20676a1b9fc5	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.315
926ec506-321c-4d47-9a9d-20676a1b9fc5	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.315
926ec506-321c-4d47-9a9d-20676a1b9fc5	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.315
926ec506-321c-4d47-9a9d-20676a1b9fc5	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-12 10:16:25.315
926ec506-321c-4d47-9a9d-20676a1b9fc5	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.315
926ec506-321c-4d47-9a9d-20676a1b9fc5	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-12 10:16:25.315
926ec506-321c-4d47-9a9d-20676a1b9fc5	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-12 10:16:25.315
926ec506-321c-4d47-9a9d-20676a1b9fc5	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-12 10:16:25.315
926ec506-321c-4d47-9a9d-20676a1b9fc5	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.315
c5e14f7f-47ab-4378-b988-264418ec8189	e1881f57-3ee9-49f2-ba3d-63de0a24423b	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	993a4016-30db-4535-a507-fdba51e22b04	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	d68f1450-38c6-4d97-8229-83845f49d1f9	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	17f13669-7062-445c-8c49-7aafd88ef81a	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	da29b701-894a-4d65-bf5a-c4281898d923	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	3ce3e42e-3f92-4013-a44d-fe35f3a83a76	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	68882f19-9744-4f0e-a77c-e43ed45f0dda	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	97f8aeb0-1f28-4413-9057-5829142baf23	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	36774315-0855-460e-963b-096145c6f140	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	b9e2d35c-3103-4048-8ed6-4f01c50ec94c	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	fcf39650-8669-4fc9-af12-527676b8a04a	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	68b62ead-3a09-4ee7-b78a-91ea2e38926e	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	53d323ce-6511-4930-9043-330bf1085b22	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	cce72d8f-8f06-4cb7-8225-3e290a86f7e9	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	09777e17-7293-40f9-9a7f-1953197a24d6	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	af8e0ae4-f1ab-4410-8c75-10947a248ad9	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	1bf8b755-81df-4e88-b9f5-7fcc41b45048	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	b7f459de-a8a2-4697-9914-4c46c68c3b97	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	d226b756-bd24-4733-adca-486e20e0cebd	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	d6f82e75-98ca-44a2-abbd-9a84a5543aa6	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	e8bcfd66-42c5-46ec-8d41-e11986589ed5	2026-10-12 10:16:25.325
c5e14f7f-47ab-4378-b988-264418ec8189	1f466d06-e977-47e8-8114-f8d374dbd679	2026-10-12 10:16:25.325
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	438e8734-029a-4d06-a567-c58f1c945053	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	01c72f75-2559-41ab-95e1-14d16912d5cd	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	c1063d2b-e4cf-4a77-8378-da93b76cb0d0	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	8502c2e6-be17-449a-98e0-497369f534c5	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	a2943b86-1c02-42f9-a14c-d62f3eda6620	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	08476e55-bfdf-4216-a2a5-9fd27f3c8deb	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	67464de8-359e-4f37-bd52-48a92d0bc616	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-12 10:16:25.327
1c0962f3-e5f4-4b2e-b5fe-8a1602e07575	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-12 10:16:25.327
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	438e8734-029a-4d06-a567-c58f1c945053	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-12 10:16:25.329
4b34727a-7ad6-4a10-86e1-fe321ef5acbc	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.329
7163fe87-f6dc-4d52-857d-f3e031761c0a	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.33
7163fe87-f6dc-4d52-857d-f3e031761c0a	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.33
7163fe87-f6dc-4d52-857d-f3e031761c0a	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.33
7163fe87-f6dc-4d52-857d-f3e031761c0a	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.33
7163fe87-f6dc-4d52-857d-f3e031761c0a	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.33
7163fe87-f6dc-4d52-857d-f3e031761c0a	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-12 10:16:25.33
7163fe87-f6dc-4d52-857d-f3e031761c0a	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.33
7163fe87-f6dc-4d52-857d-f3e031761c0a	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-12 10:16:25.33
7163fe87-f6dc-4d52-857d-f3e031761c0a	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-12 10:16:25.33
7163fe87-f6dc-4d52-857d-f3e031761c0a	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-12 10:16:25.33
7163fe87-f6dc-4d52-857d-f3e031761c0a	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	50a285ea-a12d-4d2c-a480-5c209314ba55	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	17f13669-7062-445c-8c49-7aafd88ef81a	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	25f64f57-fcd2-4327-a966-c5aa9ae82edc	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	438e8734-029a-4d06-a567-c58f1c945053	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	ae6f0b26-93bc-4be2-9df2-7a9d09ce83dc	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	08476e55-bfdf-4216-a2a5-9fd27f3c8deb	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	67464de8-359e-4f37-bd52-48a92d0bc616	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	d68f1450-38c6-4d97-8229-83845f49d1f9	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	ab6ed9a2-d1b4-4b0e-be6f-5b024550a413	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	602712c8-d2fe-40f7-85f0-760285b3c617	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	da29b701-894a-4d65-bf5a-c4281898d923	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	fec4403c-1ed4-46f4-9676-6a237461bb1e	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	3fe19280-7b43-424c-8b84-7af25e2b5aba	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	fcf591ca-f5a3-40a9-bb20-1ccfa81e1efa	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	dcf0bf5a-f52a-4bd6-9978-cada53cd3b00	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	91ac8c55-faf2-41c1-9b25-709ef83008c8	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	f0485505-9af4-4278-8785-2f44621cdbea	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	27609b22-85ee-4f49-8623-524e2c9e7216	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	3ce3e42e-3f92-4013-a44d-fe35f3a83a76	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	68882f19-9744-4f0e-a77c-e43ed45f0dda	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	97f8aeb0-1f28-4413-9057-5829142baf23	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	36774315-0855-460e-963b-096145c6f140	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	b9e2d35c-3103-4048-8ed6-4f01c50ec94c	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	fcf39650-8669-4fc9-af12-527676b8a04a	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	e1881f57-3ee9-49f2-ba3d-63de0a24423b	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	eb83e3ba-c57a-43f1-8dda-55d0a418791f	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	7b1acadd-e604-4f51-a307-fc70407f63f4	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	993a4016-30db-4535-a507-fdba51e22b04	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	c4b54570-7e4f-4ed4-a70f-b836c4d95c97	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	9fa27428-934e-4572-bf59-7d8534bea584	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	18363a37-70d3-422d-8542-defe75e088fe	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	e8bcfd66-42c5-46ec-8d41-e11986589ed5	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	1f466d06-e977-47e8-8114-f8d374dbd679	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	8502c2e6-be17-449a-98e0-497369f534c5	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	a2943b86-1c02-42f9-a14c-d62f3eda6620	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	98d307f4-86ac-4787-ab21-76d7e963740f	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	68b62ead-3a09-4ee7-b78a-91ea2e38926e	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	53d323ce-6511-4930-9043-330bf1085b22	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	cce72d8f-8f06-4cb7-8225-3e290a86f7e9	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	09777e17-7293-40f9-9a7f-1953197a24d6	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	af8e0ae4-f1ab-4410-8c75-10947a248ad9	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	1bf8b755-81df-4e88-b9f5-7fcc41b45048	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	b7f459de-a8a2-4697-9914-4c46c68c3b97	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	366e4a28-eb96-44cd-ad55-3ba91f597f65	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	bf5e233e-cd25-4ec7-8ae2-21c74da62554	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	623e6d2d-fb84-4d85-99b5-7bfe8a4dd635	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	38a2c8c3-df8e-4435-a078-40649c76fea2	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	d226b756-bd24-4733-adca-486e20e0cebd	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	d6f82e75-98ca-44a2-abbd-9a84a5543aa6	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	01c72f75-2559-41ab-95e1-14d16912d5cd	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	c1063d2b-e4cf-4a77-8378-da93b76cb0d0	2026-10-12 10:16:25.33
33ef99ea-a6e9-4219-8b0f-92f056214505	26c7e5d1-1620-4d4c-b42a-36bb60b51490	2026-10-12 10:16:25.33
857e8618-fc23-4787-ab4b-b568f1afb41d	e1881f57-3ee9-49f2-ba3d-63de0a24423b	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	993a4016-30db-4535-a507-fdba51e22b04	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	d68f1450-38c6-4d97-8229-83845f49d1f9	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	17f13669-7062-445c-8c49-7aafd88ef81a	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	da29b701-894a-4d65-bf5a-c4281898d923	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	3ce3e42e-3f92-4013-a44d-fe35f3a83a76	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	68882f19-9744-4f0e-a77c-e43ed45f0dda	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	97f8aeb0-1f28-4413-9057-5829142baf23	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	36774315-0855-460e-963b-096145c6f140	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	b9e2d35c-3103-4048-8ed6-4f01c50ec94c	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	fcf39650-8669-4fc9-af12-527676b8a04a	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	68b62ead-3a09-4ee7-b78a-91ea2e38926e	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	53d323ce-6511-4930-9043-330bf1085b22	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	cce72d8f-8f06-4cb7-8225-3e290a86f7e9	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	09777e17-7293-40f9-9a7f-1953197a24d6	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	af8e0ae4-f1ab-4410-8c75-10947a248ad9	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	1bf8b755-81df-4e88-b9f5-7fcc41b45048	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	b7f459de-a8a2-4697-9914-4c46c68c3b97	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	d226b756-bd24-4733-adca-486e20e0cebd	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	d6f82e75-98ca-44a2-abbd-9a84a5543aa6	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	e8bcfd66-42c5-46ec-8d41-e11986589ed5	2026-10-12 10:16:25.337
857e8618-fc23-4787-ab4b-b568f1afb41d	1f466d06-e977-47e8-8114-f8d374dbd679	2026-10-12 10:16:25.337
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	438e8734-029a-4d06-a567-c58f1c945053	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	01c72f75-2559-41ab-95e1-14d16912d5cd	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	c1063d2b-e4cf-4a77-8378-da93b76cb0d0	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	8502c2e6-be17-449a-98e0-497369f534c5	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	a2943b86-1c02-42f9-a14c-d62f3eda6620	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	08476e55-bfdf-4216-a2a5-9fd27f3c8deb	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	67464de8-359e-4f37-bd52-48a92d0bc616	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-12 10:16:25.338
e32c4bb8-64fe-4b4f-ae7d-4c08bd0e1d3d	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-12 10:16:25.338
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	438e8734-029a-4d06-a567-c58f1c945053	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-12 10:16:25.339
6b2fe403-4cc3-4431-b98f-a49cc10a1ff1	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-12 10:16:25.339
72996e7d-9ad7-4c4e-9725-dda8be2da5aa	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.339
363f9769-3556-47eb-a82b-99f58c9bd294	50a285ea-a12d-4d2c-a480-5c209314ba55	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	17f13669-7062-445c-8c49-7aafd88ef81a	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	25f64f57-fcd2-4327-a966-c5aa9ae82edc	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	438e8734-029a-4d06-a567-c58f1c945053	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	ae6f0b26-93bc-4be2-9df2-7a9d09ce83dc	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	08476e55-bfdf-4216-a2a5-9fd27f3c8deb	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	67464de8-359e-4f37-bd52-48a92d0bc616	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	d68f1450-38c6-4d97-8229-83845f49d1f9	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	ab6ed9a2-d1b4-4b0e-be6f-5b024550a413	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	602712c8-d2fe-40f7-85f0-760285b3c617	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	da29b701-894a-4d65-bf5a-c4281898d923	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	fec4403c-1ed4-46f4-9676-6a237461bb1e	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	3fe19280-7b43-424c-8b84-7af25e2b5aba	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	fcf591ca-f5a3-40a9-bb20-1ccfa81e1efa	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	dcf0bf5a-f52a-4bd6-9978-cada53cd3b00	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	91ac8c55-faf2-41c1-9b25-709ef83008c8	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	f0485505-9af4-4278-8785-2f44621cdbea	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	27609b22-85ee-4f49-8623-524e2c9e7216	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	3ce3e42e-3f92-4013-a44d-fe35f3a83a76	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	68882f19-9744-4f0e-a77c-e43ed45f0dda	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	97f8aeb0-1f28-4413-9057-5829142baf23	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	36774315-0855-460e-963b-096145c6f140	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	b9e2d35c-3103-4048-8ed6-4f01c50ec94c	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	fcf39650-8669-4fc9-af12-527676b8a04a	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	e1881f57-3ee9-49f2-ba3d-63de0a24423b	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	eb83e3ba-c57a-43f1-8dda-55d0a418791f	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	7b1acadd-e604-4f51-a307-fc70407f63f4	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	993a4016-30db-4535-a507-fdba51e22b04	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	c4b54570-7e4f-4ed4-a70f-b836c4d95c97	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	9fa27428-934e-4572-bf59-7d8534bea584	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	18363a37-70d3-422d-8542-defe75e088fe	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	e8bcfd66-42c5-46ec-8d41-e11986589ed5	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	1f466d06-e977-47e8-8114-f8d374dbd679	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	8502c2e6-be17-449a-98e0-497369f534c5	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	a2943b86-1c02-42f9-a14c-d62f3eda6620	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	98d307f4-86ac-4787-ab21-76d7e963740f	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	68b62ead-3a09-4ee7-b78a-91ea2e38926e	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	53d323ce-6511-4930-9043-330bf1085b22	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	cce72d8f-8f06-4cb7-8225-3e290a86f7e9	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	09777e17-7293-40f9-9a7f-1953197a24d6	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	af8e0ae4-f1ab-4410-8c75-10947a248ad9	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	1bf8b755-81df-4e88-b9f5-7fcc41b45048	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	b7f459de-a8a2-4697-9914-4c46c68c3b97	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	366e4a28-eb96-44cd-ad55-3ba91f597f65	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	bf5e233e-cd25-4ec7-8ae2-21c74da62554	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	623e6d2d-fb84-4d85-99b5-7bfe8a4dd635	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	38a2c8c3-df8e-4435-a078-40649c76fea2	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	d226b756-bd24-4733-adca-486e20e0cebd	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	d6f82e75-98ca-44a2-abbd-9a84a5543aa6	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	01c72f75-2559-41ab-95e1-14d16912d5cd	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	c1063d2b-e4cf-4a77-8378-da93b76cb0d0	2026-10-12 10:16:25.34
363f9769-3556-47eb-a82b-99f58c9bd294	26c7e5d1-1620-4d4c-b42a-36bb60b51490	2026-10-12 10:16:25.34
e23bc923-fe97-404b-adb1-6147b64bb420	e1881f57-3ee9-49f2-ba3d-63de0a24423b	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	993a4016-30db-4535-a507-fdba51e22b04	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	d68f1450-38c6-4d97-8229-83845f49d1f9	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	17f13669-7062-445c-8c49-7aafd88ef81a	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	da29b701-894a-4d65-bf5a-c4281898d923	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	3ce3e42e-3f92-4013-a44d-fe35f3a83a76	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	68882f19-9744-4f0e-a77c-e43ed45f0dda	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	97f8aeb0-1f28-4413-9057-5829142baf23	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	36774315-0855-460e-963b-096145c6f140	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	b9e2d35c-3103-4048-8ed6-4f01c50ec94c	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	fcf39650-8669-4fc9-af12-527676b8a04a	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	68b62ead-3a09-4ee7-b78a-91ea2e38926e	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	53d323ce-6511-4930-9043-330bf1085b22	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	cce72d8f-8f06-4cb7-8225-3e290a86f7e9	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	09777e17-7293-40f9-9a7f-1953197a24d6	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	af8e0ae4-f1ab-4410-8c75-10947a248ad9	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	1bf8b755-81df-4e88-b9f5-7fcc41b45048	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	b7f459de-a8a2-4697-9914-4c46c68c3b97	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	d226b756-bd24-4733-adca-486e20e0cebd	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	d6f82e75-98ca-44a2-abbd-9a84a5543aa6	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	e8bcfd66-42c5-46ec-8d41-e11986589ed5	2026-10-13 08:08:05.716
e23bc923-fe97-404b-adb1-6147b64bb420	1f466d06-e977-47e8-8114-f8d374dbd679	2026-10-13 08:08:05.716
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	438e8734-029a-4d06-a567-c58f1c945053	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	01c72f75-2559-41ab-95e1-14d16912d5cd	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	c1063d2b-e4cf-4a77-8378-da93b76cb0d0	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	8502c2e6-be17-449a-98e0-497369f534c5	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	a2943b86-1c02-42f9-a14c-d62f3eda6620	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	08476e55-bfdf-4216-a2a5-9fd27f3c8deb	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	67464de8-359e-4f37-bd52-48a92d0bc616	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-13 08:08:05.718
f4e25d07-f87e-49d2-9dc8-831d4a5ebdf2	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-13 08:08:05.718
55de1768-50da-4249-9849-31d80c57f1f9	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	438e8734-029a-4d06-a567-c58f1c945053	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-13 08:08:05.719
55de1768-50da-4249-9849-31d80c57f1f9	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:08:05.719
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:08:05.72
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:08:05.72
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:08:05.72
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:08:05.72
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:08:05.72
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-13 08:08:05.72
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:08:05.72
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-13 08:08:05.72
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-13 08:08:05.72
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-13 08:08:05.72
bb3ba473-b6f3-42ec-b558-ec47bb8670a4	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	50a285ea-a12d-4d2c-a480-5c209314ba55	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	17f13669-7062-445c-8c49-7aafd88ef81a	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	25f64f57-fcd2-4327-a966-c5aa9ae82edc	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	438e8734-029a-4d06-a567-c58f1c945053	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	ae6f0b26-93bc-4be2-9df2-7a9d09ce83dc	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	08476e55-bfdf-4216-a2a5-9fd27f3c8deb	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	67464de8-359e-4f37-bd52-48a92d0bc616	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	d68f1450-38c6-4d97-8229-83845f49d1f9	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	ab6ed9a2-d1b4-4b0e-be6f-5b024550a413	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	602712c8-d2fe-40f7-85f0-760285b3c617	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	da29b701-894a-4d65-bf5a-c4281898d923	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	fec4403c-1ed4-46f4-9676-6a237461bb1e	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	3fe19280-7b43-424c-8b84-7af25e2b5aba	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	fcf591ca-f5a3-40a9-bb20-1ccfa81e1efa	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	dcf0bf5a-f52a-4bd6-9978-cada53cd3b00	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	91ac8c55-faf2-41c1-9b25-709ef83008c8	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	f0485505-9af4-4278-8785-2f44621cdbea	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	27609b22-85ee-4f49-8623-524e2c9e7216	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	3ce3e42e-3f92-4013-a44d-fe35f3a83a76	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	68882f19-9744-4f0e-a77c-e43ed45f0dda	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	97f8aeb0-1f28-4413-9057-5829142baf23	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	36774315-0855-460e-963b-096145c6f140	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	b9e2d35c-3103-4048-8ed6-4f01c50ec94c	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	fcf39650-8669-4fc9-af12-527676b8a04a	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	e1881f57-3ee9-49f2-ba3d-63de0a24423b	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	eb83e3ba-c57a-43f1-8dda-55d0a418791f	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	7b1acadd-e604-4f51-a307-fc70407f63f4	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	993a4016-30db-4535-a507-fdba51e22b04	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	c4b54570-7e4f-4ed4-a70f-b836c4d95c97	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	9fa27428-934e-4572-bf59-7d8534bea584	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	18363a37-70d3-422d-8542-defe75e088fe	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	e8bcfd66-42c5-46ec-8d41-e11986589ed5	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	1f466d06-e977-47e8-8114-f8d374dbd679	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	8502c2e6-be17-449a-98e0-497369f534c5	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	a2943b86-1c02-42f9-a14c-d62f3eda6620	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	98d307f4-86ac-4787-ab21-76d7e963740f	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	68b62ead-3a09-4ee7-b78a-91ea2e38926e	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	53d323ce-6511-4930-9043-330bf1085b22	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	cce72d8f-8f06-4cb7-8225-3e290a86f7e9	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	09777e17-7293-40f9-9a7f-1953197a24d6	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	af8e0ae4-f1ab-4410-8c75-10947a248ad9	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	1bf8b755-81df-4e88-b9f5-7fcc41b45048	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	b7f459de-a8a2-4697-9914-4c46c68c3b97	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	366e4a28-eb96-44cd-ad55-3ba91f597f65	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	bf5e233e-cd25-4ec7-8ae2-21c74da62554	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	623e6d2d-fb84-4d85-99b5-7bfe8a4dd635	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	38a2c8c3-df8e-4435-a078-40649c76fea2	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	d226b756-bd24-4733-adca-486e20e0cebd	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	d6f82e75-98ca-44a2-abbd-9a84a5543aa6	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	01c72f75-2559-41ab-95e1-14d16912d5cd	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	c1063d2b-e4cf-4a77-8378-da93b76cb0d0	2026-10-13 08:08:05.72
6a7e6127-eae0-4ce1-a95a-2c3c1173d95b	26c7e5d1-1620-4d4c-b42a-36bb60b51490	2026-10-13 08:08:05.72
dffc868a-92f9-4fae-bade-3cd9ce91028d	e1881f57-3ee9-49f2-ba3d-63de0a24423b	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	993a4016-30db-4535-a507-fdba51e22b04	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	d68f1450-38c6-4d97-8229-83845f49d1f9	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	17f13669-7062-445c-8c49-7aafd88ef81a	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	da29b701-894a-4d65-bf5a-c4281898d923	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	3ce3e42e-3f92-4013-a44d-fe35f3a83a76	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	68882f19-9744-4f0e-a77c-e43ed45f0dda	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	97f8aeb0-1f28-4413-9057-5829142baf23	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	36774315-0855-460e-963b-096145c6f140	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	b9e2d35c-3103-4048-8ed6-4f01c50ec94c	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	fcf39650-8669-4fc9-af12-527676b8a04a	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	68b62ead-3a09-4ee7-b78a-91ea2e38926e	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	53d323ce-6511-4930-9043-330bf1085b22	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	cce72d8f-8f06-4cb7-8225-3e290a86f7e9	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	09777e17-7293-40f9-9a7f-1953197a24d6	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	af8e0ae4-f1ab-4410-8c75-10947a248ad9	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	1bf8b755-81df-4e88-b9f5-7fcc41b45048	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	b7f459de-a8a2-4697-9914-4c46c68c3b97	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	d226b756-bd24-4733-adca-486e20e0cebd	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	d6f82e75-98ca-44a2-abbd-9a84a5543aa6	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	e8bcfd66-42c5-46ec-8d41-e11986589ed5	2026-10-13 08:10:00.379
dffc868a-92f9-4fae-bade-3cd9ce91028d	1f466d06-e977-47e8-8114-f8d374dbd679	2026-10-13 08:10:00.379
849301d4-7c77-417e-a9f7-c6c92d16ad82	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	438e8734-029a-4d06-a567-c58f1c945053	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	01c72f75-2559-41ab-95e1-14d16912d5cd	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	c1063d2b-e4cf-4a77-8378-da93b76cb0d0	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	8502c2e6-be17-449a-98e0-497369f534c5	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	a2943b86-1c02-42f9-a14c-d62f3eda6620	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	08476e55-bfdf-4216-a2a5-9fd27f3c8deb	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	67464de8-359e-4f37-bd52-48a92d0bc616	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-13 08:10:00.387
849301d4-7c77-417e-a9f7-c6c92d16ad82	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-13 08:10:00.387
06428f37-680b-451c-9498-5430a197e44a	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	438e8734-029a-4d06-a567-c58f1c945053	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-13 08:10:00.391
06428f37-680b-451c-9498-5430a197e44a	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:10:00.391
af3152de-2623-40ce-86f5-ff1425466f9a	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:10:00.393
af3152de-2623-40ce-86f5-ff1425466f9a	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:10:00.393
af3152de-2623-40ce-86f5-ff1425466f9a	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:10:00.393
af3152de-2623-40ce-86f5-ff1425466f9a	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:10:00.393
af3152de-2623-40ce-86f5-ff1425466f9a	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:10:00.393
af3152de-2623-40ce-86f5-ff1425466f9a	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-13 08:10:00.393
af3152de-2623-40ce-86f5-ff1425466f9a	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:10:00.393
af3152de-2623-40ce-86f5-ff1425466f9a	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-13 08:10:00.393
af3152de-2623-40ce-86f5-ff1425466f9a	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-13 08:10:00.393
af3152de-2623-40ce-86f5-ff1425466f9a	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-13 08:10:00.393
af3152de-2623-40ce-86f5-ff1425466f9a	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:10:00.393
4cb02209-38bf-4260-be81-1d9539a6a50e	50a285ea-a12d-4d2c-a480-5c209314ba55	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	17f13669-7062-445c-8c49-7aafd88ef81a	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	25f64f57-fcd2-4327-a966-c5aa9ae82edc	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	ffca2a5d-5642-48ac-9ae9-af9de6c8669d	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	438e8734-029a-4d06-a567-c58f1c945053	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	ae6f0b26-93bc-4be2-9df2-7a9d09ce83dc	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	08476e55-bfdf-4216-a2a5-9fd27f3c8deb	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	67464de8-359e-4f37-bd52-48a92d0bc616	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	d68f1450-38c6-4d97-8229-83845f49d1f9	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	ab6ed9a2-d1b4-4b0e-be6f-5b024550a413	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	602712c8-d2fe-40f7-85f0-760285b3c617	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	da29b701-894a-4d65-bf5a-c4281898d923	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	fec4403c-1ed4-46f4-9676-6a237461bb1e	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	3fe19280-7b43-424c-8b84-7af25e2b5aba	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	fcf591ca-f5a3-40a9-bb20-1ccfa81e1efa	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	dcf0bf5a-f52a-4bd6-9978-cada53cd3b00	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	91ac8c55-faf2-41c1-9b25-709ef83008c8	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	f0485505-9af4-4278-8785-2f44621cdbea	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	27609b22-85ee-4f49-8623-524e2c9e7216	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	3ce3e42e-3f92-4013-a44d-fe35f3a83a76	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	68882f19-9744-4f0e-a77c-e43ed45f0dda	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	97f8aeb0-1f28-4413-9057-5829142baf23	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	36774315-0855-460e-963b-096145c6f140	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	b9e2d35c-3103-4048-8ed6-4f01c50ec94c	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	fcf39650-8669-4fc9-af12-527676b8a04a	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	e1881f57-3ee9-49f2-ba3d-63de0a24423b	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	eb83e3ba-c57a-43f1-8dda-55d0a418791f	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	7b1acadd-e604-4f51-a307-fc70407f63f4	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	993a4016-30db-4535-a507-fdba51e22b04	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	c4b54570-7e4f-4ed4-a70f-b836c4d95c97	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	9fa27428-934e-4572-bf59-7d8534bea584	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	18363a37-70d3-422d-8542-defe75e088fe	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	e8bcfd66-42c5-46ec-8d41-e11986589ed5	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	1f466d06-e977-47e8-8114-f8d374dbd679	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	8502c2e6-be17-449a-98e0-497369f534c5	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	a2943b86-1c02-42f9-a14c-d62f3eda6620	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	98d307f4-86ac-4787-ab21-76d7e963740f	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	68b62ead-3a09-4ee7-b78a-91ea2e38926e	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	53d323ce-6511-4930-9043-330bf1085b22	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	cce72d8f-8f06-4cb7-8225-3e290a86f7e9	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	09777e17-7293-40f9-9a7f-1953197a24d6	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	af8e0ae4-f1ab-4410-8c75-10947a248ad9	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	1bf8b755-81df-4e88-b9f5-7fcc41b45048	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	b7f459de-a8a2-4697-9914-4c46c68c3b97	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	366e4a28-eb96-44cd-ad55-3ba91f597f65	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	bf5e233e-cd25-4ec7-8ae2-21c74da62554	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	623e6d2d-fb84-4d85-99b5-7bfe8a4dd635	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	38a2c8c3-df8e-4435-a078-40649c76fea2	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	d226b756-bd24-4733-adca-486e20e0cebd	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	d6f82e75-98ca-44a2-abbd-9a84a5543aa6	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	01c72f75-2559-41ab-95e1-14d16912d5cd	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	c1063d2b-e4cf-4a77-8378-da93b76cb0d0	2026-10-13 08:10:00.396
4cb02209-38bf-4260-be81-1d9539a6a50e	26c7e5d1-1620-4d4c-b42a-36bb60b51490	2026-10-13 08:10:00.396
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	993a4016-30db-4535-a507-fdba51e22b04	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	e1881f57-3ee9-49f2-ba3d-63de0a24423b	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	d68f1450-38c6-4d97-8229-83845f49d1f9	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	36774315-0855-460e-963b-096145c6f140	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	fcf39650-8669-4fc9-af12-527676b8a04a	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	02e0f2a9-937f-4eff-b922-60161249c463	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	b9e2d35c-3103-4048-8ed6-4f01c50ec94c	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	68b62ead-3a09-4ee7-b78a-91ea2e38926e	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	cce72d8f-8f06-4cb7-8225-3e290a86f7e9	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	79bc0a91-27bf-46f5-96c3-79287c6e82f8	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	53d323ce-6511-4930-9043-330bf1085b22	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	09777e17-7293-40f9-9a7f-1953197a24d6	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	1bf8b755-81df-4e88-b9f5-7fcc41b45048	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	989609d1-dfa9-481f-ba96-2d4027703721	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	af8e0ae4-f1ab-4410-8c75-10947a248ad9	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	b7f459de-a8a2-4697-9914-4c46c68c3b97	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	d226b756-bd24-4733-adca-486e20e0cebd	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	2c275b11-01ee-4470-b57b-45ca7c9adb78	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	baa20b9b-9f21-4a8a-aa6a-13facd47d2e5	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	d6f82e75-98ca-44a2-abbd-9a84a5543aa6	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	1f466d06-e977-47e8-8114-f8d374dbd679	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	76ccea81-8aa7-4e3c-8650-b7a17275c050	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	e8bcfd66-42c5-46ec-8d41-e11986589ed5	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	86a5bd2d-98cc-404e-9c8c-b106824085b5	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	a4e72793-ee62-43da-8abb-5845867d2c84	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	00733de3-2a71-4392-b6ca-1d429c3dfe71	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	17f13669-7062-445c-8c49-7aafd88ef81a	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	f7a067e9-a97c-423b-be80-96e454b23edf	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	c0739b12-d8a1-4b53-a8a4-f1ec861e26d4	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	7e798bb2-731b-46fd-8d27-694320d45f57	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	081cad89-876d-48d4-9f61-03a39951b49c	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	bce87669-2ebc-4214-983a-66e03bc431c4	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	4642731e-ab76-4665-a20a-747bc1995bb5	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	1f7c8766-46de-4d50-b116-375cc09df426	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	8ebf2df5-cec8-4ec4-83f7-281aab573265	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	3b02c811-f7a7-46f9-97d3-848e6b1f7d10	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	8a1f8922-5c88-4db7-abc3-7733639f5bc0	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	da29b701-894a-4d65-bf5a-c4281898d923	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	dfab1a33-0bba-42c2-ba15-92d16495b54c	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	d8b42c8a-a598-46b6-b8f6-f245262a15d7	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	cbe28d15-d4ce-4e22-8303-220f0ea8a1a4	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	d387a5f4-bc54-44d0-b8d8-b0d020fc8a72	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	68882f19-9744-4f0e-a77c-e43ed45f0dda	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	3ce3e42e-3f92-4013-a44d-fe35f3a83a76	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	97f8aeb0-1f28-4413-9057-5829142baf23	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	2fb1f9cd-2a6f-41f1-9fe9-b85fc9efdc32	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	c4b54570-7e4f-4ed4-a70f-b836c4d95c97	2026-10-13 08:42:45.483
2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb	602712c8-d2fe-40f7-85f0-760285b3c617	2026-10-13 08:42:45.483
\.


--
-- Data for Name: Specialty; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."Specialty" (id, "departmentId", code, name, description, "displayOrder", "isSystem", "isActive", "createdAt", "updatedAt") FROM stdin;
01487c30-9623-412c-87c7-57028adbd96f	b9739b6f-0a62-4651-9d06-4234041126c3	INTERNAL_MEDICINE	Internal Medicine	\N	1	t	t	2026-10-13 08:02:49.614	2026-10-13 08:08:05.747
9913d9df-d4e7-40d2-9821-21d4dbbf39a3	5a030306-27c1-4748-95e2-fd96adcbafb2	INTERNAL_MEDICINE	Internal Medicine	\N	1	t	t	2026-10-13 08:10:00.549	2026-10-13 08:10:00.549
b375da85-393d-43f8-8ebf-b2c52885021c	5a030306-27c1-4748-95e2-fd96adcbafb2	FAMILY_MEDICINE	Family Medicine	\N	2	t	t	2026-10-13 08:10:00.554	2026-10-13 08:10:00.554
69fe0366-70d9-44ae-bb3d-3f7c40d9a82b	5a030306-27c1-4748-95e2-fd96adcbafb2	GERIATRIC_MEDICINE	Geriatric Medicine	\N	3	t	t	2026-10-13 08:10:00.556	2026-10-13 08:10:00.556
24fc466e-7316-483f-bf5e-6fe83b48584b	5a030306-27c1-4748-95e2-fd96adcbafb2	PREVENTIVE_MEDICINE	Preventive Medicine	\N	4	t	t	2026-10-13 08:10:00.559	2026-10-13 08:10:00.559
c72e9828-8874-4538-b9bc-a360ad5c5ed6	94b8f6ae-2dfa-4ac2-8806-68e7a4640bec	INTERVENTIONAL_CARDIOLOGY	Interventional Cardiology	\N	1	t	t	2026-10-13 08:10:00.562	2026-10-13 08:10:00.562
bb6e5ac5-d27d-4f3b-b2c5-8f149ac47d00	94b8f6ae-2dfa-4ac2-8806-68e7a4640bec	NON_INVASIVE_CARDIOLOGY	Non-invasive Cardiology	\N	2	t	t	2026-10-13 08:10:00.565	2026-10-13 08:10:00.565
fc0e8492-92b1-4a0f-af65-2bb12e153dbc	94b8f6ae-2dfa-4ac2-8806-68e7a4640bec	ELECTROPHYSIOLOGY	Electrophysiology	\N	3	t	t	2026-10-13 08:10:00.567	2026-10-13 08:10:00.567
72ead5e9-09b1-4c53-bab9-e38e236d901c	94b8f6ae-2dfa-4ac2-8806-68e7a4640bec	CARDIAC_IMAGING	Cardiac Imaging	\N	4	t	t	2026-10-13 08:10:00.569	2026-10-13 08:10:00.569
e9b50a45-59db-465f-a75d-fa30e1608da9	94b8f6ae-2dfa-4ac2-8806-68e7a4640bec	HEART_FAILURE	Heart Failure	\N	5	t	t	2026-10-13 08:10:00.572	2026-10-13 08:10:00.572
3a6e0f89-20da-48c6-b8de-4de2dd926b89	62093139-7025-4ae9-b9d4-13a715cf218f	CLINICAL_NEUROLOGY	Clinical Neurology	\N	1	t	t	2026-10-13 08:10:00.575	2026-10-13 08:10:00.575
94bf74e9-daee-480f-8622-d0b88031387c	62093139-7025-4ae9-b9d4-13a715cf218f	STROKE_MEDICINE	Stroke Medicine	\N	2	t	t	2026-10-13 08:10:00.578	2026-10-13 08:10:00.578
6433c235-ed80-4a7a-9333-99e9967c8148	62093139-7025-4ae9-b9d4-13a715cf218f	EPILEPSY	Epilepsy	\N	3	t	t	2026-10-13 08:10:00.581	2026-10-13 08:10:00.581
72073f88-4214-4f39-ba8b-ae49539a3783	62093139-7025-4ae9-b9d4-13a715cf218f	NEUROMUSCULAR_MEDICINE	Neuromuscular Medicine	\N	4	t	t	2026-10-13 08:10:00.583	2026-10-13 08:10:00.583
66e85bed-6ffa-4517-a2f7-6c1645220187	62093139-7025-4ae9-b9d4-13a715cf218f	MOVEMENT_DISORDERS	Movement Disorders	\N	5	t	t	2026-10-13 08:10:00.586	2026-10-13 08:10:00.586
68c76f96-4842-41b4-9c7b-e5664742adb0	86897b00-9dae-4d93-a7f7-721709f125de	JOINT_REPLACEMENT	Joint Replacement	\N	1	t	t	2026-10-13 08:10:00.588	2026-10-13 08:10:00.588
a2449cd1-f9d8-4984-b26b-fc6275ba0e3a	86897b00-9dae-4d93-a7f7-721709f125de	SPINE_SURGERY	Spine Surgery	\N	2	t	t	2026-10-13 08:10:00.59	2026-10-13 08:10:00.59
4cbea723-0f64-4bc6-b771-89ad22c0fd2e	86897b00-9dae-4d93-a7f7-721709f125de	SPORTS_MEDICINE	Sports Medicine	\N	3	t	t	2026-10-13 08:10:00.592	2026-10-13 08:10:00.592
0c48ad9f-ae12-4646-be7f-162eaad1b149	86897b00-9dae-4d93-a7f7-721709f125de	TRAUMA_SURGERY	Trauma Surgery	\N	4	t	t	2026-10-13 08:10:00.593	2026-10-13 08:10:00.593
57e0f104-d3d1-45f1-8ae5-e01868c7e284	86897b00-9dae-4d93-a7f7-721709f125de	PEDIATRIC_ORTHOPEDICS	Pediatric Orthopedics	\N	5	t	t	2026-10-13 08:10:00.594	2026-10-13 08:10:00.594
8d2a0c7a-585c-4b14-996f-d9b22f7f2a72	86897b00-9dae-4d93-a7f7-721709f125de	HAND_SURGERY	Hand Surgery	\N	6	t	t	2026-10-13 08:10:00.595	2026-10-13 08:10:00.595
bc1cfbfa-59d8-4289-ac7e-cc4c134b696d	86897b00-9dae-4d93-a7f7-721709f125de	FOOT_AND_ANKLE_SURGERY	Foot & Ankle Surgery	\N	7	t	t	2026-10-13 08:10:00.597	2026-10-13 08:10:00.597
ddfe5ed8-9c3f-4e7a-bcf6-1e593b7e2d5c	86897b00-9dae-4d93-a7f7-721709f125de	ORTHOPEDIC_ONCOLOGY	Orthopedic Oncology	\N	8	t	t	2026-10-13 08:10:00.599	2026-10-13 08:10:00.599
ee157e0a-60fe-490f-a9bd-6ed10c354986	df87cf71-4827-4f73-986d-f2eb15482357	GENERAL_PEDIATRICS	General Pediatrics	\N	1	t	t	2026-10-13 08:10:00.601	2026-10-13 08:10:00.601
f3e6f8ae-d8da-4f07-82f6-a6971d4f5a56	df87cf71-4827-4f73-986d-f2eb15482357	NEONATOLOGY	Neonatology	\N	2	t	t	2026-10-13 08:10:00.603	2026-10-13 08:10:00.603
f9a1364b-1e3a-455a-a48c-0c8624da1db9	df87cf71-4827-4f73-986d-f2eb15482357	PEDIATRIC_CARDIOLOGY	Pediatric Cardiology	\N	3	t	t	2026-10-13 08:10:00.605	2026-10-13 08:10:00.605
24c7edd8-6d9c-443e-95fb-09d9cebe24e5	df87cf71-4827-4f73-986d-f2eb15482357	PEDIATRIC_NEUROLOGY	Pediatric Neurology	\N	4	t	t	2026-10-13 08:10:00.608	2026-10-13 08:10:00.608
a84c2479-2a28-4b64-85a5-d6edef36b1b2	df87cf71-4827-4f73-986d-f2eb15482357	PEDIATRIC_ENDOCRINOLOGY	Pediatric Endocrinology	\N	5	t	t	2026-10-13 08:10:00.61	2026-10-13 08:10:00.61
4d7d8c3d-6a9a-4061-85c3-d929015ea469	df87cf71-4827-4f73-986d-f2eb15482357	PEDIATRIC_GASTROENTEROLOGY	Pediatric Gastroenterology	\N	6	t	t	2026-10-13 08:10:00.612	2026-10-13 08:10:00.612
2c4636c0-0b26-4968-848d-fc16d22b21e9	df87cf71-4827-4f73-986d-f2eb15482357	PEDIATRIC_PULMONOLOGY	Pediatric Pulmonology	\N	7	t	t	2026-10-13 08:10:00.616	2026-10-13 08:10:00.616
e0412792-6852-4c98-8a9c-c3661a96c6d5	df87cf71-4827-4f73-986d-f2eb15482357	PEDIATRIC_INTENSIVE_CARE	Pediatric Intensive Care	\N	8	t	t	2026-10-13 08:10:00.619	2026-10-13 08:10:00.619
892d8a4f-2c24-4ad6-a63f-1de1cd944aae	e6eaf59c-96ed-4c4c-81db-42f3c4b9c052	OBSTETRICS	Obstetrics	\N	1	t	t	2026-10-13 08:10:00.621	2026-10-13 08:10:00.621
0a9130fe-b17d-476a-9744-94f2a230c3fe	e6eaf59c-96ed-4c4c-81db-42f3c4b9c052	GYNECOLOGY	Gynecology	\N	2	t	t	2026-10-13 08:10:00.624	2026-10-13 08:10:00.624
5b38f0ce-22aa-4ff7-b752-8870af4157aa	e6eaf59c-96ed-4c4c-81db-42f3c4b9c052	MATERNAL_AND_FETAL_MEDICINE	Maternal & Fetal Medicine	\N	3	t	t	2026-10-13 08:10:00.626	2026-10-13 08:10:00.626
8c65f7cc-fe74-4704-9f4f-8ec843dff56a	e6eaf59c-96ed-4c4c-81db-42f3c4b9c052	REPRODUCTIVE_MEDICINE	Reproductive Medicine	\N	4	t	t	2026-10-13 08:10:00.629	2026-10-13 08:10:00.629
99c53c0f-fef2-43ad-af96-6b6204bd5edd	e6eaf59c-96ed-4c4c-81db-42f3c4b9c052	GYNECOLOGIC_ONCOLOGY	Gynecologic Oncology	\N	5	t	t	2026-10-13 08:10:00.632	2026-10-13 08:10:00.632
c051ada8-526f-481f-ae07-31b641e6f622	e6eaf59c-96ed-4c4c-81db-42f3c4b9c052	UROGYNECOLOGY	Urogynecology	\N	6	t	t	2026-10-13 08:10:00.636	2026-10-13 08:10:00.636
07a399fe-5ca2-4199-b4f8-286d236d9021	e6eaf59c-96ed-4c4c-81db-42f3c4b9c052	INFERTILITY	Infertility	\N	7	t	t	2026-10-13 08:10:00.64	2026-10-13 08:10:00.64
9ce52e1d-4d28-45cf-9442-8df7a2893706	e6eaf59c-96ed-4c4c-81db-42f3c4b9c052	HIGH_RISK_PREGNANCY	High-risk Pregnancy	\N	8	t	t	2026-10-13 08:10:00.644	2026-10-13 08:10:00.644
cb4521c4-6ab9-4c1d-8414-3a349faf336a	0c9845cb-a1df-4363-b2e8-c3ab6f6557ab	CLINICAL_DERMATOLOGY	Clinical Dermatology	\N	1	t	t	2026-10-13 08:10:00.646	2026-10-13 08:10:00.646
a54e866d-7f10-4295-8577-dd1e790f0d46	0c9845cb-a1df-4363-b2e8-c3ab6f6557ab	COSMETIC_DERMATOLOGY	Cosmetic Dermatology	\N	2	t	t	2026-10-13 08:10:00.649	2026-10-13 08:10:00.649
340ee4fc-fa12-4a8b-92df-2e9fe69687df	0c9845cb-a1df-4363-b2e8-c3ab6f6557ab	DERMATOSURGERY	Dermatosurgery	\N	3	t	t	2026-10-13 08:10:00.65	2026-10-13 08:10:00.65
7797b0cf-7f73-41dd-911e-3f61b73a4285	0c9845cb-a1df-4363-b2e8-c3ab6f6557ab	PEDIATRIC_DERMATOLOGY	Pediatric Dermatology	\N	4	t	t	2026-10-13 08:10:00.653	2026-10-13 08:10:00.653
4f893741-306f-4a05-979c-ea7be2370005	0c9845cb-a1df-4363-b2e8-c3ab6f6557ab	TRICHOLOGY	Trichology	\N	5	t	t	2026-10-13 08:10:00.654	2026-10-13 08:10:00.654
ccdd8919-de03-4c76-89ea-070c1b38c3c8	a356d50e-dc03-423f-bfa8-242afd8b851d	CATARACT_SURGERY	Cataract Surgery	\N	1	t	t	2026-10-13 08:10:00.656	2026-10-13 08:10:00.656
a030c438-3ef9-4ca0-bedc-1d51b0a023b5	a356d50e-dc03-423f-bfa8-242afd8b851d	RETINA	Retina	\N	2	t	t	2026-10-13 08:10:00.659	2026-10-13 08:10:00.659
87e093d1-2594-46dd-81e7-e6d4b49f61cb	b9739b6f-0a62-4651-9d06-4234041126c3	FAMILY_MEDICINE	Family Medicine	\N	2	t	t	2026-10-13 08:02:49.617	2026-10-13 08:08:05.748
51779aae-1aea-4e41-a3be-d97122af23dd	b9739b6f-0a62-4651-9d06-4234041126c3	GERIATRIC_MEDICINE	Geriatric Medicine	\N	3	t	t	2026-10-13 08:02:49.62	2026-10-13 08:08:05.748
9ca7a027-419e-46ae-97d8-97b91418903c	a356d50e-dc03-423f-bfa8-242afd8b851d	CORNEA	Cornea	\N	3	t	t	2026-10-13 08:10:00.663	2026-10-13 08:10:00.663
0e2a5340-f422-4e9e-8c51-f47a6e1f8eaa	a356d50e-dc03-423f-bfa8-242afd8b851d	GLAUCOMA	Glaucoma	\N	4	t	t	2026-10-13 08:10:00.665	2026-10-13 08:10:00.665
d14f644e-149d-4b99-a45e-8e76a2e58acf	b9739b6f-0a62-4651-9d06-4234041126c3	PREVENTIVE_MEDICINE	Preventive Medicine	\N	4	t	t	2026-10-13 08:02:49.621	2026-10-13 08:08:05.749
e49e5e16-f591-4824-b990-5ac9da139562	a356d50e-dc03-423f-bfa8-242afd8b851d	PEDIATRIC_OPHTHALMOLOGY	Pediatric Ophthalmology	\N	5	t	t	2026-10-13 08:10:00.668	2026-10-13 08:10:00.668
faf5da7f-b9c5-493b-844b-100569ed41df	a356d50e-dc03-423f-bfa8-242afd8b851d	OCULOPLASTY	Oculoplasty	\N	6	t	t	2026-10-13 08:10:00.67	2026-10-13 08:10:00.67
02bd2a2a-fabd-4c01-91dc-d4fd4a2ec7fb	4be9b787-2a98-44b0-a751-fe8c7191ddfc	OTOLOGY	Otology	\N	1	t	t	2026-10-13 08:10:00.672	2026-10-13 08:10:00.672
cdfcd167-1405-48bf-bb5a-8f04da1bd9e4	4be9b787-2a98-44b0-a751-fe8c7191ddfc	RHINOLOGY	Rhinology	\N	2	t	t	2026-10-13 08:10:00.674	2026-10-13 08:10:00.674
7ba64c79-96f5-46c9-82cf-82f7dbf43e6b	4be9b787-2a98-44b0-a751-fe8c7191ddfc	LARYNGOLOGY	Laryngology	\N	3	t	t	2026-10-13 08:10:00.676	2026-10-13 08:10:00.676
58d65164-5092-4023-a5a4-f4f8b935dd0a	4be9b787-2a98-44b0-a751-fe8c7191ddfc	HEAD_AND_NECK_SURGERY	Head & Neck Surgery	\N	4	t	t	2026-10-13 08:10:00.678	2026-10-13 08:10:00.678
2f23e2c4-7fda-4337-a04f-31b185ac206e	4be9b787-2a98-44b0-a751-fe8c7191ddfc	AUDIOLOGY	Audiology	\N	5	t	t	2026-10-13 08:10:00.679	2026-10-13 08:10:00.679
5baa32ab-80c1-477d-8e90-e1bcd0df44ce	a731704b-f286-456e-bab3-eb4788c11d8c	ADULT_PSYCHIATRY	Adult Psychiatry	\N	1	t	t	2026-10-13 08:10:00.681	2026-10-13 08:10:00.681
dd2eab0a-44e6-48d9-a782-73561bc3b988	a731704b-f286-456e-bab3-eb4788c11d8c	CHILD_PSYCHIATRY	Child Psychiatry	\N	2	t	t	2026-10-13 08:10:00.684	2026-10-13 08:10:00.684
6a574539-bc43-4a74-8db1-9a1c22a3095e	a731704b-f286-456e-bab3-eb4788c11d8c	ADDICTION_MEDICINE	Addiction Medicine	\N	3	t	t	2026-10-13 08:10:00.686	2026-10-13 08:10:00.686
aec4f135-b3c7-4c4e-9ed0-f4da8935d08d	a731704b-f286-456e-bab3-eb4788c11d8c	GERIATRIC_PSYCHIATRY	Geriatric Psychiatry	\N	4	t	t	2026-10-13 08:10:00.688	2026-10-13 08:10:00.688
46956519-f6da-41b4-82e3-89ae6f259655	a731704b-f286-456e-bab3-eb4788c11d8c	CONSULTATION_LIAISON_PSYCHIATRY	Consultation Liaison Psychiatry	\N	5	t	t	2026-10-13 08:10:00.691	2026-10-13 08:10:00.691
8428b838-de0a-404b-b35e-1ddd2e7f6a69	38dcc381-ab3a-473a-89cc-094f1949e914	SLEEP_MEDICINE	Sleep Medicine	\N	1	t	t	2026-10-13 08:10:00.693	2026-10-13 08:10:00.693
89475e69-43b0-48e3-9d1e-d0c92dff8fa6	38dcc381-ab3a-473a-89cc-094f1949e914	CRITICAL_CARE_PULMONOLOGY	Critical Care Pulmonology	\N	2	t	t	2026-10-13 08:10:00.695	2026-10-13 08:10:00.695
ad0d6ade-9e2d-448f-9014-3290c4c456f8	38dcc381-ab3a-473a-89cc-094f1949e914	INTERVENTIONAL_PULMONOLOGY	Interventional Pulmonology	\N	3	t	t	2026-10-13 08:10:00.696	2026-10-13 08:10:00.696
e8fe6f2c-d41b-4b06-9cb7-380a0c171198	38dcc381-ab3a-473a-89cc-094f1949e914	ASTHMA	Asthma	\N	4	t	t	2026-10-13 08:10:00.698	2026-10-13 08:10:00.698
f3c26c5b-3dc9-414a-8651-a88560064b48	38dcc381-ab3a-473a-89cc-094f1949e914	COPD	COPD	\N	5	t	t	2026-10-13 08:10:00.701	2026-10-13 08:10:00.701
0d0909c9-5efd-4694-8d0e-9daad45e5adb	db52b208-0549-458c-8756-a7829971552b	HEPATOLOGY	Hepatology	\N	1	t	t	2026-10-13 08:10:00.703	2026-10-13 08:10:00.703
e3d0a7d4-c27a-4b6e-8f9e-d9d5f00c5191	db52b208-0549-458c-8756-a7829971552b	THERAPEUTIC_ENDOSCOPY	Therapeutic Endoscopy	\N	2	t	t	2026-10-13 08:10:00.704	2026-10-13 08:10:00.704
d62d946f-d3ed-479e-907e-3e84b0df8aa5	db52b208-0549-458c-8756-a7829971552b	INFLAMMATORY_BOWEL_DISEASE	Inflammatory Bowel Disease	\N	3	t	t	2026-10-13 08:10:00.706	2026-10-13 08:10:00.706
633f4b78-30fb-4b80-aea3-7b184b7e7022	db52b208-0549-458c-8756-a7829971552b	PANCREATOLOGY	Pancreatology	\N	4	t	t	2026-10-13 08:10:00.709	2026-10-13 08:10:00.709
84e85631-5994-4794-9179-f4a31ace054b	db52b208-0549-458c-8756-a7829971552b	GI_MOTILITY	GI Motility	\N	5	t	t	2026-10-13 08:10:00.711	2026-10-13 08:10:00.711
f9e0e8da-8f45-4153-87b7-89dc81a5557d	b3cc3725-ef95-49dc-bd0d-aecf68f3c0d2	DIALYSIS	Dialysis	\N	1	t	t	2026-10-13 08:10:00.712	2026-10-13 08:10:00.712
a2be190e-00bb-4037-932f-a86ec441327a	b3cc3725-ef95-49dc-bd0d-aecf68f3c0d2	RENAL_TRANSPLANT	Renal Transplant	\N	2	t	t	2026-10-13 08:10:00.715	2026-10-13 08:10:00.715
8043c122-8bb8-45ee-982a-cca8735f7683	b3cc3725-ef95-49dc-bd0d-aecf68f3c0d2	CRITICAL_CARE_NEPHROLOGY	Critical Care Nephrology	\N	3	t	t	2026-10-13 08:10:00.717	2026-10-13 08:10:00.717
add17fcc-507b-4085-addf-a81aeff30e62	b3cc3725-ef95-49dc-bd0d-aecf68f3c0d2	PEDIATRIC_NEPHROLOGY	Pediatric Nephrology	\N	4	t	t	2026-10-13 08:10:00.719	2026-10-13 08:10:00.719
2d632d1e-5fbb-44dc-9be5-ecdf6a39a5ed	1cfcc7b7-f126-4314-8814-e9470898c326	ENDOUROLOGY	Endourology	\N	1	t	t	2026-10-13 08:10:00.721	2026-10-13 08:10:00.721
fd8cae48-5743-4736-84bc-8c2d11ae4ffb	1cfcc7b7-f126-4314-8814-e9470898c326	UROLOGIC_ONCOLOGY	Urologic Oncology	\N	2	t	t	2026-10-13 08:10:00.724	2026-10-13 08:10:00.724
187a83fb-338b-4285-adeb-672846af1c21	1cfcc7b7-f126-4314-8814-e9470898c326	ANDROLOGY	Andrology	\N	3	t	t	2026-10-13 08:10:00.726	2026-10-13 08:10:00.726
400bd405-72ed-41a4-9cfe-b9f4a166eea3	1cfcc7b7-f126-4314-8814-e9470898c326	FEMALE_UROLOGY	Female Urology	\N	4	t	t	2026-10-13 08:10:00.728	2026-10-13 08:10:00.728
07680a82-320f-4600-adf8-6efde8b0c8a2	1cfcc7b7-f126-4314-8814-e9470898c326	PEDIATRIC_UROLOGY	Pediatric Urology	\N	5	t	t	2026-10-13 08:10:00.731	2026-10-13 08:10:00.731
0ad99504-6ef6-4310-997c-088d8cc21302	93f9b67e-a6e4-47b9-9495-f0a3dbb4f60b	MEDICAL_ONCOLOGY	Medical Oncology	\N	1	t	t	2026-10-13 08:10:00.732	2026-10-13 08:10:00.732
5838d7fd-9313-45b9-b4bb-fbbfab6e62eb	93f9b67e-a6e4-47b9-9495-f0a3dbb4f60b	SURGICAL_ONCOLOGY	Surgical Oncology	\N	2	t	t	2026-10-13 08:10:00.734	2026-10-13 08:10:00.734
6018e815-76f0-488f-9739-6ce7c9ceb020	93f9b67e-a6e4-47b9-9495-f0a3dbb4f60b	RADIATION_ONCOLOGY	Radiation Oncology	\N	3	t	t	2026-10-13 08:10:00.737	2026-10-13 08:10:00.737
08bcb1a7-ad56-4d57-ad13-680c7015da3c	93f9b67e-a6e4-47b9-9495-f0a3dbb4f60b	HEMATOLOGIC_ONCOLOGY	Hematologic Oncology	\N	4	t	t	2026-10-13 08:10:00.739	2026-10-13 08:10:00.739
08cb7a6c-419e-4a75-abbf-662c1f974e3a	93f9b67e-a6e4-47b9-9495-f0a3dbb4f60b	PALLIATIVE_ONCOLOGY	Palliative Oncology	\N	5	t	t	2026-10-13 08:10:00.741	2026-10-13 08:10:00.741
86adfdad-1cac-414e-9e4c-81f9b316762a	9171c530-5a36-45cd-abec-c98e433458a9	DIABETES	Diabetes	\N	1	t	t	2026-10-13 08:10:00.743	2026-10-13 08:10:00.743
a21dbc78-96b0-463a-8efc-531dae48743a	9171c530-5a36-45cd-abec-c98e433458a9	THYROID_DISORDERS	Thyroid Disorders	\N	2	t	t	2026-10-13 08:10:00.745	2026-10-13 08:10:00.745
88c74b3d-eb71-462d-8061-bce41378a5d1	9171c530-5a36-45cd-abec-c98e433458a9	PITUITARY_DISORDERS	Pituitary Disorders	\N	3	t	t	2026-10-13 08:10:00.747	2026-10-13 08:10:00.747
50b01a51-ebf7-494b-b520-0514e57d0c0a	9171c530-5a36-45cd-abec-c98e433458a9	METABOLIC_DISORDERS	Metabolic Disorders	\N	4	t	t	2026-10-13 08:10:00.748	2026-10-13 08:10:00.748
9b25bcfd-59ef-4838-a599-54b25012d3ee	9171c530-5a36-45cd-abec-c98e433458a9	OSTEOPOROSIS	Osteoporosis	\N	5	t	t	2026-10-13 08:10:00.75	2026-10-13 08:10:00.75
4075aedd-3af3-4449-9251-139dc2b91bee	22bac55b-0f07-4387-8078-b5a2651154c9	TRAUMA_CARE	Trauma Care	\N	1	t	t	2026-10-13 08:10:00.752	2026-10-13 08:10:00.752
dbae6320-1721-4069-b7bb-cdfaf883dbab	9759c2db-5e94-45ad-98a2-66e5b6bb6b7e	INTERVENTIONAL_CARDIOLOGY	Interventional Cardiology	\N	1	t	t	2026-10-13 08:02:49.623	2026-10-13 08:08:05.749
884ba171-394c-4002-8e5d-ec102a4d4eb7	9759c2db-5e94-45ad-98a2-66e5b6bb6b7e	NON_INVASIVE_CARDIOLOGY	Non-invasive Cardiology	\N	2	t	t	2026-10-13 08:02:49.626	2026-10-13 08:08:05.749
e6ec1310-fbbf-4a7c-8ad8-8b13d325409b	22bac55b-0f07-4387-8078-b5a2651154c9	TOXICOLOGY	Toxicology	\N	2	t	t	2026-10-13 08:10:00.755	2026-10-13 08:10:00.755
6277a0ba-efe3-459f-a562-aad3692ff8d2	22bac55b-0f07-4387-8078-b5a2651154c9	DISASTER_MEDICINE	Disaster Medicine	\N	3	t	t	2026-10-13 08:10:00.757	2026-10-13 08:10:00.757
401bab10-7717-4ccb-bbab-5579a3ed130c	22bac55b-0f07-4387-8078-b5a2651154c9	EMERGENCY_ULTRASOUND	Emergency Ultrasound	\N	4	t	t	2026-10-13 08:10:00.759	2026-10-13 08:10:00.759
e36ea356-b452-4fa7-9cae-b9636a08a36a	a8add53c-cadd-4753-9e12-ddcff41f4c83	ADULT_ICU	Adult ICU	\N	1	t	t	2026-10-13 08:10:00.761	2026-10-13 08:10:00.761
327ab282-9fd8-47fd-bfd0-8fd942c49580	a8add53c-cadd-4753-9e12-ddcff41f4c83	CARDIAC_ICU	Cardiac ICU	\N	2	t	t	2026-10-13 08:10:00.763	2026-10-13 08:10:00.763
97a0f40d-5669-44db-acb1-5bbadf3b6ad4	a8add53c-cadd-4753-9e12-ddcff41f4c83	NEURO_ICU	Neuro ICU	\N	3	t	t	2026-10-13 08:10:00.765	2026-10-13 08:10:00.765
2552024b-fcbc-4c66-a7b8-93bcf06c84e4	a8add53c-cadd-4753-9e12-ddcff41f4c83	PEDIATRIC_ICU	Pediatric ICU	\N	4	t	t	2026-10-13 08:10:00.768	2026-10-13 08:10:00.768
b728ec89-1ec5-490f-b690-28935d3abb68	a8add53c-cadd-4753-9e12-ddcff41f4c83	NEONATAL_ICU	Neonatal ICU	\N	5	t	t	2026-10-13 08:10:00.77	2026-10-13 08:10:00.77
5496a483-2e88-498b-90c4-1a37c20cc3e2	f732d2a5-4f73-4a8d-ad7a-32513678017d	DIAGNOSTIC_RADIOLOGY	Diagnostic Radiology	\N	1	t	t	2026-10-13 08:10:00.772	2026-10-13 08:10:00.772
4048e02c-52ca-4ceb-b3a2-80d12989fc23	f732d2a5-4f73-4a8d-ad7a-32513678017d	INTERVENTIONAL_RADIOLOGY	Interventional Radiology	\N	2	t	t	2026-10-13 08:10:00.775	2026-10-13 08:10:00.775
7af02436-b683-4d41-a4e4-0d7dd0c39db5	f732d2a5-4f73-4a8d-ad7a-32513678017d	NEURORADIOLOGY	Neuroradiology	\N	3	t	t	2026-10-13 08:10:00.777	2026-10-13 08:10:00.777
892c8ebf-c18e-47ad-9f6f-3e70e8135520	f732d2a5-4f73-4a8d-ad7a-32513678017d	MUSCULOSKELETAL_IMAGING	Musculoskeletal Imaging	\N	4	t	t	2026-10-13 08:10:00.779	2026-10-13 08:10:00.779
226f7d1d-84f1-4fe6-abbf-90165f2ccca6	f732d2a5-4f73-4a8d-ad7a-32513678017d	BREAST_IMAGING	Breast Imaging	\N	5	t	t	2026-10-13 08:10:00.782	2026-10-13 08:10:00.782
3cb6a230-fb29-4045-b5df-6663e23b97e5	f732d2a5-4f73-4a8d-ad7a-32513678017d	NUCLEAR_MEDICINE	Nuclear Medicine	\N	6	t	t	2026-10-13 08:10:00.785	2026-10-13 08:10:00.785
634c7648-447a-4a45-a68f-edf427c96a64	1ef18686-a2ed-47a0-bfd6-0745652a6090	CLINICAL_PATHOLOGY	Clinical Pathology	\N	1	t	t	2026-10-13 08:10:00.788	2026-10-13 08:10:00.788
a2aa8913-9a95-4a3b-9b78-16e907aada97	1ef18686-a2ed-47a0-bfd6-0745652a6090	HISTOPATHOLOGY	Histopathology	\N	2	t	t	2026-10-13 08:10:00.791	2026-10-13 08:10:00.791
918f431a-25d0-445c-ae84-ad889082de4c	1ef18686-a2ed-47a0-bfd6-0745652a6090	MICROBIOLOGY	Microbiology	\N	3	t	t	2026-10-13 08:10:00.793	2026-10-13 08:10:00.793
4eaa2bda-9273-4b74-9f18-382b5088da43	1ef18686-a2ed-47a0-bfd6-0745652a6090	HEMATOLOGY	Hematology	\N	4	t	t	2026-10-13 08:10:00.795	2026-10-13 08:10:00.795
39a37673-af36-45b3-bddd-75c8e8cb021a	1ef18686-a2ed-47a0-bfd6-0745652a6090	BIOCHEMISTRY	Biochemistry	\N	5	t	t	2026-10-13 08:10:00.798	2026-10-13 08:10:00.798
0b2694e2-48ab-4c73-96ef-1d18a38b3145	1ef18686-a2ed-47a0-bfd6-0745652a6090	MOLECULAR_DIAGNOSTICS	Molecular Diagnostics	\N	6	t	t	2026-10-13 08:10:00.801	2026-10-13 08:10:00.801
d9518d78-0219-41d7-876e-1b3560f89312	1ef18686-a2ed-47a0-bfd6-0745652a6090	CYTOLOGY	Cytology	\N	7	t	t	2026-10-13 08:10:00.804	2026-10-13 08:10:00.804
6953a299-ac5b-49bd-93a0-5b6228cc3afc	6da2623c-ddaa-4df7-9602-146080e42d06	CARDIAC_ANESTHESIA	Cardiac Anesthesia	\N	1	t	t	2026-10-13 08:10:00.807	2026-10-13 08:10:00.807
5cffe613-e5ea-4a08-93f2-1a1e6706eaa1	6da2623c-ddaa-4df7-9602-146080e42d06	NEURO_ANESTHESIA	Neuro Anesthesia	\N	2	t	t	2026-10-13 08:10:00.809	2026-10-13 08:10:00.809
96fa70b9-d874-45a7-8d35-53096ca9621c	6da2623c-ddaa-4df7-9602-146080e42d06	PEDIATRIC_ANESTHESIA	Pediatric Anesthesia	\N	3	t	t	2026-10-13 08:10:00.811	2026-10-13 08:10:00.811
f932273f-e896-4982-a78a-803520bf4979	6da2623c-ddaa-4df7-9602-146080e42d06	PAIN_MEDICINE	Pain Medicine	\N	4	t	t	2026-10-13 08:10:00.814	2026-10-13 08:10:00.814
4f32e54a-9c4c-4576-bfdd-d326b8f1a4cc	6da2623c-ddaa-4df7-9602-146080e42d06	CRITICAL_CARE_ANESTHESIA	Critical Care Anesthesia	\N	5	t	t	2026-10-13 08:10:00.816	2026-10-13 08:10:00.816
6728a97a-b5aa-4969-b6b8-9e07bc1383ba	123ebbbf-609c-477a-bd7e-cdc8e953215f	ORTHODONTICS	Orthodontics	\N	1	t	t	2026-10-13 08:10:00.818	2026-10-13 08:10:00.818
fbf53d03-d0c6-4a44-877c-2cacdaf4f79f	123ebbbf-609c-477a-bd7e-cdc8e953215f	PROSTHODONTICS	Prosthodontics	\N	2	t	t	2026-10-13 08:10:00.82	2026-10-13 08:10:00.82
5e6f7fdf-defa-47e0-848e-6c03168daa5d	123ebbbf-609c-477a-bd7e-cdc8e953215f	PERIODONTICS	Periodontics	\N	3	t	t	2026-10-13 08:10:00.821	2026-10-13 08:10:00.821
05e8f30c-34b9-407f-b835-cc525575470b	123ebbbf-609c-477a-bd7e-cdc8e953215f	ENDODONTICS	Endodontics	\N	4	t	t	2026-10-13 08:10:00.823	2026-10-13 08:10:00.823
2c93a468-74c1-4fa3-9881-b16279a4204d	123ebbbf-609c-477a-bd7e-cdc8e953215f	ORAL_SURGERY	Oral Surgery	\N	5	t	t	2026-10-13 08:10:00.827	2026-10-13 08:10:00.827
1778ce3b-23a5-4126-9b2f-4c37899557be	123ebbbf-609c-477a-bd7e-cdc8e953215f	PEDIATRIC_DENTISTRY	Pediatric Dentistry	\N	6	t	t	2026-10-13 08:10:00.83	2026-10-13 08:10:00.83
a6fd3bfb-8c26-4f60-9c46-33f252c2a326	0a6ef5f5-9124-4487-a27c-5881cd90c685	MUSCULOSKELETAL_PHYSIOTHERAPY	Musculoskeletal Physiotherapy	\N	1	t	t	2026-10-13 08:10:00.832	2026-10-13 08:10:00.832
19186d9c-4225-414e-ad14-50e4ca5f10b4	0a6ef5f5-9124-4487-a27c-5881cd90c685	NEUROLOGICAL_REHABILITATION	Neurological Rehabilitation	\N	2	t	t	2026-10-13 08:10:00.835	2026-10-13 08:10:00.835
4e0fff7e-e57c-4a7b-922a-8b355cb9c86c	0a6ef5f5-9124-4487-a27c-5881cd90c685	SPORTS_REHABILITATION	Sports Rehabilitation	\N	3	t	t	2026-10-13 08:10:00.838	2026-10-13 08:10:00.838
e13d929b-052a-41ba-a029-097cf7a65a90	0a6ef5f5-9124-4487-a27c-5881cd90c685	GERIATRIC_PHYSIOTHERAPY	Geriatric Physiotherapy	\N	4	t	t	2026-10-13 08:10:00.841	2026-10-13 08:10:00.841
4b0df93d-650c-4ef0-a5f1-e0b09da43e62	0a6ef5f5-9124-4487-a27c-5881cd90c685	PEDIATRIC_PHYSIOTHERAPY	Pediatric Physiotherapy	\N	5	t	t	2026-10-13 08:10:00.844	2026-10-13 08:10:00.844
b24b8a56-356d-454e-bb62-5d0136de005d	73333e5f-8c2d-49cf-8a00-8845683436e6	AYURVEDA	Ayurveda	\N	1	t	t	2026-10-13 08:10:00.848	2026-10-13 08:10:00.848
6a93ca32-88d1-41a6-aa28-823f70235bbe	73333e5f-8c2d-49cf-8a00-8845683436e6	HOMEOPATHY	Homeopathy	\N	2	t	t	2026-10-13 08:10:00.851	2026-10-13 08:10:00.851
860d23f5-2a8e-44ce-91c7-a9512f0e0852	73333e5f-8c2d-49cf-8a00-8845683436e6	SIDDHA	Siddha	\N	3	t	t	2026-10-13 08:10:00.854	2026-10-13 08:10:00.854
e1e168e6-754d-472f-839b-8921476b7a1e	73333e5f-8c2d-49cf-8a00-8845683436e6	UNANI	Unani	\N	4	t	t	2026-10-13 08:10:00.857	2026-10-13 08:10:00.857
0b199e84-cab6-4134-b6e6-5ece11e4e452	73333e5f-8c2d-49cf-8a00-8845683436e6	YOGA_AND_NATUROPATHY	Yoga & Naturopathy	\N	5	t	t	2026-10-13 08:10:00.86	2026-10-13 08:10:00.86
79c54c6c-fdc8-4f3a-b4a6-a6453126344a	73333e5f-8c2d-49cf-8a00-8845683436e6	PANCHAKARMA	Panchakarma	\N	6	t	t	2026-10-13 08:10:00.864	2026-10-13 08:10:00.864
d5b4bb06-c8fb-4470-9129-6edfea3ba818	73333e5f-8c2d-49cf-8a00-8845683436e6	AYURVEDIC_SURGERY	Ayurvedic Surgery	\N	7	t	t	2026-10-13 08:10:00.866	2026-10-13 08:10:00.866
c3857db2-f0f7-430b-8581-3e9bb5ee90c6	73333e5f-8c2d-49cf-8a00-8845683436e6	AYURVEDIC_NUTRITION	Ayurvedic Nutrition	\N	8	t	t	2026-10-13 08:10:00.869	2026-10-13 08:10:00.869
9e9f0318-b259-422b-b9ef-d9e94c979e49	9759c2db-5e94-45ad-98a2-66e5b6bb6b7e	ELECTROPHYSIOLOGY	Electrophysiology	\N	3	t	t	2026-10-13 08:02:49.627	2026-10-13 08:08:05.75
2f6818bd-e5dc-4c74-8f6f-9ace5b28a1b4	9759c2db-5e94-45ad-98a2-66e5b6bb6b7e	CARDIAC_IMAGING	Cardiac Imaging	\N	4	t	t	2026-10-13 08:02:49.629	2026-10-13 08:08:05.75
70c6aa91-53b5-4419-83e7-b910bbb7cf67	9759c2db-5e94-45ad-98a2-66e5b6bb6b7e	HEART_FAILURE	Heart Failure	\N	5	t	t	2026-10-13 08:02:49.63	2026-10-13 08:08:05.751
bbba0ca2-8e70-47be-9e89-33eb22bfc600	e508ed59-09a7-402d-b85d-f7b66386770e	CLINICAL_NEUROLOGY	Clinical Neurology	\N	1	t	t	2026-10-13 08:02:49.632	2026-10-13 08:08:05.751
70e27ae7-fe6b-40b2-af0a-d6088c884758	e508ed59-09a7-402d-b85d-f7b66386770e	STROKE_MEDICINE	Stroke Medicine	\N	2	t	t	2026-10-13 08:02:49.634	2026-10-13 08:08:05.751
b86f5cce-7ee7-4aff-9f15-feb596e1a9a5	e508ed59-09a7-402d-b85d-f7b66386770e	EPILEPSY	Epilepsy	\N	3	t	t	2026-10-13 08:02:49.635	2026-10-13 08:08:05.752
d77c4be1-cd47-4b40-bd08-69f80a27a3b0	e508ed59-09a7-402d-b85d-f7b66386770e	NEUROMUSCULAR_MEDICINE	Neuromuscular Medicine	\N	4	t	t	2026-10-13 08:02:49.637	2026-10-13 08:08:05.752
3f7a197e-25d0-4f18-ac7a-e00e3c1c4ea2	e508ed59-09a7-402d-b85d-f7b66386770e	MOVEMENT_DISORDERS	Movement Disorders	\N	5	t	t	2026-10-13 08:02:49.639	2026-10-13 08:08:05.752
95d8c048-db6f-4145-b96e-81a09f619ec0	67653898-f8f8-4050-aac4-9fcc275eea0e	JOINT_REPLACEMENT	Joint Replacement	\N	1	t	t	2026-10-13 08:02:49.641	2026-10-13 08:08:05.753
d9e1934c-e2ad-4fc3-8e8c-174eb848cf7e	67653898-f8f8-4050-aac4-9fcc275eea0e	SPINE_SURGERY	Spine Surgery	\N	2	t	t	2026-10-13 08:02:49.643	2026-10-13 08:08:05.753
513e77cc-d6b5-4ac9-892e-997b40734428	67653898-f8f8-4050-aac4-9fcc275eea0e	SPORTS_MEDICINE	Sports Medicine	\N	3	t	t	2026-10-13 08:02:49.645	2026-10-13 08:08:05.753
b7242849-c424-4597-a75c-729ee0704e52	67653898-f8f8-4050-aac4-9fcc275eea0e	TRAUMA_SURGERY	Trauma Surgery	\N	4	t	t	2026-10-13 08:02:49.647	2026-10-13 08:08:05.754
96c6e56a-ba41-4ee4-951a-12a300e8099c	67653898-f8f8-4050-aac4-9fcc275eea0e	PEDIATRIC_ORTHOPEDICS	Pediatric Orthopedics	\N	5	t	t	2026-10-13 08:02:49.648	2026-10-13 08:08:05.754
671e904b-4e32-47ce-a979-2121938243bd	67653898-f8f8-4050-aac4-9fcc275eea0e	HAND_SURGERY	Hand Surgery	\N	6	t	t	2026-10-13 08:02:49.65	2026-10-13 08:08:05.755
1e7aeb67-454e-4bd3-bd58-b06958b5892e	67653898-f8f8-4050-aac4-9fcc275eea0e	FOOT_AND_ANKLE_SURGERY	Foot & Ankle Surgery	\N	7	t	t	2026-10-13 08:02:49.652	2026-10-13 08:08:05.755
f8b092f2-16f2-4683-b849-48e4aac6975e	67653898-f8f8-4050-aac4-9fcc275eea0e	ORTHOPEDIC_ONCOLOGY	Orthopedic Oncology	\N	8	t	t	2026-10-13 08:02:49.654	2026-10-13 08:08:05.755
7e7cc293-fba4-42a2-b5a6-9de6abfb5cd1	c23d3379-cc7d-4945-a226-fa9bcf0dec3a	ACUPUNCTURE	Acupuncture	\N	1	t	t	2026-10-13 08:10:00.871	2026-10-13 08:10:00.871
bb99bf17-69ab-4cd6-a850-123f14431008	c23d3379-cc7d-4945-a226-fa9bcf0dec3a	ACUPRESSURE	Acupressure	\N	2	t	t	2026-10-13 08:10:00.873	2026-10-13 08:10:00.873
5dd24450-8fac-440a-b06b-73aad8e4d912	c23d3379-cc7d-4945-a226-fa9bcf0dec3a	CUPPING_THERAPY	Cupping Therapy	\N	3	t	t	2026-10-13 08:10:00.875	2026-10-13 08:10:00.875
ab34d1ed-4673-49fa-9aeb-f56c4ff47494	c23d3379-cc7d-4945-a226-fa9bcf0dec3a	LIFESTYLE_MEDICINE	Lifestyle Medicine	\N	4	t	t	2026-10-13 08:10:00.878	2026-10-13 08:10:00.878
06f53075-40d4-4faa-97ae-026776acc463	c23d3379-cc7d-4945-a226-fa9bcf0dec3a	PAIN_MANAGEMENT	Pain Management	\N	5	t	t	2026-10-13 08:10:00.881	2026-10-13 08:10:00.881
a8395089-dffd-4d45-8877-70c595e62c45	c23d3379-cc7d-4945-a226-fa9bcf0dec3a	MIND_BODY_MEDICINE	Mind Body Medicine	\N	6	t	t	2026-10-13 08:10:00.884	2026-10-13 08:10:00.884
bca63efe-07e4-409c-957e-ab6955aa4f15	c23d3379-cc7d-4945-a226-fa9bcf0dec3a	MEDITATION_THERAPY	Meditation Therapy	\N	7	t	t	2026-10-13 08:10:00.887	2026-10-13 08:10:00.887
3bd6f881-88fa-4caf-b9d1-3b92759fbd57	c23d3379-cc7d-4945-a226-fa9bcf0dec3a	FUNCTIONAL_MEDICINE	Functional Medicine	\N	8	t	t	2026-10-13 08:10:00.89	2026-10-13 08:10:00.89
eb0fbbd6-fb7b-4344-a232-e019b6034e4b	c23d3379-cc7d-4945-a226-fa9bcf0dec3a	CLINICAL_NUTRITION	Clinical Nutrition	\N	9	t	t	2026-10-13 08:10:00.894	2026-10-13 08:10:00.894
e6f00fe5-edc4-443c-a0f2-d2012f169fb9	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	SMALL_ANIMAL_MEDICINE	Small Animal Medicine	\N	1	t	t	2026-10-13 08:10:00.897	2026-10-13 08:10:00.897
a8cedc2f-ff1f-4567-8dae-d3acd645edbd	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	LARGE_ANIMAL_MEDICINE	Large Animal Medicine	\N	2	t	t	2026-10-13 08:10:00.899	2026-10-13 08:10:00.899
9fd6c03f-8bc0-4000-bceb-4076abd990d3	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	COMPANION_ANIMAL_MEDICINE	Companion Animal Medicine	\N	3	t	t	2026-10-13 08:10:00.902	2026-10-13 08:10:00.902
2497e077-68b7-4a5c-b954-2d4e00a07011	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	CANINE_MEDICINE	Canine Medicine	\N	4	t	t	2026-10-13 08:10:00.905	2026-10-13 08:10:00.905
6fd2e700-8766-4944-9330-722056efc392	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	FELINE_MEDICINE	Feline Medicine	\N	5	t	t	2026-10-13 08:10:00.908	2026-10-13 08:10:00.908
b65b2b96-46b3-4414-b682-a129d20967d1	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	AVIAN_MEDICINE	Avian Medicine	\N	6	t	t	2026-10-13 08:10:00.911	2026-10-13 08:10:00.911
ac440974-fe40-49c0-9d16-e7610f28ac31	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	EQUINE_MEDICINE	Equine Medicine	\N	7	t	t	2026-10-13 08:10:00.914	2026-10-13 08:10:00.914
ec88310f-7062-441b-b99b-e4daca3cd98d	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	BOVINE_MEDICINE	Bovine Medicine	\N	8	t	t	2026-10-13 08:10:00.917	2026-10-13 08:10:00.917
8c4fb947-c02d-4dbb-9205-3fea0610e077	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	WILDLIFE_MEDICINE	Wildlife Medicine	\N	9	t	t	2026-10-13 08:10:00.92	2026-10-13 08:10:00.92
666451cd-114a-4f02-968d-5e7e2b8e0c2c	fa9223cc-5ecd-43fa-9fdd-5e06dd85d0fa	HEART_FAILURE	Heart Failure	\N	5	t	t	2026-08-06 19:11:07.606	2026-10-13 08:08:05.439
b3e6ca15-58e1-493c-b0dd-c283530a58d6	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	ZOO_MEDICINE	Zoo Medicine	\N	10	t	t	2026-10-13 08:10:00.923	2026-10-13 08:10:00.923
c0d09911-8d25-4aa4-a776-d9a0c1cc3af5	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	VETERINARY_SURGERY	Veterinary Surgery	\N	11	t	t	2026-10-13 08:10:00.926	2026-10-13 08:10:00.926
40f0dc09-da64-4067-90da-81aceab1fb78	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	VETERINARY_ORTHOPEDICS	Veterinary Orthopedics	\N	12	t	t	2026-10-13 08:10:00.929	2026-10-13 08:10:00.929
d4c36835-33a5-4fab-a516-ad4fe45d116f	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	VETERINARY_DERMATOLOGY	Veterinary Dermatology	\N	13	t	t	2026-10-13 08:10:00.932	2026-10-13 08:10:00.932
02811e15-26d2-4a06-88a4-17bef1605a44	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	VETERINARY_CARDIOLOGY	Veterinary Cardiology	\N	14	t	t	2026-10-13 08:10:00.935	2026-10-13 08:10:00.935
7d1b1953-bdc3-4fa4-9e96-4f3b6c5e89a5	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	VETERINARY_DENTISTRY	Veterinary Dentistry	\N	15	t	t	2026-10-13 08:10:00.939	2026-10-13 08:10:00.939
1200631f-6bc6-4646-8a73-490e4551726c	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	VETERINARY_ONCOLOGY	Veterinary Oncology	\N	16	t	t	2026-10-13 08:10:00.942	2026-10-13 08:10:00.942
eec00a03-1371-4b0b-a7e7-ae98825a1aed	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	VETERINARY_NEUROLOGY	Veterinary Neurology	\N	17	t	t	2026-10-13 08:10:00.945	2026-10-13 08:10:00.945
c0fa804d-de4d-4db4-ada3-9b66971104ec	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	VETERINARY_EMERGENCY_AND_CRITICAL_CARE	Veterinary Emergency & Critical Care	\N	18	t	t	2026-10-13 08:10:00.949	2026-10-13 08:10:00.949
37ea3a7a-e2a1-4dc7-af3b-2906d6eea595	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	VETERINARY_RADIOLOGY	Veterinary Radiology	\N	19	t	t	2026-10-13 08:10:00.952	2026-10-13 08:10:00.952
dbc89e79-aae8-46e0-8d28-45aeec80b302	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	VETERINARY_PATHOLOGY	Veterinary Pathology	\N	20	t	t	2026-10-13 08:10:00.956	2026-10-13 08:10:00.956
c7709d9a-63fc-4cc1-a58b-9b17759c782d	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	ANIMAL_REHABILITATION	Animal Rehabilitation	\N	21	t	t	2026-10-13 08:10:00.96	2026-10-13 08:10:00.96
b2d8ccc1-a15e-4c1e-acae-ee689cb3ed62	9c584fe0-cf0b-429f-ad3d-98bcb6e3ee9b	PREVENTIVE_VETERINARY_MEDICINE	Preventive Veterinary Medicine	\N	22	t	t	2026-10-13 08:10:00.963	2026-10-13 08:10:00.963
275086ec-44b5-43b8-bd06-1f62eebb43eb	2dae8e6c-417a-4932-ba3b-aae96054dd53	PERIODONTICS	Periodontics	\N	3	t	t	2026-10-13 08:02:49.9	2026-10-13 08:08:05.789
c371989d-563f-4d06-886b-d8d408399ebb	f05a8c7e-d467-461e-a895-aedc2b1223b3	AYURVEDA	Ayurveda	\N	1	t	t	2026-10-13 08:02:49.928	2026-10-13 08:08:05.792
1ecb176d-b3d8-4eb6-8032-8b1747fc1703	6ab49a23-e8a7-420d-8007-94c20201bbf9	AVIAN_MEDICINE	Avian Medicine	\N	6	t	t	2026-08-06 19:11:07.67	2026-10-13 08:08:05.497
26cb7a26-bc28-41cf-973a-c82ead96bf0e	6ab49a23-e8a7-420d-8007-94c20201bbf9	EQUINE_MEDICINE	Equine Medicine	\N	7	t	t	2026-08-06 19:11:07.671	2026-10-13 08:08:05.498
8cae1e32-49e1-40a1-88f6-f3e21d643edd	6ab49a23-e8a7-420d-8007-94c20201bbf9	BOVINE_MEDICINE	Bovine Medicine	\N	8	t	t	2026-08-06 19:11:07.671	2026-10-13 08:08:05.498
25e874e6-2ca7-4760-bdd3-08f7aa5a2f34	6ab49a23-e8a7-420d-8007-94c20201bbf9	WILDLIFE_MEDICINE	Wildlife Medicine	\N	9	t	t	2026-08-06 19:11:07.672	2026-10-13 08:08:05.499
8c746137-c4ff-41c4-b869-f93ff574b58b	6ab49a23-e8a7-420d-8007-94c20201bbf9	ZOO_MEDICINE	Zoo Medicine	\N	10	t	t	2026-08-06 19:11:07.672	2026-10-13 08:08:05.499
a9192f6f-a676-4672-b535-dbfc168e2ff9	6ab49a23-e8a7-420d-8007-94c20201bbf9	VETERINARY_SURGERY	Veterinary Surgery	\N	11	t	t	2026-08-06 19:11:07.673	2026-10-13 08:08:05.5
d6d41420-4fc7-45af-b744-22a8edb1932e	6ab49a23-e8a7-420d-8007-94c20201bbf9	VETERINARY_ORTHOPEDICS	Veterinary Orthopedics	\N	12	t	t	2026-08-06 19:11:07.673	2026-10-13 08:08:05.5
af8e61a5-6c43-45d5-a885-a0f2259c5f21	6ab49a23-e8a7-420d-8007-94c20201bbf9	VETERINARY_DERMATOLOGY	Veterinary Dermatology	\N	13	t	t	2026-08-06 19:11:07.674	2026-10-13 08:08:05.5
b62b949c-fa73-4e0e-b8f7-918596146442	6ab49a23-e8a7-420d-8007-94c20201bbf9	VETERINARY_CARDIOLOGY	Veterinary Cardiology	\N	14	t	t	2026-08-06 19:11:07.674	2026-10-13 08:08:05.501
3c09c604-239f-4465-a176-830f74632975	6ab49a23-e8a7-420d-8007-94c20201bbf9	VETERINARY_DENTISTRY	Veterinary Dentistry	\N	15	t	t	2026-08-06 19:11:07.675	2026-10-13 08:08:05.501
08095505-99ca-4b0f-86f5-bdfc83bb2189	6ab49a23-e8a7-420d-8007-94c20201bbf9	VETERINARY_ONCOLOGY	Veterinary Oncology	\N	16	t	t	2026-08-06 19:11:07.675	2026-10-13 08:08:05.502
f63d3318-6d5a-4490-abcb-78604191f1c1	6ab49a23-e8a7-420d-8007-94c20201bbf9	VETERINARY_NEUROLOGY	Veterinary Neurology	\N	17	t	t	2026-08-06 19:11:07.675	2026-10-13 08:08:05.502
50398854-6f34-4c77-93f6-0c17eef2fb1e	6ab49a23-e8a7-420d-8007-94c20201bbf9	VETERINARY_EMERGENCY_AND_CRITICAL_CARE	Veterinary Emergency & Critical Care	\N	18	t	t	2026-08-06 19:11:07.676	2026-10-13 08:08:05.503
0de6a29e-52c2-4cab-a535-8ea20fcc1fae	6ab49a23-e8a7-420d-8007-94c20201bbf9	VETERINARY_RADIOLOGY	Veterinary Radiology	\N	19	t	t	2026-08-06 19:11:07.676	2026-10-13 08:08:05.503
0e8576f6-40f2-4fd6-9a2d-ebfbae7692b6	6ab49a23-e8a7-420d-8007-94c20201bbf9	VETERINARY_PATHOLOGY	Veterinary Pathology	\N	20	t	t	2026-08-06 19:11:07.677	2026-10-13 08:08:05.504
5fcffa78-3534-4d25-bb50-27654b7728cb	6ab49a23-e8a7-420d-8007-94c20201bbf9	ANIMAL_REHABILITATION	Animal Rehabilitation	\N	21	t	t	2026-08-06 19:11:07.677	2026-10-13 08:08:05.504
44b8ef27-51cd-4223-bf2e-36cbf07676f1	6ab49a23-e8a7-420d-8007-94c20201bbf9	PREVENTIVE_VETERINARY_MEDICINE	Preventive Veterinary Medicine	\N	22	t	t	2026-08-06 19:11:07.678	2026-10-13 08:08:05.505
4530696d-7327-48d3-9b4d-01af10f7e2a7	5ef46dc4-127c-4ba5-9627-ce1c0e699393	INTERNAL_MEDICINE	Internal Medicine	\N	1	t	t	2026-10-13 07:58:09.497	2026-10-13 08:08:05.543
37b7f35a-132b-4320-864a-abbb0d336eb1	5ef46dc4-127c-4ba5-9627-ce1c0e699393	FAMILY_MEDICINE	Family Medicine	\N	2	t	t	2026-10-13 07:58:09.498	2026-10-13 08:08:05.543
412ac785-40b8-41da-a9bf-7e0c8b1b1362	5ef46dc4-127c-4ba5-9627-ce1c0e699393	GERIATRIC_MEDICINE	Geriatric Medicine	\N	3	t	t	2026-10-13 07:58:09.499	2026-10-13 08:08:05.544
ba86c19d-07e5-49fd-8e93-c2c5a570af63	5ef46dc4-127c-4ba5-9627-ce1c0e699393	PREVENTIVE_MEDICINE	Preventive Medicine	\N	4	t	t	2026-10-13 07:58:09.5	2026-10-13 08:08:05.544
faa46c50-ddc6-4586-b345-75ca3e1d3786	38da9b66-c8d8-4d2b-b20c-61efd4a8e78b	INTERVENTIONAL_CARDIOLOGY	Interventional Cardiology	\N	1	t	t	2026-10-13 07:58:09.501	2026-10-13 08:08:05.545
affe0a8e-8840-4914-9108-1ba2845a90dd	38da9b66-c8d8-4d2b-b20c-61efd4a8e78b	NON_INVASIVE_CARDIOLOGY	Non-invasive Cardiology	\N	2	t	t	2026-10-13 07:58:09.502	2026-10-13 08:08:05.545
2098b681-d6c4-4378-8da0-88e0e293c3b9	38da9b66-c8d8-4d2b-b20c-61efd4a8e78b	ELECTROPHYSIOLOGY	Electrophysiology	\N	3	t	t	2026-10-13 07:58:09.503	2026-10-13 08:08:05.546
11d574b8-f48d-4131-a175-5596d4bff3ec	38da9b66-c8d8-4d2b-b20c-61efd4a8e78b	CARDIAC_IMAGING	Cardiac Imaging	\N	4	t	t	2026-10-13 07:58:09.504	2026-10-13 08:08:05.546
598f346f-fddc-4c7b-9d4f-44e2242e46c0	38da9b66-c8d8-4d2b-b20c-61efd4a8e78b	HEART_FAILURE	Heart Failure	\N	5	t	t	2026-10-13 07:58:09.504	2026-10-13 08:08:05.546
9f7fa472-7cdf-4564-a9d6-63084b2b1a8e	155159c7-f651-435b-997c-4768ba17089d	CLINICAL_NEUROLOGY	Clinical Neurology	\N	1	t	t	2026-10-13 07:58:09.505	2026-10-13 08:08:05.547
39ca31f4-a06e-48db-b4e2-2afc390ffe46	155159c7-f651-435b-997c-4768ba17089d	STROKE_MEDICINE	Stroke Medicine	\N	2	t	t	2026-10-13 07:58:09.506	2026-10-13 08:08:05.547
0f6685cb-69d1-44df-93d1-88cf14fd9f9d	155159c7-f651-435b-997c-4768ba17089d	EPILEPSY	Epilepsy	\N	3	t	t	2026-10-13 07:58:09.507	2026-10-13 08:08:05.548
def843c1-572f-45fe-b686-042276cc0355	155159c7-f651-435b-997c-4768ba17089d	NEUROMUSCULAR_MEDICINE	Neuromuscular Medicine	\N	4	t	t	2026-10-13 07:58:09.508	2026-10-13 08:08:05.548
9116eb17-9d3d-4933-a76d-3d5e1703a5a1	155159c7-f651-435b-997c-4768ba17089d	MOVEMENT_DISORDERS	Movement Disorders	\N	5	t	t	2026-10-13 07:58:09.508	2026-10-13 08:08:05.548
25166d0c-78ed-45a1-a9c3-a0b64d3ccd15	cd00d903-4c25-4d9b-803f-330e0bc916c0	JOINT_REPLACEMENT	Joint Replacement	\N	1	t	t	2026-10-13 07:58:09.509	2026-10-13 08:08:05.549
1b02012f-d63c-488d-9145-e610b9c0e49b	cd00d903-4c25-4d9b-803f-330e0bc916c0	SPINE_SURGERY	Spine Surgery	\N	2	t	t	2026-10-13 07:58:09.51	2026-10-13 08:08:05.549
3c400d80-1e61-4795-84d7-cf300bcd1c04	cd00d903-4c25-4d9b-803f-330e0bc916c0	SPORTS_MEDICINE	Sports Medicine	\N	3	t	t	2026-10-13 07:58:09.511	2026-10-13 08:08:05.55
62a648bd-bdb4-4a35-8890-efa6d1e833e9	cd00d903-4c25-4d9b-803f-330e0bc916c0	TRAUMA_SURGERY	Trauma Surgery	\N	4	t	t	2026-10-13 07:58:09.511	2026-10-13 08:08:05.55
2142662c-4aa9-415f-9fbd-13dc05df131d	cd00d903-4c25-4d9b-803f-330e0bc916c0	PEDIATRIC_ORTHOPEDICS	Pediatric Orthopedics	\N	5	t	t	2026-10-13 07:58:09.512	2026-10-13 08:08:05.55
54c9098f-9637-47b0-95d0-4cd6ce076362	cd00d903-4c25-4d9b-803f-330e0bc916c0	HAND_SURGERY	Hand Surgery	\N	6	t	t	2026-10-13 07:58:09.513	2026-10-13 08:08:05.551
438c77af-fe76-4417-a11c-83f0df52e41d	cd00d903-4c25-4d9b-803f-330e0bc916c0	FOOT_AND_ANKLE_SURGERY	Foot & Ankle Surgery	\N	7	t	t	2026-10-13 07:58:09.513	2026-10-13 08:08:05.551
4ff73768-75e6-4c59-a56f-f8f1e63b1c5c	94542a63-a144-48c1-8e64-03f0ecb6783e	VETERINARY_PATHOLOGY	Veterinary Pathology	\N	20	t	t	2026-10-13 08:02:50.035	2026-10-13 08:08:05.804
0d74fa04-c47b-4e8f-b6f3-a0783bcfcfa9	94542a63-a144-48c1-8e64-03f0ecb6783e	ANIMAL_REHABILITATION	Animal Rehabilitation	\N	21	t	t	2026-10-13 08:02:50.038	2026-10-13 08:08:05.804
3132ff02-f3ad-4301-bb11-1533da46dddf	94542a63-a144-48c1-8e64-03f0ecb6783e	PREVENTIVE_VETERINARY_MEDICINE	Preventive Veterinary Medicine	\N	22	t	t	2026-10-13 08:02:50.041	2026-10-13 08:08:05.805
71b8b4e5-dcbf-4924-957a-6dc7a5adba2b	f46e98a8-bf8f-41f3-81e8-dbc5fcdcac85	INTERNAL_MEDICINE	Internal Medicine	\N	1	t	t	2026-08-06 19:11:07.6	2026-10-13 08:08:05.435
9f7ce7a3-0c7e-4bf5-b482-04b54f5b5339	f46e98a8-bf8f-41f3-81e8-dbc5fcdcac85	FAMILY_MEDICINE	Family Medicine	\N	2	t	t	2026-08-06 19:11:07.602	2026-10-13 08:08:05.436
e093c3b4-767b-426c-afe5-604dbeb0a96f	f46e98a8-bf8f-41f3-81e8-dbc5fcdcac85	GERIATRIC_MEDICINE	Geriatric Medicine	\N	3	t	t	2026-08-06 19:11:07.602	2026-10-13 08:08:05.436
6f3a3d15-f9d0-4489-b117-4f9b32bac6f5	f46e98a8-bf8f-41f3-81e8-dbc5fcdcac85	PREVENTIVE_MEDICINE	Preventive Medicine	\N	4	t	t	2026-08-06 19:11:07.603	2026-10-13 08:08:05.437
53130bdc-236d-4b80-8fd3-a300a01b365f	fa9223cc-5ecd-43fa-9fdd-5e06dd85d0fa	INTERVENTIONAL_CARDIOLOGY	Interventional Cardiology	\N	1	t	t	2026-08-06 19:11:07.603	2026-10-13 08:08:05.437
fc66a773-f49d-460f-92d8-f86b61e3ed5c	fa9223cc-5ecd-43fa-9fdd-5e06dd85d0fa	NON_INVASIVE_CARDIOLOGY	Non-invasive Cardiology	\N	2	t	t	2026-08-06 19:11:07.604	2026-10-13 08:08:05.438
769ac502-2715-4e96-a656-65b69b0faa39	fa9223cc-5ecd-43fa-9fdd-5e06dd85d0fa	ELECTROPHYSIOLOGY	Electrophysiology	\N	3	t	t	2026-08-06 19:11:07.605	2026-10-13 08:08:05.438
3ec16cc9-8967-4989-b330-9eb7c9a50548	fa9223cc-5ecd-43fa-9fdd-5e06dd85d0fa	CARDIAC_IMAGING	Cardiac Imaging	\N	4	t	t	2026-08-06 19:11:07.605	2026-10-13 08:08:05.439
92e7c7a2-020b-4f7c-b875-3ac2295623b9	4b857bfe-830b-4ff2-a298-6be709034534	CLINICAL_NEUROLOGY	Clinical Neurology	\N	1	t	t	2026-08-06 19:11:07.606	2026-10-13 08:08:05.44
4a378777-d850-4ccf-9298-dfcf15d3209b	4b857bfe-830b-4ff2-a298-6be709034534	STROKE_MEDICINE	Stroke Medicine	\N	2	t	t	2026-08-06 19:11:07.607	2026-10-13 08:08:05.44
f2787921-adc2-4d48-838e-550ed116ce4f	4b857bfe-830b-4ff2-a298-6be709034534	EPILEPSY	Epilepsy	\N	3	t	t	2026-08-06 19:11:07.607	2026-10-13 08:08:05.44
d2877ed5-4937-4a4d-8608-dfa3ea968b71	4b857bfe-830b-4ff2-a298-6be709034534	NEUROMUSCULAR_MEDICINE	Neuromuscular Medicine	\N	4	t	t	2026-08-06 19:11:07.608	2026-10-13 08:08:05.441
b7ccf378-a4ec-4808-953f-403d07a770be	4b857bfe-830b-4ff2-a298-6be709034534	MOVEMENT_DISORDERS	Movement Disorders	\N	5	t	t	2026-08-06 19:11:07.608	2026-10-13 08:08:05.441
0ee734a4-b4bc-48e2-ace4-8a28d480e406	1c588d86-37e2-4fb1-bb04-126a3bd683df	JOINT_REPLACEMENT	Joint Replacement	\N	1	t	t	2026-08-06 19:11:07.609	2026-10-13 08:08:05.442
5da6be33-3800-409e-b135-1965ce4360ca	1c588d86-37e2-4fb1-bb04-126a3bd683df	SPINE_SURGERY	Spine Surgery	\N	2	t	t	2026-08-06 19:11:07.609	2026-10-13 08:08:05.442
2db19c3a-029c-4aba-b931-3aae0dfff64f	1c588d86-37e2-4fb1-bb04-126a3bd683df	SPORTS_MEDICINE	Sports Medicine	\N	3	t	t	2026-08-06 19:11:07.61	2026-10-13 08:08:05.443
4da81992-173a-440c-b9c0-6121b0e4449b	1c588d86-37e2-4fb1-bb04-126a3bd683df	TRAUMA_SURGERY	Trauma Surgery	\N	4	t	t	2026-08-06 19:11:07.61	2026-10-13 08:08:05.443
352e7de7-6468-4c6d-94c2-63cf6b8b2572	1c588d86-37e2-4fb1-bb04-126a3bd683df	PEDIATRIC_ORTHOPEDICS	Pediatric Orthopedics	\N	5	t	t	2026-08-06 19:11:07.611	2026-10-13 08:08:05.444
c3c721b8-5bad-4e2a-8bca-6352d2a1ec85	1c588d86-37e2-4fb1-bb04-126a3bd683df	HAND_SURGERY	Hand Surgery	\N	6	t	t	2026-08-06 19:11:07.611	2026-10-13 08:08:05.444
5e749118-e8f7-49ac-bb49-cc2764b418dd	1c588d86-37e2-4fb1-bb04-126a3bd683df	FOOT_AND_ANKLE_SURGERY	Foot & Ankle Surgery	\N	7	t	t	2026-08-06 19:11:07.612	2026-10-13 08:08:05.445
0850677e-b39b-4c25-8388-79d7e59d3d39	1c588d86-37e2-4fb1-bb04-126a3bd683df	ORTHOPEDIC_ONCOLOGY	Orthopedic Oncology	\N	8	t	t	2026-08-06 19:11:07.612	2026-10-13 08:08:05.445
b6b220cd-33d5-4f27-ba36-a95594bec868	a8e9dc89-8342-4741-8878-c98b7a095be0	GENERAL_PEDIATRICS	General Pediatrics	\N	1	t	t	2026-08-06 19:11:07.612	2026-10-13 08:08:05.445
0f261ea7-223e-41d6-99ee-5d269e7cec45	a8e9dc89-8342-4741-8878-c98b7a095be0	NEONATOLOGY	Neonatology	\N	2	t	t	2026-08-06 19:11:07.613	2026-10-13 08:08:05.446
42c099c3-36d4-408d-abc6-886ef5c84bea	a8e9dc89-8342-4741-8878-c98b7a095be0	PEDIATRIC_CARDIOLOGY	Pediatric Cardiology	\N	3	t	t	2026-08-06 19:11:07.613	2026-10-13 08:08:05.446
02c3db19-604d-4f9c-9d99-d007e2850488	a8e9dc89-8342-4741-8878-c98b7a095be0	PEDIATRIC_NEUROLOGY	Pediatric Neurology	\N	4	t	t	2026-08-06 19:11:07.614	2026-10-13 08:08:05.447
3700e7a9-f2e6-492c-a68a-d133c812dc77	a8e9dc89-8342-4741-8878-c98b7a095be0	PEDIATRIC_ENDOCRINOLOGY	Pediatric Endocrinology	\N	5	t	t	2026-08-06 19:11:07.614	2026-10-13 08:08:05.447
467a490a-331b-4662-9356-099e7817ba94	a8e9dc89-8342-4741-8878-c98b7a095be0	PEDIATRIC_GASTROENTEROLOGY	Pediatric Gastroenterology	\N	6	t	t	2026-08-06 19:11:07.615	2026-10-13 08:08:05.448
a59046d7-10eb-4e5b-abc1-5b03fd0ed9dc	a8e9dc89-8342-4741-8878-c98b7a095be0	PEDIATRIC_PULMONOLOGY	Pediatric Pulmonology	\N	7	t	t	2026-08-06 19:11:07.615	2026-10-13 08:08:05.448
5541262f-02b6-455a-aa9d-e78a121dfe40	a8e9dc89-8342-4741-8878-c98b7a095be0	PEDIATRIC_INTENSIVE_CARE	Pediatric Intensive Care	\N	8	t	t	2026-08-06 19:11:07.616	2026-10-13 08:08:05.448
6ac2458f-0f57-4eb4-bcda-155861ab7abb	dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	OBSTETRICS	Obstetrics	\N	1	t	t	2026-08-06 19:11:07.616	2026-10-13 08:08:05.449
c9d8e71a-df04-47c6-87e1-57335b6ca92a	dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	GYNECOLOGY	Gynecology	\N	2	t	t	2026-08-06 19:11:07.617	2026-10-13 08:08:05.449
ba33b0c5-3148-49f5-a306-7beb2eac752f	dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	MATERNAL_AND_FETAL_MEDICINE	Maternal & Fetal Medicine	\N	3	t	t	2026-08-06 19:11:07.617	2026-10-13 08:08:05.45
443a3afb-5152-41de-902d-6802fdd36e6d	dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	REPRODUCTIVE_MEDICINE	Reproductive Medicine	\N	4	t	t	2026-08-06 19:11:07.618	2026-10-13 08:08:05.45
c3bff5b9-cd55-4829-b232-2737ef0b6229	dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	GYNECOLOGIC_ONCOLOGY	Gynecologic Oncology	\N	5	t	t	2026-08-06 19:11:07.618	2026-10-13 08:08:05.451
9bae518b-b45c-4147-9793-e8220146e917	dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	UROGYNECOLOGY	Urogynecology	\N	6	t	t	2026-08-06 19:11:07.619	2026-10-13 08:08:05.451
d1b8850d-8b78-4ef3-b76f-2cf71c0a682a	dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	INFERTILITY	Infertility	\N	7	t	t	2026-08-06 19:11:07.619	2026-10-13 08:08:05.451
c32ea0b3-54c0-4ae3-bf27-13ced94ee5b3	dc0cb104-ad22-44ba-8cce-0f9d13ff64b0	HIGH_RISK_PREGNANCY	High-risk Pregnancy	\N	8	t	t	2026-08-06 19:11:07.62	2026-10-13 08:08:05.452
d5ffe1eb-8790-49e0-98e2-08412c5d1ef5	9af408a7-ca74-4286-a830-93af3fda2909	CLINICAL_DERMATOLOGY	Clinical Dermatology	\N	1	t	t	2026-08-06 19:11:07.62	2026-10-13 08:08:05.452
2fd27a6b-fdc4-420e-90ab-5c90fb28d0c9	9af408a7-ca74-4286-a830-93af3fda2909	COSMETIC_DERMATOLOGY	Cosmetic Dermatology	\N	2	t	t	2026-08-06 19:11:07.62	2026-10-13 08:08:05.453
07b9f6c5-82e3-4616-93a8-fbd415880dd7	9af408a7-ca74-4286-a830-93af3fda2909	DERMATOSURGERY	Dermatosurgery	\N	3	t	t	2026-08-06 19:11:07.621	2026-10-13 08:08:05.453
09dc29ad-1cdf-4e0f-a2d4-4fe8dcf50469	9af408a7-ca74-4286-a830-93af3fda2909	PEDIATRIC_DERMATOLOGY	Pediatric Dermatology	\N	4	t	t	2026-08-06 19:11:07.621	2026-10-13 08:08:05.454
fdbdf90f-6c2b-4565-bf71-7768953233f9	9af408a7-ca74-4286-a830-93af3fda2909	TRICHOLOGY	Trichology	\N	5	t	t	2026-08-06 19:11:07.622	2026-10-13 08:08:05.454
d7b5484c-1c2f-482f-8d4f-c0fcae3bdf71	502cb19e-65ee-4abf-80ab-5c360c4f6bc9	CATARACT_SURGERY	Cataract Surgery	\N	1	t	t	2026-08-06 19:11:07.622	2026-10-13 08:08:05.454
d19649a1-3bbe-4493-aa3c-cce2b6600188	502cb19e-65ee-4abf-80ab-5c360c4f6bc9	RETINA	Retina	\N	2	t	t	2026-08-06 19:11:07.623	2026-10-13 08:08:05.455
a6af4398-e5a0-4b33-8d3a-aafce6abe516	502cb19e-65ee-4abf-80ab-5c360c4f6bc9	CORNEA	Cornea	\N	3	t	t	2026-08-06 19:11:07.623	2026-10-13 08:08:05.455
3f963dd0-207c-4619-83ab-bcdadcccd976	502cb19e-65ee-4abf-80ab-5c360c4f6bc9	GLAUCOMA	Glaucoma	\N	4	t	t	2026-08-06 19:11:07.624	2026-10-13 08:08:05.456
65c2e5ba-08e6-4e1d-93e7-9e6b8b596c77	502cb19e-65ee-4abf-80ab-5c360c4f6bc9	PEDIATRIC_OPHTHALMOLOGY	Pediatric Ophthalmology	\N	5	t	t	2026-08-06 19:11:07.624	2026-10-13 08:08:05.456
24cc88a2-b6f1-45b8-8a5d-555c1865856e	502cb19e-65ee-4abf-80ab-5c360c4f6bc9	OCULOPLASTY	Oculoplasty	\N	6	t	t	2026-08-06 19:11:07.624	2026-10-13 08:08:05.456
ee681c5c-1b53-4dd3-a430-680789206fe4	575101e5-40e0-45ce-b65c-a90cfcb18b6e	OTOLOGY	Otology	\N	1	t	t	2026-08-06 19:11:07.625	2026-10-13 08:08:05.457
9e93d6dd-3aa8-402f-8464-e77f2e28af8b	575101e5-40e0-45ce-b65c-a90cfcb18b6e	RHINOLOGY	Rhinology	\N	2	t	t	2026-08-06 19:11:07.626	2026-10-13 08:08:05.457
dce04821-10f7-4d7d-b78d-32b8d5332bf6	575101e5-40e0-45ce-b65c-a90cfcb18b6e	LARYNGOLOGY	Laryngology	\N	3	t	t	2026-08-06 19:11:07.626	2026-10-13 08:08:05.458
3dd93a31-ec85-4b77-ae71-8243312bbb7e	575101e5-40e0-45ce-b65c-a90cfcb18b6e	HEAD_AND_NECK_SURGERY	Head & Neck Surgery	\N	4	t	t	2026-08-06 19:11:07.626	2026-10-13 08:08:05.458
8204441f-6aaa-4553-882a-2b481e62faef	575101e5-40e0-45ce-b65c-a90cfcb18b6e	AUDIOLOGY	Audiology	\N	5	t	t	2026-08-06 19:11:07.627	2026-10-13 08:08:05.458
68eac97e-9e8b-43d5-975d-94a676d96a29	a23a6fcf-36f4-482a-8338-41f16c335b40	ADULT_PSYCHIATRY	Adult Psychiatry	\N	1	t	t	2026-08-06 19:11:07.627	2026-10-13 08:08:05.459
70928f63-c1f9-472e-8d19-5dedc38eb4e4	a23a6fcf-36f4-482a-8338-41f16c335b40	CHILD_PSYCHIATRY	Child Psychiatry	\N	2	t	t	2026-08-06 19:11:07.628	2026-10-13 08:08:05.459
29a2acb6-a5a0-47f6-8ece-55a993098867	a23a6fcf-36f4-482a-8338-41f16c335b40	ADDICTION_MEDICINE	Addiction Medicine	\N	3	t	t	2026-08-06 19:11:07.628	2026-10-13 08:08:05.46
11c7b703-3ead-492d-bb20-0ddcf0562d23	a23a6fcf-36f4-482a-8338-41f16c335b40	GERIATRIC_PSYCHIATRY	Geriatric Psychiatry	\N	4	t	t	2026-08-06 19:11:07.629	2026-10-13 08:08:05.46
d79a20f3-1a8f-41e3-93b2-38d1e869b0a7	a23a6fcf-36f4-482a-8338-41f16c335b40	CONSULTATION_LIAISON_PSYCHIATRY	Consultation Liaison Psychiatry	\N	5	t	t	2026-08-06 19:11:07.629	2026-10-13 08:08:05.461
169c66c5-86e2-4165-96d4-4f4e04ad2bbd	8b0ef4f0-4699-47c8-a0ef-13abcde15deb	SLEEP_MEDICINE	Sleep Medicine	\N	1	t	t	2026-08-06 19:11:07.63	2026-10-13 08:08:05.461
951e03af-335d-418c-b3e8-fee6b066f4c1	8b0ef4f0-4699-47c8-a0ef-13abcde15deb	CRITICAL_CARE_PULMONOLOGY	Critical Care Pulmonology	\N	2	t	t	2026-08-06 19:11:07.63	2026-10-13 08:08:05.461
f734e0d9-4455-493a-9a73-f46f2ddc5eaf	8b0ef4f0-4699-47c8-a0ef-13abcde15deb	INTERVENTIONAL_PULMONOLOGY	Interventional Pulmonology	\N	3	t	t	2026-08-06 19:11:07.631	2026-10-13 08:08:05.462
8f3a58fb-3d1d-41c8-913f-66dfee5b083b	8b0ef4f0-4699-47c8-a0ef-13abcde15deb	ASTHMA	Asthma	\N	4	t	t	2026-08-06 19:11:07.631	2026-10-13 08:08:05.462
4f55d791-b8e8-41f1-b638-5bb8ced4bc10	8b0ef4f0-4699-47c8-a0ef-13abcde15deb	COPD	COPD	\N	5	t	t	2026-08-06 19:11:07.631	2026-10-13 08:08:05.463
ab57fd17-971a-4bb8-9db7-da807a62afbb	04e5bbaf-ea4d-41c4-8873-b5e4f6f28984	HEPATOLOGY	Hepatology	\N	1	t	t	2026-08-06 19:11:07.632	2026-10-13 08:08:05.463
86942091-8bac-45a1-86c3-0c39b6e35e9b	04e5bbaf-ea4d-41c4-8873-b5e4f6f28984	THERAPEUTIC_ENDOSCOPY	Therapeutic Endoscopy	\N	2	t	t	2026-08-06 19:11:07.632	2026-10-13 08:08:05.463
9b0cacf6-a1fb-4b7e-bd6e-184ba28bbbc3	04e5bbaf-ea4d-41c4-8873-b5e4f6f28984	INFLAMMATORY_BOWEL_DISEASE	Inflammatory Bowel Disease	\N	3	t	t	2026-08-06 19:11:07.633	2026-10-13 08:08:05.464
6bdc7b6e-574f-4d3e-8c60-d27617dd823e	04e5bbaf-ea4d-41c4-8873-b5e4f6f28984	PANCREATOLOGY	Pancreatology	\N	4	t	t	2026-08-06 19:11:07.633	2026-10-13 08:08:05.464
e5b93764-cbc7-45a1-890a-7c7de3ec2586	04e5bbaf-ea4d-41c4-8873-b5e4f6f28984	GI_MOTILITY	GI Motility	\N	5	t	t	2026-08-06 19:11:07.634	2026-10-13 08:08:05.464
c4dfd2b6-627e-407f-8d77-779260a805ea	f79f3504-0423-4df9-ab81-63a0495250b9	DIALYSIS	Dialysis	\N	1	t	t	2026-08-06 19:11:07.634	2026-10-13 08:08:05.465
e83da862-7763-4619-a565-06e71be1853c	f79f3504-0423-4df9-ab81-63a0495250b9	RENAL_TRANSPLANT	Renal Transplant	\N	2	t	t	2026-08-06 19:11:07.634	2026-10-13 08:08:05.465
539187de-18f1-47c9-b903-cc26ef130bc2	f79f3504-0423-4df9-ab81-63a0495250b9	CRITICAL_CARE_NEPHROLOGY	Critical Care Nephrology	\N	3	t	t	2026-08-06 19:11:07.635	2026-10-13 08:08:05.466
89cc05e6-1512-4c5d-bfa3-1f44c660cab8	f79f3504-0423-4df9-ab81-63a0495250b9	PEDIATRIC_NEPHROLOGY	Pediatric Nephrology	\N	4	t	t	2026-08-06 19:11:07.636	2026-10-13 08:08:05.466
86cddef3-2c37-4cd6-8dc9-58245c219cb3	bf9ddfbe-4570-47e0-bdc2-8a2fbe027d7b	ENDOUROLOGY	Endourology	\N	1	t	t	2026-08-06 19:11:07.636	2026-10-13 08:08:05.466
788abef5-fdb7-4f1b-9b3a-a0d917a660ef	bf9ddfbe-4570-47e0-bdc2-8a2fbe027d7b	UROLOGIC_ONCOLOGY	Urologic Oncology	\N	2	t	t	2026-08-06 19:11:07.636	2026-10-13 08:08:05.467
041b340a-5bb1-429a-ba8d-e4ce92e526b5	bf9ddfbe-4570-47e0-bdc2-8a2fbe027d7b	ANDROLOGY	Andrology	\N	3	t	t	2026-08-06 19:11:07.637	2026-10-13 08:08:05.467
3860582d-648b-47fe-9746-6c357f1ff856	bf9ddfbe-4570-47e0-bdc2-8a2fbe027d7b	FEMALE_UROLOGY	Female Urology	\N	4	t	t	2026-08-06 19:11:07.637	2026-10-13 08:08:05.468
6f69fea5-15c1-4c24-998f-24a2112a6ce7	bf9ddfbe-4570-47e0-bdc2-8a2fbe027d7b	PEDIATRIC_UROLOGY	Pediatric Urology	\N	5	t	t	2026-08-06 19:11:07.638	2026-10-13 08:08:05.468
1a722c77-ea5c-4b96-9bf8-f87c71bacc6b	a70c2898-e286-4f24-b4e6-baa8c1402971	MEDICAL_ONCOLOGY	Medical Oncology	\N	1	t	t	2026-08-06 19:11:07.638	2026-10-13 08:08:05.468
d55ca554-1b0d-4657-8b55-5e099fd64949	a70c2898-e286-4f24-b4e6-baa8c1402971	SURGICAL_ONCOLOGY	Surgical Oncology	\N	2	t	t	2026-08-06 19:11:07.639	2026-10-13 08:08:05.469
2813444f-6d6b-48b3-a2e9-ecdf671b1d4d	a70c2898-e286-4f24-b4e6-baa8c1402971	RADIATION_ONCOLOGY	Radiation Oncology	\N	3	t	t	2026-08-06 19:11:07.639	2026-10-13 08:08:05.469
f7c276be-c276-4fe9-be3b-ef86c4e51eab	a70c2898-e286-4f24-b4e6-baa8c1402971	HEMATOLOGIC_ONCOLOGY	Hematologic Oncology	\N	4	t	t	2026-08-06 19:11:07.64	2026-10-13 08:08:05.47
95a17f21-d335-4a6d-91b6-84c12a892630	a70c2898-e286-4f24-b4e6-baa8c1402971	PALLIATIVE_ONCOLOGY	Palliative Oncology	\N	5	t	t	2026-08-06 19:11:07.64	2026-10-13 08:08:05.47
a28e377b-44c4-456b-b28c-a53ff3101ea7	1a6bf34c-3822-40cc-9dde-9e9a2b5cbf01	DIABETES	Diabetes	\N	1	t	t	2026-08-06 19:11:07.64	2026-10-13 08:08:05.47
9cd9e274-ffd7-4f41-8b01-98362f074080	1a6bf34c-3822-40cc-9dde-9e9a2b5cbf01	THYROID_DISORDERS	Thyroid Disorders	\N	2	t	t	2026-08-06 19:11:07.641	2026-10-13 08:08:05.471
7a18e4b6-85d2-496d-8103-4423dfc3a67e	1a6bf34c-3822-40cc-9dde-9e9a2b5cbf01	PITUITARY_DISORDERS	Pituitary Disorders	\N	3	t	t	2026-08-06 19:11:07.641	2026-10-13 08:08:05.471
f9f08c81-2fd1-4ed1-a9f9-1400e255c5bc	1a6bf34c-3822-40cc-9dde-9e9a2b5cbf01	METABOLIC_DISORDERS	Metabolic Disorders	\N	4	t	t	2026-08-06 19:11:07.642	2026-10-13 08:08:05.471
949d3a80-3b8c-4d66-896f-8e57b53b24fc	1a6bf34c-3822-40cc-9dde-9e9a2b5cbf01	OSTEOPOROSIS	Osteoporosis	\N	5	t	t	2026-08-06 19:11:07.642	2026-10-13 08:08:05.472
c32758ec-f2ed-486f-89d4-41a68103c099	1f7ef252-e8ba-47d3-bcc4-fde3588089e4	TRAUMA_CARE	Trauma Care	\N	1	t	t	2026-08-06 19:11:07.642	2026-10-13 08:08:05.472
82a37a2e-73aa-4e45-85f7-5d119fdcca61	1f7ef252-e8ba-47d3-bcc4-fde3588089e4	TOXICOLOGY	Toxicology	\N	2	t	t	2026-08-06 19:11:07.643	2026-10-13 08:08:05.473
144e6c2c-d85c-445f-9e88-882c1009125f	1f7ef252-e8ba-47d3-bcc4-fde3588089e4	DISASTER_MEDICINE	Disaster Medicine	\N	3	t	t	2026-08-06 19:11:07.643	2026-10-13 08:08:05.473
e7bdab48-e81b-4bc2-9331-a82b6f35ab9a	1f7ef252-e8ba-47d3-bcc4-fde3588089e4	EMERGENCY_ULTRASOUND	Emergency Ultrasound	\N	4	t	t	2026-08-06 19:11:07.644	2026-10-13 08:08:05.474
38660968-a479-4096-9a79-7f1eb5ee36c7	aa833e8d-1b79-40bf-b923-2383f45ee290	ADULT_ICU	Adult ICU	\N	1	t	t	2026-08-06 19:11:07.644	2026-10-13 08:08:05.474
a9f99304-d0b2-4504-aa46-76a4545b1e44	aa833e8d-1b79-40bf-b923-2383f45ee290	CARDIAC_ICU	Cardiac ICU	\N	2	t	t	2026-08-06 19:11:07.645	2026-10-13 08:08:05.474
8856085d-49ed-4f47-bb29-2b8b916e5ada	aa833e8d-1b79-40bf-b923-2383f45ee290	NEURO_ICU	Neuro ICU	\N	3	t	t	2026-08-06 19:11:07.645	2026-10-13 08:08:05.475
c3139f35-db54-4dc2-81b1-2038c1e144cf	aa833e8d-1b79-40bf-b923-2383f45ee290	PEDIATRIC_ICU	Pediatric ICU	\N	4	t	t	2026-08-06 19:11:07.646	2026-10-13 08:08:05.475
9ae0f419-d985-4517-83a5-cd480043a55f	aa833e8d-1b79-40bf-b923-2383f45ee290	NEONATAL_ICU	Neonatal ICU	\N	5	t	t	2026-08-06 19:11:07.646	2026-10-13 08:08:05.476
260eb8ad-26ae-40fa-95cd-7f33b8c4dabb	c7de8d67-492d-4219-afa5-48fbccfb99f1	DIAGNOSTIC_RADIOLOGY	Diagnostic Radiology	\N	1	t	t	2026-08-06 19:11:07.647	2026-10-13 08:08:05.476
f9d28240-78a1-4e93-b157-e6538d14a1ff	c7de8d67-492d-4219-afa5-48fbccfb99f1	INTERVENTIONAL_RADIOLOGY	Interventional Radiology	\N	2	t	t	2026-08-06 19:11:07.647	2026-10-13 08:08:05.476
bced7c21-ba2c-49e2-819b-8a6d5b1366a0	c7de8d67-492d-4219-afa5-48fbccfb99f1	NEURORADIOLOGY	Neuroradiology	\N	3	t	t	2026-08-06 19:11:07.648	2026-10-13 08:08:05.477
41dc092c-f7dd-429e-8019-a99200e865ad	c7de8d67-492d-4219-afa5-48fbccfb99f1	MUSCULOSKELETAL_IMAGING	Musculoskeletal Imaging	\N	4	t	t	2026-08-06 19:11:07.648	2026-10-13 08:08:05.477
9f092afb-f3f3-4120-b378-4040f943fdd4	c7de8d67-492d-4219-afa5-48fbccfb99f1	BREAST_IMAGING	Breast Imaging	\N	5	t	t	2026-08-06 19:11:07.649	2026-10-13 08:08:05.477
71309509-bfd2-4660-8687-d792b86a96d9	c7de8d67-492d-4219-afa5-48fbccfb99f1	NUCLEAR_MEDICINE	Nuclear Medicine	\N	6	t	t	2026-08-06 19:11:07.649	2026-10-13 08:08:05.478
3afb2ad7-3292-4536-bb58-04c7d68251d7	5602036d-8abb-489d-828a-48526b50f48c	CLINICAL_PATHOLOGY	Clinical Pathology	\N	1	t	t	2026-08-06 19:11:07.65	2026-10-13 08:08:05.478
3b408d2d-98e0-4bf7-b56a-2d9d4999291a	5602036d-8abb-489d-828a-48526b50f48c	HISTOPATHOLOGY	Histopathology	\N	2	t	t	2026-08-06 19:11:07.65	2026-10-13 08:08:05.479
c8c31b51-1916-4bed-b92e-0584338dc301	5602036d-8abb-489d-828a-48526b50f48c	MICROBIOLOGY	Microbiology	\N	3	t	t	2026-08-06 19:11:07.651	2026-10-13 08:08:05.479
4325cbea-7624-4720-bdf3-2d66795975fd	5602036d-8abb-489d-828a-48526b50f48c	HEMATOLOGY	Hematology	\N	4	t	t	2026-08-06 19:11:07.651	2026-10-13 08:08:05.479
6aafb094-4158-4782-b35f-25fecafd0f54	5602036d-8abb-489d-828a-48526b50f48c	BIOCHEMISTRY	Biochemistry	\N	5	t	t	2026-08-06 19:11:07.652	2026-10-13 08:08:05.48
93dc6cd5-0a95-454a-aecd-30181d78e64b	5602036d-8abb-489d-828a-48526b50f48c	MOLECULAR_DIAGNOSTICS	Molecular Diagnostics	\N	6	t	t	2026-08-06 19:11:07.652	2026-10-13 08:08:05.48
dd63a464-3cc8-4b2c-858d-ab85a5ad8e66	5602036d-8abb-489d-828a-48526b50f48c	CYTOLOGY	Cytology	\N	7	t	t	2026-08-06 19:11:07.652	2026-10-13 08:08:05.481
50218673-a843-49d4-938a-e2a24f27f8f1	9b20acfd-af86-4659-9dbc-240e40ef4d13	CARDIAC_ANESTHESIA	Cardiac Anesthesia	\N	1	t	t	2026-08-06 19:11:07.653	2026-10-13 08:08:05.481
1c8d9dec-5c8f-439c-ad14-036dbda2d6e8	9b20acfd-af86-4659-9dbc-240e40ef4d13	NEURO_ANESTHESIA	Neuro Anesthesia	\N	2	t	t	2026-08-06 19:11:07.653	2026-10-13 08:08:05.481
4c67c8f1-d532-4cf6-a770-01adb49b98a4	9b20acfd-af86-4659-9dbc-240e40ef4d13	PEDIATRIC_ANESTHESIA	Pediatric Anesthesia	\N	3	t	t	2026-08-06 19:11:07.654	2026-10-13 08:08:05.482
0c13279b-6464-4e56-bd5a-d63bcd24987a	9b20acfd-af86-4659-9dbc-240e40ef4d13	PAIN_MEDICINE	Pain Medicine	\N	4	t	t	2026-08-06 19:11:07.654	2026-10-13 08:08:05.482
7077595c-5ffc-4cd9-8b0d-0b6e52f21458	9b20acfd-af86-4659-9dbc-240e40ef4d13	CRITICAL_CARE_ANESTHESIA	Critical Care Anesthesia	\N	5	t	t	2026-08-06 19:11:07.655	2026-10-13 08:08:05.483
14b56034-9857-4b37-be74-2f2769e41534	0f066d2e-27c5-4a46-8a3c-66f250570bd0	ORTHODONTICS	Orthodontics	\N	1	t	t	2026-08-06 19:11:07.655	2026-10-13 08:08:05.483
2d630856-2203-43b8-8d40-5770fc7a6bac	0f066d2e-27c5-4a46-8a3c-66f250570bd0	PROSTHODONTICS	Prosthodontics	\N	2	t	t	2026-08-06 19:11:07.656	2026-10-13 08:08:05.483
0fc1057c-f0fa-41ac-8936-207214d53462	0f066d2e-27c5-4a46-8a3c-66f250570bd0	PERIODONTICS	Periodontics	\N	3	t	t	2026-08-06 19:11:07.656	2026-10-13 08:08:05.484
635e8812-49e8-47e8-8f08-f761ec973c27	0f066d2e-27c5-4a46-8a3c-66f250570bd0	ENDODONTICS	Endodontics	\N	4	t	t	2026-08-06 19:11:07.657	2026-10-13 08:08:05.484
48edf507-896a-4260-8e2e-3e7fabc0e2a1	0f066d2e-27c5-4a46-8a3c-66f250570bd0	ORAL_SURGERY	Oral Surgery	\N	5	t	t	2026-08-06 19:11:07.657	2026-10-13 08:08:05.484
5fdc24f9-8fbc-4d9b-8470-405a0af12b5e	0f066d2e-27c5-4a46-8a3c-66f250570bd0	PEDIATRIC_DENTISTRY	Pediatric Dentistry	\N	6	t	t	2026-08-06 19:11:07.658	2026-10-13 08:08:05.485
0c0f2674-8a1b-4e89-9537-796f51be93c5	7b69bc96-ca0f-40bf-91f3-7d9149faef7f	MUSCULOSKELETAL_PHYSIOTHERAPY	Musculoskeletal Physiotherapy	\N	1	t	t	2026-08-06 19:11:07.658	2026-10-13 08:08:05.485
d0350a39-df1e-43e2-9393-1086f6ccb92a	7b69bc96-ca0f-40bf-91f3-7d9149faef7f	NEUROLOGICAL_REHABILITATION	Neurological Rehabilitation	\N	2	t	t	2026-08-06 19:11:07.659	2026-10-13 08:08:05.486
4b43ac12-35c9-4bc5-b5b4-f0f050d7673b	7b69bc96-ca0f-40bf-91f3-7d9149faef7f	SPORTS_REHABILITATION	Sports Rehabilitation	\N	3	t	t	2026-08-06 19:11:07.659	2026-10-13 08:08:05.486
97cf598e-debe-41f1-90ea-7f477b58937b	75731436-117e-433c-8622-3dfbed434233	INTERNAL_MEDICINE	Internal Medicine	\N	1	t	t	2026-10-13 08:00:23.03	2026-10-13 08:08:05.646
18c609e5-9d80-411f-bdb3-29d37bed43a0	7b69bc96-ca0f-40bf-91f3-7d9149faef7f	GERIATRIC_PHYSIOTHERAPY	Geriatric Physiotherapy	\N	4	t	t	2026-08-06 19:11:07.66	2026-10-13 08:08:05.487
93716cfb-c5cf-427f-b826-caf2c5fd778b	7b69bc96-ca0f-40bf-91f3-7d9149faef7f	PEDIATRIC_PHYSIOTHERAPY	Pediatric Physiotherapy	\N	5	t	t	2026-08-06 19:11:07.66	2026-10-13 08:08:05.487
5de96d58-0be9-4113-8a2e-734c475291a6	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	AYURVEDA	Ayurveda	\N	1	t	t	2026-08-06 19:11:07.661	2026-10-13 08:08:05.487
88b14a43-9651-4e95-82bf-fcb4fe39d1b4	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	HOMEOPATHY	Homeopathy	\N	2	t	t	2026-08-06 19:11:07.661	2026-10-13 08:08:05.488
de58f732-d1f8-4f2b-a04f-0af4545022fa	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	SIDDHA	Siddha	\N	3	t	t	2026-08-06 19:11:07.662	2026-10-13 08:08:05.488
870e867f-8e12-4f9b-a3fd-f4125cef86cd	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	UNANI	Unani	\N	4	t	t	2026-08-06 19:11:07.662	2026-10-13 08:08:05.489
7c7711cd-5195-4686-9324-f21f6a83ca29	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	YOGA_AND_NATUROPATHY	Yoga & Naturopathy	\N	5	t	t	2026-08-06 19:11:07.663	2026-10-13 08:08:05.489
83c71b7a-50cb-4515-a35a-38d696fff28b	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	PANCHAKARMA	Panchakarma	\N	6	t	t	2026-08-06 19:11:07.663	2026-10-13 08:08:05.49
53a4601a-e9e9-40eb-8e7a-a12127c10f55	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	AYURVEDIC_SURGERY	Ayurvedic Surgery	\N	7	t	t	2026-08-06 19:11:07.663	2026-10-13 08:08:05.49
3dee7209-5f76-4e0e-83d8-b4a744602c99	9f7aa4dd-1f16-4fe2-96aa-87fbabd03579	AYURVEDIC_NUTRITION	Ayurvedic Nutrition	\N	8	t	t	2026-08-06 19:11:07.664	2026-10-13 08:08:05.491
ccf26db6-c8ef-41ef-be37-8e72a37c4405	0308bcf6-b65a-4971-83b3-9be8585c7c2d	ACUPUNCTURE	Acupuncture	\N	1	t	t	2026-08-06 19:11:07.664	2026-10-13 08:08:05.491
58be48bd-2d30-4391-8497-2581dd2ceefe	0308bcf6-b65a-4971-83b3-9be8585c7c2d	ACUPRESSURE	Acupressure	\N	2	t	t	2026-08-06 19:11:07.665	2026-10-13 08:08:05.492
a1fac04f-15d9-49e2-8feb-b012675b6376	0308bcf6-b65a-4971-83b3-9be8585c7c2d	CUPPING_THERAPY	Cupping Therapy	\N	3	t	t	2026-08-06 19:11:07.665	2026-10-13 08:08:05.492
e0256f27-f125-49f8-b84e-5d14615f74b0	0308bcf6-b65a-4971-83b3-9be8585c7c2d	LIFESTYLE_MEDICINE	Lifestyle Medicine	\N	4	t	t	2026-08-06 19:11:07.666	2026-10-13 08:08:05.493
bc9e08a8-4f4a-45c8-bec1-fbf1f5169820	0308bcf6-b65a-4971-83b3-9be8585c7c2d	PAIN_MANAGEMENT	Pain Management	\N	5	t	t	2026-08-06 19:11:07.666	2026-10-13 08:08:05.493
b8f83ee7-2713-4a53-b132-ce6f1ebd70bd	0308bcf6-b65a-4971-83b3-9be8585c7c2d	MIND_BODY_MEDICINE	Mind Body Medicine	\N	6	t	t	2026-08-06 19:11:07.666	2026-10-13 08:08:05.494
b96d4ccd-3073-4b3d-a797-47bd81883061	0308bcf6-b65a-4971-83b3-9be8585c7c2d	MEDITATION_THERAPY	Meditation Therapy	\N	7	t	t	2026-08-06 19:11:07.667	2026-10-13 08:08:05.494
b8b52908-91a3-4f37-9419-68a517b8f174	0308bcf6-b65a-4971-83b3-9be8585c7c2d	FUNCTIONAL_MEDICINE	Functional Medicine	\N	8	t	t	2026-08-06 19:11:07.667	2026-10-13 08:08:05.494
b74f0227-38f3-4556-aeb5-f89468ba034f	0308bcf6-b65a-4971-83b3-9be8585c7c2d	CLINICAL_NUTRITION	Clinical Nutrition	\N	9	t	t	2026-08-06 19:11:07.668	2026-10-13 08:08:05.495
e919c7fe-820f-4fb3-951a-fda89f372854	6ab49a23-e8a7-420d-8007-94c20201bbf9	SMALL_ANIMAL_MEDICINE	Small Animal Medicine	\N	1	t	t	2026-08-06 19:11:07.668	2026-10-13 08:08:05.495
8315df1b-694d-4abc-8ed0-09d881dd3acf	6ab49a23-e8a7-420d-8007-94c20201bbf9	LARGE_ANIMAL_MEDICINE	Large Animal Medicine	\N	2	t	t	2026-08-06 19:11:07.669	2026-10-13 08:08:05.496
43f87f5a-8a65-4b2e-b199-dec9ade04e79	6ab49a23-e8a7-420d-8007-94c20201bbf9	COMPANION_ANIMAL_MEDICINE	Companion Animal Medicine	\N	3	t	t	2026-08-06 19:11:07.669	2026-10-13 08:08:05.496
e8c24d78-9a66-4d88-be19-9e26f50a599b	6ab49a23-e8a7-420d-8007-94c20201bbf9	CANINE_MEDICINE	Canine Medicine	\N	4	t	t	2026-08-06 19:11:07.67	2026-10-13 08:08:05.497
ded193f1-f92f-4787-be65-2a40e728e73a	6ab49a23-e8a7-420d-8007-94c20201bbf9	FELINE_MEDICINE	Feline Medicine	\N	5	t	t	2026-08-06 19:11:07.67	2026-10-13 08:08:05.497
14c0d7aa-7e4b-42e2-a277-8e6d3f7d6509	cd00d903-4c25-4d9b-803f-330e0bc916c0	ORTHOPEDIC_ONCOLOGY	Orthopedic Oncology	\N	8	t	t	2026-10-13 07:58:09.514	2026-10-13 08:08:05.552
7b9cd133-f853-472d-b968-559e89d3e38d	71f94d81-490c-4069-9988-31d6b4aaadd9	GENERAL_PEDIATRICS	General Pediatrics	\N	1	t	t	2026-10-13 07:58:09.515	2026-10-13 08:08:05.552
89a547fa-61a5-492e-8170-a43568112ed2	71f94d81-490c-4069-9988-31d6b4aaadd9	NEONATOLOGY	Neonatology	\N	2	t	t	2026-10-13 07:58:09.516	2026-10-13 08:08:05.552
334720e1-4f7e-4eae-b099-7582e36ad24f	71f94d81-490c-4069-9988-31d6b4aaadd9	PEDIATRIC_CARDIOLOGY	Pediatric Cardiology	\N	3	t	t	2026-10-13 07:58:09.517	2026-10-13 08:08:05.553
eac2e5a7-7e02-48dd-8669-d6a33be3018a	71f94d81-490c-4069-9988-31d6b4aaadd9	PEDIATRIC_NEUROLOGY	Pediatric Neurology	\N	4	t	t	2026-10-13 07:58:09.517	2026-10-13 08:08:05.553
0b60a90a-1205-46dd-9616-425f09bc6ebb	71f94d81-490c-4069-9988-31d6b4aaadd9	PEDIATRIC_ENDOCRINOLOGY	Pediatric Endocrinology	\N	5	t	t	2026-10-13 07:58:09.518	2026-10-13 08:08:05.554
db84cebd-a037-430d-bcfc-649821df2dec	71f94d81-490c-4069-9988-31d6b4aaadd9	PEDIATRIC_GASTROENTEROLOGY	Pediatric Gastroenterology	\N	6	t	t	2026-10-13 07:58:09.519	2026-10-13 08:08:05.554
1e30d494-12ab-4dc0-99eb-5b4b505f730c	71f94d81-490c-4069-9988-31d6b4aaadd9	PEDIATRIC_PULMONOLOGY	Pediatric Pulmonology	\N	7	t	t	2026-10-13 07:58:09.52	2026-10-13 08:08:05.554
6acb3563-b890-4235-87e3-40118eda9ef1	71f94d81-490c-4069-9988-31d6b4aaadd9	PEDIATRIC_INTENSIVE_CARE	Pediatric Intensive Care	\N	8	t	t	2026-10-13 07:58:09.521	2026-10-13 08:08:05.555
317a8d15-6360-4658-b030-7ebd6a426482	9bb1b527-5e5f-445c-8007-5c764196e856	OBSTETRICS	Obstetrics	\N	1	t	t	2026-10-13 07:58:09.522	2026-10-13 08:08:05.555
aea2dfd8-04d3-4fc4-b38d-a76b1451070c	9bb1b527-5e5f-445c-8007-5c764196e856	GYNECOLOGY	Gynecology	\N	2	t	t	2026-10-13 07:58:09.523	2026-10-13 08:08:05.556
25ee1de6-13a6-4148-8380-fdb6ff1e60fd	9bb1b527-5e5f-445c-8007-5c764196e856	MATERNAL_AND_FETAL_MEDICINE	Maternal & Fetal Medicine	\N	3	t	t	2026-10-13 07:58:09.525	2026-10-13 08:08:05.556
37be3e71-6fd0-4635-8fd4-ee6fc06c8e28	9bb1b527-5e5f-445c-8007-5c764196e856	REPRODUCTIVE_MEDICINE	Reproductive Medicine	\N	4	t	t	2026-10-13 07:58:09.525	2026-10-13 08:08:05.556
47b2796f-a46b-457e-b134-4e6d51f7b090	9bb1b527-5e5f-445c-8007-5c764196e856	GYNECOLOGIC_ONCOLOGY	Gynecologic Oncology	\N	5	t	t	2026-10-13 07:58:09.527	2026-10-13 08:08:05.557
81bcf82f-cdc1-4f07-b420-f3be4606eaea	9bb1b527-5e5f-445c-8007-5c764196e856	UROGYNECOLOGY	Urogynecology	\N	6	t	t	2026-10-13 07:58:09.528	2026-10-13 08:08:05.557
2635078a-8c71-4f52-a76c-4ca8454f2473	9bb1b527-5e5f-445c-8007-5c764196e856	INFERTILITY	Infertility	\N	7	t	t	2026-10-13 07:58:09.529	2026-10-13 08:08:05.558
dc1a11a0-a712-434d-adbb-7ab764e1db16	9bb1b527-5e5f-445c-8007-5c764196e856	HIGH_RISK_PREGNANCY	High-risk Pregnancy	\N	8	t	t	2026-10-13 07:58:09.53	2026-10-13 08:08:05.558
ad9eb617-c761-4b3f-9bc4-2ffccb4187c8	2d4ec760-5554-466e-99d3-239173d41b4c	CLINICAL_DERMATOLOGY	Clinical Dermatology	\N	1	t	t	2026-10-13 07:58:09.531	2026-10-13 08:08:05.558
fb8d35ed-c3b3-4bd7-8e33-90aba40d3984	2d4ec760-5554-466e-99d3-239173d41b4c	COSMETIC_DERMATOLOGY	Cosmetic Dermatology	\N	2	t	t	2026-10-13 07:58:09.532	2026-10-13 08:08:05.559
99c809f5-cf66-4fc9-9661-c59fadafcab1	2d4ec760-5554-466e-99d3-239173d41b4c	DERMATOSURGERY	Dermatosurgery	\N	3	t	t	2026-10-13 07:58:09.532	2026-10-13 08:08:05.559
06905a81-d073-4578-a4d9-b4d2f5aa8fcd	2d4ec760-5554-466e-99d3-239173d41b4c	PEDIATRIC_DERMATOLOGY	Pediatric Dermatology	\N	4	t	t	2026-10-13 07:58:09.533	2026-10-13 08:08:05.56
af4343a6-54a2-4b15-b2ca-24163e44407c	2d4ec760-5554-466e-99d3-239173d41b4c	TRICHOLOGY	Trichology	\N	5	t	t	2026-10-13 07:58:09.534	2026-10-13 08:08:05.56
94a10f90-2a99-4ee4-b93e-9597dcb8ae53	21080a0c-35b7-4e73-a2e3-2f8488f52200	CATARACT_SURGERY	Cataract Surgery	\N	1	t	t	2026-10-13 07:58:09.536	2026-10-13 08:08:05.56
a4a82e56-9fb2-4271-925a-c89fa79dfd4c	21080a0c-35b7-4e73-a2e3-2f8488f52200	RETINA	Retina	\N	2	t	t	2026-10-13 07:58:09.537	2026-10-13 08:08:05.561
dc173fae-3210-4d73-a8be-14d3bb6c0d37	21080a0c-35b7-4e73-a2e3-2f8488f52200	CORNEA	Cornea	\N	3	t	t	2026-10-13 07:58:09.538	2026-10-13 08:08:05.561
b1faeb81-2239-4ade-9e63-6f0f1fac8a4e	21080a0c-35b7-4e73-a2e3-2f8488f52200	GLAUCOMA	Glaucoma	\N	4	t	t	2026-10-13 07:58:09.539	2026-10-13 08:08:05.561
1065975d-83aa-4a2f-94a5-d30ab0f899f0	21080a0c-35b7-4e73-a2e3-2f8488f52200	PEDIATRIC_OPHTHALMOLOGY	Pediatric Ophthalmology	\N	5	t	t	2026-10-13 07:58:09.54	2026-10-13 08:08:05.562
809d9113-0472-427f-8d6c-e08902b04b67	21080a0c-35b7-4e73-a2e3-2f8488f52200	OCULOPLASTY	Oculoplasty	\N	6	t	t	2026-10-13 07:58:09.541	2026-10-13 08:08:05.562
3a6302c0-b901-4329-9afe-cab1acb0d228	585130da-ec68-42a1-8638-89e3c73673e7	OTOLOGY	Otology	\N	1	t	t	2026-10-13 07:58:09.542	2026-10-13 08:08:05.563
c6a0b601-3202-4859-8158-436f402629b5	585130da-ec68-42a1-8638-89e3c73673e7	RHINOLOGY	Rhinology	\N	2	t	t	2026-10-13 07:58:09.543	2026-10-13 08:08:05.563
cce25991-75ef-4db9-b32b-51c20c265460	585130da-ec68-42a1-8638-89e3c73673e7	LARYNGOLOGY	Laryngology	\N	3	t	t	2026-10-13 07:58:09.543	2026-10-13 08:08:05.563
f7c119e8-c941-4512-bfbd-50c6b60992d1	585130da-ec68-42a1-8638-89e3c73673e7	HEAD_AND_NECK_SURGERY	Head & Neck Surgery	\N	4	t	t	2026-10-13 07:58:09.544	2026-10-13 08:08:05.564
74b89f9a-14b5-400e-a389-c8fdb55a8b83	585130da-ec68-42a1-8638-89e3c73673e7	AUDIOLOGY	Audiology	\N	5	t	t	2026-10-13 07:58:09.545	2026-10-13 08:08:05.564
d4de54ed-e716-4bf6-854f-54ce49ca76fe	ae095c2b-b111-4924-abf3-59d1f99272cc	ADULT_PSYCHIATRY	Adult Psychiatry	\N	1	t	t	2026-10-13 07:58:09.546	2026-10-13 08:08:05.565
af1df3a6-0ba0-44c1-b9e1-4a01d5a01157	ae095c2b-b111-4924-abf3-59d1f99272cc	CHILD_PSYCHIATRY	Child Psychiatry	\N	2	t	t	2026-10-13 07:58:09.547	2026-10-13 08:08:05.565
3fb883b6-d81e-4f78-8b20-6c582e0096ff	ae095c2b-b111-4924-abf3-59d1f99272cc	ADDICTION_MEDICINE	Addiction Medicine	\N	3	t	t	2026-10-13 07:58:09.547	2026-10-13 08:08:05.565
67919682-73c8-4a3d-859a-057815b236b5	ae095c2b-b111-4924-abf3-59d1f99272cc	GERIATRIC_PSYCHIATRY	Geriatric Psychiatry	\N	4	t	t	2026-10-13 07:58:09.548	2026-10-13 08:08:05.566
7780d503-5fb5-46b2-b19c-ddbd6f633bbb	ae095c2b-b111-4924-abf3-59d1f99272cc	CONSULTATION_LIAISON_PSYCHIATRY	Consultation Liaison Psychiatry	\N	5	t	t	2026-10-13 07:58:09.549	2026-10-13 08:08:05.566
75227b2c-e0dc-455a-9d39-2af5a0cd5b9b	c83de349-d82f-4527-aeb1-e2e2f2e07bff	SLEEP_MEDICINE	Sleep Medicine	\N	1	t	t	2026-10-13 07:58:09.55	2026-10-13 08:08:05.566
6bc1278d-0b08-4f30-ae29-c68ec48d0a9e	c83de349-d82f-4527-aeb1-e2e2f2e07bff	CRITICAL_CARE_PULMONOLOGY	Critical Care Pulmonology	\N	2	t	t	2026-10-13 07:58:09.551	2026-10-13 08:08:05.567
a37740fe-f73d-45e5-a030-18a93057d377	c83de349-d82f-4527-aeb1-e2e2f2e07bff	INTERVENTIONAL_PULMONOLOGY	Interventional Pulmonology	\N	3	t	t	2026-10-13 07:58:09.552	2026-10-13 08:08:05.567
64052f31-089e-42e7-869d-b180c3c1fe1f	c83de349-d82f-4527-aeb1-e2e2f2e07bff	ASTHMA	Asthma	\N	4	t	t	2026-10-13 07:58:09.552	2026-10-13 08:08:05.568
b2fcf562-4ea4-444f-9cc1-8da912441eef	c83de349-d82f-4527-aeb1-e2e2f2e07bff	COPD	COPD	\N	5	t	t	2026-10-13 07:58:09.553	2026-10-13 08:08:05.568
fd7d370a-5cae-46dc-91d6-a2902f9cc75b	47f7dc6b-1965-4ff2-98fe-504b9c5c020e	HEPATOLOGY	Hepatology	\N	1	t	t	2026-10-13 07:58:09.554	2026-10-13 08:08:05.568
a2a0ed6b-cdae-40a1-a0e3-73eaf6ff3643	47f7dc6b-1965-4ff2-98fe-504b9c5c020e	THERAPEUTIC_ENDOSCOPY	Therapeutic Endoscopy	\N	2	t	t	2026-10-13 07:58:09.555	2026-10-13 08:08:05.569
a94c69bb-e199-4983-a545-b723352bf33c	47f7dc6b-1965-4ff2-98fe-504b9c5c020e	INFLAMMATORY_BOWEL_DISEASE	Inflammatory Bowel Disease	\N	3	t	t	2026-10-13 07:58:09.555	2026-10-13 08:08:05.569
2531db60-e5b0-4899-b8e7-084f34204299	47f7dc6b-1965-4ff2-98fe-504b9c5c020e	PANCREATOLOGY	Pancreatology	\N	4	t	t	2026-10-13 07:58:09.556	2026-10-13 08:08:05.57
2ea16a20-feb7-46d8-87f0-7a728c4568cb	47f7dc6b-1965-4ff2-98fe-504b9c5c020e	GI_MOTILITY	GI Motility	\N	5	t	t	2026-10-13 07:58:09.557	2026-10-13 08:08:05.57
31175105-ae25-4f77-9d12-cfbdb239aac3	2ea39a01-8a33-4412-adb9-cbcda29c8bfe	DIALYSIS	Dialysis	\N	1	t	t	2026-10-13 07:58:09.558	2026-10-13 08:08:05.57
b8ca2337-565a-44ac-a44d-59280032b4b2	2ea39a01-8a33-4412-adb9-cbcda29c8bfe	RENAL_TRANSPLANT	Renal Transplant	\N	2	t	t	2026-10-13 07:58:09.559	2026-10-13 08:08:05.571
c3a4564b-812d-4a81-8319-ba14f5ce4671	2ea39a01-8a33-4412-adb9-cbcda29c8bfe	CRITICAL_CARE_NEPHROLOGY	Critical Care Nephrology	\N	3	t	t	2026-10-13 07:58:09.559	2026-10-13 08:08:05.571
cf1158bc-584b-43d0-80b9-9ff5ddf6b42e	2ea39a01-8a33-4412-adb9-cbcda29c8bfe	PEDIATRIC_NEPHROLOGY	Pediatric Nephrology	\N	4	t	t	2026-10-13 07:58:09.56	2026-10-13 08:08:05.571
f4be6b9b-eddd-4462-9e5d-0c669d946346	8ed8b829-6914-4ec5-bd33-0bba7f165b97	ENDOUROLOGY	Endourology	\N	1	t	t	2026-10-13 07:58:09.561	2026-10-13 08:08:05.572
69921875-fc59-422e-9fa4-baa6a6dec6d2	8ed8b829-6914-4ec5-bd33-0bba7f165b97	UROLOGIC_ONCOLOGY	Urologic Oncology	\N	2	t	t	2026-10-13 07:58:09.562	2026-10-13 08:08:05.572
6b264aca-e7af-47ce-a2d9-0e1111860803	8ed8b829-6914-4ec5-bd33-0bba7f165b97	ANDROLOGY	Andrology	\N	3	t	t	2026-10-13 07:58:09.562	2026-10-13 08:08:05.573
c1d889f3-e175-4df3-9d50-522ca30465a7	8ed8b829-6914-4ec5-bd33-0bba7f165b97	FEMALE_UROLOGY	Female Urology	\N	4	t	t	2026-10-13 07:58:09.563	2026-10-13 08:08:05.573
c725404d-d82a-4ecb-916f-44336e24de17	8ed8b829-6914-4ec5-bd33-0bba7f165b97	PEDIATRIC_UROLOGY	Pediatric Urology	\N	5	t	t	2026-10-13 07:58:09.564	2026-10-13 08:08:05.573
7c6f1fe7-af91-4ec1-8f98-843ebc8d126c	48ad266b-e9d8-4864-bbb6-a7130663b915	MEDICAL_ONCOLOGY	Medical Oncology	\N	1	t	t	2026-10-13 07:58:09.565	2026-10-13 08:08:05.574
47b621d3-386b-4b13-b6d7-9884fb1bf76b	48ad266b-e9d8-4864-bbb6-a7130663b915	SURGICAL_ONCOLOGY	Surgical Oncology	\N	2	t	t	2026-10-13 07:58:09.565	2026-10-13 08:08:05.574
bedbbd72-2316-4599-bf2f-6fc8e2007a17	48ad266b-e9d8-4864-bbb6-a7130663b915	RADIATION_ONCOLOGY	Radiation Oncology	\N	3	t	t	2026-10-13 07:58:09.566	2026-10-13 08:08:05.575
b6ddfd29-d58c-4179-afc0-d1ac9f026fe8	48ad266b-e9d8-4864-bbb6-a7130663b915	HEMATOLOGIC_ONCOLOGY	Hematologic Oncology	\N	4	t	t	2026-10-13 07:58:09.567	2026-10-13 08:08:05.575
089b8da5-cf23-4758-8eee-1f3ddedb89e1	48ad266b-e9d8-4864-bbb6-a7130663b915	PALLIATIVE_ONCOLOGY	Palliative Oncology	\N	5	t	t	2026-10-13 07:58:09.568	2026-10-13 08:08:05.575
c022b210-889c-42d7-af4f-3de7c50997ff	5b819a8f-835c-447e-90db-831f62f3372c	DIABETES	Diabetes	\N	1	t	t	2026-10-13 07:58:09.569	2026-10-13 08:08:05.576
723e383b-c8a7-4efa-9a2e-e91fd4cc7ce3	5b819a8f-835c-447e-90db-831f62f3372c	THYROID_DISORDERS	Thyroid Disorders	\N	2	t	t	2026-10-13 07:58:09.57	2026-10-13 08:08:05.576
a4183b9e-3499-4564-8e33-aa82c64765b8	5b819a8f-835c-447e-90db-831f62f3372c	PITUITARY_DISORDERS	Pituitary Disorders	\N	3	t	t	2026-10-13 07:58:09.571	2026-10-13 08:08:05.576
8f90e5c8-3560-479f-bdee-2ba611ab8add	5b819a8f-835c-447e-90db-831f62f3372c	METABOLIC_DISORDERS	Metabolic Disorders	\N	4	t	t	2026-10-13 07:58:09.571	2026-10-13 08:08:05.577
fa73a090-d982-4fa6-b8ee-7f74ba149778	5b819a8f-835c-447e-90db-831f62f3372c	OSTEOPOROSIS	Osteoporosis	\N	5	t	t	2026-10-13 07:58:09.572	2026-10-13 08:08:05.577
7f8063d4-e11d-43ae-a92d-ca450e013eef	be199746-e7df-4d33-831b-ec273e7c8e02	TRAUMA_CARE	Trauma Care	\N	1	t	t	2026-10-13 07:58:09.573	2026-10-13 08:08:05.578
d02cac59-cc68-4088-bab1-7f56b738dccd	be199746-e7df-4d33-831b-ec273e7c8e02	TOXICOLOGY	Toxicology	\N	2	t	t	2026-10-13 07:58:09.574	2026-10-13 08:08:05.578
d8ee2498-f515-4aed-bbde-fcad680990cc	be199746-e7df-4d33-831b-ec273e7c8e02	DISASTER_MEDICINE	Disaster Medicine	\N	3	t	t	2026-10-13 07:58:09.574	2026-10-13 08:08:05.578
4427b581-f604-4db4-9869-9a1ade209fdb	be199746-e7df-4d33-831b-ec273e7c8e02	EMERGENCY_ULTRASOUND	Emergency Ultrasound	\N	4	t	t	2026-10-13 07:58:09.575	2026-10-13 08:08:05.579
565be128-4a16-46a9-bf00-822115423bab	68f6cd6c-55aa-4456-9257-e855d1174533	ADULT_ICU	Adult ICU	\N	1	t	t	2026-10-13 07:58:09.576	2026-10-13 08:08:05.579
e97ca9a9-2ca6-49e3-b98b-44af0d0c10d9	68f6cd6c-55aa-4456-9257-e855d1174533	CARDIAC_ICU	Cardiac ICU	\N	2	t	t	2026-10-13 07:58:09.577	2026-10-13 08:08:05.58
f38d5a9d-598b-41b5-a7f1-fe3d227faede	68f6cd6c-55aa-4456-9257-e855d1174533	NEURO_ICU	Neuro ICU	\N	3	t	t	2026-10-13 07:58:09.577	2026-10-13 08:08:05.58
2239a192-2ce1-4c68-9121-62e76a7b087b	68f6cd6c-55aa-4456-9257-e855d1174533	PEDIATRIC_ICU	Pediatric ICU	\N	4	t	t	2026-10-13 07:58:09.578	2026-10-13 08:08:05.58
d661bb9d-04d7-432a-8e04-b6a43ed4abb4	68f6cd6c-55aa-4456-9257-e855d1174533	NEONATAL_ICU	Neonatal ICU	\N	5	t	t	2026-10-13 07:58:09.579	2026-10-13 08:08:05.581
2b48076f-56d3-4e63-91f7-a2c85d404988	fc778883-d8ca-4334-aece-641cbd92dffd	DIAGNOSTIC_RADIOLOGY	Diagnostic Radiology	\N	1	t	t	2026-10-13 07:58:09.58	2026-10-13 08:08:05.581
eb394298-316b-47fa-827c-f18436367059	fc778883-d8ca-4334-aece-641cbd92dffd	INTERVENTIONAL_RADIOLOGY	Interventional Radiology	\N	2	t	t	2026-10-13 07:58:09.58	2026-10-13 08:08:05.581
58535bfa-f013-41c2-8150-2e57e214a6a4	fc778883-d8ca-4334-aece-641cbd92dffd	NEURORADIOLOGY	Neuroradiology	\N	3	t	t	2026-10-13 07:58:09.581	2026-10-13 08:08:05.582
37610baf-8f09-4c13-b219-d8a594ca7890	fc778883-d8ca-4334-aece-641cbd92dffd	MUSCULOSKELETAL_IMAGING	Musculoskeletal Imaging	\N	4	t	t	2026-10-13 07:58:09.582	2026-10-13 08:08:05.582
12568b31-e429-4cf2-84f8-e774bbd7dae0	fc778883-d8ca-4334-aece-641cbd92dffd	BREAST_IMAGING	Breast Imaging	\N	5	t	t	2026-10-13 07:58:09.582	2026-10-13 08:08:05.583
a8c5c72e-1553-45e5-95ce-5fb2846284ac	fc778883-d8ca-4334-aece-641cbd92dffd	NUCLEAR_MEDICINE	Nuclear Medicine	\N	6	t	t	2026-10-13 07:58:09.583	2026-10-13 08:08:05.583
ebd2ab8b-61d8-43fe-b7a0-5901486081e7	24fa769d-fa1b-4ff7-a98e-89662368932d	CLINICAL_PATHOLOGY	Clinical Pathology	\N	1	t	t	2026-10-13 07:58:09.584	2026-10-13 08:08:05.583
bc2d57f3-827d-47fc-85cf-45ab2144fcb8	24fa769d-fa1b-4ff7-a98e-89662368932d	HISTOPATHOLOGY	Histopathology	\N	2	t	t	2026-10-13 07:58:09.585	2026-10-13 08:08:05.584
14a04c1e-2164-4f87-be26-df62aaa7d9b5	24fa769d-fa1b-4ff7-a98e-89662368932d	MICROBIOLOGY	Microbiology	\N	3	t	t	2026-10-13 07:58:09.585	2026-10-13 08:08:05.584
cae730d7-f5c2-4d3c-9d53-01b9f3d3840f	24fa769d-fa1b-4ff7-a98e-89662368932d	HEMATOLOGY	Hematology	\N	4	t	t	2026-10-13 07:58:09.586	2026-10-13 08:08:05.585
05e17b48-e0bd-4069-8cbd-f1a4ab7ba090	24fa769d-fa1b-4ff7-a98e-89662368932d	BIOCHEMISTRY	Biochemistry	\N	5	t	t	2026-10-13 07:58:09.587	2026-10-13 08:08:05.585
dfe42a9c-1223-4eb0-9ffe-02ba05f506e0	24fa769d-fa1b-4ff7-a98e-89662368932d	MOLECULAR_DIAGNOSTICS	Molecular Diagnostics	\N	6	t	t	2026-10-13 07:58:09.587	2026-10-13 08:08:05.585
d2c3010e-e164-455e-9000-28236f7236f6	24fa769d-fa1b-4ff7-a98e-89662368932d	CYTOLOGY	Cytology	\N	7	t	t	2026-10-13 07:58:09.588	2026-10-13 08:08:05.586
c7aa84ef-25a8-49b0-9f8c-53c513c0ebc3	54541c64-2f48-4993-b407-1b5e4c64c11f	CARDIAC_ANESTHESIA	Cardiac Anesthesia	\N	1	t	t	2026-10-13 07:58:09.589	2026-10-13 08:08:05.586
ff3f7728-00df-4f7d-8fe9-f44532e34403	54541c64-2f48-4993-b407-1b5e4c64c11f	NEURO_ANESTHESIA	Neuro Anesthesia	\N	2	t	t	2026-10-13 07:58:09.59	2026-10-13 08:08:05.587
9e5a217a-259d-4431-ac1b-b9016ec42d22	54541c64-2f48-4993-b407-1b5e4c64c11f	PEDIATRIC_ANESTHESIA	Pediatric Anesthesia	\N	3	t	t	2026-10-13 07:58:09.591	2026-10-13 08:08:05.587
41716200-4211-47d3-b38e-7cc2053ea140	54541c64-2f48-4993-b407-1b5e4c64c11f	PAIN_MEDICINE	Pain Medicine	\N	4	t	t	2026-10-13 07:58:09.591	2026-10-13 08:08:05.588
0009bda8-ff51-4c05-81a9-c59ef6399495	54541c64-2f48-4993-b407-1b5e4c64c11f	CRITICAL_CARE_ANESTHESIA	Critical Care Anesthesia	\N	5	t	t	2026-10-13 07:58:09.592	2026-10-13 08:08:05.588
f0077e1c-9882-4a2f-9c04-a35cedc6f979	947c9334-0027-4557-bdf5-bfd754708c6b	ORTHODONTICS	Orthodontics	\N	1	t	t	2026-10-13 07:58:09.593	2026-10-13 08:08:05.589
9d20e600-a426-4945-b70c-3fdf76d20e71	947c9334-0027-4557-bdf5-bfd754708c6b	PROSTHODONTICS	Prosthodontics	\N	2	t	t	2026-10-13 07:58:09.594	2026-10-13 08:08:05.589
04db004e-fcad-410d-a049-259472f005ca	947c9334-0027-4557-bdf5-bfd754708c6b	PERIODONTICS	Periodontics	\N	3	t	t	2026-10-13 07:58:09.594	2026-10-13 08:08:05.589
09fd61ff-a98a-4fa0-af88-e0256ff82899	947c9334-0027-4557-bdf5-bfd754708c6b	ENDODONTICS	Endodontics	\N	4	t	t	2026-10-13 07:58:09.595	2026-10-13 08:08:05.59
00c129db-dae9-4fa8-9538-6548f666963c	947c9334-0027-4557-bdf5-bfd754708c6b	ORAL_SURGERY	Oral Surgery	\N	5	t	t	2026-10-13 07:58:09.596	2026-10-13 08:08:05.59
9744ae1e-93b2-4b28-8b74-4306e7dbf8b0	947c9334-0027-4557-bdf5-bfd754708c6b	PEDIATRIC_DENTISTRY	Pediatric Dentistry	\N	6	t	t	2026-10-13 07:58:09.597	2026-10-13 08:08:05.591
54ae8ccf-396e-42b9-8f3f-ef74aee7e304	7a3c787f-cdb7-4579-a8a9-4988ed559df8	MUSCULOSKELETAL_PHYSIOTHERAPY	Musculoskeletal Physiotherapy	\N	1	t	t	2026-10-13 07:58:09.597	2026-10-13 08:08:05.591
008f3e40-2b65-49b8-878f-7431a52984d7	7a3c787f-cdb7-4579-a8a9-4988ed559df8	NEUROLOGICAL_REHABILITATION	Neurological Rehabilitation	\N	2	t	t	2026-10-13 07:58:09.598	2026-10-13 08:08:05.591
21832906-b30c-4935-a7e8-db82764a5a06	7a3c787f-cdb7-4579-a8a9-4988ed559df8	SPORTS_REHABILITATION	Sports Rehabilitation	\N	3	t	t	2026-10-13 07:58:09.599	2026-10-13 08:08:05.592
693bd7e6-373e-4a9a-9e5d-0e9f338e2085	7a3c787f-cdb7-4579-a8a9-4988ed559df8	GERIATRIC_PHYSIOTHERAPY	Geriatric Physiotherapy	\N	4	t	t	2026-10-13 07:58:09.6	2026-10-13 08:08:05.592
de5d8183-f4b4-481d-9835-051c4eb86945	7a3c787f-cdb7-4579-a8a9-4988ed559df8	PEDIATRIC_PHYSIOTHERAPY	Pediatric Physiotherapy	\N	5	t	t	2026-10-13 07:58:09.601	2026-10-13 08:08:05.593
e1a0d0ec-af38-436c-ade6-1bcf932e0f94	a89aad0c-8942-4b31-aad5-033b2e6e8588	AYURVEDA	Ayurveda	\N	1	t	t	2026-10-13 07:58:09.602	2026-10-13 08:08:05.593
0f80b94b-3b3b-474a-b891-5948373a7c4b	a89aad0c-8942-4b31-aad5-033b2e6e8588	HOMEOPATHY	Homeopathy	\N	2	t	t	2026-10-13 07:58:09.603	2026-10-13 08:08:05.593
6dc436e6-a688-4cc1-8e71-05ffc094d6f6	a89aad0c-8942-4b31-aad5-033b2e6e8588	SIDDHA	Siddha	\N	3	t	t	2026-10-13 07:58:09.604	2026-10-13 08:08:05.594
526bcae9-8422-4872-996a-f41c2b4963a1	a89aad0c-8942-4b31-aad5-033b2e6e8588	UNANI	Unani	\N	4	t	t	2026-10-13 07:58:09.604	2026-10-13 08:08:05.594
2d40f85e-71da-498b-9b2b-0a79d531ab00	a89aad0c-8942-4b31-aad5-033b2e6e8588	YOGA_AND_NATUROPATHY	Yoga & Naturopathy	\N	5	t	t	2026-10-13 07:58:09.605	2026-10-13 08:08:05.594
2c7ee88f-9688-4734-9adf-57b9084ff803	a89aad0c-8942-4b31-aad5-033b2e6e8588	PANCHAKARMA	Panchakarma	\N	6	t	t	2026-10-13 07:58:09.606	2026-10-13 08:08:05.595
b36c520e-304b-4843-8fc5-b0256d2a2f32	a89aad0c-8942-4b31-aad5-033b2e6e8588	AYURVEDIC_SURGERY	Ayurvedic Surgery	\N	7	t	t	2026-10-13 07:58:09.607	2026-10-13 08:08:05.595
b4b06811-ea51-4445-8657-06589db52429	a89aad0c-8942-4b31-aad5-033b2e6e8588	AYURVEDIC_NUTRITION	Ayurvedic Nutrition	\N	8	t	t	2026-10-13 07:58:09.608	2026-10-13 08:08:05.596
ee48b9f1-a10b-4d86-9939-7d6647e1177b	07fac518-776a-4351-a046-1c7ad6a49786	ACUPUNCTURE	Acupuncture	\N	1	t	t	2026-10-13 07:58:09.609	2026-10-13 08:08:05.596
e1bce55d-42c1-484a-b8dc-3652ca53c66b	07fac518-776a-4351-a046-1c7ad6a49786	ACUPRESSURE	Acupressure	\N	2	t	t	2026-10-13 07:58:09.61	2026-10-13 08:08:05.597
8ac885f9-72ba-468e-8997-4bdf1c542c90	07fac518-776a-4351-a046-1c7ad6a49786	CUPPING_THERAPY	Cupping Therapy	\N	3	t	t	2026-10-13 07:58:09.61	2026-10-13 08:08:05.597
daaa8bf7-15ea-41b7-a93c-dc19d7f88abc	07fac518-776a-4351-a046-1c7ad6a49786	LIFESTYLE_MEDICINE	Lifestyle Medicine	\N	4	t	t	2026-10-13 07:58:09.611	2026-10-13 08:08:05.597
608f8b37-0d22-412e-9f65-55753e9c14b0	07fac518-776a-4351-a046-1c7ad6a49786	PAIN_MANAGEMENT	Pain Management	\N	5	t	t	2026-10-13 07:58:09.612	2026-10-13 08:08:05.598
473df104-f743-4377-8b56-ea1f78c9daf1	07fac518-776a-4351-a046-1c7ad6a49786	MIND_BODY_MEDICINE	Mind Body Medicine	\N	6	t	t	2026-10-13 07:58:09.613	2026-10-13 08:08:05.598
f32873b1-6971-4dc5-974a-d370c315d793	07fac518-776a-4351-a046-1c7ad6a49786	MEDITATION_THERAPY	Meditation Therapy	\N	7	t	t	2026-10-13 07:58:09.613	2026-10-13 08:08:05.599
9a4ac372-699c-4c88-86d8-66e1b49c294b	07fac518-776a-4351-a046-1c7ad6a49786	FUNCTIONAL_MEDICINE	Functional Medicine	\N	8	t	t	2026-10-13 07:58:09.614	2026-10-13 08:08:05.599
117d148d-d200-4da7-8e7b-74d702d384c0	07fac518-776a-4351-a046-1c7ad6a49786	CLINICAL_NUTRITION	Clinical Nutrition	\N	9	t	t	2026-10-13 07:58:09.615	2026-10-13 08:08:05.599
09ab97dd-2a1c-47f4-a3c8-869b8eda40d7	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	SMALL_ANIMAL_MEDICINE	Small Animal Medicine	\N	1	t	t	2026-10-13 07:58:09.616	2026-10-13 08:08:05.6
bc5549fb-5b2e-4b45-89dc-c5945aa953e4	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	LARGE_ANIMAL_MEDICINE	Large Animal Medicine	\N	2	t	t	2026-10-13 07:58:09.616	2026-10-13 08:08:05.6
32ed3c53-bdfa-4ef6-8344-747a6a0bf3e8	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	COMPANION_ANIMAL_MEDICINE	Companion Animal Medicine	\N	3	t	t	2026-10-13 07:58:09.617	2026-10-13 08:08:05.6
26f0487a-38c4-4293-a10c-3227536a5c51	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	CANINE_MEDICINE	Canine Medicine	\N	4	t	t	2026-10-13 07:58:09.619	2026-10-13 08:08:05.601
95fb04fe-6a95-4670-af11-78fcd09b5d34	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	FELINE_MEDICINE	Feline Medicine	\N	5	t	t	2026-10-13 07:58:09.62	2026-10-13 08:08:05.601
060a35ab-9ed6-4d62-9303-ed991cd4561b	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	AVIAN_MEDICINE	Avian Medicine	\N	6	t	t	2026-10-13 07:58:09.62	2026-10-13 08:08:05.602
a654aee7-40d0-48a8-8256-4f0ee49b5460	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	EQUINE_MEDICINE	Equine Medicine	\N	7	t	t	2026-10-13 07:58:09.621	2026-10-13 08:08:05.602
1cb2825b-0434-4db5-847c-81b3773747a7	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	BOVINE_MEDICINE	Bovine Medicine	\N	8	t	t	2026-10-13 07:58:09.622	2026-10-13 08:08:05.603
46e049ac-1c61-410d-974d-891953a5713d	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	WILDLIFE_MEDICINE	Wildlife Medicine	\N	9	t	t	2026-10-13 07:58:09.623	2026-10-13 08:08:05.603
fed8115a-2551-43e8-bac1-3382ee63b48c	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	ZOO_MEDICINE	Zoo Medicine	\N	10	t	t	2026-10-13 07:58:09.624	2026-10-13 08:08:05.603
0b4b76bb-a35f-45bf-b1a6-e3d542f4297e	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	VETERINARY_SURGERY	Veterinary Surgery	\N	11	t	t	2026-10-13 07:58:09.625	2026-10-13 08:08:05.604
89d8bb58-007d-4b16-a824-a4f9a401421b	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	VETERINARY_ORTHOPEDICS	Veterinary Orthopedics	\N	12	t	t	2026-10-13 07:58:09.626	2026-10-13 08:08:05.604
ceccd976-73c9-428a-aee8-84f81c341773	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	VETERINARY_DERMATOLOGY	Veterinary Dermatology	\N	13	t	t	2026-10-13 07:58:09.627	2026-10-13 08:08:05.604
02fced69-23a1-44e4-a361-c93e04848557	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	VETERINARY_CARDIOLOGY	Veterinary Cardiology	\N	14	t	t	2026-10-13 07:58:09.627	2026-10-13 08:08:05.605
40164ec6-98e9-44f2-8eb1-a5002fd3b39d	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	VETERINARY_DENTISTRY	Veterinary Dentistry	\N	15	t	t	2026-10-13 07:58:09.628	2026-10-13 08:08:05.605
c02e1056-7d4a-44e8-9129-7fd5f58395c5	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	VETERINARY_ONCOLOGY	Veterinary Oncology	\N	16	t	t	2026-10-13 07:58:09.629	2026-10-13 08:08:05.606
f7416c3c-7533-4536-a5ea-9b8c8a59d954	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	VETERINARY_NEUROLOGY	Veterinary Neurology	\N	17	t	t	2026-10-13 07:58:09.63	2026-10-13 08:08:05.606
aab67263-ab2d-42a9-a026-70162e98931e	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	VETERINARY_EMERGENCY_AND_CRITICAL_CARE	Veterinary Emergency & Critical Care	\N	18	t	t	2026-10-13 07:58:09.631	2026-10-13 08:08:05.606
c67f18cb-951b-41d9-9ec9-7260e27f9fb5	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	VETERINARY_RADIOLOGY	Veterinary Radiology	\N	19	t	t	2026-10-13 07:58:09.632	2026-10-13 08:08:05.607
559da1b0-3b5a-409d-b7e8-6d5b8551bbbb	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	VETERINARY_PATHOLOGY	Veterinary Pathology	\N	20	t	t	2026-10-13 07:58:09.633	2026-10-13 08:08:05.607
3b27df86-22a6-420f-a9ed-22a65ea5c423	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	ANIMAL_REHABILITATION	Animal Rehabilitation	\N	21	t	t	2026-10-13 07:58:09.635	2026-10-13 08:08:05.608
c829defb-dddb-4cdd-b994-d963f5ab2120	1877b85d-32c0-4e2e-8650-c8cd3fd5143d	PREVENTIVE_VETERINARY_MEDICINE	Preventive Veterinary Medicine	\N	22	t	t	2026-10-13 07:58:09.636	2026-10-13 08:08:05.608
c6cd9e98-f8a4-4720-adff-3fc0055fd1a7	75731436-117e-433c-8622-3dfbed434233	FAMILY_MEDICINE	Family Medicine	\N	2	t	t	2026-10-13 08:00:23.031	2026-10-13 08:08:05.646
9a4d5ea7-aea8-4ae1-8899-11f3394c05f2	75731436-117e-433c-8622-3dfbed434233	GERIATRIC_MEDICINE	Geriatric Medicine	\N	3	t	t	2026-10-13 08:00:23.031	2026-10-13 08:08:05.647
00d4fa97-ffcb-4388-9138-1427dab7fb11	75731436-117e-433c-8622-3dfbed434233	PREVENTIVE_MEDICINE	Preventive Medicine	\N	4	t	t	2026-10-13 08:00:23.032	2026-10-13 08:08:05.647
ba50c8ad-ebf0-4af8-a89d-7ca48e3d8387	9bcc704e-3add-4b65-abe4-8d0a797438df	INTERVENTIONAL_CARDIOLOGY	Interventional Cardiology	\N	1	t	t	2026-10-13 08:00:23.032	2026-10-13 08:08:05.648
3ceba51d-bbe7-4f89-9d4e-e68413d57be8	9bcc704e-3add-4b65-abe4-8d0a797438df	NON_INVASIVE_CARDIOLOGY	Non-invasive Cardiology	\N	2	t	t	2026-10-13 08:00:23.033	2026-10-13 08:08:05.648
ca609c77-13ee-429e-bdd1-a0ae0266c47a	9bcc704e-3add-4b65-abe4-8d0a797438df	ELECTROPHYSIOLOGY	Electrophysiology	\N	3	t	t	2026-10-13 08:00:23.033	2026-10-13 08:08:05.648
23401017-5e70-493c-ada2-c70d281c0c96	9bcc704e-3add-4b65-abe4-8d0a797438df	CARDIAC_IMAGING	Cardiac Imaging	\N	4	t	t	2026-10-13 08:00:23.033	2026-10-13 08:08:05.649
5e725729-3afe-45c5-9416-385667c56b8d	9bcc704e-3add-4b65-abe4-8d0a797438df	HEART_FAILURE	Heart Failure	\N	5	t	t	2026-10-13 08:00:23.034	2026-10-13 08:08:05.649
a501ff66-5dc0-4ce1-836c-34e8ada9d4eb	71645e76-3de4-42e1-bdc2-e4556a9e3e98	CLINICAL_NEUROLOGY	Clinical Neurology	\N	1	t	t	2026-10-13 08:00:23.034	2026-10-13 08:08:05.65
b2f91361-14e7-47e2-b904-1e8081d6ad46	71645e76-3de4-42e1-bdc2-e4556a9e3e98	STROKE_MEDICINE	Stroke Medicine	\N	2	t	t	2026-10-13 08:00:23.035	2026-10-13 08:08:05.65
f634fba9-3d8e-4a65-bde9-32bdf866f0c9	71645e76-3de4-42e1-bdc2-e4556a9e3e98	EPILEPSY	Epilepsy	\N	3	t	t	2026-10-13 08:00:23.035	2026-10-13 08:08:05.65
51844e12-d3a1-4ec6-8939-c066293a5c0d	71645e76-3de4-42e1-bdc2-e4556a9e3e98	NEUROMUSCULAR_MEDICINE	Neuromuscular Medicine	\N	4	t	t	2026-10-13 08:00:23.036	2026-10-13 08:08:05.651
159b38fc-563e-47b5-b86f-7370f4dcd3ee	71645e76-3de4-42e1-bdc2-e4556a9e3e98	MOVEMENT_DISORDERS	Movement Disorders	\N	5	t	t	2026-10-13 08:00:23.036	2026-10-13 08:08:05.651
d1e69e5e-3537-4af3-874b-d65727d294a8	921c207c-8b4d-4760-84e1-6e372fd77ed2	JOINT_REPLACEMENT	Joint Replacement	\N	1	t	t	2026-10-13 08:00:23.036	2026-10-13 08:08:05.652
01c78e4e-44a0-40ae-8f05-35790c5e7930	921c207c-8b4d-4760-84e1-6e372fd77ed2	SPINE_SURGERY	Spine Surgery	\N	2	t	t	2026-10-13 08:00:23.037	2026-10-13 08:08:05.652
68fcd381-6f3f-47fa-88c5-61ff015a41f1	921c207c-8b4d-4760-84e1-6e372fd77ed2	SPORTS_MEDICINE	Sports Medicine	\N	3	t	t	2026-10-13 08:00:23.037	2026-10-13 08:08:05.652
e40e459c-e078-4e26-8d3c-35b3fe4316e2	921c207c-8b4d-4760-84e1-6e372fd77ed2	TRAUMA_SURGERY	Trauma Surgery	\N	4	t	t	2026-10-13 08:00:23.038	2026-10-13 08:08:05.653
e4e9f47c-3b40-4854-891f-7363f4947183	921c207c-8b4d-4760-84e1-6e372fd77ed2	PEDIATRIC_ORTHOPEDICS	Pediatric Orthopedics	\N	5	t	t	2026-10-13 08:00:23.038	2026-10-13 08:08:05.653
bbc9d596-cacd-4afc-ba53-d5fe4f77c28f	921c207c-8b4d-4760-84e1-6e372fd77ed2	HAND_SURGERY	Hand Surgery	\N	6	t	t	2026-10-13 08:00:23.039	2026-10-13 08:08:05.654
2330b298-259f-422a-8b3c-d522684541f6	921c207c-8b4d-4760-84e1-6e372fd77ed2	FOOT_AND_ANKLE_SURGERY	Foot & Ankle Surgery	\N	7	t	t	2026-10-13 08:00:23.039	2026-10-13 08:08:05.654
ca4a1aa9-fe10-414d-8629-05702317d799	921c207c-8b4d-4760-84e1-6e372fd77ed2	ORTHOPEDIC_ONCOLOGY	Orthopedic Oncology	\N	8	t	t	2026-10-13 08:00:23.04	2026-10-13 08:08:05.655
79c07d6c-f383-4695-b382-7997133afc30	20676aa7-1c8e-4c2a-ab21-2e2041784487	GENERAL_PEDIATRICS	General Pediatrics	\N	1	t	t	2026-10-13 08:00:23.04	2026-10-13 08:08:05.655
14a97480-9996-4134-93fe-276183d55097	20676aa7-1c8e-4c2a-ab21-2e2041784487	NEONATOLOGY	Neonatology	\N	2	t	t	2026-10-13 08:00:23.041	2026-10-13 08:08:05.655
73a4fd2b-7528-4d55-a73c-26e061b2480a	20676aa7-1c8e-4c2a-ab21-2e2041784487	PEDIATRIC_CARDIOLOGY	Pediatric Cardiology	\N	3	t	t	2026-10-13 08:00:23.041	2026-10-13 08:08:05.656
9059a8fa-edaa-4c18-a63c-fa9c16bc073e	20676aa7-1c8e-4c2a-ab21-2e2041784487	PEDIATRIC_NEUROLOGY	Pediatric Neurology	\N	4	t	t	2026-10-13 08:00:23.042	2026-10-13 08:08:05.656
5dfe7a47-1535-489f-b1a9-73962e06d391	20676aa7-1c8e-4c2a-ab21-2e2041784487	PEDIATRIC_ENDOCRINOLOGY	Pediatric Endocrinology	\N	5	t	t	2026-10-13 08:00:23.042	2026-10-13 08:08:05.656
b0ea937a-1b98-428a-a023-675a83cf0c45	20676aa7-1c8e-4c2a-ab21-2e2041784487	PEDIATRIC_GASTROENTEROLOGY	Pediatric Gastroenterology	\N	6	t	t	2026-10-13 08:00:23.042	2026-10-13 08:08:05.657
9b18040d-d032-465a-9398-18e67d3c6136	20676aa7-1c8e-4c2a-ab21-2e2041784487	PEDIATRIC_PULMONOLOGY	Pediatric Pulmonology	\N	7	t	t	2026-10-13 08:00:23.043	2026-10-13 08:08:05.657
2bd08c9d-0507-4c43-99b7-0d86cf7d5707	20676aa7-1c8e-4c2a-ab21-2e2041784487	PEDIATRIC_INTENSIVE_CARE	Pediatric Intensive Care	\N	8	t	t	2026-10-13 08:00:23.043	2026-10-13 08:08:05.658
8818bf7d-2c09-4758-9b08-a736dad1abbf	92b64fcf-c00c-46b9-884f-68e0979550d8	OBSTETRICS	Obstetrics	\N	1	t	t	2026-10-13 08:00:23.044	2026-10-13 08:08:05.658
cbb24418-9da0-4be5-a0b4-02a423cca612	92b64fcf-c00c-46b9-884f-68e0979550d8	GYNECOLOGY	Gynecology	\N	2	t	t	2026-10-13 08:00:23.044	2026-10-13 08:08:05.658
ecfa76a3-bd65-45e4-bf3c-afbc7cd34153	92b64fcf-c00c-46b9-884f-68e0979550d8	MATERNAL_AND_FETAL_MEDICINE	Maternal & Fetal Medicine	\N	3	t	t	2026-10-13 08:00:23.044	2026-10-13 08:08:05.659
e77b6cd8-ed98-4311-9ac3-f652b3b69ccb	92b64fcf-c00c-46b9-884f-68e0979550d8	REPRODUCTIVE_MEDICINE	Reproductive Medicine	\N	4	t	t	2026-10-13 08:00:23.045	2026-10-13 08:08:05.659
a94a3dd7-fecb-4c5b-8daa-ba3687e319f2	92b64fcf-c00c-46b9-884f-68e0979550d8	GYNECOLOGIC_ONCOLOGY	Gynecologic Oncology	\N	5	t	t	2026-10-13 08:00:23.045	2026-10-13 08:08:05.659
130a676b-501c-4103-8833-5544763327b9	92b64fcf-c00c-46b9-884f-68e0979550d8	UROGYNECOLOGY	Urogynecology	\N	6	t	t	2026-10-13 08:00:23.046	2026-10-13 08:08:05.66
e36a5fb6-4b2f-4ff7-9c2c-3f52209d73e2	92b64fcf-c00c-46b9-884f-68e0979550d8	INFERTILITY	Infertility	\N	7	t	t	2026-10-13 08:00:23.046	2026-10-13 08:08:05.66
6b75c04a-65da-4b24-9f76-cb6191e212a3	92b64fcf-c00c-46b9-884f-68e0979550d8	HIGH_RISK_PREGNANCY	High-risk Pregnancy	\N	8	t	t	2026-10-13 08:00:23.046	2026-10-13 08:08:05.661
3747be24-6376-43fb-9f33-7d9c4ee663fa	5242df9d-1d36-4bff-b234-6be2e68f1611	CLINICAL_DERMATOLOGY	Clinical Dermatology	\N	1	t	t	2026-10-13 08:00:23.047	2026-10-13 08:08:05.661
4fee9eab-0dc3-4ff7-bcc1-a1df2c9cf09b	5242df9d-1d36-4bff-b234-6be2e68f1611	COSMETIC_DERMATOLOGY	Cosmetic Dermatology	\N	2	t	t	2026-10-13 08:00:23.047	2026-10-13 08:08:05.662
8a1d1ddd-c70c-40d3-94f4-e62760e22e50	5242df9d-1d36-4bff-b234-6be2e68f1611	DERMATOSURGERY	Dermatosurgery	\N	3	t	t	2026-10-13 08:00:23.048	2026-10-13 08:08:05.662
7b6d61f3-a876-46b2-87fb-1c575d1f3e5c	5242df9d-1d36-4bff-b234-6be2e68f1611	PEDIATRIC_DERMATOLOGY	Pediatric Dermatology	\N	4	t	t	2026-10-13 08:00:23.048	2026-10-13 08:08:05.662
03178f40-1f58-4b4d-8d06-49ee11368fd6	5242df9d-1d36-4bff-b234-6be2e68f1611	TRICHOLOGY	Trichology	\N	5	t	t	2026-10-13 08:00:23.048	2026-10-13 08:08:05.663
8861ae6b-90d4-4ff9-88cb-bdac0802e659	352442c9-8993-4efb-9ed1-22e96170667b	CATARACT_SURGERY	Cataract Surgery	\N	1	t	t	2026-10-13 08:00:23.049	2026-10-13 08:08:05.663
dbb3dc72-9384-4fb1-a1a6-30e8c1b74f19	352442c9-8993-4efb-9ed1-22e96170667b	RETINA	Retina	\N	2	t	t	2026-10-13 08:00:23.049	2026-10-13 08:08:05.664
182cc288-0045-4458-8320-651060b41d0d	352442c9-8993-4efb-9ed1-22e96170667b	CORNEA	Cornea	\N	3	t	t	2026-10-13 08:00:23.049	2026-10-13 08:08:05.664
91d6d33e-db70-405c-9668-c128b9ca8465	352442c9-8993-4efb-9ed1-22e96170667b	GLAUCOMA	Glaucoma	\N	4	t	t	2026-10-13 08:00:23.05	2026-10-13 08:08:05.664
3c148b56-e6c9-49fa-83b7-37d4fc44a60d	352442c9-8993-4efb-9ed1-22e96170667b	PEDIATRIC_OPHTHALMOLOGY	Pediatric Ophthalmology	\N	5	t	t	2026-10-13 08:00:23.05	2026-10-13 08:08:05.665
d16e5777-2e51-4cac-aae7-a07a6468983b	352442c9-8993-4efb-9ed1-22e96170667b	OCULOPLASTY	Oculoplasty	\N	6	t	t	2026-10-13 08:00:23.051	2026-10-13 08:08:05.665
f251e81b-fafc-414a-9536-36f743e0f055	c2e25fd6-a20c-444e-8657-d016c03e0054	OTOLOGY	Otology	\N	1	t	t	2026-10-13 08:00:23.051	2026-10-13 08:08:05.666
fd9fe2d5-6613-4667-afed-36f79f74f7e5	c2e25fd6-a20c-444e-8657-d016c03e0054	RHINOLOGY	Rhinology	\N	2	t	t	2026-10-13 08:00:23.051	2026-10-13 08:08:05.666
79ca49cf-d8fd-4103-ade7-b09b6054965c	c2e25fd6-a20c-444e-8657-d016c03e0054	LARYNGOLOGY	Laryngology	\N	3	t	t	2026-10-13 08:00:23.052	2026-10-13 08:08:05.666
dacf0db9-350f-4136-862f-a7c068c8380f	c2e25fd6-a20c-444e-8657-d016c03e0054	HEAD_AND_NECK_SURGERY	Head & Neck Surgery	\N	4	t	t	2026-10-13 08:00:23.052	2026-10-13 08:08:05.667
f5ea2817-0a44-43e3-9403-c4df25f37c29	c2e25fd6-a20c-444e-8657-d016c03e0054	AUDIOLOGY	Audiology	\N	5	t	t	2026-10-13 08:00:23.053	2026-10-13 08:08:05.667
0d5b458f-8968-49c2-a053-9468bee71e58	dc1742af-6b2b-4b74-9647-4aee9943360b	ADULT_PSYCHIATRY	Adult Psychiatry	\N	1	t	t	2026-10-13 08:00:23.053	2026-10-13 08:08:05.668
47ca849a-8a75-4a76-9d2b-5e8d3a9413a7	dc1742af-6b2b-4b74-9647-4aee9943360b	CHILD_PSYCHIATRY	Child Psychiatry	\N	2	t	t	2026-10-13 08:00:23.053	2026-10-13 08:08:05.668
954d8ed6-8e52-4eba-9415-930b2abf33cd	dc1742af-6b2b-4b74-9647-4aee9943360b	ADDICTION_MEDICINE	Addiction Medicine	\N	3	t	t	2026-10-13 08:00:23.054	2026-10-13 08:08:05.668
9363eb64-4d4e-4ca4-b793-2786f080fe0d	dc1742af-6b2b-4b74-9647-4aee9943360b	GERIATRIC_PSYCHIATRY	Geriatric Psychiatry	\N	4	t	t	2026-10-13 08:00:23.054	2026-10-13 08:08:05.669
aff435cf-53cf-4a13-9d3a-80f84878b698	dc1742af-6b2b-4b74-9647-4aee9943360b	CONSULTATION_LIAISON_PSYCHIATRY	Consultation Liaison Psychiatry	\N	5	t	t	2026-10-13 08:00:23.055	2026-10-13 08:08:05.669
576626d4-eb40-494c-8bb9-3d23bc2e6d84	44190a4c-7ed6-4ff3-bf38-9adc86084fa5	SLEEP_MEDICINE	Sleep Medicine	\N	1	t	t	2026-10-13 08:00:23.055	2026-10-13 08:08:05.67
2ffb1b9e-4cdd-4808-8cfd-0e70ed693511	44190a4c-7ed6-4ff3-bf38-9adc86084fa5	CRITICAL_CARE_PULMONOLOGY	Critical Care Pulmonology	\N	2	t	t	2026-10-13 08:00:23.055	2026-10-13 08:08:05.67
c1c7ec8d-e4a9-45bd-9f8a-aa4f44c244a7	44190a4c-7ed6-4ff3-bf38-9adc86084fa5	INTERVENTIONAL_PULMONOLOGY	Interventional Pulmonology	\N	3	t	t	2026-10-13 08:00:23.056	2026-10-13 08:08:05.67
924d1891-f332-48c2-a36f-59d4b7023ebd	44190a4c-7ed6-4ff3-bf38-9adc86084fa5	ASTHMA	Asthma	\N	4	t	t	2026-10-13 08:00:23.056	2026-10-13 08:08:05.671
8fbdcaba-90fd-4cf4-aacd-13569a003281	44190a4c-7ed6-4ff3-bf38-9adc86084fa5	COPD	COPD	\N	5	t	t	2026-10-13 08:00:23.057	2026-10-13 08:08:05.671
0d85f145-e4ad-418e-95a7-d12f1d6c3310	ab895e58-a718-462c-8518-be10b8258cc8	HEPATOLOGY	Hepatology	\N	1	t	t	2026-10-13 08:00:23.057	2026-10-13 08:08:05.671
1a7dc456-e3c1-4afb-bc73-b35e66d27cde	ab895e58-a718-462c-8518-be10b8258cc8	THERAPEUTIC_ENDOSCOPY	Therapeutic Endoscopy	\N	2	t	t	2026-10-13 08:00:23.057	2026-10-13 08:08:05.672
74cc008f-53b3-4caa-a9df-144725b84b37	ab895e58-a718-462c-8518-be10b8258cc8	INFLAMMATORY_BOWEL_DISEASE	Inflammatory Bowel Disease	\N	3	t	t	2026-10-13 08:00:23.058	2026-10-13 08:08:05.672
9d3b52f7-b5b3-46d5-8766-2262cce5b157	ab895e58-a718-462c-8518-be10b8258cc8	PANCREATOLOGY	Pancreatology	\N	4	t	t	2026-10-13 08:00:23.058	2026-10-13 08:08:05.673
f25a8b52-48db-440e-a455-8f445d39508b	ab895e58-a718-462c-8518-be10b8258cc8	GI_MOTILITY	GI Motility	\N	5	t	t	2026-10-13 08:00:23.058	2026-10-13 08:08:05.673
daec591c-0d2f-497d-a4e5-c5ec08859fc6	24c8b8d4-2f88-4cd6-9c1f-b664ad4b40b3	DIALYSIS	Dialysis	\N	1	t	t	2026-10-13 08:00:23.059	2026-10-13 08:08:05.673
053641f3-7bfe-4757-948a-6740dc7346d6	24c8b8d4-2f88-4cd6-9c1f-b664ad4b40b3	RENAL_TRANSPLANT	Renal Transplant	\N	2	t	t	2026-10-13 08:00:23.059	2026-10-13 08:08:05.674
9e4647aa-5ac1-4c79-926d-408bc6c84a9f	24c8b8d4-2f88-4cd6-9c1f-b664ad4b40b3	CRITICAL_CARE_NEPHROLOGY	Critical Care Nephrology	\N	3	t	t	2026-10-13 08:00:23.06	2026-10-13 08:08:05.674
4a7f892c-99a6-4272-aad7-1ca741895d0c	24c8b8d4-2f88-4cd6-9c1f-b664ad4b40b3	PEDIATRIC_NEPHROLOGY	Pediatric Nephrology	\N	4	t	t	2026-10-13 08:00:23.06	2026-10-13 08:08:05.675
c4421129-0409-44c7-810d-0364c3005309	6089edc9-20a5-449d-b408-70378bc3c442	ENDOUROLOGY	Endourology	\N	1	t	t	2026-10-13 08:00:23.06	2026-10-13 08:08:05.675
0b5a665b-7455-43c0-8418-d3c8df448cc7	6089edc9-20a5-449d-b408-70378bc3c442	UROLOGIC_ONCOLOGY	Urologic Oncology	\N	2	t	t	2026-10-13 08:00:23.061	2026-10-13 08:08:05.675
24c170d9-8ad6-4626-9dbd-71476433d875	6089edc9-20a5-449d-b408-70378bc3c442	ANDROLOGY	Andrology	\N	3	t	t	2026-10-13 08:00:23.061	2026-10-13 08:08:05.676
ff6a534e-0674-47e1-9df9-e499225f1afb	6089edc9-20a5-449d-b408-70378bc3c442	FEMALE_UROLOGY	Female Urology	\N	4	t	t	2026-10-13 08:00:23.061	2026-10-13 08:08:05.676
2f691211-ae2e-401a-bb0e-ebec5d6d6275	6089edc9-20a5-449d-b408-70378bc3c442	PEDIATRIC_UROLOGY	Pediatric Urology	\N	5	t	t	2026-10-13 08:00:23.062	2026-10-13 08:08:05.677
b24adf0c-5860-4b32-9fb2-ac5bacbe1ba3	43cac77a-437a-4088-b404-0c453b9b2e12	MEDICAL_ONCOLOGY	Medical Oncology	\N	1	t	t	2026-10-13 08:00:23.062	2026-10-13 08:08:05.677
fe346ec8-2c10-45a2-8f95-b166db81d42b	43cac77a-437a-4088-b404-0c453b9b2e12	SURGICAL_ONCOLOGY	Surgical Oncology	\N	2	t	t	2026-10-13 08:00:23.063	2026-10-13 08:08:05.677
f4ec6269-6ca7-4939-a57c-c981e7a1df28	43cac77a-437a-4088-b404-0c453b9b2e12	RADIATION_ONCOLOGY	Radiation Oncology	\N	3	t	t	2026-10-13 08:00:23.063	2026-10-13 08:08:05.678
5480c4cd-72ef-4343-805a-b6c4043cb84c	43cac77a-437a-4088-b404-0c453b9b2e12	HEMATOLOGIC_ONCOLOGY	Hematologic Oncology	\N	4	t	t	2026-10-13 08:00:23.063	2026-10-13 08:08:05.678
2c653540-78c5-4010-b4e5-deb6f79d51d5	43cac77a-437a-4088-b404-0c453b9b2e12	PALLIATIVE_ONCOLOGY	Palliative Oncology	\N	5	t	t	2026-10-13 08:00:23.064	2026-10-13 08:08:05.678
7831fa10-82b3-430b-8658-c12b498c2c5a	6b6aa58a-561c-4457-9e5f-93960c6418c2	DIABETES	Diabetes	\N	1	t	t	2026-10-13 08:00:23.064	2026-10-13 08:08:05.679
b4bb1ff6-cd6d-4847-bba8-af98afa42552	6b6aa58a-561c-4457-9e5f-93960c6418c2	THYROID_DISORDERS	Thyroid Disorders	\N	2	t	t	2026-10-13 08:00:23.065	2026-10-13 08:08:05.679
beb1a51b-34e5-44f6-9d88-d4bbb6125b46	6b6aa58a-561c-4457-9e5f-93960c6418c2	PITUITARY_DISORDERS	Pituitary Disorders	\N	3	t	t	2026-10-13 08:00:23.065	2026-10-13 08:08:05.68
ca27bb82-60a4-439f-b346-e65c71042505	6b6aa58a-561c-4457-9e5f-93960c6418c2	METABOLIC_DISORDERS	Metabolic Disorders	\N	4	t	t	2026-10-13 08:00:23.065	2026-10-13 08:08:05.68
7e11cbac-2c05-41e8-a150-968822698af1	6b6aa58a-561c-4457-9e5f-93960c6418c2	OSTEOPOROSIS	Osteoporosis	\N	5	t	t	2026-10-13 08:00:23.066	2026-10-13 08:08:05.68
aaa04d02-48e4-4f65-8c2a-d8fa0a4eebd1	72034b7c-3705-4fc8-b265-668fe2ab87cf	TRAUMA_CARE	Trauma Care	\N	1	t	t	2026-10-13 08:00:23.066	2026-10-13 08:08:05.681
766ff745-d916-4193-bc3a-30777c025188	72034b7c-3705-4fc8-b265-668fe2ab87cf	TOXICOLOGY	Toxicology	\N	2	t	t	2026-10-13 08:00:23.066	2026-10-13 08:08:05.681
db4a38fe-5cc0-46e4-966c-6334602b154a	72034b7c-3705-4fc8-b265-668fe2ab87cf	DISASTER_MEDICINE	Disaster Medicine	\N	3	t	t	2026-10-13 08:00:23.067	2026-10-13 08:08:05.682
8bdad25a-9aae-4b03-bc7f-e26a1d6a7d05	72034b7c-3705-4fc8-b265-668fe2ab87cf	EMERGENCY_ULTRASOUND	Emergency Ultrasound	\N	4	t	t	2026-10-13 08:00:23.067	2026-10-13 08:08:05.682
188db579-69c5-4bc7-ad31-186163033320	522ca35e-55db-418a-9c9d-d2b9dcec0e3f	ADULT_ICU	Adult ICU	\N	1	t	t	2026-10-13 08:00:23.068	2026-10-13 08:08:05.682
6765a535-1807-48c7-93a5-e8aeaeea5c56	522ca35e-55db-418a-9c9d-d2b9dcec0e3f	CARDIAC_ICU	Cardiac ICU	\N	2	t	t	2026-10-13 08:00:23.068	2026-10-13 08:08:05.683
695383f0-b53d-47a9-aa5e-bbdd8d29e51a	522ca35e-55db-418a-9c9d-d2b9dcec0e3f	NEURO_ICU	Neuro ICU	\N	3	t	t	2026-10-13 08:00:23.068	2026-10-13 08:08:05.683
83ae161b-0432-47b6-a33d-01079fcc168d	522ca35e-55db-418a-9c9d-d2b9dcec0e3f	PEDIATRIC_ICU	Pediatric ICU	\N	4	t	t	2026-10-13 08:00:23.069	2026-10-13 08:08:05.683
fa58f761-d502-4df0-ba59-d584edbb9ef8	522ca35e-55db-418a-9c9d-d2b9dcec0e3f	NEONATAL_ICU	Neonatal ICU	\N	5	t	t	2026-10-13 08:00:23.069	2026-10-13 08:08:05.684
8e8a03fa-0333-4846-911f-e42907348814	9c5f7370-a121-4ff5-8a04-d544a2153704	DIAGNOSTIC_RADIOLOGY	Diagnostic Radiology	\N	1	t	t	2026-10-13 08:00:23.07	2026-10-13 08:08:05.684
3ba0ba78-4a4e-4d11-8ec9-053ecd090ecf	9c5f7370-a121-4ff5-8a04-d544a2153704	INTERVENTIONAL_RADIOLOGY	Interventional Radiology	\N	2	t	t	2026-10-13 08:00:23.07	2026-10-13 08:08:05.684
2959d6ad-d1a8-463f-9418-6a1b6574b06d	9c5f7370-a121-4ff5-8a04-d544a2153704	NEURORADIOLOGY	Neuroradiology	\N	3	t	t	2026-10-13 08:00:23.071	2026-10-13 08:08:05.685
110474e1-472e-4f4a-975d-6619673c6f27	9c5f7370-a121-4ff5-8a04-d544a2153704	MUSCULOSKELETAL_IMAGING	Musculoskeletal Imaging	\N	4	t	t	2026-10-13 08:00:23.071	2026-10-13 08:08:05.685
450a2031-1ec4-4316-9191-4de57fb62ea6	9c5f7370-a121-4ff5-8a04-d544a2153704	BREAST_IMAGING	Breast Imaging	\N	5	t	t	2026-10-13 08:00:23.071	2026-10-13 08:08:05.686
82b91633-13f2-465f-92a7-57221d7e5881	9c5f7370-a121-4ff5-8a04-d544a2153704	NUCLEAR_MEDICINE	Nuclear Medicine	\N	6	t	t	2026-10-13 08:00:23.072	2026-10-13 08:08:05.686
5061df1f-03a3-42fe-85bb-3d076dd1ec74	e2a2b678-7ea2-40d4-a5d9-8d0aec5a9981	CLINICAL_PATHOLOGY	Clinical Pathology	\N	1	t	t	2026-10-13 08:00:23.072	2026-10-13 08:08:05.686
bce185d6-3dcc-48cf-89ad-9e369b07f909	e2a2b678-7ea2-40d4-a5d9-8d0aec5a9981	HISTOPATHOLOGY	Histopathology	\N	2	t	t	2026-10-13 08:00:23.072	2026-10-13 08:08:05.687
a5df99f8-f2d4-4b6c-9b28-0157b4f58a35	e2a2b678-7ea2-40d4-a5d9-8d0aec5a9981	MICROBIOLOGY	Microbiology	\N	3	t	t	2026-10-13 08:00:23.073	2026-10-13 08:08:05.687
502f270c-b0eb-4b56-8c48-0c24b79bdb22	e2a2b678-7ea2-40d4-a5d9-8d0aec5a9981	HEMATOLOGY	Hematology	\N	4	t	t	2026-10-13 08:00:23.073	2026-10-13 08:08:05.688
692fba8b-638b-4dbe-89f9-2bded1331269	e2a2b678-7ea2-40d4-a5d9-8d0aec5a9981	BIOCHEMISTRY	Biochemistry	\N	5	t	t	2026-10-13 08:00:23.074	2026-10-13 08:08:05.688
6198ccd9-f079-4c5e-8f1d-382f9b8a3ff1	e2a2b678-7ea2-40d4-a5d9-8d0aec5a9981	MOLECULAR_DIAGNOSTICS	Molecular Diagnostics	\N	6	t	t	2026-10-13 08:00:23.074	2026-10-13 08:08:05.689
e0c3e551-a134-4594-a192-f1c957a84c73	e2a2b678-7ea2-40d4-a5d9-8d0aec5a9981	CYTOLOGY	Cytology	\N	7	t	t	2026-10-13 08:00:23.074	2026-10-13 08:08:05.689
2eac6d42-6615-47df-8ec3-287052e1fdfe	1bf25831-6a87-4f1a-9466-deb69dbbf81a	CARDIAC_ANESTHESIA	Cardiac Anesthesia	\N	1	t	t	2026-10-13 08:00:23.075	2026-10-13 08:08:05.689
7a173487-1fd7-4ce7-b739-2a2c2b55ff42	1bf25831-6a87-4f1a-9466-deb69dbbf81a	NEURO_ANESTHESIA	Neuro Anesthesia	\N	2	t	t	2026-10-13 08:00:23.075	2026-10-13 08:08:05.69
df02ffb6-885d-4830-b440-577dc71d225c	1bf25831-6a87-4f1a-9466-deb69dbbf81a	PEDIATRIC_ANESTHESIA	Pediatric Anesthesia	\N	3	t	t	2026-10-13 08:00:23.075	2026-10-13 08:08:05.69
e91ab463-b92f-4d04-a605-3972471b4310	1bf25831-6a87-4f1a-9466-deb69dbbf81a	PAIN_MEDICINE	Pain Medicine	\N	4	t	t	2026-10-13 08:00:23.076	2026-10-13 08:08:05.69
e37c8cc2-0ad6-4ea0-8c90-af1819ce9106	1bf25831-6a87-4f1a-9466-deb69dbbf81a	CRITICAL_CARE_ANESTHESIA	Critical Care Anesthesia	\N	5	t	t	2026-10-13 08:00:23.076	2026-10-13 08:08:05.691
fc98c3b4-56bc-4fde-957b-1a6bc562503c	b306d6f4-50a9-49f2-94e7-a12f8994b8d5	ORTHODONTICS	Orthodontics	\N	1	t	t	2026-10-13 08:00:23.077	2026-10-13 08:08:05.691
be6ff6de-666c-4e5c-b2b6-3ad26cabc5fe	b306d6f4-50a9-49f2-94e7-a12f8994b8d5	PROSTHODONTICS	Prosthodontics	\N	2	t	t	2026-10-13 08:00:23.077	2026-10-13 08:08:05.692
fc8bbd35-25c5-400d-878f-ff776fa888e4	b306d6f4-50a9-49f2-94e7-a12f8994b8d5	PERIODONTICS	Periodontics	\N	3	t	t	2026-10-13 08:00:23.077	2026-10-13 08:08:05.692
dc498622-6417-4aea-94a7-0f95bd995372	b306d6f4-50a9-49f2-94e7-a12f8994b8d5	ENDODONTICS	Endodontics	\N	4	t	t	2026-10-13 08:00:23.078	2026-10-13 08:08:05.692
bfbcb1ad-01b9-41aa-bdbf-c09d946b3deb	b306d6f4-50a9-49f2-94e7-a12f8994b8d5	ORAL_SURGERY	Oral Surgery	\N	5	t	t	2026-10-13 08:00:23.078	2026-10-13 08:08:05.693
15c9b8f6-19c6-4247-985b-cc81d001faac	b306d6f4-50a9-49f2-94e7-a12f8994b8d5	PEDIATRIC_DENTISTRY	Pediatric Dentistry	\N	6	t	t	2026-10-13 08:00:23.078	2026-10-13 08:08:05.693
472383be-4e2c-4e40-b277-9ecc8f964f54	086c82ae-35e3-455c-9ff0-c5a3ade3194c	MUSCULOSKELETAL_PHYSIOTHERAPY	Musculoskeletal Physiotherapy	\N	1	t	t	2026-10-13 08:00:23.079	2026-10-13 08:08:05.694
7e5915a3-d310-4949-b99e-959be83c973c	086c82ae-35e3-455c-9ff0-c5a3ade3194c	NEUROLOGICAL_REHABILITATION	Neurological Rehabilitation	\N	2	t	t	2026-10-13 08:00:23.079	2026-10-13 08:08:05.694
e868ba9d-f96c-4c8c-88ee-719e15f06cde	086c82ae-35e3-455c-9ff0-c5a3ade3194c	SPORTS_REHABILITATION	Sports Rehabilitation	\N	3	t	t	2026-10-13 08:00:23.08	2026-10-13 08:08:05.694
cc52222c-befe-4892-a9ca-8771905f8dae	086c82ae-35e3-455c-9ff0-c5a3ade3194c	GERIATRIC_PHYSIOTHERAPY	Geriatric Physiotherapy	\N	4	t	t	2026-10-13 08:00:23.08	2026-10-13 08:08:05.695
06b66106-d817-474c-ba25-ffbc0f693097	086c82ae-35e3-455c-9ff0-c5a3ade3194c	PEDIATRIC_PHYSIOTHERAPY	Pediatric Physiotherapy	\N	5	t	t	2026-10-13 08:00:23.08	2026-10-13 08:08:05.695
8a4237d0-ddda-4d21-bc58-6ad0dcab87e8	e5050c50-6d94-4ee8-8f23-49602b168289	AYURVEDA	Ayurveda	\N	1	t	t	2026-10-13 08:00:23.081	2026-10-13 08:08:05.696
1287a249-ab8c-43b9-895d-c264da90387f	e5050c50-6d94-4ee8-8f23-49602b168289	HOMEOPATHY	Homeopathy	\N	2	t	t	2026-10-13 08:00:23.081	2026-10-13 08:08:05.696
e42c8f67-74e4-451d-a6a0-4a25b7f17800	e5050c50-6d94-4ee8-8f23-49602b168289	SIDDHA	Siddha	\N	3	t	t	2026-10-13 08:00:23.082	2026-10-13 08:08:05.696
fc0d887a-512c-4c08-a7f5-c83cb1e56329	e5050c50-6d94-4ee8-8f23-49602b168289	UNANI	Unani	\N	4	t	t	2026-10-13 08:00:23.082	2026-10-13 08:08:05.697
90fa0ca7-7d26-409c-96e6-98b87bd72027	e5050c50-6d94-4ee8-8f23-49602b168289	YOGA_AND_NATUROPATHY	Yoga & Naturopathy	\N	5	t	t	2026-10-13 08:00:23.082	2026-10-13 08:08:05.697
009b1a4a-fd45-48bf-aa31-348a49649a1e	e5050c50-6d94-4ee8-8f23-49602b168289	PANCHAKARMA	Panchakarma	\N	6	t	t	2026-10-13 08:00:23.083	2026-10-13 08:08:05.697
64d9b029-7c04-49b4-97f8-74ef70082097	e5050c50-6d94-4ee8-8f23-49602b168289	AYURVEDIC_SURGERY	Ayurvedic Surgery	\N	7	t	t	2026-10-13 08:00:23.083	2026-10-13 08:08:05.698
9d2ec3d1-a704-4ab2-8333-f93063172582	e5050c50-6d94-4ee8-8f23-49602b168289	AYURVEDIC_NUTRITION	Ayurvedic Nutrition	\N	8	t	t	2026-10-13 08:00:23.084	2026-10-13 08:08:05.698
0b55dd4c-f0ee-4bea-bca8-1f14883a35ed	43cf7367-4d41-4ab7-ae99-69a005a0512d	ACUPUNCTURE	Acupuncture	\N	1	t	t	2026-10-13 08:00:23.084	2026-10-13 08:08:05.699
cbadeff3-d402-4679-bc05-f3bc24138af9	43cf7367-4d41-4ab7-ae99-69a005a0512d	ACUPRESSURE	Acupressure	\N	2	t	t	2026-10-13 08:00:23.084	2026-10-13 08:08:05.699
734c8161-388c-4e75-941c-9c14416a394e	43cf7367-4d41-4ab7-ae99-69a005a0512d	CUPPING_THERAPY	Cupping Therapy	\N	3	t	t	2026-10-13 08:00:23.085	2026-10-13 08:08:05.699
e1ae46ab-6abf-41bc-9e1b-2b4c09ea5806	43cf7367-4d41-4ab7-ae99-69a005a0512d	LIFESTYLE_MEDICINE	Lifestyle Medicine	\N	4	t	t	2026-10-13 08:00:23.085	2026-10-13 08:08:05.7
935f7b29-2c80-450a-8ad7-a5b2fa504db9	43cf7367-4d41-4ab7-ae99-69a005a0512d	PAIN_MANAGEMENT	Pain Management	\N	5	t	t	2026-10-13 08:00:23.086	2026-10-13 08:08:05.7
5de6360b-4b40-4e77-b578-5666f290cc90	43cf7367-4d41-4ab7-ae99-69a005a0512d	MIND_BODY_MEDICINE	Mind Body Medicine	\N	6	t	t	2026-10-13 08:00:23.086	2026-10-13 08:08:05.7
7f1d3a4b-394d-474f-8b98-e8c01495f952	43cf7367-4d41-4ab7-ae99-69a005a0512d	MEDITATION_THERAPY	Meditation Therapy	\N	7	t	t	2026-10-13 08:00:23.086	2026-10-13 08:08:05.701
20f6af4c-696b-494c-96d1-5d28a406d66b	43cf7367-4d41-4ab7-ae99-69a005a0512d	FUNCTIONAL_MEDICINE	Functional Medicine	\N	8	t	t	2026-10-13 08:00:23.087	2026-10-13 08:08:05.701
af665efd-73b3-4489-90ee-18447648b324	43cf7367-4d41-4ab7-ae99-69a005a0512d	CLINICAL_NUTRITION	Clinical Nutrition	\N	9	t	t	2026-10-13 08:00:23.087	2026-10-13 08:08:05.702
fd5a3ec1-8dde-457b-ad5c-20cafb38ad3c	554d604e-f126-452f-812f-2ad31e5d2202	SMALL_ANIMAL_MEDICINE	Small Animal Medicine	\N	1	t	t	2026-10-13 08:00:23.088	2026-10-13 08:08:05.702
8f1a72fe-e75e-4560-9282-ff548f2cefea	554d604e-f126-452f-812f-2ad31e5d2202	LARGE_ANIMAL_MEDICINE	Large Animal Medicine	\N	2	t	t	2026-10-13 08:00:23.088	2026-10-13 08:08:05.702
d51ea1a7-a48f-4829-9c8f-4363c2f117c6	554d604e-f126-452f-812f-2ad31e5d2202	COMPANION_ANIMAL_MEDICINE	Companion Animal Medicine	\N	3	t	t	2026-10-13 08:00:23.088	2026-10-13 08:08:05.703
a4dfc0bd-0480-44ff-ae21-111ff05b8d20	554d604e-f126-452f-812f-2ad31e5d2202	CANINE_MEDICINE	Canine Medicine	\N	4	t	t	2026-10-13 08:00:23.089	2026-10-13 08:08:05.703
9d5f186a-f929-4401-b457-b3a283f441ce	554d604e-f126-452f-812f-2ad31e5d2202	FELINE_MEDICINE	Feline Medicine	\N	5	t	t	2026-10-13 08:00:23.089	2026-10-13 08:08:05.703
5b1ad32a-e4ad-4aed-8d6d-bd5d62e88fbf	554d604e-f126-452f-812f-2ad31e5d2202	AVIAN_MEDICINE	Avian Medicine	\N	6	t	t	2026-10-13 08:00:23.09	2026-10-13 08:08:05.704
6aacf132-0e5f-45fa-b66a-cab7c45d04aa	554d604e-f126-452f-812f-2ad31e5d2202	EQUINE_MEDICINE	Equine Medicine	\N	7	t	t	2026-10-13 08:00:23.09	2026-10-13 08:08:05.704
5bfd1573-aba7-4b87-bce8-80df357c4949	554d604e-f126-452f-812f-2ad31e5d2202	BOVINE_MEDICINE	Bovine Medicine	\N	8	t	t	2026-10-13 08:00:23.09	2026-10-13 08:08:05.704
139e4978-ba22-4da4-b41d-8ec951449ad2	554d604e-f126-452f-812f-2ad31e5d2202	WILDLIFE_MEDICINE	Wildlife Medicine	\N	9	t	t	2026-10-13 08:00:23.091	2026-10-13 08:08:05.705
84bb8258-5f0a-4655-9a67-b308a5e6b514	554d604e-f126-452f-812f-2ad31e5d2202	ZOO_MEDICINE	Zoo Medicine	\N	10	t	t	2026-10-13 08:00:23.091	2026-10-13 08:08:05.705
0d4430c3-76eb-496d-8d87-97bed2bf8572	554d604e-f126-452f-812f-2ad31e5d2202	VETERINARY_SURGERY	Veterinary Surgery	\N	11	t	t	2026-10-13 08:00:23.091	2026-10-13 08:08:05.706
cbc9ace7-f586-4ae4-8389-336207f4e5ab	554d604e-f126-452f-812f-2ad31e5d2202	VETERINARY_ORTHOPEDICS	Veterinary Orthopedics	\N	12	t	t	2026-10-13 08:00:23.092	2026-10-13 08:08:05.706
255e3b58-a977-4a02-923a-5266e6943ac7	554d604e-f126-452f-812f-2ad31e5d2202	VETERINARY_DERMATOLOGY	Veterinary Dermatology	\N	13	t	t	2026-10-13 08:00:23.092	2026-10-13 08:08:05.706
eab29900-8bcc-43cf-a7d1-4150a77d37e6	554d604e-f126-452f-812f-2ad31e5d2202	VETERINARY_CARDIOLOGY	Veterinary Cardiology	\N	14	t	t	2026-10-13 08:00:23.092	2026-10-13 08:08:05.707
e0ff11d4-b523-4c3b-b9d5-5e57617dab62	554d604e-f126-452f-812f-2ad31e5d2202	VETERINARY_DENTISTRY	Veterinary Dentistry	\N	15	t	t	2026-10-13 08:00:23.093	2026-10-13 08:08:05.707
85ac7e63-e77c-47a2-9b8d-6e3d0280b5b9	554d604e-f126-452f-812f-2ad31e5d2202	VETERINARY_ONCOLOGY	Veterinary Oncology	\N	16	t	t	2026-10-13 08:00:23.093	2026-10-13 08:08:05.708
e8193067-d93f-4f59-8ee9-2f0ffe2003a9	554d604e-f126-452f-812f-2ad31e5d2202	VETERINARY_NEUROLOGY	Veterinary Neurology	\N	17	t	t	2026-10-13 08:00:23.094	2026-10-13 08:08:05.708
038f6090-d302-41b5-84b0-d7a7c4742bec	554d604e-f126-452f-812f-2ad31e5d2202	VETERINARY_EMERGENCY_AND_CRITICAL_CARE	Veterinary Emergency & Critical Care	\N	18	t	t	2026-10-13 08:00:23.094	2026-10-13 08:08:05.708
676d0b94-4100-43c5-9d00-27bfcd362ced	554d604e-f126-452f-812f-2ad31e5d2202	VETERINARY_RADIOLOGY	Veterinary Radiology	\N	19	t	t	2026-10-13 08:00:23.094	2026-10-13 08:08:05.709
b4a2c414-473c-4d05-acaa-708be87caf6a	554d604e-f126-452f-812f-2ad31e5d2202	VETERINARY_PATHOLOGY	Veterinary Pathology	\N	20	t	t	2026-10-13 08:00:23.095	2026-10-13 08:08:05.709
681a67a1-6ff7-4b33-8281-33cfb403d9c5	554d604e-f126-452f-812f-2ad31e5d2202	ANIMAL_REHABILITATION	Animal Rehabilitation	\N	21	t	t	2026-10-13 08:00:23.095	2026-10-13 08:08:05.71
5db40013-cce5-494e-9883-3ae7447f6b17	554d604e-f126-452f-812f-2ad31e5d2202	PREVENTIVE_VETERINARY_MEDICINE	Preventive Veterinary Medicine	\N	22	t	t	2026-10-13 08:00:23.096	2026-10-13 08:08:05.71
887ea1d2-2c06-4bac-b7ed-538f05e453cb	9d6ddbb0-e11c-464d-8e53-04aded80262f	GENERAL_PEDIATRICS	General Pediatrics	\N	1	t	t	2026-10-13 08:02:49.657	2026-10-13 08:08:05.756
7be03538-e706-41a3-891b-0ed9773afe49	9d6ddbb0-e11c-464d-8e53-04aded80262f	NEONATOLOGY	Neonatology	\N	2	t	t	2026-10-13 08:02:49.659	2026-10-13 08:08:05.756
c18d05aa-c344-40ae-9ca3-84bb9bb5845b	9d6ddbb0-e11c-464d-8e53-04aded80262f	PEDIATRIC_CARDIOLOGY	Pediatric Cardiology	\N	3	t	t	2026-10-13 08:02:49.661	2026-10-13 08:08:05.757
e4504278-be66-4e43-b89d-d73a036d3417	9d6ddbb0-e11c-464d-8e53-04aded80262f	PEDIATRIC_NEUROLOGY	Pediatric Neurology	\N	4	t	t	2026-10-13 08:02:49.663	2026-10-13 08:08:05.757
1f105926-56bb-4883-9de3-63412e591c6f	9d6ddbb0-e11c-464d-8e53-04aded80262f	PEDIATRIC_ENDOCRINOLOGY	Pediatric Endocrinology	\N	5	t	t	2026-10-13 08:02:49.665	2026-10-13 08:08:05.757
83bbebfa-9d1e-4e28-99bc-fff5990bf661	9d6ddbb0-e11c-464d-8e53-04aded80262f	PEDIATRIC_GASTROENTEROLOGY	Pediatric Gastroenterology	\N	6	t	t	2026-10-13 08:02:49.667	2026-10-13 08:08:05.758
2ae2d358-1dad-4465-9ac6-9888390cd063	9d6ddbb0-e11c-464d-8e53-04aded80262f	PEDIATRIC_PULMONOLOGY	Pediatric Pulmonology	\N	7	t	t	2026-10-13 08:02:49.669	2026-10-13 08:08:05.758
2cbbf040-8a7b-4f81-8f23-ed684db1af53	9d6ddbb0-e11c-464d-8e53-04aded80262f	PEDIATRIC_INTENSIVE_CARE	Pediatric Intensive Care	\N	8	t	t	2026-10-13 08:02:49.671	2026-10-13 08:08:05.758
ac1d9f2a-047b-48ca-a802-bc1940a3e2e5	f5f65033-ce50-4764-a47d-e4c2d3d2b148	OBSTETRICS	Obstetrics	\N	1	t	t	2026-10-13 08:02:49.674	2026-10-13 08:08:05.759
8b587ae9-c4ab-4261-9a81-dc137fbf84ee	f5f65033-ce50-4764-a47d-e4c2d3d2b148	GYNECOLOGY	Gynecology	\N	2	t	t	2026-10-13 08:02:49.676	2026-10-13 08:08:05.759
5428e0ef-e465-4704-bdc6-6007d260eab4	f5f65033-ce50-4764-a47d-e4c2d3d2b148	MATERNAL_AND_FETAL_MEDICINE	Maternal & Fetal Medicine	\N	3	t	t	2026-10-13 08:02:49.679	2026-10-13 08:08:05.759
f5c38f70-56d1-4535-abfe-018bc1b7567d	f5f65033-ce50-4764-a47d-e4c2d3d2b148	REPRODUCTIVE_MEDICINE	Reproductive Medicine	\N	4	t	t	2026-10-13 08:02:49.68	2026-10-13 08:08:05.76
aab0d7a8-7864-4ce1-bb4f-12044e442cf7	f5f65033-ce50-4764-a47d-e4c2d3d2b148	GYNECOLOGIC_ONCOLOGY	Gynecologic Oncology	\N	5	t	t	2026-10-13 08:02:49.682	2026-10-13 08:08:05.76
8028acec-d51d-45b6-9760-76d1a66c24b2	f5f65033-ce50-4764-a47d-e4c2d3d2b148	UROGYNECOLOGY	Urogynecology	\N	6	t	t	2026-10-13 08:02:49.685	2026-10-13 08:08:05.761
d1c57836-4fc2-4836-912d-e1f175b3c8eb	f5f65033-ce50-4764-a47d-e4c2d3d2b148	INFERTILITY	Infertility	\N	7	t	t	2026-10-13 08:02:49.687	2026-10-13 08:08:05.761
305686bc-b3d3-4b9e-83b6-e32843a7fb07	f5f65033-ce50-4764-a47d-e4c2d3d2b148	HIGH_RISK_PREGNANCY	High-risk Pregnancy	\N	8	t	t	2026-10-13 08:02:49.689	2026-10-13 08:08:05.761
4faeaddc-f01d-4e96-a543-66ffa5da3513	d81e7b9a-22d3-43e8-91cb-94100e932839	CLINICAL_DERMATOLOGY	Clinical Dermatology	\N	1	t	t	2026-10-13 08:02:49.691	2026-10-13 08:08:05.762
436b08b0-c2cb-4fcd-84f8-f231434a3999	d81e7b9a-22d3-43e8-91cb-94100e932839	COSMETIC_DERMATOLOGY	Cosmetic Dermatology	\N	2	t	t	2026-10-13 08:02:49.694	2026-10-13 08:08:05.762
55e323ed-f259-4b43-a28e-7f6205e5c55f	d81e7b9a-22d3-43e8-91cb-94100e932839	DERMATOSURGERY	Dermatosurgery	\N	3	t	t	2026-10-13 08:02:49.696	2026-10-13 08:08:05.762
cecdd2de-8bc4-40de-84e4-d64f03264184	d81e7b9a-22d3-43e8-91cb-94100e932839	PEDIATRIC_DERMATOLOGY	Pediatric Dermatology	\N	4	t	t	2026-10-13 08:02:49.698	2026-10-13 08:08:05.763
4b50873b-52d4-496c-bef3-dfb76ab69f33	d81e7b9a-22d3-43e8-91cb-94100e932839	TRICHOLOGY	Trichology	\N	5	t	t	2026-10-13 08:02:49.7	2026-10-13 08:08:05.763
92a52e8c-9d9b-44bf-b3b9-f554de35567b	00defb80-77ed-461a-9961-bd00a0afc4e3	CATARACT_SURGERY	Cataract Surgery	\N	1	t	t	2026-10-13 08:02:49.703	2026-10-13 08:08:05.763
8beac667-2631-44b8-b5f8-7407e6f13e63	00defb80-77ed-461a-9961-bd00a0afc4e3	RETINA	Retina	\N	2	t	t	2026-10-13 08:02:49.706	2026-10-13 08:08:05.764
f69dafe7-a127-4542-80d4-2a6bcf703f6b	00defb80-77ed-461a-9961-bd00a0afc4e3	CORNEA	Cornea	\N	3	t	t	2026-10-13 08:02:49.708	2026-10-13 08:08:05.764
43c53c1f-bd69-48e8-b023-6ae6d6102299	00defb80-77ed-461a-9961-bd00a0afc4e3	GLAUCOMA	Glaucoma	\N	4	t	t	2026-10-13 08:02:49.711	2026-10-13 08:08:05.764
7bf2e0d8-3f5e-44ee-a7fa-dd8cf27ebf53	00defb80-77ed-461a-9961-bd00a0afc4e3	PEDIATRIC_OPHTHALMOLOGY	Pediatric Ophthalmology	\N	5	t	t	2026-10-13 08:02:49.713	2026-10-13 08:08:05.765
aa523b04-e6bc-4781-8cd0-2cd94b332b19	00defb80-77ed-461a-9961-bd00a0afc4e3	OCULOPLASTY	Oculoplasty	\N	6	t	t	2026-10-13 08:02:49.714	2026-10-13 08:08:05.765
724661d0-d85d-4e13-ab3e-a166980517be	bd17449b-5812-40ed-9c94-b8f1494701e3	OTOLOGY	Otology	\N	1	t	t	2026-10-13 08:02:49.716	2026-10-13 08:08:05.766
bad8f8af-ee02-4b74-a990-7678c977c909	bd17449b-5812-40ed-9c94-b8f1494701e3	RHINOLOGY	Rhinology	\N	2	t	t	2026-10-13 08:02:49.718	2026-10-13 08:08:05.766
436adac9-ce9a-4a26-a1d7-910b82baef55	bd17449b-5812-40ed-9c94-b8f1494701e3	LARYNGOLOGY	Laryngology	\N	3	t	t	2026-10-13 08:02:49.721	2026-10-13 08:08:05.766
58f161a5-9390-404f-a4d9-65d5f6de8c9a	bd17449b-5812-40ed-9c94-b8f1494701e3	HEAD_AND_NECK_SURGERY	Head & Neck Surgery	\N	4	t	t	2026-10-13 08:02:49.723	2026-10-13 08:08:05.766
638d4332-1165-437d-b415-eb831d9c9cd5	bd17449b-5812-40ed-9c94-b8f1494701e3	AUDIOLOGY	Audiology	\N	5	t	t	2026-10-13 08:02:49.726	2026-10-13 08:08:05.767
4a6ea014-9565-43c6-a12d-e9592d0cb7e4	de3b66d5-d89b-45aa-b008-827ef3d23050	ADULT_PSYCHIATRY	Adult Psychiatry	\N	1	t	t	2026-10-13 08:02:49.728	2026-10-13 08:08:05.767
0318dc07-4d44-4f00-81b0-05ed8f6ea82e	de3b66d5-d89b-45aa-b008-827ef3d23050	CHILD_PSYCHIATRY	Child Psychiatry	\N	2	t	t	2026-10-13 08:02:49.73	2026-10-13 08:08:05.767
3e41a05b-9727-4c2a-8a98-f6f7ca9efe90	de3b66d5-d89b-45aa-b008-827ef3d23050	ADDICTION_MEDICINE	Addiction Medicine	\N	3	t	t	2026-10-13 08:02:49.733	2026-10-13 08:08:05.768
fea43609-c3a4-419b-be64-9f2b2e8c7210	de3b66d5-d89b-45aa-b008-827ef3d23050	GERIATRIC_PSYCHIATRY	Geriatric Psychiatry	\N	4	t	t	2026-10-13 08:02:49.737	2026-10-13 08:08:05.768
c1682c5b-3956-46ad-a6bf-b4565af1f95c	de3b66d5-d89b-45aa-b008-827ef3d23050	CONSULTATION_LIAISON_PSYCHIATRY	Consultation Liaison Psychiatry	\N	5	t	t	2026-10-13 08:02:49.74	2026-10-13 08:08:05.768
bdfa515c-adcf-4873-a029-5c74133eb8c0	74683990-27b5-49f0-863e-d2aafa8fdfb6	SLEEP_MEDICINE	Sleep Medicine	\N	1	t	t	2026-10-13 08:02:49.743	2026-10-13 08:08:05.769
60d86791-423c-4c79-b9ed-486e3741715f	74683990-27b5-49f0-863e-d2aafa8fdfb6	CRITICAL_CARE_PULMONOLOGY	Critical Care Pulmonology	\N	2	t	t	2026-10-13 08:02:49.746	2026-10-13 08:08:05.769
00f08d4d-c064-4265-a40c-560c5a5cd484	74683990-27b5-49f0-863e-d2aafa8fdfb6	INTERVENTIONAL_PULMONOLOGY	Interventional Pulmonology	\N	3	t	t	2026-10-13 08:02:49.749	2026-10-13 08:08:05.77
e8692258-f5ef-44fe-8da0-9ac4e050ac6d	74683990-27b5-49f0-863e-d2aafa8fdfb6	ASTHMA	Asthma	\N	4	t	t	2026-10-13 08:02:49.752	2026-10-13 08:08:05.77
6b19bfe7-87ee-4a66-aebb-5bb46dc819fd	74683990-27b5-49f0-863e-d2aafa8fdfb6	COPD	COPD	\N	5	t	t	2026-10-13 08:02:49.755	2026-10-13 08:08:05.77
bb89463c-353f-4e13-897d-0f2b2178ef59	7e2f0842-8a1a-4311-893a-c28ea2d0a37f	HEPATOLOGY	Hepatology	\N	1	t	t	2026-10-13 08:02:49.759	2026-10-13 08:08:05.771
6ffc2b7b-0307-490c-8505-79f003ac5a34	7e2f0842-8a1a-4311-893a-c28ea2d0a37f	THERAPEUTIC_ENDOSCOPY	Therapeutic Endoscopy	\N	2	t	t	2026-10-13 08:02:49.762	2026-10-13 08:08:05.771
7aceabab-ceb1-492a-a5d0-045f21939e63	7e2f0842-8a1a-4311-893a-c28ea2d0a37f	INFLAMMATORY_BOWEL_DISEASE	Inflammatory Bowel Disease	\N	3	t	t	2026-10-13 08:02:49.764	2026-10-13 08:08:05.771
554df602-69e2-4af2-a303-3e9f980ba32b	7e2f0842-8a1a-4311-893a-c28ea2d0a37f	PANCREATOLOGY	Pancreatology	\N	4	t	t	2026-10-13 08:02:49.768	2026-10-13 08:08:05.772
0ed46953-0124-4f2a-9aac-bd2efbb08469	7e2f0842-8a1a-4311-893a-c28ea2d0a37f	GI_MOTILITY	GI Motility	\N	5	t	t	2026-10-13 08:02:49.771	2026-10-13 08:08:05.772
357e85cd-ccc5-4523-b56e-6bc798ddc2e3	75b5fbd6-cef2-4874-b9e1-5c053195ac2e	DIALYSIS	Dialysis	\N	1	t	t	2026-10-13 08:02:49.774	2026-10-13 08:08:05.772
9b9e46d3-d26f-4b1c-8c0d-5971383b643d	75b5fbd6-cef2-4874-b9e1-5c053195ac2e	RENAL_TRANSPLANT	Renal Transplant	\N	2	t	t	2026-10-13 08:02:49.777	2026-10-13 08:08:05.773
b9ae8bc5-5d46-4651-a338-596bc90b0bc8	75b5fbd6-cef2-4874-b9e1-5c053195ac2e	CRITICAL_CARE_NEPHROLOGY	Critical Care Nephrology	\N	3	t	t	2026-10-13 08:02:49.78	2026-10-13 08:08:05.773
56dfd43d-8a32-49e4-bb9c-97c7258f3e60	75b5fbd6-cef2-4874-b9e1-5c053195ac2e	PEDIATRIC_NEPHROLOGY	Pediatric Nephrology	\N	4	t	t	2026-10-13 08:02:49.783	2026-10-13 08:08:05.773
734bb5e1-874b-4092-b68e-e627e36ddd36	2ae661a6-d369-447f-a57f-79f3878b4017	ENDOUROLOGY	Endourology	\N	1	t	t	2026-10-13 08:02:49.786	2026-10-13 08:08:05.774
65b92841-e724-4c34-b795-35113ccc9b0b	2ae661a6-d369-447f-a57f-79f3878b4017	UROLOGIC_ONCOLOGY	Urologic Oncology	\N	2	t	t	2026-10-13 08:02:49.789	2026-10-13 08:08:05.774
f5852f86-d276-40ae-ba62-d346065f5b6d	2ae661a6-d369-447f-a57f-79f3878b4017	ANDROLOGY	Andrology	\N	3	t	t	2026-10-13 08:02:49.792	2026-10-13 08:08:05.775
76767c42-a59b-4e19-9974-928066ce5e9c	2ae661a6-d369-447f-a57f-79f3878b4017	FEMALE_UROLOGY	Female Urology	\N	4	t	t	2026-10-13 08:02:49.795	2026-10-13 08:08:05.775
69a1854d-bda7-40ee-a6a4-7fbda0f30e92	2ae661a6-d369-447f-a57f-79f3878b4017	PEDIATRIC_UROLOGY	Pediatric Urology	\N	5	t	t	2026-10-13 08:02:49.797	2026-10-13 08:08:05.775
99fe0e5b-a1b4-4c65-9bf4-556993e2ed7f	35cc8b8b-da38-4cfc-a435-ae4465de8236	MEDICAL_ONCOLOGY	Medical Oncology	\N	1	t	t	2026-10-13 08:02:49.799	2026-10-13 08:08:05.775
36a0d616-fd30-4f54-b821-af3da70300b6	35cc8b8b-da38-4cfc-a435-ae4465de8236	SURGICAL_ONCOLOGY	Surgical Oncology	\N	2	t	t	2026-10-13 08:02:49.802	2026-10-13 08:08:05.776
a370c37f-acae-429b-a4bc-f052b9c44499	35cc8b8b-da38-4cfc-a435-ae4465de8236	RADIATION_ONCOLOGY	Radiation Oncology	\N	3	t	t	2026-10-13 08:02:49.805	2026-10-13 08:08:05.776
dc5ec3db-d330-42be-8863-de57d2c5bcb4	35cc8b8b-da38-4cfc-a435-ae4465de8236	HEMATOLOGIC_ONCOLOGY	Hematologic Oncology	\N	4	t	t	2026-10-13 08:02:49.808	2026-10-13 08:08:05.777
8fda2d49-ce0c-4e38-bf34-819677f51fe1	35cc8b8b-da38-4cfc-a435-ae4465de8236	PALLIATIVE_ONCOLOGY	Palliative Oncology	\N	5	t	t	2026-10-13 08:02:49.811	2026-10-13 08:08:05.777
fd482d70-eb5d-43b5-98fb-178c5016127d	bee94992-0eb9-4d08-bf5f-5571bd7d7520	DIABETES	Diabetes	\N	1	t	t	2026-10-13 08:02:49.815	2026-10-13 08:08:05.777
097bf858-87c1-4bef-a566-5f5ffda11fc5	bee94992-0eb9-4d08-bf5f-5571bd7d7520	THYROID_DISORDERS	Thyroid Disorders	\N	2	t	t	2026-10-13 08:02:49.818	2026-10-13 08:08:05.777
945faca4-eb00-466d-b306-d89835dc334e	bee94992-0eb9-4d08-bf5f-5571bd7d7520	PITUITARY_DISORDERS	Pituitary Disorders	\N	3	t	t	2026-10-13 08:02:49.821	2026-10-13 08:08:05.778
811f2f7a-f319-4360-8871-7e5135bd34f1	bee94992-0eb9-4d08-bf5f-5571bd7d7520	METABOLIC_DISORDERS	Metabolic Disorders	\N	4	t	t	2026-10-13 08:02:49.824	2026-10-13 08:08:05.778
cb8d1fb7-5913-464b-b5b2-6397a437df5f	bee94992-0eb9-4d08-bf5f-5571bd7d7520	OSTEOPOROSIS	Osteoporosis	\N	5	t	t	2026-10-13 08:02:49.826	2026-10-13 08:08:05.778
6a2996ce-351a-4050-910a-913b355bba49	3c6bf88d-1b48-4b11-b5e7-efa15bf37700	TRAUMA_CARE	Trauma Care	\N	1	t	t	2026-10-13 08:02:49.828	2026-10-13 08:08:05.779
02d5d6aa-9055-4cc5-a144-75636f94864d	3c6bf88d-1b48-4b11-b5e7-efa15bf37700	TOXICOLOGY	Toxicology	\N	2	t	t	2026-10-13 08:02:49.829	2026-10-13 08:08:05.779
52d27052-78f1-41a4-a1f0-a22649d87b12	3c6bf88d-1b48-4b11-b5e7-efa15bf37700	DISASTER_MEDICINE	Disaster Medicine	\N	3	t	t	2026-10-13 08:02:49.831	2026-10-13 08:08:05.779
0af7c95f-8f22-4c3d-b354-8123e535d763	3c6bf88d-1b48-4b11-b5e7-efa15bf37700	EMERGENCY_ULTRASOUND	Emergency Ultrasound	\N	4	t	t	2026-10-13 08:02:49.832	2026-10-13 08:08:05.78
9fc56b66-b64a-4bb6-a360-a6bcc68726b8	4daeae5d-dff6-45cf-b26a-f52ef030eccc	ADULT_ICU	Adult ICU	\N	1	t	t	2026-10-13 08:02:49.835	2026-10-13 08:08:05.78
51401824-f27d-43ad-8c73-4e363384791f	4daeae5d-dff6-45cf-b26a-f52ef030eccc	CARDIAC_ICU	Cardiac ICU	\N	2	t	t	2026-10-13 08:02:49.838	2026-10-13 08:08:05.78
464ebc47-e5c8-4322-8235-503a337f0cee	4daeae5d-dff6-45cf-b26a-f52ef030eccc	NEURO_ICU	Neuro ICU	\N	3	t	t	2026-10-13 08:02:49.841	2026-10-13 08:08:05.781
6dd43ce3-8c25-4d45-987f-0cc5f50a92c9	4daeae5d-dff6-45cf-b26a-f52ef030eccc	PEDIATRIC_ICU	Pediatric ICU	\N	4	t	t	2026-10-13 08:02:49.843	2026-10-13 08:08:05.781
a98fe6bd-f1e9-4635-8aaa-b233d870cebc	4daeae5d-dff6-45cf-b26a-f52ef030eccc	NEONATAL_ICU	Neonatal ICU	\N	5	t	t	2026-10-13 08:02:49.846	2026-10-13 08:08:05.782
8d4c5c97-a4c3-4f84-b1a4-8bb0f21a59e1	9df30012-caf8-4118-9eaa-b2ca71dddb60	DIAGNOSTIC_RADIOLOGY	Diagnostic Radiology	\N	1	t	t	2026-10-13 08:02:49.849	2026-10-13 08:08:05.782
f7202d40-dd22-4d0f-813a-b65b7f54f146	9df30012-caf8-4118-9eaa-b2ca71dddb60	INTERVENTIONAL_RADIOLOGY	Interventional Radiology	\N	2	t	t	2026-10-13 08:02:49.852	2026-10-13 08:08:05.783
518ad157-9dc8-42a0-8886-6149318d035e	9df30012-caf8-4118-9eaa-b2ca71dddb60	NEURORADIOLOGY	Neuroradiology	\N	3	t	t	2026-10-13 08:02:49.855	2026-10-13 08:08:05.783
e6b73dbc-8e53-41d9-9606-04a57a52a500	9df30012-caf8-4118-9eaa-b2ca71dddb60	MUSCULOSKELETAL_IMAGING	Musculoskeletal Imaging	\N	4	t	t	2026-10-13 08:02:49.858	2026-10-13 08:08:05.783
54c5e3b5-0551-43a1-a8c2-89bcc57c0e16	9df30012-caf8-4118-9eaa-b2ca71dddb60	BREAST_IMAGING	Breast Imaging	\N	5	t	t	2026-10-13 08:02:49.861	2026-10-13 08:08:05.784
7bba4e66-36ab-4570-a9cb-099192dc058e	9df30012-caf8-4118-9eaa-b2ca71dddb60	NUCLEAR_MEDICINE	Nuclear Medicine	\N	6	t	t	2026-10-13 08:02:49.864	2026-10-13 08:08:05.784
091b31d3-63c2-42f5-b24c-870ecc0849ad	7acd4146-3a18-4556-a109-6422cc7aa3f6	CLINICAL_PATHOLOGY	Clinical Pathology	\N	1	t	t	2026-10-13 08:02:49.867	2026-10-13 08:08:05.784
60cf2109-9632-4612-9085-ea31037e5fb8	7acd4146-3a18-4556-a109-6422cc7aa3f6	HISTOPATHOLOGY	Histopathology	\N	2	t	t	2026-10-13 08:02:49.87	2026-10-13 08:08:05.785
90a46dc7-e11c-4196-85fc-df9a0af3f84c	7acd4146-3a18-4556-a109-6422cc7aa3f6	MICROBIOLOGY	Microbiology	\N	3	t	t	2026-10-13 08:02:49.874	2026-10-13 08:08:05.785
dfde8dbf-dc91-4d7a-8313-8040f067e7e7	7acd4146-3a18-4556-a109-6422cc7aa3f6	HEMATOLOGY	Hematology	\N	4	t	t	2026-10-13 08:02:49.877	2026-10-13 08:08:05.785
7d521f47-3239-4063-b7d7-bdd7447b6bd1	7acd4146-3a18-4556-a109-6422cc7aa3f6	BIOCHEMISTRY	Biochemistry	\N	5	t	t	2026-10-13 08:02:49.879	2026-10-13 08:08:05.786
9415f82d-8789-40a5-ac7b-f4c6f9970d93	7acd4146-3a18-4556-a109-6422cc7aa3f6	MOLECULAR_DIAGNOSTICS	Molecular Diagnostics	\N	6	t	t	2026-10-13 08:02:49.881	2026-10-13 08:08:05.786
90e25961-8396-4e5f-a155-1c2f3d4c2669	7acd4146-3a18-4556-a109-6422cc7aa3f6	CYTOLOGY	Cytology	\N	7	t	t	2026-10-13 08:02:49.883	2026-10-13 08:08:05.786
c0c63e74-998c-4969-8151-4bae877500b0	849ed192-bec2-49b3-a735-6b5cccd712bc	CARDIAC_ANESTHESIA	Cardiac Anesthesia	\N	1	t	t	2026-10-13 08:02:49.885	2026-10-13 08:08:05.787
889027c6-a67b-4d84-a9c6-53d125f7e84a	849ed192-bec2-49b3-a735-6b5cccd712bc	NEURO_ANESTHESIA	Neuro Anesthesia	\N	2	t	t	2026-10-13 08:02:49.886	2026-10-13 08:08:05.787
e83ccc6f-c44e-477c-b834-3bd1c873f466	849ed192-bec2-49b3-a735-6b5cccd712bc	PEDIATRIC_ANESTHESIA	Pediatric Anesthesia	\N	3	t	t	2026-10-13 08:02:49.888	2026-10-13 08:08:05.787
4460322c-2650-4900-9ea2-cb6160ad5648	849ed192-bec2-49b3-a735-6b5cccd712bc	PAIN_MEDICINE	Pain Medicine	\N	4	t	t	2026-10-13 08:02:49.89	2026-10-13 08:08:05.788
69298347-6c54-4544-996d-2eaa917253c7	849ed192-bec2-49b3-a735-6b5cccd712bc	CRITICAL_CARE_ANESTHESIA	Critical Care Anesthesia	\N	5	t	t	2026-10-13 08:02:49.892	2026-10-13 08:08:05.788
f614bfc0-7061-4ca5-9add-66a332b0ec6a	2dae8e6c-417a-4932-ba3b-aae96054dd53	ORTHODONTICS	Orthodontics	\N	1	t	t	2026-10-13 08:02:49.895	2026-10-13 08:08:05.788
6769a9ef-abe8-4222-9055-1b9d6f08d6f7	2dae8e6c-417a-4932-ba3b-aae96054dd53	PROSTHODONTICS	Prosthodontics	\N	2	t	t	2026-10-13 08:02:49.897	2026-10-13 08:08:05.789
98ee1f70-9474-4dc3-ab48-25e3666d28ce	2dae8e6c-417a-4932-ba3b-aae96054dd53	ENDODONTICS	Endodontics	\N	4	t	t	2026-10-13 08:02:49.903	2026-10-13 08:08:05.789
3da8b78c-26fd-4540-87c4-31891d063d28	2dae8e6c-417a-4932-ba3b-aae96054dd53	ORAL_SURGERY	Oral Surgery	\N	5	t	t	2026-10-13 08:02:49.906	2026-10-13 08:08:05.79
29a57662-90a3-4a03-a357-b5497e24ee90	2dae8e6c-417a-4932-ba3b-aae96054dd53	PEDIATRIC_DENTISTRY	Pediatric Dentistry	\N	6	t	t	2026-10-13 08:02:49.909	2026-10-13 08:08:05.79
21c1ad08-0469-47ae-a070-8321b8b58914	fb8eb4c8-664e-49f5-98de-250cc4ab4ee4	MUSCULOSKELETAL_PHYSIOTHERAPY	Musculoskeletal Physiotherapy	\N	1	t	t	2026-10-13 08:02:49.912	2026-10-13 08:08:05.79
effc2236-f674-4721-9bb3-db8f4c7b9ff3	fb8eb4c8-664e-49f5-98de-250cc4ab4ee4	NEUROLOGICAL_REHABILITATION	Neurological Rehabilitation	\N	2	t	t	2026-10-13 08:02:49.915	2026-10-13 08:08:05.791
277a7fcd-0475-4210-9aff-4f0c8e28336c	fb8eb4c8-664e-49f5-98de-250cc4ab4ee4	SPORTS_REHABILITATION	Sports Rehabilitation	\N	3	t	t	2026-10-13 08:02:49.918	2026-10-13 08:08:05.791
6431af99-6ea2-42e2-ad4c-c9f4af889c42	fb8eb4c8-664e-49f5-98de-250cc4ab4ee4	GERIATRIC_PHYSIOTHERAPY	Geriatric Physiotherapy	\N	4	t	t	2026-10-13 08:02:49.921	2026-10-13 08:08:05.791
84c3f253-5cbd-4c0f-bca9-a36b3f9d58ef	fb8eb4c8-664e-49f5-98de-250cc4ab4ee4	PEDIATRIC_PHYSIOTHERAPY	Pediatric Physiotherapy	\N	5	t	t	2026-10-13 08:02:49.925	2026-10-13 08:08:05.792
9b0b9d61-1577-4104-9322-0778f1209051	f05a8c7e-d467-461e-a895-aedc2b1223b3	HOMEOPATHY	Homeopathy	\N	2	t	t	2026-10-13 08:02:49.931	2026-10-13 08:08:05.792
44ff7b51-d211-497e-ace3-44f1441da02f	f05a8c7e-d467-461e-a895-aedc2b1223b3	SIDDHA	Siddha	\N	3	t	t	2026-10-13 08:02:49.934	2026-10-13 08:08:05.793
b4fa752b-c4e8-4867-972e-095242651c16	f05a8c7e-d467-461e-a895-aedc2b1223b3	UNANI	Unani	\N	4	t	t	2026-10-13 08:02:49.937	2026-10-13 08:08:05.793
2528a5d8-6631-4346-a5bc-eab4397e3c19	f05a8c7e-d467-461e-a895-aedc2b1223b3	YOGA_AND_NATUROPATHY	Yoga & Naturopathy	\N	5	t	t	2026-10-13 08:02:49.94	2026-10-13 08:08:05.793
8466d8d1-dcd2-4c44-830b-ddb5e81b0151	f05a8c7e-d467-461e-a895-aedc2b1223b3	PANCHAKARMA	Panchakarma	\N	6	t	t	2026-10-13 08:02:49.943	2026-10-13 08:08:05.794
a7b80a8e-014a-4f9d-b973-54626f389666	f05a8c7e-d467-461e-a895-aedc2b1223b3	AYURVEDIC_SURGERY	Ayurvedic Surgery	\N	7	t	t	2026-10-13 08:02:49.946	2026-10-13 08:08:05.794
b77b9cf7-ed5d-478c-af2d-b94b22443e46	f05a8c7e-d467-461e-a895-aedc2b1223b3	AYURVEDIC_NUTRITION	Ayurvedic Nutrition	\N	8	t	t	2026-10-13 08:02:49.949	2026-10-13 08:08:05.794
dfeae15f-c951-4e49-9aed-714adea03546	56260d0b-ab0b-4e9c-863f-4da28965cb99	ACUPUNCTURE	Acupuncture	\N	1	t	t	2026-10-13 08:02:49.952	2026-10-13 08:08:05.795
1a8d45a6-d5f1-47ab-b09e-e0a40e7b55f9	56260d0b-ab0b-4e9c-863f-4da28965cb99	ACUPRESSURE	Acupressure	\N	2	t	t	2026-10-13 08:02:49.955	2026-10-13 08:08:05.795
7c446592-705c-4426-a6c1-3e6c129ac055	56260d0b-ab0b-4e9c-863f-4da28965cb99	CUPPING_THERAPY	Cupping Therapy	\N	3	t	t	2026-10-13 08:02:49.958	2026-10-13 08:08:05.795
eb0b9f8d-4a1e-4ebe-aa45-d6e0121411fc	56260d0b-ab0b-4e9c-863f-4da28965cb99	LIFESTYLE_MEDICINE	Lifestyle Medicine	\N	4	t	t	2026-10-13 08:02:49.962	2026-10-13 08:08:05.796
25a36a2a-d0fd-4ed8-9bcb-d609a13a76a6	56260d0b-ab0b-4e9c-863f-4da28965cb99	PAIN_MANAGEMENT	Pain Management	\N	5	t	t	2026-10-13 08:02:49.964	2026-10-13 08:08:05.796
a6d87df2-b9b5-4e37-b3b0-809424e9d1eb	56260d0b-ab0b-4e9c-863f-4da28965cb99	MIND_BODY_MEDICINE	Mind Body Medicine	\N	6	t	t	2026-10-13 08:02:49.967	2026-10-13 08:08:05.796
59e60dcc-fecd-4d02-8414-2ba711a0104b	56260d0b-ab0b-4e9c-863f-4da28965cb99	MEDITATION_THERAPY	Meditation Therapy	\N	7	t	t	2026-10-13 08:02:49.97	2026-10-13 08:08:05.797
6540461d-4c79-472e-8cdd-42435cdb91ca	56260d0b-ab0b-4e9c-863f-4da28965cb99	FUNCTIONAL_MEDICINE	Functional Medicine	\N	8	t	t	2026-10-13 08:02:49.973	2026-10-13 08:08:05.797
3949ccf0-6d68-48f5-a0a3-6d1e0661825b	56260d0b-ab0b-4e9c-863f-4da28965cb99	CLINICAL_NUTRITION	Clinical Nutrition	\N	9	t	t	2026-10-13 08:02:49.976	2026-10-13 08:08:05.797
44b8a3f3-b7af-40cf-8413-ab1f8fdde317	94542a63-a144-48c1-8e64-03f0ecb6783e	SMALL_ANIMAL_MEDICINE	Small Animal Medicine	\N	1	t	t	2026-10-13 08:02:49.979	2026-10-13 08:08:05.798
ea31eef7-d316-47b1-bac1-ca46870e3a36	94542a63-a144-48c1-8e64-03f0ecb6783e	LARGE_ANIMAL_MEDICINE	Large Animal Medicine	\N	2	t	t	2026-10-13 08:02:49.982	2026-10-13 08:08:05.798
3061f8ed-19f0-4f15-9c2b-4a3a789fec8b	94542a63-a144-48c1-8e64-03f0ecb6783e	COMPANION_ANIMAL_MEDICINE	Companion Animal Medicine	\N	3	t	t	2026-10-13 08:02:49.985	2026-10-13 08:08:05.798
79cd6f9d-f1f4-42ba-9fb3-1bf54f8db562	94542a63-a144-48c1-8e64-03f0ecb6783e	CANINE_MEDICINE	Canine Medicine	\N	4	t	t	2026-10-13 08:02:49.988	2026-10-13 08:08:05.799
a9811ba9-f36f-4eba-b4d1-126342088880	94542a63-a144-48c1-8e64-03f0ecb6783e	FELINE_MEDICINE	Feline Medicine	\N	5	t	t	2026-10-13 08:02:49.991	2026-10-13 08:08:05.799
c40314e7-63cd-4346-81fb-4e731ec45a1e	94542a63-a144-48c1-8e64-03f0ecb6783e	AVIAN_MEDICINE	Avian Medicine	\N	6	t	t	2026-10-13 08:02:49.994	2026-10-13 08:08:05.8
392b94f5-bff2-449e-9f4c-378bcf6f1dab	94542a63-a144-48c1-8e64-03f0ecb6783e	EQUINE_MEDICINE	Equine Medicine	\N	7	t	t	2026-10-13 08:02:49.998	2026-10-13 08:08:05.8
c461ffa1-68d7-48c1-8e9e-ffa35a13ff2e	94542a63-a144-48c1-8e64-03f0ecb6783e	BOVINE_MEDICINE	Bovine Medicine	\N	8	t	t	2026-10-13 08:02:50.001	2026-10-13 08:08:05.8
12acab13-b704-44b1-a833-0f2800f29ee6	94542a63-a144-48c1-8e64-03f0ecb6783e	WILDLIFE_MEDICINE	Wildlife Medicine	\N	9	t	t	2026-10-13 08:02:50.005	2026-10-13 08:08:05.801
e9a652ec-fca7-4f21-bc69-d829012cf688	94542a63-a144-48c1-8e64-03f0ecb6783e	ZOO_MEDICINE	Zoo Medicine	\N	10	t	t	2026-10-13 08:02:50.008	2026-10-13 08:08:05.801
dc913d36-dc6d-4ba4-8ebf-bba0d335ff6c	94542a63-a144-48c1-8e64-03f0ecb6783e	VETERINARY_SURGERY	Veterinary Surgery	\N	11	t	t	2026-10-13 08:02:50.012	2026-10-13 08:08:05.801
e96c69b7-3c15-446e-a3b9-cb3ffb3fffe3	94542a63-a144-48c1-8e64-03f0ecb6783e	VETERINARY_ORTHOPEDICS	Veterinary Orthopedics	\N	12	t	t	2026-10-13 08:02:50.015	2026-10-13 08:08:05.801
9c52b4da-31cc-478c-89d6-7b064cf7f460	94542a63-a144-48c1-8e64-03f0ecb6783e	VETERINARY_DERMATOLOGY	Veterinary Dermatology	\N	13	t	t	2026-10-13 08:02:50.018	2026-10-13 08:08:05.802
838b2911-8879-4053-ad3c-d73537e71a5f	94542a63-a144-48c1-8e64-03f0ecb6783e	VETERINARY_CARDIOLOGY	Veterinary Cardiology	\N	14	t	t	2026-10-13 08:02:50.021	2026-10-13 08:08:05.802
dada39af-75a5-4b06-822a-8830c5d8d606	94542a63-a144-48c1-8e64-03f0ecb6783e	VETERINARY_DENTISTRY	Veterinary Dentistry	\N	15	t	t	2026-10-13 08:02:50.022	2026-10-13 08:08:05.802
af063692-e12d-440b-acfc-99fb04461b19	94542a63-a144-48c1-8e64-03f0ecb6783e	VETERINARY_ONCOLOGY	Veterinary Oncology	\N	16	t	t	2026-10-13 08:02:50.024	2026-10-13 08:08:05.803
9a1ad82f-fa31-41dc-94c7-8e5024a98d83	94542a63-a144-48c1-8e64-03f0ecb6783e	VETERINARY_NEUROLOGY	Veterinary Neurology	\N	17	t	t	2026-10-13 08:02:50.026	2026-10-13 08:08:05.803
9c3a9cdd-87ed-4420-a38c-fda29a338e97	94542a63-a144-48c1-8e64-03f0ecb6783e	VETERINARY_EMERGENCY_AND_CRITICAL_CARE	Veterinary Emergency & Critical Care	\N	18	t	t	2026-10-13 08:02:50.029	2026-10-13 08:08:05.803
6d711990-ee6a-49df-bb30-b60dfd1e4811	94542a63-a144-48c1-8e64-03f0ecb6783e	VETERINARY_RADIOLOGY	Veterinary Radiology	\N	19	t	t	2026-10-13 08:02:50.032	2026-10-13 08:08:05.804
\.


--
-- Data for Name: StockReceipt; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."StockReceipt" (id, "clinicId", "receiptNumber", "supplierName", "supplierInvoiceNumber", notes, "totalAmount", "createdAt") FROM stdin;
156147a7-ee32-44a1-aa88-8fc7681c5480	599b0d53-c901-47b1-95f4-d3e84420d02c	GRN-2026-000001	Leena Pharma Inc	INVOIC-26-09-001	\N	300.00	2026-09-12 09:03:01.361
0255883d-701e-4f73-acf0-dcdba60188de	599b0d53-c901-47b1-95f4-d3e84420d02c	GRN-2026-000002	AISA Internation	INV-26-09-002	\N	600.00	2026-09-12 09:12:58.199
3a3323c2-c1ad-48c4-ad7f-bb693b92827f	68dbd989-a659-454e-9492-e5490f18bea1	GRN-2026-000001	S1	S100	\N	10.00	2026-10-13 11:10:04.237
\.


--
-- Data for Name: StockReceiptItem; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."StockReceiptItem" (id, "receiptId", "medicineId", "medicineBatchId", quantity, "purchasePrice", "sellingPrice", amount, "createdAt") FROM stdin;
737fd121-df57-411b-a188-bbeb767b08fb	156147a7-ee32-44a1-aa88-8fc7681c5480	9b5df426-3446-486a-b40b-a3a0f99be383	bcf90e92-8032-4258-91da-adf51c034e14	100	3.00	5.00	300.00	2026-09-12 09:03:01.378
4253c617-d369-4285-b522-6858cb5fad58	0255883d-701e-4f73-acf0-dcdba60188de	f6897a9e-9e3f-4d88-9676-6e1651738b2d	a6a65546-544b-4e1e-8edb-0a30cb6d9a72	100	1.00	2.00	100.00	2026-09-12 09:12:58.207
45344032-be70-4f06-bbb8-d797259a8eec	0255883d-701e-4f73-acf0-dcdba60188de	3c62245f-4b20-412c-8095-c617566c9d6e	bbaa7acb-6ffb-4bf1-8b4d-5397d266501d	100	5.00	10.00	500.00	2026-09-12 09:12:58.218
00a984e7-e509-43d9-bb4f-89378585a283	3a3323c2-c1ad-48c4-ad7f-bb693b92827f	8ab42012-7560-46a3-9997-99e39247d6ed	e1281b14-1a80-420f-a006-554280efd90c	1	10.00	15.00	10.00	2026-10-13 11:10:04.251
\.


--
-- Data for Name: User; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."User" (id, "clinicId", "firstName", "lastName", email, "passwordHash", status, "createdAt", "updatedAt", "isPlatformAdmin") FROM stdin;
a0e5ca94-98f9-4ba3-aa2f-50251476c5c4	599b0d53-c901-47b1-95f4-d3e84420d02c	Sudheesh	S	sudheesh.s@clinexa.com	$2b$10$7JBNho6q/QlBmO/RxAolguew2t5Iqqv1t47CnL.TrTgfvb19ZdgYK	ACTIVE	2026-10-11 19:43:17.044	2026-10-11 19:43:17.044	f
06609cf2-74ec-4c5d-a564-3038bf666f2f	e64604ef-6994-4f55-9a90-1045b2cebff9	Sudheesh	Sukumaran Pillai	sudheesh.s@totalhealth.com	$2b$10$tpkeR4ysS6bpqDjFzDh..OgGKlRHyZzznchwgLF0dcI7AMDT4vGWK	ACTIVE	2026-10-12 09:41:36.157	2026-10-12 09:41:36.157	f
3282e216-44bf-4eb4-bbd3-61036f2f1d2a	599b0d53-c901-47b1-95f4-d3e84420d02c	Therapist	User	therapist@clinexa.com	$2b$10$wbRt6QVV2uFyrcMcCdNRL.R/l1QhSs.AugLmITx8nMizkTlfMGqjO	ACTIVE	2026-10-12 05:07:31.992	2026-10-12 10:18:07.974	f
d18aa955-7621-4d20-a688-f06aec808613	599b0d53-c901-47b1-95f4-d3e84420d02c	Admin	User	admin@clinicworld.com	$2b$10$vL3S1IZHrMd5uVctYCevoebPVt2GrI6g9qfRah8jQuBOOm3i0aCvG	ACTIVE	2026-10-13 08:03:36.41	2026-10-13 08:03:36.41	f
d9c1236c-6499-4d63-a53a-939518ec8fd9	68dbd989-a659-454e-9492-e5490f18bea1	Admin	User	adminuser@premier.com	$2b$10$8/1zazxbjGFufsnVvE4e3.CyOVYDkx/h9F3fV/qnAdoZxa3BS0nYO	ACTIVE	2026-10-13 08:11:16.884	2026-10-13 08:11:16.884	f
92ee19ae-c875-4174-94d6-b5f3ae469ca6	68dbd989-a659-454e-9492-e5490f18bea1	Sree	M	sree@premier.com	$2b$10$Mlw6cbFU2UbwAO2Av1FsauqRk1UNA/bclA6iMhSW7p677jyHwu1Z6	ACTIVE	2026-10-13 10:34:54.783	2026-10-13 10:34:54.783	f
de8e2ec8-a9a3-4429-804b-0bc6b57ebeb2	68dbd989-a659-454e-9492-e5490f18bea1	SA	Premier	sapremier@premier.com	$2b$10$G0Dmn.C5G3IaBt067UjI5.BO9kzq43VeLNd6UzQtjOWIE7B1Aznre	ACTIVE	2026-10-13 10:53:02.564	2026-10-13 10:53:02.564	f
bc123e09-92d7-4923-a44d-d29ff555b880	599b0d53-c901-47b1-95f4-d3e84420d02c	System	Administrator	admin@clinexa.com	$2b$10$sIbDi4DfebytnJ.GIZuF.OW1./OCDVGOVcqZTNaI1hu1vL83FsWtW	ACTIVE	2026-08-03 11:30:47.588	2026-10-13 10:59:37.163	t
\.


--
-- Data for Name: UserRole; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public."UserRole" ("userId", "roleId") FROM stdin;
bc123e09-92d7-4923-a44d-d29ff555b880	95fa5ff9-6f19-4b05-96a9-80e12b667f42
a0e5ca94-98f9-4ba3-aa2f-50251476c5c4	c293413f-5401-424e-9c7b-4a2066ce5405
3282e216-44bf-4eb4-bbd3-61036f2f1d2a	58024084-8809-4297-9f43-de88d6a629b3
06609cf2-74ec-4c5d-a564-3038bf666f2f	857e8618-fc23-4787-ab4b-b568f1afb41d
d18aa955-7621-4d20-a688-f06aec808613	2b1cf69c-3d9e-4faa-bdcc-bd4c9c6df1bb
d9c1236c-6499-4d63-a53a-939518ec8fd9	dffc868a-92f9-4fae-bade-3cd9ce91028d
92ee19ae-c875-4174-94d6-b5f3ae469ca6	af3152de-2623-40ce-86f5-ff1425466f9a
de8e2ec8-a9a3-4429-804b-0bc6b57ebeb2	4cb02209-38bf-4260-be81-1d9539a6a50e
\.


--
-- Data for Name: _prisma_migrations; Type: TABLE DATA; Schema: public; Owner: clinexa
--

COPY public._prisma_migrations (id, checksum, finished_at, migration_name, logs, rolled_back_at, started_at, applied_steps_count) FROM stdin;
f2702bf2-116b-4085-9c28-0ec0f8ed1b8d	1f46a98fa9a39c94555bd6f70c0b973361da291f3da7dfcc1001e69284ca5ac0	2026-08-03 11:30:22.425427+00	20260803113022_init	\N	\N	2026-08-03 11:30:22.41766+00	1
4d0c35d7-fef4-4ff1-8263-ec073e4f99ce	8a3e505029c2a2e2048ea54ade4fba84221738b9ac01175a04ed3c0f1b1abd4a	2026-08-17 17:00:58.82817+00	20260817170058_link_prescription_to_medicine	\N	\N	2026-08-17 17:00:58.825275+00	1
b9eeebed-c6cd-4457-b00e-c967a70b9380	c956688c3988fea405481fb98606ce2dddef5e288e6ea7f110b3ba3cb1f52052	2026-08-03 12:26:28.30978+00	20260803122628_add_patients	\N	\N	2026-08-03 12:26:28.306176+00	1
ad66aefc-4343-4678-805f-aa78d3092207	77d6feef184662f7d52454aeba6e96c7ed660e03743ce7208a68d3a80cfa892d	2026-08-03 13:10:17.926112+00	20260803131017_add_departments	\N	\N	2026-08-03 13:10:17.921738+00	1
85ed81a6-5da8-4373-9031-179315253807	05306d6ccae8067dfe58926663288f8294293c27d40ac4c3843b11771d768d1e	2026-10-13 10:58:54.464566+00	20261013120000_add_platform_admin_flag	\N	\N	2026-10-13 10:58:54.456773+00	1
d1d580d2-c6ca-4704-9984-86d00274cdca	b160cfef5299c272075f08711ee18952061f257209eaf15bd419cd60327e5a61	2026-08-06 19:27:37.629968+00	20260806192737_add_doctor_module	\N	\N	2026-08-06 19:27:37.613505+00	1
6cc69919-2d17-41e8-8c42-ce9150bdf087	cb28b81622e64bb88bc0c31da35a6eb43d398bb51cfaa58bd64b14b1c14f4aae	2026-08-17 17:21:27.276512+00	20260817172127_add_pharmacy_dispensing_relations	\N	\N	2026-08-17 17:21:27.259955+00	1
c6de6bd0-3858-4688-ac35-755e745afc21	afd3b9bdd9b0d9c3e8219ea1e65ba868cb7e30135d4b40d33dcc911c3d8237b1	2026-08-06 19:32:55.326317+00	20260806193255_add_doctor_module	\N	\N	2026-08-06 19:32:55.322598+00	1
ce78ab12-4da3-40df-922a-19a57f44b8ee	b36857a586dcacf0f94da94715a5ff7713be2d9d2be83bb7568021e2fe8e71e2	2026-08-14 18:20:23.724394+00	20260814182023_add_clinical_appointments	\N	\N	2026-08-14 18:20:23.714014+00	1
d8f7473a-f354-473b-96e1-9564cf7a30d6	ad6441cdb3da75394151d520c108351ac758b4943338f95a651b91b4c343b428	2026-08-15 08:58:08.380386+00	20260815085808_add_billing	\N	\N	2026-08-15 08:58:08.373032+00	1
029288df-0689-4475-b6b6-a3be408b6697	ed76ff2da438d5f76a87ceb3680b98ccf0cf9fedfc4e1e9d0c66062602946f42	2026-09-07 19:08:11.03015+00	20260907190810_add_prescription_number	\N	\N	2026-09-07 19:08:11.013109+00	1
1aa99c31-48f8-458b-a001-ca79d73e3725	4dad2d2dafbdf8e6c8f1c65a8f70d57822fa2d48f607e5436e82760638ae77d5	2026-08-15 09:26:16.556485+00	20260815092616_invoice_number_per_clinic	\N	\N	2026-08-15 09:26:16.547668+00	1
ee5d16a2-7d6d-4bcb-a3f7-d0b31cf1cfb1	f7410f9b42ce0c46d464d1bccc1e7265569b612a2c130f1885db356301568cb1	2026-08-15 09:36:05.328349+00	20260815093605_add_lab_test	\N	\N	2026-08-15 09:36:05.324679+00	1
d2231fd4-023a-487f-8b08-1b9ec6bca247	b15b755ebef47df23845a8161c25a8bdca86a2bc333ae3e5d7c35989503bf81e	2026-08-15 09:46:30.70538+00	20260815094630_add_lab_orders	\N	\N	2026-08-15 09:46:30.698768+00	1
f1bbbb50-b9fa-4d9c-a522-957c16c3683e	2cb20b57fb1ceaad4c5ce88f3683df70091fdd5b885a2dbb1e0f8d86221088cd	2026-09-13 18:59:51.062464+00	20260914120000_add_partial_dispensing_status	\N	\N	2026-09-13 18:59:51.060166+00	1
2fe60e41-d812-413f-afaf-a04cf9c9e9a1	6a981b79617c53e0fbccccba5bb765508e144cf1559cb898aeb1c34a78013085	2026-08-15 10:00:33.035834+00	20260815100033_link_lab_order_item_invoice	\N	\N	2026-08-15 10:00:33.028076+00	1
c889ce9e-1959-4817-804c-6a9ab41457a4	f88258e2bb9a0e1bc53429b908063d40a8f610f813f7d1ad02af70530b265871	2026-08-17 16:24:28.911143+00	20260817162428_add_medicine_master	\N	\N	2026-08-17 16:24:28.904995+00	1
a799df41-bffb-4845-86d5-d5416d8e6361	b41c55e1510dad0b0cc977ea57e50d30cd39ef435ab8aa9c6ec562c1aee1f6ef	2026-08-17 16:33:56.289882+00	20260817163356_add_medicine_inventory	\N	\N	2026-08-17 16:33:56.281106+00	1
a3e382ba-d359-40da-991d-c291aa4e9a55	1cf91530c435ff228447de433a50d9d3d1e69e872f36b21a50f248cb28f81b1c	2026-09-13 19:43:49.468894+00	20260914130000_add_invoice_sequence	\N	\N	2026-09-13 19:43:49.465243+00	1
77d4faaf-3548-4206-be8e-6c66508f6610	41045d958010deb43c1f16532ee735d8c01d63f3783f8ebabc3a6f2fc67c7150	2026-10-05 09:46:13.113339+00	20261005094613_allow_multiple_invoices_per_appointment	\N	\N	2026-10-05 09:46:13.105035+00	1
6d74b52a-eefa-4f8b-80b0-f476db187373	5d4998e5629d5520e8890ee20e82438e0d184e5c98cb98c60ccaab35f0cd90df	2026-10-12 08:34:58.267971+00	20261012120000_add_clinic_code_sequence	\N	\N	2026-10-12 08:34:58.259623+00	1
fb29c629-d6a6-4b1d-b19b-7e570c9ed9a9	eaa2c83f4107fd1d51701ddc65e6f4157d54f402bceaee2d9412cc6c776fa170	2026-10-13 08:26:39.619413+00	20261013100000_add_clinic_working_hours	\N	\N	2026-10-13 08:26:39.609283+00	1
\.


--
-- Name: clinic_code_seq; Type: SEQUENCE SET; Schema: public; Owner: clinexa
--

SELECT pg_catalog.setval('public.clinic_code_seq', 4, true);


--
-- Name: Appointment Appointment_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_pkey" PRIMARY KEY (id);


--
-- Name: ClinicWorkingHours ClinicWorkingHours_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."ClinicWorkingHours"
    ADD CONSTRAINT "ClinicWorkingHours_pkey" PRIMARY KEY (id);


--
-- Name: Clinic Clinic_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Clinic"
    ADD CONSTRAINT "Clinic_pkey" PRIMARY KEY (id);


--
-- Name: Department Department_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Department"
    ADD CONSTRAINT "Department_pkey" PRIMARY KEY (id);


--
-- Name: Diagnosis Diagnosis_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Diagnosis"
    ADD CONSTRAINT "Diagnosis_pkey" PRIMARY KEY (id);


--
-- Name: DoctorConsultationFee DoctorConsultationFee_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorConsultationFee"
    ADD CONSTRAINT "DoctorConsultationFee_pkey" PRIMARY KEY ("doctorId");


--
-- Name: DoctorLanguage DoctorLanguage_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorLanguage"
    ADD CONSTRAINT "DoctorLanguage_pkey" PRIMARY KEY ("doctorId", "languageId");


--
-- Name: DoctorQualification DoctorQualification_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorQualification"
    ADD CONSTRAINT "DoctorQualification_pkey" PRIMARY KEY ("doctorId", "qualificationId");


--
-- Name: DoctorScheduleSlot DoctorScheduleSlot_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorScheduleSlot"
    ADD CONSTRAINT "DoctorScheduleSlot_pkey" PRIMARY KEY (id);


--
-- Name: DoctorSchedule DoctorSchedule_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorSchedule"
    ADD CONSTRAINT "DoctorSchedule_pkey" PRIMARY KEY (id);


--
-- Name: DoctorSpecialty DoctorSpecialty_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorSpecialty"
    ADD CONSTRAINT "DoctorSpecialty_pkey" PRIMARY KEY ("doctorId", "specialtyId");


--
-- Name: Doctor Doctor_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_pkey" PRIMARY KEY (id);


--
-- Name: InventoryTransaction InventoryTransaction_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."InventoryTransaction"
    ADD CONSTRAINT "InventoryTransaction_pkey" PRIMARY KEY (id);


--
-- Name: InvoiceItem InvoiceItem_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_pkey" PRIMARY KEY (id);


--
-- Name: Invoice Invoice_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_pkey" PRIMARY KEY (id);


--
-- Name: LabOrderItem LabOrderItem_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabOrderItem"
    ADD CONSTRAINT "LabOrderItem_pkey" PRIMARY KEY (id);


--
-- Name: LabOrder LabOrder_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabOrder"
    ADD CONSTRAINT "LabOrder_pkey" PRIMARY KEY (id);


--
-- Name: LabResult LabResult_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabResult"
    ADD CONSTRAINT "LabResult_pkey" PRIMARY KEY (id);


--
-- Name: LabTest LabTest_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabTest"
    ADD CONSTRAINT "LabTest_pkey" PRIMARY KEY (id);


--
-- Name: Language Language_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Language"
    ADD CONSTRAINT "Language_pkey" PRIMARY KEY (id);


--
-- Name: MedicalRecord MedicalRecord_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_pkey" PRIMARY KEY (id);


--
-- Name: MedicineBatch MedicineBatch_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."MedicineBatch"
    ADD CONSTRAINT "MedicineBatch_pkey" PRIMARY KEY (id);


--
-- Name: Medicine Medicine_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Medicine"
    ADD CONSTRAINT "Medicine_pkey" PRIMARY KEY (id);


--
-- Name: Patient Patient_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Patient"
    ADD CONSTRAINT "Patient_pkey" PRIMARY KEY (id);


--
-- Name: Payment Payment_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_pkey" PRIMARY KEY (id);


--
-- Name: PermissionGroup PermissionGroup_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."PermissionGroup"
    ADD CONSTRAINT "PermissionGroup_pkey" PRIMARY KEY (id);


--
-- Name: Permission Permission_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_pkey" PRIMARY KEY (id);


--
-- Name: PharmacyDispensingItem PharmacyDispensingItem_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."PharmacyDispensingItem"
    ADD CONSTRAINT "PharmacyDispensingItem_pkey" PRIMARY KEY (id);


--
-- Name: PharmacyDispensing PharmacyDispensing_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."PharmacyDispensing"
    ADD CONSTRAINT "PharmacyDispensing_pkey" PRIMARY KEY (id);


--
-- Name: Prescription Prescription_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_pkey" PRIMARY KEY (id);


--
-- Name: Qualification Qualification_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Qualification"
    ADD CONSTRAINT "Qualification_pkey" PRIMARY KEY (id);


--
-- Name: RefreshToken RefreshToken_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_pkey" PRIMARY KEY (id);


--
-- Name: RegistrationCouncil RegistrationCouncil_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."RegistrationCouncil"
    ADD CONSTRAINT "RegistrationCouncil_pkey" PRIMARY KEY (id);


--
-- Name: RolePermission RolePermission_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_pkey" PRIMARY KEY ("roleId", "permissionId");


--
-- Name: Role Role_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_pkey" PRIMARY KEY (id);


--
-- Name: Specialty Specialty_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Specialty"
    ADD CONSTRAINT "Specialty_pkey" PRIMARY KEY (id);


--
-- Name: StockReceiptItem StockReceiptItem_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."StockReceiptItem"
    ADD CONSTRAINT "StockReceiptItem_pkey" PRIMARY KEY (id);


--
-- Name: StockReceipt StockReceipt_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."StockReceipt"
    ADD CONSTRAINT "StockReceipt_pkey" PRIMARY KEY (id);


--
-- Name: UserRole UserRole_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_pkey" PRIMARY KEY ("userId", "roleId");


--
-- Name: User User_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_pkey" PRIMARY KEY (id);


--
-- Name: _prisma_migrations _prisma_migrations_pkey; Type: CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public._prisma_migrations
    ADD CONSTRAINT _prisma_migrations_pkey PRIMARY KEY (id);


--
-- Name: Appointment_appointmentDate_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Appointment_appointmentDate_idx" ON public."Appointment" USING btree ("appointmentDate");


--
-- Name: Appointment_clinicId_appointmentNumber_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Appointment_clinicId_appointmentNumber_key" ON public."Appointment" USING btree ("clinicId", "appointmentNumber");


--
-- Name: Appointment_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Appointment_clinicId_idx" ON public."Appointment" USING btree ("clinicId");


--
-- Name: Appointment_doctorId_appointmentDate_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Appointment_doctorId_appointmentDate_idx" ON public."Appointment" USING btree ("doctorId", "appointmentDate");


--
-- Name: Appointment_doctorId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Appointment_doctorId_idx" ON public."Appointment" USING btree ("doctorId");


--
-- Name: Appointment_patientId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Appointment_patientId_idx" ON public."Appointment" USING btree ("patientId");


--
-- Name: Appointment_status_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Appointment_status_idx" ON public."Appointment" USING btree (status);


--
-- Name: ClinicWorkingHours_clinicId_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "ClinicWorkingHours_clinicId_key" ON public."ClinicWorkingHours" USING btree ("clinicId");


--
-- Name: Clinic_code_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Clinic_code_key" ON public."Clinic" USING btree (code);


--
-- Name: Clinic_isActive_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Clinic_isActive_idx" ON public."Clinic" USING btree ("isActive");


--
-- Name: Department_clinicId_code_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Department_clinicId_code_key" ON public."Department" USING btree ("clinicId", code);


--
-- Name: Department_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Department_clinicId_idx" ON public."Department" USING btree ("clinicId");


--
-- Name: Department_clinicId_name_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Department_clinicId_name_key" ON public."Department" USING btree ("clinicId", name);


--
-- Name: Diagnosis_medicalRecordId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Diagnosis_medicalRecordId_idx" ON public."Diagnosis" USING btree ("medicalRecordId");


--
-- Name: DoctorLanguage_languageId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "DoctorLanguage_languageId_idx" ON public."DoctorLanguage" USING btree ("languageId");


--
-- Name: DoctorQualification_qualificationId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "DoctorQualification_qualificationId_idx" ON public."DoctorQualification" USING btree ("qualificationId");


--
-- Name: DoctorScheduleSlot_dayOfWeek_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "DoctorScheduleSlot_dayOfWeek_idx" ON public."DoctorScheduleSlot" USING btree ("dayOfWeek");


--
-- Name: DoctorScheduleSlot_scheduleId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "DoctorScheduleSlot_scheduleId_idx" ON public."DoctorScheduleSlot" USING btree ("scheduleId");


--
-- Name: DoctorSchedule_doctorId_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "DoctorSchedule_doctorId_key" ON public."DoctorSchedule" USING btree ("doctorId");


--
-- Name: DoctorSpecialty_specialtyId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "DoctorSpecialty_specialtyId_idx" ON public."DoctorSpecialty" USING btree ("specialtyId");


--
-- Name: Doctor_clinicId_doctorNumber_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Doctor_clinicId_doctorNumber_key" ON public."Doctor" USING btree ("clinicId", "doctorNumber");


--
-- Name: Doctor_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Doctor_clinicId_idx" ON public."Doctor" USING btree ("clinicId");


--
-- Name: Doctor_departmentId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Doctor_departmentId_idx" ON public."Doctor" USING btree ("departmentId");


--
-- Name: Doctor_primarySpecialtyId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Doctor_primarySpecialtyId_idx" ON public."Doctor" USING btree ("primarySpecialtyId");


--
-- Name: InventoryTransaction_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "InventoryTransaction_clinicId_idx" ON public."InventoryTransaction" USING btree ("clinicId");


--
-- Name: InventoryTransaction_createdAt_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "InventoryTransaction_createdAt_idx" ON public."InventoryTransaction" USING btree ("createdAt");


--
-- Name: InventoryTransaction_medicineBatchId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "InventoryTransaction_medicineBatchId_idx" ON public."InventoryTransaction" USING btree ("medicineBatchId");


--
-- Name: InventoryTransaction_type_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "InventoryTransaction_type_idx" ON public."InventoryTransaction" USING btree (type);


--
-- Name: InvoiceItem_invoiceId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "InvoiceItem_invoiceId_idx" ON public."InvoiceItem" USING btree ("invoiceId");


--
-- Name: InvoiceItem_labOrderItemId_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "InvoiceItem_labOrderItemId_key" ON public."InvoiceItem" USING btree ("labOrderItemId");


--
-- Name: InvoiceItem_pharmacyDispensingItemId_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "InvoiceItem_pharmacyDispensingItemId_key" ON public."InvoiceItem" USING btree ("pharmacyDispensingItemId");


--
-- Name: Invoice_appointmentId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Invoice_appointmentId_idx" ON public."Invoice" USING btree ("appointmentId");


--
-- Name: Invoice_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Invoice_clinicId_idx" ON public."Invoice" USING btree ("clinicId");


--
-- Name: Invoice_clinicId_invoiceNumber_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Invoice_clinicId_invoiceNumber_key" ON public."Invoice" USING btree ("clinicId", "invoiceNumber");


--
-- Name: Invoice_createdAt_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Invoice_createdAt_idx" ON public."Invoice" USING btree ("createdAt");


--
-- Name: Invoice_patientId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Invoice_patientId_idx" ON public."Invoice" USING btree ("patientId");


--
-- Name: Invoice_status_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Invoice_status_idx" ON public."Invoice" USING btree (status);


--
-- Name: Invoice_type_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Invoice_type_idx" ON public."Invoice" USING btree (type);


--
-- Name: LabOrderItem_labOrderId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabOrderItem_labOrderId_idx" ON public."LabOrderItem" USING btree ("labOrderId");


--
-- Name: LabOrderItem_labOrderId_labTestId_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "LabOrderItem_labOrderId_labTestId_key" ON public."LabOrderItem" USING btree ("labOrderId", "labTestId");


--
-- Name: LabOrderItem_labTestId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabOrderItem_labTestId_idx" ON public."LabOrderItem" USING btree ("labTestId");


--
-- Name: LabOrderItem_status_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabOrderItem_status_idx" ON public."LabOrderItem" USING btree (status);


--
-- Name: LabOrder_appointmentId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabOrder_appointmentId_idx" ON public."LabOrder" USING btree ("appointmentId");


--
-- Name: LabOrder_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabOrder_clinicId_idx" ON public."LabOrder" USING btree ("clinicId");


--
-- Name: LabOrder_doctorId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabOrder_doctorId_idx" ON public."LabOrder" USING btree ("doctorId");


--
-- Name: LabOrder_patientId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabOrder_patientId_idx" ON public."LabOrder" USING btree ("patientId");


--
-- Name: LabOrder_status_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabOrder_status_idx" ON public."LabOrder" USING btree (status);


--
-- Name: LabResult_labOrderItemId_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "LabResult_labOrderItemId_key" ON public."LabResult" USING btree ("labOrderItemId");


--
-- Name: LabTest_category_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabTest_category_idx" ON public."LabTest" USING btree (category);


--
-- Name: LabTest_clinicId_code_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "LabTest_clinicId_code_key" ON public."LabTest" USING btree ("clinicId", code);


--
-- Name: LabTest_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabTest_clinicId_idx" ON public."LabTest" USING btree ("clinicId");


--
-- Name: LabTest_clinicId_name_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "LabTest_clinicId_name_key" ON public."LabTest" USING btree ("clinicId", name);


--
-- Name: LabTest_isActive_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "LabTest_isActive_idx" ON public."LabTest" USING btree ("isActive");


--
-- Name: Language_code_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Language_code_key" ON public."Language" USING btree (code);


--
-- Name: MedicalRecord_appointmentId_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "MedicalRecord_appointmentId_key" ON public."MedicalRecord" USING btree ("appointmentId");


--
-- Name: MedicalRecord_doctorId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "MedicalRecord_doctorId_idx" ON public."MedicalRecord" USING btree ("doctorId");


--
-- Name: MedicalRecord_patientId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "MedicalRecord_patientId_idx" ON public."MedicalRecord" USING btree ("patientId");


--
-- Name: MedicineBatch_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "MedicineBatch_clinicId_idx" ON public."MedicineBatch" USING btree ("clinicId");


--
-- Name: MedicineBatch_clinicId_medicineId_batchNumber_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "MedicineBatch_clinicId_medicineId_batchNumber_key" ON public."MedicineBatch" USING btree ("clinicId", "medicineId", "batchNumber");


--
-- Name: MedicineBatch_expiryDate_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "MedicineBatch_expiryDate_idx" ON public."MedicineBatch" USING btree ("expiryDate");


--
-- Name: MedicineBatch_isActive_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "MedicineBatch_isActive_idx" ON public."MedicineBatch" USING btree ("isActive");


--
-- Name: MedicineBatch_medicineId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "MedicineBatch_medicineId_idx" ON public."MedicineBatch" USING btree ("medicineId");


--
-- Name: Medicine_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Medicine_clinicId_idx" ON public."Medicine" USING btree ("clinicId");


--
-- Name: Medicine_genericName_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Medicine_genericName_idx" ON public."Medicine" USING btree ("genericName");


--
-- Name: Medicine_isActive_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Medicine_isActive_idx" ON public."Medicine" USING btree ("isActive");


--
-- Name: Medicine_name_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Medicine_name_idx" ON public."Medicine" USING btree (name);


--
-- Name: Patient_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Patient_clinicId_idx" ON public."Patient" USING btree ("clinicId");


--
-- Name: Patient_clinicId_patientNumber_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Patient_clinicId_patientNumber_key" ON public."Patient" USING btree ("clinicId", "patientNumber");


--
-- Name: Patient_lastName_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Patient_lastName_idx" ON public."Patient" USING btree ("lastName");


--
-- Name: Patient_phone_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Patient_phone_idx" ON public."Patient" USING btree (phone);


--
-- Name: Payment_invoiceId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Payment_invoiceId_idx" ON public."Payment" USING btree ("invoiceId");


--
-- Name: Payment_paidAt_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Payment_paidAt_idx" ON public."Payment" USING btree ("paidAt");


--
-- Name: PermissionGroup_code_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "PermissionGroup_code_key" ON public."PermissionGroup" USING btree (code);


--
-- Name: Permission_code_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Permission_code_key" ON public."Permission" USING btree (code);


--
-- Name: Permission_permissionGroupId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Permission_permissionGroupId_idx" ON public."Permission" USING btree ("permissionGroupId");


--
-- Name: PharmacyDispensingItem_dispensingId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "PharmacyDispensingItem_dispensingId_idx" ON public."PharmacyDispensingItem" USING btree ("dispensingId");


--
-- Name: PharmacyDispensingItem_medicineBatchId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "PharmacyDispensingItem_medicineBatchId_idx" ON public."PharmacyDispensingItem" USING btree ("medicineBatchId");


--
-- Name: PharmacyDispensingItem_medicineId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "PharmacyDispensingItem_medicineId_idx" ON public."PharmacyDispensingItem" USING btree ("medicineId");


--
-- Name: PharmacyDispensing_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "PharmacyDispensing_clinicId_idx" ON public."PharmacyDispensing" USING btree ("clinicId");


--
-- Name: PharmacyDispensing_invoiceId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "PharmacyDispensing_invoiceId_idx" ON public."PharmacyDispensing" USING btree ("invoiceId");


--
-- Name: PharmacyDispensing_prescriptionId_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "PharmacyDispensing_prescriptionId_key" ON public."PharmacyDispensing" USING btree ("prescriptionId");


--
-- Name: Prescription_medicalRecordId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Prescription_medicalRecordId_idx" ON public."Prescription" USING btree ("medicalRecordId");


--
-- Name: Prescription_medicineId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Prescription_medicineId_idx" ON public."Prescription" USING btree ("medicineId");


--
-- Name: Prescription_prescriptionNumber_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Prescription_prescriptionNumber_key" ON public."Prescription" USING btree ("prescriptionNumber");


--
-- Name: Qualification_code_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Qualification_code_key" ON public."Qualification" USING btree (code);


--
-- Name: RefreshToken_expiresAt_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "RefreshToken_expiresAt_idx" ON public."RefreshToken" USING btree ("expiresAt");


--
-- Name: RefreshToken_token_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "RefreshToken_token_key" ON public."RefreshToken" USING btree (token);


--
-- Name: RefreshToken_userId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "RefreshToken_userId_idx" ON public."RefreshToken" USING btree ("userId");


--
-- Name: RegistrationCouncil_code_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "RegistrationCouncil_code_key" ON public."RegistrationCouncil" USING btree (code);


--
-- Name: RolePermission_permissionId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "RolePermission_permissionId_idx" ON public."RolePermission" USING btree ("permissionId");


--
-- Name: Role_clinicId_code_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Role_clinicId_code_key" ON public."Role" USING btree ("clinicId", code);


--
-- Name: Role_clinicId_name_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Role_clinicId_name_key" ON public."Role" USING btree ("clinicId", name);


--
-- Name: Specialty_departmentId_code_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Specialty_departmentId_code_key" ON public."Specialty" USING btree ("departmentId", code);


--
-- Name: Specialty_departmentId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "Specialty_departmentId_idx" ON public."Specialty" USING btree ("departmentId");


--
-- Name: Specialty_departmentId_name_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "Specialty_departmentId_name_key" ON public."Specialty" USING btree ("departmentId", name);


--
-- Name: StockReceiptItem_medicineBatchId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "StockReceiptItem_medicineBatchId_idx" ON public."StockReceiptItem" USING btree ("medicineBatchId");


--
-- Name: StockReceiptItem_medicineId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "StockReceiptItem_medicineId_idx" ON public."StockReceiptItem" USING btree ("medicineId");


--
-- Name: StockReceiptItem_receiptId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "StockReceiptItem_receiptId_idx" ON public."StockReceiptItem" USING btree ("receiptId");


--
-- Name: StockReceipt_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "StockReceipt_clinicId_idx" ON public."StockReceipt" USING btree ("clinicId");


--
-- Name: StockReceipt_clinicId_receiptNumber_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "StockReceipt_clinicId_receiptNumber_key" ON public."StockReceipt" USING btree ("clinicId", "receiptNumber");


--
-- Name: UserRole_roleId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "UserRole_roleId_idx" ON public."UserRole" USING btree ("roleId");


--
-- Name: User_clinicId_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "User_clinicId_idx" ON public."User" USING btree ("clinicId");


--
-- Name: User_email_key; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE UNIQUE INDEX "User_email_key" ON public."User" USING btree (email);


--
-- Name: User_status_idx; Type: INDEX; Schema: public; Owner: clinexa
--

CREATE INDEX "User_status_idx" ON public."User" USING btree (status);


--
-- Name: Appointment Appointment_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Appointment Appointment_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Appointment Appointment_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Appointment"
    ADD CONSTRAINT "Appointment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: ClinicWorkingHours ClinicWorkingHours_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."ClinicWorkingHours"
    ADD CONSTRAINT "ClinicWorkingHours_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Department Department_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Department"
    ADD CONSTRAINT "Department_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Diagnosis Diagnosis_medicalRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Diagnosis"
    ADD CONSTRAINT "Diagnosis_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES public."MedicalRecord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorConsultationFee DoctorConsultationFee_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorConsultationFee"
    ADD CONSTRAINT "DoctorConsultationFee_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorLanguage DoctorLanguage_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorLanguage"
    ADD CONSTRAINT "DoctorLanguage_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorLanguage DoctorLanguage_languageId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorLanguage"
    ADD CONSTRAINT "DoctorLanguage_languageId_fkey" FOREIGN KEY ("languageId") REFERENCES public."Language"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DoctorQualification DoctorQualification_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorQualification"
    ADD CONSTRAINT "DoctorQualification_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorQualification DoctorQualification_qualificationId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorQualification"
    ADD CONSTRAINT "DoctorQualification_qualificationId_fkey" FOREIGN KEY ("qualificationId") REFERENCES public."Qualification"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: DoctorScheduleSlot DoctorScheduleSlot_scheduleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorScheduleSlot"
    ADD CONSTRAINT "DoctorScheduleSlot_scheduleId_fkey" FOREIGN KEY ("scheduleId") REFERENCES public."DoctorSchedule"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorSchedule DoctorSchedule_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorSchedule"
    ADD CONSTRAINT "DoctorSchedule_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorSpecialty DoctorSpecialty_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorSpecialty"
    ADD CONSTRAINT "DoctorSpecialty_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: DoctorSpecialty DoctorSpecialty_specialtyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."DoctorSpecialty"
    ADD CONSTRAINT "DoctorSpecialty_specialtyId_fkey" FOREIGN KEY ("specialtyId") REFERENCES public."Specialty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Doctor Doctor_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Doctor Doctor_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Doctor Doctor_primarySpecialtyId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_primarySpecialtyId_fkey" FOREIGN KEY ("primarySpecialtyId") REFERENCES public."Specialty"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Doctor Doctor_registrationCouncilId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Doctor"
    ADD CONSTRAINT "Doctor_registrationCouncilId_fkey" FOREIGN KEY ("registrationCouncilId") REFERENCES public."RegistrationCouncil"(id) ON UPDATE CASCADE ON DELETE SET NULL;


--
-- Name: InventoryTransaction InventoryTransaction_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."InventoryTransaction"
    ADD CONSTRAINT "InventoryTransaction_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InventoryTransaction InventoryTransaction_medicineBatchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."InventoryTransaction"
    ADD CONSTRAINT "InventoryTransaction_medicineBatchId_fkey" FOREIGN KEY ("medicineBatchId") REFERENCES public."MedicineBatch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InvoiceItem InvoiceItem_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: InvoiceItem InvoiceItem_labOrderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_labOrderItemId_fkey" FOREIGN KEY ("labOrderItemId") REFERENCES public."LabOrderItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: InvoiceItem InvoiceItem_pharmacyDispensingItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."InvoiceItem"
    ADD CONSTRAINT "InvoiceItem_pharmacyDispensingItemId_fkey" FOREIGN KEY ("pharmacyDispensingItemId") REFERENCES public."PharmacyDispensingItem"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invoice Invoice_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invoice Invoice_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Invoice Invoice_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Invoice"
    ADD CONSTRAINT "Invoice_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LabOrderItem LabOrderItem_labOrderId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabOrderItem"
    ADD CONSTRAINT "LabOrderItem_labOrderId_fkey" FOREIGN KEY ("labOrderId") REFERENCES public."LabOrder"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LabOrderItem LabOrderItem_labTestId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabOrderItem"
    ADD CONSTRAINT "LabOrderItem_labTestId_fkey" FOREIGN KEY ("labTestId") REFERENCES public."LabTest"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LabOrder LabOrder_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabOrder"
    ADD CONSTRAINT "LabOrder_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LabOrder LabOrder_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabOrder"
    ADD CONSTRAINT "LabOrder_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LabOrder LabOrder_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabOrder"
    ADD CONSTRAINT "LabOrder_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LabOrder LabOrder_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabOrder"
    ADD CONSTRAINT "LabOrder_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: LabResult LabResult_labOrderItemId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabResult"
    ADD CONSTRAINT "LabResult_labOrderItemId_fkey" FOREIGN KEY ("labOrderItemId") REFERENCES public."LabOrderItem"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: LabTest LabTest_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."LabTest"
    ADD CONSTRAINT "LabTest_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MedicalRecord MedicalRecord_appointmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES public."Appointment"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MedicalRecord MedicalRecord_doctorId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_doctorId_fkey" FOREIGN KEY ("doctorId") REFERENCES public."Doctor"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MedicalRecord MedicalRecord_patientId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."MedicalRecord"
    ADD CONSTRAINT "MedicalRecord_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES public."Patient"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MedicineBatch MedicineBatch_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."MedicineBatch"
    ADD CONSTRAINT "MedicineBatch_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: MedicineBatch MedicineBatch_medicineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."MedicineBatch"
    ADD CONSTRAINT "MedicineBatch_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES public."Medicine"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Medicine Medicine_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Medicine"
    ADD CONSTRAINT "Medicine_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Patient Patient_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Patient"
    ADD CONSTRAINT "Patient_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Payment Payment_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Payment"
    ADD CONSTRAINT "Payment_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Permission Permission_permissionGroupId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Permission"
    ADD CONSTRAINT "Permission_permissionGroupId_fkey" FOREIGN KEY ("permissionGroupId") REFERENCES public."PermissionGroup"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PharmacyDispensingItem PharmacyDispensingItem_dispensingId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."PharmacyDispensingItem"
    ADD CONSTRAINT "PharmacyDispensingItem_dispensingId_fkey" FOREIGN KEY ("dispensingId") REFERENCES public."PharmacyDispensing"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: PharmacyDispensingItem PharmacyDispensingItem_medicineBatchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."PharmacyDispensingItem"
    ADD CONSTRAINT "PharmacyDispensingItem_medicineBatchId_fkey" FOREIGN KEY ("medicineBatchId") REFERENCES public."MedicineBatch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PharmacyDispensingItem PharmacyDispensingItem_medicineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."PharmacyDispensingItem"
    ADD CONSTRAINT "PharmacyDispensingItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES public."Medicine"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PharmacyDispensing PharmacyDispensing_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."PharmacyDispensing"
    ADD CONSTRAINT "PharmacyDispensing_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PharmacyDispensing PharmacyDispensing_invoiceId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."PharmacyDispensing"
    ADD CONSTRAINT "PharmacyDispensing_invoiceId_fkey" FOREIGN KEY ("invoiceId") REFERENCES public."Invoice"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: PharmacyDispensing PharmacyDispensing_prescriptionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."PharmacyDispensing"
    ADD CONSTRAINT "PharmacyDispensing_prescriptionId_fkey" FOREIGN KEY ("prescriptionId") REFERENCES public."Prescription"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Prescription Prescription_medicalRecordId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_medicalRecordId_fkey" FOREIGN KEY ("medicalRecordId") REFERENCES public."MedicalRecord"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Prescription Prescription_medicineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Prescription"
    ADD CONSTRAINT "Prescription_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES public."Medicine"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: RefreshToken RefreshToken_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."RefreshToken"
    ADD CONSTRAINT "RefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_permissionId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES public."Permission"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: RolePermission RolePermission_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."RolePermission"
    ADD CONSTRAINT "RolePermission_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: Role Role_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Role"
    ADD CONSTRAINT "Role_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: Specialty Specialty_departmentId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."Specialty"
    ADD CONSTRAINT "Specialty_departmentId_fkey" FOREIGN KEY ("departmentId") REFERENCES public."Department"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockReceiptItem StockReceiptItem_medicineBatchId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."StockReceiptItem"
    ADD CONSTRAINT "StockReceiptItem_medicineBatchId_fkey" FOREIGN KEY ("medicineBatchId") REFERENCES public."MedicineBatch"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockReceiptItem StockReceiptItem_medicineId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."StockReceiptItem"
    ADD CONSTRAINT "StockReceiptItem_medicineId_fkey" FOREIGN KEY ("medicineId") REFERENCES public."Medicine"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: StockReceiptItem StockReceiptItem_receiptId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."StockReceiptItem"
    ADD CONSTRAINT "StockReceiptItem_receiptId_fkey" FOREIGN KEY ("receiptId") REFERENCES public."StockReceipt"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: StockReceipt StockReceipt_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."StockReceipt"
    ADD CONSTRAINT "StockReceipt_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- Name: UserRole UserRole_roleId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_roleId_fkey" FOREIGN KEY ("roleId") REFERENCES public."Role"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: UserRole UserRole_userId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."UserRole"
    ADD CONSTRAINT "UserRole_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id) ON UPDATE CASCADE ON DELETE CASCADE;


--
-- Name: User User_clinicId_fkey; Type: FK CONSTRAINT; Schema: public; Owner: clinexa
--

ALTER TABLE ONLY public."User"
    ADD CONSTRAINT "User_clinicId_fkey" FOREIGN KEY ("clinicId") REFERENCES public."Clinic"(id) ON UPDATE CASCADE ON DELETE RESTRICT;


--
-- PostgreSQL database dump complete
--

\unrestrict cW3xDwCGmrMZhEDaNa64oBYsH0X19GbbqGoB09WGTfMfI4dfRpNqCRPioeJhEQF

