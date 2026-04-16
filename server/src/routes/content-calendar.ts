import { Router, type Request, type Response } from "express";
import type { Db } from "@paperclipai/db";
import { eq, and, desc, gte, lte } from "drizzle-orm";
import { contentCalendar, mediaAssets } from "@paperclipai/db";
import { assertCompanyAccess } from "./authz.js";

export function contentCalendarRoutes(db: Db) {
  const router = Router();

  // Get calendar entries for a date range
  router.get("/api/companies/:companyId/content-calendar", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const { from, to, platform } = req.query;

    const fromDate = from ? new Date(from as string) : new Date();
    const toDate = to ? new Date(to as string) : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);

    let results = await db
      .select({
        calendar: contentCalendar,
        asset: mediaAssets,
      })
      .from(contentCalendar)
      .leftJoin(mediaAssets, eq(contentCalendar.assetId, mediaAssets.id))
      .where(
        and(
          eq(contentCalendar.companyId, companyId),
          gte(contentCalendar.scheduledAt, fromDate),
          lte(contentCalendar.scheduledAt, toDate),
        ),
      )
      .orderBy(contentCalendar.scheduledAt);

    if (platform) {
      results = results.filter((r) => r.calendar.platform === platform);
    }

    res.json(results);
  });

  // Schedule content
  router.post("/api/companies/:companyId/content-calendar", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const { assetId, platform, caption, hashtags, scheduledAt } = req.body;

    const [entry] = await db
      .insert(contentCalendar)
      .values({
        companyId,
        assetId,
        platform,
        caption,
        hashtags,
        scheduledAt: new Date(scheduledAt),
      })
      .returning();

    res.status(201).json(entry);
  });

  // Update calendar entry (reschedule, change caption, cancel)
  router.patch(
    "/api/companies/:companyId/content-calendar/:entryId",
    async (req: Request, res: Response) => {
      const { companyId, entryId } = req.params;
      assertCompanyAccess(req, companyId);

      const { scheduledAt, caption, hashtags, status } = req.body;
      const updateData: Record<string, unknown> = { updatedAt: new Date() };

      if (scheduledAt !== undefined) updateData.scheduledAt = new Date(scheduledAt);
      if (caption !== undefined) updateData.caption = caption;
      if (hashtags !== undefined) updateData.hashtags = hashtags;
      if (status !== undefined) updateData.status = status;

      const [updated] = await db
        .update(contentCalendar)
        .set(updateData)
        .where(and(eq(contentCalendar.id, entryId), eq(contentCalendar.companyId, companyId)))
        .returning();

      if (!updated) {
        res.status(404).json({ error: "Calendar entry not found" });
        return;
      }
      res.json(updated);
    },
  );

  // Delete calendar entry
  router.delete(
    "/api/companies/:companyId/content-calendar/:entryId",
    async (req: Request, res: Response) => {
      const { companyId, entryId } = req.params;
      assertCompanyAccess(req, companyId);

      await db
        .update(contentCalendar)
        .set({ status: "cancelled", updatedAt: new Date() })
        .where(and(eq(contentCalendar.id, entryId), eq(contentCalendar.companyId, companyId)));

      res.status(204).send();
    },
  );

  return router;
}
