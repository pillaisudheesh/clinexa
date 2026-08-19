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
import { medicalRecordService } from "@/services/medical-record-service";
import { useAuth } from "@/auth/auth-context";

import type {
  CreateMedicalRecordRequest,
  MedicalRecord,
  UpdateMedicalRecordRequest,
} from "@/types/medical-record";

import type {
  Appointment,
  AppointmentStatus,
  AppointmentType,
} from "@/types/appointment";

import type { Doctor } from "@/types/doctor";
import type { Patient } from "@/types/patient";
import { diagnosisService } from "@/services/diagnosis-service";

import type {
  CreateDiagnosisRequest,
  Diagnosis,
  UpdateDiagnosisRequest,
} from "@/types/diagnosis";

import { AppointmentRegistrationModal } from "./appointment-registration-modal";
import { AppointmentDetailsModal } from "./appointment-details-modal";
import { ConsultationModal } from "./consultation-modal";

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
    value: "IN_CONSULTATION",
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

    case "IN_CONSULTATION":
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
  onView,
}: {
  appointment: Appointment;
  index: number;
  onView: (id: string) => void;
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
            onClick={() => onView(appointment.id)}
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
            aria-label="View appointment"
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
  onView,
}: {
  appointment: Appointment;
  index: number;
  onView: (id: string) => void;
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

        <button
          type="button"
          onClick={() => onView(appointment.id)}
          className="
            mt-1
            flex
            size-8
            shrink-0
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
          aria-label="View appointment"
        >
          <Eye size={16} />
        </button>
      </div>
    </div>
  );
}

