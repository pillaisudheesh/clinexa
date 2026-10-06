import { useEffect, useState } from "react";
import {
  ArrowLeft,
  FileText,
  Loader2,
  AlertCircle,
  Check,
  X,
  Receipt,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { useAuth } from "@/auth/auth-context";

import { billingService } from "@/services/billing-service";
import type { Invoice } from "@/types/billing";

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

function formatCurrency(value: string | number) {
  return `₹${Number(value).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
}

function formatDate(value?: string | null) {
  if (!value) {
    return "—";
  }

  return new Date(value).toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}

function formatLabel(value: string) {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

export default function InvoiceDetailPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();

  const [invoice, setInvoice] = useState<Invoice | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { hasPermission } = useAuth();
  const canUpdate = hasPermission("BILLING_UPDATE");

  const [issuing, setIssuing] = useState(false);
  const [showIssueConfirm, setShowIssueConfirm] = useState(false);
  const [showPaymentForm, setShowPaymentForm] = useState(false);
  const [paying, setPaying] = useState(false);

  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<
    "CASH" | "CARD" | "UPI" | "BANK_TRANSFER" | "OTHER"
  >("CASH");

  const [transactionReference, setTransactionReference] = useState("");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [showCancelConfirm, setShowCancelConfirm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [editDiscount, setEditDiscount] = useState("");
  const [editTax, setEditTax] = useState("");
  const [editNotes, setEditNotes] = useState("");

  useEffect(() => {
    if (!id) {
      setError("Invoice ID is missing.");
      setLoading(false);
      return;
    }

    const loadInvoice = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await billingService.getInvoice(id);
        setInvoice(response);
      } catch (err) {
        console.error("Failed to load invoice:", err);
        setError("Failed to load invoice.");
      } finally {
        setLoading(false);
      }
    };

    loadInvoice();
  }, [id]);

  const handleIssueInvoice = async () => {
    if (!invoice) return;

    try {
      setIssuing(true);
      setError(null);

      await billingService.issueInvoice(invoice.id);

      const refreshedInvoice = await billingService.getInvoice(invoice.id);
      setInvoice(refreshedInvoice);

      setShowIssueConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to issue invoice");
    } finally {
      setIssuing(false);
    }
  };

  const handleCreatePayment = async () => {
    if (!invoice) return;

    const amount = Number.parseFloat(paymentAmount);

    if (!Number.isFinite(amount) || amount < 0.01) {
      setError("Enter a valid payment amount.");
      return;
    }

    const balanceDue = Number(invoice.balanceDue);

    if (!Number.isFinite(balanceDue) || balanceDue < 0.01) {
      setError("There is no outstanding balance on this invoice.");
      return;
    }

    if (amount > balanceDue) {
      setError("Payment amount cannot exceed the balance due.");
      return;
    }

    try {
      setPaying(true);
      setError(null);

      await billingService.createPayment(invoice.id, {
        amount: amount.toFixed(2),
        method: paymentMethod,
        transactionReference: transactionReference.trim() || undefined,
        notes: paymentNotes.trim() || undefined,
      });

      const refreshedInvoice = await billingService.getInvoice(invoice.id);

      setInvoice(refreshedInvoice);

      setShowPaymentForm(false);
      setPaymentAmount("");
      setPaymentMethod("CASH");
      setTransactionReference("");
      setPaymentNotes("");
    } catch (err) {
      console.error("Failed to record payment:", err);

      setError(err instanceof Error ? err.message : "Failed to record payment");
    } finally {
      setPaying(false);
    }
  };

  const handleCancelInvoice = async () => {
    if (!invoice) return;

    try {
      setCancelling(true);
      setError(null);

      await billingService.cancelInvoice(invoice.id);

      const refreshedInvoice = await billingService.getInvoice(invoice.id);
      setInvoice(refreshedInvoice);

      setShowCancelConfirm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to cancel invoice");
    } finally {
      setCancelling(false);
    }
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="size-6 animate-spin text-teal-600" />
      </div>
    );
  }

  if (error || !invoice) {
    return (
      <div className="space-y-5 pb-6">
        <button
          type="button"
          onClick={() => navigate("/billing")}
          className="inline-flex items-center gap-2 text-sm font-medium text-slate-500 transition hover:text-slate-700"
        >
          <ArrowLeft className="size-4" />
          Back to billing
        </button>

        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
          <p className="text-sm font-semibold text-slate-900">
            Unable to load invoice
          </p>

          <p className="mt-1 text-sm text-slate-500">
            {error ?? "Invoice not found."}
          </p>
        </div>
      </div>
    );
  }

  const handleUpdateInvoice = async () => {
    if (!invoice) return;

    const discount = Number.parseFloat(editDiscount || "0");
    const tax = Number.parseFloat(editTax || "0");

    if (!Number.isFinite(discount) || discount < 0) {
      setError("Enter a valid discount amount.");
      return;
    }

    if (!Number.isFinite(tax) || tax < 0) {
      setError("Enter a valid tax amount.");
      return;
    }

    if (discount > Number(invoice.subtotal)) {
      setError("Discount cannot exceed the invoice subtotal.");
      return;
    }

    try {
      setUpdating(true);
      setError(null);

      const updatedInvoice = await billingService.updateInvoice(invoice.id, {
        discount: discount.toFixed(2),
        tax: tax.toFixed(2),
        notes: editNotes.trim() || undefined,
      });

      setInvoice(updatedInvoice);
      setShowEditForm(false);
    } catch (err) {
      console.error("Failed to update invoice:", err);
      setError(err instanceof Error ? err.message : "Failed to update invoice");
    } finally {
      setUpdating(false);
    }
  };

  return (
    <div className="space-y-5 pb-6">
      {/* Header */}
      <div className="flex items-center gap-3 print-hidden">
        <button
          type="button"
          onClick={() => navigate("/billing")}
          className="inline-flex size-9 items-center justify-center rounded-xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200/80 transition hover:bg-slate-50 hover:text-slate-700 focus:outline-none focus:ring-2 focus:ring-teal-500/20"
        >
          <ArrowLeft className="size-4" />
        </button>

        <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
          <FileText className="size-5" />
        </div>

        <div className="min-w-0">
          <h1 className="truncate text-xl font-semibold tracking-tight text-slate-900">
            {invoice.invoiceNumber}
          </h1>

          <p className="text-sm text-slate-500">
            {formatLabel(invoice.type)} invoice
          </p>
        </div>
      </div>

      {/* Invoice Summary */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-4 p-5 sm:flex-row sm:items-start sm:justify-between sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Invoice
            </p>

            <h2 className="mt-1 text-lg font-semibold text-slate-900">
              {invoice.invoiceNumber}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Created {formatDate(invoice.createdAt)}
            </p>
          </div>

          <div className="print-hidden flex flex-col gap-3 sm:flex-row sm:items-center">
            <InvoiceStatusBadge status={invoice.status} />
            {invoice.status === "DRAFT" && canUpdate && (
              <button
                type="button"
                onClick={() => {
                  setError(null);
                  setEditDiscount(String(invoice.discount));
                  setEditTax(String(invoice.tax));
                  setEditNotes(invoice.notes ?? "");
                  setShowEditForm(true);
                }}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 sm:w-auto"
              >
                Edit Invoice
              </button>
            )}
            {invoice.status === "DRAFT" && canUpdate && (
              <button
                type="button"
                onClick={() => setShowIssueConfirm(true)}
                disabled={issuing}
                className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 sm:w-auto"
              >
                <Check className="h-4 w-4" />
                Issue Invoice
              </button>
            )}
            {["ISSUED", "PARTIALLY_PAID"].includes(invoice.status) &&
              Number(invoice.balanceDue) > 0 &&
              canUpdate && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setPaymentAmount(String(invoice.balanceDue));
                    setPaymentMethod("CASH");
                    setTransactionReference("");
                    setPaymentNotes("");
                    setShowPaymentForm(true);
                  }}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 sm:w-auto"
                >
                  <Receipt className="h-4 w-4" />
                  Record Payment
                </button>
              )}
            {canUpdate &&
              (invoice.status === "DRAFT" || invoice.status === "ISSUED") && (
                <button
                  type="button"
                  onClick={() => {
                    setError(null);
                    setShowCancelConfirm(true);
                  }}
                  className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-red-600 shadow-sm ring-1 ring-red-200 transition hover:bg-red-50 sm:w-auto"
                >
                  <X className="h-4 w-4" />
                  Cancel Invoice
                </button>
              )}
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 sm:w-auto"
            >
              <FileText className="h-4 w-4" />
              Print Invoice
            </button>
          </div>
        </div>

        <div className="px-5 sm:px-6">
          <span className="block h-[2px] bg-slate-200/30" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3">
          <div className="p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Total
            </p>

            <p className="mt-2 text-xl font-semibold text-slate-900">
              {formatCurrency(invoice.total)}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Amount paid
            </p>

            <p className="mt-2 text-xl font-semibold text-emerald-600">
              {formatCurrency(invoice.amountPaid)}
            </p>
          </div>

          <div className="p-5 sm:p-6">
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Balance due
            </p>

            <p className="mt-2 text-xl font-semibold text-slate-900">
              {formatCurrency(invoice.balanceDue)}
            </p>
          </div>
        </div>

        <div className="px-5 sm:px-6">
          <span className="block h-[2px] bg-slate-200/30" />
        </div>

        <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-2 sm:p-6">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Issued date
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
              {invoice.issuedAt ? formatDate(invoice.issuedAt) : "Not issued"}
            </p>
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Last updated
            </p>

            <p className="mt-1 text-sm font-medium text-slate-700">
              {formatDate(invoice.updatedAt)}
            </p>
          </div>
        </div>
      </div>

      {/* Patient + Appointment */}
      <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-slate-100 sm:p-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Patient
            </p>

            <p className="mt-2 text-sm font-semibold text-slate-900">
              {invoice.patient
                ? `${invoice.patient.firstName} ${invoice.patient.lastName}`
                : "—"}
            </p>

            {invoice.patient && (
              <p className="mt-1 text-xs text-slate-500">
                Patient ID: {invoice.patient.patientNumber}
              </p>
            )}
          </div>

          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.08em] text-slate-400">
              Appointment
            </p>

            {invoice.appointment ? (
              <>
                <p className="mt-2 text-sm font-semibold text-slate-900">
                  {formatDate(invoice.appointment.appointmentDate)}
                </p>

                <p className="mt-1 text-xs text-slate-500">
                  Status:{" "}
                  <span className="font-medium text-slate-600">
                    {formatLabel(invoice.appointment.status)}
                  </span>
                </p>
              </>
            ) : (
              <p className="mt-2 text-sm text-slate-500">
                No appointment information
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Invoice Items */}
      <div className="print-compact overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="print-compact p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Invoice items
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Services and charges included in this invoice.
          </p>
        </div>

        {/* Desktop */}
        <div className="hidden md:block print:block">
          <div className="grid grid-cols-[minmax(0,1fr)_100px_140px_140px] gap-4 bg-slate-50/50 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
            <span>Description</span>
            <span className="text-right">Quantity</span>
            <span className="text-right">Unit price</span>
            <span className="text-right">Amount</span>
          </div>

          <div>
            {invoice.items.map((item, index) => (
              <div
                key={item.id}
                className="relative grid grid-cols-[minmax(0,1fr)_100px_140px_140px] gap-4 px-6 py-4 transition-colors duration-150 hover:bg-slate-50/40"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-slate-700">
                    {item.description}
                  </p>
                </div>

                <p className="text-right text-sm text-slate-600">
                  {item.quantity}
                </p>

                <p className="text-right text-sm text-slate-600">
                  {formatCurrency(item.unitPrice)}
                </p>

                <p className="text-right text-sm font-semibold text-slate-700">
                  {formatCurrency(item.amount)}
                </p>

                {index < invoice.items.length - 1 && (
                  <span
                    aria-hidden="true"
                    className="pointer-events-none absolute inset-x-6 bottom-0 h-[2px] bg-slate-200/30"
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Mobile */}
        <div className="space-y-3 p-4 md:hidden print:hidden">
          {invoice.items.map((item) => (
            <div key={item.id} className="rounded-xl bg-slate-50/80 p-4">
              <p className="text-sm font-medium text-slate-800">
                {item.description}
              </p>

              <div className="mt-3 grid grid-cols-3 gap-3">
                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Quantity
                  </p>

                  <p className="mt-1 text-sm text-slate-600">{item.quantity}</p>
                </div>

                <div>
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Unit price
                  </p>

                  <p className="mt-1 text-sm text-slate-600">
                    {formatCurrency(item.unitPrice)}
                  </p>
                </div>

                <div className="text-right">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                    Amount
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-700">
                    {formatCurrency(item.amount)}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Totals */}
        <div className="p-5 sm:p-6">
          <div className="ml-auto w-full space-y-3 sm:max-w-sm">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Subtotal</span>

              <span className="font-medium text-slate-700">
                {formatCurrency(invoice.subtotal)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Discount</span>

              <span className="font-medium text-slate-700">
                -{formatCurrency(invoice.discount)}
              </span>
            </div>

            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-500">Tax</span>

              <span className="font-medium text-slate-700">
                {formatCurrency(invoice.tax)}
              </span>
            </div>

            <div className="pt-2">
              <span className="mb-3 block h-[2px] bg-slate-200/30" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-semibold text-slate-800">
                  Grand total
                </span>

                <span className="text-lg font-bold text-slate-900">
                  {formatCurrency(invoice.total)}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Payment History */}
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 print-hidden">
        <div className="p-5 sm:p-6">
          <h2 className="text-base font-semibold text-slate-900">
            Payment history
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            Payments recorded against this invoice.
          </p>
        </div>

        {invoice.payments.length === 0 ? (
          <div className="px-6 py-10 text-center">
            <p className="text-sm font-medium text-slate-600">
              No payments recorded
            </p>

            <p className="mt-1 text-sm text-slate-400">
              Payments made against this invoice will appear here.
            </p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden md:block">
              <div className="grid grid-cols-[140px_140px_minmax(0,1fr)_130px_140px] gap-4 bg-slate-50/50 px-6 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                <span>Date</span>
                <span>Method</span>
                <span>Reference</span>
                <span>Status</span>
                <span className="text-right">Amount</span>
              </div>

              {invoice.payments.map((payment, index) => (
                <div
                  key={payment.id}
                  className="relative grid grid-cols-[140px_140px_minmax(0,1fr)_130px_140px] gap-4 px-6 py-4"
                >
                  <p className="text-sm text-slate-600">
                    {formatDate(payment.paidAt)}
                  </p>

                  <p className="text-sm font-medium text-slate-700">
                    {formatLabel(payment.method)}
                  </p>

                  <p className="truncate text-sm text-slate-500">
                    {payment.transactionReference || "—"}
                  </p>

                  <span className="inline-flex h-fit w-fit rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                    {formatLabel(payment.status)}
                  </span>

                  <p className="text-right text-sm font-semibold text-slate-700">
                    {formatCurrency(payment.amount)}
                  </p>

                  {index < invoice.payments.length - 1 && (
                    <span
                      aria-hidden="true"
                      className="pointer-events-none absolute inset-x-6 bottom-0 h-[2px] bg-slate-200/30"
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Mobile */}
            <div className="space-y-3 p-4 md:hidden">
              {invoice.payments.map((payment) => (
                <div key={payment.id} className="rounded-xl bg-slate-50/80 p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-800">
                        {formatCurrency(payment.amount)}
                      </p>

                      <p className="mt-1 text-xs text-slate-500">
                        {formatDate(payment.paidAt)}
                      </p>
                    </div>

                    <span className="inline-flex rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200/70">
                      {formatLabel(payment.status)}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Method
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {formatLabel(payment.method)}
                      </p>
                    </div>

                    <div>
                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Reference
                      </p>

                      <p className="mt-1 truncate text-sm text-slate-600">
                        {payment.transactionReference || "—"}
                      </p>
                    </div>
                  </div>

                  {payment.notes && (
                    <div className="mt-3 pt-3">
                      <span className="mb-3 block h-[2px] bg-slate-200/30" />

                      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
                        Notes
                      </p>

                      <p className="mt-1 text-sm text-slate-600">
                        {payment.notes}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}
      </div>
      {showIssueConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl ring-1 ring-slate-100">
            <div className="flex items-start gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle className="h-5 w-5" />
              </div>

              <div>
                <h3 className="text-base font-semibold text-slate-900">
                  Issue invoice?
                </h3>

                <p className="mt-1 text-sm leading-6 text-slate-500">
                  This will change the invoice status from Draft to Issued.
                </p>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => setShowIssueConfirm(false)}
                disabled={issuing}
                className="inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold text-slate-600 ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleIssueInvoice}
                disabled={issuing}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {issuing && <Loader2 className="h-4 w-4 animate-spin" />}
                {issuing ? "Issuing..." : "Confirm Issue"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentForm && invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-100">
            {/* Header */}
            <div className="bg-white px-6 py-5">
              <h3 className="text-base font-semibold text-slate-900">
                Record Payment
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Balance due:{" "}
                <span className="font-semibold text-slate-700">
                  {formatCurrency(invoice.balanceDue)}
                </span>
              </p>
            </div>

            {/* Form */}
            <div className="space-y-4 px-6 py-5">
              {/* Amount */}
              <div>
                <label
                  htmlFor="payment-amount"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Amount
                </label>

                <input
                  id="payment-amount"
                  type="number"
                  min="0"
                  max={Number(invoice.balanceDue)}
                  step="0.01"
                  value={paymentAmount}
                  onChange={(event) => setPaymentAmount(event.target.value)}
                  placeholder="Enter payment amount"
                  className="h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Payment Method */}
              <div>
                <label
                  htmlFor="payment-method"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Payment Method
                </label>

                <select
                  id="payment-method"
                  value={paymentMethod}
                  onChange={(event) =>
                    setPaymentMethod(
                      event.target.value as
                        | "CASH"
                        | "CARD"
                        | "UPI"
                        | "BANK_TRANSFER"
                        | "OTHER",
                    )
                  }
                  className="h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-teal-500"
                >
                  <option value="CASH">Cash</option>
                  <option value="CARD">Card</option>
                  <option value="UPI">UPI</option>
                  <option value="BANK_TRANSFER">Bank Transfer</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              {/* Transaction Reference */}
              <div>
                <label
                  htmlFor="transaction-reference"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Transaction Reference
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <input
                  id="transaction-reference"
                  type="text"
                  value={transactionReference}
                  onChange={(event) =>
                    setTransactionReference(event.target.value)
                  }
                  placeholder="Transaction / reference number"
                  className="h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500"
                />
              </div>

              {/* Notes */}
              <div>
                <label
                  htmlFor="payment-notes"
                  className="mb-1.5 block text-sm font-medium text-slate-700"
                >
                  Notes
                  <span className="ml-1 font-normal text-slate-400">
                    (Optional)
                  </span>
                </label>

                <textarea
                  id="payment-notes"
                  rows={3}
                  value={paymentNotes}
                  onChange={(event) => setPaymentNotes(event.target.value)}
                  placeholder="Add payment notes"
                  className="w-full resize-none rounded-xl bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowPaymentForm(false)}
                disabled={paying}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCreatePayment}
                disabled={paying}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {paying && <Loader2 className="h-4 w-4 animate-spin" />}
                {paying ? "Recording..." : "Record Payment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showCancelConfirm && invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-100">
            <div className="px-6 py-5">
              <div className="flex items-start gap-3">
                <div className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-red-50 text-red-600">
                  <X className="h-5 w-5" />
                </div>

                <div>
                  <h3 className="text-base font-semibold text-slate-900">
                    Cancel Invoice
                  </h3>

                  <p className="mt-1 text-sm leading-5 text-slate-500">
                    Are you sure you want to cancel invoice{" "}
                    <span className="font-semibold text-slate-700">
                      {invoice.invoiceNumber}
                    </span>
                    ?
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowCancelConfirm(false)}
                disabled={cancelling}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:opacity-60"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleCancelInvoice}
                disabled={cancelling}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-red-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {cancelling && <Loader2 className="h-4 w-4 animate-spin" />}
                {cancelling ? "Cancelling..." : "Confirm Cancel"}
              </button>
            </div>
          </div>
        </div>
      )}
      {showEditForm && invoice && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/30 p-4">
          <div className="w-full max-w-md overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-slate-100">
            <div className="px-6 py-5">
              <h3 className="text-base font-semibold text-slate-900">
                Edit Invoice
              </h3>

              <p className="mt-1 text-sm text-slate-500">
                Update discount, tax, or notes for{" "}
                <span className="font-semibold text-slate-700">
                  {invoice.invoiceNumber}
                </span>
              </p>
            </div>

            <div className="space-y-4 px-6 py-5">
              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Discount
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editDiscount}
                  onChange={(event) => setEditDiscount(event.target.value)}
                  className="h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Tax
                </label>

                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={editTax}
                  onChange={(event) => setEditTax(event.target.value)}
                  className="h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-teal-500"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Notes
                </label>

                <textarea
                  rows={3}
                  value={editNotes}
                  onChange={(event) => setEditNotes(event.target.value)}
                  className="w-full resize-none rounded-xl bg-white px-3 py-2.5 text-sm text-slate-700 shadow-sm ring-1 ring-slate-200 outline-none transition focus:ring-2 focus:ring-teal-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-3 bg-slate-50/50 px-6 py-4">
              <button
                type="button"
                onClick={() => setShowEditForm(false)}
                disabled={updating}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleUpdateInvoice}
                disabled={updating}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {updating && <Loader2 className="h-4 w-4 animate-spin" />}

                {updating ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
