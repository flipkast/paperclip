import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { mediaAssets } from "./media_assets.js";

export const contentCalendar = pgTable(
  "content_calendar",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    assetId: uuid("asset_id")
      .notNull()
      .references(() => mediaAssets.id),
    platform: text("platform").notNull(), // tiktok | instagram | youtube | x | linkedin | email
    caption: text("caption"),
    hashtags: jsonb("hashtags").$type<string[]>(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true }).notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    status: text("status").notNull().default("scheduled"),
    // scheduled | publishing | published | failed | cancelled
    publishResult: jsonb("publish_result").$type<{
      postId?: string;
      postUrl?: string;
      error?: string;
    }>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyScheduledIdx: index("content_calendar_company_scheduled_idx").on(
      table.companyId,
      table.scheduledAt,
    ),
    companyPlatformIdx: index("content_calendar_company_platform_idx").on(
      table.companyId,
      table.platform,
    ),
    companyStatusIdx: index("content_calendar_company_status_idx").on(
      table.companyId,
      table.status,
    ),
    assetIdx: index("content_calendar_asset_idx").on(table.assetId),
  }),
);