export function AppointmentsPage() {
  const { user, hasPermission } = useAuth();

  console.log("User permissions:", user?.permissions);
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

  const [selectedAppointmentId, setSelectedAppointmentId] = useState<
    string | null
  >(null);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const [cancellationReason, setCancellationReason] = useState("");

  const [cancelLoading, setCancelLoading] = useState(false);

  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);

  const [detailsLoading, setDetailsLoading] = useState(false);
  const [confirming, setConfirming] = useState(false);
  const [checkingIn, setCheckingIn] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [startingConsultation, setStartingConsultation] = useState(false);
  const [consultationOpen, setConsultationOpen] = useState(false);

  const [consultationLoading, setConsultationLoading] = useState(false);

  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(
    null,
  );

  const [medicalRecordSaving, setMedicalRecordSaving] = useState(false);

  const [completing, setCompleting] = useState(false);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

  const [diagnosesLoading, setDiagnosesLoading] = useState(false);

  const [diagnosisSaving, setDiagnosisSaving] = useState(false);

  const [diagnosisDeleting, setDiagnosisDeleting] = useState<string | null>(
    null,
  );

  const canReadAppointments = hasPermission("APPOINTMENT_READ");

  const canCreateAppointments = hasPermission("APPOINTMENT_CREATE");

  const canUpdateAppointments = hasPermission("APPOINTMENT_UPDATE");

  const canCancelAppointments = hasPermission("APPOINTMENT_CANCEL");

  const canCreateMedicalRecords = hasPermission("MEDICAL_RECORD_CREATE");

  const canReadMedicalRecords = hasPermission("MEDICAL_RECORD_READ");

  const canUpdateMedicalRecords = hasPermission("MEDICAL_RECORD_UPDATE");

  const canReadDiagnoses = hasPermission("DIAGNOSIS_READ");

  const canCreateDiagnoses = hasPermission("DIAGNOSIS_CREATE");

  const canUpdateDiagnoses = hasPermission("DIAGNOSIS_UPDATE");

  const canDeleteDiagnoses = hasPermission("DIAGNOSIS_DELETE");

  const canConfirmAppointment =
    selectedAppointment?.status === "SCHEDULED" && canUpdateAppointments;

  const canCheckInAppointment =
    selectedAppointment?.status === "CONFIRMED" && canUpdateAppointments;

  const canStartConsultation =
    selectedAppointment?.status === "CHECKED_IN" && canUpdateAppointments;

  const canCancelAppointment =
    ["SCHEDULED", "CONFIRMED", "CHECKED_IN"].includes(
      selectedAppointment?.status ?? "",
    ) && canCancelAppointments;

  const canCompleteAppointment =
    selectedAppointment?.status === "IN_CONSULTATION" &&
    canUpdateAppointments &&
    (canCreateMedicalRecords || canUpdateMedicalRecords);

  const canViewCompletedConsultation =
    selectedAppointment?.status === "COMPLETED" && canReadMedicalRecords;

  console.log("Diagnosis debug:", {
    medicalRecord,
    canReadDiagnoses,
    canCreateDiagnoses,
    canUpdateDiagnoses,
    canDeleteDiagnoses,
    diagnoses,
  });

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

  const openAppointmentDetails = async (id: string) => {
    try {
      setSelectedAppointmentId(id);
      setSelectedAppointment(null);
      setDetailsLoading(true);

      const appointment = await appointmentService.getAppointment(id);

      setSelectedAppointment(appointment);
    } catch (error) {
      console.error("Unable to load appointment details.", error);
    } finally {
      setDetailsLoading(false);
    }
  };

  const closeAppointmentDetails = () => {
    setSelectedAppointmentId(null);
    setSelectedAppointment(null);
    setDetailsLoading(false);
  };

  const handleConfirmAppointment = async () => {
    if (!selectedAppointment) {
      return;
    }

    try {
      setConfirming(true);

      const updatedAppointment = await appointmentService.confirmAppointment(
        selectedAppointment.id,
      );

      setSelectedAppointment(updatedAppointment);

      await loadAppointments();
    } catch (error) {
      console.error("Unable to confirm appointment.", error);
    } finally {
      setConfirming(false);
    }
  };

  const handleCheckInAppointment = async () => {
    if (!selectedAppointment) {
      return;
    }

    try {
      setCheckingIn(true);

      const updatedAppointment = await appointmentService.checkInAppointment(
        selectedAppointment.id,
      );

      setSelectedAppointment(updatedAppointment);

      await loadAppointments();
    } catch (error) {
      console.error("Unable to check in patient.", error);
    } finally {
      setCheckingIn(false);
    }
  };

  const handleCancelAppointment = async () => {
    if (!selectedAppointment) {
      return;
    }

    try {
      setCancelling(true);

      const updatedAppointment = await appointmentService.cancelAppointment(
        selectedAppointment.id,
        cancellationReason,
      );

      setSelectedAppointment(updatedAppointment);

      setShowCancelDialog(false);
      setCancellationReason("");

      await loadAppointments();
    } catch (error) {
      console.error("Unable to cancel appointment.", error);
    } finally {
      setCancelling(false);
    }
  };

  const handleStartConsultation = async () => {
    if (!selectedAppointment) {
      return;
    }

    try {
      setStartingConsultation(true);

      const updated = await appointmentService.startConsultation(
        selectedAppointment.id,
      );

      setSelectedAppointment(updated);

      await loadAppointments();

      setConsultationOpen(true);

      setConsultationLoading(true);

      const response = await medicalRecordService.getMedicalRecords(updated.id);

      if (response.data?.[0]) {
        const record = response.data[0];

        setMedicalRecord(record);

        await loadDiagnoses(record.id);
      } else {
        setMedicalRecord(null);
        setDiagnoses([]);
      }
    } catch (error) {
      console.error("Unable to start consultation.", error);
    } finally {
      setStartingConsultation(false);
      setConsultationLoading(false);
    }
  };

  const openConsultation = async () => {
    if (!selectedAppointment) {
      return;
    }

    try {
      setConsultationOpen(true);
      setConsultationLoading(true);

      const response = await medicalRecordService.getMedicalRecords(
        selectedAppointment.id,
      );

      setMedicalRecord(response.data?.[0] ?? null);
    } catch (error) {
      console.error("Unable to load medical record.", error);

      setMedicalRecord(null);
    } finally {
      setConsultationLoading(false);
    }
  };

  const handleSaveMedicalRecord = async (
    data: CreateMedicalRecordRequest | UpdateMedicalRecordRequest,
  ) => {
    if (!selectedAppointment) {
      return;
    }

    try {
      setMedicalRecordSaving(true);

      if (medicalRecord) {
        const updated = await medicalRecordService.updateMedicalRecord(
          medicalRecord.id,
          data as UpdateMedicalRecordRequest,
        );

        setMedicalRecord(updated);

        return;
      }

      const created = await medicalRecordService.createMedicalRecord(
        data as CreateMedicalRecordRequest,
      );

      setMedicalRecord(created);
    } catch (error) {
      console.error("Unable to save medical record.", error);
    } finally {
      setMedicalRecordSaving(false);
    }
  };

  const handleCompleteAppointment = async () => {
    if (!selectedAppointment || !medicalRecord) {
      return;
    }

    try {
      setCompleting(true);

      const updated = await appointmentService.completeAppointment(
        selectedAppointment.id,
      );

      setSelectedAppointment(updated);

      setConsultationOpen(false);

      await loadAppointments();
    } catch (error) {
      console.error("Unable to complete consultation.", error);
    } finally {
      setCompleting(false);
    }
  };
  const handleCloseConsultation = () => {
    if (medicalRecordSaving || completing) {
      return;
    }

    setConsultationOpen(false);
  };
  const handleContinueConsultation = async () => {
    if (!selectedAppointment) {
      return;
    }

    setConsultationOpen(true);
    setConsultationLoading(true);

    try {
      const response = await medicalRecordService.getMedicalRecords(
        selectedAppointment.id,
      );

      if (response.data?.[0]) {
        const record = response.data[0];

        setMedicalRecord(record);

        await loadDiagnoses(record.id);
      } else {
        setMedicalRecord(null);
        setDiagnoses([]);
      }
    } catch (error) {
      console.error("Unable to load consultation.", error);

      setMedicalRecord(null);
    } finally {
      setConsultationLoading(false);
    }
  };

  const handleViewConsultation = async () => {
    if (!selectedAppointment) {
      return;
    }

    try {
      setConsultationOpen(true);
      setConsultationLoading(true);

      const response = await medicalRecordService.getMedicalRecords(
        selectedAppointment.id,
      );

      if (response.data?.[0]) {
        const record = response.data[0];

        setMedicalRecord(record);

        await loadDiagnoses(record.id);
      } else {
        setMedicalRecord(null);
        setDiagnoses([]);
      }
    } catch (error) {
      console.error("Unable to load completed consultation.", error);

      setMedicalRecord(null);
    } finally {
      setConsultationLoading(false);
    }
  };

  const loadDiagnoses = async (medicalRecordId: string) => {
    if (!canReadDiagnoses) {
      setDiagnoses([]);
      return;
    }

    try {
      setDiagnosesLoading(true);

      const records =
        await diagnosisService.getByMedicalRecord(medicalRecordId);

      setDiagnoses(records);
    } catch (error) {
      console.error("Unable to load diagnoses.", error);

      setDiagnoses([]);
    } finally {
      setDiagnosesLoading(false);
    }
  };

  const handleCreateDiagnosis = async (data: CreateDiagnosisRequest) => {
    if (!canCreateDiagnoses) {
      return;
    }

    try {
      setDiagnosisSaving(true);

      const created = await diagnosisService.create(data);

      setDiagnoses((current) => [created, ...current]);
    } catch (error) {
      console.error("Unable to create diagnosis.", error);
    } finally {
      setDiagnosisSaving(false);
    }
  };

  const handleUpdateDiagnosis = async (
    id: string,
    data: UpdateDiagnosisRequest,
  ) => {
    if (!canUpdateDiagnoses) {
      return;
    }

    try {
      setDiagnosisSaving(true);

      const updated = await diagnosisService.update(id, data);

      setDiagnoses((current) =>
        current.map((diagnosis) => (diagnosis.id === id ? updated : diagnosis)),
      );
    } catch (error) {
      console.error("Unable to update diagnosis.", error);
    } finally {
      setDiagnosisSaving(false);
    }
  };

  const handleDeleteDiagnosis = async (id: string) => {
    if (!canDeleteDiagnoses) {
      return;
    }

    try {
      setDiagnosisDeleting(id);

      await diagnosisService.remove(id);

      setDiagnoses((current) =>
        current.filter((diagnosis) => diagnosis.id !== id),
      );
    } catch (error) {
      console.error("Unable to delete diagnosis.", error);
    } finally {
      setDiagnosisDeleting(null);
    }
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
                      onView={openAppointmentDetails}
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
                  onView={openAppointmentDetails}
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

      {/* Appointment details modal */}
      <AppointmentDetailsModal
        open={Boolean(selectedAppointmentId)}
        appointment={selectedAppointment}
        loading={detailsLoading}
        confirming={confirming}
        checkingIn={checkingIn}
        cancelling={cancelling}
        startingConsultation={startingConsultation}
        onClose={closeAppointmentDetails}
        onConfirm={handleConfirmAppointment}
        onCheckIn={handleCheckInAppointment}
        onCancel={() => {
          setCancellationReason("");
          setShowCancelDialog(true);
        }}
        onStartConsultation={handleStartConsultation}
        onContinueConsultation={handleContinueConsultation}
        canViewCompletedConsultation={canViewCompletedConsultation}
        onViewConsultation={handleViewConsultation}
      />

      <ConsultationModal
        open={consultationOpen}
        appointment={selectedAppointment}
        medicalRecord={medicalRecord}
        loading={consultationLoading}
        saving={medicalRecordSaving}
        completing={completing}
        readOnly={selectedAppointment?.status === "COMPLETED"}
        canCreateMedicalRecord={canCreateMedicalRecords}
        canUpdateMedicalRecord={canUpdateMedicalRecords}
        canCompleteAppointment={canCompleteAppointment}
        diagnoses={diagnoses}
        diagnosesLoading={diagnosesLoading}
        diagnosisSaving={diagnosisSaving}
        diagnosisDeleting={diagnosisDeleting}
        canReadDiagnoses={canReadDiagnoses}
        canCreateDiagnoses={canCreateDiagnoses}
        canUpdateDiagnoses={canUpdateDiagnoses}
        canDeleteDiagnoses={canDeleteDiagnoses}
        onCreateDiagnosis={handleCreateDiagnosis}
        onUpdateDiagnosis={handleUpdateDiagnosis}
        onDeleteDiagnosis={handleDeleteDiagnosis}
        onClose={handleCloseConsultation}
        onSave={handleSaveMedicalRecord}
        onComplete={handleCompleteAppointment}
      />
      {showCancelDialog && (
        <div
          className="
      fixed
      inset-0
      z-[60]
      flex
      items-center
      justify-center
      bg-slate-950/30
      p-4
      backdrop-blur-[2px]
    "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              if (!cancelLoading) {
                setShowCancelDialog(false);
              }
            }
          }}
        >
          <div
            className="
        w-full
        max-w-md
        overflow-hidden
        rounded-2xl
        bg-white
        shadow-[0_24px_70px_rgba(15,23,42,0.18)]
        ring-1
        ring-slate-200/70
      "
          >
            {/* Header */}
            <div className="relative px-6 pb-5 pt-6">
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
                <div>
                  <h3 className="text-base font-semibold text-slate-800">
                    Cancel appointment
                  </h3>

                  <p className="mt-1 text-xs leading-5 text-slate-400">
                    Are you sure you want to cancel this appointment?
                  </p>
                </div>

                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={() => setShowCancelDialog(false)}
                  className="
              flex
              size-8
              items-center
              justify-center
              rounded-lg
              text-slate-400
              transition
              hover:bg-slate-50
              hover:text-slate-600
              disabled:opacity-50
            "
                  aria-label="Close"
                >
                  <X size={17} />
                </button>
              </div>
            </div>

            {/* Content */}
            <div className="px-6 py-5">
              {selectedAppointment && (
                <div
                  className="
              rounded-xl
              bg-slate-50/70
              px-4
              py-3
              ring-1
              ring-slate-100
            "
                >
                  <p className="text-sm font-semibold text-slate-700">
                    {formatPatientName(selectedAppointment)}
                  </p>

                  <p className="mt-0.5 text-xs text-slate-400">
                    {selectedAppointment.appointmentNumber}
                  </p>
                </div>
              )}

              <div className="mt-4">
                <label
                  htmlFor="cancellation-reason"
                  className="
              mb-1.5
              block
              text-[11px]
              font-medium
              text-slate-500
            "
                >
                  Cancellation reason
                  <span className="ml-1 text-slate-300">(optional)</span>
                </label>

                <textarea
                  id="cancellation-reason"
                  value={cancellationReason}
                  onChange={(event) =>
                    setCancellationReason(event.target.value)
                  }
                  disabled={cancelLoading}
                  rows={3}
                  maxLength={500}
                  placeholder="Enter a reason for cancellation..."
                  className="
              w-full
              resize-none
              rounded-xl
              border-0
              bg-slate-50
              px-3
              py-2.5
              text-sm
              leading-5
              text-slate-700
              outline-none
              ring-1
              ring-slate-200/70
              placeholder:text-slate-300
              focus:bg-white
              focus:ring-2
              focus:ring-teal-500/20
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
                />

                <div className="mt-1 flex justify-end">
                  <span className="text-[10px] text-slate-300">
                    {cancellationReason.length}/500
                  </span>
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="relative px-6 py-4">
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

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={() => setShowCancelDialog(false)}
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
              disabled:opacity-50
            "
                >
                  Keep appointment
                </button>

                <button
                  type="button"
                  disabled={cancelLoading}
                  onClick={handleCancelAppointment}
                  className="
              inline-flex
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-red-600
              px-4
              py-2.5
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition
              hover:bg-red-700
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
                >
                  {cancelLoading && (
                    <span
                      className="
                  size-4
                  animate-spin
                  rounded-full
                  border-2
                  border-white/40
                  border-t-white
                "
                    />
                  )}

                  {cancelLoading ? "Cancelling..." : "Cancel appointment"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
