import { apiClient } from "./api-client";
import type { ReportSummary } from "@/types/reports";

export const reportsService = {
  async getSummary(fromDate?: string, toDate?: string): Promise<ReportSummary> {
    const response = await apiClient.get<ReportSummary>("/reports/summary", {
      params: { fromDate, toDate },
    });
    return response.data;
  },
};
