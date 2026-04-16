import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { competitors } from "./competitors.js";

export const competitorEvents = pgTable(
  "competitor_events",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    competitorId: uuid("competitor_id")
      .notNull()
      .references(() => competitors.id),
    eventType: text("event_type").notNull(),
    // new_video | new_ad | price_change | new_product | new_campaign |
    // social_post | website_change | new_content
    title: text("title").notNull(),
    description: text("description"),
    severity: text("severity").notNull().default("low"),
    // low | medium | high | critical
    sourceUrl: text("source_url"),
    platform: text("platform"), // tiktok | instagram | youtube | website | meta_ads | google_ads
    detectedAt: timestamp("detected_at", { withTimezone: true }).notNull().defaultNow(),
    data: jsonb("data").$type<Record<string, unknown>>(),
    dismissed: text("dismissed").default("no"), // yes | no
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyDetectedIdx: index("competitor_events_company_detected_idx").on(
      table.companyId,
      table.detectedAt,
    ),
    competitorIdx: index("competitor_events_competitor_idx").on(table.competitorId),
    companySeverityIdx: index("competitor_events_company_severity_idx").on(
      table.companyId,
      table.severity,
    ),
  }),
);
