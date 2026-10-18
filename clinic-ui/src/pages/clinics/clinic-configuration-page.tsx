import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { Building2, Clock3, RefreshCw, Save } from "lucide-react";
import { useAuth } from "@/auth/auth-context";
import { ClinicLogo } from "@/components/clinic-logo";
import {
  clinicSettingsService,
  type ClinicBranding,
  type ClinicWorkingHours,
} from "@/services/clinic-settings-service";

const inputClass =
  "h-10 w-full rounded-xl bg-slate-50 px-3 text-sm text-slate-700 outline-none ring-1 !ring-[#e2e8f0] placeholder:text-slate-400 focus:bg-white focus:ring-teal-500/40 disabled:cursor-not-allowed disabled:opacity-60";
const primaryClass =
  "inline-flex h-10 items-center justify-center gap-2 rounded-xl bg-teal-600 px-4 text-sm font-semibold text-white transition hover:bg-teal-700 disabled:opacity-50";
const WEEK_DAYS = [
  { value: "MONDAY", label: "Monday" },
  { value: "TUESDAY", label: "Tuesday" },
  { value: "WEDNESDAY", label: "Wednesday" },
  { value: "THURSDAY", label: "Thursday" },
  { value: "FRIDAY", label: "Friday" },
  { value: "SATURDAY", label: "Saturday" },
  { value: "SUNDAY", label: "Sunday" },
];
const DEFAULT_BRANDING: ClinicBranding = {
  name: "",
  tagline: "",
  logoUrl: null,
  brandColor: "#0F766E",
};
const DEFAULT_HOURS: ClinicWorkingHours = {
  openingTime: "09:00",
  closingTime: "18:00",
  defaultAppointmentDuration: 30,
  workingDays: [
    "MONDAY",
    "TUESDAY",
    "WEDNESDAY",
    "THURSDAY",
    "FRIDAY",
    "SATURDAY",
  ],
};

