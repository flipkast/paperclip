import { api } from "./client";

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
  get: (companyId: string, from?: string, to?: string, platform?: string) => {
    const params = new URLSearchParams();
    if (from) params.set("from", from);
    if (to) params.set("to", to);
    if (platform) params.set("platform", platform);
    const qs = params.toString();
    return api.get<CampaignMetricsResponse>(`/companies/${companyId}/campaign-metrics${qs ? `?${qs}` : ""}`);
  },
};
