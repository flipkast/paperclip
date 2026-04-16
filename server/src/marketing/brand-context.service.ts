import type { Db } from "@paperclipai/db";
import { eq } from "drizzle-orm";
import { clientBrands, competitors } from "@paperclipai/db";

/**
 * Brand Context Service
 *
 * Injects client brand information into agent prompts at runtime.
 * Every marketing agent automatically receives brand voice, target audience,
 * competitor list, and guidelines — no manual prompt editing needed.
 */

export interface BrandContext {
  brandName: string;
  industry: string;
  websiteUrl: string | null;
  brandVoice: {
    tone: string;
    style: string;
    guidelines: string;
    doNot: string[];
  } | null;
  targetAudience: {
    demographics: string;
    psychographics: string;
    painPoints: string[];
  } | null;
  competitorNames: string[];
}

export class BrandContextService {
  constructor(private db: Db) {}

  async getBrandContext(companyId: string): Promise<BrandContext | null> {
    const [brand] = await this.db
      .select()
      .from(clientBrands)
      .where(eq(clientBrands.companyId, companyId));

    if (!brand) return null;

    const activeCompetitors = await this.db
      .select({ name: competitors.name })
      .from(competitors)
      .where(eq(competitors.companyId, companyId));

    return {
      brandName: brand.brandName,
      industry: brand.industry,
      websiteUrl: brand.websiteUrl,
      brandVoice: brand.brandVoice as BrandContext["brandVoice"],
      targetAudience: brand.targetAudience as BrandContext["targetAudience"],
      competitorNames: activeCompetitors.map((c) => c.name),
    };
  }

  /**
   * Generates a prompt prefix that gets prepended to every marketing agent's prompt.
   * This ensures all agents share consistent brand context.
   */
  async buildPromptPrefix(companyId: string): Promise<string> {
    const ctx = await this.getBrandContext(companyId);
    if (!ctx) return "";

    const sections: string[] = [];

    sections.push(`## Brand: ${ctx.brandName}`);
    sections.push(`Industry: ${ctx.industry}`);
    if (ctx.websiteUrl) sections.push(`Website: ${ctx.websiteUrl}`);

    if (ctx.brandVoice) {
      sections.push(`\n## Brand Voice`);
      sections.push(`Tone: ${ctx.brandVoice.tone}`);
      sections.push(`Style: ${ctx.brandVoice.style}`);
      sections.push(`Guidelines: ${ctx.brandVoice.guidelines}`);
      if (ctx.brandVoice.doNot.length > 0) {
        sections.push(`Never: ${ctx.brandVoice.doNot.join(", ")}`);
      }
    }

    if (ctx.targetAudience) {
      sections.push(`\n## Target Audience`);
      sections.push(`Demographics: ${ctx.targetAudience.demographics}`);
      sections.push(`Psychographics: ${ctx.targetAudience.psychographics}`);
      if (ctx.targetAudience.painPoints.length > 0) {
        sections.push(`Pain points: ${ctx.targetAudience.painPoints.join(", ")}`);
      }
    }

    if (ctx.competitorNames.length > 0) {
      sections.push(`\n## Competitors`);
      sections.push(`Tracked competitors: ${ctx.competitorNames.join(", ")}`);
    }

    return sections.join("\n");
  }
}
