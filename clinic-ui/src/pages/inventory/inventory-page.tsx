import {
  AlertCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Package,
  Plus,
  RefreshCw,
  Search,
  X,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

import { useAuth } from "@/auth/auth-context";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { PageLoader } from "@/components/ui/page-loader";
import { medicineService } from "@/services/medicine-service";
import { inventoryService } from "@/services/inventory-service";
import type { Medicine } from "@/types/medicine";
import type {
  CreateStockReceiptItem,
  InventoryBatch,
  InventorySummary,
  InventoryTransaction,
  StockReceipt,
} from "@/types/inventory";

const PAGE_SIZE = 10;

type Tab = "stock" | "alerts" | "transactions" | "receipts";

const emptyItem: CreateStockReceiptItem = {
  medicineId: "",
  batchNumber: "",
  expiryDate: "",
  quantity: 1,
  purchasePrice: 0,
  sellingPrice: 0,
  reorderLevel: 0,
};

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(value));
}

function money(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    minimumFractionDigits: 2,
  }).format(value);
}

function transactionLabel(type: InventoryTransaction["type"]) {
  return type.replaceAll("_", " ").toLowerCase().replace(/\b\w/g, (letter) =>
    letter.toUpperCase(),
  );
}

function transactionTone(type: InventoryTransaction["type"]) {
  if (type === "DISPENSE" || type === "ADJUSTMENT_OUT" || type === "EXPIRED") {
    return "bg-rose-50 text-rose-700 ring-rose-100";
  }
  if (type === "RETURN") return "bg-sky-50 text-sky-700 ring-sky-100";
  return "bg-emerald-50 text-emerald-700 ring-emerald-100";
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
  const selected = options.find((option) => option.value === value);

  useEffect(() => {
    const close = (event: PointerEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node))
        setOpen(false);
    };
    document.addEventListener("pointerdown", close);
    return () => document.removeEventListener("pointerdown", close);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-xl bg-white px-3.5 text-left text-sm text-slate-600 outline-none ring-1 ring-slate-200/70 transition focus:ring-2 focus:ring-teal-500/20"
      >
        <span className={!selected ? "text-slate-400" : ""}>
          {selected?.label ?? "Select"}
        </span>
        <ChevronDown className="size-4 text-slate-400" />
      </button>
      {open && (
        <div className="absolute inset-x-0 top-full z-30 mt-2 max-h-60 overflow-auto rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200/70">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`w-full rounded-lg px-3 py-2.5 text-left text-sm transition ${
                option.value === value
                  ? "bg-teal-50 font-medium text-teal-700"
                  : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function SummaryCard({
  label,
  value,
  hint,
  tone = "teal",
}: {
  label: string;
  value: number;
  hint?: string;
  tone?: "teal" | "amber" | "rose";
}) {
  const iconClass =
    tone === "amber"
      ? "bg-amber-50 text-amber-600"
      : tone === "rose"
        ? "bg-rose-50 text-rose-600"
        : "bg-teal-50 text-teal-600";

  return (
    <div className="rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium text-slate-400">{label}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-slate-800">
            {value.toLocaleString("en-IN")}
          </p>
          {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
        </div>
        <div
          className={`flex size-10 items-center justify-center rounded-xl ${iconClass}`}
        >
          <Package className="size-5" />
        </div>
      </div>
    </div>
  );
}

function StockAlertList({
  title,
  description,
  batches,
  tone,
  action,
}: {
  title: string;
  description: string;
  batches: InventoryBatch[];
  tone: "amber" | "rose";
  action?: (batch: InventoryBatch) => void;
}) {
  const accent =
    tone === "amber"
      ? "bg-amber-50 text-amber-700 ring-amber-100"
      : "bg-rose-50 text-rose-700 ring-rose-100";

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)]">
      <div className="bg-[#f8fcfb] px-5 py-4">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold text-slate-700">{title}</h2>
          <span className={`rounded-lg px-2 py-1 text-xs font-semibold ring-1 ${accent}`}>
            {batches.length}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-400">{description}</p>
      </div>
      {batches.length === 0 ? (
        <p className="px-5 py-8 text-center text-xs text-slate-400">
          Nothing needs attention.
        </p>
      ) : (
        <div className="space-y-px bg-[#f8fcfb]">
          {batches.map((batch) => (
            <div key={batch.id} className="bg-white px-5 py-3.5">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-slate-700">
                    {batch.medicineName}
                  </p>
                  <p className="mt-1 text-xs text-slate-400">
                    {batch.batchNumber} · expires {formatDate(batch.expiryDate)}
                  </p>
                </div>
                <span className="shrink-0 text-sm font-semibold text-slate-700">
                  {batch.quantity}
                </span>
              </div>
              {action && (
                <button
                  type="button"
                  onClick={() => action(batch)}
                  className="mt-3 rounded-lg px-2.5 py-1.5 text-xs font-semibold text-rose-700 ring-1 ring-rose-200 transition hover:bg-rose-50"
                >
                  Write off expired stock
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export function InventoryPage() {
  const { hasPermission } = useAuth();
  const canRead = hasPermission("INVENTORY_READ");
  const canReceive = hasPermission("INVENTORY_UPDATE");

  const [tab, setTab] = useState<Tab>("stock");
  const [summary, setSummary] = useState<InventorySummary | null>(null);
  const [batches, setBatches] = useState<InventoryBatch[]>([]);
  const [receipts, setReceipts] = useState<StockReceipt[]>([]);
  const [transactions, setTransactions] = useState<InventoryTransaction[]>([]);
  const [lowStockBatches, setLowStockBatches] = useState<InventoryBatch[]>([]);
  const [expiringBatches, setExpiringBatches] = useState<InventoryBatch[]>([]);
  const [expiredBatches, setExpiredBatches] = useState<InventoryBatch[]>([]);
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [page, setPage] = useState(1);
  const [receiptPage, setReceiptPage] = useState(1);
  const [transactionPage, setTransactionPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [receiptTotalPages, setReceiptTotalPages] = useState(0);
  const [transactionTotalPages, setTransactionTotalPages] = useState(0);
  const [search, setSearch] = useState("");
  const [receiptSearch, setReceiptSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [receiptOpen, setReceiptOpen] = useState(false);
  const [selectedReceipt, setSelectedReceipt] = useState<StockReceipt | null>(
    null,
  );
  const [error, setError] = useState("");
  const [formError, setFormError] = useState("");
  const [success, setSuccess] = useState("");

  const [supplierName, setSupplierName] = useState("");
  const [supplierInvoiceNumber, setSupplierInvoiceNumber] = useState("");
  const [notes, setNotes] = useState("");
  const [items, setItems] = useState<CreateStockReceiptItem[]>([]);
  const [item, setItem] = useState<CreateStockReceiptItem>(emptyItem);
  const [medicineOpen, setMedicineOpen] = useState(false);
  const medicineDropdownRef = useRef<HTMLDivElement>(null);

  const selectedMedicine = medicines.find(
    (medicine) => medicine.id === item.medicineId,
  );

  useEffect(() => {
    const closeMedicineDropdown = (event: PointerEvent) => {
      if (
        medicineDropdownRef.current &&
        !medicineDropdownRef.current.contains(event.target as Node)
      ) {
        setMedicineOpen(false);
      }
    };

    document.addEventListener("pointerdown", closeMedicineDropdown);

    return () => {
      document.removeEventListener("pointerdown", closeMedicineDropdown);
    };
  }, []);

  const loadData = useCallback(
    async (
      showRefresh = false,
      overrides?: {
        stockPage?: number;
        stockSearch?: string;
        receiptPage?: number;
        receiptSearch?: string;
        transactionPage?: number;
      },
    ) => {
      if (!canRead) return;

      const requestedStockPage = overrides?.stockPage ?? page;
      const requestedStockSearch = overrides?.stockSearch ?? search.trim();
      const requestedReceiptPage = overrides?.receiptPage ?? receiptPage;
      const requestedReceiptSearch =
        overrides?.receiptSearch ?? receiptSearch.trim();
      const requestedTransactionPage =
        overrides?.transactionPage ?? transactionPage;

      try {
        if (showRefresh) setRefreshing(true);
        else setLoading(true);

        setError("");

        const [
          summaryResult,
          stockResult,
          receiptResult,
          transactionResult,
          lowStockResult,
          expiringResult,
          expiredResult,
        ] =
          await Promise.allSettled([
            inventoryService.getSummary(),

            // Ask the backend for active batches with stock remaining.
            // This preserves correct pagination and avoids client-side filtering.
            inventoryService.getBatches({
              page: requestedStockPage,
              limit: PAGE_SIZE,
              search: requestedStockSearch || undefined,
              isActive: true,
              lowStock: false,
            }),

            inventoryService.getReceipts({
              page: requestedReceiptPage,
              limit: PAGE_SIZE,
              receiptNumber: requestedReceiptSearch || undefined,
            }),

            inventoryService.getTransactions({
              page: requestedTransactionPage,
              limit: PAGE_SIZE,
            }),
            inventoryService.getLowStock(),
            inventoryService.getExpiring(),
            inventoryService.getExpired(),
          ]);

        if (summaryResult.status === "fulfilled") {
          setSummary(summaryResult.value);
        }

        if (stockResult.status === "fulfilled") {
          const result = stockResult.value;

          // The backend applies the current-stock filter using:
          // isActive=true and lowStock=false (quantity > 0).
          // Do not filter the paginated response on the client, otherwise a
          // page containing zero-stock batches could incorrectly appear empty.
          setBatches(result.data ?? []);
          setTotalPages(result.totalPages ?? 0);
        } else {
          const reason = stockResult.reason;
          const message =
            reason?.response?.data?.message ||
            reason?.message ||
            "Unable to load current stock.";
          throw new Error(message);
        }

        if (receiptResult.status === "fulfilled") {
          setReceipts(receiptResult.value.data ?? []);
          setReceiptTotalPages(receiptResult.value.totalPages ?? 0);
        }

        if (transactionResult.status === "fulfilled") {
          setTransactions(transactionResult.value.data ?? []);
          setTransactionTotalPages(transactionResult.value.totalPages ?? 0);
        }

        if (lowStockResult.status === "fulfilled") {
          setLowStockBatches(lowStockResult.value);
        }
        if (expiringResult.status === "fulfilled") {
          setExpiringBatches(expiringResult.value);
        }
        if (expiredResult.status === "fulfilled") {
          setExpiredBatches(expiredResult.value);
        }
      } catch (err: any) {
        console.error("Unable to load inventory.", err);

        const message =
          err?.response?.data?.message ||
          err?.message ||
          "Unable to load inventory.";

        setError(message);
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [canRead, page, receiptPage, transactionPage, search, receiptSearch],
  );

  useEffect(() => {
    void medicineService
      .getMedicines({ page: 1, limit: 100, isActive: true })
      .then((response) => setMedicines(response.data ?? []))
      .catch(() => setMedicines([]));
  }, []);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void loadData();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [loadData]);

  const resetForm = () => {
    setSupplierName("");
    setSupplierInvoiceNumber("");
    setNotes("");
    setItems([]);
    setItem(emptyItem);
    setMedicineOpen(false);
    setFormOpen(false);
    setFormError("");
  };

  const updateItem = (
    field: keyof CreateStockReceiptItem,
    value: string | number,
  ) => {
    setFormError("");
    setItem((current) => ({ ...current, [field]: value }));
  };

  const addItem = () => {
    if (!item.medicineId) return setFormError("Select a medicine.");
    if (!item.batchNumber.trim())
      return setFormError("Batch number is required.");
    if (!item.expiryDate) return setFormError("Expiry date is required.");
    if (item.quantity < 1) return setFormError("Quantity must be at least 1.");
    if (item.purchasePrice < 0 || item.sellingPrice < 0)
      return setFormError("Prices cannot be negative.");
    if (item.sellingPrice < item.purchasePrice)
      return setFormError("Selling price cannot be lower than purchase price.");
    if (
      items.some(
        (existing) =>
          existing.medicineId === item.medicineId &&
          existing.batchNumber.trim().toLowerCase() ===
            item.batchNumber.trim().toLowerCase(),
      )
    ) {
      return setFormError("This medicine and batch are already added.");
    }
    setItems((current) => [
      ...current,
      {
        ...item,
        batchNumber: item.batchNumber.trim(),
        quantity: Number(item.quantity),
        purchasePrice: Number(item.purchasePrice),
        sellingPrice: Number(item.sellingPrice),
        reorderLevel: Number(item.reorderLevel ?? 0),
      },
    ]);
    setItem(emptyItem);
    setMedicineOpen(false);
    setFormError("");
  };

  const receiptTotal = useMemo(
    () =>
      items.reduce(
        (total, current) => total + current.quantity * current.purchasePrice,
        0,
      ),
    [items],
  );

  const handleReceive = async () => {
    if (!items.length)
      return setFormError("Add at least one medicine to the receipt.");
    try {
      setSaving(true);
      setFormError("");
      await inventoryService.createReceipt({
        supplierName: supplierName.trim() || undefined,
        supplierInvoiceNumber: supplierInvoiceNumber.trim() || undefined,
        notes: notes.trim() || undefined,
        items,
      });
      resetForm();

      // Move both lists to their first page and explicitly reload page 1.
      // This avoids React state-update timing causing a refresh of the old page.
      setPage(1);
      setReceiptPage(1);

      setSuccess("Stock received successfully.");
      window.setTimeout(() => setSuccess(""), 3500);

      await loadData(true, {
        stockPage: 1,
        stockSearch: search.trim(),
        receiptPage: 1,
        receiptSearch: receiptSearch.trim(),
      });
    } catch (err: any) {
      setFormError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to receive stock.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleMarkExpired = async (batch: InventoryBatch) => {
    if (
      !window.confirm(
        `Write off ${batch.quantity} units of ${batch.medicineName} (batch ${batch.batchNumber}) as expired? This will remove the batch from available stock.`,
      )
    ) {
      return;
    }

    try {
      setRefreshing(true);
      setError("");
      await inventoryService.markExpired(batch.id);
      setSuccess(`${batch.medicineName} batch ${batch.batchNumber} was written off as expired.`);
      window.setTimeout(() => setSuccess(""), 3500);
      await loadData(true);
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to mark the batch as expired.",
      );
    } finally {
      setRefreshing(false);
    }
  };

  if (!canRead) {
    return (
      <div className="rounded-2xl bg-white p-8 text-center text-sm text-slate-500 ring-1 ring-slate-100">
        You do not have permission to view inventory.
      </div>
    );
  }

  return (
    <div className="space-y-6 pb-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="flex size-9 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
              <Package className="size-[18px]" />
            </div>
            <h1 className="text-xl font-semibold tracking-tight text-slate-800">
              Inventory
            </h1>
          </div>
          <p className="mt-1 pl-11 text-sm text-slate-400">
            Manage pharmacy stock, batches and receiving.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void loadData(true)}
            disabled={refreshing}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-white px-3.5 text-sm font-medium text-slate-600 shadow-sm ring-1 ring-slate-200/70 transition hover:bg-slate-50 disabled:opacity-60"
          >
            <RefreshCw
              className={`size-4 ${refreshing ? "animate-spin" : ""}`}
            />{" "}
            Refresh
          </button>
          {canReceive && (
            <button
              type="button"
              onClick={() => {
                setError("");
                setFormError("");
                setFormOpen(true);
              }}
              className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700"
            >
              <Plus className="size-4" /> Receive stock
            </button>
          )}
        </div>
      </div>

      {error && (
        <div className="flex items-start justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
          <div className="flex gap-2">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            <span>{error}</span>
          </div>
          <button type="button" onClick={() => setError("")}>
            <X className="size-4" />
          </button>
        </div>
      )}
      {success && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
          <CheckCircle2 className="size-4" />
          {success}
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <SummaryCard
          label="Medicines"
          value={summary?.totalMedicines ?? 0}
          hint="Active catalogue"
        />
        <SummaryCard
          label="Stock units"
          value={summary?.totalUnits ?? 0}
          hint={`${summary?.totalBatches ?? 0} active batches`}
        />
        <SummaryCard
          label="Low stock"
          value={summary?.lowStockBatches ?? 0}
          hint="Needs attention"
          tone="amber"
        />
        <SummaryCard
          label="Expiring soon"
          value={summary?.expiringSoonBatches ?? 0}
          hint="Within 90 days"
          tone="rose"
        />
      </div>

      <div className="-mx-1 overflow-x-auto px-1 pb-1 [scrollbar-width:none] sm:mx-0 sm:px-0">
        <div className="flex w-max min-w-full items-center gap-1 rounded-xl bg-slate-100/70 p-1 sm:min-w-0 sm:w-fit">
        {(
          [
            ["stock", "Current stock"],
            ["alerts", "Stock alerts"],
            ["transactions", "Transactions"],
            ["receipts", "Stock receipts"],
          ] as const
        ).map(([value, label]) => (
          <button
            key={value}
            type="button"
            onClick={() => setTab(value)}
            className={`shrink-0 whitespace-nowrap rounded-lg px-4 py-2 text-sm font-medium transition ${tab === value ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
          >
            {label}
          </button>
        ))}
        </div>
      </div>

      {tab === "stock" ? (
        <section className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
            <input
              value={search}
              onChange={(event) => {
                setSearch(event.target.value);
                setPage(1);
              }}
              placeholder="Search medicine or batch..."
              className="h-10 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none ring-1 ring-slate-200/70 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          {loading ? (
            <PageLoader
              message="Loading inventory..."
              className="min-h-[320px]"
            />
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60">
              <div className="hidden grid-cols-[2fr_1fr_1fr_0.8fr_1fr] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:grid">
                <span>Medicine</span>
                <span>Batch</span>
                <span>Expiry</span>
                <span>Stock</span>
                <span>Sell price</span>
              </div>
              {batches.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
                  <div className="flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                    <Package className="size-5" />
                  </div>
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No current stock
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-slate-400">
                    No active medicine batches with available units were found.
                    Receive stock or adjust an existing batch to make it
                    available for dispensing.
                  </p>
                </div>
              ) : (
                batches.map((row) => (
                  <div
                    key={row.id}
                    className="grid gap-3 px-4 py-4 transition hover:bg-slate-50/60 md:grid-cols-[2fr_1fr_1fr_0.8fr_1fr] md:items-center md:px-5 md:ring-1 md:ring-slate-100/70"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {row.medicineName}
                      </p>
                    </div>
                    <div>
                      <span className="rounded-lg bg-slate-50 px-2.5 py-1 font-mono text-xs text-slate-500">
                        {row.batchNumber}
                      </span>
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(row.expiryDate)}
                    </div>
                    <div>
                      <span
                        className={`text-sm font-semibold ${row.isLowStock ? "text-amber-600" : "text-slate-700"}`}
                      >
                        {row.quantity}
                      </span>
                      <span className="ml-1 text-xs text-slate-400">units</span>
                    </div>
                    <div className="text-sm font-medium text-slate-600">
                      {money(row.sellingPrice)}
                    </div>
                  </div>
                ))
              )}
              {totalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 ring-1 ring-slate-100">
                  <p className="text-xs text-slate-400">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={page <= 1}
                      onClick={() => setPage((current) => current - 1)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={page >= totalPages}
                      onClick={() => setPage((current) => current + 1)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      ) : tab === "alerts" ? (
        <section className="grid gap-4 xl:grid-cols-3">
          <StockAlertList
            title="Low stock"
            description="Active batches at or below their reorder level."
            batches={lowStockBatches}
            tone="amber"
          />
          <StockAlertList
            title="Expiring soon"
            description="Available batches that expire within the next 90 days."
            batches={expiringBatches}
            tone="rose"
          />
          <StockAlertList
            title="Expired stock"
            description="Write off expired batches to remove them from available stock."
            batches={expiredBatches}
            tone="rose"
            action={canReceive ? handleMarkExpired : undefined}
          />
        </section>
      ) : tab === "transactions" ? (
        <section className="space-y-4">
          <div>
            <h2 className="text-sm font-semibold text-slate-700">
              Stock activity
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              Every receipt, dispense, return, adjustment, and expiry write-off is recorded here.
            </p>
          </div>
          {loading ? (
            <PageLoader
              message="Loading stock activity..."
              className="min-h-[320px]"
            />
          ) : (
            <div className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60">
              <div className="hidden grid-cols-[1.6fr_0.9fr_1fr_0.8fr_0.9fr] gap-4 px-5 py-3 text-[11px] font-semibold uppercase tracking-wide text-slate-400 md:grid">
                <span>Medicine</span>
                <span>Activity</span>
                <span>Quantity</span>
                <span>Stock change</span>
                <span>Date</span>
              </div>
              {transactions.length === 0 ? (
                <div className="flex min-h-52 flex-col items-center justify-center px-6 text-center">
                  <Package className="size-7 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No stock activity yet
                  </p>
                  <p className="mt-1 max-w-sm text-xs text-slate-400">
                    Receiving stock and dispensing prescriptions will appear here.
                  </p>
                </div>
              ) : (
                transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="grid gap-3 px-4 py-4 transition hover:bg-slate-50/60 md:grid-cols-[1.6fr_0.9fr_1fr_0.8fr_0.9fr] md:items-center md:px-5 md:ring-1 md:ring-slate-100/70"
                  >
                    <div>
                      <p className="text-sm font-semibold text-slate-700">
                        {transaction.medicineName}
                      </p>
                      <p className="mt-0.5 font-mono text-xs text-slate-400">
                        {transaction.batchNumber}
                      </p>
                    </div>
                    <div>
                      <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-medium ring-1 ${transactionTone(transaction.type)}`}>
                        {transactionLabel(transaction.type)}
                      </span>
                    </div>
                    <div className="text-sm font-semibold text-slate-700">
                      {transaction.type === "DISPENSE" ||
                      transaction.type === "ADJUSTMENT_OUT" ||
                      transaction.type === "EXPIRED"
                        ? "−"
                        : "+"}
                      {transaction.quantity}
                    </div>
                    <div className="text-sm text-slate-500">
                      {transaction.previousQuantity} → {transaction.newQuantity}
                    </div>
                    <div className="text-xs text-slate-500">
                      {formatDate(transaction.createdAt)}
                    </div>
                    {transaction.notes && (
                      <p className="text-xs leading-5 text-slate-400 md:col-span-5">
                        {transaction.notes}
                      </p>
                    )}
                  </div>
                ))
              )}
              {transactionTotalPages > 1 && (
                <div className="flex items-center justify-between px-4 py-3 ring-1 ring-slate-100">
                  <p className="text-xs text-slate-400">
                    Page {transactionPage} of {transactionTotalPages}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={transactionPage <= 1}
                      onClick={() => setTransactionPage((current) => current - 1)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={transactionPage >= transactionTotalPages}
                      onClick={() => setTransactionPage((current) => current + 1)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      ) : (
        <section className="space-y-4">
          <div className="relative max-w-xl">
            <Search className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-300" />
            <input
              value={receiptSearch}
              onChange={(event) => {
                setReceiptSearch(event.target.value);
                setReceiptPage(1);
              }}
              placeholder="Search receipt number..."
              className="h-10 w-full rounded-xl border-0 bg-white pl-10 pr-4 text-sm text-slate-700 outline-none ring-1 ring-slate-200/70 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20"
            />
          </div>
          {loading ? (
            <PageLoader
              message="Loading stock receipts..."
              className="min-h-[320px]"
            />
          ) : (
            <div className="space-y-3">
              {receipts.length === 0 ? (
                <div className="rounded-2xl bg-white p-10 text-center shadow-sm ring-1 ring-slate-100">
                  <Package className="mx-auto size-7 text-slate-300" />
                  <p className="mt-3 text-sm font-semibold text-slate-700">
                    No stock receipts found
                  </p>
                </div>
              ) : (
                receipts.map((receipt) => (
                  <button
                    key={receipt.id}
                    type="button"
                    onClick={() => {
                      setSelectedReceipt(receipt);
                      setReceiptOpen(true);
                    }}
                    className="block w-full rounded-2xl bg-white p-5 text-left shadow-[0_8px_30px_rgba(15,23,42,0.04)] ring-1 ring-slate-200/60 transition hover:ring-teal-200/70"
                  >
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                      <div>
                        <p className="font-mono text-sm font-semibold text-teal-700">
                          {receipt.receiptNumber}
                        </p>
                        <p className="mt-1 text-xs text-slate-400">
                          {receipt.supplierName || "Supplier not specified"} ·{" "}
                          {formatDate(receipt.createdAt)}
                        </p>
                      </div>
                      <p className="text-sm font-semibold text-slate-700">
                        {money(receipt.totalAmount)}
                      </p>
                    </div>
                    <div className="mt-4 flex flex-wrap gap-2">
                      {receipt.items.map((receiptItem) => (
                        <span
                          key={receiptItem.id}
                          className="rounded-lg bg-slate-50 px-2.5 py-1.5 text-xs text-slate-500"
                        >
                          {receiptItem.medicineName} · +{receiptItem.quantity}
                        </span>
                      ))}
                    </div>
                  </button>
                ))
              )}
              {receiptTotalPages > 1 && (
                <div className="flex items-center justify-between rounded-2xl bg-white px-4 py-3 ring-1 ring-slate-100">
                  <p className="text-xs text-slate-400">
                    Page {receiptPage} of {receiptTotalPages}
                  </p>
                  <div className="flex gap-1">
                    <button
                      type="button"
                      disabled={receiptPage <= 1}
                      onClick={() => setReceiptPage((current) => current - 1)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      type="button"
                      disabled={receiptPage >= receiptTotalPages}
                      onClick={() => setReceiptPage((current) => current + 1)}
                      className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 disabled:opacity-40"
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </section>
      )}

      {receiptOpen && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/20 p-0 backdrop-blur-[1px] sm:items-center sm:p-6">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-auto rounded-t-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-100 sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <p className="font-mono text-sm font-semibold text-teal-700">
                  {selectedReceipt.receiptNumber}
                </p>
                <h2 className="mt-1 text-lg font-semibold text-slate-800">
                  Stock receipt
                </h2>
                <p className="mt-1 text-xs text-slate-400">
                  {selectedReceipt.supplierName || "Supplier not specified"} ·{" "}
                  {formatDate(selectedReceipt.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReceiptOpen(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
              >
                <X className="size-5" />
              </button>
            </div>
            <div className="mt-5 space-y-2">
              {selectedReceipt.items.map((receiptItem) => (
                <div
                  key={receiptItem.id}
                  className="flex items-center justify-between rounded-xl bg-slate-50/70 px-4 py-3"
                >
                  <div>
                    <p className="text-sm font-medium text-slate-700">
                      {receiptItem.medicineName}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Batch {receiptItem.batchNumber} · Exp{" "}
                      {formatDate(receiptItem.expiryDate)}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-slate-700">
                      +{receiptItem.quantity}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      {money(receiptItem.amount)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-5 flex items-center justify-between rounded-xl bg-teal-50 px-4 py-3">
              <span className="text-sm font-medium text-slate-600">
                Receipt total
              </span>
              <span className="text-base font-semibold text-teal-700">
                {money(selectedReceipt.totalAmount)}
              </span>
            </div>
            {selectedReceipt.notes && (
              <p className="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-slate-500">
                {selectedReceipt.notes}
              </p>
            )}
          </div>
        </div>
      )}

      {formOpen && (
        <div className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/20 p-0 backdrop-blur-[1px] sm:items-center sm:p-6">
          <div className="max-h-[92vh] w-full max-w-3xl overflow-auto rounded-t-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-100 sm:rounded-3xl sm:p-6">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-800">
                  Receive stock
                </h2>
                <p className="mt-1 text-sm text-slate-400">
                  Add one or more medicine batches to inventory.
                </p>
              </div>
              <button
                type="button"
                disabled={saving}
                onClick={resetForm}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
              >
                <X className="size-5" />
              </button>
            </div>
            {formError && (
              <div className="mt-5 flex items-start justify-between gap-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 ring-1 ring-red-100">
                <div className="flex gap-2">
                  <AlertCircle className="mt-0.5 size-4 shrink-0" />
                  <span>{formError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setFormError("")}
                  className="shrink-0 rounded-md p-0.5 hover:bg-red-100"
                  aria-label="Dismiss error"
                >
                  <X className="size-4" />
                </button>
              </div>
            )}

            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  Supplier
                </span>
                <input
                  value={supplierName}
                  onChange={(e) => {
                    setFormError("");
                    setSupplierName(e.target.value);
                  }}
                  placeholder="Supplier name"
                  className="h-10 w-full rounded-xl bg-white px-3.5 text-sm outline-none ring-1 ring-slate-200/70 focus:ring-2 focus:ring-teal-500/20"
                />
              </label>
              <label>
                <span className="mb-1.5 block text-xs font-medium text-slate-500">
                  Supplier invoice
                </span>
                <input
                  value={supplierInvoiceNumber}
                  onChange={(e) => {
                    setFormError("");
                    setSupplierInvoiceNumber(e.target.value);
                  }}
                  placeholder="Invoice / reference number"
                  className="h-10 w-full rounded-xl bg-white px-3.5 text-sm outline-none ring-1 ring-slate-200/70 focus:ring-2 focus:ring-teal-500/20"
                />
              </label>
            </div>
            <div className="mt-5 rounded-2xl bg-slate-50/70 p-4 ring-1 ring-slate-100">
              <p className="text-sm font-semibold text-slate-700">
                Add medicine
              </p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div>
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Medicine
                  </span>
                  <div ref={medicineDropdownRef} className="relative">
                    <button
                      type="button"
                      onClick={() => setMedicineOpen((current) => !current)}
                      className="flex h-10 w-full items-center justify-between rounded-xl bg-white px-3.5 text-left text-sm ring-1 ring-slate-200/70"
                    >
                      <span
                        className={
                          selectedMedicine ? "text-slate-700" : "text-slate-400"
                        }
                      >
                        {selectedMedicine?.name ?? "Select medicine"}
                      </span>
                      <ChevronDown className="size-4 text-slate-400" />
                    </button>
                    {medicineOpen && (
                      <div className="absolute inset-x-0 top-full z-40 mt-2 max-h-60 overflow-auto rounded-xl bg-white p-1.5 shadow-xl ring-1 ring-slate-200/70">
                        {medicines.map((medicine) => (
                          <button
                            key={medicine.id}
                            type="button"
                            onClick={() => {
                              setItem((current) => ({
                                ...current,
                                medicineId: medicine.id,
                                sellingPrice:
                                  current.sellingPrice ||
                                  Number(medicine.price),
                              }));
                              setMedicineOpen(false);
                            }}
                            className="block w-full rounded-lg px-3 py-2.5 text-left text-sm text-slate-600 hover:bg-teal-50 hover:text-teal-700"
                          >
                            <span className="font-medium">{medicine.name}</span>
                            {medicine.genericName && (
                              <span className="ml-2 text-xs text-slate-400">
                                {medicine.genericName}
                              </span>
                            )}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Batch number
                  </span>
                  <input
                    value={item.batchNumber}
                    onChange={(e) => updateItem("batchNumber", e.target.value)}
                    placeholder="e.g. PCM-2026-A"
                    className="h-10 w-full rounded-xl bg-white px-3.5 text-sm outline-none ring-1 ring-slate-200/70 focus:ring-2 focus:ring-teal-500/20"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Expiry date
                  </span>
                  <input
                    type="date"
                    value={item.expiryDate}
                    onChange={(e) => updateItem("expiryDate", e.target.value)}
                    className="h-10 w-full rounded-xl bg-white px-3.5 text-sm outline-none ring-1 ring-slate-200/70 focus:ring-2 focus:ring-teal-500/20"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Quantity
                  </span>
                  <input
                    type="number"
                    min={1}
                    value={item.quantity}
                    onChange={(e) =>
                      updateItem("quantity", Number(e.target.value))
                    }
                    className="h-10 w-full rounded-xl bg-white px-3.5 text-sm outline-none ring-1 ring-slate-200/70 focus:ring-2 focus:ring-teal-500/20"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Purchase price
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.purchasePrice}
                    onChange={(e) =>
                      updateItem("purchasePrice", Number(e.target.value))
                    }
                    className="h-10 w-full rounded-xl bg-white px-3.5 text-sm outline-none ring-1 ring-slate-200/70 focus:ring-2 focus:ring-teal-500/20"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Selling price
                  </span>
                  <input
                    type="number"
                    min={0}
                    step="0.01"
                    value={item.sellingPrice}
                    onChange={(e) =>
                      updateItem("sellingPrice", Number(e.target.value))
                    }
                    className="h-10 w-full rounded-xl bg-white px-3.5 text-sm outline-none ring-1 ring-slate-200/70 focus:ring-2 focus:ring-teal-500/20"
                  />
                </label>
                <label>
                  <span className="mb-1.5 block text-xs font-medium text-slate-500">
                    Reorder level
                  </span>
                  <input
                    type="number"
                    min={0}
                    value={item.reorderLevel ?? 0}
                    onChange={(e) =>
                      updateItem("reorderLevel", Number(e.target.value))
                    }
                    className="h-10 w-full rounded-xl bg-white px-3.5 text-sm outline-none ring-1 ring-slate-200/70 focus:ring-2 focus:ring-teal-500/20"
                  />
                </label>
              </div>
              <button
                type="button"
                onClick={addItem}
                className="mt-4 inline-flex h-10 items-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-teal-700 ring-1 ring-teal-200/70 transition hover:bg-teal-50"
              >
                <Plus className="size-4" /> Add to receipt
              </button>
            </div>
            {items.length > 0 && (
              <div className="mt-5">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-semibold text-slate-700">
                    Receipt items
                  </p>
                  <p className="text-sm font-semibold text-teal-700">
                    {money(receiptTotal)}
                  </p>
                </div>
                <div className="mt-3 space-y-2">
                  {items.map((entry, index) => {
                    const medicine = medicines.find(
                      (m) => m.id === entry.medicineId,
                    );
                    return (
                      <div
                        key={`${entry.medicineId}-${entry.batchNumber}`}
                        className="flex items-center justify-between gap-3 rounded-xl bg-slate-50/70 px-3.5 py-3 ring-1 ring-slate-100"
                      >
                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-700">
                            {medicine?.name ?? "Medicine"}
                          </p>
                          <p className="mt-0.5 text-xs text-slate-400">
                            Batch {entry.batchNumber} · {entry.quantity} units ·{" "}
                            {money(entry.purchasePrice)}
                          </p>
                        </div>
                        <button
                          type="button"
                          onClick={() =>
                            setItems((current) =>
                              current.filter(
                                (_, currentIndex) => currentIndex !== index,
                              ),
                            )
                          }
                          className="rounded-lg p-2 text-slate-300 hover:bg-red-50 hover:text-red-500"
                        >
                          <X className="size-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
            <label className="mt-5 block">
              <span className="mb-1.5 block text-xs font-medium text-slate-500">
                Notes
              </span>
              <textarea
                value={notes}
                onChange={(e) => {
                  setFormError("");
                  setNotes(e.target.value);
                }}
                rows={2}
                placeholder="Optional receiving notes"
                className="w-full resize-none rounded-xl bg-white px-3.5 py-3 text-sm outline-none ring-1 ring-slate-200/70 focus:ring-2 focus:ring-teal-500/20"
              />
            </label>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={saving}
                onClick={resetForm}
                className="h-10 rounded-xl px-4 text-sm font-medium text-slate-500 hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving || !items.length}
                onClick={() => void handleReceive()}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 text-sm font-semibold text-white shadow-sm hover:bg-teal-700 disabled:opacity-50"
              >
                {saving && <ButtonSpinner />} Receive stock
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
