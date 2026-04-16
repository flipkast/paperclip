import { apiClient } from "./client";

export interface MediaAsset {
  id: string;
  companyId: string;
  issueId: string | null;
  type: "video" | "image" | "copy" | "script" | "email";
  title: string;
  description: string | null;
  status: "draft" | "pending_review" | "approved" | "rejected" | "published";
  fileUrl: string | null;
  thumbnailUrl: string | null;
  metadata: {
    duration?: number;
    width?: number;
    height?: number;
    model?: string;
    generationParams?: Record<string, unknown>;
  } | null;
  platformTargets: string[] | null;
  content: string | null;
  createdByAgentId: string | null;
  reviewNote: string | null;
  reviewedAt: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export const mediaAssetsApi = {
  list: (companyId: string, filters?: { type?: string; status?: string }) =>
    apiClient.get<MediaAsset[]>(`/api/companies/${companyId}/media-assets`, {
      params: filters,
    }),

  get: (companyId: string, assetId: string) =>
    apiClient.get<MediaAsset>(`/api/companies/${companyId}/media-assets/${assetId}`),

  create: (companyId: string, data: Partial<MediaAsset>) =>
    apiClient.post<MediaAsset>(`/api/companies/${companyId}/media-assets`, data),

  updateStatus: (companyId: string, assetId: string, status: string, reviewNote?: string) =>
    apiClient.patch<MediaAsset>(`/api/companies/${companyId}/media-assets/${assetId}`, {
      status,
      reviewNote,
    }),

  listPending: (companyId: string) =>
    apiClient.get<MediaAsset[]>(`/api/companies/${companyId}/media-assets-pending`),
};
