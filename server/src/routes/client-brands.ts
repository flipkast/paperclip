import { Router, type Request, type Response } from "express";
import type { Db } from "@paperclipai/db";
import { eq } from "drizzle-orm";
import { clientBrands } from "@paperclipai/db";
import { assertCompanyAccess } from "./authz.js";

export function clientBrandRoutes(db: Db) {
  const router = Router();

  // Get brand for a company
  router.get("/api/companies/:companyId/brand", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const [brand] = await db
      .select()
      .from(clientBrands)
      .where(eq(clientBrands.companyId, companyId));

    if (!brand) {
      res.status(404).json({ error: "Brand not configured" });
      return;
    }
    res.json(brand);
  });

  // Create or update brand
  router.put("/api/companies/:companyId/brand", async (req: Request, res: Response) => {
    const { companyId } = req.params;
    assertCompanyAccess(req, companyId);

    const { brandName, industry, websiteUrl, brandVoice, targetAudience, logoUrl, colorPalette } =
      req.body;

    const [existing] = await db
      .select()
      .from(clientBrands)
      .where(eq(clientBrands.companyId, companyId));

    if (existing) {
      const [updated] = await db
        .update(clientBrands)
        .set({
          brandName,
          industry,
          websiteUrl,
          brandVoice,
          targetAudience,
          logoUrl,
          colorPalette,
          updatedAt: new Date(),
        })
        .where(eq(clientBrands.companyId, companyId))
        .returning();
      res.json(updated);
    } else {
      const [created] = await db
        .insert(clientBrands)
        .values({
          companyId,
          brandName,
          industry,
          websiteUrl,
          brandVoice,
          targetAudience,
          logoUrl,
          colorPalette,
        })
        .returning();
      res.status(201).json(created);
    }
  });

  return router;
}
