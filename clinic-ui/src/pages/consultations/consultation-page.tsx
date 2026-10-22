import {
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  FileText,
  Loader2,
  History,
  Printer,
  Save,
  Stethoscope,
} from "lucide-react";
import { useCallback, useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";

import { appointmentService } from "@/services/appointment-service";
import { diagnosisService } from "@/services/diagnosis-service";
import { medicalRecordService } from "@/services/medical-record-service";
import { prescriptionService } from "@/services/prescription-service";
import {
  clinicSettingsService,
  type ClinicBranding,
} from "@/services/clinic-settings-service";
import { ClinicLogo } from "@/components/clinic-logo";
import { useAuth } from "@/auth/auth-context";

import type { Appointment } from "@/types/appointment";
import type {
  CreateMedicalRecordRequest,
  MedicalRecord,
  UpdateMedicalRecordRequest,
} from "@/types/medical-record";
import type {
  CreateDiagnosisRequest,
  Diagnosis,
  UpdateDiagnosisRequest,
} from "@/types/diagnosis";
import type {
  CreatePrescriptionRequest,
  Prescription,
  UpdatePrescriptionRequest,
} from "@/types/prescription";

import { DiagnosisSection } from "@/pages/appointments/diagnosis-section";
import { PrescriptionSection } from "./prescription-section";
import "./consultation-print.css";

type ConsultationTab =
  | "consultation"
  | "diagnosis"
  | "prescription"
  | "history";

export function ConsultationPage() {
  const navigate = useNavigate();
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const { hasPermission } = useAuth();

  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [clinicBranding, setClinicBranding] = useState<ClinicBranding | null>(
    null,
  );
  const [medicalRecord, setMedicalRecord] = useState<MedicalRecord | null>(
    null,
  );
  const [diagnoses, setDiagnoses] = useState<Diagnosis[]>([]);
  const [historyRecords, setHistoryRecords] = useState<MedicalRecord[]>([]);
  const [historyLoading, setHistoryLoading] = useState(false);
  const [historyError, setHistoryError] = useState(false);
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [prescriptionsLoading, setPrescriptionsLoading] = useState(false);
  const [prescriptionSaving, setPrescriptionSaving] = useState(false);
  const [prescriptionDeleting, setPrescriptionDeleting] = useState<
    string | null
  >(null);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [completing, setCompleting] = useState(false);
  const [diagnosesLoading, setDiagnosesLoading] = useState(false);
  const [diagnosisSaving, setDiagnosisSaving] = useState(false);
  const [diagnosisDeleting, setDiagnosisDeleting] = useState<string | null>(
    null,
  );

  const [activeTab, setActiveTab] = useState<ConsultationTab>("consultation");
  const [sectionMenuOpen, setSectionMenuOpen] = useState(false);
  const sectionMenuRef = useRef<HTMLDivElement | null>(null);

  const [chiefComplaint, setChiefComplaint] = useState("");
  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState("");
  const [examinationNotes, setExaminationNotes] = useState("");
  const [assessment, setAssessment] = useState("");
  const [treatmentPlan, setTreatmentPlan] = useState("");
  const [followUpInstructions, setFollowUpInstructions] = useState("");

  useEffect(() => {
    let cancelled = false;
    clinicSettingsService
      .getBranding()
      .then((response) => {
        if (!cancelled) setClinicBranding(response.data);
      })
      .catch((error) =>
        console.error("Unable to load clinic branding for print view.", error),
      );
    return () => {
      cancelled = true;
    };
  }, []);

  const canReadPrescriptions = hasPermission("PRESCRIPTION_READ");
  const canCreatePrescriptions = hasPermission("PRESCRIPTION_CREATE");
  const canUpdatePrescriptions = hasPermission("PRESCRIPTION_UPDATE");
  const canDeletePrescriptions = hasPermission("PRESCRIPTION_DELETE");

  const loadPrescriptions = useCallback(
    async (medicalRecordId: string) => {
      if (!canReadPrescriptions) {
        setPrescriptions([]);
        return;
      }

      try {
        setPrescriptionsLoading(true);
        const response = await prescriptionService.getPrescriptions({
          medicalRecordId,
        });
        setPrescriptions(response.data ?? []);
      } catch (error) {
        console.error("Unable to load prescriptions.", error);
        setPrescriptions([]);
      } finally {
        setPrescriptionsLoading(false);
      }
    },
    [canReadPrescriptions],
  );

  const canReadMedicalRecords = hasPermission("MEDICAL_RECORD_READ");
  const canCreateMedicalRecords = hasPermission("MEDICAL_RECORD_CREATE");
  const canUpdateMedicalRecords = hasPermission("MEDICAL_RECORD_UPDATE");
  const canUpdateAppointments = hasPermission("APPOINTMENT_UPDATE");

  const canReadDiagnoses = hasPermission("DIAGNOSIS_READ");
  const canCreateDiagnoses = hasPermission("DIAGNOSIS_CREATE");
  const canUpdateDiagnoses = hasPermission("DIAGNOSIS_UPDATE");
  const canDeleteDiagnoses = hasPermission("DIAGNOSIS_DELETE");

  const canCompleteAppointment =
    appointment?.status === "IN_CONSULTATION" &&
    canUpdateAppointments &&
    (canCreateMedicalRecords || canUpdateMedicalRecords);

  const readOnly = appointment?.status === "COMPLETED";
  const recordExists = Boolean(medicalRecord);
  const canSave =
    !readOnly &&
    (recordExists ? canUpdateMedicalRecords : canCreateMedicalRecords);
  const actionLoading = saving || completing;

  const loadDiagnoses = useCallback(
    async (medicalRecordId: string) => {
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
    },
    [canReadDiagnoses],
  );

  const loadConsultation = useCallback(async () => {
    if (!appointmentId) {
      setAppointment(null);
      setMedicalRecord(null);
      setLoading(false);
      return;
    }

    try {
      setLoading(true);

      const currentAppointment =
        await appointmentService.getAppointment(appointmentId);
      setAppointment(currentAppointment);

      if (!canReadMedicalRecords) {
        setMedicalRecord(null);
        setDiagnoses([]);
        return;
      }

      const response =
        await medicalRecordService.getMedicalRecords(appointmentId);
      const record = response.data?.[0] ?? null;

      setMedicalRecord(record);

      if (record) {
        await loadDiagnoses(record.id);
        await loadPrescriptions(record.id);
      } else {
        setDiagnoses([]);
        setPrescriptions([]);
      }
    } catch (error) {
      console.error("Unable to load consultation.", error);
      setAppointment(null);
      setMedicalRecord(null);
      setDiagnoses([]);
    } finally {
      setLoading(false);
    }
  }, [appointmentId, canReadMedicalRecords, loadDiagnoses, loadPrescriptions]);

  useEffect(() => {
    void loadConsultation();
  }, [loadConsultation]);

  useEffect(() => {
    if (!sectionMenuOpen) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      if (
        sectionMenuRef.current &&
        !sectionMenuRef.current.contains(event.target as Node)
      ) {
        setSectionMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [sectionMenuOpen]);

  useEffect(() => {
    if (
      activeTab !== "history" ||
      !appointment?.patientId ||
      !canReadMedicalRecords
    ) {
      return;
    }

    let cancelled = false;
    const loadPatientHistory = async () => {
      setHistoryLoading(true);
      setHistoryError(false);
      try {
        const response = await medicalRecordService.getMedicalRecords(
          undefined,
          appointment.patientId,
          1,
          100,
        );
        if (!cancelled) {
          // Keep this visit out of the previous-history list.
          setHistoryRecords(
            response.data.filter((record) => record.id !== medicalRecord?.id),
          );
        }
      } catch (error) {
        console.error("Unable to load patient consultation history.", error);
        if (!cancelled) {
          setHistoryError(true);
          setHistoryRecords([]);
        }
      } finally {
        if (!cancelled) setHistoryLoading(false);
      }
    };

    void loadPatientHistory();
    return () => {
      cancelled = true;
    };
  }, [
    activeTab,
    appointment?.patientId,
    canReadMedicalRecords,
    medicalRecord?.id,
  ]);

  useEffect(() => {
    setChiefComplaint(medicalRecord?.chiefComplaint ?? "");
    setHistoryOfPresentIllness(medicalRecord?.historyOfPresentIllness ?? "");
    setExaminationNotes(medicalRecord?.examinationNotes ?? "");
    setAssessment(medicalRecord?.assessment ?? "");
    setTreatmentPlan(medicalRecord?.treatmentPlan ?? "");
    setFollowUpInstructions(medicalRecord?.followUpInstructions ?? "");
  }, [medicalRecord]);

  const handleSave = async () => {
    if (!appointment || !canSave) {
      return;
    }

    try {
      setSaving(true);

      if (medicalRecord) {
        const data: UpdateMedicalRecordRequest = {
          chiefComplaint: chiefComplaint.trim() || undefined,
          historyOfPresentIllness: historyOfPresentIllness.trim() || undefined,
          examinationNotes: examinationNotes.trim() || undefined,
          assessment: assessment.trim() || undefined,
          treatmentPlan: treatmentPlan.trim() || undefined,
          followUpInstructions: followUpInstructions.trim() || undefined,
        };

        const updated = await medicalRecordService.updateMedicalRecord(
          medicalRecord.id,
          data,
        );
        setMedicalRecord(updated);
        return;
      }

      const data: CreateMedicalRecordRequest = {
        patientId: appointment.patientId,
        doctorId: appointment.doctorId,
        appointmentId: appointment.id,
        chiefComplaint: chiefComplaint.trim() || undefined,
        historyOfPresentIllness: historyOfPresentIllness.trim() || undefined,
        examinationNotes: examinationNotes.trim() || undefined,
        assessment: assessment.trim() || undefined,
        treatmentPlan: treatmentPlan.trim() || undefined,
        followUpInstructions: followUpInstructions.trim() || undefined,
      };

      const created = await medicalRecordService.createMedicalRecord(data);
      setMedicalRecord(created);

      await loadDiagnoses(created.id);
      await loadPrescriptions(created.id);
    } catch (error) {
      console.error("Unable to save medical record.", error);
    } finally {
      setSaving(false);
    }
  };

  const handleComplete = async () => {
    if (!appointment || !medicalRecord || !canCompleteAppointment) {
      return;
    }

    try {
      setCompleting(true);
      const updated = await appointmentService.completeAppointment(
        appointment.id,
      );
      setAppointment(updated);
    } catch (error) {
      console.error("Unable to complete consultation.", error);
    } finally {
      setCompleting(false);
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
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (error) {
      console.error("Unable to update diagnosis.", error);
    } finally {
      setDiagnosisSaving(false);
    }
  };

  const handleCreatePrescription = async (data: CreatePrescriptionRequest) => {
    if (!canCreatePrescriptions) return;

    try {
      setPrescriptionSaving(true);
      const created = await prescriptionService.createPrescription(data);
      setPrescriptions((current) => [created, ...current]);
    } catch (error) {
      console.error("Unable to create prescription.", error);
      throw error;
    } finally {
      setPrescriptionSaving(false);
    }
  };

  const handleUpdatePrescription = async (
    id: string,
    data: UpdatePrescriptionRequest,
  ) => {
    if (!canUpdatePrescriptions) return;

    try {
      setPrescriptionSaving(true);
      const updated = await prescriptionService.updatePrescription(id, data);
      setPrescriptions((current) =>
        current.map((item) => (item.id === id ? updated : item)),
      );
    } catch (error) {
      console.error("Unable to update prescription.", error);
      throw error;
    } finally {
      setPrescriptionSaving(false);
    }
  };

  const handleDeletePrescription = async (id: string) => {
    if (!canDeletePrescriptions) return;

    try {
      setPrescriptionDeleting(id);
      await prescriptionService.deletePrescription(id);
      setPrescriptions((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Unable to delete prescription.", error);
      throw error;
    } finally {
      setPrescriptionDeleting(null);
    }
  };

  const handleDeleteDiagnosis = async (id: string) => {
    if (!canDeleteDiagnoses) {
      return;
    }

    try {
      setDiagnosisDeleting(id);
      await diagnosisService.remove(id);
      setDiagnoses((current) => current.filter((item) => item.id !== id));
    } catch (error) {
      console.error("Unable to delete diagnosis.", error);
    } finally {
      setDiagnosisDeleting(null);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-400">
          <Loader2 size={17} className="animate-spin" />
          Loading consultation...
        </div>
      </div>
    );
  }

  if (!appointment) {
    return (
      <div className="p-4 sm:p-6">
        <button
          type="button"
          onClick={() => navigate("/appointments")}
          className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-medium text-slate-500 transition hover:bg-slate-50 hover:text-slate-700"
        >
          <ArrowLeft size={16} />
          Back to appointments
        </button>

        <div className="mt-5 rounded-2xl bg-white p-8 text-center ring-1 ring-slate-200/70">
          <p className="text-sm text-slate-500">Appointment not found.</p>
        </div>
      </div>
    );
  }

  const patientName =
    [
      appointment.patient?.firstName,
      appointment.patient?.middleName,
      appointment.patient?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Unknown patient";

  const doctorName =
    [
      appointment.doctor?.title,
      appointment.doctor?.firstName,
      appointment.doctor?.middleName,
      appointment.doctor?.lastName,
    ]
      .filter(Boolean)
      .join(" ") || "Unknown doctor";

  const tabs: { key: ConsultationTab; label: string }[] = [
    { key: "consultation", label: "Consultation" },
    { key: "diagnosis", label: "Diagnosis" },
    { key: "prescription", label: "Prescription" },
    { key: "history", label: "History" },
  ];

  return (
    <div className="consultation-page-root min-h-full bg-slate-50/60 p-4 pb-32 sm:p-6 sm:pb-6">
      <div className="consultation-screen-content mx-auto max-w-6xl">
        <button
          type="button"
          onClick={() => navigate("/appointments")}
          disabled={actionLoading}
          className="mb-4 inline-flex items-center gap-2 rounded-xl px-2 py-2 text-sm font-medium text-slate-500 transition hover:bg-white hover:text-slate-700 disabled:opacity-50"
        >
          <ArrowLeft size={16} />
          Back to appointments
        </button>

        <section className="rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          <div className="flex flex-col gap-4 p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex min-w-0 items-center gap-3">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-violet-50 text-violet-600">
                <Stethoscope size={19} />
              </div>

              <div className="min-w-0">
                <h1 className="truncate text-lg font-semibold text-slate-800">
                  Consultation
                </h1>
                <p className="mt-1 truncate text-sm font-medium text-slate-600">
                  {patientName}
                </p>
                <p className="mt-0.5 text-xs text-slate-400">
                  {appointment.appointmentNumber} · {doctorName}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <span className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-[10px] font-semibold text-slate-600 ring-1 ring-inset ring-slate-200">
                {appointment.status.replaceAll("_", " ")}
              </span>
              <button
                type="button"
                onClick={() => window.print()}
                disabled={!recordExists}
                title={
                  !recordExists
                    ? "Save the consultation before printing"
                    : "Print consultation and prescription"
                }
                className="print-hidden inline-flex min-h-10 items-center justify-center gap-2 rounded-xl !border !border-teal-600 !bg-teal-600 px-4 py-2 text-sm font-semibold !text-white shadow-sm transition-colors hover:!border-teal-700 hover:!bg-teal-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-teal-300 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Printer size={15} />
                Print consultation
              </button>
              {readOnly && (
                <span className="rounded-lg bg-teal-50 px-2.5 py-1.5 text-[10px] font-semibold text-teal-700 ring-1 ring-inset ring-teal-100">
                  Read only
                </span>
              )}
            </div>
          </div>
        </section>

        <div className="mt-5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-200/70 sm:p-1.5">
          {/* Desktop / tablet */}
          <div className="hidden sm:grid sm:grid-cols-4 sm:gap-1">
            {tabs.map((tab) => {
              const active = activeTab === tab.key;

              return (
                <button
                  key={tab.key}
                  type="button"
                  onClick={() => setActiveTab(tab.key)}
                  className={`min-h-10 rounded-xl px-3 py-2 text-xs font-semibold transition ${
                    active
                      ? "bg-teal-50 text-teal-700"
                      : "text-slate-500 hover:bg-slate-50 hover:text-slate-700"
                  }`}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          {/* Mobile */}
          <div className="sm:hidden" ref={sectionMenuRef}>
            <span className="mb-1.5 block text-xs font-medium text-slate-500">
              Section
            </span>

            <div className="relative">
              <button
                type="button"
                aria-haspopup="listbox"
                aria-expanded={sectionMenuOpen}
                onClick={() => setSectionMenuOpen((open) => !open)}
                className={`flex w-full appearance-none items-center justify-between rounded-xl !border !border-slate-100 bg-white px-3.5 py-3 text-left text-sm font-medium text-slate-700 shadow-sm !outline-none !ring-0 transition focus:!outline-none focus-visible:!outline-none ${
                  sectionMenuOpen
                    ? "!border-teal-200 !ring-2 !ring-teal-50"
                    : "hover:!border-slate-200"
                }`}
              >
                <span>{tabs.find((tab) => tab.key === activeTab)?.label}</span>

                <ChevronDown
                  size={16}
                  className={`shrink-0 text-slate-400 transition-transform ${
                    sectionMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {sectionMenuOpen && (
                <div
                  role="listbox"
                  aria-label="Consultation section"
                  className="absolute left-0 top-full z-50 mt-2 right-0 w-full overflow-hidden rounded-xl !border !border-slate-100 bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.10)]"
                >
                  {tabs.map((tab) => {
                    const active = activeTab === tab.key;

                    return (
                      <button
                        key={tab.key}
                        type="button"
                        role="option"
                        aria-selected={active}
                        onClick={() => {
                          setActiveTab(tab.key);
                          setSectionMenuOpen(false);
                        }}
                        className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                          active
                            ? "bg-teal-50 font-semibold text-teal-700"
                            : "font-medium text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                        }`}
                      >
                        <span>{tab.label}</span>

                        {active && (
                          <span className="size-1.5 rounded-full bg-teal-500" />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="mt-5 rounded-2xl bg-white shadow-sm ring-1 ring-slate-200/70">
          {activeTab === "consultation" && (
            <div className="p-5 sm:p-6">
              <div className="mb-6 rounded-xl bg-slate-50/70 px-4 py-3 ring-1 ring-slate-100">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Patient
                    </p>
                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {patientName}
                    </p>
                  </div>
                  <div className="sm:text-right">
                    <p className="text-[11px] text-slate-400">Doctor</p>
                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {doctorName}
                    </p>
                  </div>
                </div>
              </div>

              <div className="space-y-5">
                <Field
                  label="Chief complaint"
                  value={chiefComplaint}
                  onChange={setChiefComplaint}
                  placeholder="Primary reason for the consultation"
                  disabled={!canSave || actionLoading}
                />
                <Field
                  label="History of present illness"
                  value={historyOfPresentIllness}
                  onChange={setHistoryOfPresentIllness}
                  placeholder="Describe the history of the current condition"
                  disabled={!canSave || actionLoading}
                  rows={4}
                />
                <Field
                  label="Examination notes"
                  value={examinationNotes}
                  onChange={setExaminationNotes}
                  placeholder="Clinical examination findings"
                  disabled={!canSave || actionLoading}
                  rows={4}
                />
                <Field
                  label="Assessment"
                  value={assessment}
                  onChange={setAssessment}
                  placeholder="Clinical assessment"
                  disabled={!canSave || actionLoading}
                  rows={4}
                />
                <Field
                  label="Treatment plan"
                  value={treatmentPlan}
                  onChange={setTreatmentPlan}
                  placeholder="Treatment plan and recommendations"
                  disabled={!canSave || actionLoading}
                  rows={4}
                />
                <Field
                  label="Follow-up instructions"
                  value={followUpInstructions}
                  onChange={setFollowUpInstructions}
                  placeholder="Instructions for patient follow-up"
                  disabled={!canSave || actionLoading}
                  rows={4}
                />
              </div>
            </div>
          )}

          {activeTab === "diagnosis" && (
            <div className="p-5 sm:p-6">
              {medicalRecord && canReadDiagnoses ? (
                <DiagnosisSection
                  medicalRecordId={medicalRecord.id}
                  diagnoses={diagnoses}
                  loading={diagnosesLoading}
                  saving={diagnosisSaving}
                  deletingId={diagnosisDeleting}
                  readOnly={readOnly}
                  canCreate={canCreateDiagnoses}
                  canUpdate={canUpdateDiagnoses}
                  canDelete={canDeleteDiagnoses}
                  onCreate={handleCreateDiagnosis}
                  onUpdate={handleUpdateDiagnosis}
                  onDelete={handleDeleteDiagnosis}
                />
              ) : (
                <EmptySection
                  title="Diagnosis"
                  message={
                    medicalRecord
                      ? "You do not have permission to view diagnoses."
                      : "Save the medical record before adding a diagnosis."
                  }
                />
              )}
            </div>
          )}

          {activeTab === "prescription" && (
            <div className="p-5 sm:p-6">
              {medicalRecord && canReadPrescriptions ? (
                <PrescriptionSection
                  medicalRecordId={medicalRecord.id}
                  prescriptions={prescriptions}
                  loading={prescriptionsLoading}
                  saving={prescriptionSaving}
                  deletingId={prescriptionDeleting}
                  readOnly={readOnly}
                  canCreate={canCreatePrescriptions}
                  canUpdate={canUpdatePrescriptions}
                  canDelete={canDeletePrescriptions}
                  onCreate={handleCreatePrescription}
                  onUpdate={handleUpdatePrescription}
                  onDelete={handleDeletePrescription}
                />
              ) : (
                <EmptySection
                  title="Prescriptions"
                  message={
                    medicalRecord
                      ? "You do not have permission to view prescriptions."
                      : "Save the medical record before adding a prescription."
                  }
                />
              )}
            </div>
          )}

          {activeTab === "history" && (
            <div className="p-5 sm:p-6">
              <div className="mb-5 flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                  <History size={18} />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-slate-800">
                    Previous consultations
                  </h2>
                  <p className="mt-1 text-xs leading-5 text-slate-500">
                    Clinical records for {patientName}, newest first. The
                    current visit is excluded.
                  </p>
                </div>
              </div>

              {!canReadMedicalRecords ? (
                <EmptySection
                  title="History unavailable"
                  message="You do not have permission to view medical records."
                />
              ) : historyLoading ? (
                <div className="flex min-h-40 items-center justify-center gap-2 text-sm text-slate-400">
                  <Loader2 size={17} className="animate-spin" /> Loading patient
                  history...
                </div>
              ) : historyError ? (
                <div className="rounded-xl border border-rose-100 bg-rose-50/60 p-4 text-sm text-rose-700">
                  Could not load consultation history. Please try opening the
                  History tab again.
                  <button
                    type="button"
                    onClick={() => setActiveTab("consultation")}
                    className="ml-2 font-semibold underline"
                  >
                    Return to consultation
                  </button>
                </div>
              ) : historyRecords.length === 0 ? (
                <div className="rounded-xl border border-dashed border-slate-200 px-4 py-10 text-center">
                  <FileText size={22} className="mx-auto text-slate-300" />
                  <p className="mt-3 text-sm font-medium text-slate-600">
                    No previous consultations
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    Earlier medical records for this patient will appear here.
                  </p>
                </div>
              ) : (
                <div className="space-y-3">
                  {historyRecords.map((record) => {
                    const recordDate = new Date(record.createdAt);
                    const dateLabel = Number.isNaN(recordDate.getTime())
                      ? "Date unavailable"
                      : recordDate.toLocaleString(undefined, {
                          dateStyle: "medium",
                          timeStyle: "short",
                        });
                    const summary =
                      record.chiefComplaint ||
                      record.historyOfPresentIllness ||
                      record.assessment;
                    return (
                      <article
                        key={record.id}
                        className="consultation-history-card rounded-xl border bg-white p-4 transition"
                      >
                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <p className="text-xs font-medium text-teal-700">
                              {dateLabel}
                            </p>
                            <h3 className="mt-1 text-sm font-semibold text-slate-800">
                              {record.chiefComplaint || "Consultation"}
                            </h3>
                          </div>
                          <span className="w-fit rounded-lg bg-slate-50 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-wide text-slate-500">
                            Previous visit
                          </span>
                        </div>
                        {summary && (
                          <p className="mt-3 text-sm leading-6 text-slate-600">
                            {summary}
                          </p>
                        )}
                        <div className="mt-3 grid gap-3 sm:grid-cols-2">
                          {record.historyOfPresentIllness && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                History
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                                {record.historyOfPresentIllness}
                              </p>
                            </div>
                          )}
                          {record.examinationNotes && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Examination
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                                {record.examinationNotes}
                              </p>
                            </div>
                          )}
                          {record.assessment && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Assessment
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                                {record.assessment}
                              </p>
                            </div>
                          )}
                          {record.treatmentPlan && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Treatment plan
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                                {record.treatmentPlan}
                              </p>
                            </div>
                          )}
                          {record.followUpInstructions && (
                            <div>
                              <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">
                                Follow-up
                              </p>
                              <p className="mt-1 whitespace-pre-wrap text-xs leading-5 text-slate-600">
                                {record.followUpInstructions}
                              </p>
                            </div>
                          )}
                        </div>
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        <div className="sticky bottom-[68px] z-30 mt-4 rounded-2xl !border !border-slate-100 !ring-0 bg-white/95 p-3 shadow-sm backdrop-blur sm:static sm:mt-4 sm:p-4">
          <div className="mx-auto flex max-w-6xl flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-xs text-slate-400">
              {readOnly
                ? "Completed consultation"
                : recordExists
                  ? "Medical record saved."
                  : "Save the consultation before completing the appointment."}
            </p>

            <div className="flex w-full gap-2 sm:w-auto">
              {!readOnly && canSave && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl border border-teal-600 bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:border-teal-700 hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                >
                  {saving ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <Save size={15} />
                  )}
                  {saving
                    ? "Saving..."
                    : recordExists
                      ? "Update record"
                      : "Save medical record"}
                </button>
              )}

              {!readOnly && canCompleteAppointment && recordExists && (
                <button
                  type="button"
                  onClick={handleComplete}
                  disabled={actionLoading}
                  className="inline-flex flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60 sm:flex-none"
                >
                  {completing ? (
                    <Loader2 size={15} className="animate-spin" />
                  ) : (
                    <CheckCircle2 size={15} />
                  )}
                  {completing ? "Completing..." : "Complete consultation"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <article
        className="print-consultation-document"
        aria-label="Printable consultation"
      >
        <header
          className="print-clinic-header"
          style={{ borderColor: clinicBranding?.brandColor || "#0f766e" }}
        >
          <div className="print-clinic-identity">
            <ClinicLogo
              logoUrl={clinicBranding?.logoUrl}
              clinicName={clinicBranding?.name}
              className="print-clinic-logo"
              fallbackClassName="print-clinic-logo-fallback"
            />
            <div>
              <h1 style={{ color: clinicBranding?.brandColor || "#0f766e" }}>
                {clinicBranding?.name || "Clinic"}
              </h1>
              {clinicBranding?.tagline && <p>{clinicBranding.tagline}</p>}
            </div>
          </div>
          <div className="print-document-title">
            <h2>Consultation Summary</h2>
            <p>
              {new Date(appointment.appointmentDate).toLocaleDateString(
                undefined,
                { year: "numeric", month: "long", day: "numeric" },
              )}
            </p>
          </div>
        </header>

        <section className="print-patient-grid">
          <div>
            <span>Patient</span>
            <strong>{patientName}</strong>
          </div>
          <div>
            <span>Patient ID</span>
            <strong>{appointment.patient?.patientNumber || "—"}</strong>
          </div>
          <div>
            <span>Age / Gender</span>
            <strong>
              {formatPatientAge(appointment.patient?.dateOfBirth)}
              {appointment.patient?.gender
                ? ` / ${appointment.patient.gender}`
                : ""}
            </strong>
          </div>
          <div>
            <span>Visit date &amp; time</span>
            <strong>
              {formatVisitDateTime(
                appointment.appointmentDate,
                appointment.startTime,
              )}
            </strong>
          </div>
          <div>
            <span>Doctor</span>
            <strong>{doctorName}</strong>
          </div>
          <div>
            <span>Appointment</span>
            <strong>{appointment.appointmentNumber}</strong>
          </div>
        </section>

        <section className="print-clinical-section">
          <h3>Clinical Notes</h3>
          {[
            ["Chief complaint", chiefComplaint],
            ["History of present illness", historyOfPresentIllness],
            ["Examination", examinationNotes],
            ["Assessment", assessment],
            ["Treatment plan", treatmentPlan],
            ["Follow-up", followUpInstructions],
          ].map(([label, value]) =>
            value?.trim() ? (
              <div className="print-note-row" key={label as string}>
                <h4>{label}</h4>
                <p>{value}</p>
              </div>
            ) : null,
          )}
          {!chiefComplaint.trim() &&
            !historyOfPresentIllness.trim() &&
            !examinationNotes.trim() &&
            !assessment.trim() &&
            !treatmentPlan.trim() &&
            !followUpInstructions.trim() && (
              <p className="print-muted">No clinical notes recorded.</p>
            )}
        </section>

        <section className="print-clinical-section">
          <h3>Diagnosis</h3>
          {diagnoses.length ? (
            <ul className="print-diagnosis-list">
              {diagnoses.map((diagnosis) => (
                <li key={diagnosis.id}>
                  <strong>{diagnosis.name}</strong>
                  {diagnosis.code ? ` (${diagnosis.code})` : ""}
                  {diagnosis.isPrimary ? " — Primary" : ""}
                  {diagnosis.notes ? <p>{diagnosis.notes}</p> : null}
                </li>
              ))}
            </ul>
          ) : (
            <p className="print-muted">No diagnosis recorded.</p>
          )}
        </section>

        <section className="print-clinical-section">
          <h3>Prescription (Rx)</h3>
          {prescriptions.length ? (
            <table className="print-prescription-table">
              <thead>
                <tr>
                  <th>Medicine</th>
                  <th>Dosage</th>
                  <th>Regimen / frequency</th>
                  <th>Route</th>
                  <th>Duration</th>
                  <th>Qty</th>
                </tr>
              </thead>
              <tbody>
                {prescriptions.map((item) => (
                  <tr key={item.id}>
                    <td>
                      <strong>{item.medicationName}</strong>
                    </td>
                    <td>{item.dosage || "—"}</td>
                    <td>
                      <strong>{item.frequency || "—"}</strong>
                      {item.instructions ? (
                        <small>{item.instructions}</small>
                      ) : null}
                    </td>
                    <td>{item.route || "—"}</td>
                    <td>{item.duration || "—"}</td>
                    <td>{item.quantity || "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="print-muted">
              No prescription recorded for this consultation.
            </p>
          )}
        </section>

        <footer className="print-document-footer">
          <div>
            <span>Doctor's signature</span>
            <div className="print-signature-line" />
            <strong>{doctorName}</strong>
          </div>
          <p>
            Generated from the clinic record. Please contact the clinic if you
            have questions about this consultation.
          </p>
        </footer>
      </article>
    </div>
  );
}

function formatPatientAge(dateOfBirth?: string | null): string {
  if (!dateOfBirth) return "Age not recorded";
  const dob = new Date(dateOfBirth);
  if (Number.isNaN(dob.getTime())) return "Age not recorded";
  const today = new Date();
  let years = today.getFullYear() - dob.getFullYear();
  let months = today.getMonth() - dob.getMonth();
  if (today.getDate() < dob.getDate()) months -= 1;
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  if (years < 0) return "Age not recorded";
  if (years < 2) return `${years * 12 + months} months`;
  return `${years} years`;
}

function formatVisitDateTime(date: string, time?: string): string {
  const datePart = new Date(date);
  if (Number.isNaN(datePart.getTime())) return "—";
  const dateLabel = datePart.toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  if (!time) return dateLabel;
  const [hours, minutes] = time.split(":");
  const timePart = new Date(datePart);
  if (hours && minutes) timePart.setHours(Number(hours), Number(minutes), 0, 0);
  return `${dateLabel}, ${timePart.toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" })}`;
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
  rows?: number;
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  disabled,
  rows = 3,
}: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        rows={rows}
        disabled={disabled}
        className="w-full resize-none rounded-xl border !border-slate-100 bg-slate-50/30 px-3.5 py-3 text-sm leading-6 text-slate-700 outline-none appearance-none transition placeholder:text-slate-300 focus:!border-teal-200 focus:bg-white focus:ring-2 focus:ring-teal-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      />
    </div>
  );
}

function EmptySection({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center p-6 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
        <FileText size={19} />
      </div>
      <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
      <p className="mt-1 max-w-sm text-xs text-slate-400">{message}</p>
    </div>
  );
}
