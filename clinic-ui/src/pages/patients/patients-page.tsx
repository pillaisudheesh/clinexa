import { useCallback, useEffect, useState } from "react";

import {
  ArrowLeft,
  ArrowRight,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Filter,
  Plus,
  Search,
  UserRound,
  X,
} from "lucide-react";

import { Link } from "react-router-dom";

import { useAuth } from "@/auth/auth-context";

import { patientService } from "@/services/patient-service";

import type { Patient, PaginatedPatients } from "@/types/patient";

const PAGE_SIZE = 10;

type StatusFilter = "all" | "active" | "inactive";

function formatDate(value: string): string {
  if (!value) {
    return "—";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(date);
}

function getInitials(patient: Patient): string {
  return `${patient.firstName?.[0] ?? ""}${patient.lastName?.[0] ?? ""}`.toUpperCase();
}

function getGenderLabel(gender: string): string {
  switch (gender) {
    case "MALE":
      return "Male";

    case "FEMALE":
      return "Female";

    case "OTHER":
      return "Other";

    default:
      return gender;
  }
}

function getBloodGroupLabel(bloodGroup: string | null): string {
  if (!bloodGroup) {
    return "—";
  }

  return bloodGroup.replace("_POSITIVE", "+").replace("_NEGATIVE", "-");
}

function EmptyState({ search }: { search: string }) {
  return (
    <div
      className="
        flex
        flex-col
        items-center
        justify-center
        px-6
        py-16
        text-center
      "
    >
      <div
        className="
          flex
          size-14
          items-center
          justify-center
          rounded-full
          bg-slate-50
          text-slate-300
          ring-1
          ring-slate-200/60
        "
      >
        <UserRound size={24} strokeWidth={1.6} />
      </div>

      <h3 className="mt-4 text-sm font-semibold text-slate-700">
        No patients found
      </h3>

      <p className="mt-1 max-w-sm text-xs leading-5 text-slate-400">
        {search
          ? "Try changing your search criteria."
          : "No patients have been registered yet."}
      </p>
    </div>
  );
}

function PatientStatus({ active }: { active: boolean }) {
  return (
    <span
      className={`
        inline-flex
        items-center
        gap-1.5
        rounded-full
        px-2.5
        py-1
        text-[11px]
        font-semibold
        ${active ? "bg-teal-50 text-teal-700" : "bg-slate-100 text-slate-500"}
      `}
    >
      <span
        className={`
          size-1.5
          rounded-full
          ${active ? "bg-teal-500" : "bg-slate-400"}
        `}
      />

      {active ? "Active" : "Inactive"}
    </span>
  );
}

function PatientRow({ patient, index }: { patient: Patient; index: number }) {
  return (
    <Link
      to={`/patients/${patient.id}`}
      className="
        group
        relative
        block
        transition-colors
        duration-150
        hover:bg-slate-50/60
      "
    >
      {index > 0 && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-[2px]
            bg-slate-200/30
          "
        />
      )}

      <div
        className="
          grid
          grid-cols-[minmax(180px,1.4fr)_minmax(200px,2fr)_80px_minmax(180px,1.4fr)_110px_40px]
          items-center
          gap-4
          px-6
          py-4
        "
      >
        {/* Patient number */}
        <div className="min-w-0">
          <p
            className="
              truncate
              text-sm
              font-semibold
              text-slate-700
            "
          >
            {patient.patientNumber}
          </p>

          <p className="mt-1 text-[11px] text-slate-400">
            Registered {formatDate(patient.createdAt)}
          </p>
        </div>

        {/* Patient */}
        <div className="flex min-w-0 items-center gap-3">
          <div
            className="
              flex
              size-10
              shrink-0
              items-center
              justify-center
              rounded-full
              bg-teal-50
              text-xs
              font-semibold
              text-teal-700
              transition-colors
              group-hover:bg-teal-100
            "
          >
            {getInitials(patient)}
          </div>

          <div className="min-w-0">
            <p
              className="
                truncate
                text-sm
                font-semibold
                text-slate-800
              "
            >
              {patient.fullName}
            </p>

            <p className="mt-0.5 truncate text-xs text-slate-400">
              {getGenderLabel(patient.gender)}
              {" · "}
              {getBloodGroupLabel(patient.bloodGroup)}
            </p>
          </div>
        </div>

        {/* Age */}
        <div>
          <p className="text-sm font-medium text-slate-600">{patient.age}</p>

          <p className="mt-1 text-[11px] text-slate-400">years</p>
        </div>

        {/* Contact */}
        <div className="min-w-0">
          <p className="truncate text-sm text-slate-600">
            {patient.phone || "—"}
          </p>

          <p className="mt-1 truncate text-xs text-slate-400">
            {patient.email || "No email"}
          </p>
        </div>

        {/* Status */}
        <div>
          <PatientStatus active={patient.isActive} />
        </div>

        {/* Action */}
        <div className="flex justify-end">
          <span
            className="
              flex
              size-8
              items-center
              justify-center
              rounded-lg
              text-slate-300
              transition-all
              duration-150
              group-hover:bg-teal-50
              group-hover:text-teal-600
            "
          >
            <ArrowRight size={16} />
          </span>
        </div>
      </div>
    </Link>
  );
}

