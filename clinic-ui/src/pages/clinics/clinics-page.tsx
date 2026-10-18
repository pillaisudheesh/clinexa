import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Power,
  X,
} from "lucide-react";
import { useAuth } from "@/auth/auth-context";
import { apiClient } from "@/services/api-client";

type Clinic = {
  id: string;
  code: string;
  name: string;
  email: string | null;
  phone: string | null;
  website: string | null;
  addressLine1: string | null;
  addressLine2: string | null;
  city: string | null;
  state: string | null;
  country: string | null;
  postalCode: string | null;
  timezone: string;
  isActive: boolean;
  createdAt: string;
};
type PageResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
type ClinicForm = {
  code: string;
  name: string;
  email: string;
  phone: string;
  website: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  timezone: string;
};
const emptyForm: ClinicForm = {
  code: "",
  name: "",
  email: "",
  phone: "",
  website: "",
  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "",
  postalCode: "",
  timezone: "Asia/Kolkata",
};
const inputClass =
  "h-10 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-teal-500/40";
const primaryClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl !border-0 !outline-none !ring-0 bg-teal-600 px-4 text-sm font-semibold text-white hover:bg-teal-700 focus-visible:!ring-2 focus-visible:!ring-teal-500/30 disabled:opacity-50";
const fieldLabels: [Exclude<keyof ClinicForm, "code">, string][] = [
  ["name", "Clinic name"],
  ["email", "Email"],
  ["phone", "Phone"],
  ["website", "Website"],
  ["addressLine1", "Address line 1"],
  ["addressLine2", "Address line 2"],
  ["city", "City"],
  ["state", "State"],
  ["country", "Country"],
  ["postalCode", "Postal code"],
  ["timezone", "Timezone"],
];
const getError = (error: unknown) => {
  const e = error as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };
  const message = e.response?.data?.message;
  return Array.isArray(message)
    ? message.join(", ")
    : message || e.message || "Something went wrong.";
};

