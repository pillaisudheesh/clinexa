import {
  Check,
  ChevronDown,
  Edit3,
  Loader2,
  Plus,
  Search,
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
  const [statusOpen, setStatusOpen] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateMedicineRequest>(emptyForm);
  const [error, setError] = useState("");

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
          <h2 className="text-xl font-semibold tracking-tight text-slate-800">
            Medicines
          </h2>
          <p className="mt-1 text-sm text-slate-400">
            Manage the medicine catalogue used for prescriptions.
          </p>
        </div>

        {canCreate && !formOpen && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 sm:w-auto"
          >
            <Plus size={16} />
            Add medicine
          </button>
        )}
      </div>

      {error && (
        <div className="flex items-center justify-between rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600 !border !border-red-100">
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
        <div className="rounded-2xl bg-white p-5 shadow-sm !border !border-slate-100 sm:p-6">
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
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-sm !border !border-slate-100 transition hover:bg-slate-50 hover:text-slate-700"
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

      <div className="rounded-2xl bg-white p-4 shadow-sm !border !border-slate-100 sm:p-5">
        <div className="flex flex-col gap-3 sm:flex-row">
          <div className="relative flex-1">
            <Search
              size={16}
              className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400"
            />
            <input
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              placeholder="Search medicines..."
              className="w-full rounded-xl bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] transition placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-teal-50"
            />
          </div>

          <CustomSelect
            value={status}
            options={["all", "active", "inactive"]}
            displayOptions={{
              all: "All medicines",
              active: "Active",
              inactive: "Inactive",
            }}
            placeholder="Status"
            onChange={(value) =>
              setStatus(value as "all" | "active" | "inactive")
            }
            compact
          />
        </div>
      </div>

      {loading ? (
        <div className="flex min-h-56 items-center justify-center rounded-2xl bg-white shadow-sm !border !border-slate-100">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <Loader2 size={17} className="animate-spin" />
            Loading medicines...
          </div>
        </div>
      ) : medicines.length === 0 ? (
        <div className="flex min-h-56 flex-col items-center justify-center rounded-2xl bg-white px-6 text-center shadow-sm !border !border-slate-100">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Plus size={18} />
          </div>
          <h3 className="text-sm font-semibold text-slate-700">
            No medicines found
          </h3>
          <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
            {search
              ? "Try a different search term."
              : "Add your first medicine to make it available for prescriptions."}
          </p>

          {canCreate && !search && status !== "inactive" && (
            <button
              type="button"
              onClick={openCreate}
              className="mt-4 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white shadow-sm hover:bg-teal-700"
            >
              Add medicine
            </button>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {medicines.map((medicine) => (
            <MedicineCard
              key={medicine.id}
              medicine={medicine}
              canUpdate={canUpdate}
              onEdit={() => openEdit(medicine)}
              onToggle={() => void handleToggleStatus(medicine)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function MedicineCard({
  medicine,
  canUpdate,
  onEdit,
  onToggle,
}: {
  medicine: Medicine;
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
    <div className="rounded-2xl bg-white p-4 shadow-sm !border !border-slate-100 sm:p-5">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-sm font-semibold text-slate-700">
              {medicine.name}
            </h3>

            <span
              className={`rounded-full px-2 py-1 text-[10px] font-semibold ${
                medicine.isActive
                  ? "bg-teal-50 text-teal-700"
                  : "bg-slate-100 text-slate-500"
              }`}
            >
              {medicine.isActive ? "Active" : "Inactive"}
            </span>
          </div>

          {details.length > 0 && (
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              {details.join(" · ")}
            </p>
          )}

          {medicine.manufacturer && (
            <p className="mt-1 text-xs text-slate-400">
              {medicine.manufacturer}
            </p>
          )}
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <span className="mr-1 text-sm font-semibold text-slate-700">
            ₹{Number(medicine.price).toFixed(2)}
          </span>

          {canUpdate && (
            <>
              <button
                type="button"
                onClick={onEdit}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
                aria-label={`Edit ${medicine.name}`}
              >
                <Edit3 size={15} />
              </button>

              <button
                type="button"
                onClick={onToggle}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-700"
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
            </>
          )}
        </div>
      </div>
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
        className="w-full rounded-xl bg-white px-3.5 py-3 text-sm text-slate-700 outline-none shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] transition placeholder:text-slate-300 focus:ring-2 focus:ring-teal-50 disabled:bg-slate-50 disabled:text-slate-400"
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
