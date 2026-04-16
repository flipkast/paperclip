import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";

export const competitors = pgTable(
  "competitors",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    name: text("name").notNull(),
    websiteUrl: text("website_url"),
    socialHandles: jsonb("social_handles").$type<
      Record<string, string>
    >(),
    trackingConfig: jsonb("tracking_config").$type<{
      platforms: string[];
      frequency: string;
      keywords: string[];
    }>(),
    status: text("status").notNull().default("active"),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyIdx: index("competitors_company_idx").on(table.companyId),
    companyStatusIdx: index("competitors_company_status_idx").on(table.companyId, table.status),
  }),
);
