export interface DashboardAppointment {
  id: string;
  appointmentNumber: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  status: string;
  priority: string;
  type: string;

  patient: {
    id: string;
    patientNumber: string;
    name: string;
  };

  doctor: {
    id: string;
    name: string;
  };
}

export interface DashboardPatient {
  id: string;
  patientNumber: string;
  name: string;
  phone?: string | null;
  createdAt: string;
}

export interface DashboardSummary {
  date: string;

  metrics: {
    patients: number | null;
    doctors: number | null;
    todayAppointments: number | null;
    pendingLabOrders: number | null;
    collectedRevenue: number | null;
  };

  appointmentStatus: {
    status: string;
    count: number;
  }[];

  todayAppointments: DashboardAppointment[];

  recentPatients: DashboardPatient[];

  permissions: {
    patients: boolean;
    appointments: boolean;
    doctors: boolean;
    laboratory: boolean;
    billing: boolean;
    reports: boolean;
  };
}
