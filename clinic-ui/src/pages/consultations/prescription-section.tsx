import {
  Check,
  ChevronDown,
  Edit3,
  Loader2,
  Plus,
  Trash2,
  X,
} from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";

import { medicineService } from "@/services/medicine-service";

import type {
  CreatePrescriptionRequest,
  Prescription,
  UpdatePrescriptionRequest,
} from "@/types/prescription";
import type { Medicine } from "@/types/medicine";

interface PrescriptionSectionProps {
  medicalRecordId: string;
  prescriptions: Prescription[];
  loading: boolean;
  saving: boolean;
  deletingId: string | null;
  readOnly: boolean;
  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  onCreate: (data: CreatePrescriptionRequest) => Promise<void>;
  onUpdate: (id: string, data: UpdatePrescriptionRequest) => Promise<void>;
  onDelete: (id: string) => Promise<void>;
}

interface PrescriptionFormState {
  medicineId: string;
  dosage: string;
  frequency: string;
  route: string;
  duration: string;
  quantity: string;
  instructions: string;
}

const emptyForm: PrescriptionFormState = {
  medicineId: "",
  dosage: "",
  frequency: "",
  route: "",
  duration: "",
  quantity: "",
  instructions: "",
};

const frequencies = [
  "Once daily",
  "Twice daily",
  "Three times daily",
  "Four times daily",
  "Every 4 hours",
  "Every 6 hours",
  "Every 8 hours",
  "As needed",
];

const routes = [
  "Oral",
  "Topical",
  "Sublingual",
  "Inhalation",
  "Nasal",
  "Ophthalmic",
  "Otic",
  "Rectal",
  "Other",
];

