import { useCallback, useEffect, useRef, useState } from "react";
import { Building2, ChevronLeft, ChevronRight, Edit3, Loader2, Plus, Search, ToggleLeft, ToggleRight, X } from "lucide-react";

import { useAuth } from "@/auth/auth-context";
import { departmentService } from "@/services/department-service";
import type { CreateDepartmentRequest, Department, DepartmentQuery } from "@/types/department";

const emptyForm: CreateDepartmentRequest = { code: "", name: "", description: "", displayOrder: 0 };
type StatusFilter = "all" | "active" | "inactive";
const PAGE_SIZE = 10;

export function DepartmentsPage() {
  const { hasPermission } = useAuth();
  const canCreate = hasPermission("DEPARTMENT_CREATE");
  const canUpdate = hasPermission("DEPARTMENT_UPDATE");
  const [departments, setDepartments] = useState<Department[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState<StatusFilter>("active");
  const [formOpen, setFormOpen] = useState(false);
  const formSectionRef = useRef<HTMLElement | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<CreateDepartmentRequest>(emptyForm);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadDepartments = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const query: DepartmentQuery = { page, limit: PAGE_SIZE, search: search.trim() || undefined, sortBy: "name", sortOrder: "asc" };
      const result = await departmentService.getDepartments(query);
      const rows = result.data ?? [];
      setDepartments(rows.filter((department) => status === "all" || department.isActive === (status === "active")));
      setTotal(result.total ?? 0);
      setTotalPages(result.totalPages ?? Math.ceil((result.total ?? 0) / PAGE_SIZE));
    } catch (err) {
      console.error("Unable to load departments.", err);
      setError("Unable to load departments. Check your access and try again.");
    } finally {
      setLoading(false);
    }
  }, [search, status, page]);

  useEffect(() => {
    const timer = window.setTimeout(() => void loadDepartments(), 250);
    return () => window.clearTimeout(timer);
  }, [loadDepartments]);

  useEffect(() => {
    if (!formOpen) return;
    // When editing a row near the bottom, bring the form into view automatically.
    requestAnimationFrame(() => {
      formSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    });
  }, [formOpen, editingId]);

  const openCreate = () => { setEditingId(null); setForm(emptyForm); setError(""); setNotice(""); setFormOpen(true); };
  const openEdit = (department: Department) => {
    setEditingId(department.id);
    setForm({ code: department.code, name: department.name, description: department.description ?? "", displayOrder: department.displayOrder ?? 0 });
    setError(""); setNotice(""); setFormOpen(true);
  };
  const closeForm = () => { if (saving) return; setFormOpen(false); setEditingId(null); setForm(emptyForm); };
  const updateField = (field: keyof CreateDepartmentRequest, value: string | number) => setForm((current) => ({ ...current, [field]: value }));

  const handleSave = async () => {
    if (form.code.trim().length < 2 || form.name.trim().length < 2) {
      setError("Department code and name must each contain at least 2 characters."); return;
    }
    try {
      setSaving(true); setError("");
      const payload = { code: form.code.trim().toUpperCase(), name: form.name.trim(), description: form.description?.trim() || undefined, displayOrder: Number(form.displayOrder ?? 0) };
      if (editingId) {
        await departmentService.updateDepartment(editingId, payload);
        setNotice("Department updated successfully.");
      } else {
        await departmentService.createDepartment(payload);
        setNotice("Department created successfully.");
      }
      setFormOpen(false); setEditingId(null); setForm(emptyForm);
      await loadDepartments();
    } catch (err: any) {
      console.error("Unable to save department.", err);
      setError(err?.response?.data?.message ?? "Unable to save department. Please check the details and try again.");
    } finally { setSaving(false); }
  };

  const handleToggle = async (department: Department) => {
    try {
      setError(""); setNotice("");
      await departmentService.updateDepartmentStatus(department.id, !department.isActive);
      setNotice(`${department.name} ${department.isActive ? "deactivated" : "activated"}.`);
      await loadDepartments();
    } catch (err: any) {
      console.error("Unable to update department status.", err);
      setError(err?.response?.data?.message ?? "Unable to update department status.");
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-xl font-semibold tracking-tight text-slate-800">Departments</h1>
          <p className="mt-1 text-sm text-slate-400">Manage the departments available at your clinic.</p>
        </div>
        {canCreate && !formOpen && <button type="button" onClick={openCreate} className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-teal-700 sm:w-auto"><Plus size={16} />Add department</button>}
      </div>

      {error && <Alert message={error} tone="error" onClose={() => setError("")} />}
      {notice && <Alert message={notice} tone="success" onClose={() => setNotice("")} />}

      {formOpen && <section ref={formSectionRef} className="scroll-mt-4 rounded-2xl bg-white ring-1 ring-slate-100 p-5 shadow-sm sm:p-6">
        <div className="mb-5 flex items-start justify-between gap-3">
          <div><h2 className="text-sm font-semibold text-slate-700">{editingId ? "Edit department" : "Add department"}</h2><p className="mt-1 text-xs text-slate-400">Departments are automatically associated with your current clinic.</p></div>
          <button type="button" onClick={closeForm} disabled={saving} aria-label="Close form" className="flex size-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-50"><X size={16} /></button>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <FormField label="Department code *" value={form.code} placeholder="e.g. GENMED" onChange={(value) => updateField("code", value)} disabled={saving} />
          <FormField label="Department name *" value={form.name} placeholder="e.g. General Medicine" onChange={(value) => updateField("name", value)} disabled={saving} />
          <FormField label="Display order" type="number" value={String(form.displayOrder ?? 0)} placeholder="0" onChange={(value) => updateField("displayOrder", Math.max(0, Number(value) || 0))} disabled={saving} />
          <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600 sm:col-span-2 lg:col-span-3">Description <textarea value={form.description ?? ""} onChange={(event) => updateField("description", event.target.value)} maxLength={500} rows={3} disabled={saving} placeholder="Optional department description" className="w-full resize-y rounded-xl bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-100 disabled:opacity-60" /></label>
        </div>
        <div className="mt-5 flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
          <button type="button" onClick={closeForm} disabled={saving} className="rounded-xl bg-white ring-1 ring-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 hover:bg-slate-50">Cancel</button>
          <button type="button" onClick={() => void handleSave()} disabled={saving} className="inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-700 disabled:opacity-50">{saving && <Loader2 size={15} className="animate-spin" />}{saving ? "Saving..." : editingId ? "Update department" : "Save department"}</button>
        </div>
      </section>}

      <section className="rounded-2xl bg-white ring-1 ring-slate-100 p-4 shadow-sm sm:p-5">
        <div className="relative"><Search size={16} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" /><input value={search} onChange={(event) => { setSearch(event.target.value); setPage(1); }} placeholder="Search departments by name or code..." className="w-full rounded-xl bg-white py-3 pl-10 pr-4 text-sm text-slate-700 outline-none shadow-[inset_0_0_0_1px_rgba(226,232,240,0.95)] placeholder:text-slate-300 focus:ring-2 focus:ring-teal-50" /></div>
        <div className="mt-3 flex flex-wrap gap-2" aria-label="Department status filter">{(["active", "inactive", "all"] as StatusFilter[]).map((value) => <button key={value} type="button" onClick={() => { setStatus(value); setPage(1); }} className={`rounded-lg px-3 py-1.5 text-xs font-semibold capitalize transition ${status === value ? "bg-teal-50 text-teal-700" : "text-slate-500 hover:bg-slate-50"}`}>{value === "all" ? "All departments" : value}</button>)}</div>
      </section>

      {loading ? <div className="flex min-h-56 items-center justify-center rounded-2xl bg-white ring-1 ring-slate-100 shadow-sm"><div className="flex items-center gap-2 text-sm text-slate-400"><Loader2 size={17} className="animate-spin" />Loading departments...</div></div> : departments.length === 0 ? <div className="flex min-h-60 flex-col items-center justify-center rounded-2xl bg-white ring-1 ring-slate-100 px-6 text-center shadow-sm"><div className="mb-3 flex size-12 items-center justify-center rounded-xl bg-teal-50 text-teal-600"><Building2 size={20} /></div><h2 className="text-sm font-semibold text-slate-700">{search ? "No matching departments" : status === "inactive" ? "No inactive departments" : "No departments yet"}</h2><p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">{search ? "Try another department name or code." : "Add departments offered by this clinic. They will only be visible within this clinic."}</p>{canCreate && !search && status !== "inactive" && <button type="button" onClick={openCreate} className="mt-4 inline-flex items-center gap-2 rounded-xl bg-teal-600 px-4 py-2.5 text-xs font-semibold text-white hover:bg-teal-700"><Plus size={14} />Add first department</button>}</div> : <>
        <div className="space-y-3 md:hidden">
          {departments.map((department) => (
            <article key={department.id} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-slate-100">
              <div className="flex items-start gap-3">
                <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Building2 size={18} /></span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="break-words text-sm font-semibold text-slate-800">{department.name}</h3>
                    <span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${department.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{department.isActive ? "Active" : "Inactive"}</span>
                  </div>
                  {department.isSystem && <p className="mt-0.5 text-[11px] text-slate-400">System department</p>}
                  <p className="mt-2 break-all text-xs text-slate-500">Code: {department.code}</p>
                  <p className="mt-2 text-sm leading-5 text-slate-500">{department.description || "No description provided."}</p>
                </div>
              </div>
              {canUpdate && <div className="mt-4 grid grid-cols-2 gap-2 pt-3">
                <button type="button" onClick={() => openEdit(department)} className="inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl bg-white px-3 py-2 text-xs font-semibold text-slate-600 shadow-[inset_0_0_0_1px_#E2E8F0] transition hover:bg-slate-50"><Edit3 size={14} />Edit</button>
                <button type="button" onClick={() => void handleToggle(department)} className={`inline-flex min-h-10 items-center justify-center gap-1.5 rounded-xl px-2 py-2 text-xs font-semibold transition ${department.isActive ? "bg-rose-50 text-rose-600 hover:bg-rose-100" : "bg-teal-50 text-teal-700 hover:bg-teal-100"}`}>{department.isActive ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}{department.isActive ? "Deactivate" : "Activate"}</button>
              </div>}
            </article>
          ))}
        </div>
        <div className="hidden overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100 md:block">
          <div className="overflow-x-auto">
            <table className="departments-table min-w-full border-separate border-spacing-0 text-left">
              <thead className="bg-slate-50/70">
                <tr>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Department</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Code</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Description</th>
                  <th scope="col" className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
                  {(canUpdate) && <th scope="col" className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Actions</th>}
                </tr>
              </thead>
              <tbody className="bg-white">
                {departments.map((department) => (
                  <tr key={department.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="whitespace-nowrap px-5 py-4">
                      <div className="flex items-center gap-3">
                        <span className="flex size-9 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700"><Building2 size={17} /></span>
                        <div><p className="text-sm font-semibold text-slate-800">{department.name}</p>{department.isSystem && <p className="mt-0.5 text-[11px] text-slate-400">System department</p>}</div>
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{department.code}</td>
                    <td className="max-w-sm px-5 py-4 text-sm text-slate-500"><span className="line-clamp-2">{department.description || "No description provided."}</span></td>
                    <td className="whitespace-nowrap px-5 py-4"><span className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-semibold ${department.isActive ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>{department.isActive ? "Active" : "Inactive"}</span></td>
                    {canUpdate && <td className="whitespace-nowrap px-5 py-4"><div className="flex items-center justify-end gap-2">
                      <button type="button" onClick={() => openEdit(department)} className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold text-slate-600 transition hover:bg-slate-100"><Edit3 size={14} />Edit</button>
                      <button type="button" onClick={() => void handleToggle(department)} className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-xs font-semibold transition ${department.isActive ? "text-rose-600 hover:bg-rose-50" : "text-teal-700 hover:bg-teal-50"}`}>{department.isActive ? <ToggleLeft size={15} /> : <ToggleRight size={15} />}{department.isActive ? "Deactivate" : "Activate"}</button>
                    </div></td>}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {total > 0 && <div className="flex flex-col gap-3 rounded-2xl bg-white px-4 py-4 shadow-sm ring-1 ring-slate-100 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <p className="text-xs text-slate-400">Showing <span className="font-medium text-slate-600">{(page - 1) * PAGE_SIZE + 1}</span>–<span className="font-medium text-slate-600">{Math.min(page * PAGE_SIZE, total)}</span> of <span className="font-medium text-slate-600">{total}</span></p>
          <div className="flex items-center gap-1">
            <button type="button" disabled={page <= 1 || loading} onClick={() => setPage((current) => Math.max(1, current - 1))} className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Previous page"><ChevronLeft size={16} /></button>
            <span className="min-w-16 text-center text-xs font-medium text-slate-500">{page} / {Math.max(totalPages, 1)}</span>
            <button type="button" disabled={page >= totalPages || loading} onClick={() => setPage((current) => Math.min(totalPages, current + 1))} className="flex size-8 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-50 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-30" aria-label="Next page"><ChevronRight size={16} /></button>
          </div>
        </div>}
      </>}
    </div>
  );
}

function FormField({ label, value, placeholder, onChange, disabled, type = "text" }: { label: string; value: string; placeholder: string; onChange: (value: string) => void; disabled?: boolean; type?: string }) {
  return <label className="flex flex-col gap-1.5 text-xs font-medium text-slate-600">{label}<input type={type} value={value} onChange={(event) => onChange(event.target.value)} placeholder={placeholder} disabled={disabled} maxLength={type === "text" ? 150 : undefined} className="w-full rounded-xl bg-white px-3 py-2.5 text-sm font-normal text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-300 focus:ring-2 focus:ring-teal-100 disabled:opacity-60" /></label>;
}

function Alert({ message, tone, onClose }: { message: string; tone: "error" | "success"; onClose: () => void }) {
  return <div className={`flex items-center justify-between gap-3 rounded-xl px-4 py-3 text-sm ${tone === "error" ? "ring-1 ring-red-100 bg-red-50 text-red-700" : "ring-1 ring-emerald-100 bg-emerald-50 text-emerald-700"}`} role="status"><span>{message}</span><button type="button" onClick={onClose} aria-label="Dismiss message" className="shrink-0 rounded-lg p-1 opacity-70 hover:opacity-100"><X size={15} /></button></div>;
}
