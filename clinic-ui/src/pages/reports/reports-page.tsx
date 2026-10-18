import {
  Activity,
  BarChart3,
  CalendarDays,
  FlaskConical,
  IndianRupee,
  Package,
  RefreshCw,
  UsersRound,
  WalletCards,
} from "lucide-react";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useAuth } from "@/auth/auth-context";
import { reportsService } from "@/services/reports-service";
import type { ReportSummary } from "@/types/reports";

function localDate(daysAgo = 0) {
  const date = new Date();
  date.setDate(date.getDate() - daysAgo);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function currency(value: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);
}

function label(value: string) {
  return value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function shortDate(value: string) {
  return new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
    day: "2-digit",
    month: "short",
  });
}

const metricCards = [
  {
    key: "newPatients",
    label: "New patients",
    icon: UsersRound,
    iconClass: "text-teal-600",
  },
  {
    key: "appointments",
    label: "Appointments",
    icon: CalendarDays,
    iconClass: "text-blue-600",
  },
  {
    key: "labOrders",
    label: "Lab orders",
    icon: FlaskConical,
    iconClass: "text-violet-600",
  },
  {
    key: "dispensed",
    label: "Dispensed",
    icon: Package,
    iconClass: "text-amber-600",
  },
] as const;

function LineChart({ data }: { data: ReportSummary["daily"] }) {
  const width = 760;
  const height = 250;
  const left = 44;
  const right = 18;
  const top = 18;
  const bottom = 42;
  const chartWidth = width - left - right;
  const chartHeight = height - top - bottom;
  const max = Math.max(...data.map((item) => item.revenue), 1);
  const step = data.length > 1 ? chartWidth / (data.length - 1) : chartWidth;
  const points = data.map((item, index) => {
    const x = data.length === 1 ? left + chartWidth / 2 : left + index * step;
    const y = top + chartHeight - (item.revenue / max) * chartHeight;
    return { ...item, x, y };
  });
  const path = points
    .map((point, index) => `${index === 0 ? "M" : "L"} ${point.x} ${point.y}`)
    .join(" ");

  return (
    <div className="mt-5 w-full min-w-0">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full max-w-full"
        role="img"
        aria-label="Revenue trend chart"
      >
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const y = top + chartHeight - fraction * chartHeight;
          return (
            <line
              key={fraction}
              x1={left}
              x2={width - right}
              y1={y}
              y2={y}
              className="stroke-slate-100"
            />
          );
        })}
        <path
          d={path}
          fill="none"
          className="stroke-teal-600"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {points.map((point) => (
          <g key={point.date}>
            <circle
              cx={point.x}
              cy={point.y}
              r="4"
              className="fill-white stroke-teal-600"
              strokeWidth="2"
            />
            <title>{`${point.date}: ${currency(point.revenue)}`}</title>
          </g>
        ))}
        {points.map((point, index) => (
          <text
            key={`${point.date}-label`}
            x={point.x}
            y={height - 12}
            textAnchor="middle"
            className="fill-slate-400 text-[10px]"
          >
            {data.length <= 14 || index % Math.ceil(data.length / 10) === 0
              ? shortDate(point.date)
              : ""}
          </text>
        ))}
        {[0, 0.5, 1].map((fraction) => {
          const y = top + chartHeight - fraction * chartHeight + 4;
          return (
            <text
              key={fraction}
              x={left - 8}
              y={y}
              textAnchor="end"
              className="fill-slate-400 text-[10px]"
            >
              {currency(max * fraction)}
            </text>
          );
        })}
      </svg>
    </div>
  );
}

