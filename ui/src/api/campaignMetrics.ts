import { apiClient } from "./client";

export interface MetricsTotals {
  totalViews: number;
  totalEngagement: number;
  totalClicks: number;
  totalConversions: number;
  totalSpendCents: number;
  totalRevenueCents: number;
  totalImpressions: number;
  roas: number;
  engagementRate: number;
}

export interface DailyMetrics {
  date: string;
  views: number;
  engagement: number;
  clicks: number;
  spendCents: number;
  revenueCents: number;
}

export interface PlatformMetrics {
  platform: string;
  views: number;
  engagement: number;
  clicks: number;
  conversions: number;
  spendCents: number;
  revenueCents: number;
}

export interface CampaignMetricsResponse {
  totals: MetricsTotals;
  daily: DailyMetrics[];
  byPlatform: PlatformMetrics[];
}

export const campaignMetricsApi = {
  get: (companyId: string, from?: string, to?: string, platform?: string) =>
    apiClient.get<CampaignMetricsResponse>(
      `/api/companies/${companyId}/campaign-metrics`,
      { params: { from, to, platform } },
    ),
};