export function ClinicConfigurationPage() {
  const { user, hasPermission } = useAuth();
  const canRead =
    user?.isPlatformAdmin === true || hasPermission("SETTINGS_READ");
  const canUpdate =
    user?.isPlatformAdmin === true || hasPermission("SETTINGS_UPDATE");
  const [branding, setBranding] = useState<ClinicBranding>(DEFAULT_BRANDING);
  const [hours, setHours] = useState<ClinicWorkingHours>(DEFAULT_HOURS);
  const [loading, setLoading] = useState(true);
  const [savingBranding, setSavingBranding] = useState(false);
  const [savingHours, setSavingHours] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const load = useCallback(async () => {
    if (!canRead) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const [brandingResponse, hoursResponse] = await Promise.all([
        clinicSettingsService.getBranding(),
        clinicSettingsService.getWorkingHours(),
      ]);
      setBranding({
        name: brandingResponse.data.name ?? "",
        tagline: brandingResponse.data.tagline ?? "",
        logoUrl: brandingResponse.data.logoUrl ?? null,
        brandColor:
          brandingResponse.data.brandColor ?? DEFAULT_BRANDING.brandColor,
      });
      setHours({ ...DEFAULT_HOURS, ...hoursResponse.data });
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message?.toString() ||
          "Unable to load clinic configuration. Check your settings permissions and API.",
      );
    } finally {
      setLoading(false);
    }
  }, [canRead]);

  useEffect(() => {
    void load();
  }, [load]);

  async function saveBranding(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingBranding(true);
    setError(null);
    setNotice(null);
    try {
      const response = await clinicSettingsService.updateBranding(branding);
      setBranding({
        name: response.data.name ?? "",
        tagline: response.data.tagline ?? "",
        logoUrl: response.data.logoUrl ?? null,
        brandColor: response.data.brandColor ?? DEFAULT_BRANDING.brandColor,
      });
      window.dispatchEvent(new Event("clinic-branding-updated"));
      setNotice("Clinic identity and branding saved successfully.");
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message?.toString() ||
          "Unable to save clinic branding.",
      );
    } finally {
      setSavingBranding(false);
    }
  }

  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const input = event.currentTarget;
    const file = input.files?.[0];
    if (!file) return;
    if (!["image/png", "image/jpeg", "image/webp"].includes(file.type)) {
      setError("Choose a PNG, JPG, or WEBP image.");
      input.value = "";
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setError("Logo must be 2 MB or smaller.");
      input.value = "";
      return;
    }
    setUploadingLogo(true);
    setError(null);
    setNotice(null);
    try {
      const response = await clinicSettingsService.uploadLogo(file);
      setBranding((current) => ({
        ...current,
        logoUrl: response.data.logoUrl,
      }));
      window.dispatchEvent(new Event("clinic-branding-updated"));
      setNotice("Logo uploaded successfully.");
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message?.toString() ||
          "Unable to upload clinic logo.",
      );
    } finally {
      setUploadingLogo(false);
      input.value = "";
    }
  }

  async function saveHours(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSavingHours(true);
    setError(null);
    setNotice(null);
    try {
      const response = await clinicSettingsService.updateWorkingHours(hours);
      setHours({ ...DEFAULT_HOURS, ...response.data });
      setNotice("Clinic working hours saved successfully.");
    } catch (requestError: any) {
      setError(
        requestError?.response?.data?.message?.toString() ||
          "Unable to save clinic working hours.",
      );
    } finally {
      setSavingHours(false);
    }
  }

  if (!canRead)
    return (
      <div className="p-6">
        <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 !ring-[#e2e8f0]">
          <Building2 className="mx-auto size-8 text-slate-300" />
          <h1 className="mt-3 text-lg font-semibold text-slate-900">
            Clinic configuration access required
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Your account does not have permission to view clinic configuration.
          </p>
        </div>
      </div>
    );

  return (
    <div className="space-y-5 p-4 sm:p-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-medium text-teal-600">Administration</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-900">
            Clinic configuration
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            Manage clinic identity, logo, and appointment working hours.
          </p>
        </div>
        <button
          type="button"
          onClick={() => void load()}
          disabled={loading}
          className="inline-flex h-10 items-center gap-2 self-start rounded-xl bg-white px-3.5 text-sm font-semibold text-slate-600 shadow-sm ring-1 !ring-[#e2e8f0] hover:bg-slate-50 disabled:opacity-50"
        >
          <RefreshCw className="size-4" />
          Refresh
        </button>
      </div>
      {error && (
        <p
          role="alert"
          className="rounded-xl bg-red-50 p-3 text-sm text-red-700"
        >
          {error}
        </p>
      )}
      {notice && (
        <p
          role="status"
          className="rounded-xl bg-emerald-50 p-3 text-sm text-emerald-700"
        >
          {notice}
        </p>
      )}
      {loading ? (
        <p className="rounded-2xl bg-white p-6 text-sm text-slate-500">
          Loading clinic configuration…
        </p>
      ) : (
        <>
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 !ring-[#e2e8f0]">
            <div className="flex items-start gap-3 border-b !border-[#e2e8f0] p-4 sm:p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Building2 className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Clinic identity & branding
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Configure the clinic name, tagline, logo, and accent color.
                  SamaRoot attribution remains consistent.
                </p>
              </div>
            </div>
            <form
              onSubmit={(event) => void saveBranding(event)}
              className="space-y-5 p-4 sm:p-5"
            >
              <div className="flex items-center gap-4 rounded-xl border !border-[#e2e8f0] p-3">
                <ClinicLogo
                  logoUrl={branding.logoUrl}
                  clinicName={branding.name}
                  className="size-16 shrink-0 rounded-xl object-contain"
                  fallbackClassName="flex size-16 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-teal-700"
                />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-slate-800">
                    {branding.name || "Your clinic name"}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    {branding.tagline || "Clinic tagline (optional)"}
                  </p>
                  <p className="mt-1 text-xs font-medium text-teal-700">
                    Powered by SamaRoot
                  </p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <label className="text-xs font-semibold text-slate-600">
                  Clinic display name
                  <input
                    required
                    maxLength={160}
                    value={branding.name}
                    onChange={(event) =>
                      setBranding({ ...branding, name: event.target.value })
                    }
                    disabled={!canUpdate}
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Tagline
                  <input
                    maxLength={300}
                    value={branding.tagline}
                    onChange={(event) =>
                      setBranding({ ...branding, tagline: event.target.value })
                    }
                    disabled={!canUpdate}
                    placeholder="Your health, our priority"
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600 sm:col-span-2">
                  Upload clinic logo
                  <input
                    type="file"
                    accept="image/png,image/jpeg,image/webp"
                    onChange={(event) => void uploadLogo(event)}
                    disabled={!canUpdate || uploadingLogo}
                    className="mt-1.5 block w-full text-sm text-slate-600 file:mr-3 file:rounded-lg file:border-0 file:bg-teal-50 file:px-3 file:py-2 file:font-semibold file:text-teal-700 hover:file:bg-teal-100"
                  />
                  <span className="mt-1 block font-normal text-slate-400">
                    PNG, JPG, or WEBP · maximum 2 MB.
                  </span>
                  {uploadingLogo && (
                    <span className="mt-1 block text-teal-700">
                      Uploading logo…
                    </span>
                  )}
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Public logo URL (optional)
                  <input
                    type="text"
                    value={branding.logoUrl ?? ""}
                    onChange={(event) =>
                      setBranding({
                        ...branding,
                        logoUrl: event.target.value || null,
                      })
                    }
                    disabled={!canUpdate}
                    placeholder="https://example.com/logo.png"
                    className={`${inputClass} mt-1.5`}
                  />
                  <span className="mt-1 block font-normal text-slate-400">
                    Uploading a logo fills this automatically.
                  </span>
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Brand accent color
                  <div className="mt-1.5 flex h-10 items-center gap-3 rounded-xl bg-slate-50 px-3 ring-1 !ring-[#e2e8f0]">
                    <input
                      type="color"
                      aria-label="Brand accent color"
                      value={branding.brandColor}
                      onChange={(event) =>
                        setBranding({
                          ...branding,
                          brandColor: event.target.value,
                        })
                      }
                      disabled={!canUpdate}
                      className="size-7 cursor-pointer border-0 bg-transparent p-0"
                    />
                    <span className="text-sm font-normal text-slate-600">
                      {branding.brandColor}
                    </span>
                  </div>
                </label>
              </div>
              {canUpdate && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={savingBranding || uploadingLogo}
                    className={primaryClass}
                  >
                    <Save className="size-4" />
                    {savingBranding ? "Saving…" : "Save clinic identity"}
                  </button>
                </div>
              )}
            </form>
          </section>
          <section className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 !ring-[#e2e8f0]">
            <div className="flex items-start gap-3 border-b !border-[#e2e8f0] p-4 sm:p-5">
              <span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-teal-50 text-teal-700">
                <Clock3 className="size-5" />
              </span>
              <div>
                <h2 className="font-semibold text-slate-900">
                  Working hours & appointments
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Set clinic opening hours, working days, and the default
                  appointment duration.
                </p>
              </div>
            </div>
            <form
              onSubmit={(event) => void saveHours(event)}
              className="space-y-5 p-4 sm:p-5"
            >
              <div className="grid gap-4 sm:grid-cols-3">
                <label className="text-xs font-semibold text-slate-600">
                  Opening time
                  <input
                    type="time"
                    required
                    value={hours.openingTime}
                    onChange={(event) =>
                      setHours({ ...hours, openingTime: event.target.value })
                    }
                    disabled={!canUpdate}
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Closing time
                  <input
                    type="time"
                    required
                    value={hours.closingTime}
                    onChange={(event) =>
                      setHours({ ...hours, closingTime: event.target.value })
                    }
                    disabled={!canUpdate}
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
                <label className="text-xs font-semibold text-slate-600">
                  Default appointment duration (minutes)
                  <input
                    type="number"
                    min={5}
                    max={240}
                    step={5}
                    required
                    value={hours.defaultAppointmentDuration}
                    onChange={(event) =>
                      setHours({
                        ...hours,
                        defaultAppointmentDuration: Number(event.target.value),
                      })
                    }
                    disabled={!canUpdate}
                    className={`${inputClass} mt-1.5`}
                  />
                </label>
              </div>
              <fieldset>
                <legend className="text-xs font-semibold text-slate-600">
                  Working days
                </legend>
                <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                  {WEEK_DAYS.map((day) => (
                    <label
                      key={day.value}
                      className="flex items-center gap-2 rounded-lg border !border-[#e2e8f0] px-3 py-2 text-sm text-slate-600"
                    >
                      <input
                        type="checkbox"
                        checked={hours.workingDays.includes(day.value)}
                        disabled={!canUpdate}
                        onChange={(event) =>
                          setHours({
                            ...hours,
                            workingDays: event.target.checked
                              ? [...hours.workingDays, day.value]
                              : hours.workingDays.filter(
                                  (value) => value !== day.value,
                                ),
                          })
                        }
                        className="accent-teal-600"
                      />
                      {day.label}
                    </label>
                  ))}
                </div>
              </fieldset>
              {canUpdate && (
                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={
                      savingHours ||
                      hours.workingDays.length === 0 ||
                      hours.closingTime <= hours.openingTime
                    }
                    className={primaryClass}
                  >
                    <Save className="size-4" />
                    {savingHours ? "Saving…" : "Save working hours"}
                  </button>
                </div>
              )}
            </form>
          </section>
        </>
      )}
    </div>
  );
}
