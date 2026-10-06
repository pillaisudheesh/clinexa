import { apiClient } from "./api-client";

import type {
  Language,
  LanguageQuery,
  PaginatedLanguages,
} from "@/types/language";

export const languageService = {
  async getLanguages(query?: LanguageQuery): Promise<PaginatedLanguages> {
    const response = await apiClient.get<PaginatedLanguages>("/languages", {
      params: query,
    });

    return response.data;
  },

  async getLanguage(id: string): Promise<Language> {
    const response = await apiClient.get<Language>(`/languages/${id}`);

    return response.data;
  },
};
