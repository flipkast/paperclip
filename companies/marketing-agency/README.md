# AI Marketing Agency — Paperclip Company Template

A ready-to-deploy autonomous AI marketing agency built on [Paperclip](https://github.com/paperclipai/paperclip).

## Overview

This template creates a fully staffed AI marketing agency with 7 specialized agents covering the full marketing lifecycle:

| Agent | Role | Heartbeat | Focus |
|-------|------|-----------|-------|
| **CMO** | Chief Marketing Officer | Every 1h | Strategy, delegation, performance review |
| **Content Creator** | Senior Content Creator | On-demand | Blog posts, ad copy, scripts, emails, social |
| **Video Analyst** | Video Content Analyst | Every 2h | Video performance, trends, content briefs |
| **Competitor Analyst** | Competitive Intelligence | Every 4h | Market intel, competitor tracking, battlecards |
| **Social Media Manager** | Social Media Manager | Every 30min | Publishing, engagement, community management |
| **SEO Specialist** | SEO Specialist | Every 6h | Keyword research, on-page SEO, rankings |
| **Ad Campaign Manager** | Paid Media Manager | Every 1h | Ad campaigns, A/B testing, ROAS optimization |

## Quick Start

### Option 1: Import the company template

```bash
npx paperclipai companies import ./companies/marketing-agency
```

### Option 2: Manual setup via Paperclip UI

1. Create a new company in Paperclip
2. Set the company goal (see COMPANY.md)
3. Create each agent using the configurations in `agents/`
4. Create projects using the templates in `projects/`
5. Install skills from `skills/`

### Option 3: API-based setup

```bash
# Create the company
curl -X POST http://localhost:3100/api/companies \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AI Marketing Agency",
    "description": "Autonomous AI marketing agency for media creation, video analysis, competitor intelligence, and full-funnel marketing."
  }'

# Then create agents using the hire endpoint (see agent AGENTS.md files for configs)
```

## Projects Included

| Project | Lead | Description |
|---------|------|-------------|
| **Content Pipeline** | CMO | Repeatable content production across all channels |
| **Competitor Intelligence** | Competitor Analyst | Continuous competitive monitoring and reporting |
| **Video Strategy** | Video Analyst | Data-driven video content strategy |
| **Paid Media Campaigns** | Ad Campaign Manager | Multi-platform ad campaign operations |

## Customizing the Agency

### Adjust for your brand

1. Update the company goal in `COMPANY.md` to reflect your specific business
2. Edit each agent's `promptTemplate` to include your brand guidelines, tone of voice, and target audience
3. Modify heartbeat intervals based on your content cadence and budget
4. Add your competitor list to the Competitor Analyst's initial task set

### Add more agents

Common additions for larger operations:

- **Email Marketing Specialist** — dedicated email campaign management
- **PR & Communications Agent** — press releases, media relations, thought leadership
- **Influencer Manager** — influencer outreach, relationship management, campaign coordination
- **Brand Designer** — visual identity, creative direction, design briefs
- **Data Engineer** — marketing data pipelines, analytics infrastructure

### Connect to real platforms

For production use, you'll want to give agents access to:

- **Content Management**: WordPress API, Webflow API, Ghost API
- **Social Media**: Buffer/Hootsuite API, native platform APIs (X, LinkedIn, Meta)
- **Analytics**: Google Analytics 4, Mixpanel, Amplitude
- **SEO Tools**: Ahrefs API, SEMrush API, Google Search Console
- **Ad Platforms**: Google Ads API, Meta Marketing API, LinkedIn Marketing API
- **Video Platforms**: YouTube Data API, TikTok API
- **Email**: Mailchimp, SendGrid, ConvertKit APIs
- **Competitor Intel**: SimilarWeb, SpyFu, BuiltWith

These can be added as MCP servers, agent skills, or HTTP adapter integrations.

## Directory Structure

```
companies/marketing-agency/
├── COMPANY.md                              # Company definition and org structure
├── README.md                               # This file
├── agents/
│   ├── cmo/AGENTS.md                       # Chief Marketing Officer
│   ├── content-creator/AGENTS.md           # Content Creator
│   ├── video-analyst/AGENTS.md             # Video Content Analyst
│   ├── competitor-analyst/AGENTS.md        # Competitive Intelligence Analyst
│   ├── social-media-manager/AGENTS.md      # Social Media Manager
│   ├── seo-specialist/AGENTS.md            # SEO Specialist
│   └── ad-campaign-manager/AGENTS.md       # Paid Media Manager
├── projects/
│   ├── content-pipeline/PROJECT.md         # Content production pipeline
│   ├── competitor-intelligence/PROJECT.md  # Competitive intelligence program
│   ├── video-strategy/PROJECT.md           # Video content strategy
│   └── paid-media-campaigns/PROJECT.md     # Paid media operations
├── skills/
│   ├── marketing-analytics/SKILL.md        # Analytics and reporting skill
│   └── competitor-research/SKILL.md        # Competitor research skill
└── teams/                                  # Team definitions (extensible)
```

## License

MIT — same as Paperclip.