function MobilePatientCard({
  patient,
  index,
}: {
  patient: Patient;
  index: number;
}) {
  return (
    <Link
      to={`/patients/${patient.id}`}
      className="
        group
        relative
        block
        px-5
        py-4
        transition-colors
        hover:bg-slate-50/60
      "
    >
      {index > 0 && (
        <span
          aria-hidden="true"
          className="
            pointer-events-none
            absolute
            inset-x-0
            top-0
            h-[2px]
            bg-slate-200/30
          "
        />
      )}

      <div className="flex items-start gap-3">
        <div
          className="
            flex
            size-10
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-teal-50
            text-xs
            font-semibold
            text-teal-700
          "
        >
          {getInitials(patient)}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-800">
                {patient.fullName}
              </p>

              <p className="mt-0.5 text-xs text-slate-400">
                {patient.patientNumber}
              </p>
            </div>

            <PatientStatus active={patient.isActive} />
          </div>

          <div
            className="
              mt-4
              grid
              grid-cols-2
              gap-x-4
              gap-y-3
            "
          >
            <div>
              <p className="text-[11px] text-slate-400">Age</p>

              <p className="mt-0.5 text-xs font-medium text-slate-600">
                {patient.age} years
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Gender</p>

              <p className="mt-0.5 text-xs font-medium text-slate-600">
                {getGenderLabel(patient.gender)}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Phone</p>

              <p className="mt-0.5 truncate text-xs font-medium text-slate-600">
                {patient.phone || "—"}
              </p>
            </div>

            <div>
              <p className="text-[11px] text-slate-400">Blood group</p>

              <p className="mt-0.5 text-xs font-medium text-slate-600">
                {getBloodGroupLabel(patient.bloodGroup)}
              </p>
            </div>
          </div>
        </div>

        <ArrowRight
          size={16}
          className="
            mt-1
            shrink-0
            text-slate-300
            transition-all
            group-hover:translate-x-0.5
            group-hover:text-teal-500
          "
        />
      </div>
    </Link>
  );
}

