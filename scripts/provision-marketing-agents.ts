/**
 * Provision Marketing Agents
 * 
 * Creates the 7 AI marketing agents in Paperclip's database.
 * Run with: npx tsx@latest scripts/provision-marketing-agents.ts
 * 
 * Prerequisites:
 * - pnpm dev must be running in another terminal
 * - A company must exist (run seed-marketing-demo.ts first)
 */

const API_BASE = process.env.API_URL || "http://localhost:3100/api";

async function api(path: string, method = "GET", body?: unknown) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`${method} ${path} failed (${res.status}): ${text}`);
  }
  if (res.status === 204) return null;
  return res.json();
}

interface AgentDef {
  name: string;
  role: string;
  title: string;
  icon: string;
  capabilities: string;
  adapterType: string;
  adapterConfig: Record<string, unknown>;
  runtimeConfig: Record<string, unknown>;
  reportsTo?: string;
}

const AGENTS: AgentDef[] = [
  {
    name: "CMO",
    role: "cmo",
    title: "Chief Marketing Officer",
    icon: "crown",
    capabilities: "Develops and owns marketing strategy across all channels. Decomposes marketing briefs into projects and tasks. Reviews work products from all teams. Monitors campaign performance and adjusts strategy. Manages budget allocation. Reports to board on KPIs.",
    adapterType: "claude_local",
    adapterConfig: {
      promptTemplate: "You are the Chief Marketing Officer of an AI marketing agency. Your job is to translate business objectives into marketing strategy, manage your team of specialists, and ensure all campaigns deliver measurable results. You think in terms of funnels, audience segments, channel mix, and ROI. You delegate execution but own the strategy. Always ground decisions in data when available.",
    },
    runtimeConfig: {
      heartbeat: { enabled: true, intervalSec: 3600, wakeOnDemand: true },
    },
  },
  {
    name: "Content Creator",
    role: "general",
    title: "Senior Content Creator",
    icon: "sparkles",
    capabilities: "Writes blog posts, social media captions, ad copy, email campaigns, video scripts, and landing page text. Adapts tone to brand guidelines. Creates A/B copy variants for testing. Produces content across all channels at scale.",
    adapterType: "claude_local",
    adapterConfig: {
      promptTemplate: "You are a senior content creator at an AI marketing agency. You write compelling, conversion-oriented marketing content across all channels. You understand SEO principles, emotional triggers, brand voice consistency, and platform-specific best practices. You always consider the target audience, funnel stage, and desired action. You deliver content with clear structure, strong hooks, and measurable CTAs.",
    },
    runtimeConfig: {
      heartbeat: { enabled: false, wakeOnDemand: true },
    },
  },
  {
    name: "Video Analyst",
    role: "researcher",
    title: "Video Content Analyst",
    icon: "eye",
    capabilities: "Analyzes video performance across YouTube, TikTok, Instagram Reels, LinkedIn Video. Tracks engagement metrics, identifies trending formats, extracts key moments from competitor videos. Generates data-driven video content briefs. Monitors platform algorithm changes.",
    adapterType: "claude_local",
    adapterConfig: {
      promptTemplate: "You are a Video Content Analyst at an AI marketing agency. You specialize in analyzing video performance across platforms (YouTube, TikTok, Instagram, LinkedIn). You think in terms of retention curves, engagement rates, trending formats, and audience behavior. You identify what makes videos succeed or fail and translate those insights into actionable content briefs. Always back recommendations with data patterns.",
    },
    runtimeConfig: {
      heartbeat: { enabled: true, intervalSec: 7200, wakeOnDemand: true },
    },
  },
  {
    name: "Competitor Analyst",
    role: "researcher",
    title: "Competitive Intelligence Analyst",
    icon: "search",
    capabilities: "Tracks competitor websites, social media, ad campaigns, SEO positioning, pricing, and product launches. Builds competitive battlecards. Identifies market gaps and whitespace opportunities. Produces weekly intelligence briefs and monthly deep-dive reports.",
    adapterType: "claude_local",
    adapterConfig: {
      promptTemplate: "You are a Competitive Intelligence Analyst at an AI marketing agency. You systematically track and analyze competitor marketing activities across all channels. You think like a strategist — not just what competitors are doing, but why, and what it means for our positioning. You identify patterns, spot opportunities, and flag threats early. Always cite sources and distinguish between confirmed facts and inferences.",
    },
    runtimeConfig: {
      heartbeat: { enabled: true, intervalSec: 14400, wakeOnDemand: true },
    },
  },
  {
    name: "Social Media Manager",
    role: "general",
    title: "Social Media Manager",
    icon: "message-square",
    capabilities: "Manages content calendars across X, LinkedIn, Instagram, TikTok, Facebook. Schedules and publishes posts. Engages with community. Tracks social metrics. Identifies trending topics. Manages hashtag strategy and platform-specific best practices.",
    adapterType: "claude_local",
    adapterConfig: {
      promptTemplate: "You are a Social Media Manager at an AI marketing agency. You manage brand presence across all major social platforms. You understand platform algorithms, optimal posting cadences, community management, and the nuances of each platform's audience. You think in terms of engagement loops, share triggers, and audience growth. You balance brand consistency with platform-native content.",
    },
    runtimeConfig: {
      heartbeat: { enabled: true, intervalSec: 1800, wakeOnDemand: true },
    },
  },
  {
    name: "SEO Specialist",
    role: "researcher",
    title: "SEO Specialist",
    icon: "target",
    capabilities: "Conducts keyword research, performs technical SEO audits, optimizes on-page content, develops link building strategies. Tracks keyword rankings and organic traffic. Analyzes SERP features. Coordinates with Content Creator for SEO-optimized content.",
    adapterType: "claude_local",
    adapterConfig: {
      promptTemplate: "You are an SEO Specialist at an AI marketing agency. You own organic search strategy from keyword research through on-page optimization to link building and technical SEO. You think in terms of search intent, topical authority, SERP features, and user experience signals. You balance quick wins with long-term authority building. Every content recommendation should include target keywords, search intent, and expected impact.",
    },
    runtimeConfig: {
      heartbeat: { enabled: true, intervalSec: 21600, wakeOnDemand: true },
    },
  },
  {
    name: "Ad Campaign Manager",
    role: "general",
    title: "Paid Media & Ad Campaign Manager",
    icon: "zap",
    capabilities: "Plans paid media strategy across Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads. Manages budgets and bid strategies. Runs A/B tests on creative, copy, and audiences. Monitors ROAS, CPC, CPA in real-time. Optimizes campaigns based on performance data.",
    adapterType: "claude_local",
    adapterConfig: {
      promptTemplate: "You are a Paid Media & Ad Campaign Manager at an AI marketing agency. You own all paid advertising across Google Ads, Meta Ads, LinkedIn Ads, TikTok Ads, and programmatic channels. You think in terms of ROAS, CPA targets, audience segments, funnel stages, and creative fatigue. You are rigorous about A/B testing and data-driven optimization. Every recommendation should include expected impact on key metrics.",
    },
    runtimeConfig: {
      heartbeat: { enabled: true, intervalSec: 3600, wakeOnDemand: true },
    },
  },
];

