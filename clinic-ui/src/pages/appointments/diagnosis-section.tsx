import { useState } from "react";
import { Check, Pencil, Plus, Trash2, X } from "lucide-react";

import type {
  CreateDiagnosisRequest,
  Diagnosis,
  UpdateDiagnosisRequest,
} from "@/types/diagnosis";

interface DiagnosisSectionProps {
  medicalRecordId: string;
  diagnoses: Diagnosis[];
  loading: boolean;
  saving: boolean;
  deletingId: string | null;

  readOnly: boolean;

  canCreate: boolean;
  canUpdate: boolean;
  canDelete: boolean;

  onCreate: (data: CreateDiagnosisRequest) => Promise<void>;

  onUpdate: (id: string, data: UpdateDiagnosisRequest) => Promise<void>;

  onDelete: (id: string) => Promise<void>;
}

export function DiagnosisSection({
  medicalRecordId,
  diagnoses,
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
}: DiagnosisSectionProps) {
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [name, setName] = useState("");
  const [code, setCode] = useState("");
  const [notes, setNotes] = useState("");
  const [isPrimary, setIsPrimary] = useState(false);

  const resetForm = () => {
    setName("");
    setCode("");
    setNotes("");
    setIsPrimary(false);
    setAdding(false);
    setEditingId(null);
  };

  const startAdd = () => {
    setName("");
    setCode("");
    setNotes("");
    setIsPrimary(false);
    setEditingId(null);
    setAdding(true);
  };

  const startEdit = (diagnosis: Diagnosis) => {
    setName(diagnosis.name);
    setCode(diagnosis.code ?? "");
    setNotes(diagnosis.notes ?? "");
    setIsPrimary(diagnosis.isPrimary);
    setEditingId(diagnosis.id);
    setAdding(false);
  };

  const handleSubmit = async () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    if (editingId) {
      await onUpdate(editingId, {
        name: trimmedName,
        code: code.trim() || undefined,
        notes: notes.trim() || undefined,
        isPrimary,
      });
    } else {
      await onCreate({
        medicalRecordId,
        name: trimmedName,
        code: code.trim() || undefined,
        notes: notes.trim() || undefined,
        isPrimary,
      });
    }

    resetForm();
  };

  const formVisible = adding || editingId !== null;

  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Diagnosis</h3>

          <p className="mt-0.5 text-xs text-slate-400">
            Clinical diagnoses associated with this consultation
          </p>
        </div>

        {!readOnly && canCreate && !formVisible && (
          <button
            type="button"
            onClick={startAdd}
            className="
              inline-flex
              items-center
              gap-1.5
              rounded-lg
              px-3
              py-2
              text-xs
              font-semibold
              text-teal-700
              transition
              hover:bg-teal-50
            "
          >
            <Plus size={14} />
            Add diagnosis
          </button>
        )}
      </div>

      {loading ? (
        <div className="rounded-xl border border-slate-100 bg-slate-50/30 px-4 py-5 text-center text-xs text-slate-400">
          Loading diagnoses...
        </div>
      ) : diagnoses.length === 0 && !formVisible ? (
        <div className="rounded-xl border border-dashed !border-slate-100 bg-slate-50/20 px-4 py-5 text-center text-xs text-slate-400">
          No diagnoses recorded.
        </div>
      ) : (
        <div className="space-y-2">
          {diagnoses.map((diagnosis) => (
            <div
              key={diagnosis.id}
              className="
                rounded-xl
                border
                !border-slate-100
                bg-slate-50/30
                px-4
                py-3
                "
            >
              {editingId === diagnosis.id ? (
                <DiagnosisForm
                  name={name}
                  code={code}
                  notes={notes}
                  isPrimary={isPrimary}
                  saving={saving}
                  onNameChange={setName}
                  onCodeChange={setCode}
                  onNotesChange={setNotes}
                  onPrimaryChange={setIsPrimary}
                  onCancel={resetForm}
                  onSubmit={handleSubmit}
                />
              ) : (
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-slate-700">
                        {diagnosis.name}
                      </span>

                      {diagnosis.isPrimary && (
                        <span className="rounded-full bg-teal-50 px-2 py-0.5 text-[11px] font-semibold text-teal-700">
                          Primary
                        </span>
                      )}
                    </div>

                    {diagnosis.code && (
                      <p className="mt-1 text-xs font-medium text-slate-400">
                        {diagnosis.code}
                      </p>
                    )}

                    {diagnosis.notes && (
                      <p className="mt-2 text-xs leading-5 text-slate-500">
                        {diagnosis.notes}
                      </p>
                    )}
                  </div>

                  {!readOnly && (
                    <div className="flex shrink-0 items-center gap-1">
                      {canUpdate && (
                        <button
                          type="button"
                          onClick={() => startEdit(diagnosis)}
                          className="
                            rounded-lg
                            p-2
                            text-slate-400
                            transition
                            hover:bg-slate-100
                            hover:text-slate-600
                          "
                          aria-label="Edit diagnosis"
                        >
                          <Pencil size={14} />
                        </button>
                      )}

                      {canDelete && (
                        <button
                          type="button"
                          onClick={() => onDelete(diagnosis.id)}
                          disabled={deletingId === diagnosis.id}
                          className="
                            rounded-lg
                            p-2
                            text-slate-400
                            transition
                            hover:bg-red-50
                            hover:text-red-600
                            disabled:cursor-not-allowed
                            disabled:opacity-50
                          "
                          aria-label="Delete diagnosis"
                        >
                          <Trash2 size={14} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {adding && (
        <div className="rounded-xl border !border-slate-100 bg-slate-50/30 px-4 py-4">
          <DiagnosisForm
            name={name}
            code={code}
            notes={notes}
            isPrimary={isPrimary}
            saving={saving}
            onNameChange={setName}
            onCodeChange={setCode}
            onNotesChange={setNotes}
            onPrimaryChange={setIsPrimary}
            onCancel={resetForm}
            onSubmit={handleSubmit}
          />
        </div>
      )}
    </section>
  );
}

interface DiagnosisFormProps {
  name: string;
  code: string;
  notes: string;
  isPrimary: boolean;
  saving: boolean;

  onNameChange: (value: string) => void;
  onCodeChange: (value: string) => void;
  onNotesChange: (value: string) => void;
  onPrimaryChange: (value: boolean) => void;

  onCancel: () => void;
  onSubmit: () => Promise<void>;
}

function DiagnosisForm({
  name,
  code,
  notes,
  isPrimary,
  saving,
  onNameChange,
  onCodeChange,
  onNotesChange,
  onPrimaryChange,
  onCancel,
  onSubmit,
}: DiagnosisFormProps) {
  return (
    <div className="space-y-3">
      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">
          Diagnosis name
          <span className="ml-1 text-red-400">*</span>
        </label>

        <input
          value={name}
          onChange={(event) => onNameChange(event.target.value)}
          placeholder="Enter diagnosis"
          disabled={saving}
          className="
            w-full
            rounded-xl
            border
            !border-slate-100
            bg-white
            px-3.5
            py-2.5
            text-sm
            text-slate-700
            outline-none
            transition
            placeholder:text-slate-300
            focus:!border-teal-200
            focus:ring-2
            focus:ring-teal-50
            disabled:bg-slate-50
          "
        />
      </div>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">
          ICD-10 code
        </label>

        <input
          value={code}
          onChange={(event) => onCodeChange(event.target.value)}
          placeholder="e.g. G44.209"
          disabled={saving}
          className="
            w-full
            rounded-xl
            border
            !border-slate-100
            bg-white
            px-3.5
            py-2.5
            text-sm
            text-slate-700
            outline-none
            transition
            placeholder:text-slate-300
            focus:!border-teal-200
            focus:ring-2
            focus:ring-teal-50
            disabled:bg-slate-50
          "
        />
      </div>

      <label className="flex cursor-pointer items-center gap-2">
        <input
          type="checkbox"
          checked={isPrimary}
          onChange={(event) => onPrimaryChange(event.target.checked)}
          disabled={saving}
          className="h-4 w-4 rounded border-slate-200 text-teal-600 focus:ring-teal-100"
        />

        <span className="text-xs font-medium text-slate-600">
          Primary diagnosis
        </span>
      </label>

      <div>
        <label className="mb-1.5 block text-xs font-medium text-slate-600">
          Clinical notes
        </label>

        <textarea
          value={notes}
          onChange={(event) => onNotesChange(event.target.value)}
          rows={3}
          placeholder="Additional clinical notes"
          disabled={saving}
          className="
            w-full
            resize-none
            rounded-xl
            border
            !border-slate-100
            bg-white
            px-3.5
            py-3
            text-sm
            leading-6
            text-slate-700
            outline-none
            transition
            placeholder:text-slate-300
            focus:!border-teal-200
            focus:ring-2
            focus:ring-teal-50
            disabled:bg-slate-50
          "
        />
      </div>

      <div className="flex items-center justify-end gap-2 pt-1">
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="
            inline-flex
            items-center
            justify-center
            gap-1.5
            rounded-xl
            border
            !border-slate-100
            bg-white
            px-3.5
            py-2
            text-xs
            font-semibold
            text-slate-600
            shadow-sm
            transition
            hover:!border-slate-200
            hover:bg-slate-50
            disabled:cursor-not-allowed
            disabled:opacity-50
          "
        >
          <X size={13} />
          Cancel
        </button>

        <button
          type="button"
          onClick={onSubmit}
          disabled={!name.trim() || saving}
          className="
            inline-flex
            items-center
            justify-center
            gap-1.5
            rounded-xl
            border
            border-teal-600
            bg-teal-600
            px-3.5
            py-2
            text-xs
            font-semibold
            text-white
            shadow-sm
            transition
            hover:border-teal-700
            hover:bg-teal-700
            disabled:cursor-not-allowed
            disabled:opacity-60
          "
        >
          <Check size={13} />
          {saving ? "Saving..." : "Save diagnosis"}
        </button>
      </div>
    </div>
  );
}