export function PatientsPage() {
  const { hasPermission } = useAuth();

  const [patients, setPatients] = useState<PaginatedPatients>({
    data: [],
    total: 0,
    page: 1,
    limit: PAGE_SIZE,
    totalPages: 0,
  });

  const [searchInput, setSearchInput] = useState("");

  const [search, setSearch] = useState("");

  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");

  const [showFilters, setShowFilters] = useState(false);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [page, setPage] = useState(1);

  const canCreate = hasPermission("PATIENT_CREATE");

  const loadPatients = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await patientService.getPatients({
        page,
        limit: PAGE_SIZE,
        search: search.trim() || undefined,
        sortBy: "createdAt",
        sortOrder: "desc",
      });

      setPatients(response);
    } catch (requestError) {
      console.error("Unable to load patients.", requestError);

      setError("Unable to load patients. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    loadPatients();
  }, [loadPatients]);

  const handleSearchSubmit = () => {
    setPage(1);
    setSearch(searchInput.trim());
  };

  const handleClearSearch = () => {
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleSearchKeyDown = (
    event: React.KeyboardEvent<HTMLInputElement>,
  ) => {
    if (event.key === "Enter") {
      handleSearchSubmit();
    }
  };

  const handlePreviousPage = () => {
    if (page <= 1) {
      return;
    }

    setPage((current) => Math.max(1, current - 1));
  };

  const handleNextPage = () => {
    if (page >= patients.totalPages) {
      return;
    }

    setPage((current) => Math.min(patients.totalPages, current + 1));
  };

  /*
   * Status filtering is intentionally kept
   * client-side for now because the current
   * backend PatientQueryDto does not expose
   * an isActive filter.
   */
  const visiblePatients =
    statusFilter === "all"
      ? patients.data
      : patients.data.filter((patient) =>
          statusFilter === "active" ? patient.isActive : !patient.isActive,
        );

  const startRecord =
    patients.total === 0 ? 0 : (patients.page - 1) * patients.limit + 1;

  const endRecord = Math.min(patients.page * patients.limit, patients.total);

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div
        className="
          flex
          flex-col
          gap-4
          sm:flex-row
          sm:items-center
          sm:justify-between
        "
      >
        <div>
          <div className="flex items-center gap-2">
            <h1
              className="
                text-2xl
                font-semibold
                tracking-tight
                text-slate-900
              "
            >
              Patients
            </h1>

            {patients.total > 0 && (
              <span
                className="
                  rounded-full
                  bg-teal-50
                  px-2.5
                  py-1
                  text-[11px]
                  font-semibold
                  text-teal-700
                "
              >
                {patients.total}
              </span>
            )}
          </div>

          <p className="mt-1 text-sm text-slate-500">
            Manage patients registered with your clinic.
          </p>
        </div>

        {canCreate && (
          <Link
            to="/patients/new"
            className="
              inline-flex
              h-10
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-teal-600
              px-4
              text-sm
              font-semibold
              text-white
              shadow-sm
              transition-all
              hover:bg-teal-700
              hover:shadow-md
              focus:outline-none
              focus:ring-2
              focus:ring-teal-500/30
              sm:w-auto
            "
          >
            <Plus size={17} />
            Register patient
          </Link>
        )}
      </div>

      {/* Search / filters */}
      <section
        className="
          rounded-2xl
          bg-white
          p-4
          shadow-[0_8px_30px_rgba(15,23,42,0.045)]
          ring-1
          ring-slate-200/60
          sm:p-5
        "
      >
        <div
          className="
            flex
            flex-col
            gap-3
            sm:flex-row
            sm:items-center
          "
        >
          <div className="relative min-w-0 flex-1">
            <Search
              size={17}
              className="
                pointer-events-none
                absolute
                left-3.5
                top-1/2
                -translate-y-1/2
                text-slate-400
              "
            />

            <input
              type="text"
              value={searchInput}
              onChange={(event) => setSearchInput(event.target.value)}
              onKeyDown={handleSearchKeyDown}
              placeholder="
                Search by name, patient number,
                phone or email
              "
              className="
                h-11
                w-full
                rounded-xl
                bg-slate-50/70
                pl-10
                pr-10
                text-sm
                text-slate-700
                outline-none
                ring-1
                ring-slate-200/60
                transition-all
                placeholder:text-slate-400
                focus:bg-white
                focus:ring-2
                focus:ring-teal-500/20
              "
            />

            {searchInput && (
              <button
                type="button"
                onClick={handleClearSearch}
                className="
                  absolute
                  right-3
                  top-1/2
                  flex
                  size-6
                  -translate-y-1/2
                  items-center
                  justify-center
                  rounded-full
                  text-slate-400
                  transition-colors
                  hover:bg-slate-100
                  hover:text-slate-600
                "
              >
                <X size={14} />
              </button>
            )}
          </div>

          <button
            type="button"
            onClick={handleSearchSubmit}
            className="
              h-11
              rounded-xl
              bg-teal-600
              px-5
              text-sm
              font-semibold
              text-white
              transition-colors
              hover:bg-teal-700
              focus:outline-none
              focus:ring-2
              focus:ring-teal-500/20
            "
          >
            Search
          </button>

          <button
            type="button"
            onClick={() => setShowFilters((current) => !current)}
            className={`
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              px-4
              text-sm
              font-medium
              transition-colors
              ${
                showFilters
                  ? "bg-teal-50 text-teal-700"
                  : "bg-slate-50 text-slate-500 hover:bg-slate-100"
              }
            `}
          >
            <Filter size={16} />
            Filters
            <ChevronDown
              size={15}
              className={`
                transition-transform
                ${showFilters ? "rotate-180" : ""}
              `}
            />
          </button>
        </div>

        {showFilters && (
          <div
            className="
              mt-4
              flex
              flex-wrap
              items-center
              gap-2
              border-t
              border-slate-100
              pt-4
            "
          >
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
                onClick={() => setStatusFilter(value)}
                className={`
                    rounded-full
                    px-3
                    py-1.5
                    text-xs
                    font-semibold
                    transition-colors
                    ${
                      statusFilter === value
                        ? "bg-teal-50 text-teal-700"
                        : "bg-slate-50 text-slate-500 hover:bg-slate-100"
                    }
                  `}
              >
                {label}
              </button>
            ))}
          </div>
        )}
      </section>

      {/* Error */}
      {error && (
        <div
          className="
            flex
            items-center
            justify-between
            gap-4
            rounded-2xl
            bg-red-50
            px-5
            py-4
            text-sm
            text-red-700
            ring-1
            ring-red-100
          "
        >
          <span>{error}</span>

          <button
            type="button"
            onClick={loadPatients}
            className="
              shrink-0
              font-semibold
              text-red-700
              hover:text-red-800
            "
          >
            Retry
          </button>
        </div>
      )}

      {/* Patient directory */}
      <section
        className="
          overflow-hidden
          rounded-2xl
          bg-white
          shadow-[0_8px_30px_rgba(15,23,42,0.045)]
          ring-1
          ring-slate-200/60
        "
      >
        {/* Table heading */}
        <div
          className="
            flex
            items-center
            justify-between
            px-5
            py-5
            sm:px-6
          "
        >
          <div>
            <h2 className="text-sm font-semibold text-slate-800">
              Patient directory
            </h2>

            <p className="mt-1 text-xs text-slate-400">
              {loading
                ? "Loading patients..."
                : patients.total === 0
                  ? "No patients"
                  : `Showing ${startRecord}–${endRecord} of ${patients.total}`}
            </p>
          </div>

          {loading && (
            <div
              className="
                flex
                items-center
                gap-2
                text-xs
                text-slate-400
              "
            >
              <span
                className="
                  size-3
                  animate-spin
                  rounded-full
                  border-2
                  border-slate-200
                  border-t-teal-500
                "
              />
              Loading
            </div>
          )}
        </div>

        {/* Desktop table */}
        <div className="hidden md:block">
          <div
            className="
              grid
              grid-cols-[minmax(180px,1.4fr)_minmax(200px,2fr)_80px_minmax(180px,1.4fr)_110px_40px]
              gap-4
              bg-slate-50/50
              px-6
              py-3
              text-[10px]
              font-semibold
              uppercase
              tracking-[0.08em]
              text-slate-400
            "
          >
            <span>Patient number</span>
            <span>Patient</span>
            <span>Age</span>
            <span>Contact</span>
            <span>Status</span>
            <span />
          </div>

          {loading && patients.data.length === 0 ? (
            <div className="space-y-0">
              {Array.from({
                length: 6,
              }).map((_, index) => (
                <div
                  key={index}
                  className="
                    grid
                    grid-cols-[minmax(180px,1.4fr)_minmax(200px,2fr)_80px_minmax(180px,1.4fr)_110px_40px]
                    items-center
                    gap-4
                    px-6
                    py-5
                  "
                >
                  <div className="h-4 w-28 animate-pulse rounded bg-slate-100" />

                  <div className="flex items-center gap-3">
                    <div className="size-10 animate-pulse rounded-full bg-slate-100" />

                    <div className="space-y-2">
                      <div className="h-3.5 w-32 animate-pulse rounded bg-slate-100" />
                      <div className="h-3 w-24 animate-pulse rounded bg-slate-100" />
                    </div>
                  </div>

                  <div className="h-3.5 w-8 animate-pulse rounded bg-slate-100" />

                  <div className="space-y-2">
                    <div className="h-3.5 w-24 animate-pulse rounded bg-slate-100" />
                    <div className="h-3 w-32 animate-pulse rounded bg-slate-100" />
                  </div>

                  <div className="h-6 w-16 animate-pulse rounded-full bg-slate-100" />
                </div>
              ))}
            </div>
          ) : visiblePatients.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <div>
              {visiblePatients.map((patient, index) => (
                <PatientRow key={patient.id} patient={patient} index={index} />
              ))}
            </div>
          )}
        </div>

        {/* Mobile list */}
        <div className="md:hidden">
          {loading && patients.data.length === 0 ? (
            <div className="space-y-4 px-5 py-5">
              {Array.from({
                length: 5,
              }).map((_, index) => (
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
          ) : visiblePatients.length === 0 ? (
            <EmptyState search={search} />
          ) : (
            <div>
              {visiblePatients.map((patient, index) => (
                <MobilePatientCard
                  key={patient.id}
                  patient={patient}
                  index={index}
                />
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {patients.total > 0 && (
          <div
            className="
              flex
              flex-col
              gap-3
              px-5
              py-4
              sm:flex-row
              sm:items-center
              sm:justify-between
              sm:px-6
            "
          >
            <p className="text-xs text-slate-400">
              Showing{" "}
              <span className="font-medium text-slate-600">{startRecord}</span>
              {"–"}
              <span className="font-medium text-slate-600">{endRecord}</span>
              {" of "}
              <span className="font-medium text-slate-600">
                {patients.total}
              </span>
            </p>

            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1 || loading}
                onClick={handlePreviousPage}
                className="
                  flex
                  size-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition-colors
                  hover:bg-slate-50
                  hover:text-slate-600
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
                aria-label="Previous page"
              >
                <ChevronLeft size={16} />
              </button>

              <span
                className="
                  min-w-16
                  text-center
                  text-xs
                  font-medium
                  text-slate-500
                "
              >
                {page} / {Math.max(patients.totalPages, 1)}
              </span>

              <button
                type="button"
                disabled={page >= patients.totalPages || loading}
                onClick={handleNextPage}
                className="
                  flex
                  size-8
                  items-center
                  justify-center
                  rounded-lg
                  text-slate-400
                  transition-colors
                  hover:bg-slate-50
                  hover:text-slate-600
                  disabled:cursor-not-allowed
                  disabled:opacity-30
                "
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
