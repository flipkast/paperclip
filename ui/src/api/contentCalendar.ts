import { api } from "./client";
import type { MediaAsset } from "./mediaAssets";

export interface CalendarEntry {
  id: string;
  companyId: string;
  assetId: string;
  platform: string;
  caption: string | null;
  hashtags: string[] | null;
  scheduledAt: string;
  publishedAt: string | null;
  status: "scheduled" | "publishing" | "published" | "failed" | "cancelled";
  publishResult: {
    postId?: string;
    postUrl?: string;
    error?: string;
  } | null;
  createdAt: string;
}

export interface CalendarEntryWithAsset {
  calendar: CalendarEntry;
  asset: MediaAsset | null;
}

export const contentCalendarApi = {
  list: (companyId: string, from?: string, to?: string, platform?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (platform) params.set("platform", platform);
    const qs = params.toString();
    return api.get<CalendarEntryWithAsset[]>(`/companies/${companyId}/content-calendar${qs ? `?${qs}` : ""}`);
  },

  schedule: (
    companyId: string,
    data: {
      assetId: string;
      platform: string;
      caption?: string;
      hashtags?: string[];
      scheduledAt: string;
    },
  ) => api.post<CalendarEntry>(`/companies/${companyId}/content-calendar`, data),

  update: (companyId: string, entryId: string, data: Partial<CalendarEntry>) =>
    api.patch<CalendarEntry>(`/companies/${companyId}/content-calendar/${entryId}`, data),

  cancel: (companyId: string, entryId: string) =>
    api.delete(`/companies/${companyId}/content-calendar/${entryId}`),
};
