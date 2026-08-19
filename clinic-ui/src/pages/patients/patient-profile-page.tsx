import { useCallback, useEffect, useState, type ReactNode } from "react";

import {
  ArrowLeft,
  CalendarDays,
  Edit3,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  UserRound,
  X,
  Check,
} from "lucide-react";

import { useNavigate, useParams } from "react-router-dom";

import { useAuth } from "@/auth/auth-context";

import { patientService } from "@/services/patient-service";

import type {
  Patient,
  UpdatePatientRequest,
  BloodGroup,
  MaritalStatus,
  PatientGender,
} from "@/types/patient";

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

function getMaritalStatusLabel(status: string | null): string {
  if (!status) {
    return "—";
  }

  return status.charAt(0) + status.slice(1).toLowerCase();
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
  firstName: string;
  middleName: string;
  lastName: string;
  gender: string;
  dateOfBirth: string;
  phone: string;
  email: string;
  bloodGroup: string;
  maritalStatus: string;
  addressLine1: string;
  addressLine2: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
  emergencyContactRelation: string;
}

function patientToForm(patient: Patient): EditForm {
  return {
    firstName: patient.firstName ?? "",

    middleName: patient.middleName ?? "",

    lastName: patient.lastName ?? "",

    gender: patient.gender ?? "",

    dateOfBirth: patient.dateOfBirth ? patient.dateOfBirth.slice(0, 10) : "",

    phone: patient.phone ?? "",

    email: patient.email ?? "",

    bloodGroup: patient.bloodGroup ?? "",

    maritalStatus: patient.maritalStatus ?? "",

    // Address
    addressLine1: patient.addressLine1 ?? "",

    addressLine2: patient.addressLine2 ?? "",

    city: patient.city ?? "",

    state: patient.state ?? "",

    country: patient.country ?? "",

    postalCode: patient.postalCode ?? "",

    // Emergency contact
    emergencyContactName: patient.emergencyContactName ?? "",

    emergencyContactPhone: patient.emergencyContactPhone ?? "",

    emergencyContactRelation: patient.emergencyContactRelation ?? "",
  };
}

