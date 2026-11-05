import {
  useCallback,
  useEffect,
  useMemo,
  useState,
  type FormEvent,
} from "react";
import {
  Building2,
  Plus,
  Search,
  RefreshCw,
  Pencil,
  Power,
  X,
  GitBranch,
  CircleCheck,
  PauseCircle,
} from "lucide-react";

import { organizationService } from "@/services/organization-service";
import type {
  Organization,
  CreateOrganizationPayload,
  Branch,
  CreateBranchPayload,
} from "@/services/organization-service";

type OrganizationForm = {
  code: string;
  name: string;
  email: string;
  phone: string;
  website: string;
};

const emptyForm: OrganizationForm = {
  code: "",
  name: "",
  email: "",
  phone: "",
  website: "",
};

type BranchForm = {
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

const emptyBranchForm: BranchForm = {
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
  "h-10 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-2 focus:ring-teal-500/30";

const primaryButtonClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50";

function getError(error: unknown): string {
  const e = error as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };

  const message = e.response?.data?.message;

  return Array.isArray(message)
    ? message.join(", ")
    : message || e.message || "Something went wrong.";
}

export function OrganizationsPage() {
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Organization | null>(null);
  const [form, setForm] = useState<OrganizationForm>(emptyForm);
  const [modalError, setModalError] = useState("");
  const [saving, setSaving] = useState(false);

  const [statusTarget, setStatusTarget] = useState<Organization | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const [selectedOrganization, setSelectedOrganization] =
    useState<Organization | null>(null);

  const [branches, setBranches] = useState<Branch[]>([]);
  const [branchLoading, setBranchLoading] = useState(false);
  const [branchError, setBranchError] = useState("");

  const [branchPage, setBranchPage] = useState(1);
  const [branchTotalPages, setBranchTotalPages] = useState(1);
  const branchPageSize = 10;

  const [branchModalOpen, setBranchModalOpen] = useState(false);
  const [branchForm, setBranchForm] = useState<BranchForm>(emptyBranchForm);
  const [branchModalError, setBranchModalError] = useState("");
  const [branchSaving, setBranchSaving] = useState(false);

  const totalOrganizations = organizations.length;

  const totalBranches = organizations.reduce(
    (total, organization) => total + (organization.branchCount ?? 0),
    0,
  );

  const activeOrganizations = organizations.filter(
    (organization) => organization.isActive,
  ).length;

  const inactiveOrganizations = totalOrganizations - activeOrganizations;

  const load = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await organizationService.getAll();
      setOrganizations(response.data ?? []);
    } catch (e) {
      setError(getError(e));
    } finally {
      setLoading(false);
    }
  }, []);

  const loadBranches = useCallback(async () => {
    if (!selectedOrganization) return;

    setBranchLoading(true);
    setBranchError("");

    try {
      const response = await organizationService.getBranches(
        selectedOrganization.id,
        {
          page: branchPage,
          limit: branchPageSize,
          sortBy: "createdAt",
          sortOrder: "desc",
        },
      );

      setBranches(response.data.data ?? []);
      setBranchTotalPages(response.data.totalPages ?? 1);
    } catch (e) {
      setBranchError(getError(e));
    } finally {
      setBranchLoading(false);
    }
  }, [selectedOrganization, branchPage]);

  useEffect(() => {
    if (selectedOrganization) {
      void loadBranches();
    }
  }, [selectedOrganization, loadBranches]);

  useEffect(() => {
    void load();
  }, [load]);

  const filteredOrganizations = useMemo(() => {
    const term = search.trim().toLowerCase();

    if (!term) return organizations;

    return organizations.filter((organization) =>
      [
        organization.name,
        organization.code,
        organization.email ?? "",
        organization.phone ?? "",
      ]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [organizations, search]);

  const totalPages = Math.max(
    1,
    Math.ceil(filteredOrganizations.length / pageSize),
  );

  const paginatedOrganizations = filteredOrganizations.slice(
    (page - 1) * pageSize,
    page * pageSize,
  );

  const startCreate = () => {
    setEditing(null);
    setForm(emptyForm);
    setModalError("");
    setModalOpen(true);
  };

  const startEdit = (organization: Organization) => {
    setEditing(organization);
    setForm({
      code: organization.code,
      name: organization.name,
      email: organization.email ?? "",
      phone: organization.phone ?? "",
      website: organization.website ?? "",
    });
    setModalError("");
    setModalOpen(true);
  };

  const closeModal = () => {
    if (saving) return;

    setModalOpen(false);
    setEditing(null);
    setForm(emptyForm);
    setModalError("");
  };

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSaving(true);
    setModalError("");

    try {
      if (editing) {
        await organizationService.update(editing.id, {
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          website: form.website.trim() || undefined,
        });
      } else {
        const payload: CreateOrganizationPayload = {
          code: form.code.trim(),
          name: form.name.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          website: form.website.trim() || undefined,
        };

        await organizationService.create(payload);
      }

      setModalOpen(false);
      setEditing(null);
      setForm(emptyForm);
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
      await organizationService.updateStatus(
        statusTarget.id,
        !statusTarget.isActive,
      );

      setStatusTarget(null);
      await load();
    } catch (e) {
      setError(getError(e));
    } finally {
      setStatusSaving(false);
    }
  };

  const activeCount = organizations.filter((item) => item.isActive).length;

  const startCreateBranch = () => {
    setBranchForm(emptyBranchForm);
    setBranchModalError("");
    setBranchModalOpen(true);
  };

  const submitBranch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedOrganization) return;

    setBranchSaving(true);
    setBranchModalError("");

    const payload: CreateBranchPayload = {
      name: branchForm.name.trim(),
      email: branchForm.email.trim() || undefined,
      phone: branchForm.phone.trim() || undefined,
      website: branchForm.website.trim() || undefined,
      addressLine1: branchForm.addressLine1.trim() || undefined,
      addressLine2: branchForm.addressLine2.trim() || undefined,
      city: branchForm.city.trim() || undefined,
      state: branchForm.state.trim() || undefined,
      country: branchForm.country.trim() || undefined,
      postalCode: branchForm.postalCode.trim() || undefined,
      timezone: branchForm.timezone.trim() || undefined,
    };

    try {
      await organizationService.createBranch(selectedOrganization.id, payload);

      setBranchModalOpen(false);
      setBranchForm(emptyBranchForm);
      setBranchPage(1);
      await loadBranches();
    } catch (e) {
      setBranchModalError(getError(e));
    } finally {
      setBranchSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Page heading */}

      {/* Page heading */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="mb-2 flex items-center gap-2 text-sm text-teal-700">
            <Building2 className="size-4" />
            <span className="font-medium">Platform administration</span>
          </div>

          <h1 className="text-2xl font-bold text-slate-900">Organizations</h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage organizations and the clinics operating under them.
          </p>
        </div>

        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => void load()}
            disabled={loading}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl !border !border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>

          <button className={primaryButtonClass} onClick={startCreate}>
            <Plus size={17} />
            Add organization
          </button>
        </div>
      </div>

      {/* Branch directory */}
      {selectedOrganization && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSelectedOrganization(null);
                    setBranches([]);
                    setBranchPage(1);
                    setBranchError("");
                  }}
                  className="rounded-lg !border !border-slate-200 px-3 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Back to organizations
                </button>
              </div>

              <h2 className="mt-3 font-semibold text-slate-900">
                {selectedOrganization.name} — Branches
              </h2>
              <p className="mt-1 text-sm text-slate-500">
                Manage clinics operating under this organization.
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => void loadBranches()}
                disabled={branchLoading}
                className="inline-flex h-10 items-center justify-center gap-2 rounded-xl !border !border-slate-200 bg-white px-3 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
              >
                <RefreshCw
                  size={16}
                  className={branchLoading ? "animate-spin" : ""}
                />
                Refresh
              </button>

              <button
                type="button"
                onClick={startCreateBranch}
                className={primaryButtonClass}
              >
                <Plus size={16} />
                Add branch
              </button>
            </div>
          </div>

          {branchError && (
            <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
              {branchError}
            </div>
          )}

          {/* Desktop branch table */}
          <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 md:block">
            <table className="w-full border-0 border-collapse text-left text-sm [&_th]:border-0 [&_td]:border-0">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-[0.08em] text-slate-400">
                <tr className="!border-0">
                  {["Branch", "Code", "Location", "Contact", "Status"].map(
                    (heading) => (
                      <th key={heading} className="px-4 py-3 font-semibold">
                        {heading}
                      </th>
                    ),
                  )}
                </tr>
              </thead>

              <tbody>
                {branches.map((branch) => (
                  <tr
                    key={branch.id}
                    className="!border-0 transition-colors hover:bg-slate-50/60"
                  >
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                          <Building2 size={18} />
                        </div>
                        <span className="font-semibold text-slate-800">
                          {branch.name}
                        </span>
                      </div>
                    </td>

                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {branch.code}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      {[branch.city, branch.state, branch.country]
                        .filter(Boolean)
                        .join(", ") || "—"}
                    </td>

                    <td className="px-4 py-3 text-slate-600">
                      <div>{branch.email || "—"}</div>
                      <div className="text-xs text-slate-500">
                        {branch.phone || ""}
                      </div>
                    </td>

                    <td className="px-4 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          branch.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile branch cards */}
          <div className="space-y-3 md:hidden">
            {branches.map((branch) => (
              <div
                key={branch.id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-teal-50 p-2 text-teal-700">
                    <Building2 size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">
                      {branch.name}
                    </div>
                    <div className="text-xs text-slate-500">{branch.code}</div>

                    <div className="mt-2 text-sm text-slate-600">
                      {[branch.city, branch.state, branch.country]
                        .filter(Boolean)
                        .join(", ") || "Location not set"}
                    </div>

                    <div className="mt-1 break-words text-sm text-slate-500">
                      {branch.email || branch.phone || "No contact details"}
                    </div>

                    <div className="mt-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          branch.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {branch.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {!branchLoading && branches.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">
              {branchError ? "Unable to load branches." : "No branches found."}
            </div>
          )}

          {branchLoading && (
            <div className="py-6 text-center text-sm text-slate-500">
              Loading branches…
            </div>
          )}

          {/* Branch pagination */}
          <div className="mt-4 flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-500">
              Page {branchPage} of {branchTotalPages}
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={branchPage <= 1 || branchLoading}
                onClick={() => setBranchPage((current) => current - 1)}
                className="rounded-xl !border !border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={branchPage >= branchTotalPages || branchLoading}
                onClick={() => setBranchPage((current) => current + 1)}
                className="rounded-xl !border !border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Organization directory */}
      {!selectedOrganization && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold text-slate-900">
                Organization directory
              </h2>
              <p className="text-sm text-slate-500">
                Search by organization name, code, email or phone.
              </p>
            </div>

            <div className="relative w-full sm:max-w-xs">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400"
                size={16}
              />
              <input
                className={`${inputClass} pl-9`}
                placeholder="Search organizations..."
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
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

          <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {/* Total Organizations */}
            <div className="relative overflow-hidden rounded-2xl !border-0 bg-gradient-to-br from-blue-50 via-white to-blue-100/70 p-5 shadow-sm ring-1 ring-blue-100/70">
              <div className="absolute -bottom-10 -right-6 size-32 rounded-full bg-blue-200/30 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-blue-100 text-blue-600">
                  <Building2 size={28} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Organizations
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-blue-950">
                    {totalOrganizations}
                  </p>
                </div>
              </div>
            </div>

            {/* Total Branches */}
            <div className="relative overflow-hidden rounded-2xl !border-0 bg-gradient-to-br from-blue-50 via-white to-blue-100/70 p-5 shadow-sm ring-1 ring-violet-100/70">
              <div className="absolute -bottom-10 -right-6 size-32 rounded-full bg-violet-200/30 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
                  <GitBranch size={28} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Total Branches
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-violet-950">
                    {totalBranches}
                  </p>
                </div>
              </div>
            </div>

            {/* Active Organizations */}
            <div className="relative overflow-hidden rounded-2xl !border-0 bg-gradient-to-br from-blue-50 via-white to-blue-100/70 p-5 shadow-sm ring-1 ring-emerald-100/70">
              <div className="absolute -bottom-10 -right-6 size-32 rounded-full bg-emerald-200/30 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-emerald-100 text-emerald-600">
                  <CircleCheck size={28} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Active Organizations
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-emerald-700">
                    {activeOrganizations}
                  </p>
                </div>
              </div>
            </div>

            {/* Inactive Organizations */}
            <div className="relative overflow-hidden rounded-2xl !border-0 bg-gradient-to-br from-blue-50 via-white to-blue-100/70 p-5 shadow-sm ring-1 ring-orange-100/70">
              <div className="absolute -bottom-10 -right-6 size-32 rounded-full bg-orange-200/30 blur-2xl" />
              <div className="relative flex items-center gap-4">
                <div className="flex size-14 shrink-0 items-center justify-center rounded-2xl bg-orange-100 text-orange-700">
                  <PauseCircle size={28} strokeWidth={2} />
                </div>
                <div>
                  <p className="text-sm font-medium text-slate-600">
                    Inactive Organizations
                  </p>
                  <p className="mt-1 text-3xl font-bold tracking-tight text-orange-800">
                    {inactiveOrganizations}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Desktop table */}
          <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 md:block">
            <table className="w-full border-0 border-collapse text-left text-sm [&_th]:border-0 [&_td]:border-0">
              <thead className="bg-slate-50/50 text-[10px] uppercase tracking-[0.08em] text-slate-400">
                <tr className="!border-0">
                  {[
                    "Organization",
                    "Code",
                    "Branches",
                    "Contact",
                    "Status",
                    "Actions",
                  ].map((heading) => (
                    <th
                      key={heading}
                      className="px-4 py-3 font-semibold"
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      {heading}
                    </th>
                  ))}
                </tr>
              </thead>

              <tbody>
                {paginatedOrganizations.map((organization) => (
                  <tr
                    key={organization.id}
                    className="!border-0 transition-colors hover:bg-slate-50/60"
                  >
                    <td
                      className="border-0 px-4 py-3"
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                          <Building2 size={18} />
                        </div>
                        <div className="min-w-0">
                          <div className="font-semibold text-slate-800">
                            {organization.name}
                          </div>
                        </div>
                      </div>
                    </td>

                    <td
                      className="border-0 px-4 py-3 font-mono text-xs text-slate-600"
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      {organization.code}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {organization.branchCount}
                    </td>

                    <td
                      className="border-0 px-4 py-3 text-slate-600"
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <div>{organization.email || "—"}</div>
                      <div className="text-xs text-slate-500">
                        {organization.phone || ""}
                      </div>
                    </td>

                    <td
                      className="border-0 px-4 py-3"
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          organization.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {organization.isActive ? "Active" : "Inactive"}
                      </span>
                    </td>

                    <td
                      className="border-0 px-4 py-3"
                      style={{ borderBottom: "1px solid #f1f5f9" }}
                    >
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          aria-label="View branches"
                          title="View branches"
                          onClick={() => {
                            setBranchPage(1);
                            setSelectedOrganization(organization);
                          }}
                          className="rounded-lg !border !border-slate-200 !outline-none !ring-0 p-2 text-slate-600 hover:bg-slate-50 focus-visible:!ring-2 focus-visible:!ring-teal-500/30"
                        >
                          <GitBranch size={15} />
                        </button>

                        <button
                          type="button"
                          aria-label="Edit organization"
                          onClick={() => startEdit(organization)}
                          className="rounded-lg !border !border-slate-200 !outline-none !ring-0 p-2 text-slate-600 hover:bg-slate-50 focus-visible:!ring-2 focus-visible:!ring-teal-500/30"
                        >
                          <Pencil size={15} />
                        </button>

                        <button
                          type="button"
                          aria-label={
                            organization.isActive
                              ? "Deactivate organization"
                              : "Activate organization"
                          }
                          onClick={() => setStatusTarget(organization)}
                          className="rounded-lg !border !border-slate-200 !outline-none !ring-0 p-2 text-slate-600 hover:bg-slate-50 focus-visible:!ring-2 focus-visible:!ring-teal-500/30"
                        >
                          <Power size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="space-y-3 md:hidden">
            {paginatedOrganizations.map((organization) => (
              <div
                key={organization.id}
                className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 transition-colors hover:bg-slate-50/60"
              >
                <div className="flex items-start gap-3">
                  <div className="rounded-xl bg-teal-50 p-2 text-teal-700">
                    <Building2 size={20} />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="font-semibold text-slate-900">
                      {organization.name}
                    </div>

                    <div className="text-xs text-slate-500">
                      {organization.code}
                    </div>
                    <div className="text-sm text-slate-600">
                      <span className="font-medium">Branches:</span>{" "}
                      {organization.branchCount}
                    </div>

                    <div className="mt-2 break-words text-sm text-slate-600">
                      {organization.email ||
                        organization.phone ||
                        "No contact details"}
                    </div>

                    <div className="mt-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-semibold ${
                          organization.isActive
                            ? "bg-emerald-50 text-emerald-700"
                            : "bg-slate-100 text-slate-500"
                        }`}
                      >
                        {organization.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-2 pt-3">
                  <button
                    type="button"
                    onClick={() => {
                      setBranchPage(1);
                      setSelectedOrganization(organization);
                    }}
                    className="col-span-2 rounded-xl !border !border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    View branches
                  </button>

                  <button
                    type="button"
                    onClick={() => startEdit(organization)}
                    className="rounded-xl !border !border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    onClick={() => setStatusTarget(organization)}
                    className="rounded-xl !border !border-slate-200 px-3 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
                  >
                    {organization.isActive ? "Deactivate" : "Activate"}
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-col gap-3 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-sm text-slate-500">
              Page {page} of {totalPages}
              <span className="ml-2">
                ({filteredOrganizations.length} organizations)
              </span>
            </span>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage((current) => current - 1)}
                className="rounded-xl !border !border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Previous
              </button>

              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage((current) => current + 1)}
                className="rounded-xl !border !border-slate-200 px-3 py-2 text-sm disabled:opacity-40"
              >
                Next
              </button>
            </div>
          </div>

          {!loading && filteredOrganizations.length === 0 && (
            <div className="py-10 text-center text-sm text-slate-500">
              {error
                ? "Unable to load organizations."
                : search
                  ? "No matching organizations found."
                  : "No organizations found."}
            </div>
          )}

          {loading && (
            <div className="py-6 text-center text-sm text-slate-500">
              Loading organizations…
            </div>
          )}
        </div>
      )}

      {/* Create / Edit dialog */}
      {modalOpen && (
        <div
          className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-950/40 p-4 backdrop-blur-sm"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) closeModal();
          }}
        >
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="organization-dialog-title"
            className="my-auto w-full max-w-xl overflow-hidden rounded-2xl bg-white shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4">
              <div>
                <h2
                  id="organization-dialog-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {editing ? "Edit organization" : "Create organization"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {editing
                    ? "Update the organization details."
                    : "Add a new organization to SamaRoot Health."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={saving}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
                aria-label="Close dialog"
              >
                <X className="size-5" />
              </button>
            </div>

            <form onSubmit={submit} className="space-y-4 p-6">
              {modalError && (
                <div className="rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {modalError}
                </div>
              )}

              {!editing && (
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Organization code *
                  </label>
                  <input
                    required
                    maxLength={50}
                    pattern="[A-Za-z0-9_-]+"
                    title="Use only letters, numbers, hyphens and underscores."
                    value={form.code}
                    onChange={(event) =>
                      setForm({ ...form, code: event.target.value })
                    }
                    placeholder="e.g. SAMAROOT"
                    className={inputClass}
                  />
                  <p className="mt-1 text-xs text-slate-400">
                    This code cannot be changed after creation.
                  </p>
                </div>
              )}

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Organization name *
                </label>
                <input
                  required
                  maxLength={255}
                  value={form.name}
                  onChange={(event) =>
                    setForm({ ...form, name: event.target.value })
                  }
                  placeholder="Organization name"
                  className={inputClass}
                />
              </div>

              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Email
                  </label>
                  <input
                    type="email"
                    maxLength={255}
                    value={form.email}
                    onChange={(event) =>
                      setForm({ ...form, email: event.target.value })
                    }
                    placeholder="contact@example.com"
                    className={inputClass}
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Phone
                  </label>
                  <input
                    maxLength={50}
                    value={form.phone}
                    onChange={(event) =>
                      setForm({ ...form, phone: event.target.value })
                    }
                    placeholder="Contact number"
                    className={inputClass}
                  />
                </div>
              </div>

              <div>
                <label className="mb-1.5 block text-sm font-medium text-slate-700">
                  Website
                </label>
                <input
                  type="url"
                  maxLength={255}
                  value={form.website}
                  onChange={(event) =>
                    setForm({ ...form, website: event.target.value })
                  }
                  placeholder="https://example.com"
                  className={inputClass}
                />
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={saving}
                  className="h-10 rounded-xl !border !border-slate-200 !outline-none !ring-0 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={saving}
                  className={primaryButtonClass}
                >
                  {saving
                    ? "Saving..."
                    : editing
                      ? "Save changes"
                      : "Create organization"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
      {statusTarget && (
        <div
          className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-sm"
          role="dialog"
          aria-modal="true"
          aria-labelledby="organization-status-title"
        >
          <div className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h2
                  id="organization-status-title"
                  className="text-lg font-semibold text-slate-900"
                >
                  {statusTarget.isActive
                    ? "Deactivate organization?"
                    : "Activate organization?"}
                </h2>

                <p className="mt-2 text-sm text-slate-500">
                  {statusTarget.isActive
                    ? `Are you sure you want to deactivate ${statusTarget.name}?`
                    : `Are you sure you want to activate ${statusTarget.name}?`}
                </p>
              </div>

              <button
                type="button"
                disabled={statusSaving}
                onClick={() => setStatusTarget(null)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                disabled={statusSaving}
                onClick={() => setStatusTarget(null)}
                className="h-10 rounded-xl !border !border-slate-200 px-4 text-sm font-medium text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={statusSaving}
                onClick={() => void toggleStatus()}
                className={`h-10 rounded-xl px-4 text-sm font-semibold text-white disabled:opacity-50 ${
                  statusTarget.isActive
                    ? "bg-red-600 hover:bg-red-700"
                    : "bg-teal-600 hover:bg-teal-700"
                }`}
              >
                {statusSaving
                  ? "Saving..."
                  : statusTarget.isActive
                    ? "Deactivate organization"
                    : "Activate organization"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Branch dialog */}
      {branchModalOpen && (
        <div
          className="fixed inset-0 z-[120] flex items-end justify-center bg-slate-950/40 p-0 sm:items-center sm:p-4"
          role="dialog"
          aria-modal="true"
          aria-labelledby="branch-modal-title"
        >
          <form
            onSubmit={submitBranch}
            className="max-h-[92vh] w-full overflow-y-auto rounded-t-2xl bg-white p-5 shadow-xl sm:max-w-2xl sm:rounded-2xl sm:p-6"
          >
            <div className="mb-5 flex items-start justify-between gap-3">
              <div>
                <h2
                  id="branch-modal-title"
                  className="text-lg font-bold text-slate-900"
                >
                  Add branch
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Add a new branch under {selectedOrganization?.name}.
                </p>
              </div>

              <button
                type="button"
                disabled={branchSaving}
                onClick={() => setBranchModalOpen(false)}
                className="rounded-lg p-2 text-slate-500 hover:bg-slate-100"
                aria-label="Close"
              >
                <X size={18} />
              </button>
            </div>

            {branchModalError && (
              <div className="mb-4 rounded-xl bg-rose-50 p-3 text-sm text-rose-700">
                {branchModalError}
              </div>
            )}

            <p className="mb-4 rounded-xl bg-teal-50/70 px-3 py-2.5 text-sm text-teal-800">
              Branch code will be generated automatically when the branch is
              created.
            </p>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              {(
                [
                  ["name", "Branch name"],
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
                ] as [keyof BranchForm, string][]
              ).map(([key, label]) => (
                <label key={key} className="block">
                  <span className="mb-1.5 block text-sm font-medium text-slate-700">
                    {label}
                    {key === "name" && (
                      <span className="text-rose-600"> *</span>
                    )}
                  </span>

                  <input
                    required={key === "name"}
                    disabled={branchSaving}
                    type={
                      key === "email"
                        ? "email"
                        : key === "website"
                          ? "url"
                          : "text"
                    }
                    maxLength={
                      key === "name" || key === "email" ? 255 : undefined
                    }
                    className={inputClass}
                    value={branchForm[key]}
                    onChange={(event) =>
                      setBranchForm({
                        ...branchForm,
                        [key]: event.target.value,
                      })
                    }
                    placeholder={key === "timezone" ? "Asia/Kolkata" : label}
                  />
                </label>
              ))}
            </div>

            <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={branchSaving}
                onClick={() => setBranchModalOpen(false)}
                className="h-10 rounded-xl !border !border-slate-200 px-4 text-sm font-semibold text-slate-600 hover:bg-slate-50"
              >
                Cancel
              </button>

              <button
                disabled={branchSaving}
                className={primaryButtonClass}
                type="submit"
              >
                {branchSaving ? "Saving…" : "Create branch"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
