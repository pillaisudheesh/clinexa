import { createBrowserRouter, Navigate } from "react-router-dom";

import { AppShell } from "@/components/layout/app-shell";

import { ProtectedRoute } from "@/auth/protected-route";

import { DashboardPage } from "./pages/dashboard";
import { LoginPage } from "@/pages/auth/login-page";
import { PatientsPage } from "@/pages/patients/patients-page";
import { PatientRegistrationPage } from "@/pages/patients/patient-registration-page";
import { PatientProfilePage } from "@/pages/patients/patient-profile-page";
import { AppointmentsPage } from "@/pages/appointments/appointments-page";

export const router = createBrowserRouter([
  {
    path: "/login",
    element: <LoginPage />,
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
            path: "patients/:id",
            element: <PatientProfilePage />,
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
            element: <div>Doctors</div>,
          },

          {
            path: "consultations",
            element: <div>Consultations</div>,
          },

          {
            path: "prescriptions",
            element: <div>Prescriptions</div>,
          },

          {
            path: "laboratory",
            element: <div>Laboratory</div>,
          },

          {
            path: "pharmacy",
            element: <div>Pharmacy</div>,
          },

          {
            path: "inventory",
            element: <div>Inventory</div>,
          },

          {
            path: "billing",
            element: <div>Billing</div>,
          },

          {
            path: "reports",
            element: <div>Reports</div>,
          },

          {
            path: "settings",
            element: <div>Settings</div>,
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
