import type { Db } from "@paperclipai/db";
import { eq, and } from "drizzle-orm";
import { contentCalendar } from "@paperclipai/db";

/**
 * Social Publisher Service
 *
 * Publishes approved media assets to social platforms.
 * Runs on Social Media Manager agent heartbeat, checks for scheduled posts
 * that are due, and publishes them via platform APIs.
 */

export interface PublishRequest {
  calendarEntryId: string;
  companyId: string;
  platform: string;
  fileUrl: string;
  caption: string;
  hashtags?: string[];
}

export interface PublishResult {
  success: boolean;
  postId?: string;
  postUrl?: string;
  error?: string;
}

interface PlatformCredentials {
  accessToken: string;
  refreshToken?: string;
  accountId?: string;
}

export class SocialPublisherService {
  constructor(private db: Db) {}

  /**
   * Check for scheduled posts that are due and publish them.
   * Called by Social Media Manager agent on each heartbeat.
   */
  async publishDuePosts(companyId: string): Promise<{ published: number; failed: number }> {
    const now = new Date();
    const duePosts = await this.db
      .select()
      .from(contentCalendar)
      .where(
        and(
          eq(contentCalendar.companyId, companyId),
          eq(contentCalendar.status, "scheduled"),
        ),
      );

    const readyPosts = duePosts.filter(
      (p) => new Date(p.scheduledAt) <= now,
    );

    let published = 0;
    let failed = 0;

    for (const post of readyPosts) {
      // Mark as publishing
      await this.db
        .update(contentCalendar)
        .set({ status: "publishing", updatedAt: now })
        .where(eq(contentCalendar.id, post.id));

      try {
        const result = await this.publishToplatform(post.platform, {
          caption: post.caption || "",
          hashtags: (post.hashtags as string[]) || [],
          companyId,
        });

        await this.db
          .update(contentCalendar)
          .set({
            status: "published",
            publishedAt: now,
            publishResult: {
              postId: result.postId,
              postUrl: result.postUrl,
            },
            updatedAt: now,
          })
          .where(eq(contentCalendar.id, post.id));

        published++;
      } catch (err) {
        const message = err instanceof Error ? err.message : "Unknown error";
        await this.db
          .update(contentCalendar)
          .set({
            status: "failed",
            publishResult: { error: message },
            updatedAt: now,
          })
          .where(eq(contentCalendar.id, post.id));

        failed++;
      }
    }

    return { published, failed };
  }

  private async publishToplatform(
    platform: string,
    opts: { caption: string; hashtags: string[]; companyId: string },
  ): Promise<{ postId: string; postUrl: string }> {
    // Get stored credentials for this platform
    // In production, these come from OAuth flows stored in company_secrets
    const creds = await this.getCredentials(opts.companyId, platform);

    const fullCaption = opts.hashtags.length > 0
      ? `${opts.caption}\n\n${opts.hashtags.map((h) => `#${h}`).join(" ")}`
      : opts.caption;

    switch (platform) {
      case "tiktok":
        return this.publishToTikTok(creds, fullCaption);
      case "instagram":
        return this.publishToInstagram(creds, fullCaption);
      case "youtube":
        return this.publishToYouTube(creds, fullCaption);
      case "x":
        return this.publishToX(creds, fullCaption);
      case "linkedin":
        return this.publishToLinkedIn(creds, fullCaption);
      default:
        throw new Error(`Unsupported platform: ${platform}`);
    }
  }

  private async getCredentials(companyId: string, platform: string): Promise<PlatformCredentials> {
    // TODO: Read from company_secrets table via Paperclip's secret system
    // For now, fall back to env vars
    const tokenKey = `${platform.toUpperCase()}_ACCESS_TOKEN`;
    const token = process.env[tokenKey];
    if (!token) {
      throw new Error(
        `No credentials for ${platform}. Connect your ${platform} account in Settings → Integrations.`,
      );
    }
    return { accessToken: token };
  }

  // --- Platform implementations ---
  // Each returns { postId, postUrl } on success or throws on failure.
  // These are stubs with the correct API shapes — plug in real tokens to activate.