function BarChart({
  items,
  valueKey,
  valueLabel,
}: {
  items: { label: string; value: number }[];
  valueKey: string;
  valueLabel: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);
  return (
    <div className="mt-5 space-y-4">
      {items.length === 0 ? (
        <p className="text-sm text-slate-400">No data in this period.</p>
      ) : (
        items.map((item) => (
          <div key={`${valueKey}-${item.label}`}>
            <div className="mb-1.5 flex items-center justify-between gap-3 text-xs">
              <span className="truncate text-slate-500">{item.label}</span>
              <span className="font-semibold text-slate-700">
                {item.value.toLocaleString()}
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-slate-100">
              <div
                className="h-2.5 rounded-full bg-teal-500 transition-all"
                style={{
                  width: `${Math.max((item.value / max) * 100, item.value ? 4 : 0)}%`,
                }}
                title={`${item.label}: ${item.value} ${valueLabel}`}
              />
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function AppointmentChart({ data }: { data: ReportSummary["daily"] }) {
  const max = Math.max(...data.map((item) => item.appointments), 1);
  const visible =
    data.length > 14
      ? data.filter((_, index) => index % Math.ceil(data.length / 14) === 0)
      : data;
  return (
    <div className="mt-5 w-full min-w-0">
      <div className="flex h-56 w-full min-w-0 items-end gap-1 px-1">
        {visible.map((item) => (
          <div
            key={item.date}
            className="group flex h-full min-w-0 flex-1 flex-col items-center justify-end gap-2"
          >
            <div className="relative flex w-full max-w-7 flex-1 items-end">
              <div
                className="w-full rounded-t-md bg-blue-400 transition group-hover:bg-blue-500"
                style={{
                  height: `${Math.max((item.appointments / max) * 100, item.appointments ? 5 : 1)}%`,
                }}
                title={`${item.date}: ${item.appointments} appointments`}
              />
            </div>
            <span className="text-[10px] text-slate-400">
              {shortDate(item.date)}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function ReportsPage() {
  const { hasPermission } = useAuth();
  const [fromDate, setFromDate] = useState(localDate(6));
  const [toDate, setToDate] = useState(localDate());
  const [report, setReport] = useState<ReportSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (fromDate > toDate) {
      setError("The start date must be before or equal to the end date.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      setReport(await reportsService.getSummary(fromDate, toDate));
    } catch (requestError) {
      console.error("Unable to load reports.", requestError);
      setError("We couldn't load the report. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [fromDate, toDate]);

  useEffect(() => {
    if (hasPermission("REPORT_READ")) void load();
  }, [hasPermission, load]);

  const appointmentStatusData = useMemo(
    () =>
      report?.appointmentsByStatus.map((item) => ({
        label: label(item.status),
        value: item.count,
      })) ?? [],
    [report],
  );
  const labStatusData = useMemo(
    () =>
      report?.labOrdersByStatus.map((item) => ({
        label: label(item.status),
        value: item.count,
      })) ?? [],
    [report],
  );
  const pharmacyStatusData = useMemo(
    () =>
      report?.pharmacyByStatus.map((item) => ({
        label: label(item.status),
        value: item.count,
      })) ?? [],
    [report],
  );
  const inventoryData = useMemo(
    () =>
      report?.inventoryByType.map((item) => ({
        label: label(item.status),
        value: item.count,
      })) ?? [],
    [report],
  );

  if (!hasPermission("REPORT_READ")) {
    return (
      <div className="p-6 text-sm text-slate-500">
        You do not have permission to view reports.
      </div>
    );
  }

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-600">SamaRoot insights</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Reports
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Clinic performance across care, laboratory, pharmacy and billing.
          </p>
        </div>
        <div className="grid w-full grid-cols-1 gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-slate-100 min-[420px]:grid-cols-2 sm:w-auto sm:min-w-[420px] sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_auto] sm:items-end">
          <label className="min-w-0 text-xs font-medium text-slate-500">
            From
            <input
              type="date"
              value={fromDate}
              onChange={(event) => setFromDate(event.target.value)}
              className="mt-1 block h-10 w-full min-w-0 rounded-lg bg-slate-50 px-2 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-teal-500/30"
            />
          </label>
          <label className="min-w-0 text-xs font-medium text-slate-500">
            To
            <input
              type="date"
              value={toDate}
              onChange={(event) => setToDate(event.target.value)}
              className="mt-1 block h-10 w-full min-w-0 rounded-lg bg-slate-50 px-2 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:ring-teal-500/30"
            />
          </label>
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-lg bg-teal-600 px-3 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-60 min-[420px]:col-span-2 sm:col-span-1 sm:w-auto"
          >
            <RefreshCw className="size-4" />
            Refresh
          </button>
        </div>
      </div>

      {error ? (
        <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </div>
      ) : null}

      {loading && !report ? (
        <div className="rounded-2xl bg-white p-10 text-center text-sm text-slate-500 shadow-sm ring-1 ring-slate-100">
          Loading report...
        </div>
      ) : report ? (
        <>
          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
            {metricCards.map(
              ({ key, label: cardLabel, icon: Icon, iconClass }) => (
                <div
                  key={key}
                  className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
                >
                  <div className="flex size-9 items-center justify-center rounded-xl bg-slate-50">
                    <Icon className={`size-4.5 ${iconClass}`} />
                  </div>
                  <p className="mt-3 text-2xl font-semibold text-slate-900">
                    {report.totals[key]}
                  </p>
                  <p className="mt-0.5 text-xs text-slate-400">{cardLabel}</p>
                </div>
              ),
            )}
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5 lg:col-span-2">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Revenue trend
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Successful payments by day
                  </p>
                </div>
                <IndianRupee className="size-5 text-teal-600" />
              </div>
              <LineChart data={report.daily} />
            </div>
            <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Financial summary
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Selected period
                  </p>
                </div>
                <WalletCards className="size-5 text-teal-600" />
              </div>
              <div className="mt-5 space-y-4">
                <div>
                  <p className="text-xs text-slate-400">Invoiced</p>
                  <p className="mt-1 text-lg font-semibold text-slate-900">
                    {currency(report.totals.invoicedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Collected</p>
                  <p className="mt-1 text-lg font-semibold text-teal-700">
                    {currency(report.totals.collectedAmount)}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-400">Outstanding</p>
                  <p className="mt-1 text-lg font-semibold text-amber-600">
                    {currency(report.totals.outstandingAmount)}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Appointments trend
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Daily appointment volume
                  </p>
                </div>
                <CalendarDays className="size-5 text-blue-600" />
              </div>
              <AppointmentChart data={report.daily} />
            </div>
            <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Appointment status
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Distribution across the selected period
                  </p>
                </div>
                <BarChart3 className="size-5 text-teal-600" />
              </div>
              <BarChart
                items={appointmentStatusData}
                valueKey="appointments"
                valueLabel="appointments"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-3">
            <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Laboratory status
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Orders by workflow state
                  </p>
                </div>
                <FlaskConical className="size-5 text-violet-600" />
              </div>
              <BarChart
                items={labStatusData}
                valueKey="lab"
                valueLabel="orders"
              />
            </div>
            <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Pharmacy activity
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Dispensing workflow status
                  </p>
                </div>
                <Package className="size-5 text-amber-600" />
              </div>
              <BarChart
                items={pharmacyStatusData}
                valueKey="pharmacy"
                valueLabel="dispensings"
              />
            </div>
            <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Inventory activity
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Transactions by type
                  </p>
                </div>
                <Activity className="size-5 text-slate-600" />
              </div>
              <BarChart
                items={inventoryData}
                valueKey="inventory"
                valueLabel="transactions"
              />
            </div>
          </div>

          <div className="grid gap-4 lg:grid-cols-2">
            <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
              <h2 className="text-sm font-semibold text-slate-900">
                Inventory quantities
              </h2>
              <div className="mt-4 grid grid-cols-1 gap-2 min-[420px]:grid-cols-2">
                {report.inventoryByType.map((item) => (
                  <div key={item.status} className="rounded-xl bg-slate-50 p-3">
                    <p className="text-xs text-slate-400">
                      {label(item.status)}
                    </p>
                    <p className="mt-1 text-lg font-semibold text-slate-900">
                      {Number(item.quantity).toLocaleString()}
                    </p>
                    <p className="text-[11px] text-slate-400">
                      {item.count} transactions
                    </p>
                  </div>
                ))}
              </div>
            </div>
            <div className="min-w-0 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-sm font-semibold text-slate-900">
                    Daily activity
                  </h2>
                  <p className="mt-0.5 text-xs text-slate-400">
                    Appointments across the selected period
                  </p>
                </div>
                <Activity className="size-5 text-teal-600" />
              </div>
              <div className="mt-5 space-y-2">
                {report.daily.map((item) => (
                  <div key={item.date} className="flex items-center gap-3">
                    <span className="w-20 text-xs text-slate-400">
                      {shortDate(item.date)}
                    </span>
                    <div className="h-2 flex-1 rounded-full bg-slate-100">
                      <div
                        className="h-2 rounded-full bg-blue-400"
                        style={{
                          width: `${Math.max((item.appointments / Math.max(...report.daily.map((entry) => entry.appointments), 1)) * 100, item.appointments ? 4 : 0)}%`,
                        }}
                      />
                    </div>
                    <span className="w-8 text-right text-xs font-semibold text-slate-600">
                      {item.appointments}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3 min-[420px]:grid-cols-2">
            <div className="rounded-2xl bg-teal-50 p-4">
              <BarChart3 className="size-4 text-teal-600" />
              <p className="mt-2 text-xs text-teal-700">Invoices</p>
              <p className="text-lg font-semibold text-slate-900">
                {report.totals.invoices}
              </p>
            </div>
            <div className="rounded-2xl bg-slate-50 p-4">
              <Package className="size-4 text-slate-500" />
              <p className="mt-2 text-xs text-slate-500">Successful payments</p>
              <p className="text-lg font-semibold text-slate-900">
                {report.totals.invoicePayments}
              </p>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
