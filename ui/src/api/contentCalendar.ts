import { apiClient } from "./client";
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
  list: (companyId: string, from?: string, to?: string, platform?: string) =>
    apiClient.get<CalendarEntryWithAsset[]>(
      `/api/companies/${companyId}/content-calendar`,
      { params: { from, to, platform } },
    ),

  schedule: (
    companyId: string,
    data: {
      assetId: string;
      platform: string;
      caption?: string;
      hashtags?: string[];
      scheduledAt: string;
    },
  ) =>
    apiClient.post<CalendarEntry>(`/api/companies/${companyId}/content-calendar`, data),

  update: (companyId: string, entryId: string, data: Partial<CalendarEntry>) =>
    apiClient.patch<CalendarEntry>(
      `/api/companies/${companyId}/content-calendar/${entryId}`,
      data,
    ),

  cancel: (companyId: string, entryId: string) =>
    apiClient.delete(`/api/companies/${companyId}/content-calendar/${entryId}`),
};
