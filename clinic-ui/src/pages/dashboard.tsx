import {
  Activity,
  AlertTriangle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CheckCircle,
  Clock3,
  Eye,
  FileText,
  FlaskConical,
  IndianRupee,
  LogIn,
  Play,
  Plus,
  Package,
  Stethoscope,
  UsersRound,
  WalletCards,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";

import { AppointmentRegistrationModal } from "@/pages/appointments/appointment-registration-modal";
import { AppointmentCalendar } from "@/components/appointments/appointment-calendar";
import { AppointmentDetailsModal } from "@/pages/appointments/appointment-details-modal";
import { patientService } from "@/services/patient-service";
import { doctorService } from "@/services/doctor-service";
import type { Patient } from "@/types/patient";
import type { Doctor } from "@/types/doctor";
import type { Appointment } from "@/types/appointment";

import { useAuth } from "@/auth/auth-context";
import { appointmentService } from "@/services/appointment-service";

import type {
  DashboardAppointment,
  DashboardPatient,
  DashboardSummary,
} from "@/types/dashboard";
import { dashboardService } from "@/services/dashboard-service";

function formatCurrency(value: number | null | undefined) {
  if (value == null) {
    return "—";
  }

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatTime(value: string) {
  const [hours, minutes] = value.split(":").map(Number);
  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return date.toLocaleTimeString([], {
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatDate(value: string) {
  return new Date(value).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function statusClass(status: string) {
  switch (status) {
    case "SCHEDULED":
      return "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200";

    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 ring-1 ring-inset ring-blue-100";

    case "CHECKED_IN":
      return "bg-amber-50 text-amber-700 ring-1 ring-inset ring-amber-100";

    case "IN_CONSULTATION":
      return "bg-violet-50 text-violet-700 ring-1 ring-inset ring-violet-100";

    case "COMPLETED":
      return "bg-teal-50 text-teal-700 ring-1 ring-inset ring-teal-100";

    case "CANCELLED":
      return "bg-red-50 text-red-600 ring-1 ring-inset ring-red-100";

    case "NO_SHOW":
      return "bg-orange-50 text-orange-700 ring-1 ring-inset ring-orange-100";

    default:
      return "bg-slate-50 text-slate-600 ring-1 ring-inset ring-slate-200";
  }
}

export function DashboardPage() {
  const { user, loading: authLoading, hasPermission, hasRole } = useAuth();
  const navigate = useNavigate();
  const canCreateAppointments = hasPermission("APPOINTMENT_CREATE");
  const [showRegistration, setShowRegistration] = useState(false);
  const [dashboardRegistrationDate, setDashboardRegistrationDate] = useState<
    string | undefined
  >();
  const [appointmentPanelView, setAppointmentPanelView] = useState<
    "list" | "calendar"
  >("list");
  const [selectedCalendarAppointment, setSelectedCalendarAppointment] =
    useState<Appointment | null>(null);
  const [selectedCalendarAppointmentId, setSelectedCalendarAppointmentId] =
    useState<string | null>(null);
  const [calendarAppointmentLoading, setCalendarAppointmentLoading] =
    useState(false);
  const [
    calendarAppointmentActionLoading,
    setCalendarAppointmentActionLoading,
  ] = useState(false);
  const [registrationPatients, setRegistrationPatients] = useState<Patient[]>(
    [],
  );
  const [registrationDoctors, setRegistrationDoctors] = useState<Doctor[]>([]);

  useEffect(() => {
    if (!canCreateAppointments) return;

    const loadRegistrationOptions = async () => {
      try {
        const [patientResponse, doctorResponse] = await Promise.all([
          patientService.getPatients({
            page: 1,
            limit: 100,
            sortBy: "createdAt",
            sortOrder: "desc",
          }),
          doctorService.getDoctors({
            page: 1,
            limit: 100,
            isActive: true,
            sortOrder: "asc",
          }),
        ]);
        setRegistrationPatients(
          Array.isArray(patientResponse.data) ? patientResponse.data : [],
        );
        setRegistrationDoctors(
          Array.isArray(doctorResponse.data) ? doctorResponse.data : [],
        );
      } catch (requestError) {
        console.error(
          "Unable to load appointment registration options.",
          requestError,
        );
      }
    };

    loadRegistrationOptions();
  }, [canCreateAppointments]);

  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [confirmingAppointmentId, setConfirmingAppointmentId] = useState<
    string | null
  >(null);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);
  const [actionType, setActionType] = useState<
    "check-in" | "start" | "confirm" | null
  >(null);

  const canUpdateAppointments = hasPermission("APPOINTMENT_UPDATE");
  const canReadMedicalRecords = hasPermission("MEDICAL_RECORD_READ");
  const canStartConsultation =
    (hasRole("DOCTOR") || hasRole("CLINIC_ADMIN") || hasRole("SUPER_ADMIN")) &&
    hasPermission("CONSULTATION_START");

  const loadDashboard = useCallback(async (showLoader = true) => {
    if (showLoader) {
      setLoading(true);
    }

    setError(null);

    try {
      const data = await dashboardService.getSummary();

      setSummary(data);
    } catch (requestError) {
      console.error("Unable to load dashboard.", requestError);

      if (showLoader) {
        setError("We couldn't load the dashboard data. Please try again.");
      } else {
        setActionError(
          "The appointment was updated, but the dashboard could not be refreshed.",
        );
      }
    } finally {
      if (showLoader) {
        setLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboard();
    }
  }, [authLoading, user, loadDashboard]);

  const runAppointmentAction = async (
    appointmentId: string,
    action: "check-in" | "start",
  ) => {
    if (!canUpdateAppointments || actionLoadingId) {
      return;
    }

    try {
      setActionError(null);
      setActionLoadingId(appointmentId);
      setActionType(action);

      if (action === "check-in") {
        await appointmentService.checkInAppointment(appointmentId);
      } else {
        await appointmentService.startConsultation(appointmentId);
      }

      await loadDashboard(false);

      if (action === "start") {
        navigate(`/appointments/${appointmentId}/consultation`);
      }
    } catch (requestError) {
      console.error(`Unable to ${action} appointment.`, requestError);
      setActionError(
        action === "check-in"
          ? "Unable to check in this patient. Please try again."
          : "Unable to start this consultation. Please try again.",
      );
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!confirmingAppointmentId || !canUpdateAppointments) {
      return;
    }

    try {
      setActionError(null);
      setActionLoadingId(confirmingAppointmentId);
      setActionType("confirm");

      await appointmentService.confirmAppointment(confirmingAppointmentId);

      setConfirmingAppointmentId(null);
      await loadDashboard(false);
    } catch (requestError) {
      console.error("Unable to confirm appointment.", requestError);
      setActionError("Unable to confirm this appointment. Please try again.");
    } finally {
      setActionLoadingId(null);
      setActionType(null);
    }
  };

  const openDashboardAppointment = async (appointment: Appointment) => {
    setSelectedCalendarAppointmentId(appointment.id);
    setSelectedCalendarAppointment(null);
    setCalendarAppointmentLoading(true);
    try {
      const fullAppointment = await appointmentService.getAppointment(
        appointment.id,
      );
      setSelectedCalendarAppointment(fullAppointment);
    } catch (requestError) {
      console.error(
        "Unable to load appointment details from dashboard calendar.",
        requestError,
      );
      setActionError("Unable to load appointment details. Please try again.");
      setSelectedCalendarAppointmentId(null);
    } finally {
      setCalendarAppointmentLoading(false);
    }
  };

  const refreshSelectedCalendarAppointment = async () => {
    if (!selectedCalendarAppointmentId) return;
    const updated = await appointmentService.getAppointment(
      selectedCalendarAppointmentId,
    );
    setSelectedCalendarAppointment(updated);
    await loadDashboard(false);
  };

  const appointmentStats = useMemo(() => {
    const counts = new Map(
      summary?.appointmentStatus.map((item) => [item.status, item.count]) ?? [],
    );

    return {
      scheduled: counts.get("SCHEDULED") ?? 0,
      confirmed: counts.get("CONFIRMED") ?? 0,
      checkedIn: counts.get("CHECKED_IN") ?? 0,
      completed: counts.get("COMPLETED") ?? 0,
    };
  }, [summary]);

  const firstName = user?.firstName || "there";

  if (error) {
    return (
      <div className="space-y-6">
        <DashboardHeader
          firstName={firstName}
          onRefresh={loadDashboard}
          canCreateAppointments={canCreateAppointments}
          onNewAppointment={() => setShowRegistration(true)}
        />

        <div
          className="
            rounded-2xl
            bg-white
            p-8
            text-center
            shadow-[0_8px_30px_rgba(15,23,42,0.045)]
            ring-1
            ring-slate-200/60
          "
        >
          <Activity className="mx-auto size-10 text-teal-500" />

          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Dashboard unavailable
          </h2>

          <p className="mt-2 text-sm text-slate-500">{error}</p>

          <button
            type="button"
            onClick={() => loadDashboard()}
            className="
              mt-5
              rounded-xl
              bg-teal-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              transition-colors
              hover:bg-teal-700
            "
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <DashboardHeader
        firstName={firstName}
        onRefresh={loadDashboard}
        canCreateAppointments={canCreateAppointments}
        onNewAppointment={() => setShowRegistration(true)}
      />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <MetricGrid summary={summary} />

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <TodayAppointments
              appointments={summary?.todayAppointments ?? []}
              view={appointmentPanelView}
              onViewChange={setAppointmentPanelView}
              canView={summary?.permissions.appointments ?? false}
              canUpdate={canUpdateAppointments}
              canReadMedicalRecords={canReadMedicalRecords}
              canStartConsultation={canStartConsultation}
              actionLoadingId={actionLoadingId}
              actionType={actionType}
              onConfirm={(appointmentId) => {
                setActionError(null);
                setConfirmingAppointmentId(appointmentId);
              }}
              onCheckIn={(appointmentId) =>
                runAppointmentAction(appointmentId, "check-in")
              }
              onStartConsultation={(appointmentId) =>
                runAppointmentAction(appointmentId, "start")
              }
              onContinueConsultation={(appointmentId) =>
                navigate(`/appointments/${appointmentId}/consultation`)
              }
              onViewConsultation={(appointmentId) =>
                navigate(`/appointments/${appointmentId}/consultation`)
              }
              onCalendarDateSelect={(date) => {
                if (canCreateAppointments) {
                  setDashboardRegistrationDate(date);
                  setShowRegistration(true);
                } else {
                  navigate("/appointments");
                }
              }}
              onCalendarAppointmentSelect={openDashboardAppointment}
            />

            <AppointmentOverview
              stats={appointmentStats}
              canView={summary?.permissions.appointments ?? false}
            />
          </div>

          <div
            className={
              summary?.permissions.patients
                ? "grid gap-6 xl:grid-cols-[1fr_1fr]"
                : "grid gap-6"
            }
          >
            {summary?.permissions.patients && (
              <RecentPatients patients={summary.recentPatients ?? []} canView />
            )}

            <QuickActions
              permissions={summary?.permissions}
              onBookAppointment={() => setShowRegistration(true)}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
            <RecentActivity activities={summary?.recentActivity ?? []} />
            <OperationalAlerts summary={summary} />
          </div>
        </>
      )}

      <AppointmentDetailsModal
        open={Boolean(selectedCalendarAppointmentId)}
        appointment={selectedCalendarAppointment}
        loading={calendarAppointmentLoading}
        confirming={calendarAppointmentActionLoading}
        checkingIn={calendarAppointmentActionLoading}
        cancelling={calendarAppointmentActionLoading}
        startingConsultation={calendarAppointmentActionLoading}
        onClose={() => {
          setSelectedCalendarAppointmentId(null);
          setSelectedCalendarAppointment(null);
        }}
        onConfirm={async () => {
          if (!selectedCalendarAppointment) return;
          try {
            setCalendarAppointmentActionLoading(true);
            await appointmentService.confirmAppointment(
              selectedCalendarAppointment.id,
            );
            await refreshSelectedCalendarAppointment();
          } catch (error) {
            console.error("Unable to confirm appointment.", error);
            setActionError(
              "Unable to confirm this appointment. Please try again.",
            );
          } finally {
            setCalendarAppointmentActionLoading(false);
          }
        }}
        onCheckIn={async () => {
          if (!selectedCalendarAppointment) return;
          try {
            setCalendarAppointmentActionLoading(true);
            await appointmentService.checkInAppointment(
              selectedCalendarAppointment.id,
            );
            await refreshSelectedCalendarAppointment();
          } catch (error) {
            console.error("Unable to check in appointment.", error);
            setActionError(
              "Unable to check in this patient. Please try again.",
            );
          } finally {
            setCalendarAppointmentActionLoading(false);
          }
        }}
        onCancel={async () => {
          if (!selectedCalendarAppointment) return;
          const reason = window.prompt(
            "Reason for cancelling this appointment:",
          );
          if (reason === null) return;
          try {
            setCalendarAppointmentActionLoading(true);
            await appointmentService.cancelAppointment(
              selectedCalendarAppointment.id,
              reason,
            );
            await refreshSelectedCalendarAppointment();
          } catch (error) {
            console.error("Unable to cancel appointment.", error);
            setActionError(
              "Unable to cancel this appointment. Please try again.",
            );
          } finally {
            setCalendarAppointmentActionLoading(false);
          }
        }}
        onStartConsultation={async () => {
          if (!selectedCalendarAppointment) return;
          const id = selectedCalendarAppointment.id;
          try {
            setCalendarAppointmentActionLoading(true);
            await appointmentService.startConsultation(id);
            await loadDashboard(false);
            navigate(`/appointments/${id}/consultation`);
          } catch (error) {
            console.error("Unable to start consultation.", error);
            setActionError(
              "Unable to start this consultation. Please try again.",
            );
          } finally {
            setCalendarAppointmentActionLoading(false);
          }
        }}
        onContinueConsultation={() => {
          if (selectedCalendarAppointment)
            navigate(
              `/appointments/${selectedCalendarAppointment.id}/consultation`,
            );
        }}
        onViewConsultation={() => {
          if (selectedCalendarAppointment)
            navigate(
              `/appointments/${selectedCalendarAppointment.id}/consultation`,
            );
        }}
        canStartConsultation={canStartConsultation}
        canViewCompletedConsultation={canReadMedicalRecords}
      />

      {canCreateAppointments && (
        <AppointmentRegistrationModal
          open={showRegistration}
          initialDate={dashboardRegistrationDate}
          patients={registrationPatients}
          doctors={registrationDoctors}
          onClose={() => setShowRegistration(false)}
          onCreated={async () => {
            setShowRegistration(false);
            await loadDashboard(false);
          }}
        />
      )}

      {actionError && (
        <div
          role="alert"
          className="
            rounded-xl
            bg-red-50
            px-4
            py-3
            text-sm
            font-medium
            text-red-700
            ring-1
            ring-inset
            ring-red-100
          "
        >
          <div className="flex items-start justify-between gap-3">
            <span>{actionError}</span>
            <button
              type="button"
              onClick={() => setActionError(null)}
              className="shrink-0 rounded-lg p-0.5 text-red-400 transition-colors hover:bg-red-100 hover:text-red-600"
              aria-label="Dismiss error"
            >
              <X className="size-4" />
            </button>
          </div>
        </div>
      )}

      {confirmingAppointmentId && (
        <ConfirmAppointmentDialog
          loading={
            actionLoadingId === confirmingAppointmentId &&
            actionType === "confirm"
          }
          onCancel={() => {
            if (actionLoadingId) {
              return;
            }
            setConfirmingAppointmentId(null);
          }}
          onConfirm={handleConfirmAppointment}
        />
      )}
    </div>
  );
}

function DashboardHeader({
  firstName,
  onRefresh,
  canCreateAppointments,
  onNewAppointment,
}: {
  firstName: string;
  onRefresh: () => void;
  canCreateAppointments: boolean;
  onNewAppointment: () => void;
}) {
  function getGreeting(): string {
    const hour = new Date().getHours();

    if (hour < 12) {
      return "Good Morning";
    }

    if (hour < 17) {
      return "Good Afternoon";
    }

    return "Good Evening";
  }
  return (
    <div
      className="
        flex
        flex-col
        gap-4
        sm:flex-row
        sm:items-center
        sm:justify-between
      "
    >
      <div>
        <p
          className="
            text-sm
            font-medium
            text-teal-600
          "
        >
          {new Date().toLocaleDateString(undefined, {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </p>

        <h2
          className="
            mt-1
            text-2xl
            font-semibold
            tracking-[-0.025em]
            text-slate-950
            sm:text-3xl
          "
        >
          {getGreeting()}, {firstName}
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Here&apos;s what&apos;s happening across your clinic today.
        </p>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={onRefresh}
          className="
            rounded-xl
            bg-white
            px-3.5
            py-2.5
            text-sm
            font-medium
            text-slate-600
            shadow-sm
            ring-1
            ring-slate-200/70
            transition-colors
            hover:bg-slate-50
          "
        >
          Refresh
        </button>

        {canCreateAppointments && (
          <button
            type="button"
            onClick={onNewAppointment}
            className="
              inline-flex
              items-center
              gap-2
              rounded-xl
              bg-teal-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-[0_8px_20px_rgba(13,148,136,0.18)]
              transition-all
              hover:-translate-y-px
              hover:bg-teal-700
            "
          >
            <Plus className="size-4" />
            New appointment
          </button>
        )}
      </div>
    </div>
  );
}

function MetricGrid({ summary }: { summary: DashboardSummary | null }) {
  const metrics = [
    {
      label: "Active patients",
      value: summary?.metrics.patients,
      icon: UsersRound,
      href: "/patients",
      visible: summary?.permissions.patients ?? false,
    },
    {
      label: "Appointments today",
      value: summary?.metrics.todayAppointments,
      icon: CalendarDays,
      href: "/appointments",
      visible: summary?.permissions.appointments ?? false,
    },
    {
      label: "Active doctors",
      value: summary?.metrics.doctors,
      icon: Stethoscope,
      href: "/doctors",
      visible: summary?.permissions.doctors ?? false,
    },
    {
      label: "Pending lab orders",
      value: summary?.metrics.pendingLabOrders,
      icon: FlaskConical,
      href: "/laboratory",
      visible: summary?.permissions.laboratory ?? false,
    },
    {
      label: "Low stock batches",
      value: summary?.metrics.lowStockBatches,
      icon: Activity,
      href: "/inventory",
      visible: summary?.permissions.inventory ?? false,
    },
    {
      label: "Collected today",
      value: summary?.metrics.collectedRevenue,
      icon: WalletCards,
      href: "/billing",
      visible: summary?.permissions.billing ?? false,
      currency: true,
    },
  ].filter((metric) => metric.visible);

  return (
    <div
      className="
        grid
        gap-4
        sm:grid-cols-2
        xl:grid-cols-6
      "
    >
      {metrics.map((metric) => {
        const Icon = metric.icon;

        return (
          <Link
            key={metric.label}
            to={metric.href}
            className="
              group
              rounded-2xl
              bg-white
              p-5
              shadow-[0_8px_30px_rgba(15,23,42,0.045)]
              ring-1
              ring-slate-200/60
              transition-all
              hover:-translate-y-0.5
              hover:shadow-[0_12px_34px_rgba(15,23,42,0.07)]
            "
          >
            <div className="flex items-start justify-between">
              <div
                className="
                  flex
                  size-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-teal-50
                  text-teal-600
                "
              >
                <Icon className="size-5" />
              </div>

              <ArrowRight
                className="
                  size-4
                  text-slate-300
                  transition-all
                  group-hover:translate-x-0.5
                  group-hover:text-teal-500
                "
              />
            </div>

            <p className="mt-5 text-sm text-slate-500">{metric.label}</p>

            <p
              className="
                mt-1
                text-2xl
                font-semibold
                tracking-[-0.025em]
                text-slate-950
              "
            >
              {metric.currency
                ? formatCurrency(metric.value)
                : (metric.value ?? "—")}
            </p>
          </Link>
        );
      })}
    </div>
  );
}

function TodayAppointments({
  appointments,
  view,
  onViewChange,
  canView,
  canUpdate,
  canReadMedicalRecords,
  canStartConsultation,
  actionLoadingId,
  actionType,
  onConfirm,
  onCheckIn,
  onStartConsultation,
  onContinueConsultation,
  onViewConsultation,
  onCalendarDateSelect,
  onCalendarAppointmentSelect,
}: {
  appointments: DashboardAppointment[];
  view: "list" | "calendar";
  onViewChange: (view: "list" | "calendar") => void;
  canView: boolean;
  canUpdate: boolean;
  canReadMedicalRecords: boolean;
  canStartConsultation: boolean;
  actionLoadingId: string | null;
  actionType: "check-in" | "start" | "confirm" | null;
  onConfirm: (appointmentId: string) => void;
  onCheckIn: (appointmentId: string) => void;
  onStartConsultation: (appointmentId: string) => void;
  onContinueConsultation: (appointmentId: string) => void;
  onViewConsultation: (appointmentId: string) => void;
  onCalendarDateSelect: (date: string) => void;
  onCalendarAppointmentSelect: (appointment: Appointment) => void;
}) {
  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-[0_8px_30px_rgba(15,23,42,0.045)]
        ring-1
        ring-slate-200/60
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          px-5
          py-5
          sm:px-6
        "
      >
        <div>
          <h3 className="font-semibold text-slate-900">
            {view === "calendar"
              ? "Appointment calendar"
              : "Today's appointments"}
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            {view === "calendar"
              ? "Select an appointment to view its details"
              : "Your clinic schedule for today"}
          </p>
        </div>

        <div
          className="inline-flex shrink-0 rounded-lg bg-slate-100 p-1"
          role="group"
          aria-label="Appointment panel view"
        >
          <button
            type="button"
            onClick={() => onViewChange("list")}
            aria-pressed={view === "list"}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${view === "list" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => onViewChange("calendar")}
            aria-pressed={view === "calendar"}
            className={`rounded-md px-2.5 py-1.5 text-xs font-semibold transition-colors ${view === "calendar" ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            Calendar
          </button>
        </div>
      </div>

      {view === "calendar" && canView ? (
        <div className="p-4 sm:p-5">
          <AppointmentCalendar
            canRead={canView}
            compact
            onDateSelect={onCalendarDateSelect}
            onAppointmentSelect={onCalendarAppointmentSelect}
          />
          <div className="mt-3 flex justify-end">
            <Link
              to="/appointments"
              className="inline-flex items-center gap-1 text-xs font-semibold text-teal-600 hover:text-teal-700"
            >
              Open full calendar <ArrowRight className="size-3.5" />
            </Link>
          </div>
        </div>
      ) : !canView ? (
        <EmptyState text="You don't have permission to view appointments." />
      ) : appointments.length === 0 ? (
        <EmptyState text="No appointments scheduled for today." />
      ) : (
        <div>
          {appointments.map((appointment, index) => {
            const isActionLoading = actionLoadingId === appointment.id;
            const isScheduled = appointment.status === "SCHEDULED";
            const isConfirmed = appointment.status === "CONFIRMED";
            const isCheckedIn = appointment.status === "CHECKED_IN";
            const isInConsultation = appointment.status === "IN_CONSULTATION";
            const isCompleted = appointment.status === "COMPLETED";

            return (
              <div
                key={appointment.id}
                className="
                  relative
                  px-5
                  py-4
                  transition-colors
                  duration-150
                  hover:bg-slate-50/60
                  sm:px-6
                "
              >
                {index > 0 && (
                  <span
                    aria-hidden="true"
                    className="
                      pointer-events-none
                      absolute
                      inset-x-0
                      top-0
                      h-px
                      bg-slate-200/35
                    "
                  />
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                  <div
                    className="
                      flex
                      min-w-[76px]
                      items-center
                      gap-2
                      text-sm
                      font-semibold
                      text-slate-800
                    "
                  >
                    <Clock3 className="size-4 text-teal-500" />
                    {formatTime(appointment.startTime)}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-semibold text-slate-800">
                      {appointment.patient.name}
                    </p>

                    <p className="mt-0.5 truncate text-xs text-slate-400">
                      {appointment.doctor.name}
                      {" · "}
                      {appointment.type.toLowerCase().replaceAll("_", " ")}
                    </p>
                  </div>

                  <span
                    className={`
                      inline-flex
                      w-fit
                      rounded-full
                      px-2.5
                      py-1
                      text-[11px]
                      font-semibold
                      ${statusClass(appointment.status)}
                    `}
                  >
                    {statusLabel(appointment.status)}
                  </span>
                </div>

                {canUpdate && (
                  <div className="mt-3 flex flex-wrap items-center justify-end gap-2">
                    {isScheduled && (
                      <button
                        type="button"
                        disabled={Boolean(actionLoadingId)}
                        onClick={() => onConfirm(appointment.id)}
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          bg-teal-50
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          text-teal-700
                          ring-1
                          ring-inset
                          ring-teal-100
                          transition-colors
                          hover:bg-teal-100
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {isActionLoading && actionType === "confirm" ? (
                          <span className="size-3.5 animate-spin rounded-full border-2 border-teal-200 border-t-teal-600" />
                        ) : (
                          <CheckCircle className="size-3.5" />
                        )}
                        Confirm
                      </button>
                    )}

                    {isConfirmed && (
                      <button
                        type="button"
                        disabled={Boolean(actionLoadingId)}
                        onClick={() => onCheckIn(appointment.id)}
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          bg-amber-50
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          text-amber-700
                          ring-1
                          ring-inset
                          ring-amber-100
                          transition-colors
                          hover:bg-amber-100
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {isActionLoading && actionType === "check-in" ? (
                          <span className="size-3.5 animate-spin rounded-full border-2 border-amber-200 border-t-amber-600" />
                        ) : (
                          <LogIn className="size-3.5" />
                        )}
                        Check in
                      </button>
                    )}

                    {isCheckedIn && canStartConsultation && (
                      <button
                        type="button"
                        disabled={Boolean(actionLoadingId)}
                        onClick={() => onStartConsultation(appointment.id)}
                        className="
                          inline-flex
                          items-center
                          gap-1.5
                          rounded-lg
                          bg-violet-50
                          px-3
                          py-2
                          text-xs
                          font-semibold
                          text-violet-700
                          ring-1
                          ring-inset
                          ring-violet-100
                          transition-colors
                          hover:bg-violet-100
                          disabled:cursor-not-allowed
                          disabled:opacity-50
                        "
                      >
                        {isActionLoading && actionType === "start" ? (
                          <span className="size-3.5 animate-spin rounded-full border-2 border-violet-200 border-t-violet-600" />
                        ) : (
                          <Play className="size-3.5" />
                        )}
                        Start consultation
                      </button>
                    )}
                  </div>
                )}

                {isInConsultation && canStartConsultation && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onContinueConsultation(appointment.id)}
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        bg-violet-50
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-violet-700
                        ring-1
                        ring-inset
                        ring-violet-100
                        transition-colors
                        hover:bg-violet-100
                      "
                    >
                      <Play className="size-3.5" />
                      Continue consultation
                    </button>
                  </div>
                )}

                {isCompleted && canReadMedicalRecords && (
                  <div className="mt-3 flex justify-end">
                    <button
                      type="button"
                      onClick={() => onViewConsultation(appointment.id)}
                      className="
                        inline-flex
                        items-center
                        gap-1.5
                        rounded-lg
                        bg-slate-50
                        px-3
                        py-2
                        text-xs
                        font-semibold
                        text-slate-600
                        ring-1
                        ring-inset
                        ring-slate-200
                        transition-colors
                        hover:bg-slate-100
                      "
                    >
                      <Eye className="size-3.5" />
                      View consultation
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function ConfirmAppointmentDialog({
  loading,
  onCancel,
  onConfirm,
}: {
  loading: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-[2px]"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !loading) {
          onCancel();
        }
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-appointment-title"
        className="
          w-full
          max-w-md
          rounded-2xl
          bg-white
          p-5
          shadow-[0_20px_60px_rgba(15,23,42,0.14)]
          ring-1
          ring-slate-200/70
          sm:p-6
        "
      >
        <div className="flex items-start gap-3">
          <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <CheckCircle2 className="size-5" />
          </div>

          <div className="min-w-0">
            <h2
              id="confirm-appointment-title"
              className="text-base font-semibold text-slate-900"
            >
              Confirm appointment?
            </h2>
            <p className="mt-1 text-sm leading-6 text-slate-500">
              This will mark the appointment as confirmed and allow the patient
              to proceed to check-in.
            </p>
          </div>
        </div>

        <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={loading}
            onClick={onCancel}
            className="
              rounded-xl
              bg-white
              px-4
              py-2.5
              text-sm
              font-semibold
              text-slate-600
              ring-1
              ring-slate-200/80
              transition-colors
              hover:bg-slate-50
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="button"
            disabled={loading}
            onClick={onConfirm}
            className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-teal-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-colors
              hover:bg-teal-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {loading && (
              <span className="size-4 animate-spin rounded-full border-2 border-teal-200 border-t-white" />
            )}
            {loading ? "Confirming..." : "Confirm appointment"}
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentOverview({
  stats,
  canView,
}: {
  stats: {
    scheduled: number;
    confirmed: number;
    checkedIn: number;
    completed: number;
  };
  canView: boolean;
}) {
  const rows = [
    {
      label: "Scheduled",
      value: stats.scheduled,
      icon: CalendarDays,
    },
    {
      label: "Confirmed",
      value: stats.confirmed,
      icon: CheckCircle2,
    },
    {
      label: "Checked in",
      value: stats.checkedIn,
      icon: Clock3,
    },
    {
      label: "Completed",
      value: stats.completed,
      icon: Activity,
    },
  ];

  return (
    <section
      className="
        rounded-2xl
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(15,23,42,0.045)]
        ring-1
        ring-slate-200/60
        sm:p-6
      "
    >
      <h3 className="font-semibold text-slate-900">Appointment overview</h3>

      <p className="mt-1 text-xs text-slate-400">
        Today&apos;s appointment status
      </p>

      {!canView ? (
        <div className="mt-6">
          <EmptyState text="Appointment statistics are unavailable for your role." />
        </div>
      ) : (
        <div className="mt-6 space-y-3">
          {rows.map((row) => {
            const Icon = row.icon;

            return (
              <div
                key={row.label}
                className="
                  flex
                  items-center
                  justify-between
                  rounded-xl
                  bg-slate-50
                  px-4
                  py-3
                "
              >
                <div className="flex items-center gap-3">
                  <Icon className="size-4 text-teal-500" />

                  <span className="text-sm text-slate-600">{row.label}</span>
                </div>

                <span className="text-sm font-semibold text-slate-900">
                  {row.value}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function RecentPatients({
  patients,
  canView,
}: {
  patients: DashboardPatient[];
  canView: boolean;
}) {
  return (
    <section
      className="
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-[0_8px_30px_rgba(15,23,42,0.045)]
        ring-1
        ring-slate-200/60
      "
    >
      <div
        className="
          flex
          items-center
          justify-between
          px-5
          py-5
          sm:px-6
        "
      >
        <div>
          <h3 className="font-semibold text-slate-900">Recent patients</h3>

          <p className="mt-1 text-xs text-slate-400">
            Recently registered patients
          </p>
        </div>

        <Link
          to="/patients"
          className="
            inline-flex
            items-center
            gap-1
            text-xs
            font-semibold
            text-teal-600
            transition-colors
            hover:text-teal-700
          "
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {!canView ? (
        <EmptyState text="You don't have permission to view patients." />
      ) : patients.length === 0 ? (
        <EmptyState text="No patients have been registered yet." />
      ) : (
        <div>
          {patients.map((patient, index) => (
            <Link
              key={patient.id}
              to={`/patients/${patient.id}`}
              className="
        group
        relative
        flex
        items-center
        gap-3
        px-5
        py-3.5
        transition-colors
        duration-150
        hover:bg-slate-50/70
        sm:px-6
      "
            >
              {index > 0 && (
                <span
                  aria-hidden="true"
                  className="
    pointer-events-none
    absolute
    inset-x-0
    top-0
    h-[1.5px]
    bg-slate-200/35
  "
                />
              )}

              {/* Avatar */}
              <div
                className="
          flex
          size-9
          shrink-0
          items-center
          justify-center
          rounded-full
          bg-teal-50
          text-xs
          font-semibold
          text-teal-700
          transition-colors
          group-hover:bg-teal-100
        "
              >
                {patient.name
                  .split(" ")
                  .map((part: string) => part[0])
                  .join("")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>

              {/* Patient */}
              <div className="min-w-0 flex-1">
                <p
                  className="
            truncate
            text-sm
            font-semibold
            text-slate-800
            transition-colors
            group-hover:text-slate-900
          "
                >
                  {patient.name}
                </p>

                <p className="mt-0.5 text-xs text-slate-400">
                  {patient.patientNumber}
                  {" · "}
                  {formatDate(patient.createdAt)}
                </p>
              </div>

              {/* Arrow */}
              <ArrowRight
                className="
          size-4
          shrink-0
          text-slate-300
          opacity-70
          transition-all
          duration-150
          group-hover:translate-x-0.5
          group-hover:text-teal-500
          group-hover:opacity-100
        "
              />
            </Link>
          ))}
        </div>
      )}
    </section>
  );
}

function RecentActivity({
  activities,
}: {
  activities: DashboardSummary["recentActivity"];
}) {
  const icons = {
    PATIENT: UsersRound,
    APPOINTMENT: CalendarDays,
    PAYMENT: WalletCards,
    LAB: FlaskConical,
    INVENTORY: Package,
  } as const;

  return (
    <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] ring-1 ring-slate-200/60">
      <div className="flex items-center justify-between px-5 py-5 sm:px-6">
        <div>
          <h3 className="font-semibold text-slate-900">Recent activity</h3>
          <p className="mt-1 text-xs text-slate-400">
            Latest activity across the clinic
          </p>
        </div>
      </div>

      {activities.length === 0 ? (
        <EmptyState text="No recent activity is available." />
      ) : (
        <div className="grid gap-2 px-4 pb-4 sm:px-5 sm:pb-5">
          {activities.map((activity) => {
            const Icon = icons[activity.type as keyof typeof icons] ?? Activity;

            return (
              <div
                key={activity.id}
                className="flex items-start gap-3 rounded-xl bg-slate-50 px-4 py-3"
              >
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white text-teal-600 shadow-sm">
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {activity.title}
                  </p>
                  <p className="mt-0.5 truncate text-xs text-slate-500">
                    {activity.description}
                  </p>
                </div>
                <span className="shrink-0 text-[11px] text-slate-400">
                  {formatRelativeTime(activity.createdAt)}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </section>
  );
}

function OperationalAlerts({ summary }: { summary: DashboardSummary | null }) {
  const alerts = [
    summary?.permissions.inventory && (summary.metrics.lowStockBatches ?? 0) > 0
      ? {
          label: "Low stock",
          description: `${summary.metrics.lowStockBatches} medicine batch${summary.metrics.lowStockBatches === 1 ? "" : "es"} at or below reorder level`,
          href: "/inventory",
          icon: Package,
          tone: "amber" as const,
        }
      : null,
    summary?.permissions.laboratory &&
    (summary.metrics.pendingLabOrders ?? 0) > 0
      ? {
          label: "Pending laboratory work",
          description: `${summary.metrics.pendingLabOrders} lab order${summary.metrics.pendingLabOrders === 1 ? "" : "s"} awaiting completion`,
          href: "/laboratory",
          icon: FlaskConical,
          tone: "violet" as const,
        }
      : null,
    summary?.permissions.billing &&
    (summary.metrics.outstandingBillingInvoices ?? 0) > 0
      ? {
          label: "Outstanding billing",
          description: `${summary.metrics.outstandingBillingInvoices} invoice${summary.metrics.outstandingBillingInvoices === 1 ? "" : "s"} · ${formatCurrency(summary.metrics.outstandingBillingAmount)}`,
          href: "/billing",
          icon: FileText,
          tone: "rose" as const,
        }
      : null,
  ].filter(Boolean) as Array<{
    label: string;
    description: string;
    href: string;
    icon: typeof Package;
    tone: "amber" | "violet" | "rose";
  }>;

  const toneClasses = {
    amber: "bg-amber-50 text-amber-700",
    violet: "bg-violet-50 text-violet-700",
    rose: "bg-rose-50 text-rose-700",
  };

  return (
    <section className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.045)] ring-1 ring-slate-200/60 sm:p-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-slate-900">Operational alerts</h3>
          <p className="mt-1 text-xs text-slate-400">
            Items that may need attention
          </p>
        </div>
        {alerts.length > 0 && (
          <AlertTriangle className="size-4 text-amber-500" />
        )}
      </div>

      {alerts.length === 0 ? (
        <div className="mt-6 rounded-xl bg-emerald-50 px-4 py-5 text-center">
          <p className="text-sm font-semibold text-emerald-700">All clear</p>
          <p className="mt-1 text-xs text-emerald-600">
            No operational alerts require attention right now.
          </p>
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {alerts.map((alert) => {
            const Icon = alert.icon;

            return (
              <Link
                key={alert.label}
                to={alert.href}
                className="group flex items-start gap-3 rounded-xl bg-slate-50 p-4 transition-colors hover:bg-slate-100"
              >
                <div
                  className={`flex size-9 shrink-0 items-center justify-center rounded-lg ${toneClasses[alert.tone]}`}
                >
                  <Icon className="size-4" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-slate-800">
                    {alert.label}
                  </p>
                  <p className="mt-0.5 text-xs leading-5 text-slate-500">
                    {alert.description}
                  </p>
                </div>
                <ArrowRight className="mt-1 size-4 shrink-0 text-slate-300 transition-transform group-hover:translate-x-0.5 group-hover:text-teal-500" />
              </Link>
            );
          })}
        </div>
      )}
    </section>
  );
}

function formatRelativeTime(value: string) {
  const diffMs = Date.now() - new Date(value).getTime();
  const minutes = Math.max(0, Math.floor(diffMs / 60000));

  if (minutes < 1) return "Just now";
  if (minutes < 60) return `${minutes}m`;

  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;

  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;

  return formatDate(value);
}

function QuickActions({
  permissions,
  onBookAppointment,
}: {
  permissions: DashboardSummary["permissions"] | undefined;
  onBookAppointment: () => void;
}) {
  const actions = [
    {
      label: "Register patient",
      description: "Add a new patient",
      href: "/patients/new",
      icon: UsersRound,
      visible: permissions?.patients ?? false,
    },
    {
      label: "Book appointment",
      description: "Schedule a visit",
      href: "#book-appointment",
      icon: CalendarDays,
      onClick: onBookAppointment,
      visible: permissions?.appointments ?? false,
    },
    {
      label: "View laboratory",
      description: "Review lab orders",
      href: "/laboratory",
      icon: FlaskConical,
      visible: permissions?.laboratory ?? false,
    },
    {
      label: "Open inventory",
      description: "Manage medicine stock",
      href: "/inventory",
      icon: Activity,
      visible: permissions?.inventory ?? false,
    },
    {
      label: "Open billing",
      description: "Manage invoices",
      href: "/billing",
      icon: IndianRupee,
      visible: permissions?.billing ?? false,
    },
  ].filter((action) => action.visible);

  return (
    <section
      className="
        rounded-2xl
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(15,23,42,0.045)]
        ring-1
        ring-slate-200/60
        sm:p-6
      "
    >
      <h3 className="font-semibold text-slate-900">Quick actions</h3>

      <p className="mt-1 text-xs text-slate-400">Common clinic tasks</p>

      <div className="mt-5 grid gap-3 sm:grid-cols-2">
        {actions.map((action) => {
          const Icon = action.icon;

          const content = (
            <>
              <div
                className="
                  flex
                  size-9
                  items-center
                  justify-center
                  rounded-lg
                  bg-white
                  text-teal-600
                  shadow-sm
                "
              >
                <Icon className="size-4.5" />
              </div>

              <p className="mt-3 text-sm font-semibold text-slate-800">
                {action.label}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {action.description}
              </p>

              <ArrowRight
                className="
                  mt-3
                  size-4
                  text-slate-300
                  transition-all
                  group-hover:translate-x-0.5
                  group-hover:text-teal-500
                "
              />
            </>
          );

          return action.onClick ? (
            <button
              key={action.label}
              type="button"
              onClick={action.onClick}
              className="group w-full rounded-xl bg-slate-50 p-4 text-left transition-all hover:bg-teal-50"
            >
              {content}
            </button>
          ) : (
            <Link
              key={action.label}
              to={action.href}
              className="
                group
                rounded-xl
                bg-slate-50
                p-4
                transition-all
                hover:bg-teal-50
              "
            >
              {content}
            </Link>
          );
        })}
      </div>

      {actions.length === 0 && (
        <EmptyState text="No quick actions are available for your role." />
      )}
    </section>
  );
}

function EmptyState({ text }: { text: string }) {
  return (
    <div className="px-5 py-10 text-center sm:px-6">
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

function DashboardSkeleton() {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-6">
        {Array.from({ length: 5 }).map((_, index) => (
          <div
            key={index}
            className="
                h-36
                animate-pulse
                rounded-2xl
                bg-white
                ring-1
                ring-slate-200/60
              "
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
        <div className="h-[430px] animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/60" />
        <div className="h-[430px] animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/60" />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-[360px] animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/60" />
        <div className="h-[360px] animate-pulse rounded-2xl bg-white ring-1 ring-slate-200/60" />
      </div>
    </div>
  );
}