export function PatientProfilePage() {
  const { id } = useParams<{
    id: string;
  }>();

  const navigate = useNavigate();

  const { hasPermission } = useAuth();

  const [patient, setPatient] = useState<Patient | null>(null);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState<string | null>(null);

  const [editing, setEditing] = useState(false);

  const [editForm, setEditForm] = useState<EditForm | null>(null);

  const [saving, setSaving] = useState(false);

  const [statusUpdating, setStatusUpdating] = useState(false);

  const [actionError, setActionError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const canUpdate = hasPermission("PATIENT_UPDATE");

  const loadPatient = useCallback(async () => {
    if (!id) {
      setError("Patient ID is missing.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const result = await patientService.getPatient(id);

      setPatient(result);
    } catch (requestError) {
      console.error("Unable to load patient.", requestError);

      setError("Unable to load patient information.");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadPatient();
  }, [loadPatient]);

  const handleStartEdit = () => {
    if (!patient) {
      return;
    }

    setEditForm(patientToForm(patient));

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
    if (!patient || !editForm) {
      return;
    }

    setSaving(true);
    setActionError(null);

    try {
      const payload: UpdatePatientRequest = {
        firstName: editForm.firstName.trim(),

        middleName: editForm.middleName.trim() || undefined,

        lastName: editForm.lastName.trim(),

        gender: editForm.gender as PatientGender,

        dateOfBirth: editForm.dateOfBirth,

        phone: editForm.phone.trim() || undefined,

        email: editForm.email.trim() || undefined,

        bloodGroup: editForm.bloodGroup
          ? (editForm.bloodGroup as BloodGroup)
          : undefined,

        maritalStatus: editForm.maritalStatus
          ? (editForm.maritalStatus as MaritalStatus)
          : undefined,

        // Address
        addressLine1: editForm.addressLine1.trim() || undefined,

        addressLine2: editForm.addressLine2.trim() || undefined,

        city: editForm.city.trim() || undefined,

        state: editForm.state.trim() || undefined,

        country: editForm.country.trim() || undefined,

        postalCode: editForm.postalCode.trim() || undefined,

        // Emergency contact
        emergencyContactName: editForm.emergencyContactName.trim() || undefined,

        emergencyContactPhone:
          editForm.emergencyContactPhone.trim() || undefined,

        emergencyContactRelation:
          editForm.emergencyContactRelation.trim() || undefined,
      };

      const updated = await patientService.updatePatient(patient.id, payload);

      setPatient(updated);
      setEditing(false);
      setEditForm(null);
      setSuccessMessage("Patient information updated successfully.");

      window.setTimeout(() => {
        setSuccessMessage(null);
      }, 3000);
    } catch (requestError) {
      console.error("Unable to update patient.", requestError);

      setActionError(
        "Unable to update patient. Please check the information and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  const handleToggleStatus = async () => {
    if (!patient) {
      return;
    }

    setStatusUpdating(true);
    setActionError(null);

    try {
      const updated = await patientService.updatePatientStatus(patient.id, {
        isActive: !patient.isActive,
      });

      setPatient(updated);
    } catch (requestError) {
      console.error("Unable to update patient status.", requestError);

      setActionError("Unable to update patient status. Please try again.");
    } finally {
      setStatusUpdating(false);
    }
  };

  /*
   * Loading state
   */
  if (loading) {
    return (
      <div className="space-y-5">
        <div className="h-5 w-32 animate-pulse rounded bg-slate-100" />

        <div
          className="
            rounded-2xl
            bg-white
            p-6
            ring-1
            ring-slate-200/60
          "
        >
          <div className="flex items-center gap-4">
            <div className="size-16 animate-pulse rounded-2xl bg-slate-100" />

            <div className="space-y-2">
              <div className="h-5 w-44 animate-pulse rounded bg-slate-100" />

              <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        </div>

        <div className="grid gap-5 lg:grid-cols-2">
          {[1, 2, 3].map((item) => (
            <div
              key={item}
              className="
                  h-52
                  animate-pulse
                  rounded-2xl
                  bg-slate-50
                "
            />
          ))}
        </div>
      </div>
    );
  }

  /*
   * Error state
   */
  if (error || !patient) {
    return (
      <div className="space-y-5">
        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="
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
          Back to patients
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
            Unable to load patient
          </h2>

          <p className="mt-1 text-xs text-slate-400">
            {error ?? "The requested patient could not be found."}
          </p>

          <button
            type="button"
            onClick={loadPatient}
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

  return (
    <>
      {successMessage && (
        <div
          className="
          fixed
          right-5
          top-5
          z-[9999]
          flex
          items-center
          gap-3
          rounded-2xl
          bg-white
          px-4
          py-3
          shadow-[0_12px_35px_rgba(15,23,42,0.14)]
          ring-1
          ring-slate-200/70
        "
        >
          <div
            className="
            flex
            size-8
            shrink-0
            items-center
            justify-center
            rounded-full
            bg-teal-50
            text-teal-600
          "
          >
            <Check size={16} />
          </div>

          <div>
            <p className="text-xs font-semibold text-slate-700">
              Saved successfully
            </p>

            <p className="mt-0.5 text-[11px] text-slate-400">
              {successMessage}
            </p>
          </div>

          <button
            type="button"
            onClick={() => setSuccessMessage(null)}
            className="
            ml-2
            flex
            size-6
            items-center
            justify-center
            rounded-md
            text-slate-300
            hover:bg-slate-50
            hover:text-slate-500
          "
          >
            <X size={15} />
          </button>
        </div>
      )}
      <div className="space-y-5 pb-8">
        {/* Back */}
        <button
          type="button"
          onClick={() => navigate("/patients")}
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
          Back to patients
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
                  {getInitials(patient)}
                </div>

                <div className="min-w-0">
                  <div
                    className="
                    flex
                    flex-wrap
                    items-center
                    gap-2
                  "
                  >
                    <h1
                      className="
                      truncate
                      text-xl
                      font-semibold
                      tracking-tight
                      text-slate-900
                    "
                    >
                      {patient.fullName}
                    </h1>

                    <StatusBadge active={patient.isActive} />
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
                    <span>{patient.patientNumber}</span>

                    <span>·</span>

                    <span>{getGenderLabel(patient.gender)}</span>

                    <span>·</span>

                    <span>{patient.age} years</span>

                    {patient.bloodGroup && (
                      <>
                        <span>·</span>

                        <span>{getBloodGroupLabel(patient.bloodGroup)}</span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {canUpdate && (
                <div
                  className="
                  flex
                  flex-wrap
                  gap-2
                "
                >
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
                    Edit patient
                  </button>

                  <button
                    type="button"
                    disabled={statusUpdating}
                    onClick={handleToggleStatus}
                    className={`
                    inline-flex
                    h-10
                    items-center
                    justify-center
                    rounded-xl
                    px-4
                    text-xs
                    font-semibold
                    transition-colors
                    disabled:cursor-not-allowed
                    disabled:opacity-50
                    ${
                      patient.isActive
                        ? "bg-red-50 text-red-600 hover:bg-red-100"
                        : "bg-teal-50 text-teal-700 hover:bg-teal-100"
                    }
                  `}
                  >
                    {statusUpdating
                      ? "Updating..."
                      : patient.isActive
                        ? "Deactivate"
                        : "Activate"}
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Action error */}
        {actionError && (
          <div
            className="
            flex
            items-start
            justify-between
            gap-3
            rounded-2xl
            bg-red-50
            px-5
            py-4
            text-xs
            text-red-700
            ring-1
            ring-red-100
          "
          >
            <span>{actionError}</span>

            <button
              type="button"
              onClick={() => setActionError(null)}
              className="
              text-red-400
              hover:text-red-600
            "
            >
              <X size={15} />
            </button>
          </div>
        )}

        {/* Information */}
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Personal */}
          <Section
            icon={<UserRound size={18} />}
            title="Personal information"
            description="Basic patient information."
          >
            <div
              className="
              grid
              grid-cols-2
              gap-x-6
              gap-y-5
              sm:grid-cols-3
            "
            >
              <InfoItem label="First name" value={patient.firstName} />

              <InfoItem label="Last name" value={patient.lastName} />

              <InfoItem label="Gender" value={getGenderLabel(patient.gender)} />

              <InfoItem
                label="Date of birth"
                value={formatDate(patient.dateOfBirth)}
              />

              <InfoItem label="Age" value={`${patient.age} years`} />

              <InfoItem
                label="Blood group"
                value={getBloodGroupLabel(patient.bloodGroup)}
              />

              <InfoItem
                label="Marital status"
                value={getMaritalStatusLabel(patient.maritalStatus)}
              />
            </div>
          </Section>

          {/* Contact */}
          <Section
            icon={<Phone size={18} />}
            title="Contact information"
            description="Patient contact details."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Phone"
                value={
                  patient.phone ? (
                    <a
                      href={`tel:${patient.phone}`}
                      className="hover:text-teal-600"
                    >
                      {patient.phone}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />

              <InfoItem
                label="Email"
                value={
                  patient.email ? (
                    <a
                      href={`mailto:${patient.email}`}
                      className="break-all hover:text-teal-600"
                    >
                      {patient.email}
                    </a>
                  ) : (
                    "—"
                  )
                }
              />
            </div>
          </Section>

          {/* Address */}
          <Section
            icon={<MapPin size={18} />}
            title="Address"
            description="Patient residential address."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem label="Address" value={patient.addressLine1 || "—"} />

              <InfoItem label="City" value={patient.city || "—"} />

              <InfoItem label="State" value={patient.state || "—"} />

              <InfoItem label="Country" value={patient.country || "—"} />

              <InfoItem label="Postal code" value={patient.postalCode || "—"} />
            </div>
          </Section>

          {/* Emergency */}
          <Section
            icon={<ShieldAlert size={18} />}
            title="Emergency contact"
            description="Emergency contact information."
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <InfoItem
                label="Contact name"
                value={patient.emergencyContactName || "—"}
              />

              <InfoItem
                label="Phone"
                value={patient.emergencyContactPhone || "—"}
              />

              <InfoItem
                label="Relationship"
                value={patient.emergencyContactRelation || "—"}
              />
            </div>
          </Section>
        </div>

        {/* Clinic information */}
        <Section
          icon={<CalendarDays size={18} />}
          title="Clinic information"
          description="Registration and clinic details."
        >
          <div
            className="
            grid
            grid-cols-2
            gap-5
            sm:grid-cols-4
          "
          >
            <InfoItem label="Clinic" value={patient.clinic.name} />

            <InfoItem label="Clinic code" value={patient.clinic.code} />

            <InfoItem
              label="Registered"
              value={formatDate(patient.createdAt)}
            />

            <InfoItem
              label="Last updated"
              value={formatDate(patient.updatedAt)}
            />
          </div>
        </Section>

        {/* Edit modal */}
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
                    Edit patient
                  </h2>

                  <p className="mt-0.5 text-xs text-slate-400">
                    Update patient information.
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
              <div className="mt-4 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />

              <div className="space-y-5 p-5 sm:p-6">
                {actionError && (
                  <div className="rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600">
                    {actionError}
                  </div>
                )}

                <div className="grid gap-4 sm:grid-cols-2">
                  <EditInput
                    label="First name"
                    value={editForm.firstName}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              firstName: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="Middle name"
                    value={editForm.middleName}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              middleName: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="Last name"
                    value={editForm.lastName}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              lastName: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="Date of birth"
                    type="date"
                    value={editForm.dateOfBirth}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              dateOfBirth: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditSelect
                    label="Gender"
                    value={editForm.gender}
                    options={[
                      {
                        value: "MALE",
                        label: "Male",
                      },
                      {
                        value: "FEMALE",
                        label: "Female",
                      },
                      {
                        value: "OTHER",
                        label: "Other",
                      },
                    ]}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              gender: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditSelect
                    label="Blood group"
                    value={editForm.bloodGroup}
                    options={[
                      {
                        value: "A_POSITIVE",
                        label: "A+",
                      },
                      {
                        value: "A_NEGATIVE",
                        label: "A−",
                      },
                      {
                        value: "B_POSITIVE",
                        label: "B+",
                      },
                      {
                        value: "B_NEGATIVE",
                        label: "B−",
                      },
                      {
                        value: "AB_POSITIVE",
                        label: "AB+",
                      },
                      {
                        value: "AB_NEGATIVE",
                        label: "AB−",
                      },
                      {
                        value: "O_POSITIVE",
                        label: "O+",
                      },
                      {
                        value: "O_NEGATIVE",
                        label: "O−",
                      },
                    ]}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              bloodGroup: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="Phone"
                    value={editForm.phone}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              phone: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="Email"
                    type="email"
                    value={editForm.email}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              email: value,
                            }
                          : current,
                      )
                    }
                  />

                  <div className="sm:col-span-2 pt-2">
                    <div className="mb-3">
                      <h3 className="text-xs font-semibold text-slate-700">
                        Address
                      </h3>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Patient residential address.
                      </p>
                    </div>
                  </div>

                  <EditInput
                    label="Address line 1"
                    value={editForm.addressLine1}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              addressLine1: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="Address line 2"
                    value={editForm.addressLine2}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              addressLine2: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="City"
                    value={editForm.city}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              city: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="State"
                    value={editForm.state}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              state: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="Country"
                    value={editForm.country}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              country: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="Postal code"
                    value={editForm.postalCode}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              postalCode: value,
                            }
                          : current,
                      )
                    }
                  />

                  <div className="sm:col-span-2 pt-5">
                    <div className="mb-3 mt-2  pt-5">
                      <h3 className="text-xs font-semibold text-slate-700">
                        Emergency contact
                      </h3>

                      <p className="mt-0.5 text-[11px] text-slate-400">
                        Emergency contact information.
                      </p>
                    </div>
                  </div>

                  <EditInput
                    label="Contact name"
                    value={editForm.emergencyContactName}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              emergencyContactName: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="Phone"
                    value={editForm.emergencyContactPhone}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              emergencyContactPhone: value,
                            }
                          : current,
                      )
                    }
                  />

                  <EditInput
                    label="Relationship"
                    value={editForm.emergencyContactRelation}
                    onChange={(value) =>
                      setEditForm((current) =>
                        current
                          ? {
                              ...current,
                              emergencyContactRelation: value,
                            }
                          : current,
                      )
                    }
                  />
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
    </>
  );
}

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
