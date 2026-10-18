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
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

import { departmentService } from "@/services/department-service";
import { specialtyService } from "@/services/specialty-service";

import type { Department } from "@/types/department";
import type { Specialty } from "@/types/specialty";
import type { Qualification } from "@/types/qualification";
import type { Language } from "@/types/language";
import type { RegistrationCouncil } from "@/types/registration-council";

import { registrationCouncilService } from "@/services/registration-council-service";
import { qualificationService } from "@/services/qualification-service";
import { languageService } from "@/services/language-service";
import { doctorService } from "@/services/doctor-service";

import { SearchableSelect } from "@/components/ui/SearchableSelect";
import { SearchableMultiSelect } from "@/components/ui/SearchableMultiSelect";

import { useAuth } from "@/auth/auth-context";
import type {
  DoctorGender,
  DoctorTitle,
  EmploymentType,
  CreateDoctorRequest,
} from "@/types/doctor";

export default function DoctorRegistrationPage() {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();

  const canCreate = hasPermission("DOCTOR_CREATE");

  const [formData, setFormData] = useState({
    title: "DR" as DoctorTitle,
    firstName: "",
    middleName: "",
    lastName: "",
    gender: "MALE" as DoctorGender,
    dateOfBirth: "",
    phone: "",
    email: "",
    departmentId: "",
    primarySpecialtyId: "",
    yearsOfExperience: "",
    employmentType: "FULL_TIME" as EmploymentType,
    qualificationIds: [] as string[],
    languageIds: [] as string[],
    registrationCouncilId: "",
    registrationNumber: "",
    biography: "",
    consultationFee: "",
    followUpFee: "",
    emergencyFee: "",
    teleConsultationFee: "",
    scheduleStartTime: "09:00",
    scheduleEndTime: "17:00",
    slotDuration: "30",
    scheduleDays: [1, 2, 3, 4, 5, 6] as number[],
  });

  const [departments, setDepartments] = useState<Department[]>([]);
  const [specialties, setSpecialties] = useState<Specialty[]>([]);

  const [loadingDepartments, setLoadingDepartments] = useState(false);
  const [loadingSpecialties, setLoadingSpecialties] = useState(false);
  const [qualifications, setQualifications] = useState<Qualification[]>([]);
  const [loadingQualifications, setLoadingQualifications] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [loadingLanguages, setLoadingLanguages] = useState(false);
  const [registrationCouncils, setRegistrationCouncils] = useState<
    RegistrationCouncil[]
  >([]);
  const [loadingRegistrationCouncils, setLoadingRegistrationCouncils] =
    useState(false);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    const loadDepartments = async () => {
      try {
        setLoadingDepartments(true);

        const response = await departmentService.getDepartments({
          page: 1,
          limit: 100,
        });

        setDepartments(
          response.data.filter((department) => department.isActive),
        );
      } catch (error) {
        console.error("Failed to load departments", error);
      } finally {
        setLoadingDepartments(false);
      }
    };

    loadDepartments();
  }, []);

  useEffect(() => {
    if (!formData.departmentId) {
      setSpecialties([]);
      return;
    }

    const loadSpecialties = async () => {
      try {
        setLoadingSpecialties(true);

        setFormData((previous) => ({
          ...previous,
          primarySpecialtyId: "",
        }));

        const response = await specialtyService.getSpecialties({
          page: 1,
          limit: 100,
          departmentId: formData.departmentId,
        });

        setSpecialties(response.data.filter((specialty) => specialty.isActive));
      } catch (error) {
        console.error("Failed to load specialties", error);
        setSpecialties([]);
      } finally {
        setLoadingSpecialties(false);
      }
    };

    loadSpecialties();
  }, [formData.departmentId]);

  useEffect(() => {
    const loadQualifications = async () => {
      try {
        setLoadingQualifications(true);

        const response = await qualificationService.getQualifications({
          page: 1,
          limit: 100,
        });

        setQualifications(
          response.data.filter((qualification) => qualification.isActive),
        );
      } catch (error) {
        console.error("Failed to load qualifications:", error);
        setQualifications([]);
      } finally {
        setLoadingQualifications(false);
      }
    };

    loadQualifications();
  }, []);

  useEffect(() => {
    const loadLanguages = async () => {
      try {
        setLoadingLanguages(true);

        const response = await languageService.getLanguages({
          page: 1,
          limit: 100,
        });

        setLanguages(response.data.filter((language) => language.isActive));
      } catch (error) {
        console.error("Failed to load languages:", error);
        setLanguages([]);
      } finally {
        setLoadingLanguages(false);
      }
    };

    loadLanguages();
  }, []);
  useEffect(() => {
    const loadRegistrationCouncils = async () => {
      try {
        setLoadingRegistrationCouncils(true);

        const response =
          await registrationCouncilService.getRegistrationCouncils({
            page: 1,
            limit: 100,
          });

        setRegistrationCouncils(
          response.data.filter((council) => council.isActive),
        );
      } catch (error) {
        console.error("Failed to load registration councils:", error);
        setRegistrationCouncils([]);
      } finally {
        setLoadingRegistrationCouncils(false);
      }
    };

    loadRegistrationCouncils();
  }, []);

  const handleChange = (field: keyof typeof formData, value: string) => {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handleSubmit = async () => {
    setError(null);

    if (!formData.firstName.trim()) {
      setError("First name is required.");
      return;
    }

    if (!formData.lastName.trim()) {
      setError("Last name is required.");
      return;
    }

    if (!formData.departmentId) {
      setError("Department is required.");
      return;
    }

    if (!formData.primarySpecialtyId) {
      setError("Primary specialty is required.");
      return;
    }

    if (formData.consultationFee.trim() === "" || !Number.isFinite(Number(formData.consultationFee)) || Number(formData.consultationFee) < 0) {
      setError("A valid standard consultation fee is required.");
      return;
    }

    if (formData.scheduleDays.length > 0 && formData.scheduleEndTime <= formData.scheduleStartTime) {
      setError("Doctor schedule end time must be after start time.");
      return;
    }

    try {
      setSaving(true);

      const payload: CreateDoctorRequest = {
        title: formData.title,
        firstName: formData.firstName.trim(),
        middleName: formData.middleName.trim() || undefined,
        lastName: formData.lastName.trim(),
        gender: formData.gender,
        dateOfBirth: formData.dateOfBirth || undefined,
        phone: formData.phone.trim() || undefined,
        email: formData.email.trim() || undefined,

        departmentId: formData.departmentId,
        primarySpecialtyId: formData.primarySpecialtyId,

        qualificationIds:
          formData.qualificationIds.length > 0
            ? formData.qualificationIds
            : undefined,

        languageIds:
          formData.languageIds.length > 0 ? formData.languageIds : undefined,

        registrationCouncilId: formData.registrationCouncilId || undefined,

        registrationNumber: formData.registrationNumber.trim() || undefined,

        yearsOfExperience:
          formData.yearsOfExperience !== ""
            ? Number(formData.yearsOfExperience)
            : undefined,

        employmentType: formData.employmentType,

        biography: formData.biography.trim() || undefined,
        consultationFee: Number(formData.consultationFee),
        followUpFee: formData.followUpFee.trim() !== "" ? Number(formData.followUpFee) : undefined,
        emergencyFee: formData.emergencyFee.trim() !== "" ? Number(formData.emergencyFee) : undefined,
        teleConsultationFee: formData.teleConsultationFee.trim() !== "" ? Number(formData.teleConsultationFee) : undefined,
        scheduleDays: formData.scheduleDays,
        scheduleStartTime: formData.scheduleStartTime,
        scheduleEndTime: formData.scheduleEndTime,
        slotDuration: Number(formData.slotDuration),
      };

      const doctor = await doctorService.createDoctor(payload);

      setSuccess(
        `Dr. ${doctor.firstName} ${doctor.lastName} has been registered successfully.`,
      );

      setTimeout(() => {
        navigate("/doctors");
      }, 1200);
    } catch (error) {
      console.error("Failed to register doctor:", error);

      setError(
        "Unable to register doctor. Please check the details and try again.",
      );
    } finally {
      setSaving(false);
    }
  };

  if (!canCreate) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="text-center">
          <h2 className="text-lg font-semibold text-slate-800">
            Access Denied
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            You do not have permission to register a doctor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-full bg-slate-50 p-4 md:p-6">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg p-2 text-slate-500 transition hover:bg-white hover:text-slate-700"
              aria-label="Go back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>

            <div className="flex items-center gap-3">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-teal-50 text-teal-600">
                <Stethoscope className="h-6 w-6" />
              </div>

              <div>
                <h1 className="text-xl font-semibold text-slate-800">
                  Register Doctor
                </h1>

                <p className="text-sm text-slate-500">
                  Add a new doctor to the clinic
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Form container */}
        <div className="rounded-2xl bg-white shadow-sm">
          <div className="px-5 py-4 md:px-6">
            <h2 className="text-base font-semibold text-slate-800">
              Doctor Information
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Enter the doctor's professional and contact information.
            </p>
          </div>

          <div className="p-5 md:p-6">
            {/* Form fields will be added next */}
            <div className="space-y-8">
              <section>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Personal Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Enter the doctor's basic personal information.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {/* Title */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Title
                    </label>

                    <select
                      value={formData.title}
                      onChange={(event) =>
                        handleChange("title", event.target.value)
                      }
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="DR">Dr.</option>
                      <option value="PROF">Prof.</option>
                      <option value="MR">Mr.</option>
                      <option value="MS">Ms.</option>
                    </select>
                  </div>

                  {/* First name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      First Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.firstName}
                      onChange={(event) =>
                        handleChange("firstName", event.target.value)
                      }
                      placeholder="Enter first name"
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Middle name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Middle Name
                    </label>

                    <input
                      type="text"
                      value={formData.middleName}
                      onChange={(event) =>
                        handleChange("middleName", event.target.value)
                      }
                      placeholder="Enter middle name"
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Last name */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Last Name <span className="text-red-500">*</span>
                    </label>

                    <input
                      type="text"
                      value={formData.lastName}
                      onChange={(event) =>
                        handleChange("lastName", event.target.value)
                      }
                      placeholder="Enter last name"
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Gender */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Gender <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={formData.gender}
                      onChange={(event) =>
                        handleChange("gender", event.target.value)
                      }
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="MALE">Male</option>
                      <option value="FEMALE">Female</option>
                      <option value="OTHER">Other</option>
                    </select>
                  </div>

                  {/* Date of birth */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Date of Birth
                    </label>

                    <input
                      type="date"
                      value={formData.dateOfBirth}
                      onChange={(event) =>
                        handleChange("dateOfBirth", event.target.value)
                      }
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </section>
              <section>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Contact Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Enter the doctor's contact details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  {/* Phone */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Phone
                    </label>

                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(event) =>
                        handleChange("phone", event.target.value)
                      }
                      placeholder="Enter phone number"
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Email */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Email
                    </label>

                    <input
                      type="email"
                      value={formData.email}
                      onChange={(event) =>
                        handleChange("email", event.target.value)
                      }
                      placeholder="Enter email address"
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>
                </div>
              </section>

              <section>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Professional Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Enter the doctor's department, specialty, experience, and
                    employment details.
                  </p>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-4">
                  {/* Department */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Department <span className="text-red-500">*</span>
                    </label>

                    <SearchableSelect
                      value={formData.departmentId}
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
                      onChange={(value) => handleChange("departmentId", value)}
                    />
                  </div>

                  {/* Primary Specialty */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Primary Specialty <span className="text-red-500">*</span>
                    </label>

                    <SearchableSelect
                      value={formData.primarySpecialtyId}
                      options={specialties.map((specialty) => ({
                        value: specialty.id,
                        label: specialty.name,
                      }))}
                      placeholder={
                        !formData.departmentId
                          ? "Select department first"
                          : loadingSpecialties
                            ? "Loading specialties..."
                            : "Search specialty..."
                      }
                      searchPlaceholder="Search specialty..."
                      loading={loadingSpecialties}
                      disabled={!formData.departmentId}
                      onChange={(value) =>
                        handleChange("primarySpecialtyId", value)
                      }
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Qualifications
                    </label>

                    <SearchableMultiSelect
                      value={formData.qualificationIds}
                      options={qualifications.map((qualification) => ({
                        value: qualification.id,
                        label: qualification.name,
                        secondaryLabel: qualification.code,
                      }))}
                      placeholder={
                        loadingQualifications
                          ? "Loading qualifications..."
                          : "Search qualifications..."
                      }
                      searchPlaceholder="Search qualifications..."
                      loading={loadingQualifications}
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          qualificationIds: value,
                        }))
                      }
                    />
                  </div>

                  <div className="sm:col-span-2 self-start">
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Languages
                    </label>

                    <SearchableMultiSelect
                      value={formData.languageIds}
                      options={languages.map((language) => ({
                        value: language.id,
                        label: language.name,
                        secondaryLabel: language.code,
                      }))}
                      placeholder={
                        loadingLanguages
                          ? "Loading languages..."
                          : "Search languages..."
                      }
                      searchPlaceholder="Search languages..."
                      loading={loadingLanguages}
                      onChange={(value) =>
                        setFormData((current) => ({
                          ...current,
                          languageIds: value,
                        }))
                      }
                    />
                  </div>

                  {/* Years of Experience */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Years of Experience
                    </label>

                    <input
                      type="number"
                      min="0"
                      max="60"
                      value={formData.yearsOfExperience}
                      onChange={(event) =>
                        handleChange("yearsOfExperience", event.target.value)
                      }
                      placeholder="Years"
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition placeholder:text-slate-400 focus:ring-2 focus:ring-teal-500"
                    />
                  </div>

                  {/* Employment Type */}
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Employment Type <span className="text-red-500">*</span>
                    </label>

                    <select
                      value={formData.employmentType}
                      onChange={(event) =>
                        handleChange("employmentType", event.target.value)
                      }
                      className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 outline-none ring-1 ring-slate-200 transition focus:ring-2 focus:ring-teal-500"
                    >
                      <option value="FULL_TIME">Full Time</option>
                      <option value="PART_TIME">Part Time</option>
                      <option value="VISITING">Visiting</option>
                      <option value="CONSULTANT">Consultant</option>
                      <option value="RESIDENT">Resident</option>
                    </select>
                  </div>
                </div>
              </section>
              <section>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-800">Consultation fees</h3>
                  <p className="mt-1 text-xs text-slate-400">Set the fees used when creating appointments and checking patients in.</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
                  {([
                    ["consultationFee", "Standard fee *", "Required"],
                    ["followUpFee", "Follow-up fee", "Optional"],
                    ["emergencyFee", "Emergency fee", "Optional"],
                    ["teleConsultationFee", "Teleconsultation fee", "Optional"],
                  ] as const).map(([field, label, placeholder]) => (
                    <div key={field}>
                      <label className="mb-1.5 block text-sm font-medium text-slate-700">{label}</label>
                      <div className="flex items-center rounded-lg bg-white ring-1 ring-slate-200 focus-within:ring-2 focus-within:ring-teal-500">
                        <span className="pl-3 text-sm text-slate-500">₹</span>
                        <input type="number" min="0" step="0.01" value={formData[field]} onChange={(event) => handleChange(field, event.target.value)} placeholder={placeholder} className="w-full rounded-lg bg-transparent px-3 py-2.5 text-sm text-slate-700 outline-none" />
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-800">Doctor availability</h3>
                  <p className="mt-1 text-xs text-slate-400">Choose the days and hours when this doctor accepts appointments. These must fit within clinic working hours.</p>
                </div>
                <div className="grid gap-5 sm:grid-cols-3">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Start time</label>
                    <input type="time" value={formData.scheduleStartTime} onChange={(event) => handleChange("scheduleStartTime", event.target.value)} className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">End time</label>
                    <input type="time" value={formData.scheduleEndTime} onChange={(event) => handleChange("scheduleEndTime", event.target.value)} className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500" />
                  </div>
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">Appointment duration</label>
                    <select value={formData.slotDuration} onChange={(event) => handleChange("slotDuration", event.target.value)} className="w-full rounded-lg bg-white px-3 py-2.5 text-sm text-slate-700 ring-1 ring-slate-200 focus:ring-2 focus:ring-teal-500">
                      <option value="10">10 minutes</option><option value="15">15 minutes</option><option value="20">20 minutes</option><option value="30">30 minutes</option><option value="45">45 minutes</option><option value="60">60 minutes</option>
                    </select>
                  </div>
                </div>
                <div className="mt-4 flex flex-wrap gap-2">
                  {[{day:1,label:"Monday"},{day:2,label:"Tuesday"},{day:3,label:"Wednesday"},{day:4,label:"Thursday"},{day:5,label:"Friday"},{day:6,label:"Saturday"},{day:0,label:"Sunday"}].map(({day,label}) => (
                    <label key={day} className={`inline-flex cursor-pointer items-center gap-2 rounded-lg px-3 py-2 text-sm ring-1 ${formData.scheduleDays.includes(day) ? "bg-teal-50 text-teal-800 ring-teal-200" : "bg-white text-slate-600 ring-slate-200"}`}>
                      <input type="checkbox" checked={formData.scheduleDays.includes(day)} onChange={(event) => setFormData((current) => ({...current, scheduleDays: event.target.checked ? [...current.scheduleDays, day] : current.scheduleDays.filter((item) => item !== day)}))} className="accent-teal-600" />
                      {label}
                    </label>
                  ))}
                </div>
                <p className="mt-2 text-xs text-slate-400">Leave all days unchecked if the schedule should be configured later.</p>
              </section>

              <section>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Registration Information
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Enter the doctor's professional registration details.
                  </p>
                </div>

                <div className="grid gap-5 sm:grid-cols-2">
                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Registration Council
                    </label>

                    <SearchableSelect
                      value={formData.registrationCouncilId}
                      options={registrationCouncils.map((council) => ({
                        value: council.id,
                        label: council.name,
                        secondaryLabel: council.code,
                      }))}
                      placeholder={
                        loadingRegistrationCouncils
                          ? "Loading councils..."
                          : "Search registration council..."
                      }
                      searchPlaceholder="Search registration council..."
                      loading={loadingRegistrationCouncils}
                      onChange={(value) =>
                        handleChange("registrationCouncilId", value)
                      }
                    />
                  </div>

                  <div>
                    <label className="mb-1.5 block text-sm font-medium text-slate-700">
                      Registration Number
                    </label>

                    <input
                      type="text"
                      value={formData.registrationNumber}
                      onChange={(event) =>
                        handleChange("registrationNumber", event.target.value)
                      }
                      placeholder="Enter registration number"
                      className="
                        h-10
                        w-full
                        rounded-xl
                        border-0
                        bg-slate-50
                        px-3
                        text-sm
                        text-slate-700
                        outline-none
                        ring-1
                        ring-slate-200/70
                        placeholder:text-slate-300
                        focus:bg-white
                        focus:ring-2
                        focus:ring-teal-500/20
        "
                    />
                  </div>
                </div>
              </section>
              <section>
                <div className="mb-5">
                  <h3 className="text-sm font-semibold text-slate-800">
                    Professional Biography
                  </h3>

                  <p className="mt-1 text-xs text-slate-400">
                    Add a brief description of the doctor's professional
                    background and expertise.
                  </p>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-slate-700">
                    Biography
                  </label>

                  <textarea
                    value={formData.biography}
                    onChange={(event) =>
                      handleChange("biography", event.target.value)
                    }
                    placeholder="Enter a brief professional biography..."
                    rows={4}
                    className="
                        w-full
                        resize-none
                        rounded-xl
                        border-0
                        bg-slate-50
                        px-3
                        py-2.5
                        text-sm
                        text-slate-700
                        outline-none
                        ring-1
                        ring-slate-200/70
                        placeholder:text-slate-300
                        focus:bg-white
                        focus:ring-2
                        focus:ring-teal-500/20
                    "
                  />
                </div>
              </section>
            </div>
          </div>

          <div className="flex flex-col-reverse gap-3 px-5 py-4 sm:flex-row sm:justify-end md:px-6">
            <button
              type="button"
              onClick={() => navigate(-1)}
              className="rounded-lg bg-slate-100 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-200"
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={handleSubmit}
              disabled={saving}
              className="
            inline-flex
            h-10
            items-center
            justify-center
            gap-2
            rounded-xl
            bg-teal-600
            px-5
            text-xs
            font-semibold
            text-white
            shadow-sm
            transition
            hover:bg-teal-700
            disabled:cursor-not-allowed
            disabled:opacity-50
        "
            >
              {saving ? "Registering..." : "Register Doctor"}
            </button>
          </div>

          {success && (
            <div className="mb-4 rounded-xl bg-teal-50 px-4 py-3 text-xs font-medium text-teal-700 ring-1 ring-teal-100">
              {success}
            </div>
          )}

          {error && (
            <div className="mb-4 rounded-xl bg-red-50 px-4 py-3 text-xs text-red-600 ring-1 ring-red-100">
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
