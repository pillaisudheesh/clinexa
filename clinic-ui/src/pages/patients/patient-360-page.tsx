import { useCallback, useEffect, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock3,
  UserRound,
  ShieldAlert,
  FileText,
  Pill,
  FlaskConical,
  ReceiptText,
  Store,
  Stethoscope,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { patientService } from "@/services/patient-service";
import { appointmentService } from "@/services/appointment-service";

import type { Patient } from "@/types/patient";
import type { Appointment, AppointmentStatus } from "@/types/appointment";
import type { MedicalRecord } from "@/types/medical-record";
import { medicalRecordService } from "@/services/medical-record-service";
import { prescriptionService } from "@/services/prescription-service";
import type { Prescription } from "@/types/prescription";
import { laboratoryService } from "@/services/laboratory-service";
import type { LabOrder } from "@/types/laboratory";
import { billingService } from "@/services/billing-service";
import type { Invoice } from "@/types/billing";
import { pharmacyService } from "@/services/pharmacy-service";
import type { PharmacyPrescription } from "@/types/pharmacy";
import { diagnosisService } from "@/services/diagnosis-service";
import type { Diagnosis } from "@/types/diagnosis";

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatTime(value: string): string {
  if (!value) {
    return "—";
  }

  const [hours, minutes] = value.split(":").map(Number);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return value;
  }

  const date = new Date();
  date.setHours(hours, minutes, 0, 0);

  return new Intl.DateTimeFormat("en-IN", {
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function formatAmount(value: string) {
  return Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

function getStatusClasses(status: AppointmentStatus): string {
  switch (status) {
    case "COMPLETED":
      return "bg-teal-50 text-teal-700";

    case "CANCELLED":
    case "NO_SHOW":
      return "bg-red-50 text-red-600";

    case "CHECKED_IN":
    case "IN_CONSULTATION":
      return "bg-amber-50 text-amber-700";

    default:
      return "bg-slate-100 text-slate-600";
  }
}

function getInitials(patient: Patient): string {
  return `${patient.firstName?.[0] ?? ""}${patient.lastName?.[0] ?? ""}`.toUpperCase();
}

export function Patient360Page() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [patient, setPatient] = useState<Patient | null>(null);
  const [appointments, setAppointments] = useState<Appointment[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [medicalRecords, setMedicalRecords] = useState<MedicalRecord[]>([]);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [labOrders, setLabOrders] = useState<LabOrder[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [pharmacyPrescriptions, setPharmacyPrescriptions] = useState<
    PharmacyPrescription[]
  >([]);
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);

  const loadPatient360 = useCallback(async () => {
    if (!id) {
      setError("Patient ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const [
        patientResult,
        appointmentResult,
        labOrderResult,
        invoiceResult,
        pharmacyPrescriptionResult,
      ] = await Promise.all([
        patientService.getPatient(id),
        appointmentService.getAppointments({
          patientId: id,
          page: 1,
          limit: 10,
          sortBy: "appointmentDate",
          sortOrder: "desc",
        }),
        laboratoryService.getOrders({
          patientId: id,
          page: 1,
          limit: 10,
        }),
        billingService.getInvoices({
          patientId: id,
          page: 1,
          limit: 10,
        }),
        pharmacyService.getPrescriptions({
          page: 1,
          limit: 50,
        }),
      ]);

      const appointmentItems = appointmentResult.items;

      const medicalRecordsResponse =
        await medicalRecordService.getMedicalRecords(undefined, id);

      const medicalRecordsResult = medicalRecordsResponse.data;

      const diagnosisResults = await Promise.all(
        medicalRecordsResult.map(async (record) => {
          try {
            return await diagnosisService.getByMedicalRecord(record.id);
          } catch (requestError) {
            console.error(
              `Unable to load diagnoses for medical record ${record.id}.`,
              requestError,
            );
            return [];
          }
        }),
      );

      const diagnosisItems = diagnosisResults.flat();

      const prescriptionResults = await Promise.all(
        medicalRecordsResult.map(async (record) => {
          try {
            const result = await prescriptionService.getPrescriptions({
              medicalRecordId: record.id,
              page: 1,
              limit: 50,
            });

            return result.data;
          } catch (requestError) {
            console.error(
              `Unable to load prescriptions for medical record ${record.id}.`,
              requestError,
            );

            return [];
          }
        }),
      );

      const patientPharmacyPrescriptions =
        pharmacyPrescriptionResult.data.filter(
          (prescription) => prescription.patient.id === id,
        );

      setPatient(patientResult);
      setAppointments(appointmentItems);
      setLabOrders(labOrderResult.data);
      setInvoices(invoiceResult.data);
      setMedicalRecords(medicalRecordsResult);
      setDiagnoses(diagnosisItems);
      setPrescriptions(prescriptionResults.flat());
      setPharmacyPrescriptions(patientPharmacyPrescriptions);
    } catch (requestError) {
      console.error("Unable to load patient 360.", requestError);
      setError("Unable to load patient information.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatient360();
  }, [loadPatient360]);

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />

        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="size-16 animate-pulse rounded-2xl bg-slate-100" />

            <div className="space-y-2">
              <div className="h-5 w-48 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="h-72 animate-pulse rounded-2xl bg-slate-50" />
      </div>
    );
  }

  if (error || !patient) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate(`/patients/${id}`)}
          className="
            inline-flex
            items-center
            gap-2
            text-xs
            font-semibold
            text-slate-400
            hover:text-teal-600
          "
        >
          <ArrowLeft size={15} />
          Back to patient
        </button>

        <div
          className="
            rounded-2xl
            bg-white
            px-6
            py-16
            text-center
            shadow-[0_8px_30px_rgba(15,23,42,0.045)]
            ring-1
            ring-slate-200/60
          "
        >
          <div
            className="
              mx-auto
              flex
              size-12
              items-center
              justify-center
              rounded-full
              bg-red-50
              text-red-500
            "
          >
            <ShieldAlert size={22} />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-slate-700">
            Unable to load patient
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {error ?? "The requested patient could not be found."}
          </p>

          <button
            type="button"
            onClick={loadPatient360}
            className="
              mt-5
              rounded-xl
              bg-teal-600
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
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
    <div className="space-y-5 pb-8">
      <button
        type="button"
        onClick={() => navigate(`/patients/${patient.id}`)}
        className="
          inline-flex
          items-center
          gap-2
          text-xs
          font-semibold
          text-slate-400
          transition-colors
          hover:text-teal-600
        "
      >
        <ArrowLeft size={15} />
        Back to patient
      </button>

      {/* Patient header */}
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
        <div className="p-5 sm:p-6">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-center">
            <div
              className="
                flex
                size-16
                shrink-0
                items-center
                justify-center
                rounded-2xl
                bg-teal-50
                text-lg
                font-semibold
                text-teal-700
                ring-1
                ring-teal-100
              "
            >
              {getInitials(patient)}
            </div>

            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                  {patient.fullName}
                </h1>

                <span
                  className={`
                    inline-flex
                    items-center
                    rounded-full
                    px-2.5
                    py-1
                    text-[11px]
                    font-semibold
                    ${
                      patient.isActive
                        ? "bg-teal-50 text-teal-700"
                        : "bg-slate-100 text-slate-500"
                    }
                  `}
                >
                  {patient.isActive ? "Active" : "Inactive"}
                </span>
              </div>

              <div className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-400">
                <span>{patient.patientNumber}</span>
                <span>·</span>
                <span>Patient 360</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {loading ? (
        <div
          className="
      rounded-2xl
      bg-white
      px-6
      py-16
      text-center
      shadow-[0_8px_30px_rgba(15,23,42,0.045)]
      ring-1
      ring-slate-200/60
    "
        >
          <div
            className="
        mx-auto
        size-8
        animate-spin
        rounded-full
        border-2
        border-slate-200
        border-t-teal-600
      "
          />

          <p className="mt-4 text-sm font-medium text-slate-600">
            Loading patient history
          </p>

          <p className="mt-1 text-xs text-slate-400">
            Please wait while we load the patient records.
          </p>
        </div>
      ) : (
        <>
          {/* Appointments */}
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
            <div className="mb-5 flex items-start gap-3">
              <div
                className="
              flex
              size-9
              shrink-0
              items-center
              justify-center
              rounded-xl
              bg-teal-50
              text-teal-600
            "
              >
                <CalendarDays size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Appointments
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Appointment history for this patient.
                </p>
              </div>
            </div>

            {appointments.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
                <CalendarDays size={20} className="mx-auto text-slate-300" />

                <p className="mt-3 text-xs font-medium text-slate-500">
                  No appointments found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {appointments.map((appointment) => (
                  <div
                    key={appointment.id}
                    className="
                  rounded-xl
                  bg-slate-50/70
                  p-4
                  ring-1
                  ring-slate-200/50
                  transition-colors
                  hover:bg-slate-50
                "
                  >
                    <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-semibold text-slate-700">
                            {appointment.appointmentNumber}
                          </p>

                          <span
                            className={`
                          rounded-full
                          px-2.5
                          py-1
                          text-[10px]
                          font-semibold
                          ${getStatusClasses(appointment.status)}
                        `}
                          >
                            {formatLabel(appointment.status)}
                          </span>
                        </div>

                        <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-slate-500">
                          <span className="inline-flex items-center gap-1.5">
                            <CalendarDays size={13} />
                            {formatDate(appointment.appointmentDate)}
                          </span>

                          <span className="inline-flex items-center gap-1.5">
                            <Clock3 size={13} />
                            {formatTime(appointment.startTime)} –{" "}
                            {formatTime(appointment.endTime)}
                          </span>
                        </div>
                      </div>

                      <div className="grid gap-2 text-xs sm:grid-cols-2 lg:min-w-[320px]">
                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Doctor
                          </p>

                          <p className="mt-0.5 flex items-center gap-1.5 font-medium text-slate-600">
                            <UserRound size={13} />
                            {appointment.doctor
                              ? `${appointment.doctor.title} ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                              : "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Type
                          </p>

                          <p className="mt-0.5 font-medium text-slate-600">
                            {formatLabel(appointment.type)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Priority
                          </p>

                          <p className="mt-0.5 font-medium text-slate-600">
                            {formatLabel(appointment.priority)}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Reason
                          </p>

                          <p className="mt-0.5 truncate font-medium text-slate-600">
                            {appointment.reason || "—"}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Medical Records */}
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
            <div className="mb-5 flex items-start gap-3">
              <div
                className="
        flex
        size-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-teal-50
        text-teal-600
      "
              >
                <FileText size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Medical Records
                </h2>
                <p className="mt-0.5 text-xs text-slate-400">
                  Clinical records associated with this patient.
                </p>
              </div>
            </div>

            {medicalRecords.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
                <FileText size={20} className="mx-auto text-slate-300" />

                <p className="mt-3 text-xs font-medium text-slate-500">
                  No medical records found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {medicalRecords.map((record) => {
                  const appointment = appointments.find(
                    (item) => item.id === record.appointmentId,
                  );

                  return (
                    <div
                      key={record.id}
                      className="
        rounded-xl
        bg-slate-50/70
        p-4
        ring-1
        ring-slate-200/50
      "
                    >
                      {appointment && (
                        <div className="mb-4">
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-xs font-semibold text-slate-700">
                              {appointment.appointmentNumber}
                            </p>

                            <span className="text-slate-300">·</span>

                            <p className="text-xs text-slate-500">
                              {formatDate(appointment.appointmentDate)}
                            </p>
                          </div>

                          <p className="mt-1 text-[11px] text-slate-400">
                            {appointment.doctor
                              ? `${appointment.doctor.title} ${appointment.doctor.firstName} ${appointment.doctor.lastName}`
                              : "Doctor not available"}
                          </p>
                        </div>
                      )}

                      <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Chief complaint
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {record.chiefComplaint || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Assessment
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {record.assessment || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Examination notes
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-xs font-medium text-slate-600">
                            {record.examinationNotes || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Treatment plan
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-xs font-medium text-slate-600">
                            {record.treatmentPlan || "—"}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-[10px] font-medium text-slate-400">
                            History of present illness
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-xs font-medium text-slate-600">
                            {record.historyOfPresentIllness || "—"}
                          </p>
                        </div>

                        <div className="sm:col-span-2">
                          <p className="text-[10px] font-medium text-slate-400">
                            Follow-up instructions
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-xs font-medium text-slate-600">
                            {record.followUpInstructions || "—"}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 pt-1">
                        <p className="text-[10px] text-slate-400">
                          Recorded {formatDate(record.createdAt)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Diagnoses */}
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
            <div className="mb-5 flex items-start gap-3">
              <div
                className="
        flex
        size-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-teal-50
        text-teal-600
      "
              >
                <Stethoscope size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Diagnoses
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Diagnoses recorded for this patient.
                </p>
              </div>
            </div>

            {diagnoses.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
                <Stethoscope size={20} className="mx-auto text-slate-300" />

                <p className="mt-3 text-xs font-medium text-slate-500">
                  No diagnoses found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {diagnoses.map((diagnosis) => {
                  const appointment = appointments.find(
                    (item) =>
                      medicalRecords.find(
                        (record) => record.id === diagnosis.medicalRecordId,
                      )?.appointmentId === item.id,
                  );

                  return (
                    <div
                      key={diagnosis.id}
                      className="
              rounded-xl
              bg-slate-50/70
              p-4
              ring-1
              ring-slate-200/50
            "
                    >
                      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div>
                          <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                            <p className="text-sm font-semibold text-slate-700">
                              {diagnosis.name}
                            </p>

                            {diagnosis.isPrimary && (
                              <span
                                className="
                        rounded-full
                        bg-teal-50
                        px-2.5
                        py-1
                        text-[10px]
                        font-semibold
                        text-teal-700
                      "
                              >
                                Primary
                              </span>
                            )}
                          </div>

                          {diagnosis.code && (
                            <p className="mt-1 text-[11px] text-slate-400">
                              Code: {diagnosis.code}
                            </p>
                          )}
                        </div>

                        {appointment && (
                          <div className="text-left sm:text-right">
                            <p className="text-xs font-medium text-slate-600">
                              {appointment.appointmentNumber}
                            </p>

                            <p className="mt-0.5 text-[10px] text-slate-400">
                              {formatDate(appointment.appointmentDate)}
                            </p>
                          </div>
                        )}
                      </div>

                      {diagnosis.notes && (
                        <div className="mt-4">
                          <p className="text-[10px] font-medium text-slate-400">
                            Notes
                          </p>

                          <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">
                            {diagnosis.notes}
                          </p>
                        </div>
                      )}

                      <p className="mt-4 text-[10px] text-slate-400">
                        Recorded {formatDate(diagnosis.createdAt)}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* Prescriptions */}
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
            <div className="mb-5 flex items-start gap-3">
              <div
                className="
        flex
        size-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-teal-50
        text-teal-600
      "
              >
                <Pill size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Prescriptions
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Medicines prescribed for this patient.
                </p>
              </div>
            </div>

            {prescriptions.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
                <Pill size={20} className="mx-auto text-slate-300" />

                <p className="mt-3 text-xs font-medium text-slate-500">
                  No prescriptions found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {prescriptions.map((prescription) => {
                  const medicalRecord = medicalRecords.find(
                    (record) => record.id === prescription.medicalRecordId,
                  );

                  const appointment = medicalRecord
                    ? appointments.find(
                        (item) => item.id === medicalRecord.appointmentId,
                      )
                    : undefined;

                  return (
                    <div
                      key={prescription.id}
                      className="
              rounded-xl
              bg-slate-50/70
              p-4
              ring-1
              ring-slate-200/50
            "
                    >
                      <div className="mb-4">
                        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-sm font-semibold text-slate-700">
                            {prescription.medicationName}
                          </p>

                          {appointment && (
                            <>
                              <span className="text-slate-300">·</span>

                              <p className="text-xs text-slate-500">
                                {appointment.appointmentNumber}
                              </p>

                              <span className="text-slate-300">·</span>

                              <p className="text-xs text-slate-500">
                                {formatDate(appointment.appointmentDate)}
                              </p>
                            </>
                          )}
                        </div>
                      </div>

                      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Dosage
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {prescription.dosage || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Frequency
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {prescription.frequency || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Route
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {prescription.route || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Duration
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {prescription.duration || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Quantity
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {prescription.quantity || "—"}
                          </p>
                        </div>

                        <div>
                          <p className="text-[10px] font-medium text-slate-400">
                            Prescribed
                          </p>

                          <p className="mt-1 text-xs font-medium text-slate-600">
                            {formatDate(prescription.createdAt)}
                          </p>
                        </div>

                        {prescription.instructions && (
                          <div className="sm:col-span-2 lg:col-span-3">
                            <p className="text-[10px] font-medium text-slate-400">
                              Instructions
                            </p>

                            <p className="mt-1 whitespace-pre-wrap text-xs font-medium text-slate-600">
                              {prescription.instructions}
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
          {/* Laboratory */}
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
            <div className="mb-5 flex items-start gap-3">
              <div
                className="
        flex
        size-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-teal-50
        text-teal-600
      "
              >
                <FlaskConical size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Laboratory
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Laboratory orders and results for this patient.
                </p>
              </div>
            </div>

            {labOrders.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
                <FlaskConical size={20} className="mx-auto text-slate-300" />

                <p className="mt-3 text-xs font-medium text-slate-500">
                  No laboratory orders found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {labOrders.map((order) => (
                  <div
                    key={order.id}
                    className="
            rounded-xl
            bg-slate-50/70
            p-4
            ring-1
            ring-slate-200/50
          "
                  >
                    <div className="mb-4">
                      <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
                        <p className="text-sm font-semibold text-slate-700">
                          {order.appointment?.appointmentNumber || "Lab order"}
                        </p>

                        <span className="text-slate-300">·</span>

                        <p className="text-xs text-slate-500">
                          {order.appointment
                            ? formatDate(order.appointment.appointmentDate)
                            : formatDate(order.createdAt)}
                        </p>

                        <span
                          className="
                  rounded-full
                  bg-slate-100
                  px-2.5
                  py-1
                  text-[10px]
                  font-semibold
                  text-slate-600
                "
                        >
                          {formatLabel(order.status)}
                        </span>
                      </div>

                      {order.appointment?.doctor && (
                        <p className="mt-1 text-[11px] text-slate-400">
                          Dr. {order.appointment.doctor.firstName}{" "}
                          {order.appointment.doctor.lastName}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      {order.items.map((item) => (
                        <div
                          key={item.id}
                          className="
                  rounded-xl
                  bg-white
                  p-3
                  ring-1
                  ring-slate-200/50
                "
                        >
                          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <div>
                              <p className="text-xs font-semibold text-slate-700">
                                {item.labTestName}
                              </p>

                              <p className="mt-0.5 text-[10px] text-slate-400">
                                {item.labTestCode}
                              </p>
                            </div>

                            <span
                              className="
                      w-fit
                      rounded-full
                      bg-slate-100
                      px-2.5
                      py-1
                      text-[10px]
                      font-semibold
                      text-slate-600
                    "
                            >
                              {formatLabel(item.status)}
                            </span>
                          </div>

                          {item.result && (
                            <div className="mt-3">
                              <p className="text-[10px] font-medium text-slate-400">
                                Result
                              </p>

                              <p className="mt-1 whitespace-pre-wrap text-xs font-medium text-slate-600">
                                {item.result.result}
                              </p>

                              {item.result.notes && (
                                <p className="mt-1 text-[11px] text-slate-400">
                                  {item.result.notes}
                                </p>
                              )}

                              {item.result.performedAt && (
                                <p className="mt-2 text-[10px] text-slate-400">
                                  Performed{" "}
                                  {formatDate(item.result.performedAt)}
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {order.notes && (
                      <div className="mt-4">
                        <p className="text-[10px] font-medium text-slate-400">
                          Notes
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-xs font-medium text-slate-600">
                          {order.notes}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Pharmacy */}
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
            <div className="mb-5 flex items-start gap-3">
              <div
                className="
        flex
        size-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-teal-50
        text-teal-600
      "
              >
                <Store size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Pharmacy
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Prescribed medicines and dispensing history.
                </p>
              </div>
            </div>

            {pharmacyPrescriptions.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
                <Store size={20} className="mx-auto text-slate-300" />

                <p className="mt-3 text-xs font-medium text-slate-500">
                  No pharmacy records found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {pharmacyPrescriptions.map((prescription) => (
                  <div
                    key={prescription.id}
                    className="
            rounded-xl
            bg-slate-50/70
            p-4
            ring-1
            ring-slate-200/50
          "
                  >
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {prescription.medicationName}
                        </p>

                        <p className="mt-1 text-[11px] text-slate-400">
                          Prescription {prescription.prescriptionNumber}
                        </p>
                      </div>

                      <span
                        className="
                w-fit
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-slate-600
              "
                      >
                        {prescription.dispensing
                          ? formatLabel(prescription.dispensing.status)
                          : "Not Dispensed"}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                      <div>
                        <p className="text-[10px] text-slate-400">Dosage</p>

                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {prescription.dosage}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">Frequency</p>

                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {prescription.frequency}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">Duration</p>

                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {prescription.duration || "—"}
                        </p>
                      </div>

                      <div>
                        <p className="text-[10px] text-slate-400">Quantity</p>

                        <p className="mt-1 text-xs font-medium text-slate-600">
                          {prescription.quantity || "—"}
                        </p>
                      </div>
                    </div>

                    {prescription.instructions && (
                      <div className="mt-4">
                        <p className="text-[10px] font-medium text-slate-400">
                          Instructions
                        </p>

                        <p className="mt-1 whitespace-pre-wrap text-xs text-slate-600">
                          {prescription.instructions}
                        </p>
                      </div>
                    )}

                    {prescription.dispensing && (
                      <div className="mt-4 rounded-xl bg-white p-3 ring-1 ring-slate-200/50">
                        <p className="text-[10px] font-medium text-slate-400">
                          Dispensing
                        </p>

                        <p className="mt-1 text-xs font-semibold text-slate-600">
                          Dispensing record available
                        </p>

                        <p className="mt-1 text-[10px] text-slate-400">
                          Status: {formatLabel(prescription.dispensing.status)}
                        </p>
                      </div>
                    )}

                    <p className="mt-4 text-[10px] text-slate-400">
                      Prescribed {formatDate(prescription.createdAt)}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Billing */}
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
            <div className="mb-5 flex items-start gap-3">
              <div
                className="
        flex
        size-9
        shrink-0
        items-center
        justify-center
        rounded-xl
        bg-teal-50
        text-teal-600
      "
              >
                <ReceiptText size={18} />
              </div>

              <div>
                <h2 className="text-sm font-semibold text-slate-800">
                  Billing
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Invoices and payment status for this patient.
                </p>
              </div>
            </div>

            {invoices.length === 0 ? (
              <div className="rounded-xl bg-slate-50 px-4 py-10 text-center">
                <ReceiptText size={20} className="mx-auto text-slate-300" />

                <p className="mt-3 text-xs font-medium text-slate-500">
                  No invoices found
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {invoices.map((invoice) => (
                  <div
                    key={invoice.id}
                    className="
            rounded-xl
            bg-slate-50/70
            p-4
            ring-1
            ring-slate-200/50
          "
                  >
                    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                      <div>
                        <p className="text-sm font-semibold text-slate-700">
                          {invoice.invoiceNumber}
                        </p>

                        <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1">
                          <p className="text-xs text-slate-500">
                            {formatLabel(invoice.type)} invoice
                          </p>

                          <span className="text-slate-300">·</span>

                          <p className="text-[11px] text-slate-400">
                            {formatDate(invoice.createdAt)}
                          </p>
                        </div>

                        {invoice.appointment && (
                          <p className="mt-1 text-[10px] text-slate-400">
                            Appointment ·{" "}
                            {formatDate(invoice.appointment.appointmentDate)}
                          </p>
                        )}
                      </div>

                      <span
                        className="
                w-fit
                rounded-full
                bg-slate-100
                px-2.5
                py-1
                text-[10px]
                font-semibold
                text-slate-600
              "
                      >
                        {formatLabel(invoice.status)}
                      </span>
                    </div>

                    <div className="mt-4 grid gap-3 sm:grid-cols-3">
                      <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200/50">
                        <p className="text-[10px] text-slate-400">Total</p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          ₹{formatAmount(invoice.total)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200/50">
                        <p className="text-[10px] text-slate-400">Paid</p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          ₹{formatAmount(invoice.amountPaid)}
                        </p>
                      </div>

                      <div className="rounded-xl bg-white p-3 ring-1 ring-slate-200/50">
                        <p className="text-[10px] text-slate-400">Balance</p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          ₹{formatAmount(invoice.balanceDue)}
                        </p>
                      </div>
                    </div>

                    {invoice.items.length > 0 && (
                      <div className="mt-4">
                        <p className="text-[10px] font-medium text-slate-400">
                          Items
                        </p>

                        <div className="mt-2 space-y-1">
                          {invoice.items.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-center justify-between gap-3"
                            >
                              <p className="min-w-0 truncate text-xs text-slate-500">
                                {item.description}
                              </p>

                              <p className="shrink-0 text-xs font-medium text-slate-600">
                                ₹{formatAmount(item.amount)}
                              </p>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
