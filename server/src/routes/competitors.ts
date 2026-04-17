import { Router, type Request, type Response } from "express";
import type { Db } from "@paperclipai/db";
import { eq, and, desc } from "drizzle-orm";
import { competitors, competitorEvents } from "@paperclipai/db";
import { assertCompanyAccess } from "./authz.js";

export function competitorRoutes(db: Db) {
  const router = Router();

  // List competitors
  router.get("/companies/:companyId/competitors", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const results = await db
      .select()
      .from(competitors)
      .where(eq(competitors.companyId, companyId))
      .orderBy(desc(competitors.createdAt));

    res.json(results);
  });

  // Add competitor
  router.post("/companies/:companyId/competitors", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const { name, websiteUrl, socialHandles, trackingConfig } = req.body;

    const [competitor] = await db
      .insert(competitors)
      .values({ companyId, name, websiteUrl, socialHandles, trackingConfig })
      .returning();

    res.status(201).json(competitor);
  });

  // Update competitor
  router.patch("/companies/:companyId/competitors/:competitorId", async (req: Request, res: Response) => {
    const { companyId, competitorId } = req.params;
    assertCompanyAccess(req, companyId);

    const { name, websiteUrl, socialHandles, trackingConfig, status } = req.body;

    const updateData: Record<string, unknown> = { updatedAt: new Date() };
    if (name !== undefined) updateData.name = name;
    if (websiteUrl !== undefined) updateData.websiteUrl = websiteUrl;
    if (socialHandles !== undefined) updateData.socialHandles = socialHandles;
    if (trackingConfig !== undefined) updateData.trackingConfig = trackingConfig;
    if (status !== undefined) updateData.status = status;

    const [updated] = await db
      .update(competitors)
      .set(updateData)
      .where(and(eq(competitors.id, competitorId), eq(competitors.companyId, companyId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Competitor not found" });
      return;
    }
    res.json(updated);
  });

  // Delete competitor
  router.delete("/companies/:companyId/competitors/:competitorId", async (req: Request, res: Response) => {
    const { companyId, competitorId } = req.params;
    assertCompanyAccess(req, companyId);

    await db
      .update(competitors)
      .set({ status: "archived", updatedAt: new Date() })
      .where(and(eq(competitors.id, competitorId), eq(competitors.companyId, companyId)));

    res.status(204).send();
  });

  // List competitor events (activity feed)
  router.get("/companies/:companyId/competitor-events", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const { severity, competitorId, limit } = req.query;
    const maxResults = Math.min(Number(limit) || 50, 200);

    let results = await db
      .select()
      .from(competitorEvents)
      .where(eq(competitorEvents.companyId, companyId))
      .orderBy(desc(competitorEvents.detectedAt))
      .limit(maxResults);

    if (severity) {
      results = results.filter((r) => r.severity === severity);
    }
    if (competitorId) {
      results = results.filter((r) => r.competitorId === competitorId);
    }

    res.json(results);
  });

  // Create competitor event (used by competitor analyst agent)
  router.post("/companies/:companyId/competitor-events", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const { competitorId, eventType, title, description, severity, sourceUrl, platform, data } = req.body;

    const [event] = await db
      .insert(competitorEvents)
      .values({
        companyId,
        competitorId,
        eventType,
        title,
        description,
        severity: severity || "low",
        sourceUrl,
        platform,
        data,
      })
      .returning();

    res.status(201).json(event);
  });

  return router;
}
