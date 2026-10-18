import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  FileText,
  Loader2,
  PackageCheck,
  Store,
  RefreshCw,
  Search,
  UserRound,
  X,
  XCircle,
  Pill,
} from "lucide-react";
import { PageLoader } from "@/components/ui/page-loader";
import { SectionLoader } from "@/components/ui/section-loader";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { useAuth } from "@/auth/auth-context";
import { pharmacyService } from "@/services/pharmacy-service";
import type {
  PharmacyDispensing,
  PharmacyPrescription,
  PharmacyPrescriptionDetails,
  PharmacyPrescriptionQuery,
} from "@/types/pharmacy";

type StatusFilter =
  | "ALL"
  | "PENDING"
  | "PARTIALLY_DISPENSED"
  | "DISPENSED"
  | "CANCELLED";

const PAGE_SIZE = 10;

function formatDate(value?: string | Date | null) {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value?: string | Date | null) {
  if (!value) {
    return "—";
  }

  const date = value instanceof Date ? value : new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function getPatientName(prescription: PharmacyPrescription) {
  return `${prescription.patient.firstName} ${prescription.patient.lastName}`.trim();
}

function getStatus(prescription: PharmacyPrescription) {
  if (!prescription.dispensing) {
    return "PENDING";
  }

  if (prescription.dispensing.status === "COMPLETED") {
    return "DISPENSED";
  }

  if (prescription.dispensing.status === "CANCELLED") {
    return "CANCELLED";
  }

  if (prescription.dispensing.status === "PARTIALLY_DISPENSED") {
    return "PARTIALLY_DISPENSED";
  }

  return "PENDING";
}

function StatusBadge({ status }: { status: string }) {
  const config = {
    PENDING: {
      label: "Pending",
      className: "bg-amber-50 text-amber-700 ring-amber-200/70",
      dot: "bg-amber-500",
    },
    PARTIALLY_DISPENSED: {
      label: "Partially dispensed",
      className: "bg-sky-50 text-sky-700 ring-sky-200/70",
      dot: "bg-sky-500",
    },
    DISPENSED: {
      label: "Dispensed",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
      dot: "bg-emerald-500",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-slate-100 text-slate-600 ring-slate-200/70",
      dot: "bg-slate-400",
    },
  }[
    status as "PENDING" | "PARTIALLY_DISPENSED" | "DISPENSED" | "CANCELLED"
  ] ?? {
    label: status,
    className: "bg-slate-100 text-slate-600 ring-slate-200/70",
    dot: "bg-slate-400",
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function CustomSelect({
  value,
  onChange,
  options,
}: {
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 min-w-[145px] items-center justify-between gap-3 rounded-xl bg-white px-3.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      >
        <span>{selected?.label ?? "Select"}</span>
        <ChevronDown
          className={`size-4 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-full min-w-[170px] overflow-hidden rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200/80">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className="flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
            >
              <span>{option.label}</span>
              {option.value === value && (
                <Check className="size-4 text-teal-600" />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function PharmacyPage() {
  const { hasPermission } = useAuth();

  const canRead = hasPermission("PHARMACY_READ");
  const canUpdate = hasPermission("PHARMACY_UPDATE");

  const [prescriptions, setPrescriptions] = useState<PharmacyPrescription[]>(
    [],
  );
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);

  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("ALL");

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const [selected, setSelected] = useState<PharmacyPrescriptionDetails | null>(
    null,
  );
  const [detailsLoading, setDetailsLoading] = useState(false);

  const [dispenseOpen, setDispenseOpen] = useState(false);
  const [invoiceId, setInvoiceId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [notes, setNotes] = useState("");
  const [dispensing, setDispensing] = useState(false);
  const [dispenseError, setDispenseError] = useState("");

  const [cancelOpen, setCancelOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const [mobileDetailsOpen, setMobileDetailsOpen] = useState(false);

  const loadPrescriptions = async (showLoader = false) => {
    try {
      setError("");
      if (showLoader) setRefreshing(true);

      const query: PharmacyPrescriptionQuery = {
        page,
        limit: PAGE_SIZE,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status !== "ALL" ? { status } : {}),
      };

      const response = await pharmacyService.getPrescriptions(query);

      setPrescriptions(response.data);
      setTotal(response.total);
      setTotalPages(Math.max(response.totalPages, 1));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load pharmacy prescriptions.",
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (!canRead) {
      setLoading(false);
      return;
    }

    void loadPrescriptions();
  }, [page, status, canRead]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      void loadPrescriptions();
    }, 350);

    return () => window.clearTimeout(timer);
  }, [search]);

  const summary = useMemo(() => {
    return prescriptions.reduce(
      (acc, prescription) => {
        const current = getStatus(prescription);
        acc[current as keyof typeof acc] += 1;
        return acc;
      },
      { PENDING: 0, PARTIALLY_DISPENSED: 0, DISPENSED: 0, CANCELLED: 0 },
    );
  }, [prescriptions]);

  const openDetails = async (prescription: PharmacyPrescription) => {
    setSelected({
      ...prescription,
      dispensing: null,
    });

    if (window.innerWidth < 768) {
      setMobileDetailsOpen(true);
    } else {
      setMobileDetailsOpen(false);
    }

    setDetailsLoading(true);

    try {
      const dispensingDetails = await pharmacyService.getDispensing(
        prescription.id,
      );

      if (dispensingDetails) {
        setSelected({
          ...prescription,
          dispensing: dispensingDetails as PharmacyDispensing,
        });
      }
    } catch {
      // A prescription without dispensing is expected for pending prescriptions.
    } finally {
      setDetailsLoading(false);
    }
  };

  const openDispense = (prescription: PharmacyPrescription) => {
    setSelected({
      ...prescription,
      dispensing: null,
    });
    setMobileDetailsOpen(false);
    setInvoiceId("");
    setQuantity("");
    setNotes("");
    setDispenseError("");
    setDispenseOpen(true);
  };

  const openCancel = async (prescription: PharmacyPrescription) => {
    setCancelError("");
    setSelected({
      ...prescription,
      dispensing: null,
    });
    setMobileDetailsOpen(false);
    setDispenseOpen(false);
    setDetailsLoading(true);

    try {
      const dispensingDetails = await pharmacyService.getDispensing(
        prescription.id,
      );

      if (!dispensingDetails?.id) {
        throw new Error(
          "No dispensing record was found for this prescription.",
        );
      }

      setSelected({
        ...prescription,
        dispensing: dispensingDetails as PharmacyDispensing,
      });
      setCancelOpen(true);
    } catch (err: any) {
      setSelected(null);
      setCancelError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load the dispensing record.",
      );
    } finally {
      setDetailsLoading(false);
    }
  };

  const handleDispense = async () => {
    if (!selected) return;

    try {
      setDispensing(true);
      setDispenseError("");

      await pharmacyService.dispensePrescription(selected.id, {
        ...(quantity.trim() ? { quantity: Number(quantity) } : {}),
        ...(notes.trim() ? { notes: notes.trim() } : {}),
      });

      // Clear the selected prescription before closing the modal.
      // This prevents the prescription details drawer from becoming visible
      // again while the refreshed prescription list is loading.
      setSelected(null);
      setMobileDetailsOpen(false);
      setDispenseOpen(false);
      await loadPrescriptions(true);
    } catch (err: any) {
      setDispenseError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to dispense this prescription.",
      );
    } finally {
      setDispensing(false);
    }
  };

  const handleCancel = async () => {
    if (!selected?.dispensing?.id) return;

    try {
      setCancelling(true);
      setCancelError("");

      await pharmacyService.cancelDispensing(selected.dispensing.id);

      setCancelOpen(false);
      await loadPrescriptions(true);
      setSelected(null);
      setMobileDetailsOpen(false);
    } catch (err: any) {
      setCancelError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to cancel this dispensing.",
      );
    } finally {
      setCancelling(false);
    }
  };

  if (!canRead) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center px-4">
        <div className="w-full max-w-md rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-slate-100">
            <XCircle className="size-6 text-slate-400" />
          </div>
          <h2 className="mt-4 text-lg font-semibold text-slate-900">
            Access restricted
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            You do not have permission to view the pharmacy queue.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-5 pb-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Store className="size-4 text-teal-500" />
            Pharmacy
          </div>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Dispensing Queue
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Review prescriptions and dispense medicines from pharmacy stock.
          </p>
        </div>

        <button
          type="button"
          onClick={() => void loadPrescriptions(true)}
          disabled={refreshing}
          className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3.5 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {refreshing ? (
            <Loader2 className="size-4 animate-spin text-teal-600" />
          ) : (
            <RefreshCw className="size-4 text-slate-400" />
          )}
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-50">
              <ClipboardList className="size-4.5 text-teal-600" />
            </div>
            <span className="text-xs font-medium text-slate-400">Total</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">{total}</p>
          <p className="mt-0.5 text-xs text-slate-400">Prescriptions</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-amber-50">
              <PackageCheck className="size-4.5 text-amber-600" />
            </div>
            <span className="text-xs font-medium text-amber-600">Queue</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {summary.PENDING}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Pending dispense</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-emerald-50">
              <Check className="size-4.5 text-emerald-600" />
            </div>
            <span className="text-xs font-medium text-emerald-600">Done</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {summary.DISPENSED}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Dispensed</p>
        </div>

        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
          <div className="flex items-center justify-between">
            <div className="flex size-9 items-center justify-center rounded-xl bg-slate-100">
              <XCircle className="size-4.5 text-slate-500" />
            </div>
            <span className="text-xs font-medium text-slate-400">Closed</span>
          </div>
          <p className="mt-3 text-2xl font-semibold text-slate-900">
            {summary.CANCELLED}
          </p>
          <p className="mt-0.5 text-xs text-slate-400">Cancelled</p>
        </div>
      </div>

      <div className="rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search patient, prescription or medicine..."
              className="h-10 w-full rounded-xl bg-slate-50 pl-10 pr-9 text-sm text-slate-700 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:bg-white focus:ring-teal-500/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-400 sm:inline">
              Status
            </span>
            <CustomSelect
              value={status}
              onChange={(value) => {
                setStatus(value as StatusFilter);
                setPage(1);
              }}
              options={[
                { value: "ALL", label: "All prescriptions" },
                { value: "PENDING", label: "Pending" },
                { value: "PARTIALLY_DISPENSED", label: "Partially dispensed" },
                { value: "DISPENSED", label: "Dispensed" },
                { value: "CANCELLED", label: "Cancelled" },
              ]}
            />
          </div>
        </div>
      </div>

      {loading ? (
        <PageLoader
          message="Loading pharmacy queue..."
          className="min-h-[360px]"
        />
      ) : error ? (
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
          <div className="mx-auto flex size-11 items-center justify-center rounded-xl bg-red-50">
            <AlertCircle className="size-5 text-red-500" />
          </div>
          <h3 className="mt-3 text-sm font-semibold text-slate-900">
            Unable to load pharmacy queue
          </h3>
          <p className="mt-1 text-sm text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => void loadPrescriptions(true)}
            className="mt-4 inline-flex h-9 items-center gap-2 rounded-lg bg-teal-600 px-3.5 text-sm font-semibold text-white transition hover:bg-teal-700"
          >
            <RefreshCw className="size-4" />
            Try again
          </button>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-100">
          <div className="mx-auto flex size-12 items-center justify-center rounded-xl bg-teal-50">
            <Pill className="size-6 text-teal-600" />
          </div>
          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No prescriptions found
          </h3>
          <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
            Try changing your search or status filter.
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 md:block">
            <div className="grid grid-cols-[minmax(180px,1.4fr)_minmax(200px,2fr)_minmax(150px,1.1fr)_90px_minmax(150px,1.15fr)_180px] gap-4 bg-slate-50/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              <span>Patient</span>
              <span>Medicine</span>
              <span>Prescription</span>
              <span>Quantity</span>
              <span>Status</span>
              <span className="text-right">Action</span>
            </div>

            <div>
              {prescriptions.map((prescription, index) => {
                const currentStatus = getStatus(prescription);

                return (
                  <div
                    key={prescription.id}
                    className="group relative block transition-colors duration-150 hover:bg-slate-50/60"
                  >
                    {index > 0 && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-slate-200/30"
                      />
                    )}

                    <div className="grid grid-cols-[minmax(180px,1.4fr)_minmax(200px,2fr)_minmax(150px,1.1fr)_90px_minmax(150px,1.15fr)_180px] items-center gap-4 px-6 py-4">
                      <div className="min-w-0">
                        <button
                          type="button"
                          onClick={() => void openDetails(prescription)}
                          className="text-left"
                        >
                          <p className="font-semibold text-slate-800">
                            {getPatientName(prescription)}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            {prescription.patient.patientNumber}
                          </p>
                        </button>
                      </div>

                      <div className="min-w-0">
                        <p className="truncate font-medium text-slate-800">
                          {prescription.medicationName}
                        </p>
                        <p className="mt-0.5 truncate text-xs text-slate-400">
                          {prescription.dosage} · {prescription.frequency}
                        </p>
                      </div>

                      <div className="min-w-0">
                        <p className="font-mono text-xs text-slate-500">
                          {prescription.prescriptionNumber}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatDate(prescription.createdAt)}
                        </p>
                      </div>

                      <div className="text-sm font-medium text-slate-700">
                        {prescription.quantity || "—"}
                      </div>

                      <div>
                        <StatusBadge status={currentStatus} />
                      </div>

                      <div className="flex justify-end">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => void openDetails(prescription)}
                            className="inline-flex h-9 items-center gap-1.5 rounded-lg px-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-50"
                          >
                            View
                          </button>

                          {(currentStatus === "PENDING" ||
                            currentStatus === "PARTIALLY_DISPENSED") &&
                            canUpdate && (
                              <button
                                type="button"
                                onClick={() => openDispense(prescription)}
                                className="inline-flex h-9 items-center gap-1.5 rounded-lg bg-teal-600 px-3 text-sm font-semibold text-white transition hover:bg-teal-700"
                              >
                                <PackageCheck className="size-4" />
                                Dispense
                              </button>
                            )}

                          {(currentStatus === "DISPENSED" ||
                            currentStatus === "PARTIALLY_DISPENSED") &&
                            canUpdate && (
                              <button
                                type="button"
                                onClick={() => {
                                  void openCancel(prescription);
                                }}
                                className="inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold text-slate-500 ring-1 ring-slate-200/80 transition hover:bg-slate-50 hover:text-red-600"
                              >
                                Cancel
                              </button>
                            )}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3 md:hidden">
            {prescriptions.map((prescription) => {
              const currentStatus = getStatus(prescription);

              return (
                <div
                  key={prescription.id}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => void openDetails(prescription)}
                      className="min-w-0 text-left"
                    >
                      <p className="truncate font-semibold text-slate-900">
                        {getPatientName(prescription)}
                      </p>
                      <p className="mt-0.5 text-xs text-slate-400">
                        {prescription.patient.patientNumber}
                      </p>
                    </button>
                    <StatusBadge status={currentStatus} />
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50/80 p-3">
                    <div className="flex items-start gap-3">
                      <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-teal-50">
                        <Pill className="size-4 text-teal-600" />
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {prescription.medicationName}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-500">
                          {prescription.dosage} · {prescription.frequency}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-3 text-xs">
                      <div>
                        <p className="text-slate-400">Quantity</p>
                        <p className="mt-1 font-semibold text-slate-700">
                          {prescription.quantity || "—"}
                        </p>
                      </div>
                      <div>
                        <p className="text-slate-400">Prescribed</p>
                        <p className="mt-1 font-semibold text-slate-700">
                          {formatDate(prescription.createdAt)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-3 flex gap-2">
                    <button
                      type="button"
                      onClick={() => void openDetails(prescription)}
                      className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl text-sm font-semibold text-slate-600 ring-1 ring-slate-200/80"
                    >
                      View details
                    </button>

                    {(currentStatus === "PENDING" ||
                      currentStatus === "PARTIALLY_DISPENSED") &&
                      canUpdate && (
                        <button
                          type="button"
                          onClick={() => openDispense(prescription)}
                          className="flex h-10 flex-1 items-center justify-center gap-1.5 rounded-xl bg-teal-600 text-sm font-semibold text-white"
                        >
                          <PackageCheck className="size-4" />
                          Dispense
                        </button>
                      )}

                    {(currentStatus === "DISPENSED" ||
                      currentStatus === "PARTIALLY_DISPENSED") &&
                      canUpdate && (
                        <button
                          type="button"
                          onClick={() => {
                            void openCancel(prescription);
                          }}
                          className="flex h-10 flex-1 items-center justify-center rounded-xl text-sm font-semibold text-slate-600 ring-1 ring-slate-200/80"
                        >
                          Cancel
                        </button>
                      )}
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 shadow-sm ring-1 ring-slate-100">
            <p className="text-xs text-slate-400 sm:text-sm">
              Page <span className="font-semibold text-slate-700">{page}</span>{" "}
              of{" "}
              <span className="font-semibold text-slate-700">{totalPages}</span>
            </p>
            <div className="flex items-center gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => Math.max(current - 1, 1))}
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 ring-1 ring-slate-200/80 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronLeft className="size-4" />
              </button>
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() =>
                  setPage((current) => Math.min(current + 1, totalPages))
                }
                className="flex size-9 items-center justify-center rounded-lg text-slate-500 ring-1 ring-slate-200/80 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                <ChevronRight className="size-4" />
              </button>
            </div>
          </div>
        </>
      )}

      {mobileDetailsOpen && selected && !dispenseOpen && !cancelOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
            onClick={() => {
              setMobileDetailsOpen(false);
              setSelected(null);
            }}
          />
          <div className="absolute inset-x-0 bottom-0 max-h-[88vh] overflow-y-auto rounded-t-3xl bg-white shadow-2xl">
            <div className="sticky top-0 z-10 flex items-center justify-between bg-white/95 px-5 py-4 backdrop-blur">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Prescription
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  Prescription details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setMobileDetailsOpen(false)}
                className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="px-5 pb-7">
              <PrescriptionDetails
                prescription={selected}
                loading={detailsLoading}
                canUpdate={canUpdate}
                onDispense={() => {
                  setMobileDetailsOpen(false);
                  openDispense(selected);
                }}
                onCancel={() => {
                  setMobileDetailsOpen(false);
                  setCancelError("");
                  setCancelOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {selected && !mobileDetailsOpen && !dispenseOpen && !cancelOpen && (
        <div className="hidden md:block">
          <div
            className="fixed inset-0 z-40"
            onClick={() => setSelected(null)}
          />
          <div className="fixed right-0 top-0 z-50 flex h-full w-full max-w-xl flex-col bg-white shadow-2xl ring-1 ring-slate-100">
            <div className="flex items-center justify-between  px-6 py-5">
              <div>
                <p className="text-xs font-medium text-slate-400">
                  Prescription
                </p>
                <h2 className="text-lg font-semibold text-slate-900">
                  Prescription details
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setSelected(null)}
                className="flex size-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto px-6 py-5">
              <PrescriptionDetails
                prescription={selected}
                loading={detailsLoading}
                canUpdate={canUpdate}
                onDispense={() => openDispense(selected)}
                onCancel={() => {
                  setDispenseOpen(false);
                  setCancelError("");
                  setCancelOpen(true);
                }}
              />
            </div>
          </div>
        </div>
      )}

      {dispenseOpen && selected && (
        <ModalShell
          title="Dispense prescription"
          subtitle={`${getPatientName(selected)} · ${selected.medicationName}`}
          onClose={() => {
            if (!dispensing) {
              setDispenseOpen(false);
              setSelected(null);
              setMobileDetailsOpen(false);
            }
          }}
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-teal-50/70 p-4 ring-1 ring-teal-100">
              <div className="flex items-start gap-3">
                <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-white">
                  <PackageCheck className="size-4 text-teal-600" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-teal-900">
                    Ready to dispense
                  </p>
                  <p className="mt-1 text-xs leading-5 text-teal-700">
                    Leave quantity blank to dispense the outstanding amount, or
                    enter a smaller quantity for a partial dispense. Batches are
                    selected using FEFO.
                  </p>
                </div>
              </div>
            </div>

            <Field label="Quantity" hint="Optional">
              <input
                type="number"
                min="1"
                step="1"
                value={quantity}
                onChange={(event) => setQuantity(event.target.value)}
                placeholder="Outstanding prescribed quantity"
                className="h-10 w-full rounded-xl bg-slate-50 px-3.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200/80 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </Field>

            {/* <Field label="Draft invoice ID" hint="Optional">
              <input
                value={invoiceId}
                onChange={(event) => setInvoiceId(event.target.value)}
                placeholder="Enter invoice UUID"
                className="h-10 w-full rounded-xl bg-slate-50 px-3.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200/80 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </Field> */}

            <Field label="Notes" hint="Optional">
              <textarea
                value={notes}
                onChange={(event) => setNotes(event.target.value)}
                rows={3}
                placeholder="Add dispensing notes..."
                className="w-full resize-none rounded-xl bg-slate-50 px-3.5 py-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200/80 placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
              />
            </Field>

            {dispenseError && <ErrorMessage message={dispenseError} />}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={dispensing}
                onClick={() => {
                  setDispenseOpen(false);
                  setSelected(null);
                  setMobileDetailsOpen(false);
                }}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={dispensing}
                onClick={() => void handleDispense()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {dispensing && <ButtonSpinner />}
                {dispensing ? "Dispensing..." : "Confirm dispense"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}

      {cancelOpen && selected && (
        <ModalShell
          title="Cancel dispensing?"
          subtitle={getPatientName(selected)}
          onClose={() => !cancelling && setCancelOpen(false)}
        >
          <div className="space-y-4">
            <div className="rounded-xl bg-amber-50 p-4 ring-1 ring-amber-100">
              <div className="flex items-start gap-3">
                <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-600" />
                <p className="text-sm leading-6 text-amber-800">
                  Cancelling will restore the dispensed stock batches and mark
                  the dispensing record as cancelled.
                </p>
              </div>
            </div>

            {cancelError && <ErrorMessage message={cancelError} />}

            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={cancelling}
                onClick={() => setCancelOpen(false)}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Keep dispensing
              </button>
              <button
                type="button"
                disabled={cancelling}
                onClick={() => void handleCancel()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 text-sm font-semibold text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling && <ButtonSpinner />}
                {cancelling ? "Cancelling..." : "Cancel dispensing"}
              </button>
            </div>
          </div>
        </ModalShell>
      )}
    </div>
  );
}

function PrescriptionDetails({
  prescription,
  loading,
  canUpdate,
  onDispense,
  onCancel,
}: {
  prescription: PharmacyPrescriptionDetails;
  loading: boolean;
  canUpdate: boolean;
  onDispense: () => void;
  onCancel: () => void;
}) {
  const status = getStatus(prescription);

  return (
    <div className="space-y-5">
      <div className="rounded-2xl bg-slate-50/80 p-4 ring-1 ring-slate-100">
        <div className="flex items-start gap-3">
          <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-white shadow-sm ring-1 ring-slate-100">
            <UserRound className="size-5 text-teal-600" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-slate-900">
              {getPatientName(prescription)}
            </p>
            <p className="mt-0.5 text-xs text-slate-400">
              {prescription.patient.patientNumber}
            </p>
            <div className="mt-2">
              <StatusBadge status={status} />
            </div>
          </div>
        </div>
      </div>

      <div>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-900">Prescription</h3>
          <span className="text-xs text-slate-400">
            {formatDate(prescription.createdAt)}
          </span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <DetailItem label="Medicine" value={prescription.medicationName} />
          <DetailItem label="Dosage" value={prescription.dosage} />
          <DetailItem label="Frequency" value={prescription.frequency} />
          <DetailItem label="Quantity" value={prescription.quantity || "—"} />
          <DetailItem label="Route" value={prescription.route || "—"} />
          <DetailItem label="Duration" value={prescription.duration || "—"} />
        </div>

        {prescription.instructions && (
          <div className="mt-3 rounded-xl bg-slate-50 p-3.5 ring-1 ring-slate-100">
            <p className="text-xs font-medium text-slate-400">Instructions</p>
            <p className="mt-1 text-sm leading-6 text-slate-700">
              {prescription.instructions}
            </p>
          </div>
        )}
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">Doctor</h3>
        <div className="rounded-xl bg-white p-3.5 ring-1 ring-slate-100">
          <p className="text-sm font-semibold text-slate-800">
            {prescription.doctor.firstName} {prescription.doctor.lastName}
          </p>
          {prescription.doctor.doctorNumber && (
            <p className="mt-0.5 text-xs text-slate-400">
              {prescription.doctor.doctorNumber}
            </p>
          )}
        </div>
      </div>

      <div>
        <h3 className="mb-3 text-sm font-semibold text-slate-900">
          Dispensing
        </h3>

        {loading ? (
          <SectionLoader message="Loading dispensing details..." />
        ) : prescription.dispensing ? (
          <div className="space-y-3 rounded-xl bg-slate-50/70 p-4 ring-1 ring-slate-100">
            <div className="flex items-center justify-between gap-3">
              <StatusBadge
                status={
                  prescription.dispensing.status === "COMPLETED"
                    ? "DISPENSED"
                    : prescription.dispensing.status === "PARTIALLY_DISPENSED"
                      ? "PARTIALLY_DISPENSED"
                      : "CANCELLED"
                }
              />
              <span className="text-xs text-slate-400">
                {formatDateTime(prescription.dispensing.createdAt)}
              </span>
            </div>

            <div className="space-y-2">
              {prescription.dispensing.items.map((item) => (
                <div
                  key={item.id}
                  className="flex items-start justify-between gap-3 rounded-lg bg-white p-3 ring-1 ring-slate-100"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-slate-800">
                      {item.medicineName}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      Batch {item.batchNumber}
                    </p>
                  </div>
                  <div className="shrink-0 text-right">
                    <p className="text-sm font-semibold text-slate-700">
                      {item.quantity}
                    </p>
                    <p className="mt-0.5 text-xs text-slate-400">
                      {item.amount.toFixed(2)}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {prescription.dispensing.invoiceNumber &&
              prescription.dispensing.invoiceId && (
                <div className="flex items-center gap-2">
                  <p className="text-xs text-slate-400">
                    Invoice:{" "}
                    <span className="font-mono text-slate-500">
                      {prescription.dispensing.invoiceNumber}
                    </span>
                  </p>

                  <button
                    type="button"
                    onClick={() => {
                      window.location.href = `/billing/${prescription.dispensing!.invoiceId}`;
                    }}
                    className="cursor-pointer text-xs font-medium text-teal-600 hover:text-teal-700"
                  >
                    View Invoice
                  </button>
                </div>
              )}
          </div>
        ) : (
          <div className="rounded-xl bg-slate-50/70 p-4 text-sm text-slate-500 ring-1 ring-slate-100">
            This prescription has not been dispensed yet.
          </div>
        )}
      </div>

      {canUpdate && (
        <div className="flex gap-2 pt-1">
          {(status === "PENDING" || status === "PARTIALLY_DISPENSED") && (
            <button
              type="button"
              onClick={onDispense}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl bg-teal-600 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              <PackageCheck className="size-4" />
              Dispense prescription
            </button>
          )}

          {(status === "DISPENSED" || status === "PARTIALLY_DISPENSED") && (
            <button
              type="button"
              onClick={onCancel}
              className="flex h-10 flex-1 items-center justify-center gap-2 rounded-xl text-sm font-semibold text-slate-600 ring-1 ring-slate-200/80 transition hover:bg-slate-50 hover:text-red-600"
            >
              <XCircle className="size-4" />
              Cancel dispensing
            </button>
          )}
        </div>
      )}
    </div>
  );
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl bg-slate-50/70 p-3 ring-1 ring-slate-100">
      <p className="text-xs text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value}</p>
    </div>
  );
}

function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="mb-1.5 flex items-center justify-between">
        <label className="text-sm font-medium text-slate-700">{label}</label>
        {hint && <span className="text-xs text-slate-400">{hint}</span>}
      </div>
      {children}
    </div>
  );
}

function ErrorMessage({ message }: { message: string }) {
  return (
    <div className="flex items-start gap-2.5 rounded-xl bg-red-50 p-3 text-sm text-red-700 ring-1 ring-red-100">
      <AlertCircle className="mt-0.5 size-4 shrink-0" />
      <span>{message}</span>
    </div>
  );
}

function ModalShell({
  title,
  subtitle,
  onClose,
  children,
}: {
  title: string;
  subtitle?: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4">
      <div
        className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
        onClick={onClose}
      />
      <div
        className="relative w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-100 sm:rounded-2xl sm:p-6"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">{title}</h2>
            {subtitle && (
              <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200"
          >
            <X className="size-4" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}
