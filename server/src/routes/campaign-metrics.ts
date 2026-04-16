import { Router, type Request, type Response } from "express";
import type { Db } from "@paperclipai/db";
import { eq, and, gte, lte, sql } from "drizzle-orm";
import { campaignMetrics } from "@paperclipai/db";
import { assertCompanyAccess } from "./authz.js";

export function campaignMetricsRoutes(db: Db) {
  const router = Router();

  // Get aggregated metrics for a date range
  router.get("/api/companies/:companyId/campaign-metrics", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const { from, to, platform } = req.query;
    const fromDate = (from as string) || new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0];
    const toDate = (to as string) || new Date().toISOString().split("T")[0];

    const conditions = [
      eq(campaignMetrics.companyId, companyId),
      gte(campaignMetrics.date, fromDate),
      lte(campaignMetrics.date, toDate),
    ];

    if (platform) {
      conditions.push(eq(campaignMetrics.platform, platform as string));
    }

    // Aggregated totals
    const [totals] = await db
      .select({
        totalViews: sql<number>`coalesce(sum(${campaignMetrics.views}), 0)`,
        totalEngagement: sql<number>`coalesce(sum(${campaignMetrics.engagement}), 0)`,
        totalClicks: sql<number>`coalesce(sum(${campaignMetrics.clicks}), 0)`,
        totalConversions: sql<number>`coalesce(sum(${campaignMetrics.conversions}), 0)`,
        totalSpendCents: sql<number>`coalesce(sum(${campaignMetrics.spendCents}), 0)`,
        totalRevenueCents: sql<number>`coalesce(sum(${campaignMetrics.revenueCents}), 0)`,
        totalImpressions: sql<number>`coalesce(sum(${campaignMetrics.impressions}), 0)`,
      })
      .from(campaignMetrics)
      .where(and(...conditions));

    // Daily breakdown
    const daily = await db
      .select({
        date: campaignMetrics.date,
        views: sql<number>`coalesce(sum(${campaignMetrics.views}), 0)`,
        engagement: sql<number>`coalesce(sum(${campaignMetrics.engagement}), 0)`,
        clicks: sql<number>`coalesce(sum(${campaignMetrics.clicks}), 0)`,
        spendCents: sql<number>`coalesce(sum(${campaignMetrics.spendCents}), 0)`,
        revenueCents: sql<number>`coalesce(sum(${campaignMetrics.revenueCents}), 0)`,
      })
      .from(campaignMetrics)
      .where(and(...conditions))
      .groupBy(campaignMetrics.date)
      .orderBy(campaignMetrics.date);

    // Per-platform breakdown
    const byPlatform = await db
      .select({
        platform: campaignMetrics.platform,
        views: sql<number>`coalesce(sum(${campaignMetrics.views}), 0)`,
        engagement: sql<number>`coalesce(sum(${campaignMetrics.engagement}), 0)`,
        clicks: sql<number>`coalesce(sum(${campaignMetrics.clicks}), 0)`,
        conversions: sql<number>`coalesce(sum(${campaignMetrics.conversions}), 0)`,
        spendCents: sql<number>`coalesce(sum(${campaignMetrics.spendCents}), 0)`,
        revenueCents: sql<number>`coalesce(sum(${campaignMetrics.revenueCents}), 0)`,
      })
      .from(campaignMetrics)
      .where(and(...conditions))
      .groupBy(campaignMetrics.platform);

    const roas =
      totals.totalSpendCents > 0
        ? Number(((totals.totalRevenueCents / totals.totalSpendCents) * 100).toFixed(0)) / 100
        : 0;

    const engagementRate =
      totals.totalImpressions > 0
        ? Number(((totals.totalEngagement / totals.totalImpressions) * 100).toFixed(2))
        : 0;

    res.json({
      totals: { ...totals, roas, engagementRate },
      daily,
      byPlatform,
    });
  });

  // Ingest metrics (used by analytics collector agent)
  router.post("/api/companies/:companyId/campaign-metrics", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const { assetId, platform, date, views, engagement, clicks, conversions, spendCents, revenueCents, followers, impressions, rawData } =
      req.body;

    const [metric] = await db
      .insert(campaignMetrics)
      .values({
        companyId,
        assetId,
        platform,
        date,
        views: views || 0,
        engagement: engagement || 0,
        clicks: clicks || 0,
        conversions: conversions || 0,
        spendCents: spendCents || 0,
        revenueCents: revenueCents || 0,
        followers: followers || 0,
        impressions: impressions || 0,
        rawData,
      })
      .returning();

    res.status(201).json(metric);
  });

  return router;
}
