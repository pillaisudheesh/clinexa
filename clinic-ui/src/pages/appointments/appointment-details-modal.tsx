import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  FileText,
  Loader2,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

import type { Appointment } from "@/types/appointment";

interface AppointmentDetailsModalProps {
  open: boolean;
  appointment: Appointment | null;
  loading?: boolean;

  confirming?: boolean;
  checkingIn?: boolean;
  cancelling?: boolean;
  startingConsultation?: boolean;

  onClose: () => void;
  onConfirm: () => void;
  onCheckIn: () => void;
  onCancel: () => void;
  onStartConsultation: () => void;
  onContinueConsultation: () => void;
  onViewConsultation: () => void;
  canViewCompletedConsultation?: boolean;
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-US", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

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

function formatStatus(status: Appointment["status"]) {
  switch (status) {
    case "SCHEDULED":
      return "Scheduled";

    case "CONFIRMED":
      return "Confirmed";

    case "CHECKED_IN":
      return "Checked in";

    case "IN_CONSULTATION":
      return "In consultation";

    case "COMPLETED":
      return "Completed";

    case "NO_SHOW":
      return "No show";

    case "CANCELLED":
      return "Cancelled";

    default:
      return status;
  }
}

function formatType(type: Appointment["type"]) {
  switch (type) {
    case "NEW_CONSULTATION":
      return "New consultation";

    case "FOLLOW_UP":
      return "Follow-up";

    case "EMERGENCY":
      return "Emergency";

    case "TELECONSULTATION":
      return "Teleconsultation";

    default:
      return type;
  }
}

function getStatusClasses(status: Appointment["status"]) {
  switch (status) {
    case "SCHEDULED":
      return "bg-slate-50 text-slate-600 ring-slate-200";

    case "CONFIRMED":
      return "bg-blue-50 text-blue-700 ring-blue-100";

    case "CHECKED_IN":
      return "bg-amber-50 text-amber-700 ring-amber-100";

    case "IN_CONSULTATION":
      return "bg-violet-50 text-violet-700 ring-violet-100";

    case "COMPLETED":
      return "bg-teal-50 text-teal-700 ring-teal-100";

    case "NO_SHOW":
      return "bg-orange-50 text-orange-700 ring-orange-100";

    case "CANCELLED":
      return "bg-red-50 text-red-600 ring-red-100";

    default:
      return "bg-slate-50 text-slate-600 ring-slate-200";
  }
}

export function AppointmentDetailsModal({
  open,
  appointment,
  loading = false,
  confirming = false,
  checkingIn = false,
  cancelling = false,
  startingConsultation = false,
  onClose,
  onConfirm,
  onCheckIn,
  onCancel,
  onStartConsultation,
  onContinueConsultation,
  onViewConsultation,
  canViewCompletedConsultation,
}: AppointmentDetailsModalProps) {
  if (!open) {
    return null;
  }

  const actionInProgress =
    confirming || checkingIn || cancelling || startingConsultation;

  return (
    <div
      className="
        fixed
        inset-0
        z-50
        flex
        items-center
        justify-center
        bg-slate-950/30
        p-4
        backdrop-blur-[2px]
      "
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !actionInProgress) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[90vh]
          w-full
          max-w-2xl
          flex-col
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_24px_70px_rgba(15,23,42,0.18)]
          ring-1
          ring-slate-200/70
        "
      >
        {/* Header */}
        <div className="relative shrink-0 px-6 pb-5 pt-6">
          <div
            className="
              absolute
              inset-x-0
              bottom-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-slate-200
              to-transparent
            "
          />

          <div className="flex items-start justify-between gap-4">
            <div className="flex min-w-0 items-start gap-3">
              <div
                className="
                  flex
                  size-10
                  shrink-0
                  items-center
                  justify-center
                  rounded-xl
                  bg-teal-50
                  text-teal-600
                "
              >
                <CalendarDays size={19} />
              </div>

              <div className="min-w-0">
                <h2 className="text-base font-semibold text-slate-800">
                  Appointment details
                </h2>

                {appointment && (
                  <p className="mt-1 truncate text-xs text-slate-400">
                    {appointment.appointmentNumber}
                  </p>
                )}
              </div>
            </div>