async function main() {
  console.log("🤖 Provisioning marketing agents...\n");

  // Get company
  const companies = await api("/companies");
  if (companies.length === 0) {
    console.error("❌ No company found. Run seed-marketing-demo.ts first.");
    process.exit(1);
  }
  const companyId = companies[0].id;
  console.log(`✓ Using company: ${companies[0].name} (${companyId})\n`);

  // Check existing agents
  const existingAgents = await api(`/companies/${companyId}/agents`);
  const existingNames = new Set(existingAgents.map((a: { name: string }) => a.name));

  if (existingNames.size > 0) {
    console.log(`ℹ  Found ${existingNames.size} existing agents: ${[...existingNames].join(", ")}`);
    console.log("   Skipping agents that already exist.\n");
  }

  // Create CMO first (no reportsTo)
  let cmoId: string | null = null;
  const cmo = AGENTS[0];

  if (existingNames.has(cmo.name)) {
    const existing = existingAgents.find((a: { name: string }) => a.name === cmo.name);
    cmoId = existing.id;
    console.log(`⏭  ${cmo.name} — already exists (${cmoId})`);
  } else {
    try {
      const result = await api(`/companies/${companyId}/agent-hires`, "POST", {
        name: cmo.name,
        role: cmo.role,
        title: cmo.title,
        icon: cmo.icon,
        capabilities: cmo.capabilities,
        adapterType: cmo.adapterType,
        adapterConfig: cmo.adapterConfig,
        runtimeConfig: cmo.runtimeConfig,
      });

      // The hire endpoint may return an approval or the agent directly
      cmoId = result.agent?.id || result.id;
      console.log(`✓  ${cmo.name} — ${cmo.title} (${cmoId})`);
    } catch (err) {
      console.error(`❌  ${cmo.name} — ${err instanceof Error ? err.message : err}`);
    }
  }

  // Create remaining agents reporting to CMO
  for (const agent of AGENTS.slice(1)) {
    if (existingNames.has(agent.name)) {
      console.log(`⏭  ${agent.name} — already exists`);
      continue;
    }

    try {
      const payload: Record<string, unknown> = {
        name: agent.name,
        role: agent.role,
        title: agent.title,
        icon: agent.icon,
        capabilities: agent.capabilities,
        adapterType: agent.adapterType,
        adapterConfig: agent.adapterConfig,
        runtimeConfig: agent.runtimeConfig,
      };

      if (cmoId) {
        payload.reportsTo = cmoId;
      }

      const result = await api(`/companies/${companyId}/agent-hires`, "POST", payload);
      const agentId = result.agent?.id || result.id;
      console.log(`✓  ${agent.name} — ${agent.title} (${agentId})`);
    } catch (err) {
      console.error(`❌  ${agent.name} — ${err instanceof Error ? err.message : err}`);
    }
  }

  console.log("\n✅ Agent provisioning complete!");
  console.log("\n   Open http://localhost:3100 and click 'AI Team' to see your agents.");
  console.log("\n   To make agents actually run, add your API key:");
  console.log("   export ANTHROPIC_API_KEY=sk-ant-...");
  console.log("   Then restart pnpm dev.\n");
}

main().catch((err) => {
  console.error("❌ Provisioning failed:", err);
  process.exit(1);
});
