import { pgTable, uuid, text, jsonb, timestamp, index } from "drizzle-orm/pg-core";
import { companies } from "./companies.js";
import { issues } from "./issues.js";
import { agents } from "./agents.js";

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    companyId: uuid("company_id")
      .notNull()
      .references(() => companies.id),
    issueId: uuid("issue_id").references(() => issues.id),
    type: text("type").notNull(), // video | image | copy | script | email
    title: text("title").notNull(),
    description: text("description"),
    status: text("status").notNull().default("draft"),
    // draft | pending_review | approved | rejected | published
    fileUrl: text("file_url"),
    thumbnailUrl: text("thumbnail_url"),
    metadata: jsonb("metadata").$type<{
      duration?: number;
      width?: number;
      height?: number;
      model?: string;
      generationParams?: Record<string, unknown>;
      fileSize?: number;
      format?: string;
    }>(),
    platformTargets: jsonb("platform_targets").$type<string[]>(),
    content: text("content"), // for copy/script/email type — the actual text
    createdByAgentId: uuid("created_by_agent_id").references(() => agents.id),
    reviewedByUserId: text("reviewed_by_user_id"),
    reviewNote: text("review_note"),
    reviewedAt: timestamp("reviewed_at", { withTimezone: true }),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    companyIdx: index("media_assets_company_idx").on(table.companyId),
    companyStatusIdx: index("media_assets_company_status_idx").on(table.companyId, table.status),
    companyTypeIdx: index("media_assets_company_type_idx").on(table.companyId, table.type),
    issueIdx: index("media_assets_issue_idx").on(table.issueId),
  }),
);
