import {
  Check,
  ChevronDown,
  Edit3,
  Filter,
  Loader2,
  Pill,
  Plus,
  Search,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  X,
} from "lucide-react";
import { useEffect, useRef, useState } from "react";

import { medicineService } from "@/services/medicine-service";
import type {
  CreateMedicineRequest,
  Medicine,
  MedicineQuery,
  UpdateMedicineRequest,
} from "@/types/medicine";
import { useAuth } from "@/auth/auth-context";

const emptyForm: CreateMedicineRequest = {
  name: "",
  genericName: "",
  manufacturer: "",
  category: "",
  strength: "",
  form: "",
  unit: "",
  price: 0,
  isActive: true,
};

const formOptions = [
  "Tablet",
  "Capsule",
  "Syrup",
  "Suspension",
  "Drops",
  "Injection",
  "Cream",
  "Ointment",
  "Gel",
  "Powder",
  "Other",
];

const categories = [
  "Analgesic",
  "Antibiotic",
  "Antihistamine",
  "Antacid",
  "Antipyretic",
  "Antifungal",
  "Antiviral",
  "Cardiovascular",
  "Gastrointestinal",
  "Respiratory",
  "Other",
];

export function MedicinesPage() {
  const { hasPermission } = useAuth();

  const canCreate = hasPermission("PHARMACY_CREATE");
  const canUpdate = hasPermission("PHARMACY_UPDATE");

  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<"all" | "active" | "inactive">("active");
  const [showFilters, setShowFilters] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateMedicineRequest>(emptyForm);
  const [error, setError] = useState("");
  const [page, setPage] = useState(1);
  const pageSize = 10;

  const loadMedicines = async () => {
    try {
      setLoading(true);

      const query: MedicineQuery = {
        page: 1,
        limit: 100,
        search: search.trim() || undefined,
        isActive:
          status === "active"
            ? true
            : status === "inactive"
              ? false
              : undefined,
      };

      const response = await medicineService.getMedicines(query);
      setMedicines(response.data ?? []);
    } catch (err) {
      console.error("Unable to load medicines.", err);
      setError("Unable to load medicines.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    const timer = window.setTimeout(() => {
      void loadMedicines();
    }, 250);

    return () => window.clearTimeout(timer);
  }, [search, status]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setError("");
    setFormOpen(true);
  };

  const openEdit = (medicine: Medicine) => {
    setEditingId(medicine.id);
    setForm({
      name: medicine.name,
      genericName: medicine.genericName ?? "",
      manufacturer: medicine.manufacturer ?? "",
      category: medicine.category ?? "",
      strength: medicine.strength ?? "",
      form: medicine.form ?? "",
      unit: medicine.unit ?? "",
      price: medicine.price,
      isActive: medicine.isActive,
    });
    setError("");
    setFormOpen(true);
  };

  const closeForm = () => {
    if (saving) return;
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setError("");
  };

  const updateField = (
    field: keyof CreateMedicineRequest,
    value: string | number | boolean,
  ) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSave = async () => {
    if (!form.name.trim()) {
      setError("Medicine name is required.");
      return;
    }

    if (!Number.isFinite(Number(form.price)) || Number(form.price) < 0) {
      setError("Enter a valid price.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        ...form,
        name: form.name.trim(),
        genericName: form.genericName?.trim() || undefined,
        manufacturer: form.manufacturer?.trim() || undefined,
        category: form.category?.trim() || undefined,
        strength: form.strength?.trim() || undefined,
        form: form.form?.trim() || undefined,
        unit: form.unit?.trim() || undefined,
        price: Number(form.price),
      };

      if (editingId) {
        const updated = await medicineService.updateMedicine(
          editingId,
          payload as UpdateMedicineRequest,
        );

        setMedicines((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      } else {
        const created = await medicineService.createMedicine(payload);
        setMedicines((current) =>
          [created, ...current].sort((a, b) => a.name.localeCompare(b.name)),
        );
      }

      closeForm();
    } catch (err) {
      console.error("Unable to save medicine.", err);
      setError("Unable to save medicine. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async (medicine: Medicine) => {
    if (!canUpdate) return;

    try {
      const updated = await medicineService.updateMedicine(medicine.id, {
        isActive: !medicine.isActive,
      });

      if (
        (status === "active" && !updated.isActive) ||
        (status === "inactive" && updated.isActive)
      ) {
        setMedicines((current) =>
          current.filter((item) => item.id !== medicine.id),
        );
      } else {
        setMedicines((current) =>
          current.map((item) => (item.id === updated.id ? updated : item)),
        );
      }
    } catch (err) {
      console.error("Unable to update medicine status.", err);
      setError("Unable to update medicine status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <div className="flex items-center gap-3">
            <span
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-600"
              aria-hidden="true"
            >
              <Pill className="size-5" strokeWidth={1.8} />
            </span>
            <div className="flex min-w-0 items-center gap-2">
              <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
                Medicines
              </h1>
              {medicines.length > 0 && (
                <span className="rounded-full bg-teal-50 px-2.5 py-1 text-[11px] font-semibold text-teal-700">
                  {medicines.length}
                </span>
              )}
            </div>
          </div>
          <p className="mt-1 text-sm text-slate-500">
            Manage the medicine catalogue used for prescriptions.
          </p>
        </div>

        {canCreate && !formOpen && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white shadow-sm transition-all hover:bg-teal-700 hover:shadow-md focus:outline-none focus:ring-2 focus:ring-teal-500/30 sm:w-auto"
          >
            <Plus size={16} />
            Add medicine
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between gap-4 rounded-2xl bg-red-50 px-5 py-4 text-sm text-red-700 ring-1 ring-red-100">
          <span>{error}</span>
          <button
            type="button"
            onClick={() => setError("")}
            className="rounded-lg p-1 text-red-400 hover:bg-red-100"
          >
            <X size={15} />
          </button>
        </div>
      )}

      {formOpen && (
        <div className="rounded-2xl bg-white p-5 shadow-[0_8px_30px_rgba(15,23,42,0.045)] ring-1 ring-slate-200/60 sm:p-6">
          <div className="mb-5 flex items-start justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                {editingId ? "Edit medicine" : "Add medicine"}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Maintain the medicine details available to clinicians.
              </p>
            </div>

            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
              aria-label="Close form"
            >
              <X size={16} />
            </button>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <Field
              label="Medicine name"
              value={String(form.name ?? "")}
              placeholder="e.g. Paracetamol 500 mg"
              onChange={(value) => updateField("name", value)}
              disabled={saving}
            />

            <Field
              label="Generic name"
              value={String(form.genericName ?? "")}
              placeholder="e.g. Paracetamol"
              onChange={(value) => updateField("genericName", value)}
              disabled={saving}
            />

            <Field
              label="Manufacturer"
              value={String(form.manufacturer ?? "")}
              placeholder="e.g. ABC Pharmaceuticals"
              onChange={(value) => updateField("manufacturer", value)}
              disabled={saving}
            />

            <CustomSelect
              label="Category"
              value={String(form.category ?? "")}
              options={categories}
              placeholder="Select category"
              onChange={(value) => updateField("category", value)}
              disabled={saving}
            />

            <Field
              label="Strength"
              value={String(form.strength ?? "")}
              placeholder="e.g. 500 mg"
              onChange={(value) => updateField("strength", value)}
              disabled={saving}
            />

            <CustomSelect
              label="Form"
              value={String(form.form ?? "")}
              options={formOptions}
              placeholder="Select form"
              onChange={(value) => updateField("form", value)}
              disabled={saving}
            />

            <Field
              label="Unit"
              value={String(form.unit ?? "")}
              placeholder="e.g. tablet"
              onChange={(value) => updateField("unit", value)}
              disabled={saving}
            />

            <Field
              label="Price"
              value={String(form.price ?? "")}
              placeholder="0.00"
              type="number"
              onChange={(value) => updateField("price", Number(value))}
              disabled={saving}
            />
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={closeForm}
              disabled={saving}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 ring-1 ring-slate-200/70 transition hover:bg-slate-50 hover:text-slate-700"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleSave()}
              disabled={saving}
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 disabled:opacity-50"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving
                ? "Saving..."
                : editingId
                  ? "Update medicine"
                  : "Save medicine"}
            </button>
          </div>
        </div>
      )}

      <section className="rounded-2xl bg-white p-4 shadow-[0_8px_30px_rgba(15,23,42,0.045)] ring-1 ring-slate-200/60 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              type="text"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search by medicine, generic name or manufacturer"
              className="h-11 w-full rounded-xl bg-slate-50/70 pl-10 pr-10 text-sm text-slate-700 outline-none ring-1 ring-slate-200/60 transition-all placeholder:text-slate-400 focus:bg-white focus:ring-2 focus:ring-teal-500/20"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch("")}
                aria-label="Clear search"
                className="absolute right-3 top-1/2 flex size-6 -translate-y-1/2 items-center justify-center rounded-full text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-600"
              >
                <X size={14} />
              </button>
            )}
          </div>
          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={`inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-medium transition-colors ${showFilters ? "bg-teal-50 text-teal-700" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
          >
            <Filter size={16} /> Filters{" "}
            <ChevronDown
              size={15}
              className={`transition-transform ${showFilters ? "rotate-180" : ""}`}
            />
          </button>
        </div>
        {showFilters && (
          <div className="relative mt-4 flex flex-wrap items-center gap-2 border-0 pt-4 before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-slate-100">
            <span className="mr-1 text-xs font-medium text-slate-400">
              Status
            </span>
            {(
              [
                ["all", "All"],
                ["active", "Active"],
                ["inactive", "Inactive"],
              ] as const
            ).map(([value, label]) => (
              <button
                key={value}
                type="button"
                onClick={() => setStatus(value)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${status === value ? "bg-teal-50 text-teal-700" : "bg-slate-50 text-slate-500 hover:bg-slate-100"}`}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className="overflow-hidden rounded-2xl bg-white shadow-[0_8px_30px_rgba(15,23,42,0.045)] ring-1 ring-slate-200/60">
        <div className="flex items-center justify-between px-5 py-5 sm:px-6">
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Medicine directory
            </h2>
            <p className="mt-1 text-xs text-slate-400">
              {loading
                ? "Loading medicines..."
                : medicines.length === 0
                  ? "No medicines"
                  : `Showing ${(page - 1) * pageSize + 1}–${Math.min(page * pageSize, medicines.length)} of ${medicines.length}`}
            </p>
          </div>
          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Loader2 className="size-3.5 animate-spin text-teal-500" />{" "}
              Loading
            </div>
          )}
        </div>

        <div className="hidden overflow-x-auto md:block">
          <div className="min-w-[1000px] grid grid-cols-[minmax(180px,1.5fr)_minmax(140px,1.15fr)_minmax(120px,1fr)_minmax(76px,0.6fr)_minmax(86px,0.7fr)_minmax(90px,0.7fr)_minmax(104px,0.8fr)] items-center gap-3 bg-slate-50/70 px-5 py-3 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400 xl:px-6">
            <span>Medicine</span>
            <span>Generic / strength</span>
            <span>Manufacturer</span>
            <span>Form</span>
            <span>Status</span>
            <span className="text-right">Price</span>
            <span className="text-right">Actions</span>
          </div>
          {loading && medicines.length === 0 ? (
            <div className="space-y-0">
              {Array.from({ length: 6 }).map((_, index) => (
                <div
                  key={index}
                  className="grid grid-cols-[minmax(180px,1.5fr)_minmax(140px,1.15fr)_minmax(120px,1fr)_minmax(76px,0.6fr)_minmax(86px,0.7fr)_minmax(90px,0.7fr)_minmax(104px,0.8fr)] items-center gap-3 px-5 py-5 xl:px-6"
                >
                  <div className="flex items-center gap-3">
                    <div className="size-9 animate-pulse rounded-full bg-slate-100" />
                    <div className="h-3.5 w-32 animate-pulse rounded bg-slate-100" />
                  </div>
                  <div className="h-3.5 w-28 animate-pulse rounded bg-slate-100" />
                  <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
                  <div className="h-3.5 w-16 animate-pulse rounded bg-slate-100" />
                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                  <div className="h-3.5 w-14 justify-self-end animate-pulse rounded bg-slate-100" />
                  <div className="h-7 w-20 justify-self-end animate-pulse rounded bg-slate-100" />
                </div>
              ))}
            </div>
          ) : medicines.length === 0 ? (
            <MedicineEmptyState
              search={search}
              canCreate={canCreate}
              onCreate={openCreate}
            />
          ) : (
            <div>
              {medicines
                .slice((page - 1) * pageSize, page * pageSize)
                .map((medicine, index) => (
                  <MedicineRow
                    key={medicine.id}
                    medicine={medicine}
                    index={index}
                    canUpdate={canUpdate}
                    onEdit={() => openEdit(medicine)}
                    onToggle={() => void handleToggleStatus(medicine)}
                  />
                ))}
            </div>
          )}
        </div>

        <div className="md:hidden">
          {loading && medicines.length === 0 ? (
            <div className="space-y-4 px-5 py-5">
              {Array.from({ length: 5 }).map((_, index) => (
                <div key={index} className="flex gap-3">
                  <div className="size-10 animate-pulse rounded-full bg-slate-100" />
                  <div className="flex-1 space-y-2">
                    <div className="h-3.5 w-36 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                  </div>
                </div>
              ))}
            </div>
          ) : medicines.length === 0 ? (
            <MedicineEmptyState
              search={search}
              canCreate={canCreate}
              onCreate={openCreate}
            />
          ) : (
            <div>
              {medicines
                .slice((page - 1) * pageSize, page * pageSize)
                .map((medicine, index) => (
                  <MedicineMobileCard
                    key={medicine.id}
                    medicine={medicine}
                    index={index}
                    canUpdate={canUpdate}
                    onEdit={() => openEdit(medicine)}
                    onToggle={() => void handleToggleStatus(medicine)}
                  />
                ))}
            </div>
          )}
        </div>

        {medicines.length > 0 && (
          <div className="flex flex-col gap-3 px-5 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-600">
                {(page - 1) * pageSize + 1}
              </span>
              –
              <span className="font-medium text-slate-600">
                {Math.min(page * pageSize, medicines.length)}
              </span>{" "}
              of{" "}
              <span className="font-medium text-slate-600">
                {medicines.length}
              </span>
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={() => setPage((current) => Math.max(1, current - 1))}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>
              <span className="min-w-16 text-center text-xs font-medium text-slate-500">
                {page} / {Math.max(Math.ceil(medicines.length / pageSize), 1)}
              </span>
              <button
                type="button"
                disabled={
                  page >= Math.ceil(medicines.length / pageSize) || loading
                }
                onClick={() =>
                  setPage((current) =>
                    Math.min(
                      Math.ceil(medicines.length / pageSize),
                      current + 1,
                    ),
                  )
                }
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30"
                aria-label="Next page"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}

function MedicineRow({
  medicine,
  index,
  canUpdate,
  onEdit,
  onToggle,
}: {
  medicine: Medicine;
  index: number;
  canUpdate: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  return (
    <div className="group relative min-w-[1000px] border-0 transition-colors duration-150 hover:bg-slate-50/60">
      {index > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-[1] h-px"
          style={{ backgroundColor: "#e5e7eb" }}
        />
      )}
      <div className="grid grid-cols-[minmax(180px,1.5fr)_minmax(140px,1.15fr)_minmax(120px,1fr)_minmax(76px,0.6fr)_minmax(86px,0.7fr)_minmax(90px,0.7fr)_minmax(104px,0.8fr)] items-center gap-3 px-5 py-4 xl:px-6">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
            <Pill size={17} />
          </div>
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-700">
              {medicine.name}
            </p>
            <p className="mt-1 truncate text-[11px] text-slate-400">
              {medicine.category || medicine.unit || "Medicine"}
            </p>
          </div>
        </div>
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-600">
            {medicine.genericName || "—"}
          </p>
          <p className="mt-1 truncate text-[11px] text-slate-400">
            {medicine.strength || "Strength not set"}
          </p>
        </div>
        <p className="truncate text-sm text-slate-600">
          {medicine.manufacturer || "—"}
        </p>
        <p className="truncate text-sm text-slate-600">
          {medicine.form || "—"}
        </p>
        <span
          className={`w-fit whitespace-nowrap rounded-full px-2.5 py-1 text-[10px] font-semibold ${medicine.isActive ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}
        >
          {medicine.isActive ? "Active" : "Inactive"}
        </span>
        <span className="text-right text-sm font-semibold tabular-nums text-slate-700">
          ₹{Number(medicine.price).toFixed(2)}
        </span>
        <div className="flex items-center justify-end gap-1">
          {canUpdate ? (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={`Edit ${medicine.name}`}
                title="Edit medicine"
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                onClick={onToggle}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={
                  medicine.isActive
                    ? `Deactivate ${medicine.name}`
                    : `Activate ${medicine.name}`
                }
                title={
                  medicine.isActive
                    ? "Deactivate medicine"
                    : "Activate medicine"
                }
              >
                {medicine.isActive ? (
                  <ToggleRight size={18} />
                ) : (
                  <ToggleLeft size={18} />
                )}
              </button>
            </>
          ) : (
            <span className="text-xs text-slate-300">—</span>
          )}
        </div>
      </div>
    </div>
  );
}

function MedicineMobileCard({
  medicine,
  index,
  canUpdate,
  onEdit,
  onToggle,
}: {
  medicine: Medicine;
  index: number;
  canUpdate: boolean;
  onEdit: () => void;
  onToggle: () => void;
}) {
  const details = [
    medicine.genericName,
    medicine.strength,
    medicine.form,
    medicine.unit,
  ].filter(Boolean);
  return (
    <div
      className="relative flex gap-3 border-0 px-5 py-4 transition-colors hover:bg-slate-50/60"
      style={{ borderTop: "0", borderBottom: "0" }}
    >
      {index > 0 && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 h-px"
          style={{ backgroundColor: "rgba(226, 232, 240, 0.6)" }}
        />
      )}
      <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-teal-50 text-teal-700">
        <Pill size={18} />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <p className="truncate text-sm font-semibold text-slate-700">
            {medicine.name}
          </p>
          <span
            className={`rounded-full px-2 py-1 text-[10px] font-semibold ${medicine.isActive ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}`}
          >
            {medicine.isActive ? "Active" : "Inactive"}
          </span>
        </div>
        <p className="mt-1 text-xs leading-5 text-slate-500">
          {details.length
            ? details.join(" · ")
            : medicine.category || "Medicine details not set"}
        </p>
        <p className="mt-1 text-xs text-slate-400">
          {medicine.manufacturer || "Manufacturer not set"}
        </p>
        <div className="mt-2 flex items-center justify-between gap-3">
          <span className="text-sm font-semibold text-slate-700">
            ₹{Number(medicine.price).toFixed(2)}
          </span>
          {canUpdate && (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onEdit}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={`Edit ${medicine.name}`}
              >
                <Edit3 size={15} />
              </button>
              <button
                type="button"
                onClick={onToggle}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-700"
                aria-label={
                  medicine.isActive
                    ? `Deactivate ${medicine.name}`
                    : `Activate ${medicine.name}`
                }
              >
                {medicine.isActive ? (
                  <ToggleRight size={18} />
                ) : (
                  <ToggleLeft size={18} />
                )}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function MedicineEmptyState({
  search,
  canCreate,
  onCreate,
}: {
  search: string;
  canCreate: boolean;
  onCreate: () => void;
}) {
  return (
    <div className="flex min-h-56 flex-col items-center justify-center px-6 py-10 text-center">
      <div className="mb-3 flex size-11 items-center justify-center rounded-full bg-teal-50 text-teal-700">
        <Pill size={19} />
      </div>
      <h3 className="text-sm font-semibold text-slate-700">
        No medicines found
      </h3>
      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {search
          ? "Try a different search term."
          : "Add your first medicine to make it available for prescriptions."}
      </p>
      {canCreate && !search && (
        <button
          type="button"
          onClick={onCreate}
          className="mt-4 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
        >
          Add medicine
        </button>
      )}
    </div>
  );
}

function Field({
  label,
  value,
  placeholder,
  onChange,
  disabled,
  type = "text",
}: {
  label: string;
  value: string;
  placeholder: string;
  onChange: (value: string) => void;
  disabled: boolean;
  type?: "text" | "number";
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>
      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        min={type === "number" ? 0 : undefined}
        step={type === "number" ? "0.01" : undefined}
        className="w-full rounded-xl bg-white px-3.5 py-3 text-sm text-slate-700 outline-none shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] transition placeholder:text-slate-300 focus:ring-2 focus:ring-teal-500/20 disabled:bg-slate-50 disabled:text-slate-400"
      />
    </div>
  );
}

function CustomSelect({
  label,
  value,
  options,
  placeholder,
  onChange,
  disabled = false,
  compact = false,
  displayOptions,
}: {
  label?: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  compact?: boolean;
  displayOptions?: Record<string, string>;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const closeOnOutsideClick = (event: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("click", closeOnOutsideClick);

    return () => {
      document.removeEventListener("click", closeOnOutsideClick);
    };
  }, [open]);

  const selectedLabel = (displayOptions?.[value] ?? value) || placeholder;

  return (
    <div ref={containerRef} className={`relative ${compact ? "sm:w-48" : ""}`}>
      {label && (
        <label className="mb-1.5 block text-xs font-medium text-slate-600">
          {label}
        </label>
      )}

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-xl bg-white px-3.5 py-3 text-left text-sm outline-none shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] transition ${
          open ? "ring-2 ring-teal-50" : "hover:bg-slate-50/40"
        } ${value ? "text-slate-700" : "text-slate-300"} disabled:bg-slate-50`}
      >
        <span className="truncate">{selectedLabel}</span>
        <ChevronDown
          size={15}
          className={`ml-2 shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.10),inset_0_0_0_1px_rgba(226,232,240,0.95)]">
          <div className="max-h-56 overflow-y-auto">
            {options.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => {
                  onChange(option);
                  setOpen(false);
                }}
                className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                  value === option
                    ? "bg-teal-50 font-medium text-teal-700"
                    : "text-slate-600 hover:bg-slate-50"
                }`}
              >
                <span>{displayOptions?.[option] ?? option}</span>
                {value === option && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