export function ClinicsPage() {
  const { user } = useAuth();
  const isPlatformAdmin = user?.isPlatformAdmin === true;
  const canRead = isPlatformAdmin;
  const canCreate = isPlatformAdmin;
  const canUpdate = isPlatformAdmin;
  const [clinics, setClinics] = useState<Clinic[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [modalError, setModalError] = useState("");
  const [editing, setEditing] = useState<Clinic | null>(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [form, setForm] = useState<ClinicForm>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [statusTarget, setStatusTarget] = useState<Clinic | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  const load = useCallback(async () => {
    if (!canRead) return;
    setLoading(true);
    setError("");
    try {
      const response = await apiClient.get<PageResult<Clinic>>("/clinics", {
        params: {
          page,
          limit: 10,
          search: search.trim() || undefined,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      });
      setClinics(response.data.data ?? []);
      setTotalPages(response.data.totalPages ?? 1);
    } catch (e) {
      setError(getError(e));
    } finally {
      setLoading(false);
    }
  }, [canRead, page, search]);

  useEffect(() => {
    void load();
  }, [load]);

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalError("");
    setModalOpen(true);
  };
  const startEdit = (clinic: Clinic) => {
    setEditing(clinic);
    setModalError("");
    setModalOpen(true);
    setForm({
      code: clinic.code,
      name: clinic.name,
      email: clinic.email ?? "",
      phone: clinic.phone ?? "",
      website: clinic.website ?? "",
      addressLine1: clinic.addressLine1 ?? "",
      addressLine2: clinic.addressLine2 ?? "",
      city: clinic.city ?? "",
      state: clinic.state ?? "",
      country: clinic.country ?? "",
      postalCode: clinic.postalCode ?? "",
      timezone: clinic.timezone ?? "Asia/Kolkata",
    });
  };
  const closeModal = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalError("");
    setModalOpen(false);
  };
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setModalError("");
    const payload = Object.fromEntries(
      Object.entries(form)
        .filter(([key]) => key !== "code")
        .map(([key, value]) => [key, value.trim() || undefined]),
    );
    try {
      if (editing) {
        await apiClient.patch(`/clinics/${editing.id}`, payload);
      } else {
        await apiClient.post("/clinics", payload);
      }
      closeModal();
      await load();
    } catch (e) {
      setModalError(getError(e));
    } finally {
      setSaving(false);
    }
  };
  const toggleStatus = async () => {
    if (!statusTarget) return;
    setStatusSaving(true);
    try {
      await apiClient.patch(`/clinics/${statusTarget.id}/status`, {
        isActive: !statusTarget.isActive,
      });
      setStatusTarget(null);
      await load();
    } catch (e) {
      setError(getError(e));
    } finally {
      setStatusSaving(false);
    }
  };

  if (!isPlatformAdmin)
    return (
      <div className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
          <Building2 className="mx-auto size-8 text-slate-300" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">
            Platform administrator access required
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Clinic creation and cross-clinic management are restricted to the
            Platform Super Administrator.
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900">Clinics</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage clinic profiles and activation status.
          </p>
        </div>
        <div className="flex gap-2">
          <button
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl !border !border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50"
            onClick={() => void load()}
          >
            <RefreshCw size={16} /> Refresh
          </button>
          {canCreate && (
            <button className={primaryClass} onClick={startCreate}>
              <Plus size={17} /> Add clinic
            </button>
          )}
        </div>
      </div>
      <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
        <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-semibold text-slate-900">Clinic directory</h2>
            <p className="text-sm text-slate-500">
              Search by name, code, city, or email.
            </p>
          </div>
          <div className="relative w-full sm:max-w-xs">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
              size={16}
            />
            <input
              className={`${inputClass} pl-9`}
              placeholder="Search clinics..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>
        {error && (
          <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
            {error}
          </div>
        )}
        <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 md:block">
          <table className="w-full border-0 border-collapse text-left text-sm [&_th]:border-0 [&_td]:border-0">
            <thead className="bg-slate-50/50 text-[10px] uppercase tracking-[0.08em] text-slate-400">
              <tr className="!border-0">
                {[
                  "Clinic",
                  "Code",
                  "Location",
                  "Contact",
                  "Status",
                  "Actions",
                ].map((x) => (
                  <th
                    key={x}
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    className="px-4 py-3 font-semibold"
                  >
                    {x}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {clinics.map((c) => (
                <tr
                  key={c.id}
                  className="!border-0 transition-colors hover:bg-slate-50/60"
                >
                  <td
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    className="border-0 px-4 py-3"
                  >
                    <div className="font-semibold text-slate-800">{c.name}</div>
                    <div className="text-xs text-slate-500">
                      {c.email || "No email"}
                    </div>
                  </td>
                  <td
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    className="border-0 px-4 py-3 font-mono text-xs text-slate-600"
                  >
                    {c.code}
                  </td>
                  <td
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    className="border-0 px-4 py-3 text-slate-600"
                  >
                    {[c.city, c.state, c.country].filter(Boolean).join(", ") ||
                      "—"}
                  </td>
                  <td
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    className="border-0 px-4 py-3 text-slate-600"
                  >
                    {c.phone || "—"}
                  </td>
                  <td
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    className="border-0 px-4 py-3"
                  >
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td
                    style={{ borderBottom: "1px solid #f1f5f9" }}
                    className="border-0 px-4 py-3"
                  >
                    <div className="flex gap-2">
                      {canUpdate && (
                        <>
                          <button
                            aria-label="Edit clinic"
                            onClick={() => startEdit(c)}
                            className="rounded-lg !border !border-slate-200 !outline-none !ring-0 p-2 text-slate-600 hover:bg-slate-50 focus-visible:!ring-2 focus-visible:!ring-teal-500/30"
                          >
                            <Pencil size={15} />
                          </button>
                          <button
                            aria-label={
                              c.isActive
                                ? "Deactivate clinic"
                                : "Activate clinic"
                            }
                            onClick={() => setStatusTarget(c)}
                            className="rounded-lg !border !border-slate-200 !outline-none !ring-0 p-2 text-slate-600 hover:bg-slate-50 focus-visible:!ring-2 focus-visible:!ring-teal-500/30"
                          >
                            <Power size={15} />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3 md:hidden">
          {clinics.map((c) => (
            <div
              key={c.id}
              className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-slate-50/60"
            >
              <div className="flex items-start gap-3">
                <div className="rounded-xl bg-teal-50 p-2 text-teal-700">
                  <Building2 size={20} />
                </div>
                <div className="min-w-0 flex-1">
                  <div className="font-semibold text-slate-900">{c.name}</div>
                  <div className="text-xs text-slate-500">{c.code}</div>
                  <div className="mt-2 text-sm text-slate-600">
                    {[c.city, c.state, c.country].filter(Boolean).join(", ") ||
                      "Location not set"}
                  </div>
                  <div className="mt-1 break-words text-sm text-slate-500">
                    {c.email || c.phone || "No contact details"}
                  </div>
                  <div className="mt-3">
                    <span
                      className={`rounded-full px-2.5 py-1 text-xs font-semibold ${c.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
                    >
                      {c.isActive ? "Active" : "Inactive"}
                    </span>
                  </div>
                </div>
              </div>
              {canUpdate && (
                <div className="mt-3 flex gap-2 pt-3">
                  <button
                    onClick={() => startEdit(c)}
                    className="flex-1 rounded-xl !border !border-slate-200 !outline-none !ring-0 px-3 py-2 text-sm font-medium text-slate-600 focus-visible:!ring-2 focus-visible:!ring-teal-500/30"
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => setStatusTarget(c)}
                    className="flex-1 rounded-xl !border !border-slate-200 !outline-none !ring-0 px-3 py-2 text-sm font-medium text-slate-600 focus-visible:!ring-2 focus-visible:!ring-teal-500/30"
                  >
                    {c.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
        {!loading && clinics.length === 0 && (
          <div className="py-10 text-center text-sm text-slate-500">
            {error ? "Unable to load clinics." : "No clinics found."}
          </div>
        )}
        {loading && (
          <div className="py-6 text-center text-sm text-slate-500">
            Loading clinics…
          </div>
        )}
        <div className="mt-4 flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
          <span className="text-sm text-slate-500">
            Page {page} of {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-xl !border !border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
            >
              Previous
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-xl !border !border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
      {modalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clinic-modal-title"
        >
          <form
            onSubmit={submit}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="clinic-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  {editing ? "Edit clinic" : "Add clinic"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Enter the clinic's basic details and contact information.
                </p>
              </div>
              <button
                type="button"
                onClick={closeModal}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>
            {modalError && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                {modalError}
              </div>
            )}
            {editing && (
              <div className="mb-4">
                <label className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    Clinic code
                  </span>
                  <input
                    readOnly
                    disabled={saving}
                    className={`${inputClass} cursor-not-allowed bg-slate-100 text-slate-500`}
                    value={form.code}
                    aria-describedby="clinic-code-help"
                  />
                  <span
                    id="clinic-code-help"
                    className="mt-1 block text-xs text-slate-500"
                  >
                    Generated automatically and cannot be changed.
                  </span>
                </label>
              </div>
            )}
            {!editing && (
              <p className="mb-4 rounded-xl bg-teal-50/70 px-3 py-2.5 text-sm text-teal-800">
                Clinic code will be generated automatically when the clinic is
                created.
              </p>
            )}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {fieldLabels.map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    {label}
                    {key === "name" && (
                      <span className="text-rose-600"> *</span>
                    )}
                  </span>
                  <input
                    required={key === "name"}
                    disabled={saving}
                    className={inputClass}
                    value={form[key]}
                    onChange={(e) =>
                      setForm({ ...form, [key]: e.target.value })
                    }
                    placeholder={key === "timezone" ? "Asia/Kolkata" : label}
                  />
                </label>
              ))}
            </div>
            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={closeModal}
                className="h-10 rounded-xl !border !border-slate-200 px-4 text-sm font-semibold text-slate-600"
              >
                Cancel
              </button>
              <button disabled={saving} className={primaryClass} type="submit">
                {saving
                  ? "Saving…"
                  : editing
                    ? "Save changes"
                    : "Create clinic"}
              </button>
            </div>
          </form>
        </div>
      )}
      {statusTarget && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="clinic-status-title"
        >
          <button
            type="button"
            aria-label="Close confirmation"
            className="absolute inset-0 bg-slate-900/20 backdrop-blur-[2px]"
            onClick={() => !statusSaving && setStatusTarget(null)}
          />
          <div
            className="relative w-full max-w-lg rounded-t-3xl bg-white p-5 shadow-2xl ring-1 ring-slate-100 sm:rounded-2xl sm:p-6"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-5 flex items-start justify-between gap-4">
              <div>
                <h2
                  id="clinic-status-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {statusTarget.isActive
                    ? "Deactivate clinic?"
                    : "Activate clinic?"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {statusTarget.isActive
                    ? `Are you sure you want to deactivate ${statusTarget.name}? Users may lose access to this clinic.`
                    : `Are you sure you want to activate ${statusTarget.name}?`}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close"
                disabled={statusSaving}
                onClick={() => setStatusTarget(null)}
                className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-500 transition hover:bg-slate-200 disabled:opacity-50"
              >
                <X className="size-4" />
              </button>
            </div>
            {error && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            )}
            <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={statusSaving}
                onClick={() => setStatusTarget(null)}
                className="h-10 rounded-xl !border-0 px-4 text-sm font-semibold text-slate-600 !ring-1 !ring-slate-200/80 !outline-none focus-visible:!ring-2 focus-visible:!ring-teal-500/30 transition hover:bg-slate-50 disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={statusSaving}
                onClick={() => void toggleStatus()}
                className={`inline-flex h-10 items-center justify-center gap-2 rounded-xl !border-0 !outline-none !ring-0 px-5 text-sm font-semibold text-white transition focus-visible:!ring-2 focus-visible:!ring-teal-500/30 disabled:cursor-not-allowed disabled:opacity-60 ${statusTarget.isActive ? "bg-red-600 hover:bg-red-700" : "bg-teal-600 hover:bg-teal-700"}`}
              >
                {statusSaving
                  ? "Saving…"
                  : statusTarget.isActive
                    ? "Deactivate clinic"
                    : "Activate clinic"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
