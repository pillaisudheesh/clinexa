import { apiClient } from "@/services/api-client";

export interface ClinicBranding {
  name: string;
  tagline: string;
  logoUrl: string | null;
  brandColor: string;
}

export interface ClinicWorkingHours {
  openingTime: string;
  closingTime: string;
  defaultAppointmentDuration: number;
  workingDays: string[];
}

export const clinicSettingsService = {
  getBranding: () => apiClient.get<ClinicBranding>("/clinic-settings/branding"),
  updateBranding: (branding: ClinicBranding) =>
    apiClient.patch<ClinicBranding>("/clinic-settings/branding", branding),
  uploadLogo: (file: File) => {
    const form = new FormData();
    form.append("logo", file, file.name);

    return apiClient.post<{ logoUrl: string }>(
      "/clinic-settings/branding/logo",
      form,
    );
  },
  getWorkingHours: () =>
    apiClient.get<ClinicWorkingHours>("/clinic-settings/working-hours"),
  updateWorkingHours: (hours: ClinicWorkingHours) =>
    apiClient.patch<ClinicWorkingHours>(
      "/clinic-settings/working-hours",
      hours,
    ),
  async getLogoObjectUrl(logoUrl: string): Promise<string> {
    // Image tags cannot attach the Bearer token used by apiClient. Fetch through
    // the authenticated client and return a browser object URL instead.
    const path = logoUrl.replace(/^\/api\/v1(?=\/)/, "");
    const response = await apiClient.get<Blob>(path, { responseType: "blob" });
    return URL.createObjectURL(response.data);
  },
};
