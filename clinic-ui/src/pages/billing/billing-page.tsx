import { useAuth } from "@/auth/auth-context";
import {
  Search,
  X,
  ChevronDown,
  Check,
  Receipt,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useCallback, useEffect, useState, useRef } from "react";
import { useNavigate } from "react-router-dom";

import { billingService } from "@/services/billing-service";
import type { Invoice } from "@/types/billing";

type InvoiceStatusFilter =
  | "ALL"
  | "DRAFT"
  | "ISSUED"
  | "PARTIALLY_PAID"
  | "PAID"
  | "CANCELLED"
  | "REFUNDED";

function InvoiceStatusBadge({ status }: { status: Invoice["status"] }) {
  const config = {
    DRAFT: {
      label: "Draft",
      className: "bg-slate-100 text-slate-600 ring-slate-200/70",
      dot: "bg-slate-400",
    },
    ISSUED: {
      label: "Issued",
      className: "bg-sky-50 text-sky-700 ring-sky-200/70",
      dot: "bg-sky-500",
    },
    PARTIALLY_PAID: {
      label: "Partially paid",
      className: "bg-amber-50 text-amber-700 ring-amber-200/70",
      dot: "bg-amber-500",
    },
    PAID: {
      label: "Paid",
      className: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
      dot: "bg-emerald-500",
    },
    CANCELLED: {
      label: "Cancelled",
      className: "bg-slate-100 text-slate-600 ring-slate-200/70",
      dot: "bg-slate-400",
    },
    REFUNDED: {
      label: "Refunded",
      className: "bg-purple-50 text-purple-700 ring-purple-200/70",
      dot: "bg-purple-500",
    },
  }[status];

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${config.className}`}
    >
      <span className={`size-1.5 rounded-full ${config.dot}`} />
      {config.label}
    </span>
  );
}

function InvoiceStatusSelect({
  value,
  onChange,
}: {
  value: InvoiceStatusFilter;
  onChange: (value: InvoiceStatusFilter) => void;
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

  const options: Array<{
    value: InvoiceStatusFilter;
    label: string;
  }> = [
    { value: "ALL", label: "All invoices" },
    { value: "DRAFT", label: "Draft" },
    { value: "ISSUED", label: "Issued" },
    { value: "PARTIALLY_PAID", label: "Partially paid" },
    { value: "PAID", label: "Paid" },
    { value: "CANCELLED", label: "Cancelled" },
    { value: "REFUNDED", label: "Refunded" },
  ];

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 min-w-[155px] items-center justify-between gap-3 rounded-xl bg-white px-3.5 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80 transition hover:bg-slate-50 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
      >
        <span>{selected?.label ?? "Select"}</span>

        <ChevronDown
          className={`size-4 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute right-0 z-30 mt-2 w-full min-w-[180px] overflow-hidden rounded-xl bg-white p-1.5 shadow-lg ring-1 ring-slate-200/80">
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

export function BillingPage() {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission("BILLING_CREATE");
  const navigate = useNavigate();

  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [totalInvoices, setTotalInvoices] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<InvoiceStatusFilter>("ALL");
  const [page, setPage] = useState(1);
  const limit = 10;
  const totalPages = Math.ceil(totalInvoices / limit);

  const loadInvoices = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await billingService.getInvoices({
        page,
        limit,
        ...(search.trim() ? { search: search.trim() } : {}),
        ...(status !== "ALL" ? { status } : {}),
      });

      setInvoices(response.data);
      setTotalInvoices(response.total);
    } catch (err) {
      console.error("Failed to load invoices:", err);
      setError("Failed to load invoices.");
    } finally {
      setLoading(false);
    }
  }, [page, search, status, limit]);

  useEffect(() => {
    loadInvoices();
  }, [loadInvoices]);

  const formatAmount = (value: string) =>
    Number(value).toLocaleString("en-IN", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  function formatLabel(value: string) {
    return value
      .replaceAll("_", " ")
      .toLowerCase()
      .replace(/\b\w/g, (character) => character.toUpperCase());
  }

  return (
    <div className="space-y-6">
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
          <div className="flex items-center gap-2.5">
            <span
              className="
      flex
      size-9
      items-center
      justify-center
      rounded-xl
      bg-teal-50
      text-teal-700
    "
            >
              <Receipt size={19} />
            </span>

            <h1
              className="
      text-2xl
      font-semibold
      tracking-tight
      text-slate-900
    "
            >
              Billing
            </h1>

            <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
              {totalInvoices}
            </span>
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage invoices and payments for your clinic.
          </p>
        </div>

        {canCreate && (
          <button
            type="button"
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
              font-semibold
              text-white
              shadow-sm
              transition-all
              hover:bg-teal-700
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-teal-500/30
              sm:w-auto
            "
          >
            Create invoice
          </button>
        )}
      </div>

      <div className="mt-5 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 sm:p-4">
        <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full lg:max-w-md">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400" />

            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search invoice or patient..."
              className="h-10 w-full rounded-xl bg-slate-50 pl-10 pr-9 text-sm text-slate-700 outline-none ring-1 ring-transparent placeholder:text-slate-400 focus:bg-white focus:ring-teal-500/20"
            />

            {search && (
              <button
                type="button"
                onClick={() => {
                  setSearch("");
                  setPage(1);
                }}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-600"
              >
                <X className="size-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden text-sm text-slate-400 sm:inline">
              Status
            </span>

            <InvoiceStatusSelect
              value={status}
              onChange={(value) => {
                setStatus(value);
                setPage(1);
              }}
            />
          </div>
        </div>
      </div>

      <div className="mt-6">
        {loading ? (
          <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-100">
            <div className="space-y-3">
              {[1, 2, 3].map((item) => (
                <div
                  key={item}
                  className="h-16 animate-pulse rounded-xl bg-slate-100"
                />
              ))}
            </div>
          </div>
        ) : error ? (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-medium text-slate-900">
              Unable to load invoices
            </p>

            <p className="mt-1 text-sm text-slate-500">{error}</p>

            <button
              type="button"
              onClick={() => void loadInvoices()}
              className="mt-4 inline-flex h-9 items-center rounded-lg bg-teal-600 px-3.5 text-sm font-semibold text-white transition hover:bg-teal-700"
            >
              Try again
            </button>
          </div>
        ) : invoices.length === 0 ? (
          <div className="rounded-2xl bg-white px-6 py-14 text-center shadow-sm ring-1 ring-slate-100">
            <p className="text-sm font-semibold text-slate-900">
              No invoices found
            </p>

            <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">
              Invoices will appear here once they are created.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 md:block">
              {/* Header */}
              <div className="grid grid-cols-[minmax(180px,1.4fr)_minmax(180px,1.5fr)_minmax(140px,1fr)_110px_110px_130px_120px] gap-4 bg-slate-50/50 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                <span>Invoice</span>
                <span>Patient</span>
                <span>Appointment</span>
                <span className="text-right">Total</span>
                <span className="text-right">Paid</span>
                <span className="text-right">Balance</span>
                <span>Status</span>
              </div>

              {/* Rows */}
              <div>
                {invoices.map((invoice, index) => (
                  <button
                    key={invoice.id}
                    type="button"
                    onClick={() => navigate(`/billing/${invoice.id}`)}
                    className="group relative cursor-pointer block w-full text-left transition-colors duration-150 hover:bg-slate-50/60 focus:outline-none focus-visible:bg-slate-50"
                  >
                    {index > 0 && (
                      <span
                        aria-hidden="true"
                        className="pointer-events-none absolute inset-x-0 top-0 h-[2px] bg-slate-200/30"
                      />
                    )}

                    <div className="grid grid-cols-[minmax(180px,1.4fr)_minmax(180px,1.5fr)_minmax(140px,1fr)_110px_110px_130px_120px] items-center gap-4 px-6 py-4">
                      {/* Invoice */}
                      <div className="min-w-0">
                        <p className="font-mono text-xs font-semibold text-slate-700">
                          {invoice.invoiceNumber}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          {formatLabel(invoice.type)} invoice
                        </p>
                      </div>

                      {/* Patient */}
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-slate-800">
                          {invoice.patient
                            ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
                            : "—"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">Patient</p>
                      </div>

                      {/* Appointment */}
                      <div className="min-w-0">
                        <p className="text-sm text-slate-600">
                          {invoice.appointment?.appointmentDate
                            ? new Date(
                                invoice.appointment.appointmentDate,
                              ).toLocaleDateString("en-IN", {
                                day: "2-digit",
                                month: "short",
                                year: "numeric",
                              })
                            : "—"}
                        </p>

                        <p className="mt-0.5 text-xs text-slate-400">
                          Appointment
                        </p>
                      </div>

                      {/* Total */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          ₹{formatAmount(invoice.total)}
                        </p>
                      </div>

                      {/* Paid */}
                      <div className="text-right">
                        <p className="text-sm font-medium text-slate-600">
                          ₹{formatAmount(invoice.amountPaid)}
                        </p>
                      </div>

                      {/* Balance */}
                      <div className="text-right">
                        <p className="text-sm font-semibold text-slate-800">
                          ₹{formatAmount(invoice.balanceDue)}
                        </p>
                      </div>

                      {/* Status */}
                      <div>
                        <InvoiceStatusBadge status={invoice.status} />
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile */}
            <div className="space-y-3 md:hidden">
              {invoices.map((invoice) => (
                <button
                  key={invoice.id}
                  type="button"
                  onClick={() => navigate(`/billing/${invoice.id}`)}
                  className="w-full rounded-2xl bg-white p-4 text-left shadow-sm ring-1 ring-slate-100 transition hover:bg-slate-50/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="truncate font-mono text-xs font-semibold text-slate-700">
                        {invoice.invoiceNumber}
                      </p>

                      <p className="mt-1 truncate font-semibold text-slate-900">
                        {invoice.patient
                          ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
                          : "—"}
                      </p>
                    </div>

                    <InvoiceStatusBadge status={invoice.status} />
                  </div>

                  <div className="mt-4 rounded-xl bg-slate-50/80 p-3">
                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <p className="text-xs text-slate-400">Total</p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          ₹{formatAmount(invoice.total)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Paid</p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          ₹{formatAmount(invoice.amountPaid)}
                        </p>
                      </div>

                      <div>
                        <p className="text-xs text-slate-400">Balance</p>

                        <p className="mt-1 text-sm font-semibold text-slate-700">
                          ₹{formatAmount(invoice.balanceDue)}
                        </p>
                      </div>
                    </div>

                    <div className="mt-3">
                      <p className="text-xs text-slate-400">Appointment</p>

                      <p className="mt-1 text-sm font-medium text-slate-700">
                        {invoice.appointment?.appointmentDate
                          ? new Date(
                              invoice.appointment.appointmentDate,
                            ).toLocaleDateString("en-IN", {
                              day: "2-digit",
                              month: "short",
                              year: "numeric",
                            })
                          : "—"}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {totalInvoices > 0 && (
        <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-slate-500">
            Showing{" "}
            <span className="font-medium text-slate-700">
              {(page - 1) * 10 + 1}
            </span>{" "}
            to{" "}
            <span className="font-medium text-slate-700">
              {Math.min(page * 10, totalInvoices)}
            </span>{" "}
            of{" "}
            <span className="font-medium text-slate-700">{totalInvoices}</span>{" "}
            invoices
          </p>

          <div className="flex items-center justify-end gap-2">
            <button
              type="button"
              disabled={page === 1}
              onClick={() => setPage((current) => current - 1)}
              className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200/80 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="size-4" />
            </button>

            <span className="min-w-[80px] text-center text-sm font-medium text-slate-600">
              Page {page} of {totalPages}
            </span>

            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((current) => current + 1)}
              className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-slate-500 ring-1 ring-slate-200/80 transition hover:bg-slate-50 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
