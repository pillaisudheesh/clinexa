import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";

import { ProtectedRoute } from "@/auth/protected-route";

import { DashboardPage } from "./pages/dashboard";
import { LoginPage } from "@/pages/auth/login-page";
import { PatientsPage } from "@/pages/patients/patients-page";
import { PatientRegistrationPage } from "@/pages/patients/patient-registration-page";
import { PatientProfilePage } from "@/pages/patients/patient-profile-page";
import { AppointmentsPage } from "@/pages/appointments/appointments-page";
import { ConsultationPage } from "@/pages/consultations/consultation-page";
import { MedicinesPage } from "@/pages/medicines/medicines-page";
import PharmacyPage from "@/pages/pharmacy/pharmacy-page";
import { InventoryPage } from "@/pages/inventory/inventory-page";
import { LaboratoryPage } from "./pages/laboratory/laboratory-page";
import DoctorRegistrationPage from "@/pages/doctors/DoctorRegistrationPage";
import { DoctorsPage } from "./pages/doctors/DoctorsPage";
import { DoctorProfilePage } from "@/pages/doctors/DoctorProfilePage";
import { BillingPage } from "@/pages/billing/billing-page";
import InvoiceDetailPage from "@/pages/billing/invoice-detail-page";
import { Patient360Page } from "./pages/patients/patient-360-page";
import { ReportsPage } from "./pages/reports/reports-page";
import { SettingsPage } from "./pages/settings/settings-page";
import { ClinicsPage } from "./pages/clinics/clinics-page";
import { ClinicConfigurationPage } from "./pages/clinics/clinic-configuration-page";
import { DepartmentsPage } from "./pages/departments/departments-page";
import { ChangePasswordPage } from "@/pages/auth/change-password-page";
import { ForgotPasswordPage } from "./pages/auth/forgot-password-page";
import { ResetPasswordPage } from "./pages/auth/reset-password-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
  },
  { path: "/reset-password", element: <ResetPasswordPage /> },
  { path: "/change-password", element: <ChangePasswordPage /> },
  {
    path: "/forgot-password",
    element: <ForgotPasswordPage />,
  },

  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/",
        element: <AppShell />,
        children: [
          {
            index: true,
            element: <DashboardPage />,
          },

          {
            path: "departments",
            element: <DepartmentsPage />,
          },

          {
            path: "patients/:id",
            element: <PatientProfilePage />,
          },

          {
            path: "patients/:id/360",
            element: <Patient360Page />,
          },

          {
            path: "patients",
            element: <PatientsPage />,
          },
          {
            path: "patients/new",
            element: <PatientRegistrationPage />,
          },

          {
            path: "appointments",
            element: <AppointmentsPage />,
          },
          {
            path: "doctors",
            element: <DoctorsPage />,
          },

          {
            path: "doctors/register",
            element: <DoctorRegistrationPage />,
          },

          {
            path: "doctors/:id",
            element: <DoctorProfilePage />,
          },

          {
            path: "doctors",
            element: <DoctorRegistrationPage />,
          },

          {
            path: "appointments/:appointmentId/consultation",
            element: <ConsultationPage />,
          },

          {
            path: "consultations",
            element: <div>Consultations</div>,
          },

          {
            path: "prescriptions",
            element: <div>Prescriptions</div>,
          },

          { path: "laboratory", element: <LaboratoryPage /> },

          {
            path: "medicines",
            element: <MedicinesPage />,
          },

          {
            path: "pharmacy",
            element: <PharmacyPage />,
          },

          {
            path: "inventory",
            element: <InventoryPage />,
          },

          {
            path: "billing/:id",
            element: <InvoiceDetailPage />,
          },
          {
            path: "billing",
            element: <BillingPage />,
          },

          {
            path: "reports",
            element: <ReportsPage />,
          },

          {
            path: "clinics",
            element: <ClinicsPage />,
          },
          {
            path: "settings",
            element: <SettingsPage />,
          },
          {
            path: "clinic-configuration",
            element: <ClinicConfigurationPage />,
          },
        ],
      },
    ],
  },

  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
]);
