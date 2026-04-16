import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";

export const clientBrands = pgTable(
  "client_brands",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id)
      .unique(),
    brandName: text("brand_name").notNull(),
    industry: text("industry").notNull().default("ecommerce"),
    websiteUrl: text("website_url"),
    brandVoice: jsonb("brand_voice").$type<{
      tone: string;
      style: string;
      guidelines: string;
      doNot: string[];
    }>(),
    targetAudience: jsonb("target_audience").$type<{
      demographics: string;
      psychographics: string;
      painPoints: string[];
    }>(),
    logoUrl: text("logo_url"),
    colorPalette: jsonb("color_palette").$type<{
      primary: string;
      secondary: string;
      accent: string;
    }>(),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyIdx: index("client_brands_company_idx").on(table.companyId),
  }),
);
