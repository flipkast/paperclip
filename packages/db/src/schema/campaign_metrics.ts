import { pgTable, uuid, text, integer, jsonb, timestamp, date, index } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { mediaAssets } from "./media_assets.js";

export const campaignMetrics = pgTable(
  "campaign_metrics",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    assetId: uuid("asset_id").references(() => mediaAssets.id),
    platform: text("platform").notNull(),
    date: date("date").notNull(),
    views: integer("views").notNull().default(0),
    engagement: integer("engagement").notNull().default(0),
    clicks: integer("clicks").notNull().default(0),
    conversions: integer("conversions").notNull().default(0),
    spendCents: integer("spend_cents").notNull().default(0),
    revenueCents: integer("revenue_cents").notNull().default(0),
    followers: integer("followers").notNull().default(0),
    impressions: integer("impressions").notNull().default(0),
    rawData: jsonb("raw_data").$type<Record<string, unknown>>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyDateIdx: index("campaign_metrics_company_date_idx").on(table.companyId, table.date),
    companyPlatformIdx: index("campaign_metrics_company_platform_idx").on(
      table.companyId,
      table.platform,
    ),
    assetIdx: index("campaign_metrics_asset_idx").on(table.assetId),
  }),
);
