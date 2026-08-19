import {
  CheckCircle2,
  FileText,
  Loader2,
  Save,
  Stethoscope,
  X,
} from "lucide-react";

import { useEffect, useState } from "react";

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

import { DiagnosisSection } from "./diagnosis-section";

interface ConsultationModalProps {
  open: boolean;
  appointment: Appointment | null;
  medicalRecord: MedicalRecord | null;
  loading: boolean;
  saving: boolean;
  completing: boolean;

  readOnly?: boolean;

  canCreateMedicalRecord: boolean;
  canUpdateMedicalRecord: boolean;
  canCompleteAppointment: boolean;

  // Diagnosis
  diagnoses?: Diagnosis[];
  diagnosesLoading?: boolean;
  diagnosisSaving?: boolean;
  diagnosisDeleting?: string | null;

  canReadDiagnoses?: boolean;
  canCreateDiagnoses?: boolean;
  canUpdateDiagnoses?: boolean;
  canDeleteDiagnoses?: boolean;

  onCreateDiagnosis?: (data: CreateDiagnosisRequest) => Promise<void>;

  onUpdateDiagnosis?: (
    id: string,
    data: UpdateDiagnosisRequest,
  ) => Promise<void>;

  onDeleteDiagnosis?: (id: string) => Promise<void>;

  onClose: () => void;

  onSave: (data: UpdateMedicalRecordRequest) => Promise<void>;

  onComplete: () => Promise<void>;
}

