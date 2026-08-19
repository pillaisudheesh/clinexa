import {
  Activity,
  CalendarDays,
  ClipboardList,
  FileText,
  FlaskConical,
  LayoutDashboard,
  Package,
  Pill,
  Receipt,
  Settings,
  Users,
} from "lucide-react";

export interface NavigationItem {
  label: string;
  path: string;
  icon: typeof LayoutDashboard;
  permission?: string;
}

export const mainNavigation: NavigationItem[] = [
  {
    label: "Dashboard",
    path: "/",
    icon: LayoutDashboard,
  },
  {
    label: "Patients",
    path: "/patients",
    icon: Users,
    permission: "PATIENT_READ",
  },
  {
    label: "Appointments",
    path: "/appointments",
    icon: CalendarDays,
    permission: "APPOINTMENT_READ",
  },
  {
    label: "Consultations",
    path: "/consultations",
    icon: ClipboardList,
    permission: "MEDICAL_RECORD_READ",
  },
  {
    label: "Prescriptions",
    path: "/prescriptions",
    icon: Pill,
    permission: "PRESCRIPTION_READ",
  },
  {
    label: "Laboratory",
    path: "/laboratory",
    icon: FlaskConical,
    permission: "LAB_READ",
  },
  {
    label: "Pharmacy",
    path: "/pharmacy",
    icon: Activity,
    permission: "PHARMACY_READ",
  },
  {
    label: "Inventory",
    path: "/inventory",
    icon: Package,
    permission: "INVENTORY_READ",
  },
  {
    label: "Billing",
    path: "/billing",
    icon: Receipt,
    permission: "BILLING_READ",
  },
];

export const secondaryNavigation: NavigationItem[] = [
  {
    label: "Reports",
    path: "/reports",
    icon: FileText,
  },
  {
    label: "Settings",
    path: "/settings",
    icon: Settings,
  },
];
