import { useEffect, useMemo, useState } from "react";
import {
  CalendarDays,
  Check,
  Loader2,
  Search,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";

import { appointmentService } from "@/services/appointment-service";
import { laboratoryService } from "@/services/laboratory-service";
import type { Appointment } from "@/types/appointment";
import type { LabOrder, LabTest } from "@/types/laboratory";

interface CreateLabOrderModalProps {
  open: boolean;
  onClose: () => void;
  onCreated: (order: LabOrder) => Promise<void> | void;
}

function getErrorMessage(error: unknown, fallback: string) {
  if (error && typeof error === "object") {
    const response = (error as { response?: { data?: { message?: unknown } } })
      .response;
    const message = response?.data?.message;
    if (typeof message === "string") return message;
    if (Array.isArray(message)) return message.join(", ");
  }

  if (error instanceof Error && error.message) return error.message;
  return fallback;
}

function patientName(appointment: Appointment) {
  if (!appointment.patient) return "Unknown patient";
  return [
    appointment.patient.firstName,
    appointment.patient.middleName,
    appointment.patient.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function doctorName(appointment: Appointment) {
  if (!appointment.doctor) return "Unknown doctor";
  return [
    appointment.doctor.title,
    appointment.doctor.firstName,
    appointment.doctor.middleName,
    appointment.doctor.lastName,
  ]
    .filter(Boolean)
    .join(" ");
}

function formatAppointmentDate(appointment: Appointment) {
  const date = new Date(appointment.appointmentDate);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatMoney(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 2,
  }).format(value);
}

const usableAppointmentStatuses = new Set([
  "SCHEDULED",
  "CONFIRMED",
  "CHECKED_IN",
  "IN_PROGRESS",
  "COMPLETED",
]);

export function CreateLabOrderModal({
  open,
  onClose,
  onCreated,
}: CreateLabOrderModalProps) {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [appointmentSearch, setAppointmentSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [selectedAppointment, setSelectedAppointment] =
    useState<Appointment | null>(null);
  const [selectedTestIds, setSelectedTestIds] = useState<string[]>([]);
  const [notes, setNotes] = useState("");
  const [loadingAppointments, setLoadingAppointments] = useState(false);
  const [loadingTests, setLoadingTests] = useState(false);
  // const [checkingExisting, setCheckingExisting] = useState(false);
  // const [existingOrder, setExistingOrder] = useState<LabOrder | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!open) return;

    setAppointments([]);
    setTests([]);
    setAppointmentSearch("");
    setTestSearch("");
    setSelectedAppointment(null);
    setSelectedTestIds([]);
    setNotes("");
    // setExistingOrder(null);
    setError("");

    const load = async () => {
      setLoadingAppointments(true);
      setLoadingTests(true);
      try {
        const [appointmentResponse, testResponse] = await Promise.all([
          appointmentService.getAppointments({
            page: 1,
            limit: 100,
            sortBy: "appointmentDate",
            sortOrder: "desc",
          }),
          laboratoryService.getTests({
            page: 1,
            limit: 100,
            isActive: true,
          }),
        ]);

        setAppointments(
          Array.isArray(appointmentResponse.items)
            ? appointmentResponse.items.filter((appointment) =>
                usableAppointmentStatuses.has(appointment.status),
              )
            : [],
        );
        setTests(Array.isArray(testResponse.data) ? testResponse.data : []);
      } catch (loadError) {
        setError(
          getErrorMessage(
            loadError,
            "Unable to load appointments and laboratory tests.",
          ),
        );
      } finally {
        setLoadingAppointments(false);
        setLoadingTests(false);
      }
    };

    void load();
  }, [open]);

  // useEffect(() => {
  //   if (!selectedAppointment) {
  //     setExistingOrder(null);
  //     return;
  //   }

  //   const checkExistingOrder = async () => {
  //     setCheckingExisting(true);
  //     setExistingOrder(null);
  //     setError("");

  //     try {
  //       const response = await laboratoryService.getOrders({
  //         page: 1,
  //         limit: 1,
  //         appointmentId: selectedAppointment.id,
  //       });

  //       const activeOrder = response.data?.find(
  //         (order) => order.status !== "CANCELLED",
  //       );
  //       setExistingOrder(activeOrder ?? null);
  //     } catch (checkError) {
  //       setError(
  //         getErrorMessage(
  //           checkError,
  //           "Unable to check the appointment for an existing laboratory order.",
  //         ),
  //       );
  //     } finally {
  //       setCheckingExisting(false);
  //     }
  //   };

  //   void checkExistingOrder();
  // }, [selectedAppointment]);

  const filteredAppointments = useMemo(() => {
    const query = appointmentSearch.trim().toLowerCase();
    if (!query) return appointments.slice(0, 20);

    return appointments
      .filter((appointment) => {
        const haystack = [
          appointment.appointmentNumber,
          patientName(appointment),
          appointment.patient?.patientNumber,
          doctorName(appointment),
          appointment.doctor?.doctorNumber,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();

        return haystack.includes(query);
      })
      .slice(0, 20);
  }, [appointments, appointmentSearch]);

  const filteredTests = useMemo(() => {
    const query = testSearch.trim().toLowerCase();
    if (!query) return tests;

    return tests.filter((test) =>
      [test.code, test.name, test.category]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query),
    );
  }, [tests, testSearch]);

  const selectedTests = useMemo(
    () => tests.filter((test) => selectedTestIds.includes(test.id)),
    [tests, selectedTestIds],
  );

  const total = useMemo(
    () => selectedTests.reduce((sum, test) => sum + Number(test.price || 0), 0),
    [selectedTests],
  );

  const toggleTest = (testId: string) => {
    setSelectedTestIds((current) =>
      current.includes(testId)
        ? current.filter((id) => id !== testId)
        : [...current, testId],
    );
  };

  const handleCreate = async () => {
    if (!selectedAppointment) {
      setError("Select an appointment first.");
      return;
    }

    if (selectedTestIds.length === 0) {
      setError("Select at least one laboratory test.");
      return;
    }

    // if (existingOrder) {
    //   setError("A laboratory order already exists for this appointment.");
    //   return;
    // }

    try {
      setSaving(true);
      setError("");

      const order = await laboratoryService.createOrder({
        appointmentId: selectedAppointment.id,
        labTestIds: selectedTestIds,
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      await onCreated(order);
      onClose();
    } catch (createError) {
      setError(
        getErrorMessage(createError, "Unable to create laboratory order."),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/20 p-0 backdrop-blur-[2px] md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        className="flex max-h-[94vh] w-full flex-col overflow-hidden rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200/80 md:max-w-3xl md:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex shrink-0 items-center justify-between px-5 py-4 ring-1 ring-slate-100">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Stethoscope className="size-4" />
              </div>
              <div>
                <h2 className="text-base font-semibold text-slate-900">
                  Create laboratory order
                </h2>
                <p className="text-xs text-slate-400">
                  Select an appointment and the tests to order.
                </p>
              </div>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>

        <div className="min-h-0 overflow-y-auto px-5 py-5">
          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700 ring-1 ring-red-100">
              {error}
            </div>
          )}

          <div className="space-y-5">
            <section>
              <div className="mb-2 flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Appointment
                  </p>
                  <p className="text-xs text-slate-400">
                    The patient and doctor will be taken from the appointment.
                  </p>
                </div>
                {/* {checkingExisting && (
                  <Loader2 className="size-4 animate-spin text-teal-600" />
                )} */}
              </div>

              {selectedAppointment ? (
                <div className="rounded-2xl bg-teal-50/70 p-4 ring-1 ring-teal-100">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-semibold text-slate-900">
                          {selectedAppointment.appointmentNumber}
                        </span>
                        <span className="rounded-full bg-white px-2 py-1 text-[11px] font-semibold text-teal-700 ring-1 ring-teal-100">
                          {selectedAppointment.status.replaceAll("_", " ")}
                        </span>
                      </div>
                      <div className="mt-3 grid gap-3 sm:grid-cols-3">
                        <div className="flex items-start gap-2">
                          <UserRound className="mt-0.5 size-4 text-teal-600" />
                          <div>
                            <p className="text-xs text-slate-400">Patient</p>
                            <p className="text-sm font-medium text-slate-800">
                              {patientName(selectedAppointment)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {selectedAppointment.patient?.patientNumber ?? ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <Stethoscope className="mt-0.5 size-4 text-teal-600" />
                          <div>
                            <p className="text-xs text-slate-400">Doctor</p>
                            <p className="text-sm font-medium text-slate-800">
                              {doctorName(selectedAppointment)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {selectedAppointment.doctor?.doctorNumber ?? ""}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-start gap-2">
                          <CalendarDays className="mt-0.5 size-4 text-teal-600" />
                          <div>
                            <p className="text-xs text-slate-400">
                              Date & time
                            </p>
                            <p className="text-sm font-medium text-slate-800">
                              {formatAppointmentDate(selectedAppointment)}
                            </p>
                            <p className="text-xs text-slate-400">
                              {selectedAppointment.startTime} –{" "}
                              {selectedAppointment.endTime}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => setSelectedAppointment(null)}
                      className="cursor-pointer rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-600"
                    >
                      <X className="size-4" />
                    </button>
                  </div>
                  {/* {existingOrder && (
                    <div className="mt-3 rounded-xl bg-white px-3 py-2 text-xs font-medium text-amber-700 ring-1 ring-amber-100">
                      An active laboratory order already exists for this
                      appointment.
                    </div>
                  )} */}
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                    <input
                      value={appointmentSearch}
                      onChange={(event) =>
                        setAppointmentSearch(event.target.value)
                      }
                      placeholder="Search appointment, patient, or doctor"
                      className="h-10 w-full rounded-xl bg-white pl-9 pr-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200/80 focus:ring-2 focus:ring-teal-500/30"
                    />
                  </div>
                  <div className="max-h-56 overflow-y-auto rounded-xl bg-white p-1 ring-1 ring-slate-200/80">
                    {loadingAppointments ? (
                      <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
                        <Loader2 className="size-4 animate-spin" />
                        Loading appointments...
                      </div>
                    ) : filteredAppointments.length === 0 ? (
                      <div className="py-8 text-center text-sm text-slate-400">
                        No eligible appointments found.
                      </div>
                    ) : (
                      filteredAppointments.map((appointment) => (
                        <button
                          key={appointment.id}
                          type="button"
                          onClick={() => setSelectedAppointment(appointment)}
                          className="flex w-full cursor-pointer items-center justify-between gap-3 rounded-lg px-3 py-3 text-left hover:bg-teal-50"
                        >
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-slate-800">
                              {appointment.appointmentNumber}
                            </p>
                            <p className="truncate text-xs text-slate-500">
                              {patientName(appointment)} ·{" "}
                              {doctorName(appointment)}
                            </p>
                          </div>
                          <div className="shrink-0 text-right">
                            <p className="text-xs font-medium text-slate-600">
                              {formatAppointmentDate(appointment)}
                            </p>
                            <p className="text-[11px] text-slate-400">
                              {appointment.startTime} ·{" "}
                              {appointment.status.replaceAll("_", " ")}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </section>

            <section>
              <div className="mb-2 flex items-end justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-slate-800">
                    Laboratory tests
                  </p>
                  <p className="text-xs text-slate-400">
                    Select one or more active tests.
                  </p>
                </div>
                <span className="text-xs font-medium text-slate-400">
                  {selectedTestIds.length} selected
                </span>
              </div>

              <div className="relative mb-2">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={testSearch}
                  onChange={(event) => setTestSearch(event.target.value)}
                  placeholder="Search tests"
                  className="h-10 w-full rounded-xl bg-white pl-9 pr-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200/80 focus:ring-2 focus:ring-teal-500/30"
                />
              </div>

              <div className="max-h-64 overflow-y-auto rounded-xl bg-white p-1 ring-1 ring-slate-200/80">
                {loadingTests ? (
                  <div className="flex items-center justify-center gap-2 py-8 text-sm text-slate-400">
                    <Loader2 className="size-4 animate-spin" />
                    Loading tests...
                  </div>
                ) : filteredTests.length === 0 ? (
                  <div className="py-8 text-center text-sm text-slate-400">
                    No active laboratory tests found.
                  </div>
                ) : (
                  filteredTests.map((test) => {
                    const selected = selectedTestIds.includes(test.id);
                    return (
                      <button
                        key={test.id}
                        type="button"
                        onClick={() => toggleTest(test.id)}
                        className={`flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-3 text-left transition ${selected ? "bg-teal-50" : "hover:bg-slate-50"}`}
                      >
                        <span
                          className={`flex size-5 shrink-0 items-center justify-center rounded-md ring-1 ${selected ? "bg-teal-600 text-white ring-teal-600" : "bg-white text-transparent ring-slate-300"}`}
                        >
                          <Check className="size-3.5" />
                        </span>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-semibold text-slate-800">
                              {test.name}
                            </p>
                            <span className="shrink-0 text-[11px] font-medium text-slate-400">
                              {test.code}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400">
                            {test.category || "General"}
                            {test.unit ? ` · ${test.unit}` : ""}
                          </p>
                        </div>
                        <span className="shrink-0 text-sm font-semibold text-slate-700">
                          {formatMoney(Number(test.price || 0))}
                        </span>
                      </button>
                    );
                  })
                )}
              </div>
            </section>

            <section>
              <label className="block text-sm font-semibold text-slate-800">
                Notes{" "}
                <span className="font-normal text-slate-400">(optional)</span>
              </label>
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Add clinical or processing notes..."
                className="mt-2 w-full resize-none rounded-xl bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200/80 focus:ring-2 focus:ring-teal-500/30"
              />
            </section>

            <div className="flex items-center justify-between rounded-2xl bg-slate-50 px-4 py-3 ring-1 ring-slate-100">
              <div>
                <p className="text-xs text-slate-400">Estimated total</p>
                <p className="text-lg font-semibold text-slate-900">
                  {formatMoney(total)}
                </p>
              </div>
              <p className="text-xs text-slate-400">
                {selectedTests.length} test
                {selectedTests.length === 1 ? "" : "s"}
              </p>
            </div>
          </div>
        </div>

        <div className="flex shrink-0 items-center justify-end gap-2 px-5 py-4 ring-1 ring-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={saving}
            className="cursor-pointer rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void handleCreate()}
            disabled={
              saving ||
              // checkingExisting ||
              !selectedAppointment ||
              selectedTestIds.length === 0
              // || Boolean(existingOrder)
            }
            className="inline-flex cursor-pointer items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {saving ? <Loader2 className="size-4 animate-spin" /> : null}
            {saving ? "Creating..." : "Create order"}
          </button>
        </div>
      </div>
    </div>
  );
}
