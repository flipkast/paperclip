import { Router, type Request, type Response } from "express";
import type { Db } from "@paperclipai/db";
import { eq, and, desc } from "drizzle-orm";
import { mediaAssets } from "@paperclipai/db";
import { assertCompanyAccess } from "./authz.js";

export function mediaAssetRoutes(db: Db) {
  const router = Router();

  // List media assets for a company
  router.get("/api/companies/:companyId/media-assets", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const { type, status } = req.query;
    let query = db
      .select()
      .from(mediaAssets)
      .where(eq(mediaAssets.companyId, companyId))
      .orderBy(desc(mediaAssets.createdAt));

    const results = await query;

    const filtered = results.filter((r) => {
      if (type && r.type !== type) return false;
      if (status && r.status !== status) return false;
      return true;
    });

    res.json(filtered);
  });

  // Get single media asset
  router.get("/api/companies/:companyId/media-assets/:assetId", async (req: Request, res: Response) => {
    const { companyId, assetId } = req.params;
    assertCompanyAccess(req, companyId);

    const [asset] = await db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.id, assetId), eq(mediaAssets.companyId, companyId)));

    if (!asset) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    res.json(asset);
  });

  // Create media asset
  router.post("/api/companies/:companyId/media-assets", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const { type, title, description, fileUrl, thumbnailUrl, metadata, platformTargets, content, createdByAgentId } =
      req.body;

    const [asset] = await db
      .insert(mediaAssets)
      .values({
        companyId,
        type,
        title,
        description,
        fileUrl,
        thumbnailUrl,
        metadata,
        platformTargets,
        content,
        createdByAgentId,
        status: "draft",
      })
      .returning();

    res.status(201).json(asset);
  });

  // Update asset status (approve / reject / publish)
  router.patch("/api/companies/:companyId/media-assets/:assetId", async (req: Request, res: Response) => {
    const { companyId, assetId } = req.params;
    assertCompanyAccess(req, companyId);

    const { status, reviewNote } = req.body;
    const updateData: Record<string, unknown> = {
      status,
      updatedAt: new Date(),
    };

    if (status === "approved" || status === "rejected") {
      updateData.reviewedAt = new Date();
      if (reviewNote) updateData.reviewNote = reviewNote;
    }
    if (status === "published") {
      updateData.publishedAt = new Date();
    }

    const [updated] = await db
      .update(mediaAssets)
      .set(updateData)
      .where(and(eq(mediaAssets.id, assetId), eq(mediaAssets.companyId, companyId)))
      .returning();

    if (!updated) {
      res.status(404).json({ error: "Asset not found" });
      return;
    }
    res.json(updated);
  });

  // Get assets pending review
  router.get("/api/companies/:companyId/media-assets-pending", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const results = await db
      .select()
      .from(mediaAssets)
      .where(and(eq(mediaAssets.companyId, companyId), eq(mediaAssets.status, "pending_review")))
      .orderBy(desc(mediaAssets.createdAt));

    res.json(results);
  });

  return router;
}
