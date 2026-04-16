import { api } from "./client";

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
    api.get<Competitor[]>(`/companies/${companyId}/competitors`),

  create: (companyId: string, data: Partial<Competitor>) =>
    api.post<Competitor>(`/companies/${companyId}/competitors`, data),

  update: (companyId: string, competitorId: string, data: Partial<Competitor>) =>
    api.patch<Competitor>(`/companies/${companyId}/competitors/${competitorId}`, data),

  remove: (companyId: string, competitorId: string) =>
    api.delete(`/companies/${companyId}/competitors/${competitorId}`),

  events: (companyId: string, filters?: { severity?: string; limit?: number }) => {
    const params = new URLSearchParams();
    if (filters?.severity) params.set("severity", filters.severity);
    if (filters?.limit) params.set("limit", String(filters.limit));
    const qs = params.toString();
    return api.get<CompetitorEvent[]>(`/companies/${companyId}/competitor-events${qs ? `?${qs}` : ""}`);
  },
};
