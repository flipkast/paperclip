import { apiClient } from "./client";

export interface Competitor {
  id: string;
  companyId: string;
  name: string;
  websiteUrl: string | null;
  socialHandles: Record<string, string> | null;
  trackingConfig: {
    platforms: string[];
    frequency: string;
    keywords: string[];
  } | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface CompetitorEvent {
  id: string;
  companyId: string;
  competitorId: string;
  eventType: string;
  title: string;
  description: string | null;
  severity: "low" | "medium" | "high" | "critical";
  sourceUrl: string | null;
  platform: string | null;
  detectedAt: string;
  data: Record<string, unknown> | null;
  createdAt: string;
}

export const competitorsApi = {
  list: (companyId: string) =>
    apiClient.get<Competitor[]>(`/api/companies/${companyId}/competitors`),

  create: (companyId: string, data: Partial<Competitor>) =>
    apiClient.post<Competitor>(`/api/companies/${companyId}/competitors`, data),

  update: (companyId: string, competitorId: string, data: Partial<Competitor>) =>
    apiClient.patch<Competitor>(
      `/api/companies/${companyId}/competitors/${competitorId}`,
      data,
    ),

  remove: (companyId: string, competitorId: string) =>
    apiClient.delete(`/api/companies/${companyId}/competitors/${competitorId}`),

  events: (companyId: string, filters?: { severity?: string; limit?: number }) =>
    apiClient.get<CompetitorEvent[]>(`/api/companies/${companyId}/competitor-events`, {
      params: filters,
    }),
};
