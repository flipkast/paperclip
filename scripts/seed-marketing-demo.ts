/**
 * Seed script for marketing platform demo data.
 * 
 * Run with: npx tsx scripts/seed-marketing-demo.ts
 * 
 * Creates realistic sample data so the dashboard looks populated:
 * - Brand profile
 * - 5 competitors with events
 * - 12 media assets (videos, copy, images) in various states
 * - Content calendar entries
 * - Campaign metrics for the last 30 days
 */

const API_BASE = process.env.API_URL || "http://localhost:3100/api";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok && res.status !== 404) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

async function main() {
  console.log("🌱 Seeding marketing demo data...\n");

  // Step 1: Get or create company
  const companies = await api("/companies");
  let companyId: string;

  if (companies.length > 0) {
    companyId = companies[0].id;
    console.log(`✓ Using existing company: ${companies[0].name} (${companyId})`);
  } else {
    const company = await api("/companies", "POST", {
      name: "Demo E-Commerce Brand",
      description: "AI-powered marketing platform demo",
    });
    companyId = company.id;
    console.log(`✓ Created company: ${company.name} (${companyId})`);
  }

  // Step 2: Create brand profile
  console.log("\n📋 Setting up brand profile...");
  await api(`/companies/${companyId}/brand`, "PUT", {
    brandName: "NovaSkin",
    industry: "Beauty & Skincare",
    websiteUrl: "https://novaskin.demo",
    brandVoice: {
      tone: "Confident, clean, approachable",
      style: "Minimalist with a premium feel. Short punchy sentences.",
      guidelines: "Focus on ingredient science and visible results. Always back claims with data.",
      doNot: ["Use fear-based messaging", "Compare negatively to competitors", "Make unsubstantiated claims"],
    },
    targetAudience: {
      demographics: "Women 25-40, urban, $60K-$120K income",
      psychographics: "Health-conscious, ingredient-aware, values transparency and sustainability",
      painPoints: ["Overwhelmed by skincare options", "Skeptical of marketing claims", "Want visible results fast"],
    },
    colorPalette: { primary: "#1a1a2e", secondary: "#e2d1c3", accent: "#c4956a" },
  });
  console.log("✓ Brand profile created: NovaSkin");

  // Step 3: Add competitors
  console.log("\n🔍 Adding competitors...");
  const competitorData = [
    { name: "GlowLab", websiteUrl: "https://glowlab.com", socialHandles: { tiktok: "@glowlab", instagram: "@glowlab.skin" } },
    { name: "DermaCo", websiteUrl: "https://dermaco.com", socialHandles: { tiktok: "@dermaco", instagram: "@dermaco.official" } },
    { name: "PureRoot", websiteUrl: "https://pureroot.co", socialHandles: { tiktok: "@pureroot", instagram: "@pureroot" } },
    { name: "VelvetSkin", websiteUrl: "https://velvetskin.com", socialHandles: { tiktok: "@velvetskin", instagram: "@velvetskin" } },
    { name: "AuraGlow", websiteUrl: "https://auraglow.co", socialHandles: { tiktok: "@auraglow", instagram: "@auraglowbeauty" } },
  ];

  const competitors: { id: string; name: string }[] = [];
  for (const c of competitorData) {
    const created = await api(`/companies/${companyId}/competitors`, "POST", c);
    competitors.push({ id: created.id, name: created.name });
    console.log(`  ✓ ${c.name}`);
  }

  // Step 4: Create competitor events
  console.log("\n⚡ Adding competitor events...");
  const events = [
    { competitorId: competitors[0].id, eventType: "new_video", title: "GlowLab launched viral TikTok campaign", description: "New 'Glass Skin Challenge' campaign with 2.3M views in 48 hours. Features UGC-style content with before/after transitions.", severity: "critical", platform: "tiktok" },
    { competitorId: competitors[1].id, eventType: "price_change", title: "DermaCo dropped serum price by 30%", description: "Their hero Vitamin C serum went from $45 to $31.50. Likely clearance for a reformulated version.", severity: "high", platform: "website" },
    { competitorId: competitors[2].id, eventType: "new_product", title: "PureRoot launched retinol line", description: "Three new retinol products announced. Targeting the 30+ demographic with 'gentle but effective' positioning.", severity: "high", platform: "instagram" },
    { competitorId: competitors[0].id, eventType: "new_ad", title: "GlowLab running Meta Ads with influencer content", description: "Spotted 8 new ad creatives in Meta Ad Library. All featuring micro-influencers (10K-50K followers). Estimated daily spend: $2,000-$5,000.", severity: "medium", platform: "meta_ads" },
    { competitorId: competitors[3].id, eventType: "social_post", title: "VelvetSkin hit 500K Instagram followers", description: "Growth rate accelerating — gained 80K in the last 30 days. Heavy use of Reels and carousel posts.", severity: "medium", platform: "instagram" },
    { competitorId: competitors[4].id, eventType: "new_campaign", title: "AuraGlow launched summer sale", description: "25% off sitewide with code SUMMER25. Promoting heavily through email and TikTok.", severity: "low", platform: "website" },
    { competitorId: competitors[1].id, eventType: "new_video", title: "DermaCo posted dermatologist collab series", description: "3-part YouTube series with Dr. Sarah Kim. Episode 1 has 340K views. Educational content strategy shift.", severity: "medium", platform: "youtube" },
    { competitorId: competitors[2].id, eventType: "website_change", title: "PureRoot redesigned their homepage", description: "New hero section focusing on sustainability messaging. Added 'Carbon Neutral' badge and ingredient sourcing map.", severity: "low", platform: "website" },
  ];

  for (const e of events) {
    await api(`/companies/${companyId}/competitor-events`, "POST", {
      ...e,
      companyId,
      detectedAt: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000).toISOString(),
    });
  }
  console.log(`✓ Added ${events.length} competitor events`);

  // Step 5: Create media assets
  console.log("\n🎬 Creating media assets...");
  const assets = [
    { type: "video", title: "Summer Glow Serum — TikTok Product Demo", status: "pending_review", description: "15-second product demo showing application technique and glow result. Trending audio overlay.", platformTargets: ["tiktok", "instagram"] },
    { type: "video", title: "Before & After — 30 Day Retinol Results", status: "pending_review", description: "Split-screen transformation video. Real customer testimonial with voiceover.", platformTargets: ["tiktok", "youtube"] },
    { type: "video", title: "Ingredient Spotlight: Hyaluronic Acid", status: "pending_review", description: "Educational short explaining how HA works at the molecular level. Clean motion graphics.", platformTargets: ["tiktok", "instagram", "youtube"] },
    { type: "copy", title: "Email: Summer Sale Announcement", status: "approved", content: "Subject: Your skin called. It wants 25% off.\n\nHey {first_name},\n\nSummer's here and your skincare routine deserves an upgrade.\n\nFor the next 72 hours, everything on NovaSkin is 25% off. No code needed — the discount applies at checkout.\n\nOur bestsellers are going fast:\n→ Glow Serum (4.9★, 2,340 reviews)\n→ Daily SPF 50 (sold out twice last month)\n→ Retinol Night Cream (dermatologist-approved)\n\nShop now before your favorites sell out.\n\n— The NovaSkin Team", platformTargets: ["email"] },
    { type: "copy", title: "Instagram Caption: Product Launch", status: "approved", content: "The wait is over. ✨\n\nIntroducing our NEW Vitamin C Brightening Serum — formulated with 15% L-ascorbic acid + ferulic acid for maximum absorption.\n\nThe science: Vitamin C neutralizes free radicals, boosts collagen, and fades dark spots. But most serums oxidize before they reach your skin. Ours doesn't.\n\nAvailable now. Link in bio.\n\n#NovaSkin #VitaminCSerum #Skincare #CleanBeauty #GlowUp", platformTargets: ["instagram"] },
    { type: "video", title: "Customer Testimonial: Maria's Story", status: "published", description: "60-second testimonial from real customer. Before photos at week 0, progress at week 4, results at week 12.", platformTargets: ["youtube", "instagram"] },
    { type: "image", title: "Product Flat Lay — Full Collection", status: "approved", description: "Overhead shot of full NovaSkin line on marble background. For social media and website hero.", platformTargets: ["instagram", "website"] },
    { type: "copy", title: "Google Ads — Search Campaign Copy", status: "approved", content: "Ad 1: NovaSkin Vitamin C Serum | Dermatologist-Approved | 15% Pure L-Ascorbic Acid. Visible results in 14 days. Free shipping over $50.\n\nAd 2: Clean Skincare That Works | NovaSkin | No parabens, no sulfates, no compromises. Science-backed formulas for real results. Shop now.\n\nAd 3: Best Retinol Cream 2026 | NovaSkin Night Cream | Gentle enough for sensitive skin. Powerful enough to see results. 4.8★ from 1,800+ reviews.", platformTargets: ["google_ads"] },
    { type: "script", title: "YouTube: 'What's In Your Skincare?' Series Ep.1", status: "draft", content: "[HOOK - 0:00]\nDid you know 73% of skincare products contain ingredients that do literally nothing?\n\n[INTRO - 0:05]\nHey, I'm [host name] and welcome to 'What's In Your Skincare' — where we break down exactly what's in popular products, what actually works, and what's just marketing.\n\n[SEGMENT 1 - 0:30]\nToday we're looking at Vitamin C serums...", platformTargets: ["youtube"] },
    { type: "video", title: "TikTok Trend: GRWM with NovaSkin Routine", status: "rejected", description: "Get Ready With Me format showing full morning skincare routine. Rejected: audio trend expired, needs refresh with current trending sound.", platformTargets: ["tiktok"] },
    { type: "copy", title: "LinkedIn: Founder Story Post", status: "pending_review", content: "3 years ago I was mixing serums in my kitchen.\n\nToday NovaSkin serves 50,000+ customers across 12 countries.\n\nHere's what I learned building a skincare brand from zero:\n\n1. Your first formula will be wrong. Launch anyway.\n2. Customer feedback > expert opinions.\n3. The market doesn't need another 'me too' product. Find your angle.\n4. Paid ads get you customers. Product quality keeps them.\n5. Transparency isn't a marketing strategy. It's the only strategy.\n\nWhat's the biggest lesson from your entrepreneurial journey?", platformTargets: ["linkedin"] },
    { type: "email", title: "Email: Cart Abandonment Sequence #1", status: "approved", content: "Subject: You left something behind...\n\nHey {first_name},\n\nWe noticed you were checking out {product_name} but didn't complete your order.\n\nNo pressure — but here's what 2,340 customers say about it:\n\n★★★★★ 'Best serum I've ever used. My skin has never looked this good.' — Jessica M.\n\nYour cart is saved for 48 hours. Complete your order and get free shipping.\n\n[Complete My Order →]", platformTargets: ["email"] },
  ];

  const createdAssets: { id: string; title: string; platformTargets: string[] }[] = [];
  for (const a of assets) {
    const created = await api(`/companies/${companyId}/media-assets`, "POST", { ...a, companyId });
    createdAssets.push({ id: created.id, title: created.title, platformTargets: a.platformTargets });
    console.log(`  ✓ [${a.status}] ${a.title}`);
  }

  // Step 6: Create calendar entries for approved/published assets
  console.log("\n📅 Scheduling content...");
  const approvedAssets = createdAssets.filter((_, i) => 
    ["approved", "published"].includes(assets[i].status)
  );

  const now = Date.now();
  let scheduledCount = 0;
  for (let i = 0; i < approvedAssets.length; i++) {
    const asset = approvedAssets[i];
    const platforms = asset.platformTargets;
    for (const platform of platforms) {
      if (["website", "google_ads"].includes(platform)) continue;
      const scheduledAt = new Date(now + (i + 1) * 24 * 60 * 60 * 1000 + Math.random() * 8 * 60 * 60 * 1000);
      await api(`/companies/${companyId}/content-calendar`, "POST", {
        companyId,
        assetId: asset.id,
        platform,
        caption: `${asset.title} — scheduled for ${platform}`,
        hashtags: ["novaskin", "skincare", "cleanbeauty"],
        scheduledAt: scheduledAt.toISOString(),
      });
      scheduledCount++;
    }
  }
  console.log(`✓ Scheduled ${scheduledCount} posts across platforms`);

  // Step 7: Add campaign metrics for last 30 days
  console.log("\n📊 Adding campaign metrics...");
  const platforms = ["tiktok", "instagram", "youtube", "google_ads", "meta_ads"];
  let metricsCount = 0;

  for (let dayOffset = 30; dayOffset >= 0; dayOffset--) {
    const date = new Date(now - dayOffset * 24 * 60 * 60 * 1000);
    const dateStr = date.toISOString().split("T")[0];

    for (const platform of platforms) {
      const baseViews = platform === "tiktok" ? 5000 : platform === "instagram" ? 3000 : platform === "youtube" ? 1500 : 800;
      const growth = 1 + (30 - dayOffset) * 0.02; // 2% daily growth trend
      const noise = 0.7 + Math.random() * 0.6;

      const views = Math.round(baseViews * growth * noise);
      const engagementRate = platform === "tiktok" ? 0.06 : platform === "instagram" ? 0.04 : 0.025;
      const engagement = Math.round(views * engagementRate * (0.8 + Math.random() * 0.4));
      const clickRate = 0.015 + Math.random() * 0.01;
      const clicks = Math.round(views * clickRate);
      const conversionRate = 0.02 + Math.random() * 0.02;
      const conversions = Math.round(clicks * conversionRate);

      const isAd = ["google_ads", "meta_ads"].includes(platform);
      const spendCents = isAd ? Math.round((150 + Math.random() * 200) * 100) : 0;
      const revenueCents = conversions * Math.round((4500 + Math.random() * 3000));

      await api(`/companies/${companyId}/campaign-metrics`, "POST", {
        companyId,
        platform,
        date: dateStr,
        views,
        engagement,
        clicks,
        conversions,
        spendCents,
        revenueCents,
        impressions: Math.round(views * (1.3 + Math.random() * 0.5)),
        followers: Math.round(20 + Math.random() * 40),
      });
      metricsCount++;
    }
  }
  console.log(`✓ Added ${metricsCount} daily metric records (${platforms.length} platforms × 31 days)`);

  console.log("\n✅ Demo data seeding complete!");
  console.log(`\n   Company: ${companyId}`);
  console.log(`   Brand: NovaSkin (Beauty & Skincare)`);
  console.log(`   Competitors: ${competitors.map(c => c.name).join(", ")}`);
  console.log(`   Assets: ${assets.length} (${assets.filter(a => a.status === "pending_review").length} pending review)`);
  console.log(`   Calendar: ${scheduledCount} scheduled posts`);
  console.log(`   Metrics: 31 days × 5 platforms`);
  console.log(`\n   Open http://localhost:3100 to see your dashboard!`);
}

main().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
