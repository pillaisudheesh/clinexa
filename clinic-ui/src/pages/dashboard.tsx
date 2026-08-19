import {
  Activity,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  FlaskConical,
  IndianRupee,
  Plus,
  Stethoscope,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";

import { useAuth } from "@/auth/auth-context";

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
    case "CONFIRMED":
      return "bg-emerald-50 text-emerald-700";
    case "CHECKED_IN":
      return "bg-cyan-50 text-cyan-700";
    case "IN_PROGRESS":
      return "bg-violet-50 text-violet-700";
    case "COMPLETED":
      return "bg-slate-100 text-slate-600";
    case "NO_SHOW":
      return "bg-amber-50 text-amber-700";
    default:
      return "bg-teal-50 text-teal-700";
  }
}

export function DashboardPage() {
  const { user, loading: authLoading } = useAuth();

  const [summary, setSummary] = useState<DashboardSummary | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const loadDashboard = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await dashboardService.getSummary();

      setSummary(data);
    } catch (requestError) {
      console.error("Unable to load dashboard.", requestError);

      setError("We couldn't load the dashboard data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!authLoading && user) {
      loadDashboard();
    }
  }, [authLoading, user, loadDashboard]);

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
        <DashboardHeader firstName={firstName} onRefresh={loadDashboard} />

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
            onClick={loadDashboard}
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
      <DashboardHeader firstName={firstName} onRefresh={loadDashboard} />

      {loading ? (
        <DashboardSkeleton />
      ) : (
        <>
          <MetricGrid summary={summary} />

          <div className="grid gap-6 xl:grid-cols-[1.35fr_0.65fr]">
            <TodayAppointments
              appointments={summary?.todayAppointments ?? []}
              canView={summary?.permissions.appointments ?? false}
            />

            <AppointmentOverview
              stats={appointmentStats}
              canView={summary?.permissions.appointments ?? false}
            />
          </div>

          <div className="grid gap-6 xl:grid-cols-[1fr_1fr]">
            <RecentPatients
              patients={summary?.recentPatients ?? []}
              canView={summary?.permissions.patients ?? false}
            />

            <QuickActions permissions={summary?.permissions} />
          </div>
        </>
      )}
    </div>
  );
}

function DashboardHeader({
  firstName,
  onRefresh,
}: {
  firstName: string;
  onRefresh: () => void;
}) {
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
          Good morning, {firstName}
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

        <Link
          to="/appointments"
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
        </Link>
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
      label: "Collected revenue",
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
        xl:grid-cols-5
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
  canView,
}: {
  appointments: DashboardAppointment[];
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
          <h3 className="font-semibold text-slate-900">
            Today&apos;s appointments
          </h3>
          <p className="mt-1 text-xs text-slate-400">
            Your clinic schedule for today
          </p>
        </div>

        <Link
          to="/appointments"
          className="
            inline-flex
            items-center
            gap-1
            text-xs
            font-semibold
            text-teal-600
            hover:text-teal-700
          "
        >
          View all
          <ArrowRight className="size-3.5" />
        </Link>
      </div>

      {!canView ? (
        <EmptyState text="You don't have permission to view appointments." />
      ) : appointments.length === 0 ? (
        <EmptyState text="No appointments scheduled for today." />
      ) : (
        <div className="border-0">
          {appointments.map((appointment, index) => (
            <div
              key={appointment.id}
              className="
      group
      relative
      flex
      flex-col
      gap-3
      px-5
      py-4
      transition-colors
      duration-150
      hover:bg-slate-50/60
      sm:flex-row
      sm:items-center
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
          ))}
        </div>
      )}
    </section>
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

function QuickActions({
  permissions,
}: {
  permissions: DashboardSummary["permissions"] | undefined;
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
      href: "/appointments",
      icon: CalendarDays,
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

          return (
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
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
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
