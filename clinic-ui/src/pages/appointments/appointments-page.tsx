import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock3,
  Eye,
  Filter,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { useCallback, useEffect, useState } from "react";

import { appointmentService } from "@/services/appointment-service";
import { doctorService } from "@/services/doctor-service";
import { patientService } from "@/services/patient-service";

import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from "@/types/appointment";

import type { Doctor } from "@/types/doctor";
import type { Patient } from "@/types/patient";

import { AppointmentRegistrationModal } from "./appointment-registration-modal";

const PAGE_SIZE = 10;

const STATUS_OPTIONS: {
  value: AppointmentStatus;
  label: string;
}[] = [
  {
    value: "SCHEDULED",
    label: "Scheduled",
  },
  {
    value: "CONFIRMED",
    label: "Confirmed",
  },
  {
    value: "CHECKED_IN",
    label: "Checked in",
  },
  {
    value: "IN_PROGRESS",
    label: "In consultation",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
  {
    value: "NO_SHOW",
    label: "No show",
  },
];

const TYPE_OPTIONS: {
  value: AppointmentType;
  label: string;
}[] = [
  {
    value: "NEW_CONSULTATION",
    label: "New consultation",
  },
  {
    value: "FOLLOW_UP",
    label: "Follow-up",
  },
  {
    value: "EMERGENCY",
    label: "Emergency",
  },
  {
    value: "TELECONSULTATION",
    label: "Teleconsultation",
  },
];

function formatPatientName(appointment: Appointment) {
  if (!appointment.patient) {
    return "Unknown patient";
  }

  return [
    appointment.patient.firstName,
    appointment.patient.middleName,
    appointment.patient.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDoctorName(appointment: Appointment) {
  if (!appointment.doctor) {
    return "Unknown doctor";
  }

  return [
    appointment.doctor.title,
    appointment.doctor.firstName,
    appointment.doctor.middleName,
    appointment.doctor.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(date));
}

function formatStatus(status: AppointmentStatus) {
  return STATUS_OPTIONS.find((item) => item.value === status)?.label ?? status;
}

function formatType(type: AppointmentType) {
  return TYPE_OPTIONS.find((item) => item.value === type)?.label ?? type;
}

function getStatusClasses(status: AppointmentStatus) {
  switch (status) {
    case "SCHEDULED":
      return "bg-slate-50 text-slate-600 ring-slate-200";

    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 ring-blue-100";

    case "CHECKED_IN":
      return "bg-amber-50 text-amber-700 ring-amber-100";

    case "IN_PROGRESS":
      return "bg-violet-50 text-violet-700 ring-violet-100";

    case "COMPLETED":
      return "bg-teal-50 text-teal-700 ring-teal-100";

    case "CANCELLED":
      return "bg-red-50 text-red-600 ring-red-100";

    case "NO_SHOW":
      return "bg-orange-50 text-orange-700 ring-orange-100";

    default:
      return "bg-slate-50 text-slate-600 ring-slate-200";
  }
}

function getPriorityClasses(priority: Appointment["priority"]) {
  switch (priority) {
    case "EMERGENCY":
      return "bg-red-50 text-red-600";

    case "URGENT":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-50 text-slate-500";
  }
}

function AppointmentRow({
  appointment,
  index,
}: {
  appointment: Appointment;
  index: number;
}) {
  return (
    <div
      className="
        group
        relative
        transition-colors
        duration-150
        hover:bg-slate-50/60
      "
    >
      {/* Same subtle separator used by Patients page */}
      {index > 0 && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-[3px]
            bg-slate-200/30
          "
        />
      )}

      <div
        className="
          grid
          grid-cols-[180px_minmax(200px,1.5fr)_minmax(180px,1.4fr)_140px_150px_110px_110px_40px]
          items-center
          gap-4
          px-5
          py-4
        "
      >
        {/* Appointment */}
        <div className="min-w-0">
          <p className="truncate text-xs font-semibold text-slate-700">
            {appointment.appointmentNumber}
          </p>

          <p className="mt-1 truncate text-[11px] text-slate-400">
            {appointment.reason || "General consultation"}
          </p>
        </div>

        {/* Patient */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div
            className="
              flex
              size-8
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-teal-50
              text-teal-600
              transition-colors
              group-hover:bg-teal-100
            "
          >
            <UserRound size={14} />
          </div>

          <div className="min-w-0">
            <p className="truncate text-sm font-medium text-slate-700">
              {formatPatientName(appointment)}
            </p>

            <p className="mt-0.5 truncate text-[11px] text-slate-400">
              {appointment.patient?.patientNumber || "—"}
            </p>
          </div>
        </div>

        {/* Doctor */}
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-600">
            {formatDoctorName(appointment)}
          </p>

          <p className="mt-0.5 truncate text-[11px] text-slate-400">
            {appointment.doctor?.doctorNumber || "—"}
          </p>
        </div>

        {/* Date / Time */}
        <div>
          <p className="text-sm font-medium text-slate-700">
            {formatDate(appointment.appointmentDate)}
          </p>

          <p className="mt-0.5 text-[11px] text-slate-400">
            {appointment.startTime}
            {" – "}
            {appointment.endTime}
          </p>
        </div>

        {/* Type */}
        <div className="min-w-0">
          <span className="truncate text-xs text-slate-600">
            {formatType(appointment.type)}
          </span>
        </div>

        {/* Priority */}
        <div>
          <span
            className={`
              inline-flex
              rounded-lg
              px-2
              py-1
              text-[10px]
              font-semibold
              ${getPriorityClasses(appointment.priority)}
            `}
          >
            {appointment.priority}
          </span>
        </div>

        {/* Status */}
        <div>
          <span
            className={`
              inline-flex
              rounded-lg
              px-2.5
              py-1
              text-[10px]
              font-semibold
              ring-1
              ring-inset
              ${getStatusClasses(appointment.status)}
            `}
          >
            {formatStatus(appointment.status)}
          </span>
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <button
            type="button"
            className="
              inline-flex
              size-8
              items-center
              justify-center
              rounded-lg
              text-slate-300
              transition-all
              duration-150
              hover:bg-teal-50
              hover:text-teal-600
            "
            title="View appointment"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AppointmentMobileCard({
  appointment,
  index,
}: {
  appointment: Appointment;
  index: number;
}) {
  return (
    <div
      className="
        group
        relative
        px-5
        py-4
        transition-colors
        hover:bg-slate-50/60
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
            h-[2px]
            bg-slate-200/30
          "
        />
      )}

      <div className="flex items-start gap-3">
        <div
          className="
            flex
            size-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-teal-50
            text-teal-600
          "
        >
          <UserRound size={16} />
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-700">
                {formatPatientName(appointment)}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {appointment.appointmentNumber}
              </p>
            </div>

            <span
              className={`
                shrink-0
                rounded-lg
                px-2
                py-1
                text-[10px]
                font-semibold
                ring-1
                ring-inset
                ${getStatusClasses(appointment.status)}
              `}
            >
              {formatStatus(appointment.status)}
            </span>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-x-4 gap-y-3">
            <div>
              <p className="text-[11px] text-slate-400">Doctor</p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                {formatDoctorName(appointment)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Date</p>

              <p className="mt-0.5 text-xs font-medium text-slate-600">
                {formatDate(appointment.appointmentDate)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Time</p>

              <p className="mt-0.5 text-xs font-medium text-slate-600">
                {appointment.startTime} – {appointment.endTime}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Type</p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                {formatType(appointment.type)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Priority</p>

              <span
                className={`
                  mt-1
                  inline-flex
                  rounded-lg
                  px-2
                  py-1
                  text-[10px]
                  font-semibold
                  ${getPriorityClasses(appointment.priority)}
                `}
              >
                {appointment.priority}
              </span>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Reason</p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                {appointment.reason || "General consultation"}
              </p>
            </div>
          </div>
        </div>

        <Eye
          size={16}
          className="
            mt-1
            shrink-0
            text-slate-300
            transition-colors
            group-hover:text-teal-500
          "
        />
      </div>
    </div>
  );
}

export function AppointmentsPage() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const [total, setTotal] = useState(0);

  const [totalPages, setTotalPages] = useState(0);

  const [search, setSearch] = useState("");

  const [status, setStatus] = useState<AppointmentStatus | "">("");

  const [type, setType] = useState<AppointmentType | "">("");

  const [appointmentDate, setAppointmentDate] = useState("");

  const [showFilters, setShowFilters] = useState(false);

  const [showRegistration, setShowRegistration] = useState(false);

  const [patients, setPatients] = useState<Patient[]>([]);

  const [doctors, setDoctors] = useState<Doctor[]>([]);

  const loadPatients = useCallback(async () => {
    try {
      const response = await patientService.getPatients({
        page: 1,
        limit: 100,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      setPatients(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Unable to load patients.", error);
      setPatients([]);
    }
  }, []);

  const loadDoctors = useCallback(async () => {
    try {
      const response = await doctorService.getDoctors({
        page: 1,
        limit: 100,
        isActive: true,
        sortOrder: "asc",
      });

      setDoctors(Array.isArray(response.data) ? response.data : []);
    } catch (error) {
      console.error("Unable to load doctors.", error);
      setDoctors([]);
    }
  }, []);

  const loadAppointments = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await appointmentService.getAppointments({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        status: status || undefined,
        type: type || undefined,
        appointmentDate: appointmentDate || undefined,
        sortBy: "appointmentDate",
        sortOrder: "asc",
      });

      setAppointments(Array.isArray(response.items) ? response.items : []);

      setTotal(response.meta?.total ?? 0);

      setTotalPages(response.meta?.totalPages ?? 0);
    } catch (err) {
      console.error("Unable to load appointments.", err);

      setAppointments([]);
      setTotal(0);
      setTotalPages(0);

      setError("Unable to load appointments. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, type, appointmentDate]);

  useEffect(() => {
    loadAppointments();
  }, [loadAppointments]);

  useEffect(() => {
    loadPatients();
    loadDoctors();
  }, [loadPatients, loadDoctors]);

  const clearFilters = () => {
    setStatus("");
    setType("");
    setAppointmentDate("");
    setPage(1);
  };

  const hasFilters = Boolean(status || type || appointmentDate);

  const handlePreviousPage = () => {
    if (page <= 1) {
      return;
    }

    setPage((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    if (page >= totalPages) {
      return;
    }

    setPage((current) => Math.min(totalPages, current + 1));
  };

  return (
    <div className="space-y-6 pb-8">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <CalendarDays size={18} />
            </div>

            <h1 className="text-xl font-semibold tracking-tight text-slate-800">
              Appointments
            </h1>
          </div>

          <p className="mt-1 pl-11 text-sm text-slate-400">
            Manage patient appointments and consultations.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowRegistration(true)}
          className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-teal-600
            px-4
            text-sm
            font-medium
            text-white
            shadow-sm
            transition
            hover:bg-teal-700
            focus:outline-none
            focus:ring-2
            focus:ring-teal-500/20
          "
        >
          <Plus size={17} />
          New appointment
        </button>
      </div>

      {/* Search / Filters */}
      <section
        className="
          rounded-2xl
          bg-white
          p-4
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          ring-1
          ring-slate-200/60
        "
      >
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search
              size={17}
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-slate-300
              "
            />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search appointment, patient or doctor..."
              className="
                h-10
                w-full
                rounded-xl
                border-0
                bg-slate-50
                pl-10
                pr-4
                text-sm
                text-slate-700
                outline-none
                ring-1
                ring-slate-200/70
                placeholder:text-slate-300
                focus:bg-white
                focus:ring-2
                focus:ring-teal-500/20
              "
            />
          </div>

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={`
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              text-sm
              font-medium
              transition
              ${
                showFilters || hasFilters
                  ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100"
                  : "bg-slate-50 text-slate-600 ring-1 ring-slate-200/70"
              }
            `}
          >
            <Filter size={16} />
            Filters
            {hasFilters && (
              <span className="flex size-5 items-center justify-center rounded-full bg-teal-600 text-[10px] font-semibold text-white">
                {[status, type, appointmentDate].filter(Boolean).length}
              </span>
            )}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 pt-1">
            <div className="mb-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <div className="grid gap-3 md:grid-cols-3">
              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                  Appointment date
                </label>

                <input
                  type="date"
                  value={appointmentDate}
                  onChange={(event) => {
                    setAppointmentDate(event.target.value);
                    setPage(1);
                  }}
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border-0
                    bg-slate-50
                    px-3
                    text-sm
                    text-slate-600
                    outline-none
                    ring-1
                    ring-slate-200/70
                    focus:bg-white
                    focus:ring-2
                    focus:ring-teal-500/20
                  "
                />
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                  Status
                </label>

                <select
                  value={status}
                  onChange={(event) => {
                    setStatus(event.target.value as AppointmentStatus | "");
                    setPage(1);
                  }}
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border-0
                    bg-slate-50
                    px-3
                    text-sm
                    text-slate-600
                    outline-none
                    ring-1
                    ring-slate-200/70
                    focus:bg-white
                    focus:ring-2
                    focus:ring-teal-500/20
                  "
                >
                  <option value="">All statuses</option>

                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-[11px] font-medium text-slate-500">
                  Appointment type
                </label>

                <select
                  value={type}
                  onChange={(event) => {
                    setType(event.target.value as AppointmentType | "");
                    setPage(1);
                  }}
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border-0
                    bg-slate-50
                    px-3
                    text-sm
                    text-slate-600
                    outline-none
                    ring-1
                    ring-slate-200/70
                    focus:bg-white
                    focus:ring-2
                    focus:ring-teal-500/20
                  "
                >
                  <option value="">All types</option>

                  {TYPE_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="
                  mt-3
                  inline-flex
                  items-center
                  gap-1.5
                  text-xs
                  font-medium
                  text-slate-400
                  transition
                  hover:text-slate-600
                "
              >
                <X size={13} />
                Clear filters
              </button>
            )}
          </div>
        )}
      </section>

      {/* Appointment directory */}
      <section
        className="
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.04)]
          ring-1
          ring-slate-200/60
        "
      >
        {/* Heading */}
        <div className="px-5 pt-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-700">
                Appointment schedule
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                {total} appointment
                {total === 1 ? "" : "s"}
              </p>
            </div>

            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Clock3 size={14} />
              Upcoming schedule
            </div>
          </div>

          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        {/* Loading */}
        {loading ? (
          <div className="flex min-h-[360px] items-center justify-center">
            <div className="flex items-center gap-3 text-sm text-slate-400">
              <div className="size-4 animate-spin rounded-full border-2 border-slate-200 border-t-teal-500" />
              Loading appointments...
            </div>
          </div>
        ) : error ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center px-5 text-center">
            <p className="text-sm font-medium text-slate-600">
              Unable to load appointments
            </p>

            <p className="mt-1 text-xs text-slate-400">{error}</p>

            <button
              type="button"
              onClick={loadAppointments}
              className="
                mt-4
                rounded-lg
                bg-slate-100
                px-3
                py-2
                text-xs
                font-medium
                text-slate-600
                hover:bg-slate-200
              "
            >
              Try again
            </button>
          </div>
        ) : appointments.length === 0 ? (
          <div className="flex min-h-[360px] flex-col items-center justify-center">
            <div className="flex size-12 items-center justify-center rounded-2xl bg-slate-50 text-slate-300">
              <CalendarDays size={22} />
            </div>

            <p className="mt-4 text-sm font-medium text-slate-600">
              No appointments found
            </p>

            <p className="mt-1 text-xs text-slate-400">
              Try changing your search or filters.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-x-auto md:block">
              <div className="min-w-[1050px]">
                {/* Column heading */}
                <div
                  className="
                    grid
                    grid-cols-[180px_minmax(200px,1.5fr)_minmax(180px,1.4fr)_140px_150px_110px_110px_40px]
                    gap-4
                    bg-slate-50/50
                    px-5
                    py-3
                    text-[10px]
                    font-semibold
                    uppercase
                    tracking-[0.08em]
                    text-slate-400
                  "
                >
                  <span>Appointment</span>
                  <span>Patient</span>
                  <span>Doctor</span>
                  <span>Date & time</span>
                  <span>Type</span>
                  <span>Priority</span>
                  <span>Status</span>
                  <span />
                </div>

                {/* Appointment rows */}
                <div>
                  {appointments.map((appointment, index) => (
                    <AppointmentRow
                      key={appointment.id}
                      appointment={appointment}
                      index={index}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Mobile */}
            <div className="md:hidden">
              {appointments.map((appointment, index) => (
                <AppointmentMobileCard
                  key={appointment.id}
                  appointment={appointment}
                  index={index}
                />
              ))}
            </div>

            {/* Pagination */}
            <div className="px-5 pb-3.5 sm:px-6">
              <div className="mb-3 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-slate-400">
                  Showing{" "}
                  <span className="font-medium text-slate-600">
                    {total === 0
                      ? 0
                      : Math.min((page - 1) * PAGE_SIZE + 1, total)}
                  </span>{" "}
                  to{" "}
                  <span className="font-medium text-slate-600">
                    {Math.min(page * PAGE_SIZE, total)}
                  </span>{" "}
                  of <span className="font-medium text-slate-600">{total}</span>
                </p>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={handlePreviousPage}
                    className="
                      flex
                      size-8
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      transition-colors
                      hover:bg-slate-50
                      hover:text-slate-600
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                    aria-label="Previous page"
                  >
                    <ChevronLeft size={16} />
                  </button>

                  <span
                    className="
                      min-w-16
                      text-center
                      text-xs
                      font-medium
                      text-slate-500
                    "
                  >
                    {page} / {Math.max(totalPages, 1)}
                  </span>

                  <button
                    type="button"
                    disabled={page >= totalPages || totalPages === 0}
                    onClick={handleNextPage}
                    className="
                      flex
                      size-8
                      items-center
                      justify-center
                      rounded-lg
                      text-slate-400
                      transition-colors
                      hover:bg-slate-50
                      hover:text-slate-600
                      disabled:cursor-not-allowed
                      disabled:opacity-30
                    "
                    aria-label="Next page"
                  >
                    <ChevronRight size={16} />
                  </button>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Registration modal */}
      <AppointmentRegistrationModal
        open={showRegistration}
        patients={patients}
        doctors={doctors}
        onClose={() => setShowRegistration(false)}
        onCreated={async () => {
          setShowRegistration(false);
          await loadAppointments();
        }}
      />
    </div>
  );
}