  private async publishToTikTok(
    creds: PlatformCredentials,
    caption: string,
  ): Promise<{ postId: string; postUrl: string }> {
    // TikTok Content Posting API
    // https://developers.tiktok.com/doc/content-posting-api-get-started
    const response = await fetch("https://open.tiktokapis.com/v2/post/publish/content/init/", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        post_info: { title: caption, privacy_level: "PUBLIC_TO_EVERYONE" },
        source_info: { source: "PULL_FROM_URL" },
      }),
    });

    if (!response.ok) throw new Error(`TikTok API error: ${response.status}`);
    const data = (await response.json()) as { data: { publish_id: string } };
    return {
      postId: data.data.publish_id,
      postUrl: `https://www.tiktok.com/@user/video/${data.data.publish_id}`,
    };
  }

  private async publishToInstagram(
    creds: PlatformCredentials,
    caption: string,
  ): Promise<{ postId: string; postUrl: string }> {
    // Instagram Graph API — Reels publishing
    // https://developers.facebook.com/docs/instagram-api/guides/reels-publishing
    const accountId = creds.accountId || process.env.INSTAGRAM_ACCOUNT_ID;
    const response = await fetch(
      `https://graph.facebook.com/v19.0/${accountId}/media`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          caption,
          media_type: "REELS",
          access_token: creds.accessToken,
        }),
      },
    );

    if (!response.ok) throw new Error(`Instagram API error: ${response.status}`);
    const data = (await response.json()) as { id: string };
    return {
      postId: data.id,
      postUrl: `https://www.instagram.com/reel/${data.id}/`,
    };
  }

  private async publishToYouTube(
    creds: PlatformCredentials,
    caption: string,
  ): Promise<{ postId: string; postUrl: string }> {
    // YouTube Data API v3 — Video upload
    // This is a simplified version; real implementation needs multipart upload
    const response = await fetch(
      "https://www.googleapis.com/youtube/v3/videos?part=snippet,status",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${creds.accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          snippet: { title: caption.slice(0, 100), description: caption },
          status: { privacyStatus: "public" },
        }),
      },
    );

    if (!response.ok) throw new Error(`YouTube API error: ${response.status}`);
    const data = (await response.json()) as { id: string };
    return {
      postId: data.id,
      postUrl: `https://youtube.com/watch?v=${data.id}`,
    };
  }

  private async publishToX(
    creds: PlatformCredentials,
    caption: string,
  ): Promise<{ postId: string; postUrl: string }> {
    // X (Twitter) API v2
    const response = await fetch("https://api.x.com/2/tweets", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text: caption.slice(0, 280) }),
    });

    if (!response.ok) throw new Error(`X API error: ${response.status}`);
    const data = (await response.json()) as { data: { id: string } };
    return {
      postId: data.data.id,
      postUrl: `https://x.com/i/status/${data.data.id}`,
    };
  }

  private async publishToLinkedIn(
    creds: PlatformCredentials,
    caption: string,
  ): Promise<{ postId: string; postUrl: string }> {
    // LinkedIn API — UGC Posts
    const response = await fetch("https://api.linkedin.com/v2/ugcPosts", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${creds.accessToken}`,
        "Content-Type": "application/json",
        "X-Restli-Protocol-Version": "2.0.0",
      },
      body: JSON.stringify({
        author: `urn:li:person:${creds.accountId}`,
        lifecycleState: "PUBLISHED",
        specificContent: {
          "com.linkedin.ugc.ShareContent": {
            shareCommentary: { text: caption },
            shareMediaCategory: "NONE",
          },
        },
        visibility: { "com.linkedin.ugc.MemberNetworkVisibility": "PUBLIC" },
      }),
    });

    if (!response.ok) throw new Error(`LinkedIn API error: ${response.status}`);
    const data = (await response.json()) as { id: string };
    return {
      postId: data.id,
      postUrl: `https://www.linkedin.com/feed/update/${data.id}/`,
    };
  }
}
