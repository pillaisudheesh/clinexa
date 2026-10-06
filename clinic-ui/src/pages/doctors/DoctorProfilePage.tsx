import { useCallback, useEffect, useState, type ReactNode } from "react";
import {
  ArrowLeft,
  BriefcaseMedical,
  CalendarDays,
  Edit3,
  GraduationCap,
  Languages,
  Mail,
  Phone,
  ShieldAlert,
  Stethoscope,
  UserRound,
  X,
} from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/auth/auth-context";
import { doctorService } from "@/services/doctor-service";
import type { Doctor, UpdateDoctorRequest } from "@/types/doctor";

import { departmentService } from "@/services/department-service";
import { specialtyService } from "@/services/specialty-service";
import { qualificationService } from "@/services/qualification-service";
import { languageService } from "@/services/language-service";
import { registrationCouncilService } from "@/services/registration-council-service";

import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { SearchableMultiSelect } from "@/components/ui/SearchableMultiSelect";

import type { Department } from "@/types/department";
import type { Specialty } from "@/types/specialty";
import type { Qualification } from "@/types/qualification";
import type { Language } from "@/types/language";
import type { RegistrationCouncil } from "@/types/registration-council";

function formatDate(value: string | null | undefined): string {
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

function getInitials(doctor: Doctor): string {
  return `${doctor.firstName?.[0] ?? ""}${doctor.lastName?.[0] ?? ""}`.toUpperCase();
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

function getTitleLabel(title: string): string {
  switch (title) {
    case "DR":
      return "Dr.";
    case "PROF":
      return "Prof.";
    case "MR":
      return "Mr.";
    case "MS":
      return "Ms.";
    case "MRS":
      return "Mrs.";
    default:
      return title;
  }
}

function getEmploymentLabel(value: string): string {
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (character) => character.toUpperCase());
}

function InfoItem({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div>
      <p className="text-[11px] font-medium text-slate-400">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}

function Section({
  icon,
  title,
  description,
  children,
}: {
  icon: ReactNode;
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <section
      className="
        rounded-2xl
        bg-white
        p-5
        shadow-[0_8px_30px_rgba(15,23,42,0.045)]
        ring-1
        ring-slate-200/60
        sm:p-6
      "
    >
      <div className="mb-5 flex items-start gap-3">
        <div
          className="
            flex
            size-9
            shrink-0
            items-center
            justify-center
            rounded-xl
            bg-teal-50
            text-teal-600
          "
        >
          {icon}
        </div>

        <div>
          <h2 className="text-sm font-semibold text-slate-800">{title}</h2>

          <p className="mt-0.5 text-xs text-slate-400">{description}</p>
        </div>
      </div>

      {children}
    </section>
  );
}

function StatusBadge({ active }: { active: boolean }) {
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

interface EditForm {
  title: string;
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  departmentId: string;
  primarySpecialtyId: string;
  additionalSpecialtyIds: string[];
  qualificationIds: string[];
  languageIds: string[];
  registrationCouncilId: string;
  registrationNumber: string;
  employmentType: string;
  yearsOfExperience: string;
  biography: string;
}

const doctorToForm = (doctor: Doctor): EditForm => ({
  title: doctor.title,
  firstName: doctor.firstName,
  middleName: doctor.middleName ?? "",
  lastName: doctor.lastName,
  gender: doctor.gender,
  dateOfBirth: doctor.dateOfBirth ? doctor.dateOfBirth.slice(0, 10) : "",
  phone: doctor.phone ?? "",
  email: doctor.email ?? "",

  departmentId: doctor.department?.id ?? "",

  primarySpecialtyId: doctor.primarySpecialty?.id ?? "",

  additionalSpecialtyIds:
    doctor.specialties
      ?.filter((specialty) => specialty.id !== doctor.primarySpecialty?.id)
      .map((specialty) => specialty.id) ?? [],

  qualificationIds:
    doctor.qualifications?.map((qualification) => qualification.id) ?? [],

  languageIds: doctor.languages?.map((language) => language.id) ?? [],

  registrationCouncilId: doctor.registrationCouncil?.id ?? "",

  registrationNumber: doctor.registrationNumber ?? "",

  employmentType: doctor.employmentType,
  yearsOfExperience:
    doctor.yearsOfExperience !== null && doctor.yearsOfExperience !== undefined
      ? String(doctor.yearsOfExperience)
      : "",
  biography: doctor.biography ?? "",
});

function EditInput({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <input
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-10
          w-full
          rounded-xl
          bg-slate-50/60
          px-3
          text-sm
          text-slate-700
          outline-none
          ring-1
          ring-slate-200/60
          transition-all
          focus:bg-white
          focus:ring-2
          focus:ring-teal-500/20
        "
      />
    </div>
  );
}

function EditSelect({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: string;
  options: {
    value: string;
    label: string;
  }[];
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label className="mb-1.5 block text-xs font-semibold text-slate-600">
        {label}
      </label>

      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="
          h-10
          w-full
          rounded-xl
          bg-slate-50/60
          px-3
          text-sm
          text-slate-700
          outline-none
          ring-1
          ring-slate-200/60
          focus:bg-white
          focus:ring-2
          focus:ring-teal-500/20
        "
      >
        <option value="">Select</option>

        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function DoctorProfilePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const [doctor, setDoctor] = useState<Doctor | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const canUpdate = hasPermission("DOCTOR_UPDATE");

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<EditForm | null>(null);
  const [saving, setSaving] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [registrationCouncils, setRegistrationCouncils] = useState<
    RegistrationCouncil[]
  >([]);

  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [loadingQualifications, setLoadingQualifications] = useState(false);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [loadingRegistrationCouncils, setLoadingRegistrationCouncils] =
    useState(false);

  const [referenceLoading, setReferenceLoading] = useState(false);

  const loadDoctor = useCallback(async () => {
    if (!id) {
      setError("Doctor ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await doctorService.getDoctor(id);
      setDoctor(result);
    } catch (requestError) {
      console.error("Unable to load doctor.", requestError);
      setError("Unable to load doctor information.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadDoctor();
  }, [loadDoctor]);

  useEffect(() => {
    const loadReferenceData = async () => {
      try {
        setLoadingDepartments(true);
        setLoadingQualifications(true);
        setLoadingLanguages(true);
        setLoadingRegistrationCouncils(true);

        const [
          departmentsResponse,
          qualificationsResponse,
          languagesResponse,
          councilsResponse,
        ] = await Promise.all([
          departmentService.getDepartments({
            page: 1,
            limit: 100,
          }),
          qualificationService.getQualifications({
            page: 1,
            limit: 100,
          }),
          languageService.getLanguages({
            page: 1,
            limit: 100,
          }),
          registrationCouncilService.getRegistrationCouncils({
            page: 1,
            limit: 100,
          }),
        ]);

        setDepartments(
          departmentsResponse.data.filter((department) => department.isActive),
        );

        setQualifications(
          qualificationsResponse.data.filter(
            (qualification) => qualification.isActive,
          ),
        );

        setLanguages(
          languagesResponse.data.filter((language) => language.isActive),
        );

        setRegistrationCouncils(
          councilsResponse.data.filter((council) => council.isActive),
        );
      } catch (error) {
        console.error("Failed to load doctor reference data:", error);
      } finally {
        setLoadingDepartments(false);
        setLoadingQualifications(false);
        setLoadingLanguages(false);
        setLoadingRegistrationCouncils(false);
      }
    };

    loadReferenceData();
  }, []);

  useEffect(() => {
    if (!editing || !editForm?.departmentId) {
      setSpecialties([]);
      return;
    }

    const loadSpecialties = async () => {
      try {
        setLoadingSpecialties(true);

        const response = await specialtyService.getSpecialties({
          page: 1,
          limit: 100,
          departmentId: editForm.departmentId,
        });

        setSpecialties(response.data.filter((specialty) => specialty.isActive));
      } catch (error) {
        console.error("Failed to load specialties:", error);
        setSpecialties([]);
      } finally {
        setLoadingSpecialties(false);
      }
    };

    loadSpecialties();
  }, [editing, editForm?.departmentId]);

  const handleStartEdit = () => {
    if (!doctor) {
      return;
    }

    setEditForm(doctorToForm(doctor));
    setActionError(null);
    setEditing(true);
  };

  const handleCloseEdit = () => {
    if (saving) {
      return;
    }

    setEditing(false);
    setEditForm(null);
    setActionError(null);
  };

  const handleUpdate = async () => {
    if (!doctor || !editForm) {
      return;
    }

    if (!editForm.firstName.trim() || !editForm.lastName.trim()) {
      setActionError("First name and last name are required.");
      return;
    }

    setSaving(true);
    setActionError(null);

    if (!editForm.departmentId) {
      setActionError("Department is required.");
      return;
    }

    if (!editForm.primarySpecialtyId) {
      setActionError("Primary specialty is required.");
      return;
    }

    try {
      const payload = {
        title: editForm.title as Doctor["title"],
        firstName: editForm.firstName.trim(),
        middleName: editForm.middleName.trim() || undefined,
        lastName: editForm.lastName.trim(),
        gender: editForm.gender as Doctor["gender"],
        dateOfBirth: editForm.dateOfBirth || undefined,
        phone: editForm.phone.trim() || undefined,
        email: editForm.email.trim() || undefined,

        departmentId: editForm.departmentId,
        primarySpecialtyId: editForm.primarySpecialtyId,
        additionalSpecialtyIds:
          editForm.additionalSpecialtyIds.length > 0
            ? editForm.additionalSpecialtyIds
            : undefined,
        qualificationIds:
          editForm.qualificationIds.length > 0
            ? editForm.qualificationIds
            : undefined,
        languageIds:
          editForm.languageIds.length > 0 ? editForm.languageIds : undefined,
        registrationCouncilId: editForm.registrationCouncilId || undefined,
        registrationNumber: editForm.registrationNumber.trim() || undefined,

        employmentType: editForm.employmentType as Doctor["employmentType"],
        yearsOfExperience: editForm.yearsOfExperience
          ? Number(editForm.yearsOfExperience)
          : undefined,
        biography: editForm.biography.trim() || undefined,
      };

      const updated = await doctorService.updateDoctor(doctor.id, payload);

      setDoctor(updated);
      setEditing(false);
      setEditForm(null);
      setSuccessMessage("Doctor information updated successfully.");

      window.setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (requestError) {
      console.error("Unable to update doctor.", requestError);

      setActionError(
        "Unable to update doctor. Please check the information and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />

        <div className="rounded-2xl bg-white p-6 ring-1 ring-slate-200/60">
          <div className="flex items-center gap-4">
            <div className="size-16 animate-pulse rounded-2xl bg-slate-100" />

            <div className="space-y-2">
              <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />
              <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-48 animate-pulse rounded-2xl bg-slate-50"
            />
          ))}
        </div>
      </div>
    );
  }

  if (error || !doctor) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate("/doctors")}
          className="s
            inline-flex
            items-center
            gap-2
            text-xs
            font-semibold
            text-slate-400
            hover:text-teal-600
          "
        >
          <ArrowLeft size={15} />
          Back to doctors
        </button>

        <div
          className="
            rounded-2xl
            bg-white
            px-6
            py-16
            text-center
            shadow-[0_8px_30px_rgba(15,23,42,0.045)]
            ring-1
            ring-slate-200/60
          "
        >
          <div
            className="
              mx-auto
              flex
              size-12
              items-center
              justify-center
              rounded-full
              bg-red-50
              text-red-500
            "
          >
            <ShieldAlert size={22} />
          </div>

          <h2 className="mt-4 text-sm font-semibold text-slate-700">
            Unable to load doctor
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {error ?? "The requested doctor could not be found."}
          </p>

          <button
            type="button"
            onClick={loadDoctor}
            className="
              mt-5
              rounded-xl
              bg-teal-600
              px-4
              py-2.5
              text-xs
              font-semibold
              text-white
              hover:bg-teal-700
            "
          >
            Try again
          </button>
        </div>
      </div>
    );
  }

  const fullName = [
    getTitleLabel(doctor.title),
    doctor.firstName,
    doctor.middleName,
    doctor.lastName,
  ]
    .filter(Boolean)
    .join(" ");

  return (
    <div className="space-y-5 pb-8">
      <button
        type="button"
        onClick={() => navigate("/doctors")}
        className="
          inline-flex
          items-center
          gap-2
          text-xs
          font-semibold
          text-slate-400
          transition-colors
          hover:text-teal-600
        "
      >
        <ArrowLeft size={15} />
        Back to doctors
      </button>

      {/* Profile header */}
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
        <div className="p-5 sm:p-6">
          <div
            className="
              flex
              flex-col
              gap-5
              sm:flex-row
              sm:items-center
              sm:justify-between
            "
          >
            <div className="flex min-w-0 items-center gap-4">
              <div
                className="
                  flex
                  size-16
                  shrink-0
                  items-center
                  justify-center
                  rounded-2xl
                  bg-teal-50
                  text-lg
                  font-semibold
                  text-teal-700
                  ring-1
                  ring-teal-100
                "
              >
                {getInitials(doctor)}
              </div>

              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <h1
                    className="
                      truncate
                      text-xl
                      font-semibold
                      tracking-tight
                      text-slate-900
                    "
                  >
                    {fullName}
                  </h1>

                  <StatusBadge active={doctor.isActive} />
                </div>

                <div
                  className="
                    mt-1.5
                    flex
                    flex-wrap
                    items-center
                    gap-x-2
                    gap-y-1
                    text-xs
                    text-slate-400
                  "
                >
                  <span>{doctor.doctorNumber}</span>
                  <span>·</span>
                  <span>{doctor.department?.name ?? "—"}</span>
                  <span>·</span>
                  <span>{doctor.primarySpecialty?.name ?? "—"}</span>
                </div>
              </div>
            </div>

            {canUpdate && (
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={handleStartEdit}
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    gap-2
                    rounded-xl
                    bg-slate-50
                    px-4
                    text-xs
                    font-semibold
                    text-slate-600
                    ring-1
                    ring-slate-200/60
                    transition-colors
                    hover:bg-slate-100
                "
                >
                  <Edit3 size={15} />
                  Edit doctor
                </button>

                <button
                  type="button"
                  className="
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    rounded-xl
                    bg-red-50
                    px-4
                    text-xs
                    font-semibold
                    text-red-600
                    transition-colors
                    hover:bg-red-100
                  "
                >
                  {doctor.isActive ? "Deactivate" : "Activate"}
                </button>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Information */}
      <div className="grid gap-5 lg:grid-cols-2">
        <Section
          icon={<UserRound size={18} />}
          title="Personal information"
          description="Basic doctor information."
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            <InfoItem label="First name" value={doctor.firstName} />

            <InfoItem label="Middle name" value={doctor.middleName} />

            <InfoItem label="Last name" value={doctor.lastName} />

            <InfoItem label="Gender" value={getGenderLabel(doctor.gender)} />

            <InfoItem
              label="Date of birth"
              value={formatDate(doctor.dateOfBirth)}
            />

            <InfoItem label="Title" value={getTitleLabel(doctor.title)} />
          </div>
        </Section>

        <Section
          icon={<Phone size={18} />}
          title="Contact information"
          description="Doctor contact details."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem
              label="Phone"
              value={
                doctor.phone ? (
                  <a
                    href={`tel:${doctor.phone}`}
                    className="hover:text-teal-600"
                  >
                    {doctor.phone}
                  </a>
                ) : (
                  "—"
                )
              }
            />

            <InfoItem
              label="Email"
              value={
                doctor.email ? (
                  <a
                    href={`mailto:${doctor.email}`}
                    className="break-all hover:text-teal-600"
                  >
                    {doctor.email}
                  </a>
                ) : (
                  "—"
                )
              }
            />
          </div>
        </Section>

        <Section
          icon={<Stethoscope size={18} />}
          title="Professional information"
          description="Department, specialty and employment details."
        >
          <div className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
            <InfoItem label="Department" value={doctor.department?.name} />

            <InfoItem
              label="Primary specialty"
              value={doctor.primarySpecialty?.name}
            />

            <InfoItem
              label="Employment type"
              value={getEmploymentLabel(doctor.employmentType)}
            />

            <InfoItem
              label="Years of experience"
              value={
                doctor.yearsOfExperience !== null &&
                doctor.yearsOfExperience !== undefined
                  ? `${doctor.yearsOfExperience} years`
                  : "—"
              }
            />
          </div>

          {doctor.specialties?.length > 0 && (
            <div className="mt-6">
              <p className="text-[11px] font-medium text-slate-400">
                Specialties
              </p>

              <div className="mt-2 flex flex-wrap gap-2">
                {doctor.specialties.map((specialty) => (
                  <span
                    key={specialty.id}
                    className="
                      rounded-full
                      bg-teal-50
                      px-2.5
                      py-1
                      text-[11px]
                      font-medium
                      text-teal-700
                    "
                  >
                    {specialty.name}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Section>

        <Section
          icon={<GraduationCap size={18} />}
          title="Qualifications"
          description="Professional qualifications."
        >
          {doctor.qualifications?.length ? (
            <div className="flex flex-wrap gap-2">
              {doctor.qualifications.map((qualification) => (
                <span
                  key={qualification.id}
                  className="
                    rounded-full
                    bg-slate-50
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-slate-600
                    ring-1
                    ring-slate-200/60
                  "
                >
                  {qualification.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">—</p>
          )}
        </Section>

        <Section
          icon={<Languages size={18} />}
          title="Languages"
          description="Languages spoken by the doctor."
        >
          {doctor.languages?.length ? (
            <div className="flex flex-wrap gap-2">
              {doctor.languages.map((language) => (
                <span
                  key={language.id}
                  className="
                    rounded-full
                    bg-slate-50
                    px-3
                    py-1.5
                    text-xs
                    font-medium
                    text-slate-600
                    ring-1
                    ring-slate-200/60
                  "
                >
                  {language.name}
                </span>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-400">—</p>
          )}
        </Section>

        <Section
          icon={<BriefcaseMedical size={18} />}
          title="Registration information"
          description="Professional registration details."
        >
          <div className="grid gap-5 sm:grid-cols-2">
            <InfoItem
              label="Registration council"
              value={doctor.registrationCouncil?.name}
            />

            <InfoItem
              label="Registration number"
              value={doctor.registrationNumber}
            />
          </div>
        </Section>
      </div>

      {/* Biography */}
      <Section
        icon={<Stethoscope size={18} />}
        title="Professional biography"
        description="Doctor profile and professional background."
      >
        <p className="whitespace-pre-line text-sm leading-6 text-slate-600">
          {doctor.biography || "—"}
        </p>
      </Section>

      {/* Clinic information */}
      <Section
        icon={<CalendarDays size={18} />}
        title="Record information"
        description="Doctor record details."
      >
        <div className="grid grid-cols-2 gap-5 sm:grid-cols-4">
          <InfoItem label="Doctor number" value={doctor.doctorNumber} />

          <InfoItem
            label="Status"
            value={<StatusBadge active={doctor.isActive} />}
          />

          <InfoItem label="Registered" value={formatDate(doctor.createdAt)} />

          <InfoItem label="Last updated" value={formatDate(doctor.updatedAt)} />
        </div>
      </Section>
      {editing && editForm && (
        <div
          className="
      fixed
      inset-0
      z-50
      flex
      items-end
      justify-center
      bg-slate-900/20
      backdrop-blur-[2px]
      sm:items-center
      sm:p-6
    "
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseEdit();
            }
          }}
        >
          <div
            className="
        max-h-[92vh]
        w-full
        overflow-y-auto
        rounded-t-3xl
        bg-white
        shadow-2xl
        ring-1
        ring-slate-200/60
        sm:max-w-2xl
        sm:rounded-3xl
      "
          >
            {/* Header */}
            <div
              className="
          sticky
          top-0
          z-10
          flex
          items-center
          justify-between
          bg-white
          px-5
          py-4
          sm:px-6
        "
            >
              <div>
                <h2 className="text-base font-semibold text-slate-800">
                  Edit doctor
                </h2>

                <p className="mt-0.5 text-xs text-slate-400">
                  Update doctor information.
                </p>
              </div>

              <button
                type="button"
                disabled={saving}
                onClick={handleCloseEdit}
                className="
            flex
            size-8
            items-center
            justify-center
            rounded-lg
            text-slate-400
            hover:bg-slate-50
            hover:text-slate-600
          "
              >
                <X size={17} />
              </button>
            </div>

            <div className="mt-1 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

            <div className="space-y-5 p-5 sm:p-6">
              {actionError && (
                <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">
                  {actionError}
                </div>
              )}

              {/* Personal information */}
              <div className="grid gap-4 sm:grid-cols-2">
                <EditInput
                  label="First name"
                  value={editForm.firstName}
                  onChange={(value) =>
                    setEditForm((current) =>
                      current ? { ...current, firstName: value } : current,
                    )
                  }
                />

                <EditInput
                  label="Middle name"
                  value={editForm.middleName}
                  onChange={(value) =>
                    setEditForm((current) =>
                      current ? { ...current, middleName: value } : current,
                    )
                  }
                />

                <EditInput
                  label="Last name"
                  value={editForm.lastName}
                  onChange={(value) =>
                    setEditForm((current) =>
                      current ? { ...current, lastName: value } : current,
                    )
                  }
                />

                <EditSelect
                  label="Title"
                  value={editForm.title}
                  options={[
                    { value: "DR", label: "Dr." },
                    { value: "PROF", label: "Prof." },
                    { value: "MR", label: "Mr." },
                    { value: "MS", label: "Ms." },
                    { value: "MRS", label: "Mrs." },
                  ]}
                  onChange={(value) =>
                    setEditForm((current) =>
                      current ? { ...current, title: value } : current,
                    )
                  }
                />

                <EditSelect
                  label="Gender"
                  value={editForm.gender}
                  options={[
                    { value: "MALE", label: "Male" },
                    { value: "FEMALE", label: "Female" },
                    { value: "OTHER", label: "Other" },
                  ]}
                  onChange={(value) =>
                    setEditForm((current) =>
                      current ? { ...current, gender: value } : current,
                    )
                  }
                />

                <EditInput
                  label="Date of birth"
                  type="date"
                  value={editForm.dateOfBirth}
                  onChange={(value) =>
                    setEditForm((current) =>
                      current ? { ...current, dateOfBirth: value } : current,
                    )
                  }
                />

                <EditInput
                  label="Phone"
                  value={editForm.phone}
                  onChange={(value) =>
                    setEditForm((current) =>
                      current ? { ...current, phone: value } : current,
                    )
                  }
                />

                <EditInput
                  label="Email"
                  type="email"
                  value={editForm.email}
                  onChange={(value) =>
                    setEditForm((current) =>
                      current ? { ...current, email: value } : current,
                    )
                  }
                />

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Department
                  </label>

                  <SearchableSelect
                    value={editForm.departmentId}
                    options={departments.map((department) => ({
                      value: department.id,
                      label: department.name,
                    }))}
                    placeholder={
                      loadingDepartments
                        ? "Loading departments..."
                        : "Search department..."
                    }
                    searchPlaceholder="Search department..."
                    loading={loadingDepartments}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              departmentId: value,
                              primarySpecialtyId: "",
                              additionalSpecialtyIds: [],
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Primary specialty
                  </label>

                  <SearchableSelect
                    value={editForm.primarySpecialtyId}
                    options={specialties.map((specialty) => ({
                      value: specialty.id,
                      label: specialty.name,
                    }))}
                    placeholder={
                      !editForm.departmentId
                        ? "Select department first"
                        : loadingSpecialties
                          ? "Loading specialties..."
                          : "Search specialty..."
                    }
                    searchPlaceholder="Search specialty..."
                    loading={loadingSpecialties}
                    disabled={!editForm.departmentId}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              primarySpecialtyId: value,
                              additionalSpecialtyIds:
                                current.additionalSpecialtyIds.filter(
                                  (id) => id !== value,
                                ),
                            }
                          : current,
                      )
                    }
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Additional specialties
                  </label>

                  <SearchableMultiSelect
                    value={editForm.additionalSpecialtyIds}
                    options={specialties
                      .filter(
                        (specialty) =>
                          specialty.id !== editForm.primarySpecialtyId,
                      )
                      .map((specialty) => ({
                        value: specialty.id,
                        label: specialty.name,
                      }))}
                    placeholder={
                      !editForm.departmentId
                        ? "Select department first"
                        : loadingSpecialties
                          ? "Loading specialties..."
                          : "Search additional specialties..."
                    }
                    searchPlaceholder="Search additional specialties..."
                    loading={loadingSpecialties}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              additionalSpecialtyIds: value,
                            }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Qualifications
                  </label>

                  <SearchableMultiSelect
                    value={editForm.qualificationIds}
                    options={qualifications.map((qualification) => ({
                      value: qualification.id,
                      label: qualification.name,
                    }))}
                    placeholder={
                      loadingQualifications
                        ? "Loading qualifications..."
                        : "Search qualifications..."
                    }
                    searchPlaceholder="Search qualifications..."
                    loading={loadingQualifications}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              qualificationIds: value,
                            }
                          : current,
                      )
                    }
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Languages
                  </label>

                  <SearchableMultiSelect
                    value={editForm.languageIds}
                    options={languages.map((language) => ({
                      value: language.id,
                      label: language.name,
                    }))}
                    placeholder={
                      loadingLanguages
                        ? "Loading languages..."
                        : "Search languages..."
                    }
                    searchPlaceholder="Search languages..."
                    loading={loadingLanguages}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              languageIds: value,
                            }
                          : current,
                      )
                    }
                  />
                </div>
                <div>
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Registration council
                  </label>

                  <SearchableSelect
                    value={editForm.registrationCouncilId}
                    options={registrationCouncils.map((council) => ({
                      value: council.id,
                      label: council.name,
                    }))}
                    placeholder={
                      loadingRegistrationCouncils
                        ? "Loading registration councils..."
                        : "Search registration council..."
                    }
                    searchPlaceholder="Search registration council..."
                    loading={loadingRegistrationCouncils}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              registrationCouncilId: value,
                            }
                          : current,
                      )
                    }
                  />
                </div>
                <div>
                  {/* <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Registration number
                  </label> */}

                  <EditInput
                    value={editForm.registrationNumber}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              registrationNumber: value,
                            }
                          : current,
                      )
                    }
                    label="Enter registration number"
                  />
                </div>

                <EditSelect
                  label="Employment type"
                  value={editForm.employmentType}
                  options={[
                    { value: "FULL_TIME", label: "Full time" },
                    { value: "PART_TIME", label: "Part time" },
                    { value: "VISITING", label: "Visiting" },
                    { value: "CONSULTANT", label: "Consultant" },
                    { value: "RESIDENT", label: "Resident" },
                  ]}
                  onChange={(value) =>
                    setEditForm((current) =>
                      current ? { ...current, employmentType: value } : current,
                    )
                  }
                />

                <EditInput
                  label="Years of experience"
                  type="number"
                  value={editForm.yearsOfExperience}
                  onChange={(value) =>
                    setEditForm((current) =>
                      current
                        ? { ...current, yearsOfExperience: value }
                        : current,
                    )
                  }
                />

                <div className="sm:col-span-2">
                  <label className="mb-1.5 block text-xs font-semibold text-slate-600">
                    Biography
                  </label>

                  <textarea
                    value={editForm.biography}
                    onChange={(event) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              biography: event.target.value,
                            }
                          : current,
                      )
                    }
                    rows={5}
                    className="
                w-full
                resize-none
                rounded-xl
                bg-slate-50/60
                px-3
                py-2.5
                text-sm
                text-slate-700
                outline-none
                ring-1
                ring-slate-200/60
                transition-all
                focus:bg-white
                focus:ring-2
                focus:ring-teal-500/20
              "
                  />
                </div>
              </div>

              <div className="mx-0 mt-5 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              <div className="flex flex-col-reverse gap-2 pt-4 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  disabled={saving}
                  onClick={handleCloseEdit}
                  className="
              h-10
              rounded-xl
              px-4
              text-xs
              font-semibold
              text-slate-500
              transition-colors
              hover:bg-slate-50
            "
                >
                  Cancel
                </button>

                <button
                  type="button"
                  disabled={saving}
                  onClick={handleUpdate}
                  className="
              h-10
              rounded-xl
              bg-teal-600
              px-5
              text-xs
              font-semibold
              text-white
              transition-all
              hover:bg-teal-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
                >
                  {saving ? "Saving..." : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
