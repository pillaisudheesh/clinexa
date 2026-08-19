import { useState, type ChangeEvent, type FormEvent } from "react";

import {
  ArrowLeft,
  CalendarDays,
  Check,
  ChevronDown,
  LoaderCircle,
  Mail,
  MapPin,
  Phone,
  ShieldAlert,
  UserRound,
} from "lucide-react";

import { useNavigate } from "react-router-dom";

import { patientService } from "@/services/patient-service";

import type {
  CreatePatientRequest,
  PatientGender,
  BloodGroup,
  MaritalStatus,
} from "@/types/patient";

interface FormData {
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

type FormErrors = Partial<Record<keyof FormData, string>>;

const initialForm: FormData = {
  firstName: "",
  middleName: "",
  lastName: "",
  gender: "",
  dateOfBirth: "",

  phone: "",
  email: "",

  bloodGroup: "",
  maritalStatus: "",

  addressLine1: "",
  addressLine2: "",
  city: "",
  state: "",
  country: "India",
  postalCode: "",

  emergencyContactName: "",
  emergencyContactPhone: "",
  emergencyContactRelation: "",
};

const genderOptions: {
  value: PatientGender;
  label: string;
}[] = [
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
];

const bloodGroupOptions: {
  value: BloodGroup;
  label: string;
}[] = [
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
];

const maritalStatusOptions: {
  value: MaritalStatus;
  label: string;
}[] = [
  {
    value: "SINGLE",
    label: "Single",
  },
  {
    value: "MARRIED",
    label: "Married",
  },
  {
    value: "DIVORCED",
    label: "Divorced",
  },
  {
    value: "WIDOWED",
    label: "Widowed",
  },
];

function InputField({
  label,
  name,
  value,
  onChange,
  error,
  required = false,
  type = "text",
  placeholder,
  icon,
}: {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  error?: string;
  required?: boolean;
  type?: string;
  placeholder?: string;
  icon?: React.ReactNode;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="
          mb-1.5
          block
          text-xs
          font-semibold
          text-slate-600
        "
      >
        {label}

        {required && <span className="ml-1 text-teal-600">*</span>}
      </label>

      <div className="relative">
        {icon && (
          <span
            className="
              pointer-events-none
              absolute
              left-3
              top-1/2
              flex
              -translate-y-1/2
              items-center
              text-slate-400
            "
          >
            {icon}
          </span>
        )}

        <input
          id={name}
          name={name}
          type={type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          className={`
            h-11
            w-full
            rounded-xl
            bg-slate-50/60
            text-sm
            text-slate-700
            outline-none
            ring-1
            transition-all
            placeholder:text-slate-400
            focus:bg-white
            focus:ring-2
            ${icon ? "pl-10 pr-3" : "px-3"}
            ${
              error
                ? "ring-red-200 focus:ring-red-300/40"
                : "ring-slate-200/60 focus:ring-teal-500/20"
            }
          `}
        />
      </div>

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

function SelectField({
  label,
  name,
  value,
  onChange,
  options,
  error,
  required = false,
  placeholder = "Select",
}: {
  label: string;
  name: keyof FormData;
  value: string;
  onChange: (event: ChangeEvent<HTMLSelectElement>) => void;
  options: {
    value: string;
    label: string;
  }[];
  error?: string;
  required?: boolean;
  placeholder?: string;
}) {
  return (
    <div>
      <label
        htmlFor={name}
        className="
          mb-1.5
          block
          text-xs
          font-semibold
          text-slate-600
        "
      >
        {label}

        {required && <span className="ml-1 text-teal-600">*</span>}
      </label>

      <div className="relative">
        <select
          id={name}
          name={name}
          value={value}
          onChange={onChange}
          className={`
            h-11
            w-full
            appearance-none
            rounded-xl
            bg-slate-50/60
            px-3
            pr-10
            text-sm
            outline-none
            ring-1
            transition-all
            focus:bg-white
            focus:ring-2
            ${
              error
                ? "ring-red-200 focus:ring-red-300/40"
                : "ring-slate-200/60 focus:ring-teal-500/20"
            }
            ${value ? "text-slate-700" : "text-slate-400"}
          `}
        >
          <option value="">{placeholder}</option>

          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>

        <ChevronDown
          size={16}
          className="
            pointer-events-none
            absolute
            right-3
            top-1/2
            -translate-y-1/2
            text-slate-400
          "
        />
      </div>

      {error && (
        <p className="mt-1.5 text-[11px] font-medium text-red-500">{error}</p>
      )}
    </div>
  );
}

function SectionHeader({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
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
  );
}

export function PatientRegistrationPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState<FormData>(initialForm);

  const [errors, setErrors] = useState<FormErrors>({});

  const [submitting, setSubmitting] = useState(false);

  const [apiError, setApiError] = useState<string | null>(null);

  const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((current) => ({
        ...current,
        [name]: undefined,
      }));
    }
  };

  const handleSelectChange = (event: ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = event.target;

    setForm((current) => ({
      ...current,
      [name]: value,
    }));

    if (errors[name as keyof FormData]) {
      setErrors((current) => ({
        ...current,
        [name]: undefined,
      }));
    }
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!form.firstName.trim()) {
      nextErrors.firstName = "First name is required.";
    } else if (form.firstName.trim().length < 2) {
      nextErrors.firstName = "First name must contain at least 2 characters.";
    }

    if (!form.lastName.trim()) {
      nextErrors.lastName = "Last name is required.";
    }

    if (!form.gender) {
      nextErrors.gender = "Please select a gender.";
    }

    if (!form.dateOfBirth) {
      nextErrors.dateOfBirth = "Date of birth is required.";
    } else {
      const date = new Date(form.dateOfBirth);

      if (Number.isNaN(date.getTime())) {
        nextErrors.dateOfBirth = "Enter a valid date.";
      } else if (date > new Date()) {
        nextErrors.dateOfBirth = "Date of birth cannot be in the future.";
      }
    }

    if (
      form.email.trim() &&
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())
    ) {
      nextErrors.email = "Enter a valid email address.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    setApiError(null);

    if (!validate()) {
      return;
    }

    setSubmitting(true);

    try {
      const payload: CreatePatientRequest = {
        firstName: form.firstName.trim(),

        ...(form.middleName.trim()
          ? {
              middleName: form.middleName.trim(),
            }
          : {}),

        lastName: form.lastName.trim(),

        gender: form.gender as PatientGender,

        dateOfBirth: form.dateOfBirth,

        ...(form.phone.trim()
          ? {
              phone: form.phone.trim(),
            }
          : {}),

        ...(form.email.trim()
          ? {
              email: form.email.trim().toLowerCase(),
            }
          : {}),

        ...(form.bloodGroup
          ? {
              bloodGroup: form.bloodGroup as BloodGroup,
            }
          : {}),

        ...(form.maritalStatus
          ? {
              maritalStatus: form.maritalStatus as MaritalStatus,
            }
          : {}),

        ...(form.addressLine1.trim()
          ? {
              addressLine1: form.addressLine1.trim(),
            }
          : {}),

        ...(form.addressLine2.trim()
          ? {
              addressLine2: form.addressLine2.trim(),
            }
          : {}),

        ...(form.city.trim()
          ? {
              city: form.city.trim(),
            }
          : {}),

        ...(form.state.trim()
          ? {
              state: form.state.trim(),
            }
          : {}),

        ...(form.country.trim()
          ? {
              country: form.country.trim(),
            }
          : {}),

        ...(form.postalCode.trim()
          ? {
              postalCode: form.postalCode.trim(),
            }
          : {}),

        ...(form.emergencyContactName.trim()
          ? {
              emergencyContactName: form.emergencyContactName.trim(),
            }
          : {}),

        ...(form.emergencyContactPhone.trim()
          ? {
              emergencyContactPhone: form.emergencyContactPhone.trim(),
            }
          : {}),

        ...(form.emergencyContactRelation.trim()
          ? {
              emergencyContactRelation: form.emergencyContactRelation.trim(),
            }
          : {}),
      };

      const patient = await patientService.createPatient(payload);

      navigate(`/patients/${patient.id}`, {
        replace: true,
      });
    } catch (error) {
      console.error("Unable to register patient.", error);

      setApiError(
        "Unable to register patient. Please check the information and try again.",
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pb-8">
      {/* Header */}
      <div className="mb-6">
        <button
          type="button"
          onClick={() => navigate("/patients")}
          className="
            mb-4
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

        <div>
          <h1
            className="
              text-2xl
              font-semibold
              tracking-tight
              text-slate-900
            "
          >
            Register patient
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Add a new patient to your clinic.
          </p>
        </div>
      </div>

      {/* API error */}
      {apiError && (
        <div
          className="
            mb-6
            flex
            items-start
            gap-3
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
          <ShieldAlert size={19} className="mt-0.5 shrink-0" />

          <div>
            <p className="font-semibold">Unable to register patient</p>

            <p className="mt-0.5 text-xs text-red-600">{apiError}</p>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate>
        <div className="space-y-5">
          {/* Personal Information */}
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
            <SectionHeader
              icon={<UserRound size={18} />}
              title="Personal information"
              description="Basic information about the patient."
            />

            <div
              className="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-2
                lg:grid-cols-3
              "
            >
              <InputField
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={handleInputChange}
                error={errors.firstName}
                required
                placeholder="Enter first name"
              />

              <InputField
                label="Middle name"
                name="middleName"
                value={form.middleName}
                onChange={handleInputChange}
                placeholder="Enter middle name"
              />

              <InputField
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={handleInputChange}
                error={errors.lastName}
                required
                placeholder="Enter last name"
              />

              <SelectField
                label="Gender"
                name="gender"
                value={form.gender}
                onChange={handleSelectChange}
                options={genderOptions}
                error={errors.gender}
                required
              />

              <InputField
                label="Date of birth"
                name="dateOfBirth"
                value={form.dateOfBirth}
                onChange={handleInputChange}
                error={errors.dateOfBirth}
                required
                type="date"
                icon={<CalendarDays size={16} />}
              />

              <SelectField
                label="Blood group"
                name="bloodGroup"
                value={form.bloodGroup}
                onChange={handleSelectChange}
                options={bloodGroupOptions}
              />

              <SelectField
                label="Marital status"
                name="maritalStatus"
                value={form.maritalStatus}
                onChange={handleSelectChange}
                options={maritalStatusOptions}
              />
            </div>
          </section>

          {/* Contact */}
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
            <SectionHeader
              icon={<Phone size={18} />}
              title="Contact information"
              description="How the patient can be contacted."
            />

            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <InputField
                label="Phone"
                name="phone"
                value={form.phone}
                onChange={handleInputChange}
                type="tel"
                placeholder="+91 98765 43210"
                icon={<Phone size={16} />}
              />
              <p className="mt-1.5 text-[11px] text-slate-400">
                Include country code, e.g. +91 98765 43210
              </p>

              <InputField
                label="Email"
                name="email"
                value={form.email}
                onChange={handleInputChange}
                error={errors.email}
                type="email"
                placeholder="Enter email address"
                icon={<Mail size={16} />}
              />
            </div>
          </section>

          {/* Address */}
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
            <SectionHeader
              icon={<MapPin size={18} />}
              title="Address"
              description="Patient's residential address."
            />

            <div className="space-y-5">
              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <InputField
                  label="Address line 1"
                  name="addressLine1"
                  value={form.addressLine1}
                  onChange={handleInputChange}
                  placeholder="Street address"
                />

                <InputField
                  label="Address line 2"
                  name="addressLine2"
                  value={form.addressLine2}
                  onChange={handleInputChange}
                  placeholder="Apartment, suite, etc."
                />
              </div>

              <div
                className="
                  grid
                  grid-cols-1
                  gap-5
                  sm:grid-cols-2
                  lg:grid-cols-4
                "
              >
                <InputField
                  label="City"
                  name="city"
                  value={form.city}
                  onChange={handleInputChange}
                  placeholder="City"
                />

                <InputField
                  label="State"
                  name="state"
                  value={form.state}
                  onChange={handleInputChange}
                  placeholder="State"
                />

                <InputField
                  label="Country"
                  name="country"
                  value={form.country}
                  onChange={handleInputChange}
                  placeholder="Country"
                />

                <InputField
                  label="Postal code"
                  name="postalCode"
                  value={form.postalCode}
                  onChange={handleInputChange}
                  placeholder="Postal code"
                />
              </div>
            </div>
          </section>

          {/* Emergency Contact */}
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
            <SectionHeader
              icon={<ShieldAlert size={18} />}
              title="Emergency contact"
              description="Optional emergency contact information."
            />

            <div
              className="
                grid
                grid-cols-1
                gap-5
                md:grid-cols-3
              "
            >
              <InputField
                label="Contact name"
                name="emergencyContactName"
                value={form.emergencyContactName}
                onChange={handleInputChange}
                placeholder="Full name"
              />

              <InputField
                label="Phone"
                name="emergencyContactPhone"
                value={form.emergencyContactPhone}
                onChange={handleInputChange}
                type="tel"
                placeholder="Phone number"
              />

              <InputField
                label="Relationship"
                name="emergencyContactRelation"
                value={form.emergencyContactRelation}
                onChange={handleInputChange}
                placeholder="e.g. Spouse, Parent"
              />
            </div>
          </section>
        </div>

        {/* Actions */}
        <div
          className="
            mt-6
            flex
            flex-col-reverse
            gap-3
            sm:flex-row
            sm:justify-end
          "
        >
          <button
            type="button"
            disabled={submitting}
            onClick={() => navigate("/patients")}
            className="
              h-11
              rounded-xl
              px-5
              text-sm
              font-semibold
              text-slate-500
              transition-colors
              hover:bg-slate-100
              hover:text-slate-700
              disabled:cursor-not-allowed
              disabled:opacity-50
            "
          >
            Cancel
          </button>

          <button
            type="submit"
            disabled={submitting}
            className="
              inline-flex
              h-11
              items-center
              justify-center
              gap-2
              rounded-xl
              bg-teal-600
              px-6
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
              disabled:cursor-not-allowed
              disabled:opacity-60
            "
          >
            {submitting ? (
              <>
                <LoaderCircle size={17} className="animate-spin" />
                Registering...
              </>
            ) : (
              <>
                <Check size={17} />
                Register patient
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
}
