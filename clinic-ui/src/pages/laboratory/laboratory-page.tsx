import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ComponentType,
} from "react";
import {
  Activity,
  AlertCircle,
  Beaker,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Eye,
  FlaskConical,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  TestTube2,
  UserRound,
  X,
} from "lucide-react";

import { PageLoader } from "@/components/ui/page-loader";
import { SectionLoader } from "@/components/ui/section-loader";
import { ButtonSpinner } from "@/components/ui/button-spinner";
import { useAuth } from "@/auth/auth-context";
import { laboratoryService } from "@/services/laboratory-service";
import { CreateLabOrderModal } from "./create-lab-order-modal";
import type {
  CreateLabTestRequest,
  LabOrder,
  LabOrderItem,
  LabOrderStatus,
  LabTest,
  LabTestQuery,
} from "@/types/laboratory";

const PAGE_SIZE = 10;

type Tab = "orders" | "tests";
type OrderFilter = "ALL" | LabOrderStatus;
type TestFilter = "ALL" | "ACTIVE" | "INACTIVE";

function safeDate(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function safeDateTime(value?: string | null) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
}

function statusLabel(status: string) {
  return status
    .toLowerCase()
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function StatusBadge({ status }: { status: string }) {
  const classes: Record<string, string> = {
    PENDING: "bg-amber-50 text-amber-700 ring-amber-200/70",
    IN_PROGRESS: "bg-blue-50 text-blue-700 ring-blue-200/70",
    COMPLETED: "bg-emerald-50 text-emerald-700 ring-emerald-200/70",
    CANCELLED: "bg-slate-100 text-slate-600 ring-slate-200/70",
  };

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ${classes[status] ?? classes.CANCELLED}`}
    >
      {statusLabel(status)}
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
    const handler = (event: MouseEvent) => {
      if (!ref.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const selected = options.find((option) => option.value === value);

  return (
    <div ref={ref} className="relative min-w-[150px]">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex h-10 w-full items-center justify-between rounded-xl bg-white px-3 text-sm font-medium text-slate-700 ring-1 ring-slate-200/80 transition hover:ring-teal-200 focus:outline-none focus:ring-2 focus:ring-teal-500/30"
      >
        <span>{selected?.label ?? "Select"}</span>
        <ChevronDown
          className={`size-4 text-slate-400 transition ${open ? "rotate-180" : ""}`}
        />
      </button>
      {open && (
        <div className="absolute left-0 top-11 z-40 w-full overflow-hidden rounded-xl bg-white p-1 shadow-xl ring-1 ring-slate-200/80">
          {options.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
              className={`flex w-full items-center rounded-lg px-3 py-2 text-left text-sm ${option.value === value ? "bg-teal-50 font-semibold text-teal-700" : "text-slate-600 hover:bg-slate-50"}`}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

function ModalShell({
  open,
  title,
  children,
  onClose,
}: {
  open: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center bg-slate-900/20 p-0 backdrop-blur-[2px] md:items-center md:p-6"
      onClick={onClose}
    >
      <div
        className="max-h-[92vh] w-full overflow-y-auto rounded-t-3xl bg-white shadow-2xl ring-1 ring-slate-200/80 md:max-w-2xl md:rounded-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 py-4 ring-1 ring-slate-100">
          <h2 className="text-base font-semibold text-slate-900">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-50 hover:text-slate-600"
          >
            <X className="size-5" />
          </button>
        </div>
        {children}
      </div>
    </div>
  );
}

function ErrorState({
  message,
  onRetry,
}: {
  message: string;
  onRetry: () => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
      <div className="flex size-11 items-center justify-center rounded-xl bg-red-50 text-red-500">
        <AlertCircle className="size-5" />
      </div>
      <p className="max-w-md text-sm text-slate-500">{message}</p>
      <button
        type="button"
        onClick={onRetry}
        className="inline-flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
      >
        <RefreshCw className="size-4" />
        Try again
      </button>
    </div>
  );
}

function OrderDetails({
  order,
  canUpdate,
  onRefresh,
}: {
  order: LabOrder;
  canUpdate: boolean;
  onRefresh: () => Promise<void>;
}) {
  const [resultItem, setResultItem] = useState<LabOrderItem | null>(null);
  const [savingResult, setSavingResult] = useState(false);
  const [resultText, setResultText] = useState("");
  const [resultNotes, setResultNotes] = useState("");
  const [error, setError] = useState("");

  const saveResult = async () => {
    if (!resultItem || !resultText.trim()) return;
    try {
      setSavingResult(true);
      setError("");
      await laboratoryService.saveResult(resultItem.id, {
        result: resultText.trim(),
        ...(resultNotes.trim() ? { notes: resultNotes.trim() } : {}),
      });
      setResultItem(null);
      setResultText("");
      setResultNotes("");
      await onRefresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save the result.",
      );
    } finally {
      setSavingResult(false);
    }
  };

  const moveToProgress = async () => {
    try {
      setError("");
      await laboratoryService.updateOrderStatus(order.id, "IN_PROGRESS");
      await onRefresh();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update the order.",
      );
    }
  };

  return (
    <div className="space-y-5 p-5 md:p-6">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Tests</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {order.items.length}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Completed</p>
          <p className="mt-1 text-lg font-semibold text-slate-900">
            {order.items.filter((item) => item.status === "COMPLETED").length}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Created</p>
          <p className="mt-1 text-sm font-semibold text-slate-900">
            {safeDate(order.createdAt)}
          </p>
        </div>
        <div className="rounded-xl bg-slate-50 p-3">
          <p className="text-xs text-slate-400">Status</p>
          <div className="mt-1">
            <StatusBadge status={order.status} />
          </div>
        </div>
      </div>

      <div className="rounded-2xl bg-white ring-1 ring-slate-100">
        <div className="relative flex items-center justify-between px-4 py-3 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-slate-100">
          <div>
            <p className="text-sm font-semibold text-slate-900">
              Ordered tests
            </p>
            <p className="text-xs text-slate-400">
              Enter or update results for each test.
            </p>
          </div>
          {canUpdate && order.status === "PENDING" && (
            <button
              type="button"
              onClick={() => void moveToProgress()}
              className="rounded-xl bg-teal-600 px-3 py-2 text-xs font-semibold text-white hover:bg-teal-700"
            >
              Start processing
            </button>
          )}
        </div>
        <div>
          {order.items.map((item) => (
            <div
              key={item.id}
              className="relative px-4 py-4 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-slate-100 last:after:hidden"
            >
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-900">
                      {item.labTestName}
                    </span>
                    <span className="text-xs font-medium text-slate-400">
                      {item.labTestCode}
                    </span>
                    <StatusBadge status={item.status} />
                  </div>
                  <p className="mt-1 text-sm text-slate-500">
                    ₹{item.price.toFixed(2)}
                  </p>
                  {item.result && (
                    <div className="mt-3 rounded-xl bg-teal-50/60 p-3">
                      <p className="text-xs font-semibold uppercase tracking-wide text-teal-700">
                        Result
                      </p>
                      <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                        {item.result.result}
                      </p>
                      {item.result.notes && (
                        <p className="mt-2 text-xs text-slate-500">
                          {item.result.notes}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-slate-400">
                        Performed {safeDateTime(item.result.performedAt)}
                      </p>
                    </div>
                  )}
                </div>
                {canUpdate &&
                  item.status !== "CANCELLED" &&
                  order.status !== "CANCELLED" && (
                    <button
                      type="button"
                      onClick={() => {
                        setResultItem(item);
                        setResultText(item.result?.result ?? "");
                        setResultNotes(item.result?.notes ?? "");
                        setError("");
                      }}
                      className="inline-flex shrink-0 items-center justify-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold text-teal-700 ring-1 ring-teal-200 hover:bg-teal-50"
                    >
                      <TestTube2 className="size-4" />
                      {item.result ? "Edit result" : "Enter result"}
                    </button>
                  )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {order.notes && (
        <div className="rounded-2xl bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">
            Order notes
          </p>
          <p className="mt-2 whitespace-pre-wrap text-sm text-slate-600">
            {order.notes}
          </p>
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <ModalShell
        open={Boolean(resultItem)}
        title={resultItem ? `${resultItem.labTestName} result` : "Enter result"}
        onClose={() => !savingResult && setResultItem(null)}
      >
        <div className="space-y-4 p-5">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Result
            </label>
            <textarea
              value={resultText}
              onChange={(event) => setResultText(event.target.value)}
              rows={5}
              autoFocus
              className="w-full resize-none rounded-xl bg-white px-3 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-teal-500/30"
              placeholder="Enter the laboratory result"
            />
          </div>
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Notes{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </label>
            <textarea
              value={resultNotes}
              onChange={(event) => setResultNotes(event.target.value)}
              rows={3}
              className="w-full resize-none rounded-xl bg-white px-3 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-teal-500/30"
              placeholder="Additional interpretation or notes"
            />
          </div>
          <div className="flex justify-end gap-2">
            <button
              type="button"
              disabled={savingResult}
              onClick={() => setResultItem(null)}
              className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={savingResult || !resultText.trim()}
              onClick={() => void saveResult()}
              className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {savingResult && <ButtonSpinner />}Save result
            </button>
          </div>
        </div>
      </ModalShell>
    </div>
  );
}

function TestForm({
  test,
  onSaved,
  onClose,
}: {
  test: LabTest | null;
  onSaved: () => Promise<void>;
  onClose: () => void;
}) {
  const [form, setForm] = useState<CreateLabTestRequest>({
    code: test?.code ?? "",
    name: test?.name ?? "",
    description: test?.description ?? "",
    category: test?.category ?? "",
    price: test?.price ?? 0,
    unit: test?.unit ?? "",
    normalRange: test?.normalRange ?? "",
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const set = <K extends keyof CreateLabTestRequest>(
    key: K,
    value: CreateLabTestRequest[K],
  ) => setForm((current) => ({ ...current, [key]: value }));

  const save = async () => {
    if (!form.code.trim() || !form.name.trim() || Number(form.price) < 0)
      return;
    try {
      setSaving(true);
      setError("");
      const payload = {
        ...form,
        code: form.code.trim(),
        name: form.name.trim(),
        price: Number(form.price),
        ...(form.description?.trim()
          ? { description: form.description.trim() }
          : { description: undefined }),
        ...(form.category?.trim()
          ? { category: form.category.trim() }
          : { category: undefined }),
        ...(form.unit?.trim()
          ? { unit: form.unit.trim() }
          : { unit: undefined }),
        ...(form.normalRange?.trim()
          ? { normalRange: form.normalRange.trim() }
          : { normalRange: undefined }),
      };
      if (test) await laboratoryService.updateTest(test.id, payload);
      else await laboratoryService.createTest(payload);
      await onSaved();
      onClose();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to save the laboratory test.",
      );
    } finally {
      setSaving(false);
    }
  };

  return (
    <ModalShell
      open
      title={test ? "Edit laboratory test" : "Add laboratory test"}
      onClose={() => !saving && onClose()}
    >
      <div className="space-y-4 p-5">
        <div className="grid gap-4 sm:grid-cols-2">
          {(["code", "name", "category", "unit", "normalRange"] as const).map(
            (key) => (
              <div key={key}>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  {key === "normalRange"
                    ? "Normal range"
                    : key.charAt(0).toUpperCase() + key.slice(1)}
                  {(key === "code" || key === "name") && (
                    <span className="text-red-500"> *</span>
                  )}
                </label>
                <input
                  value={String(form[key] ?? "")}
                  onChange={(event) => set(key, event.target.value)}
                  className="h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-teal-500/30"
                />
              </div>
            ),
          )}
          <div>
            <label className="mb-1.5 block text-sm font-medium text-slate-700">
              Price <span className="text-red-500">*</span>
            </label>
            <input
              type="number"
              min="0"
              step="0.01"
              value={form.price}
              onChange={(event) => set("price", Number(event.target.value))}
              className="h-10 w-full rounded-xl bg-white px-3 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-teal-500/30"
            />
          </div>
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Description
          </label>
          <textarea
            rows={3}
            value={form.description ?? ""}
            onChange={(event) => set("description", event.target.value)}
            className="w-full resize-none rounded-xl bg-white px-3 py-2.5 text-sm text-slate-800 ring-1 ring-slate-200 outline-none focus:ring-2 focus:ring-teal-500/30"
          />
        </div>
        {error && (
          <div className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </div>
        )}
        <div className="flex justify-end gap-2">
          <button
            type="button"
            disabled={saving}
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50"
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving || !form.code.trim() || !form.name.trim()}
            onClick={() => void save()}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50"
          >
            {saving && <ButtonSpinner />}Save test
          </button>
        </div>
      </div>
    </ModalShell>
  );
}

export function LaboratoryPage() {
  const { hasPermission } = useAuth();
  const canReadOrders = hasPermission("LAB_READ");
  const canCreate = hasPermission("LAB_CREATE");
  const canUpdate = hasPermission("LAB_UPDATE");

  const [tab, setTab] = useState<Tab>("orders");
  const [orders, setOrders] = useState<LabOrder[]>([]);
  const [tests, setTests] = useState<LabTest[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<LabOrder | null>(null);
  const [createOrderOpen, setCreateOrderOpen] = useState(false);
  const [editingTest, setEditingTest] = useState<LabTest | null | undefined>(
    undefined,
  );

  const [page, setPage] = useState(1);
  const [testPage, setTestPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [testTotalPages, setTestTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [testTotal, setTestTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [testSearch, setTestSearch] = useState("");
  const [orderStatus, setOrderStatus] = useState<OrderFilter>("ALL");
  const [testStatus, setTestStatus] = useState<TestFilter>("ACTIVE");
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState("");

  const loadOrders = useCallback(
    async (showRefresh = false) => {
      if (!canReadOrders) {
        setLoading(false);
        return;
      }
      try {
        setError("");
        if (showRefresh) setRefreshing(true);
        const response = await laboratoryService.getOrders({
          page,
          limit: PAGE_SIZE,
          ...(search.trim() ? { search: search.trim() } : {}),
          ...(orderStatus !== "ALL" ? { status: orderStatus } : {}),
        });
        setOrders(response.data);
        setTotal(response.total);
        setTotalPages(Math.max(response.totalPages, 1));
        if (selectedOrder) {
          const updated = response.data.find(
            (item) => item.id === selectedOrder.id,
          );
          if (updated) setSelectedOrder(updated);
        }
      } catch (err: any) {
        setError(
          err?.response?.data?.message ||
            err?.message ||
            "Unable to load laboratory orders.",
        );
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [canReadOrders, page, search, orderStatus, selectedOrder],
  );

  const loadTests = useCallback(async () => {
    if (!canReadOrders) return;
    try {
      setError("");
      const query: LabTestQuery = {
        page: testPage,
        limit: PAGE_SIZE,
        ...(testSearch.trim() ? { search: testSearch.trim() } : {}),
        ...(testStatus !== "ALL" ? { isActive: testStatus === "ACTIVE" } : {}),
      };
      const response = await laboratoryService.getTests(query);
      setTests(response.data);
      setTestTotal(response.total);
      setTestTotalPages(Math.max(response.totalPages, 1));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to load laboratory tests.",
      );
    }
  }, [canReadOrders, testPage, testSearch, testStatus]);

  useEffect(() => {
    void loadOrders();
  }, [page, orderStatus]);
  useEffect(() => {
    const timer = window.setTimeout(() => {
      setPage(1);
      void loadOrders();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [search]);
  useEffect(() => {
    if (tab === "tests") void loadTests();
  }, [tab, testPage, testStatus]);
  useEffect(() => {
    if (tab !== "tests") return;
    const timer = window.setTimeout(() => {
      setTestPage(1);
      void loadTests();
    }, 350);
    return () => window.clearTimeout(timer);
  }, [testSearch]);

  const summary = useMemo(
    () =>
      orders.reduce(
        (acc, order) => {
          acc[order.status] += 1;
          return acc;
        },
        { PENDING: 0, IN_PROGRESS: 0, COMPLETED: 0, CANCELLED: 0 } as Record<
          LabOrderStatus,
          number
        >,
      ),
    [orders],
  );

  const openOrder = async (order: LabOrder) => {
    setSelectedOrder(order);
    try {
      const detail = await laboratoryService.getOrder(order.id);
      setSelectedOrder(detail);
    } catch {
      /* list data remains available */
    }
  };

  const refreshSelected = async () => {
    if (!selectedOrder) return;
    const detail = await laboratoryService.getOrder(selectedOrder.id);
    setSelectedOrder(detail);
    await loadOrders(true);
  };

  const toggleTest = async (test: LabTest) => {
    try {
      await laboratoryService.updateTestStatus(test.id, !test.isActive);
      await loadTests();
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "Unable to update test status.",
      );
    }
  };

  if (!canReadOrders)
    return (
      <div className="p-6">
        <ErrorState
          message="You do not have permission to view laboratory data."
          onRetry={() => undefined}
        />
      </div>
    );
  if (loading && tab === "orders")
    return <PageLoader message="Loading laboratory..." />;

  return (
    <div className="min-h-full bg-slate-50/40 p-4 md:p-6">
      <div className="mx-auto max-w-7xl space-y-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex size-10 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <FlaskConical className="size-5" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                  Laboratory
                </h1>
                <p className="text-sm text-slate-500">
                  Manage laboratory orders, tests, and results.
                </p>
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {tab === "orders" && canCreate && (
              <button
                type="button"
                onClick={() => setCreateOrderOpen(true)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                <Plus className="size-4" />
                Add order
              </button>
            )}
            {tab === "tests" && canCreate && (
              <button
                type="button"
                onClick={() => setEditingTest(null)}
                className="inline-flex h-10 cursor-pointer items-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-teal-700"
              >
                <Plus className="size-4" />
                Add test
              </button>
            )}
            <button
              type="button"
              onClick={() =>
                void (tab === "orders" ? loadOrders(true) : loadTests())
              }
              className="inline-flex h-10 items-center gap-2 rounded-xl bg-white px-3 text-sm font-semibold text-slate-600 ring-1 ring-slate-200/80 hover:bg-slate-50"
            >
              {refreshing ? (
                <Loader2 className="size-4 animate-spin" />
              ) : (
                <RefreshCw className="size-4" />
              )}
              Refresh
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
          {(
            [
              {
                label: "Pending",
                value: summary.PENDING,
                classes: "bg-amber-50 text-amber-700",
                icon: ClipboardList,
              },
              {
                label: "In progress",
                value: summary.IN_PROGRESS,
                classes: "bg-blue-50 text-blue-700",
                icon: Activity,
              },
              {
                label: "Completed",
                value: summary.COMPLETED,
                classes: "bg-emerald-50 text-emerald-700",
                icon: Check,
              },
              {
                label: "Total orders",
                value: total,
                classes: "bg-teal-50 text-teal-700",
                icon: Beaker,
              },
            ] satisfies Array<{
              label: string;
              value: number;
              classes: string;
              icon: ComponentType<{ className?: string }>;
            }>
          ).map(({ label, value, classes, icon: Icon }) => (
            <div
              key={String(label)}
              className="rounded-2xl bg-white p-4 ring-1 ring-slate-100"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-medium text-slate-400">{label}</p>
                  <p className="mt-1 text-xl font-semibold text-slate-900">
                    {value}
                  </p>
                </div>
                <div
                  className={`flex size-9 items-center justify-center rounded-xl ${classes}`}
                >
                  <Icon className="size-4" />
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-2xl bg-white p-1 ring-1 ring-slate-100">
          <div className="flex gap-1">
            <button
              type="button"
              onClick={() => setTab("orders")}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 ${tab === "orders" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <ClipboardList className="size-4" />
              Orders
            </button>
            <button
              type="button"
              onClick={() => setTab("tests")}
              className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold outline-none focus:outline-none focus-visible:ring-2 focus-visible:ring-teal-500/30 ${tab === "tests" ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"}`}
            >
              <TestTube2 className="size-4" />
              Lab tests
            </button>
          </div>
        </div>

        {error && (
          <div className="flex items-start gap-2 rounded-xl bg-red-50 px-3 py-2.5 text-sm text-red-700">
            <AlertCircle className="mt-0.5 size-4 shrink-0" />
            {error}
          </div>
        )}

        {tab === "orders" ? (
          <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Laboratory orders
                </h2>
                <p className="text-xs text-slate-400">
                  {total} order{total === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    placeholder="Search tests or notes"
                    className="h-10 w-full rounded-xl bg-white pl-9 pr-3 text-sm text-slate-700 ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-teal-500/30 sm:w-64"
                  />
                </div>
                <CustomSelect
                  value={orderStatus}
                  onChange={(value) => {
                    setOrderStatus(value as OrderFilter);
                    setPage(1);
                  }}
                  options={[
                    { value: "ALL", label: "All statuses" },
                    ...(
                      [
                        "PENDING",
                        "IN_PROGRESS",
                        "COMPLETED",
                        "CANCELLED",
                      ] as LabOrderStatus[]
                    ).map((value) => ({ value, label: statusLabel(value) })),
                  ]}
                />
              </div>
            </div>
            {orders.length === 0 ? (
              <div className="py-16 text-center">
                <Beaker className="mx-auto size-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-600">
                  No laboratory orders found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Orders created against appointments will appear here.
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <div className="relative grid grid-cols-[1.1fr_1.2fr_1fr_.7fr_.6fr] gap-4 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-slate-100">
                    <span>Order</span>
                    <span>Tests</span>
                    <span>Appointment</span>
                    <span>Status</span>
                    <span />
                  </div>
                  {orders.map((order) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => void openOrder(order)}
                      className="relative grid w-full grid-cols-[1.1fr_1.2fr_1fr_.7fr_.6fr] items-center gap-4 px-5 py-4 text-left after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-slate-100 last:after:hidden hover:bg-slate-50/60"
                    >
                      <div>
                        <p className="text-sm font-semibold text-slate-800">
                          Laboratory order
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {safeDateTime(order.createdAt)}
                        </p>
                      </div>
                      <div>
                        <p className="truncate text-sm text-slate-700">
                          {order.items
                            .slice(0, 2)
                            .map((item) => item.labTestName)
                            .join(", ")}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {order.items.length} test
                          {order.items.length === 1 ? "" : "s"}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-slate-400">Appointment</p>
                        <p className="truncate text-sm font-medium text-slate-700">
                          {order.appointment?.appointmentNumber ?? "—"}
                        </p>
                      </div>
                      <StatusBadge status={order.status} />
                      <Eye className="size-4 justify-self-end text-slate-400" />
                    </button>
                  ))}
                </div>
                <div className="md:hidden">
                  {orders.map((order, index) => (
                    <button
                      key={order.id}
                      type="button"
                      onClick={() => void openOrder(order)}
                      className="relative block w-full p-4 text-left"
                    >
                      {index > 0 && (
                        <span
                          aria-hidden="true"
                          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-slate-200/70"
                        />
                      )}
                      <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-slate-800">
                            Laboratory order
                          </p>
                          <p className="mt-1 text-xs text-slate-400">
                            {safeDateTime(order.createdAt)}
                          </p>
                        </div>
                        <StatusBadge status={order.status} />
                      </div>
                      <div className="mt-3 flex items-center gap-2 text-xs text-slate-500">
                        <UserRound className="size-4 text-slate-400" />
                        Appointment{" "}
                        {order.appointment?.appointmentNumber ?? "—"}
                      </div>
                      <div className="mt-2 text-sm text-slate-600">
                        {order.items.map((item) => item.labTestName).join(", ")}
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
            {orders.length > 0 && (
              <Pagination
                page={page}
                totalPages={totalPages}
                onPageChange={setPage}
              />
            )}
          </section>
        ) : (
          <section className="overflow-hidden rounded-2xl bg-white ring-1 ring-slate-100">
            <div className="flex flex-col gap-3 p-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">
                  Laboratory tests
                </h2>
                <p className="text-xs text-slate-400">
                  {testTotal} configured test{testTotal === 1 ? "" : "s"}
                </p>
              </div>
              <div className="flex flex-col gap-2 sm:flex-row">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                  <input
                    value={testSearch}
                    onChange={(event) => setTestSearch(event.target.value)}
                    placeholder="Search code or test"
                    className="h-10 w-full rounded-xl bg-white pl-9 pr-3 text-sm text-slate-700 ring-1 ring-slate-200/80 outline-none focus:ring-2 focus:ring-teal-500/30 sm:w-64"
                  />
                </div>
                <CustomSelect
                  value={testStatus}
                  onChange={(value) => {
                    setTestStatus(value as TestFilter);
                    setTestPage(1);
                  }}
                  options={[
                    { value: "ACTIVE", label: "Active" },
                    { value: "INACTIVE", label: "Inactive" },
                    { value: "ALL", label: "All tests" },
                  ]}
                />
              </div>
            </div>
            {tests.length === 0 ? (
              <div className="py-16 text-center">
                <TestTube2 className="mx-auto size-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-600">
                  No laboratory tests found
                </p>
              </div>
            ) : (
              <>
                <div className="hidden md:block">
                  <div className="relative grid grid-cols-[.8fr_1.5fr_1fr_.7fr_.6fr] gap-4 bg-slate-50/70 px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-400 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-slate-100">
                    <span>Code</span>
                    <span>Test</span>
                    <span>Category</span>
                    <span>Price</span>
                    <span />
                  </div>
                  {tests.map((test) => (
                    <div
                      key={test.id}
                      className="relative grid grid-cols-[.8fr_1.5fr_1fr_.7fr_.6fr] items-center gap-4 px-5 py-4 after:absolute after:inset-x-0 after:bottom-0 after:h-px after:bg-slate-100 last:after:hidden"
                    >
                      <div className="text-sm font-semibold text-slate-700">
                        {test.code}
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-800">
                          {test.name}
                        </p>
                        {test.normalRange && (
                          <p className="mt-0.5 text-xs text-slate-400">
                            Normal: {test.normalRange}
                          </p>
                        )}
                      </div>
                      <div className="text-sm text-slate-500">
                        {test.category || "—"}
                      </div>
                      <div className="text-sm font-semibold text-slate-700">
                        ₹{test.price.toFixed(2)}
                      </div>
                      <div className="flex justify-end gap-1">
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => setEditingTest(test)}
                            className="rounded-lg px-2 py-1.5 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                          >
                            Edit
                          </button>
                        )}
                        {canUpdate && (
                          <button
                            type="button"
                            onClick={() => void toggleTest(test)}
                            className="rounded-lg px-2 py-1.5 text-xs font-semibold text-slate-500 hover:bg-slate-50"
                          >
                            {test.isActive ? "Deactivate" : "Activate"}
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
                <div className="divide-y divide-slate-100 md:hidden">
                  {tests.map((test) => (
                    <div key={test.id} className="p-4">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-xs font-semibold text-teal-600">
                            {test.code}
                          </p>
                          <p className="mt-1 text-sm font-semibold text-slate-800">
                            {test.name}
                          </p>
                        </div>
                        <span
                          className={`rounded-full px-2 py-1 text-xs font-semibold ${test.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                        >
                          {test.isActive ? "Active" : "Inactive"}
                        </span>
                      </div>
                      <div className="mt-3 flex items-center justify-between text-sm">
                        <span className="text-slate-500">
                          {test.category || "Uncategorised"}
                        </span>
                        <span className="font-semibold text-slate-700">
                          ₹{test.price.toFixed(2)}
                        </span>
                      </div>
                      {canUpdate && (
                        <div className="mt-3 flex gap-2">
                          <button
                            type="button"
                            onClick={() => setEditingTest(test)}
                            className="rounded-xl px-3 py-2 text-xs font-semibold text-teal-700 ring-1 ring-teal-200"
                          >
                            Edit
                          </button>
                          <button
                            type="button"
                            onClick={() => void toggleTest(test)}
                            className="rounded-xl px-3 py-2 text-xs font-semibold text-slate-500 ring-1 ring-slate-200"
                          >
                            {test.isActive ? "Deactivate" : "Activate"}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </>
            )}
            {tests.length > 0 && (
              <Pagination
                page={testPage}
                totalPages={testTotalPages}
                onPageChange={setTestPage}
              />
            )}
          </section>
        )}

        {selectedOrder && (
          <div
            className="fixed inset-0 z-40 bg-slate-900/20"
            onClick={() => setSelectedOrder(null)}
          >
            <aside
              className="absolute inset-y-0 right-0 w-full overflow-y-auto bg-white shadow-2xl ring-1 ring-slate-200/70 md:max-w-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="sticky top-0 z-10 flex items-center justify-between bg-white px-5 py-4 ring-1 ring-slate-100">
                <div>
                  <p className="text-xs font-medium text-slate-400">
                    Laboratory order
                  </p>
                  <div className="mt-1 flex items-center gap-2">
                    <StatusBadge status={selectedOrder.status} />
                    <span className="text-xs text-slate-400">
                      {safeDate(selectedOrder.createdAt)}
                    </span>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setSelectedOrder(null)}
                  className="rounded-lg p-2 text-slate-400 hover:bg-slate-50"
                >
                  <X className="size-5" />
                </button>
              </div>
              <OrderDetails
                order={selectedOrder}
                canUpdate={canUpdate}
                onRefresh={refreshSelected}
              />
            </aside>
          </div>
        )}
        {editingTest !== undefined && (
          <TestForm
            test={editingTest}
            onSaved={loadTests}
            onClose={() => setEditingTest(undefined)}
          />
        )}
        <CreateLabOrderModal
          open={createOrderOpen}
          onClose={() => setCreateOrderOpen(false)}
          onCreated={async () => {
            setPage(1);
            await loadOrders(true);
          }}
        />
      </div>
    </div>
  );
}

function Pagination({
  page,
  totalPages,
  onPageChange,
}: {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}) {
  if (totalPages <= 1) return null;
  return (
    <div className="flex items-center justify-between px-4 py-3 shadow-[inset_0_1px_0_rgba(241,245,249,0.9)]">
      <p className="text-xs text-slate-400">
        Page {page} of {totalPages}
      </p>
      <div className="flex gap-1">
        <button
          type="button"
          disabled={page <= 1}
          onClick={() => onPageChange(page - 1)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronLeft className="size-4" />
        </button>
        <button
          type="button"
          disabled={page >= totalPages}
          onClick={() => onPageChange(page + 1)}
          className="rounded-lg p-2 text-slate-500 hover:bg-slate-50 disabled:opacity-30"
        >
          <ChevronRight className="size-4" />
        </button>
      </div>
    </div>
  );
}
