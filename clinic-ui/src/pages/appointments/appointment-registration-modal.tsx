import {
  CalendarDays,
  Check,
  Clock3,
  Loader2,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { useEffect, useMemo, useRef, useState } from "react";

import { appointmentService } from "@/services/appointment-service";

import type {
  AppointmentAvailabilitySlot,
  AppointmentPriority,
  AppointmentType,
  CreateAppointmentRequest,
} from "@/types/appointment";

import type { Patient } from "@/types/patient";
import type { Doctor } from "@/types/doctor";

interface AppointmentRegistrationModalProps {
  open: boolean;

  patients: Patient[];
  doctors: Doctor[];

  onClose: () => void;

  onCreated: () => Promise<void> | void;
}

interface FormState {
  patientId: string;
  doctorId: string;
  appointmentDate: string;
  startTime: string;
  endTime: string;
  type: AppointmentType;
  priority: AppointmentPriority;
  reason: string;
  notes: string;
}

const APPOINTMENT_TYPES: {
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

const PRIORITIES: {
  value: AppointmentPriority;
  label: string;
}[] = [
  {
    value: "ROUTINE",
    label: "Routine",
  },
  {
    value: "URGENT",
    label: "Urgent",
  },
  {
    value: "EMERGENCY",
    label: "Emergency",
  },
];

function getInitialDate(): string {
  const date = new Date();

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

const initialForm: FormState = {
  patientId: "",
  doctorId: "",
  appointmentDate: getInitialDate(),
  startTime: "",
  endTime: "",
  type: "NEW_CONSULTATION",
  priority: "ROUTINE",
  reason: "",
  notes: "",
};

function patientName(patient: Patient): string {
  return [patient.firstName, patient.middleName, patient.lastName]
    .filter(Boolean)
    .join(" ");
}

function doctorName(doctor: Doctor): string {
  return [doctor.title, doctor.firstName, doctor.middleName, doctor.lastName]
    .filter(Boolean)
    .join(" ");
}

export function AppointmentRegistrationModal({
  open,
  patients,
  doctors,
  onClose,
  onCreated,
}: AppointmentRegistrationModalProps) {
  const [form, setForm] = useState<FormState>(initialForm);

  const [patientSearch, setPatientSearch] = useState("");

  const [doctorSearch, setDoctorSearch] = useState("");

  const [showPatients, setShowPatients] = useState(false);

  const [showDoctors, setShowDoctors] = useState(false);

  const [slots, setSlots] = useState<AppointmentAvailabilitySlot[]>([]);

  const [loadingSlots, setLoadingSlots] = useState(false);

  const [slotError, setSlotError] = useState<string | null>(null);

  const [saving, setSaving] = useState(false);

  const [error, setError] = useState<string | null>(null);

  /*
   * Refs used to detect clicks outside
   * the patient / doctor search areas.
   */
  const patientContainerRef = useRef<HTMLDivElement | null>(null);

  const doctorContainerRef = useRef<HTMLDivElement | null>(null);

  const selectedPatient = useMemo(
    () => patients.find((patient) => patient.id === form.patientId),
    [patients, form.patientId],
  );

  const selectedDoctor = useMemo(
    () => doctors.find((doctor) => doctor.id === form.doctorId),
    [doctors, form.doctorId],
  );

  const filteredPatients = useMemo(() => {
    const value = patientSearch.trim().toLowerCase();

    if (!value) {
      return patients.slice(0, 8);
    }

    return patients
      .filter((patient) => {
        const name = patientName(patient).toLowerCase();

        const number = patient.patientNumber.toLowerCase();

        const phone = patient.phone?.toLowerCase() ?? "";

        return (
          name.includes(value) ||
          number.includes(value) ||
          phone.includes(value)
        );
      })
      .slice(0, 8);
  }, [patients, patientSearch]);

  const filteredDoctors = useMemo(() => {
    const value = doctorSearch.trim().toLowerCase();

    if (!value) {
      return doctors.slice(0, 8);
    }

    return doctors
      .filter((doctor) => {
        const name = doctorName(doctor).toLowerCase();

        const number = doctor.doctorNumber.toLowerCase();

        return name.includes(value) || number.includes(value);
      })
      .slice(0, 8);
  }, [doctors, doctorSearch]);

  /*
   * Reset the form whenever the modal opens.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    setForm({
      ...initialForm,
      appointmentDate: getInitialDate(),
    });

    setPatientSearch("");
    setDoctorSearch("");

    setShowPatients(false);
    setShowDoctors(false);

    setSlots([]);
    setSlotError(null);
    setError(null);
    setSaving(false);
  }, [open]);

  /*
   * Close patient / doctor dropdowns when clicking
   * outside their respective containers.
   */
  useEffect(() => {
    if (!open) {
      return;
    }

    const handlePointerDown = (event: PointerEvent) => {
      const target = event.target as Node;

      if (
        showPatients &&
        patientContainerRef.current &&
        !patientContainerRef.current.contains(target)
      ) {
        setShowPatients(false);
      }

      if (
        showDoctors &&
        doctorContainerRef.current &&
        !doctorContainerRef.current.contains(target)
      ) {
        setShowDoctors(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open, showPatients, showDoctors]);

  /*
   * Load availability whenever
   * doctor or appointment date changes.
   */
  useEffect(() => {
    if (!form.doctorId || !form.appointmentDate) {
      setSlots([]);
      setSlotError(null);
      return;
    }

    let cancelled = false;

    const loadAvailability = async () => {
      try {
        setLoadingSlots(true);
        setSlotError(null);

        setForm((current) => ({
          ...current,
          startTime: "",
          endTime: "",
        }));

        const response = await appointmentService.getAvailability(
          form.doctorId,
          form.appointmentDate,
        );

        if (!cancelled) {
          setSlots(Array.isArray(response.slots) ? response.slots : []);
        }
      } catch (err) {
        console.error("Unable to load appointment availability.", err);

        if (!cancelled) {
          setSlots([]);
          setSlotError("Unable to load available time slots.");
        }
      } finally {
        if (!cancelled) {
          setLoadingSlots(false);
        }
      }
    };

    loadAvailability();

    return () => {
      cancelled = true;
    };
  }, [form.doctorId, form.appointmentDate]);

  if (!open) {
    return null;
  }

  const selectSlot = (slot: AppointmentAvailabilitySlot) => {
    if (!slot.available) {
      return;
    }

    setForm((current) => ({
      ...current,
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));
  };

  const handleCreate = async () => {
    setError(null);

    if (!form.patientId) {
      setError("Please select a patient.");
      return;
    }

    if (!form.doctorId) {
      setError("Please select a doctor.");
      return;
    }

    if (!form.appointmentDate) {
      setError("Please select an appointment date.");
      return;
    }

    if (!form.startTime || !form.endTime) {
      setError("Please select an available time slot.");
      return;
    }

    const payload: CreateAppointmentRequest = {
      patientId: form.patientId,
      doctorId: form.doctorId,
      appointmentDate: form.appointmentDate,
      startTime: form.startTime,
      endTime: form.endTime,
      type: form.type,
      priority: form.priority,
      reason: form.reason.trim() || undefined,
      notes: form.notes.trim() || undefined,
    };

    try {
      setSaving(true);

      await appointmentService.createAppointment(payload);

      await onCreated();

      onClose();
    } catch (err) {
      console.error("Unable to create appointment.", err);

      setError(
        "Unable to create appointment. Please check the details and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/20 p-4 backdrop-blur-[2px]">
      <div
        className="
          flex
          max-h-[92vh]
          w-full
          max-w-3xl
          flex-col
          overflow-hidden
          rounded-3xl
          bg-white
          shadow-[0_25px_70px_rgba(15,23,42,0.18)]
          ring-1
          ring-slate-200/70
        "
      >
        {/* Header */}
        <div className="shrink-0 bg-white px-5 py-4 sm:px-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-semibold text-slate-800">
                New appointment
              </h2>

              <p className="mt-0.5 text-xs text-slate-400">
                Schedule a patient consultation.
              </p>
            </div>

            <button
              type="button"
              disabled={saving}
              onClick={onClose}
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
              "
            >
              <X size={17} />
            </button>
          </div>

          <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
        </div>

        {/* Content */}
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-2 sm:px-6">
          <div className="grid gap-5 sm:grid-cols-2">
            {/* Patient */}
            <div ref={patientContainerRef} className="relative">
              <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                Patient
                <span className="ml-1 text-red-400">*</span>
              </label>

              <div className="relative">
                <Search
                  size={15}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-300
                  "
                />

                <input
                  value={
                    selectedPatient
                      ? patientName(selectedPatient)
                      : patientSearch
                  }
                  onChange={(event) => {
                    setPatientSearch(event.target.value);

                    setForm((current) => ({
                      ...current,
                      patientId: "",
                    }));

                    setShowDoctors(false);
                    setShowPatients(true);
                  }}
                  onFocus={() => {
                    setShowDoctors(false);
                    setShowPatients(true);
                  }}
                  placeholder="Search patient..."
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border-0
                    bg-slate-50
                    pl-9
                    pr-3
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

              {showPatients && (
                <div className="absolute left-0 right-0 top-[68px] z-30 overflow-hidden rounded-xl bg-white shadow-[0_15px_40px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70">
                  {filteredPatients.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-400">
                      No patients found.
                    </div>
                  ) : (
                    filteredPatients.map((patient) => (
                      <button
                        key={patient.id}
                        type="button"
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            patientId: patient.id,
                          }));

                          setPatientSearch("");

                          setShowPatients(false);
                        }}
                        className="
                            flex
                            w-full
                            items-center
                            gap-3
                            px-3
                            py-2.5
                            text-left
                            transition-colors
                            hover:bg-slate-50
                          "
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-600">
                          <UserRound size={14} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-700">
                            {patientName(patient)}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {patient.patientNumber}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Doctor */}
            <div ref={doctorContainerRef} className="relative">
              <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                Doctor
                <span className="ml-1 text-red-400">*</span>
              </label>

              <div className="relative">
                <Search
                  size={15}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-300
                  "
                />

                <input
                  value={
                    selectedDoctor ? doctorName(selectedDoctor) : doctorSearch
                  }
                  onChange={(event) => {
                    setDoctorSearch(event.target.value);

                    setForm((current) => ({
                      ...current,
                      doctorId: "",
                      startTime: "",
                      endTime: "",
                    }));

                    setShowPatients(false);
                    setShowDoctors(true);
                  }}
                  onFocus={() => {
                    setShowPatients(false);
                    setShowDoctors(true);
                  }}
                  placeholder="Search doctor..."
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border-0
                    bg-slate-50
                    pl-9
                    pr-3
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

              {showDoctors && (
                <div className="absolute left-0 right-0 top-[68px] z-30 overflow-hidden rounded-xl bg-white shadow-[0_15px_40px_rgba(15,23,42,0.12)] ring-1 ring-slate-200/70">
                  {filteredDoctors.length === 0 ? (
                    <div className="px-4 py-3 text-xs text-slate-400">
                      No doctors found.
                    </div>
                  ) : (
                    filteredDoctors.map((doctor) => (
                      <button
                        key={doctor.id}
                        type="button"
                        onClick={() => {
                          setForm((current) => ({
                            ...current,
                            doctorId: doctor.id,
                            startTime: "",
                            endTime: "",
                          }));

                          setDoctorSearch("");

                          setShowDoctors(false);
                        }}
                        className="
                            flex
                            w-full
                            items-center
                            gap-3
                            px-3
                            py-2.5
                            text-left
                            transition-colors
                            hover:bg-slate-50
                          "
                      >
                        <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-violet-50 text-violet-600">
                          <UserRound size={14} />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-xs font-semibold text-slate-700">
                            {doctorName(doctor)}
                          </p>

                          <p className="mt-0.5 text-[10px] text-slate-400">
                            {doctor.doctorNumber}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Appointment Date */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                Appointment date
                <span className="ml-1 text-red-400">*</span>
              </label>

              <div className="relative">
                <CalendarDays
                  size={15}
                  className="
                    absolute
                    left-3
                    top-1/2
                    -translate-y-1/2
                    text-slate-300
                  "
                />

                <input
                  type="date"
                  value={form.appointmentDate}
                  min={getInitialDate()}
                  onChange={(event) =>
                    setForm((current) => ({
                      ...current,
                      appointmentDate: event.target.value,
                      startTime: "",
                      endTime: "",
                    }))
                  }
                  className="
                    h-10
                    w-full
                    rounded-xl
                    border-0
                    bg-slate-50
                    pl-9
                    pr-3
                    text-sm
                    text-slate-700
                    outline-none
                    ring-1
                    ring-slate-200/70
                    focus:bg-white
                    focus:ring-2
                    focus:ring-teal-500/20
                  "
                />
              </div>
            </div>

            {/* Available Time */}
            <div className="sm:col-span-2">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-[11px] font-semibold text-slate-500">
                  Available time
                  <span className="ml-1 text-red-400">*</span>
                </label>

                {loadingSlots && (
                  <span className="flex items-center gap-1.5 text-[10px] text-slate-400">
                    <Loader2 size={12} className="animate-spin" />
                    Checking availability
                  </span>
                )}
              </div>

              {!form.doctorId ? (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-400">
                  Select a doctor to view available appointment times.
                </div>
              ) : slotError ? (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-500">
                  {slotError}
                </div>
              ) : slots.length === 0 && !loadingSlots ? (
                <div className="rounded-xl bg-slate-50 px-4 py-3 text-xs text-slate-400">
                  No appointment slots are available for this date.
                </div>
              ) : (
                <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                  {slots.map((slot) => {
                    const selected =
                      form.startTime === slot.startTime &&
                      form.endTime === slot.endTime;

                    return (
                      <button
                        key={`${slot.startTime}-${slot.endTime}`}
                        type="button"
                        disabled={!slot.available}
                        onClick={() => selectSlot(slot)}
                        className={`
                          flex
                          h-10
                          items-center
                          justify-center
                          gap-1.5
                          rounded-xl
                          text-xs
                          font-medium
                          transition
                          ${
                            selected
                              ? "bg-teal-600 text-white shadow-sm"
                              : slot.available
                                ? "bg-teal-50 text-teal-700 ring-1 ring-teal-100 hover:bg-teal-100"
                                : "cursor-not-allowed bg-slate-50 text-slate-300 ring-1 ring-slate-100"
                          }
                        `}
                      >
                        <Clock3 size={13} />

                        {slot.startTime}
                      </button>
                    );
                  })}
                </div>
              )}

              {form.startTime && form.endTime && (
                <p className="mt-2 flex items-center gap-1.5 text-[10px] text-teal-600">
                  <Check size={12} />
                  Selected {form.startTime} – {form.endTime}
                </p>
              )}
            </div>

            {/* Separator */}
            <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent sm:col-span-2" />

            {/* Appointment Type */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                Appointment type
              </label>

              <select
                value={form.type}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    type: event.target.value as AppointmentType,
                  }))
                }
                className="
                  h-10
                  w-full
                  rounded-xl
                  border-0
                  bg-slate-50
                  px-3
                  text-sm
                  text-slate-700
                  outline-none
                  ring-1
                  ring-slate-200/70
                  focus:bg-white
                  focus:ring-2
                  focus:ring-teal-500/20
                "
              >
                {APPOINTMENT_TYPES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Priority */}
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                Priority
              </label>

              <select
                value={form.priority}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    priority: event.target.value as AppointmentPriority,
                  }))
                }
                className="
                  h-10
                  w-full
                  rounded-xl
                  border-0
                  bg-slate-50
                  px-3
                  text-sm
                  text-slate-700
                  outline-none
                  ring-1
                  ring-slate-200/70
                  focus:bg-white
                  focus:ring-2
                  focus:ring-teal-500/20
                "
              >
                {PRIORITIES.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Reason */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                Reason
              </label>

              <textarea
                value={form.reason}
                maxLength={1000}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    reason: event.target.value,
                  }))
                }
                rows={2}
                placeholder="Reason for consultation..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border-0
                  bg-slate-50
                  px-3
                  py-2.5
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

            {/* Notes */}
            <div className="sm:col-span-2">
              <label className="mb-1.5 block text-[11px] font-semibold text-slate-500">
                Notes
              </label>

              <textarea
                value={form.notes}
                maxLength={2000}
                onChange={(event) =>
                  setForm((current) => ({
                    ...current,
                    notes: event.target.value,
                  }))
                }
                rows={3}
                placeholder="Additional notes..."
                className="
                  w-full
                  resize-none
                  rounded-xl
                  border-0
                  bg-slate-50
                  px-3
                  py-2.5
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

            {error && (
              <div className="sm:col-span-2 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 ring-1 ring-red-100">
                {error}
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="shrink-0 bg-white px-5 pb-5 pt-2 sm:px-6">
          <div className="h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

          <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="
                h-10
                rounded-xl
                px-4
                text-xs
                font-semibold
                text-slate-500
                transition-colors
                hover:bg-slate-50
                disabled:opacity-50
              "
            >
              Cancel
            </button>

            <button
              type="button"
              disabled={
                saving ||
                !form.patientId ||
                !form.doctorId ||
                !form.startTime ||
                !form.endTime
              }
              onClick={handleCreate}
              className="
                inline-flex
                h-10
                items-center
                justify-center
                gap-2
                rounded-xl
                bg-teal-600
                px-5
                text-xs
                font-semibold
                text-white
                shadow-sm
                transition
                hover:bg-teal-700
                disabled:cursor-not-allowed
                disabled:opacity-50
              "
            >
              {saving && <Loader2 size={14} className="animate-spin" />}

              {saving ? "Creating..." : "Create appointment"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