            <button
              type="button"
              disabled={actionInProgress}
              onClick={onClose}
              className="
                flex
                size-8
                shrink-0
                items-center
                justify-center
                rounded-lg
                text-slate-400
                transition
                hover:bg-slate-50
                hover:text-slate-600
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
              aria-label="Close appointment details"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <div className="flex items-center gap-3 text-sm text-slate-400">
                <Loader2 size={17} className="animate-spin" />
                Loading appointment...
              </div>
            </div>
          ) : !appointment ? (
            <div className="flex min-h-[300px] items-center justify-center">
              <p className="text-sm text-slate-400">
                Appointment details are unavailable.
              </p>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Patient / Doctor */}
              <div className="grid gap-3 sm:grid-cols-2">
                <div
                  className="
                    rounded-xl
                    bg-slate-50/70
                    p-4
                    ring-1
                    ring-slate-100
                  "
                >
                  <div className="flex items-center gap-2">
                    <UserRound size={15} className="text-teal-600" />

                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Patient
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {formatPatientName(appointment)}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {appointment.patient?.patientNumber || "—"}
                  </p>
                </div>

                <div
                  className="
                    rounded-xl
                    bg-slate-50/70
                    p-4
                    ring-1
                    ring-slate-100
                  "
                >
                  <div className="flex items-center gap-2">
                    <Stethoscope size={15} className="text-teal-600" />

                    <span className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Doctor
                    </span>
                  </div>

                  <p className="mt-2 text-sm font-semibold text-slate-700">
                    {formatDoctorName(appointment)}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {appointment.doctor?.doctorNumber || "—"}
                  </p>
                </div>
              </div>

              {/* Status */}
              <div>
                <p className="mb-2 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                  Status
                </p>

                <span
                  className={`
                    inline-flex
                    rounded-lg
                    px-2.5
                    py-1.5
                    text-xs
                    font-semibold
                    ring-1
                    ring-inset
                    ${getStatusClasses(appointment.status)}
                  `}
                >
                  {formatStatus(appointment.status)}
                </span>
              </div>

              {/* Schedule */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <Clock3 size={15} className="text-teal-600" />

                  <h3 className="text-sm font-semibold text-slate-700">
                    Schedule
                  </h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-3">
                  <div>
                    <p className="text-[11px] text-slate-400">Date</p>

                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {formatDate(appointment.appointmentDate)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">Start time</p>

                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {appointment.startTime}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">End time</p>

                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {appointment.endTime}
                    </p>
                  </div>
                </div>
              </div>

              {/* Appointment information */}
              <div>
                <div className="mb-3 flex items-center gap-2">
                  <FileText size={15} className="text-teal-600" />

                  <h3 className="text-sm font-semibold text-slate-700">
                    Appointment information
                  </h3>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <p className="text-[11px] text-slate-400">Type</p>

                    <p className="mt-1 text-sm text-slate-600">
                      {formatType(appointment.type)}
                    </p>
                  </div>

                  <div>
                    <p className="text-[11px] text-slate-400">Priority</p>

                    <p className="mt-1 text-sm text-slate-600">
                      {appointment.priority}
                    </p>
                  </div>
                </div>
              </div>

              {/* Reason */}
              {appointment.reason && (
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Reason
                  </p>

                  <div
                    className="
                      rounded-xl
                      bg-slate-50/70
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-slate-600
                      ring-1
                      ring-slate-100
                    "
                  >
                    {appointment.reason}
                  </div>
                </div>
              )}

              {/* Notes */}
              {appointment.notes && (
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Notes
                  </p>

                  <div
                    className="
                      rounded-xl
                      bg-slate-50/70
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-slate-600
                      ring-1
                      ring-slate-100
                    "
                  >
                    {appointment.notes}
                  </div>
                </div>
              )}

              {/* Cancellation reason */}
              {appointment.cancellationReason && (
                <div>
                  <p className="mb-1.5 text-[11px] font-medium uppercase tracking-wide text-red-400">
                    Cancellation reason
                  </p>

                  <div
                    className="
                      rounded-xl
                      bg-red-50/60
                      px-4
                      py-3
                      text-sm
                      leading-6
                      text-red-700
                      ring-1
                      ring-red-100
                    "
                  >
                    {appointment.cancellationReason}
                  </div>
                </div>
              )}

              {/* Fee */}
              {appointment.consultationFee && (
                <div>
                  <p className="text-[11px] text-slate-400">Consultation fee</p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    ₹{appointment.consultationFee}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="relative shrink-0 px-6 py-4">
          <div
            className="
              absolute
              inset-x-0
              top-0
              h-px
              bg-gradient-to-r
              from-transparent
              via-slate-200
              to-transparent
            "
          />

          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              {appointment?.status === "SCHEDULED" && (
                <p className="text-xs text-slate-400">
                  Confirm the appointment when the schedule is finalized.
                </p>
              )}

              {appointment?.status === "CONFIRMED" && (
                <p className="text-xs text-slate-400">
                  Check in the patient when they arrive.
                </p>
              )}
            </div>

            <div className="flex flex-wrap items-center justify-end gap-2">
              {/* Close */}
              <button
                type="button"
                onClick={onClose}
                disabled={actionInProgress}
                className="
                  rounded-xl
                  px-4
                  py-2.5
                  text-sm
                  font-medium
                  text-slate-500
                  transition
                  hover:bg-slate-50
                  hover:text-slate-700
                  disabled:cursor-not-allowed
                  disabled:opacity-50
                "
              >
                Close
              </button>

              {/* Cancel */}
              {(appointment?.status === "SCHEDULED" ||
                appointment?.status === "CONFIRMED") && (
                <button
                  type="button"
                  onClick={onCancel}
                  disabled={actionInProgress}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    px-4
                    py-2.5
                    text-sm
                    font-medium
                    text-red-600
                    transition
                    hover:bg-red-50
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                  "
                >
                  {cancelling && <Loader2 size={15} className="animate-spin" />}

                  {cancelling ? "Cancelling..." : "Cancel appointment"}
                </button>
              )}

              {/* Confirm */}
              {appointment?.status === "SCHEDULED" && (
                <button
                  type="button"
                  onClick={onConfirm}
                  disabled={actionInProgress}
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
                    transition
                    hover:bg-teal-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {confirming ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}

                  {confirming ? "Confirming..." : "Confirm appointment"}
                </button>
              )}

              {/* Check in */}
              {appointment?.status === "CONFIRMED" && (
                <button
                  type="button"
                  onClick={onCheckIn}
                  disabled={actionInProgress}
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
                    transition
                    hover:bg-teal-700
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
                >
                  {checkingIn ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Clock3 size={15} />
                  )}

                  {checkingIn ? "Checking in..." : "Check in patient"}
                </button>
              )}

              {appointment?.status === "CHECKED_IN" && (
                <button
                  type="button"
                  onClick={onStartConsultation}
                  disabled={
                    confirming ||
                    checkingIn ||
                    cancelling ||
                    startingConsultation
                  }
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
      transition
      hover:bg-teal-700
      disabled:cursor-not-allowed
      disabled:opacity-60
    "
                >
                  {startingConsultation ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Stethoscope size={15} />
                  )}

                  {startingConsultation ? "Starting..." : "Start consultation"}
                </button>
              )}

              {appointment?.status === "IN_CONSULTATION" && (
                <button
                  type="button"
                  onClick={onContinueConsultation}
                  disabled={loading}
                  className="
      inline-flex
      items-center
      justify-center
      gap-2
      rounded-xl
      bg-violet-600
      px-4
      py-2.5
      text-sm
      font-semibold
      text-white
      shadow-sm
      transition
      hover:bg-violet-700
      disabled:cursor-not-allowed
      disabled:opacity-60
    "
                >
                  <Stethoscope size={15} />
                  Continue consultation
                </button>
              )}

              {appointment?.status === "COMPLETED" &&
                canViewCompletedConsultation && (
                  <button
                    type="button"
                    onClick={onViewConsultation}
                    disabled={loading}
                    className="
        inline-flex
        items-center
        justify-center
        gap-2
        rounded-xl
        bg-teal-50
        px-4
        py-2.5
        text-sm
        font-semibold
        text-teal-700
        transition
        hover:bg-teal-100
        hover:text-teal-800
        disabled:cursor-not-allowed
        disabled:opacity-60
      "
                  >
                    <FileText size={15} />
                    View consultation
                  </button>
                )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
