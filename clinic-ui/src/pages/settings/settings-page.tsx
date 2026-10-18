import { useCallback, useEffect, useState, type FormEvent } from "react";
import {
  Check,
  ChevronLeft,
  ChevronRight,
  KeyRound,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";
import { useAuth } from "@/auth/auth-context";
import { settingsService, type RolePermissionRecord } from "@/services/settings-service";

type Tab = "users" | "roles";
type PageResult<T> = {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
};
type UserRecord = {
  id: string;
  firstName: string;
  lastName: string | null;
  email: string;
  clinicId: string;
  status: "ACTIVE" | "INACTIVE" | "LOCKED";
  roles: string[];
  createdAt: string;
};
type ClinicRecord = {
  id: string;
  code: string;
  name: string;
  isActive: boolean;
};
type RoleRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  displayOrder: number;
  isSystem: boolean;
  isActive: boolean;
  permissionCount: number;
  userCount: number;
};
type PermissionRecord = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  permissionGroup?: { id: string; code: string; name: string };
};
const inputClass =
  "h-10 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 placeholder:text-slate-400 focus:bg-white focus:ring-teal-500/40";
const primaryClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50";
const pretty = (value: string) =>
  value
    .toLowerCase()
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());

function StatusPill({
  active,
  children,
}: {
  active: boolean;
  children: string;
}) {
  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${active ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}
    >
      {children}
    </span>
  );
}