export function PrescriptionSection({
  medicalRecordId,
  prescriptions,
  loading,
  saving,
  deletingId,
  readOnly,
  canCreate,
  canUpdate,
  canDelete,
  onCreate,
  onUpdate,
  onDelete,
}: PrescriptionSectionProps) {
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<PrescriptionFormState>(emptyForm);

  const [medicineSearch, setMedicineSearch] = useState("");
  const [medicines, setMedicines] = useState<Medicine[]>([]);
  const [medicineLoading, setMedicineLoading] = useState(false);
  const [medicineMenuOpen, setMedicineMenuOpen] = useState(false);

  const medicineMenuRef = useRef<HTMLDivElement | null>(null);

  const selectedMedicine = useMemo(
    () => medicines.find((item) => item.id === form.medicineId) ?? null,
    [medicines, form.medicineId],
  );

  useEffect(() => {
    if (!medicineMenuOpen) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        medicineMenuRef.current &&
        !medicineMenuRef.current.contains(event.target as Node)
      ) {
        setMedicineMenuOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [medicineMenuOpen]);

  useEffect(() => {
    if (!formOpen) return;

    const timer = window.setTimeout(async () => {
      try {
        setMedicineLoading(true);

        const response = await medicineService.getMedicines({
          page: 1,
          limit: 20,
          search: medicineSearch.trim() || undefined,
          isActive: true,
        });

        setMedicines(response.data ?? []);
      } catch (error) {
        console.error("Unable to load medicines.", error);
        setMedicines([]);
      } finally {
        setMedicineLoading(false);
      }
    }, 250);

    return () => window.clearTimeout(timer);
  }, [medicineSearch, formOpen]);

  const resetForm = () => {
    setForm(emptyForm);
    setMedicineSearch("");
    setMedicineMenuOpen(false);
    setEditingId(null);
    setFormOpen(false);
  };

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setMedicineSearch("");
    setFormOpen(true);
  };

  const openEdit = async (prescription: Prescription) => {
    setEditingId(prescription.id);

    setForm({
      medicineId: prescription.medicineId,
      dosage: prescription.dosage,
      frequency: prescription.frequency,
      route: prescription.route ?? "",
      duration: prescription.duration ?? "",
      quantity: prescription.quantity ?? "",
      instructions: prescription.instructions ?? "",
    });

    setMedicineSearch(prescription.medicationName);
    setFormOpen(true);

    try {
      const medicine = await medicineService.getMedicine(
        prescription.medicineId,
      );

      setMedicines((current) =>
        current.some((item) => item.id === medicine.id)
          ? current
          : [medicine, ...current],
      );
    } catch (error) {
      console.error("Unable to load selected medicine.", error);
    }
  };

  const updateField = (field: keyof PrescriptionFormState, value: string) => {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    if (!form.medicineId || !form.dosage.trim() || !form.frequency.trim()) {
      return;
    }

    if (editingId) {
      await onUpdate(editingId, {
        medicineId: form.medicineId,
        dosage: form.dosage.trim(),
        frequency: form.frequency.trim(),
        route: form.route.trim() || undefined,
        duration: form.duration.trim() || undefined,
        quantity: form.quantity.trim() || undefined,
        instructions: form.instructions.trim() || undefined,
      });
    } else {
      await onCreate({
        medicalRecordId,
        medicineId: form.medicineId,
        dosage: form.dosage.trim(),
        frequency: form.frequency.trim(),
        route: form.route.trim() || undefined,
        duration: form.duration.trim() || undefined,
        quantity: form.quantity.trim() || undefined,
        instructions: form.instructions.trim() || undefined,
      });
    }

    resetForm();
  };

  const filteredMedicines = medicines;

  return (
    <div className="space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-sm font-semibold text-slate-700">
            Prescriptions
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Medicines prescribed during this consultation.
          </p>
        </div>

        {!readOnly && canCreate && !formOpen && (
          <button
            type="button"
            onClick={openCreate}
            className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-3.5 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sm transition hover:bg-teal-700 sm:w-auto"
          >
            <Plus size={15} />
            Add prescription
          </button>
        )}
      </div>

      {formOpen && (
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
          <div className="mb-5 flex items-center justify-between">
            <div>
              <h3 className="text-sm font-semibold text-slate-700">
                {editingId ? "Edit prescription" : "Add prescription"}
              </h3>
              <p className="mt-1 text-xs text-slate-400">
                Enter the medication and directions for the patient.
              </p>
            </div>

            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 disabled:opacity-50"
              aria-label="Close prescription form"
            >
              <X size={16} />
            </button>
          </div>

          <div className="space-y-4">
            <div ref={medicineMenuRef} className="relative">
              <label className="mb-1.5 block text-xs font-medium text-slate-600">
                Medicine
              </label>

              <button
                type="button"
                disabled={saving}
                onClick={() => setMedicineMenuOpen((open) => !open)}
                className={`flex w-full appearance-none items-center justify-between rounded-xl bg-white px-3.5 py-3 text-left text-sm text-slate-700 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] outline-none transition ${
                  medicineMenuOpen
                    ? "bg-white shadow-[inset_0_0_0_1px_rgba(45,212,191,0.45),0_0_0_3px_rgba(240,253,250,1)]"
                    : "hover:bg-slate-50/40"
                } disabled:cursor-not-allowed disabled:bg-slate-50`}
              >
                <span
                  className={
                    selectedMedicine || medicineSearch
                      ? "font-medium text-slate-700"
                      : "text-slate-300"
                  }
                >
                  {selectedMedicine?.name ||
                    medicineSearch ||
                    "Select medicine"}
                </span>

                <ChevronDown
                  size={16}
                  className={`shrink-0 text-slate-400 transition-transform ${
                    medicineMenuOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {medicineMenuOpen && (
                <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.10)]">
                  <input
                    autoFocus
                    value={medicineSearch}
                    onChange={(event) => {
                      setMedicineSearch(event.target.value);
                      setForm((current) => ({
                        ...current,
                        medicineId: "",
                      }));
                    }}
                    placeholder="Search medicine..."
                    className="mb-1.5 w-full rounded-lg bg-slate-50/50 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] px-3 py-2.5 text-sm text-slate-700 outline-none transition placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-teal-50"
                  />

                  <div className="max-h-56 overflow-y-auto">
                    {medicineLoading ? (
                      <div className="flex items-center justify-center gap-2 px-3 py-5 text-xs text-slate-400">
                        <Loader2 size={14} className="animate-spin" />
                        Searching medicines...
                      </div>
                    ) : filteredMedicines.length === 0 ? (
                      <div className="px-3 py-5 text-center text-xs text-slate-400">
                        No active medicines found.
                      </div>
                    ) : (
                      filteredMedicines.map((medicine) => (
                        <button
                          key={medicine.id}
                          type="button"
                          onClick={() => {
                            updateField("medicineId", medicine.id);
                            setMedicineSearch(medicine.name);
                            setMedicineMenuOpen(false);
                          }}
                          className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left transition ${
                            medicine.id === form.medicineId
                              ? "bg-teal-50 font-semibold text-teal-700"
                              : "text-slate-600 hover:bg-slate-50 hover:text-slate-800"
                          }`}
                        >
                          <span className="min-w-0">
                            <span className="block truncate text-sm">
                              {medicine.name}
                            </span>
                            <span className="mt-0.5 block truncate text-[11px] text-slate-400">
                              {[
                                medicine.genericName,
                                medicine.strength,
                                medicine.form,
                              ]
                                .filter(Boolean)
                                .join(" · ") || "Medicine"}
                            </span>
                          </span>

                          {medicine.id === form.medicineId && (
                            <Check size={15} className="shrink-0" />
                          )}
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <InputField
                label="Dosage"
                value={form.dosage}
                onChange={(value) => updateField("dosage", value)}
                placeholder="e.g. 500 mg"
                disabled={saving}
              />

              <SelectField
                label="Frequency"
                value={form.frequency}
                options={frequencies}
                placeholder="Select frequency"
                onChange={(value) => updateField("frequency", value)}
                disabled={saving}
              />

              <SelectField
                label="Route"
                value={form.route}
                options={routes}
                placeholder="Select route"
                onChange={(value) => updateField("route", value)}
                disabled={saving}
              />

              <InputField
                label="Duration"
                value={form.duration}
                onChange={(value) => updateField("duration", value)}
                placeholder="e.g. 5 days"
                disabled={saving}
              />

              <InputField
                label="Quantity"
                value={form.quantity}
                onChange={(value) => updateField("quantity", value)}
                placeholder="e.g. 10 tablets"
                disabled={saving}
              />
            </div>

            <InputField
              label="Instructions"
              value={form.instructions}
              onChange={(value) => updateField("instructions", value)}
              placeholder="e.g. Take after food"
              disabled={saving}
            />
          </div>

          <div className="mt-5 flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={resetForm}
              disabled={saving}
              className="rounded-xl bg-white px-4 py-2.5 text-sm font-semibold text-slate-500 shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] transition hover:bg-slate-50 hover:text-slate-700 disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={() => void handleSubmit()}
              disabled={
                saving ||
                !form.medicineId ||
                !form.dosage.trim() ||
                !form.frequency.trim()
              }
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm shadow-sm transition hover:bg-teal-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {saving && <Loader2 size={15} className="animate-spin" />}
              {saving
                ? "Saving..."
                : editingId
                  ? "Update prescription"
                  : "Add prescription"}
            </button>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex min-h-48 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-100">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Loader2 size={16} className="animate-spin" />
            Loading prescriptions...
          </div>
        </div>
      ) : prescriptions.length === 0 ? (
        <div className="flex min-h-48 flex-col items-center justify-center rounded-2xl bg-slate-50/50 p-6 text-center ring-1 ring-slate-100">
          <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
            <Plus size={18} />
          </div>

          <h3 className="text-sm font-semibold text-slate-700">
            No prescriptions
          </h3>

          <p className="mt-1 max-w-sm text-xs text-slate-400">
            Add a prescription to record the medication prescribed during this
            consultation.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {prescriptions.map((prescription) => (
            <PrescriptionCard
              key={prescription.id}
              prescription={prescription}
              readOnly={readOnly}
              canUpdate={canUpdate}
              canDelete={canDelete}
              deleting={deletingId === prescription.id}
              onEdit={() => openEdit(prescription)}
              onDelete={() => void onDelete(prescription.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function PrescriptionCard({
  prescription,
  readOnly,
  canUpdate,
  canDelete,
  deleting,
  onEdit,
  onDelete,
}: {
  prescription: Prescription;
  readOnly: boolean;
  canUpdate: boolean;
  canDelete: boolean;
  deleting: boolean;
  onEdit: () => void;
  onDelete: () => void;
}) {
  const details = [
    prescription.dosage,
    prescription.frequency,
    prescription.route,
    prescription.duration,
    prescription.quantity,
  ].filter(Boolean);

  return (
    <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100 sm:p-5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-sm font-semibold text-slate-700">
            {prescription.medicationName}
          </h3>

          {details.length > 0 && (
            <p className="mt-1.5 text-xs leading-5 text-slate-500">
              {details.join(" · ")}
            </p>
          )}

          {prescription.instructions && (
            <div className="mt-3 rounded-xl bg-slate-50/70 px-3 py-2.5 ring-1 ring-slate-100">
              <p className="text-xs leading-5 text-slate-500">
                <span className="font-medium text-slate-600">
                  Instructions:
                </span>{" "}
                {prescription.instructions}
              </p>
            </div>
          )}
        </div>

        {!readOnly && (canUpdate || canDelete) && (
          <div className="flex shrink-0 items-center gap-1">
            {canUpdate && (
              <button
                type="button"
                onClick={onEdit}
                disabled={deleting}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-50 hover:text-slate-600 disabled:opacity-40"
                aria-label={`Edit ${prescription.medicationName}`}
              >
                <Edit3 size={15} />
              </button>
            )}

            {canDelete && (
              <button
                type="button"
                onClick={onDelete}
                disabled={deleting}
                className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-red-50 hover:text-red-500 disabled:opacity-40"
                aria-label={`Delete ${prescription.medicationName}`}
              >
                {deleting ? (
                  <Loader2 size={15} className="animate-spin" />
                ) : (
                  <Trash2 size={15} />
                )}
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function InputField({
  label,
  value,
  onChange,
  placeholder,
  disabled,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  disabled: boolean;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>

      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        disabled={disabled}
        className="w-full rounded-xl bg-white px-3.5 py-3 text-sm shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] text-slate-700 outline-none transition placeholder:text-slate-300 focus:bg-white focus:ring-2 focus:ring-teal-50 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:text-slate-400"
      />
    </div>
  );
}

function SelectField({
  label,
  value,
  options,
  placeholder,
  onChange,
  disabled,
}: {
  label: string;
  value: string;
  options: string[];
  placeholder: string;
  onChange: (value: string) => void;
  disabled: boolean;
}) {
  const [open, setOpen] = useState(false);
  const fieldRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handlePointerDown = (event: PointerEvent) => {
      if (
        fieldRef.current &&
        !fieldRef.current.contains(event.target as Node)
      ) {
        setOpen(false);
      }
    };

    document.addEventListener("pointerdown", handlePointerDown);

    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
    };
  }, [open]);

  return (
    <div ref={fieldRef} className="relative">
      <label className="mb-1.5 block text-xs font-medium text-slate-600">
        {label}
      </label>

      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen((current) => !current)}
        className={`flex w-full items-center justify-between rounded-xl bg-white px-3.5 py-3 pr-3.5 text-left text-sm outline-none transition shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] ${
          open
            ? "bg-white shadow-[inset_0_0_0_1px_rgba(45,212,191,0.45),0_0_0_3px_rgba(240,253,250,1)]"
            : "hover:bg-slate-50/40"
        } disabled:cursor-not-allowed disabled:bg-slate-50`}
      >
        <span
          className={`truncate ${value ? "text-slate-700" : "text-slate-300"}`}
        >
          {value || placeholder}
        </span>

        <ChevronDown
          size={15}
          className={`shrink-0 text-slate-400 transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl bg-white p-1.5 shadow-[0_12px_30px_rgba(15,23,42,0.10),inset_0_0_0_1px_rgba(226,232,240,0.95)]">
          <div className="max-h-56 overflow-y-auto">
            <button
              type="button"
              onClick={() => {
                onChange("");
                setOpen(false);
              }}
              className={`flex w-full items-center justify-between rounded-lg px-3 py-2.5 text-left text-sm transition ${
                !value
                  ? "bg-teal-50 font-medium text-teal-700"
                  : "text-slate-500 hover:bg-slate-50"
              }`}
            >
              <span>{placeholder}</span>
              {!value && <span className="size-1.5 rounded-full bg-teal-500" />}
            </button>

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
                <span>{option}</span>
                {value === option && <Check size={14} />}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
