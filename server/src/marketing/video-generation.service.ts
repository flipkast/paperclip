import type { Db } from "@paperclipai/db";
import { mediaAssets } from "@paperclipai/db";

/**
 * Video Generation Service
 *
 * Orchestrates AI video generation across multiple providers.
 * Currently supports Runway ML with stubs for Kling and Pika.
 *
 * Usage: Called by the Content Creator agent when a video task is assigned.
 * The generated video is stored as a media_asset in pending_review status.
 */

export interface VideoGenerationRequest {
  companyId: string;
  title: string;
  prompt: string;
  style?: string;
  duration?: number; // seconds
  aspectRatio?: "16:9" | "9:16" | "1:1";
  provider?: "runway" | "kling" | "pika";
  platformTarget?: string[];
  issueId?: string;
  agentId?: string;
}

export interface VideoGenerationResult {
  success: boolean;
  assetId?: string;
  fileUrl?: string;
  thumbnailUrl?: string;
  error?: string;
  costCents?: number;
}

export class VideoGenerationService {
  private runwayApiKey: string | null;
  private klingApiKey: string | null;

  constructor(private db: Db) {
    this.runwayApiKey = process.env.RUNWAY_API_KEY || null;
    this.klingApiKey = process.env.KLING_API_KEY || null;
  }

  async generate(req: VideoGenerationRequest): Promise<VideoGenerationResult> {
    const provider = req.provider || "runway";

    try {
      let result: { fileUrl: string; thumbnailUrl: string; costCents: number };

      switch (provider) {
        case "runway":
          result = await this.generateWithRunway(req);
          break;
        case "kling":
          result = await this.generateWithKling(req);
          break;
        case "pika":
          result = await this.generateWithPika(req);
          break;
        default:
          return { success: false, error: `Unknown provider: ${provider}` };
      }

      // Store as media asset
      const [asset] = await this.db
        .insert(mediaAssets)
        .values({
          companyId: req.companyId,
          issueId: req.issueId,
          type: "video",
          title: req.title,
          description: req.prompt,
          status: "pending_review",
          fileUrl: result.fileUrl,
          thumbnailUrl: result.thumbnailUrl,
          metadata: {
            duration: req.duration || 10,
            model: provider,
            generationParams: {
              prompt: req.prompt,
              style: req.style,
              aspectRatio: req.aspectRatio,
            },
          },
          platformTargets: req.platformTarget || [],
          createdByAgentId: req.agentId,
        })
        .returning();

      return {
        success: true,
        assetId: asset.id,
        fileUrl: result.fileUrl,
        thumbnailUrl: result.thumbnailUrl,
        costCents: result.costCents,
      };
    } catch (err) {
      const message = err instanceof Error ? err.message : "Unknown error";
      return { success: false, error: message };
    }
  }

  private async generateWithRunway(
    req: VideoGenerationRequest,
  ): Promise<{ fileUrl: string; thumbnailUrl: string; costCents: number }> {
    if (!this.runwayApiKey) {
      throw new Error("RUNWAY_API_KEY not configured");
    }

    // Runway Gen-3 Alpha Turbo API
    // https://docs.runwayml.com/
    const response = await fetch("https://api.dev.runwayml.com/v1/image_to_video", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.runwayApiKey}`,
        "Content-Type": "application/json",
        "X-Runway-Version": "2024-11-06",
      },
      body: JSON.stringify({
        model: "gen3a_turbo",
        promptText: req.prompt,
        duration: req.duration || 10,
        ratio: req.aspectRatio === "9:16" ? "768:1344" : req.aspectRatio === "1:1" ? "1024:1024" : "1344:768",
      }),
    });

    if (!response.ok) {
      const errBody = await response.text();
      throw new Error(`Runway API error ${response.status}: ${errBody}`);
    }

    const data = (await response.json()) as { id: string };
    const taskId = data.id;

    // Poll for completion
    const videoUrl = await this.pollRunwayTask(taskId);

    return {
      fileUrl: videoUrl,
      thumbnailUrl: videoUrl, // Runway doesn't provide separate thumbnails
      costCents: req.duration === 5 ? 25 : 50, // approximate Runway pricing
    };
  }

  private async pollRunwayTask(taskId: string, maxAttempts = 60): Promise<string> {
    for (let i = 0; i < maxAttempts; i++) {
      await new Promise((resolve) => setTimeout(resolve, 5000)); // 5s intervals

      const response = await fetch(`https://api.dev.runwayml.com/v1/tasks/${taskId}`, {
        headers: {
          Authorization: `Bearer ${this.runwayApiKey}`,
          "X-Runway-Version": "2024-11-06",
        },
      });

      if (!response.ok) continue;

      const data = (await response.json()) as { status: string; output?: string[] };

      if (data.status === "SUCCEEDED" && data.output?.[0]) {
        return data.output[0];
      }
      if (data.status === "FAILED") {
        throw new Error("Runway video generation failed");
      }
    }
    throw new Error("Runway video generation timed out");
  }

  private async generateWithKling(
    req: VideoGenerationRequest,
  ): Promise<{ fileUrl: string; thumbnailUrl: string; costCents: number }> {
    if (!this.klingApiKey) {
      throw new Error("KLING_API_KEY not configured");
    }

    // Kling AI API — stub for future implementation
    // Replace with actual Kling API calls when ready
    throw new Error("Kling integration not yet implemented. Set RUNWAY_API_KEY to use Runway instead.");
  }

  private async generateWithPika(
    _req: VideoGenerationRequest,
  ): Promise<{ fileUrl: string; thumbnailUrl: string; costCents: number }> {
    // Pika API — stub for future implementation
    throw new Error("Pika integration not yet implemented. Set RUNWAY_API_KEY to use Runway instead.");
  }
}