export function SettingsPage() {
  const { user, hasPermission, hasRole } = useAuth();
  const canReadUsers = hasPermission("USER_READ");
  const canCreateUsers = hasPermission("USER_CREATE");
  const canUpdateUsers = hasPermission("USER_UPDATE");
  const normalizedUserRoles = [user?.role, ...(user?.roles ?? [])].flatMap(
    (role) => {
      if (typeof role === "string")
        return [
          role
            .trim()
            .toUpperCase()
            .replace(/[\s-]+/g, "_"),
        ];
      if (role && typeof role === "object") {
        return [role.code, role.name]
          .filter((value): value is string => typeof value === "string")
          .map((value) =>
            value
              .trim()
              .toUpperCase()
              .replace(/[\s-]+/g, "_"),
          );
      }
      return [];
    },
  );
  const isPlatformAdmin = user?.isPlatformAdmin === true;
  const canManageRoles =
    isPlatformAdmin ||
    hasPermission("ROLE_READ") ||
    hasRole("CLINIC_ADMIN") ||
    hasRole("SUPER_ADMIN") ||
    normalizedUserRoles.some((role) =>
      [
        "SUPER_ADMIN",
        "SUPER_ADMINISTRATOR",
        "CLINIC_ADMIN",
        "CLINIC_ADMINISTRATOR",
      ].includes(role),
    );
  const [tab, setTab] = useState<Tab>(canReadUsers ? "users" : "roles");
  const [users, setUsers] = useState<UserRecord[]>([]);
  const [roles, setRoles] = useState<RoleRecord[]>([]);
  const [clinics, setClinics] = useState<ClinicRecord[]>([]);
  const [selectedClinicId, setSelectedClinicId] = useState("");
  const [loadingClinics, setLoadingClinics] = useState(false);
  const [permissions, setPermissions] = useState<PermissionRecord[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [loadingRoles, setLoadingRoles] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [showUserForm, setShowUserForm] = useState(false);
  const [showRoleForm, setShowRoleForm] = useState(false);
  const [editingRole, setEditingRole] = useState<RoleRecord | null>(null);
  const [rolePermissionIds, setRolePermissionIds] = useState<string[]>([]);
  const [permissionSearch, setPermissionSearch] = useState("");
  const [userForm, setUserForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    roleIds: [] as string[],
  });
  const [roleForm, setRoleForm] = useState({
    code: "",
    name: "",
    description: "",
  });
  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      if (tab === "users") {
        if (!canReadUsers) {
          setUsers([]);
          return;
        }
        const userResult = await settingsService.getUsers(
          { page, limit: 10, search: search.trim() || undefined },
        );
        setUsers(userResult.data.data);
        setTotalPages(userResult.data.totalPages || 1);
        if (canManageRoles) {
          const roleResult = await settingsService.getRoles({ page: 1, limit: 100, sortBy: "displayOrder" });
          setRoles(roleResult.data.data);
        }
      } else {
        if (!canManageRoles) {
          setRoles([]);
          return;
        }
        const [roleResult, permissionResult] = await Promise.all([
          settingsService.getRoles({
            page, limit: 10, search: search.trim() || undefined, sortBy: "displayOrder",
          }),
          settingsService.getPermissions({ page: 1, limit: 200, sortBy: "name" }),
        ]);
        setRoles(roleResult.data.data);
        setPermissions(permissionResult.data.data);
        setTotalPages(roleResult.data.totalPages || 1);
      }
    } catch (requestError) {
      console.error("Unable to load administration settings.", requestError);
      setError(
        "We couldn't load this section. Check your access and try again.",
      );
    } finally {
      setLoading(false);
    }
  }, [tab, page, search, canReadUsers, canManageRoles]);
  useEffect(() => {
    void load();
  }, [load]);

  // Clinic list and lifecycle permissions are platform-only. Do not expose them as
  // assignable role permissions; the API also rejects them defensively.
  const platformOnlyPermissionCodes = new Set([
    "CLINIC_READ",
    "CLINIC_CREATE",
    "CLINIC_UPDATE",
    "CLINIC_DELETE",
  ]);
  const assignablePermissions = permissions.filter(
    (permission) => !platformOnlyPermissionCodes.has(permission.code),
  );
  const visiblePermissions = assignablePermissions.filter((permission) =>
    `${permission.name} ${permission.code} ${permission.permissionGroup?.name ?? ""}`
      .toLowerCase()
      .includes(permissionSearch.trim().toLowerCase()),
  );
  const switchTab = (next: Tab) => {
    setTab(next);
    setPage(1);
    setSearch("");
    setError(null);
    setNotice(null);
  };

  async function openAddUserForm() {
    setError(null);
    setNotice(null);
    setUserForm({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      roleIds: [],
    });
    setSelectedClinicId(isPlatformAdmin ? "" : (user?.clinicId ?? ""));
    setShowUserForm(true);

    // Fetch role choices when the dialog opens instead of relying only on the
    // page-load request. This also gives the user visible feedback if access
    // or the API request fails.
    if (!canCreateUsers) {
      setRoles([]);
      setError("Your account does not have permission to create users.");
      return;
    }

    setLoadingRoles(true);
    setLoadingClinics(isPlatformAdmin);
    try {
      let availableClinics: ClinicRecord[] = [];
      if (isPlatformAdmin) {
        const clinicResult = await settingsService.getClinics({ page: 1, limit: 100, sortBy: "name", sortOrder: "asc" });
        availableClinics = (clinicResult.data.data ?? []).filter(
          (clinic) => clinic.isActive,
        );
        setClinics(availableClinics);
        const initialClinicId = availableClinics[0]?.id ?? "";
        setSelectedClinicId(initialClinicId);
        if (initialClinicId) {
          const roleResult = await settingsService.getRoles({ page: 1, limit: 100, sortBy: "displayOrder", clinicId: initialClinicId });
          setRoles(roleResult.data.data ?? []);
        } else {
          setRoles([]);
        }
      } else {
        // Clinic administrators create users only within their own clinic.
        // They can list assignable clinic roles without having role-management
        // privileges (which remain Super Administrator-only).
        setClinics([]);
        if (!user?.clinicId) {
          throw new Error(
            "Your account is not associated with a clinic. Contact your administrator.",
          );
        }
        const roleResult = await settingsService.getRoles({ page: 1, limit: 100, sortBy: "displayOrder" });
        setRoles(roleResult.data.data ?? []);
      }
    } catch (requestError: any) {
      console.error("Unable to load roles for user assignment.", requestError);
      setRoles([]);
      setClinics([]);
      setError(
        requestError?.response?.data?.message?.toString() ||
          "Unable to load clinics or roles. Check your access to GET /api/v1/clinics and GET /api/v1/roles.",
      );
    } finally {
      setLoadingRoles(false);
      setLoadingClinics(false);
    }
  }

  async function loadRolesForClinic(clinicId: string) {
    setSelectedClinicId(clinicId);
    setUserForm((current) => ({ ...current, roleIds: [] }));
    if (!clinicId) {
      setRoles([]);
      return;
    }
    setLoadingRoles(true);
    setError(null);
    try {
      const roleResult = await settingsService.getRoles({ page: 1, limit: 100, sortBy: "displayOrder", clinicId });
      setRoles(roleResult.data.data ?? []);
    } catch (requestError: any) {
      console.error("Unable to load roles for selected clinic.", requestError);
      setRoles([]);
      setError(
        requestError?.response?.data?.message?.toString() ||
          "Unable to load roles for the selected clinic.",
      );
    } finally {
      setLoadingRoles(false);
    }
  }

  async function createUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const clinicId = isPlatformAdmin ? selectedClinicId : user?.clinicId;
    if (!clinicId) {
      setError(
        isPlatformAdmin
          ? "Select a clinic before creating the user."
          : "Your signed-in account has no clinic assigned. Refresh your session or assign the account to a clinic before creating users.",
      );
      return;
    }
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await settingsService.createUser({
        ...userForm,
        clinicId,
        roleIds: userForm.roleIds,
      });
      setShowUserForm(false);
      setUserForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        roleIds: [],
      });
      setNotice("User created successfully.");
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.message?.toString() ||
          "Unable to create user. Verify the details and try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function updateUserStatus(record: UserRecord) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      const status = record.status === "ACTIVE" ? "INACTIVE" : "ACTIVE";
      await settingsService.updateUserStatus(record.id, status);
      setNotice(
        `${record.firstName} ${status === "ACTIVE" ? "activated" : "deactivated"}.`,
      );
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.message?.toString() ||
          "Unable to update user status.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function createRole(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await settingsService.createRole({
        ...roleForm,
        code: roleForm.code.trim().toUpperCase().replace(/\s+/g, "_"),
        name: roleForm.name.trim(),
      });
      setShowRoleForm(false);
      setRoleForm({ code: "", name: "", description: "" });
      setNotice(
        "Role created successfully. Configure its permissions before assigning it to users.",
      );
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.message?.toString() ||
          "Unable to create role. Verify the details and try again.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function toggleRole(record: RoleRecord) {
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await settingsService.updateRoleStatus(record.id, !record.isActive);
      setNotice(
        `Role ${record.name} ${record.isActive ? "deactivated" : "activated"}.`,
      );
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.message?.toString() ||
          "Unable to update role status.",
      );
    } finally {
      setSaving(false);
    }
  }
  async function openPermissions(record: RoleRecord) {
    setEditingRole(record);
    setPermissionSearch("");
    setError(null);
    setNotice(null);
    setRolePermissionIds([]);
    try {
      const response = await settingsService.getRolePermissions(record.id);
      const items: RolePermissionRecord[] = Array.isArray(response.data)
        ? response.data
        : response.data.data;
      setRolePermissionIds(
        items
          .filter(
            (item) =>
              ![
                "CLINIC_READ",
                "CLINIC_CREATE",
                "CLINIC_UPDATE",
                "CLINIC_DELETE",
              ].includes(item.code),
          )
          .map((item) => item.id),
      );
    } catch (e) {
      console.error("Unable to load role permissions.", e);
      setEditingRole(null);
      setError("Couldn't load the permissions for this role.");
    }
  }
  async function savePermissions() {
    if (!editingRole) return;
    setSaving(true);
    setError(null);
    setNotice(null);
    try {
      await settingsService.updateRolePermissions(editingRole.id, rolePermissionIds);
      setNotice(`Permissions updated for ${editingRole.name}.`);
      setEditingRole(null);
      await load();
    } catch (e: any) {
      setError(
        e?.response?.data?.message?.toString() ||
          "Unable to save role permissions.",
      );
    } finally {
      setSaving(false);
    }
  }

  if (!canReadUsers && !canManageRoles)
    return (
      <div className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-slate-100">
          <ShieldCheck className="mx-auto size-8 text-slate-300" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">
            Administration access required
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your account doesn't have permission to manage users or roles.
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-600">
            SamaRoot administration
          </p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Settings
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage users, roles, and permissions for your clinic workspace.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>
      {!canReadUsers && !canManageRoles ? null : (
        <div className="flex flex-wrap gap-2 rounded-2xl bg-slate-100 p-1.5 sm:w-fit">
          {canReadUsers && (
            <button
              type="button"
              onClick={() => switchTab("users")}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${tab === "users" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <UsersRound className="size-4" />
              Users
            </button>
          )}
          {canManageRoles && (
            <button
              type="button"
              onClick={() => switchTab("roles")}
              className={`inline-flex h-10 items-center gap-2 rounded-xl px-4 text-sm font-semibold ${tab === "roles" ? "bg-white text-teal-700 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
            >
              <ShieldCheck className="size-4" />
              Roles & permissions
            </button>
          )}
        </div>
      )}
      {error && (
        <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700 ring-1 ring-red-100">
          {error}
        </div>
      )}
      {notice && (
        <div className="flex items-center gap-2 rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-700 ring-1 ring-emerald-100">
          <Check className="size-4" />
          {notice}
        </div>
      )}
      <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-slate-100">
        <div className="flex flex-col gap-3 bg-white p-3 sm:flex-row sm:items-center sm:justify-between sm:p-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              {tab === "users" ? "User accounts" : "Roles & permissions"}
            </h2>
            <p className="mt-1 text-sm text-slate-500">
              {tab === "users"
                ? "Control who can sign in to this clinic."
                : "Define access levels and the permissions assigned to each role."}
            </p>
          </div>
          <div className="flex w-full flex-col gap-2 sm:w-auto sm:flex-row">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={(event) => {
                  setSearch(event.target.value);
                  setPage(1);
                }}
                placeholder={
                  tab === "users" ? "Search users..." : "Search roles..."
                }
                className={`${inputClass} w-full pl-9 sm:w-60`}
              />
            </div>
            {tab === "users" && canCreateUsers && (
              <button
                type="button"
                onClick={() => void openAddUserForm()}
                className={`${primaryClass} w-full sm:w-auto`}
              >
                <Plus className="size-4" />
                Add user
              </button>
            )}
            {tab === "roles" && (
              <button
                type="button"
                onClick={() => setShowRoleForm(true)}
                className={`${primaryClass} w-full sm:w-auto`}
              >
                <Plus className="size-4" />
                Create role
              </button>
            )}
          </div>
        </div>
        {loading ? (
          <div className="p-10 text-center text-sm text-slate-500">
            Loading {tab}...
          </div>
        ) : tab === "users" ? (
          <>
            <div className="space-y-3 p-3 md:hidden">
              {users.map((record) => (
                <article
                  key={record.id}
                  className="rounded-xl bg-white p-4 ring-1 ring-slate-100"
                >
                  <div className="flex min-w-0 items-start gap-3">
                    <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                      <UserRound className="size-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="break-words text-sm font-semibold text-slate-800">
                        {record.firstName} {record.lastName ?? ""}
                      </p>
                      <p className="mt-1 break-all text-xs text-slate-500">
                        {record.email}
                      </p>
                    </div>
                    <StatusPill active={record.status === "ACTIVE"}>
                      {pretty(record.status)}
                    </StatusPill>
                  </div>
                  <div className="mt-4">
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                      Roles
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {record.roles.length ? (
                        record.roles.map((role) => (
                          <span
                            key={role}
                            className="max-w-full break-words rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                          >
                            {pretty(role)}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-slate-400">
                          No roles assigned
                        </span>
                      )}
                    </div>
                  </div>
                  {canUpdateUsers && record.id !== user?.id && (
                    <div className="settings-mobile-user-action mt-4 pt-3">
                      <button
                        type="button"
                        disabled={saving || record.status === "LOCKED"}
                        onClick={() => void updateUserStatus(record)}
                        className="min-h-10 w-full rounded-lg px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-40"
                      >
                        {record.status === "ACTIVE"
                          ? "Deactivate user"
                          : "Activate user"}
                      </button>
                    </div>
                  )}
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="settings-list-table w-full min-w-[700px] border-separate border-spacing-0 text-left">
                <thead className="bg-slate-50/50 text-[10px] font-semibold uppercase tracking-[0.08em] text-slate-400">
                  <tr>
                    <th className="px-5 py-3 font-semibold">User</th>
                    <th className="px-5 py-3 font-semibold">Roles</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {users.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors duration-150 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                            <UserRound className="size-4" />
                          </span>
                          <div>
                            <p className="text-sm font-semibold text-slate-800">
                              {record.firstName} {record.lastName ?? ""}
                            </p>
                            <p className="mt-0.5 text-xs text-slate-500">
                              {record.email}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex max-w-xs flex-wrap gap-1.5">
                          {record.roles.length ? (
                            record.roles.map((role) => (
                              <span
                                key={role}
                                className="rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600"
                              >
                                {pretty(role)}
                              </span>
                            ))
                          ) : (
                            <span className="text-xs text-slate-400">
                              No roles assigned
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill active={record.status === "ACTIVE"}>
                          {pretty(record.status)}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-4 text-right">
                        {canUpdateUsers && record.id !== user?.id && (
                          <button
                            type="button"
                            disabled={saving || record.status === "LOCKED"}
                            onClick={() => void updateUserStatus(record)}
                            className="rounded-lg px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50 disabled:opacity-40"
                          >
                            {record.status === "ACTIVE"
                              ? "Deactivate"
                              : "Activate"}
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {users.length === 0 && (
              <div className="p-10 text-center">
                <UsersRound className="mx-auto size-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No users found
                </p>
                <p className="mt-1 text-xs text-slate-400">
                  Try another search or add a user.
                </p>
              </div>
            )}
          </>
        ) : (
          <>
            <div className="space-y-3 p-3 md:hidden">
              {roles.map((record) => (
                <article
                  key={record.id}
                  className="rounded-xl bg-white p-4 ring-1 ring-slate-100"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="break-words text-sm font-semibold text-slate-800">
                        {record.name}
                      </h3>
                      <p className="mt-1 break-words text-xs text-slate-400">
                        {record.code}
                        {record.isSystem ? " · System role" : ""}
                      </p>
                      {record.description && (
                        <p className="mt-2 text-xs text-slate-500">
                          {record.description}
                        </p>
                      )}
                    </div>
                    <StatusPill active={record.isActive}>
                      {record.isActive ? "Active" : "Inactive"}
                    </StatusPill>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Users
                      </p>
                      <p className="mt-1 text-sm font-semibold text-slate-700">
                        {record.userCount}
                      </p>
                    </div>
                    <div className="rounded-lg bg-slate-50 p-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">
                        Permissions
                      </p>
                      <p className="mt-1 inline-flex items-center gap-1.5 text-sm font-semibold text-slate-700">
                        <KeyRound className="size-3.5 text-slate-400" />
                        {record.permissionCount}
                      </p>
                    </div>
                  </div>
                  <div className="mt-3 flex flex-col gap-2 border-0 sm:flex-row">
                    <button
                      type="button"
                      onClick={() => void openPermissions(record)}
                      className="min-h-10 rounded-lg bg-teal-50 px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-100"
                    >
                      Permissions
                    </button>
                    {!record.isSystem && (
                      <button
                        type="button"
                        disabled={saving}
                        onClick={() => void toggleRole(record)}
                        className="min-h-10 rounded-lg px-3 py-2 text-sm font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                      >
                        {record.isActive ? "Deactivate" : "Activate"}
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
            <div className="hidden overflow-x-auto md:block">
              <table className="settings-list-table w-full min-w-[760px] border-separate border-spacing-0 text-left">
                <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-400">
                  <tr className="border-0">
                    <th className="px-5 py-3 font-semibold">Role</th>
                    <th className="px-5 py-3 font-semibold">Users</th>
                    <th className="px-5 py-3 font-semibold">Permissions</th>
                    <th className="px-5 py-3 font-semibold">Status</th>
                    <th className="px-5 py-3 text-right font-semibold">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {roles.map((record) => (
                    <tr
                      key={record.id}
                      className="transition-colors duration-150 hover:bg-slate-50/60"
                    >
                      <td className="px-5 py-4">
                        <p className="text-sm font-semibold text-slate-800">
                          {record.name}
                        </p>
                        <p className="mt-0.5 text-xs text-slate-400">
                          {record.code}
                          {record.isSystem ? " · System role" : ""}
                        </p>
                        {record.description && (
                          <p className="mt-1 max-w-md text-xs text-slate-500">
                            {record.description}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-sm text-slate-600">
                        {record.userCount}
                      </td>
                      <td className="px-5 py-4">
                        <span className="inline-flex items-center gap-1.5 text-sm text-slate-600">
                          <KeyRound className="size-3.5 text-slate-400" />
                          {record.permissionCount}
                        </span>
                      </td>
                      <td className="px-5 py-4">
                        <StatusPill active={record.isActive}>
                          {record.isActive ? "Active" : "Inactive"}
                        </StatusPill>
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="inline-flex items-center gap-1">
                          <button
                            type="button"
                            onClick={() => void openPermissions(record)}
                            className="rounded-lg px-3 py-2 text-xs font-semibold text-teal-700 hover:bg-teal-50"
                          >
                            Permissions
                          </button>
                          {!record.isSystem && (
                            <button
                              type="button"
                              disabled={saving}
                              onClick={() => void toggleRole(record)}
                              className="rounded-lg px-3 py-2 text-xs font-semibold text-slate-500 hover:bg-slate-100 disabled:opacity-40"
                            >
                              {record.isActive ? "Deactivate" : "Activate"}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {roles.length === 0 && (
              <div className="p-10 text-center">
                <ShieldCheck className="mx-auto size-8 text-slate-300" />
                <p className="mt-3 text-sm font-medium text-slate-700">
                  No roles found
                </p>
              </div>
            )}
          </>
        )}
        <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/70 px-4 py-3 sm:px-5">
          <p className="text-xs text-slate-500">
            Page {page} of {totalPages}
          </p>
          <div className="flex gap-1">
            <button
              type="button"
              aria-label="Previous page"
              disabled={page <= 1 || loading}
              onClick={() => setPage((n) => n - 1)}
              className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white disabled:opacity-30"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              aria-label="Next page"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((n) => n + 1)}
              className="flex size-8 items-center justify-center rounded-lg text-slate-500 hover:bg-white disabled:opacity-30"
            >
              <ChevronRight className="size-4" />
            </button>
          </div>
        </div>
      </section>

      {showUserForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowUserForm(false);
          }}
        >
          <form
            onSubmit={(event) => void createUser(event)}
            className="max-h-[90vh] w-full max-w-xl overflow-y-auto rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Add user
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a clinic account and assign at least one role.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowUserForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>
            {error && (
              <div
                role="alert"
                className="mt-4 rounded-xl bg-red-50 px-3 py-2 text-sm text-red-700 ring-1 ring-red-100"
              >
                {error}
              </div>
            )}
            <div className="mt-5 grid gap-4 sm:grid-cols-2">
              <label className="text-xs font-semibold text-slate-600">
                First name
                <input
                  required
                  value={userForm.firstName}
                  onChange={(e) =>
                    setUserForm({ ...userForm, firstName: e.target.value })
                  }
                  className={`${inputClass} mt-1.5`}
                />
              </label>
              <label className="text-xs font-semibold text-slate-600">
                Last name
                <input
                  value={userForm.lastName}
                  onChange={(e) =>
                    setUserForm({ ...userForm, lastName: e.target.value })
                  }
                  className={`${inputClass} mt-1.5`}
                />
              </label>
              <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                Email
                <input
                  required
                  type="email"
                  value={userForm.email}
                  onChange={(e) =>
                    setUserForm({ ...userForm, email: e.target.value })
                  }
                  className={`${inputClass} mt-1.5`}
                />
              </label>
              {isPlatformAdmin && (
                <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                  Clinic
                  <select
                    required
                    value={selectedClinicId}
                    onChange={(e) => void loadRolesForClinic(e.target.value)}
                    disabled={loadingClinics || clinics.length === 0}
                    className={`${inputClass} mt-1.5`}
                  >
                    <option value="">
                      {loadingClinics
                        ? "Loading clinics…"
                        : clinics.length === 0
                          ? "No active clinics available"
                          : "Select a clinic"}
                    </option>
                    {clinics.map((clinic) => (
                      <option key={clinic.id} value={clinic.id}>
                        {clinic.name} ({clinic.code})
                      </option>
                    ))}
                  </select>
                  <span className="mt-1 block font-normal text-slate-400">
                    Choose which clinic this user will belong to.
                  </span>
                </label>
              )}
              <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                Temporary password
                <input
                  required
                  minLength={8}
                  type="password"
                  value={userForm.password}
                  onChange={(e) =>
                    setUserForm({ ...userForm, password: e.target.value })
                  }
                  className={`${inputClass} mt-1.5`}
                />
                <span className="mt-1 block font-normal text-slate-400">
                  At least 8 characters.
                </span>
              </label>
              <fieldset className="sm:col-span-2">
                <legend className="text-xs font-semibold text-slate-600">
                  Assign roles
                </legend>
                {loadingRoles ? (
                  <p className="mt-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-500">
                    Loading available roles…
                  </p>
                ) : (
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {roles
                      .filter((role) => role.isActive)
                      .map((role) => (
                        <label
                          key={role.id}
                          className="flex items-start gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700"
                        >
                          <input
                            type="checkbox"
                            checked={userForm.roleIds.includes(role.id)}
                            onChange={(e) =>
                              setUserForm({
                                ...userForm,
                                roleIds: e.target.checked
                                  ? [...userForm.roleIds, role.id]
                                  : userForm.roleIds.filter(
                                      (id) => id !== role.id,
                                    ),
                              })
                            }
                            className="mt-0.5 accent-teal-600"
                          />
                          <span>
                            <span className="block font-medium">
                              {role.name}
                            </span>
                            <span className="text-xs text-slate-400">
                              {role.code}
                            </span>
                          </span>
                        </label>
                      ))}
                  </div>
                )}
                {!loadingRoles &&
                  roles.filter((role) => role.isActive).length === 0 && (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <p className="text-xs text-amber-700">
                        No active roles are available to assign. Check the role
                        API request and access permissions.
                      </p>
                      <button
                        type="button"
                        onClick={() => void openAddUserForm()}
                        className="text-xs font-semibold text-teal-700 underline"
                      >
                        Retry loading roles
                      </button>
                    </div>
                  )}
              </fieldset>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowUserForm(false)}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  saving ||
                  userForm.roleIds.length === 0 ||
                  (isPlatformAdmin &&
                    (!selectedClinicId ||
                      loadingClinics ||
                      clinics.length === 0))
                }
                className={primaryClass}
              >
                {saving ? "Creating..." : "Create user"}
              </button>
            </div>
          </form>
        </div>
      )}

      {showRoleForm && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) setShowRoleForm(false);
          }}
        >
          <form
            onSubmit={(event) => void createRole(event)}
            className="w-full max-w-lg rounded-2xl bg-white p-5 shadow-xl sm:p-6"
          >
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Create role
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Create a role, then configure its permissions.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowRoleForm(false)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="mt-5 space-y-4">
              <label className="block text-xs font-semibold text-slate-600">
                Role name
                <input
                  required
                  minLength={2}
                  value={roleForm.name}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      name: e.target.value,
                      code:
                        roleForm.code ||
                        e.target.value
                          .toUpperCase()
                          .replace(/[^A-Z0-9]+/g, "_")
                          .replace(/^_|_$/g, ""),
                    })
                  }
                  className={`${inputClass} mt-1.5`}
                />
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Role code
                <input
                  required
                  minLength={2}
                  value={roleForm.code}
                  onChange={(e) =>
                    setRoleForm({
                      ...roleForm,
                      code: e.target.value.toUpperCase().replace(/\s+/g, "_"),
                    })
                  }
                  className={`${inputClass} mt-1.5`}
                />
                <span className="mt-1 block font-normal text-slate-400">
                  Unique identifier; spaces become underscores.
                </span>
              </label>
              <label className="block text-xs font-semibold text-slate-600">
                Description{" "}
                <span className="font-normal text-slate-400">(optional)</span>
                <textarea
                  value={roleForm.description}
                  onChange={(e) =>
                    setRoleForm({ ...roleForm, description: e.target.value })
                  }
                  rows={3}
                  maxLength={255}
                  className="mt-1.5 w-full resize-y rounded-xl bg-slate-50 p-3 text-sm text-slate-700 outline-none ring-1 ring-slate-200 focus:bg-white focus:ring-teal-500/40"
                />
              </label>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowRoleForm(false)}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-500 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button type="submit" disabled={saving} className={primaryClass}>
                {saving ? "Creating..." : "Create role"}
              </button>
            </div>
          </form>
        </div>
      )}

      {editingRole && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/30 p-4">
          <section className="flex max-h-[90vh] w-full max-w-3xl flex-col overflow-hidden rounded-2xl bg-white shadow-xl">
            <div className="flex items-start justify-between p-5 sm:p-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  Role permissions
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {
                    <>
                      Choose what{" "}
                      <span className="font-semibold text-slate-700">
                        {editingRole.name}
                      </span>{" "}
                      can access.
                      {editingRole.isSystem
                        ? " Changes affect this system role only within the current clinic."
                        : ""}
                    </>
                  }
                </p>
              </div>
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="rounded-lg p-2 text-slate-400 hover:bg-slate-100"
              >
                <X className="size-4" />
              </button>
            </div>
            <div className="px-5 sm:px-6">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
                <input
                  value={permissionSearch}
                  onChange={(e) => setPermissionSearch(e.target.value)}
                  placeholder="Search permissions..."
                  className={`${inputClass} pl-9`}
                />
              </div>
              <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
                <span>{rolePermissionIds.length} selected</span>
                <div className="flex gap-3">
                  <button
                    type="button"
                    onClick={() =>
                      setRolePermissionIds([
                        ...new Set([
                          ...rolePermissionIds,
                          ...visiblePermissions.map((p) => p.id),
                        ]),
                      ])
                    }
                    className="font-semibold text-teal-700 disabled:opacity-40"
                  >
                    Select visible
                  </button>
                  <button
                    type="button"
                    onClick={() =>
                      setRolePermissionIds(
                        rolePermissionIds.filter(
                          (id) => !visiblePermissions.some((p) => p.id === id),
                        ),
                      )
                    }
                    className="font-semibold text-slate-500 disabled:opacity-40"
                  >
                    Clear visible
                  </button>
                </div>
              </div>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4 sm:px-6">
              {Object.entries(
                visiblePermissions.reduce<Record<string, PermissionRecord[]>>(
                  (groups, permission) => {
                    const group = permission.permissionGroup?.name || "Other";
                    (groups[group] ||= []).push(permission);
                    return groups;
                  },
                  {},
                ),
              ).map(([group, items]) => (
                <div key={group} className="mb-4 rounded-xl bg-slate-50 p-3">
                  <h3 className="mb-2 text-xs font-bold uppercase tracking-wide text-slate-500">
                    {group}
                  </h3>
                  <div className="grid gap-2 sm:grid-cols-2">
                    {items.map((permission) => (
                      <label
                        key={permission.id}
                        className="flex items-start gap-2 rounded-lg bg-white p-3 ring-1 ring-slate-100"
                      >
                        <input
                          type="checkbox"
                          checked={rolePermissionIds.includes(permission.id)}
                          onChange={(e) =>
                            setRolePermissionIds(
                              e.target.checked
                                ? [...rolePermissionIds, permission.id]
                                : rolePermissionIds.filter(
                                    (id) => id !== permission.id,
                                  ),
                            )
                          }
                          className="mt-0.5 accent-teal-600 disabled:opacity-50"
                        />
                        <span className="min-w-0">
                          <span className="block text-sm font-medium text-slate-700">
                            {permission.name}
                          </span>
                          <span className="mt-0.5 block break-all text-[11px] text-slate-400">
                            {permission.code}
                          </span>
                          {permission.description && (
                            <span className="mt-1 block text-xs text-slate-500">
                              {permission.description}
                            </span>
                          )}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              ))}
              {visiblePermissions.length === 0 && (
                <p className="p-8 text-center text-sm text-slate-400">
                  No matching permissions.
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2 bg-slate-50 p-4 sm:px-6">
              <button
                type="button"
                onClick={() => setEditingRole(null)}
                className="h-10 rounded-xl px-4 text-sm font-semibold text-slate-500 hover:bg-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => void savePermissions()}
                disabled={saving}
                className={primaryClass}
              >
                {saving ? "Saving..." : "Save permissions"}
              </button>
            </div>
          </section>
        </div>
      )}
    </div>
  );
}