export function ConsultationModal({
  open,
  appointment,
  medicalRecord,
  loading,
  saving,
  completing,

  readOnly = false,

  canCreateMedicalRecord,
  canUpdateMedicalRecord,
  canCompleteAppointment,

  diagnoses = [],
  diagnosesLoading = false,
  diagnosisSaving = false,
  diagnosisDeleting = null,

  canReadDiagnoses = false,
  canCreateDiagnoses = false,
  canUpdateDiagnoses = false,
  canDeleteDiagnoses = false,

  onCreateDiagnosis,
  onUpdateDiagnosis,
  onDeleteDiagnosis,

  onClose,
  onSave,
  onComplete,
}: ConsultationModalProps) {
  const [chiefComplaint, setChiefComplaint] = useState("");

  const [historyOfPresentIllness, setHistoryOfPresentIllness] = useState("");

  const [examinationNotes, setExaminationNotes] = useState("");

  const [assessment, setAssessment] = useState("");

  const [treatmentPlan, setTreatmentPlan] = useState("");

  const [followUpInstructions, setFollowUpInstructions] = useState("");

  useEffect(() => {
    if (!open) {
      return;
    }

    setChiefComplaint(medicalRecord?.chiefComplaint ?? "");

    setHistoryOfPresentIllness(medicalRecord?.historyOfPresentIllness ?? "");

    setExaminationNotes(medicalRecord?.examinationNotes ?? "");

    setAssessment(medicalRecord?.assessment ?? "");

    setTreatmentPlan(medicalRecord?.treatmentPlan ?? "");

    setFollowUpInstructions(medicalRecord?.followUpInstructions ?? "");
  }, [open, medicalRecord]);

  if (!open || !appointment) {
    return null;
  }

  const recordExists = Boolean(medicalRecord);

  const canSave =
    !readOnly &&
    (recordExists ? canUpdateMedicalRecord : canCreateMedicalRecord);

  const actionLoading = saving || completing;

  const handleSave = async () => {
    if (!canSave) {
      return;
    }

    if (recordExists && medicalRecord) {
      const data: UpdateMedicalRecordRequest = {
        chiefComplaint: chiefComplaint.trim() || undefined,

        historyOfPresentIllness: historyOfPresentIllness.trim() || undefined,

        examinationNotes: examinationNotes.trim() || undefined,

        assessment: assessment.trim() || undefined,

        treatmentPlan: treatmentPlan.trim() || undefined,

        followUpInstructions: followUpInstructions.trim() || undefined,
      };

      await onSave(data);

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

    await onSave(data);
  };

  return (
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
        if (event.target === event.currentTarget && !actionLoading) {
          onClose();
        }
      }}
    >
      <div
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-3xl
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
        <div className="relative shrink-0 px-6 py-5">
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
            <div className="flex items-start gap-3">
              <div
                className="
                  flex
                  size-10
                  items-center
                  justify-center
                  rounded-xl
                  bg-violet-50
                  text-violet-600
                "
              >
                <Stethoscope size={19} />
              </div>

              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Consultation
                </h2>

                <p className="mt-1 text-xs text-slate-400">
                  {appointment.appointmentNumber}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              disabled={actionLoading}
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
                disabled:cursor-not-allowed
                disabled:opacity-40
              "
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-6 py-5">
          {loading ? (
            <div className="flex min-h-[400px] items-center justify-center">
              <div className="flex items-center gap-2 text-sm text-slate-400">
                <Loader2 size={17} className="animate-spin" />
                Loading consultation...
              </div>
            </div>
          ) : (
            <div className="space-y-5">
              {/* Patient summary */}
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
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                      Patient
                    </p>

                    <p className="mt-1 text-sm font-semibold text-slate-700">
                      {[
                        appointment.patient?.firstName,
                        appointment.patient?.middleName,
                        appointment.patient?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") || "Unknown patient"}
                    </p>
                  </div>

                  <div className="text-right">
                    <p className="text-[11px] text-slate-400">Doctor</p>

                    <p className="mt-1 text-sm font-medium text-slate-600">
                      {[
                        appointment.doctor?.title,
                        appointment.doctor?.firstName,
                        appointment.doctor?.lastName,
                      ]
                        .filter(Boolean)
                        .join(" ") || "Unknown doctor"}
                    </p>
                  </div>
                </div>
              </div>

              {/* Chief complaint */}
              <Field
                label="Chief complaint"
                value={chiefComplaint}
                onChange={setChiefComplaint}
                placeholder="Primary reason for the consultation"
                disabled={!canSave || actionLoading}
              />

              {/* History */}
              <Field
                label="History of present illness"
                value={historyOfPresentIllness}
                onChange={setHistoryOfPresentIllness}
                placeholder="Describe the history of the current condition"
                disabled={!canSave || actionLoading}
                rows={4}
              />

              {/* Examination */}
              <Field
                label="Examination notes"
                value={examinationNotes}
                onChange={setExaminationNotes}
                placeholder="Clinical examination findings"
                disabled={!canSave || actionLoading}
                rows={4}
              />

              {/* Assessment */}
              <Field
                label="Assessment"
                value={assessment}
                onChange={setAssessment}
                placeholder="Clinical assessment"
                disabled={!canSave || actionLoading}
                rows={4}
              />

              {medicalRecord && canReadDiagnoses && (
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
                  onCreate={onCreateDiagnosis!}
                  onUpdate={onUpdateDiagnosis!}
                  onDelete={onDeleteDiagnosis!}
                />
              )}

              {/* Treatment */}
              <Field
                label="Treatment plan"
                value={treatmentPlan}
                onChange={setTreatmentPlan}
                placeholder="Treatment plan and recommendations"
                disabled={!canSave || actionLoading}
                rows={4}
              />

              {/* Follow-up */}
              <Field
                label="Follow-up instructions"
                value={followUpInstructions}
                onChange={setFollowUpInstructions}
                placeholder="Instructions for patient follow-up"
                disabled={!canSave || actionLoading}
                rows={4}
              />
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
            <p className="text-xs text-slate-400">
              {readOnly
                ? "Completed consultation"
                : recordExists
                  ? "Medical record saved."
                  : "Save the consultation before completing the appointment."}
            </p>

            <div className="flex flex-wrap justify-end gap-2">
              <button
                type="button"
                onClick={onClose}
                disabled={actionLoading}
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

              {canSave && !readOnly && (
                <button
                  type="button"
                  onClick={handleSave}
                  disabled={actionLoading}
                  className="
                    inline-flex
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    border
                    border-teal-600
                    bg-teal-600
                    px-4
                    py-2.5
                    text-sm
                    font-semibold
                    text-white
                    shadow-sm
                    transition
                    hover:border-teal-700
                    hover:bg-teal-700
                    hover:shadow-md
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                  "
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
                  onClick={onComplete}
                  disabled={actionLoading}
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
                    hover:shadow-md
                    disabled:cursor-not-allowed
                    disabled:opacity-60
                    "
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
    </div>
  );
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
        className="
          w-full
          resize-none
          rounded-xl
          border
          !border-slate-100
          bg-slate-50/30
          px-3.5
          py-3
          text-sm
          leading-6
          text-slate-700
          outline-none
          appearance-none
          transition
          placeholder:text-slate-300
          focus:!border-teal-200
          focus:bg-white
          focus:ring-2
          focus:ring-teal-50
          disabled:cursor-not-allowed
          disabled:bg-slate-50
          disabled:text-slate-400
        "
      />
    </div>
  );
}
