CREATE TABLE "campaign_metrics" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"asset_id" uuid,
	"platform" text NOT NULL,
	"date" date NOT NULL,
	"views" integer DEFAULT 0 NOT NULL,
	"engagement" integer DEFAULT 0 NOT NULL,
	"clicks" integer DEFAULT 0 NOT NULL,
	"conversions" integer DEFAULT 0 NOT NULL,
	"spend_cents" integer DEFAULT 0 NOT NULL,
	"revenue_cents" integer DEFAULT 0 NOT NULL,
	"followers" integer DEFAULT 0 NOT NULL,
	"impressions" integer DEFAULT 0 NOT NULL,
	"raw_data" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "client_brands" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"brand_name" text NOT NULL,
	"industry" text DEFAULT 'ecommerce' NOT NULL,
	"website_url" text,
	"brand_voice" jsonb,
	"target_audience" jsonb,
	"logo_url" text,
	"color_palette" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "client_brands_company_id_unique" UNIQUE("company_id")
);
--> statement-breakpoint
CREATE TABLE "competitor_events" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"competitor_id" uuid NOT NULL,
	"event_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"severity" text DEFAULT 'low' NOT NULL,
	"source_url" text,
	"platform" text,
	"detected_at" timestamp with time zone DEFAULT now() NOT NULL,
	"data" jsonb,
	"dismissed" text DEFAULT 'no',
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "competitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"name" text NOT NULL,
	"website_url" text,
	"social_handles" jsonb,
	"tracking_config" jsonb,
	"status" text DEFAULT 'active' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "content_calendar" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"asset_id" uuid NOT NULL,
	"platform" text NOT NULL,
	"caption" text,
	"hashtags" jsonb,
	"scheduled_at" timestamp with time zone NOT NULL,
	"published_at" timestamp with time zone,
	"status" text DEFAULT 'scheduled' NOT NULL,
	"publish_result" jsonb,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "media_assets" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"company_id" uuid NOT NULL,
	"issue_id" uuid,
	"type" text NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"status" text DEFAULT 'draft' NOT NULL,
	"file_url" text,
	"thumbnail_url" text,
	"metadata" jsonb,
	"platform_targets" jsonb,
	"content" text,
	"created_by_agent_id" uuid,
	"reviewed_by_user_id" text,
	"review_note" text,
	"reviewed_at" timestamp with time zone,
	"published_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "campaign_metrics" ADD CONSTRAINT "campaign_metrics_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "campaign_metrics" ADD CONSTRAINT "campaign_metrics_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "client_brands" ADD CONSTRAINT "client_brands_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_events" ADD CONSTRAINT "competitor_events_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitor_events" ADD CONSTRAINT "competitor_events_competitor_id_competitors_id_fk" FOREIGN KEY ("competitor_id") REFERENCES "public"."competitors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "competitors" ADD CONSTRAINT "competitors_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar" ADD CONSTRAINT "content_calendar_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "content_calendar" ADD CONSTRAINT "content_calendar_asset_id_media_assets_id_fk" FOREIGN KEY ("asset_id") REFERENCES "public"."media_assets"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_company_id_companies_id_fk" FOREIGN KEY ("company_id") REFERENCES "public"."companies"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_issue_id_issues_id_fk" FOREIGN KEY ("issue_id") REFERENCES "public"."issues"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "media_assets" ADD CONSTRAINT "media_assets_created_by_agent_id_agents_id_fk" FOREIGN KEY ("created_by_agent_id") REFERENCES "public"."agents"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "campaign_metrics_company_date_idx" ON "campaign_metrics" USING btree ("company_id","date");--> statement-breakpoint
CREATE INDEX "campaign_metrics_company_platform_idx" ON "campaign_metrics" USING btree ("company_id","platform");--> statement-breakpoint
CREATE INDEX "campaign_metrics_asset_idx" ON "campaign_metrics" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "client_brands_company_idx" ON "client_brands" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "competitor_events_company_detected_idx" ON "competitor_events" USING btree ("company_id","detected_at");--> statement-breakpoint
CREATE INDEX "competitor_events_competitor_idx" ON "competitor_events" USING btree ("competitor_id");--> statement-breakpoint
CREATE INDEX "competitor_events_company_severity_idx" ON "competitor_events" USING btree ("company_id","severity");--> statement-breakpoint
CREATE INDEX "competitors_company_idx" ON "competitors" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "competitors_company_status_idx" ON "competitors" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "content_calendar_company_scheduled_idx" ON "content_calendar" USING btree ("company_id","scheduled_at");--> statement-breakpoint
CREATE INDEX "content_calendar_company_platform_idx" ON "content_calendar" USING btree ("company_id","platform");--> statement-breakpoint
CREATE INDEX "content_calendar_company_status_idx" ON "content_calendar" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "content_calendar_asset_idx" ON "content_calendar" USING btree ("asset_id");--> statement-breakpoint
CREATE INDEX "media_assets_company_idx" ON "media_assets" USING btree ("company_id");--> statement-breakpoint
CREATE INDEX "media_assets_company_status_idx" ON "media_assets" USING btree ("company_id","status");--> statement-breakpoint
CREATE INDEX "media_assets_company_type_idx" ON "media_assets" USING btree ("company_id","type");--> statement-breakpoint
CREATE INDEX "media_assets_issue_idx" ON "media_assets" USING btree ("issue_id");