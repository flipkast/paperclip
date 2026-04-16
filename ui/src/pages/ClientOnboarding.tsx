import { useState } from "react";
import { useNavigate } from "@/lib/router";
import { useCompany } from "../context/CompanyContext";
import {
  ArrowRight,
  ArrowLeft,
  Building2,
  Users,
  Link2,
  Sparkles,
  Check,
} from "lucide-react";
import { cn } from "../lib/utils";

const STEPS = [
  { key: "brand", label: "Your brand", icon: Building2 },
  { key: "competitors", label: "Competitors", icon: Users },
  { key: "platforms", label: "Connect", icon: Link2 },
  { key: "firstAction", label: "First action", icon: Sparkles },
];

const INDUSTRIES = [
  "E-commerce / DTC",
  "Fashion & Apparel",
  "Beauty & Skincare",
  "Health & Supplements",
  "Food & Beverage",
  "Home & Garden",
  "Electronics",
  "Other",
];

const VOICE_OPTIONS = [
  { value: "professional", label: "Professional", desc: "Clean, authoritative, trustworthy" },
  { value: "casual", label: "Casual & Friendly", desc: "Conversational, approachable, warm" },
  { value: "bold", label: "Bold & Edgy", desc: "Provocative, irreverent, memorable" },
  { value: "luxury", label: "Premium & Elegant", desc: "Sophisticated, refined, exclusive" },
];

const FIRST_ACTIONS = [
  {
    key: "videos",
    title: "Generate 5 product videos",
    desc: "AI creates TikTok/Reels-ready product videos",
    icon: "🎬",
  },
  {
    key: "competitor",
    title: "Run a competitor analysis",
    desc: "Full report on what your competitors are doing",
    icon: "🔍",
  },
  {
    key: "content",
    title: "Create a week of social content",
    desc: "7 days of posts across all your platforms",
    icon: "📅",
  },
  {
    key: "seo",
    title: "Audit my SEO",
    desc: "Find keyword opportunities and content gaps",
    icon: "📊",
  },
];

export function ClientOnboarding() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [brandName, setBrandName] = useState("");
  const [industry, setIndustry] = useState("");
  const [websiteUrl, setWebsiteUrl] = useState("");
  const [voice, setVoice] = useState("");
  const [competitorUrls, setCompetitorUrls] = useState(["", "", ""]);
  const [selectedAction, setSelectedAction] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const canProceed = () => {
    if (step === 0) return brandName.length > 0 && industry.length > 0;
    if (step === 1) return competitorUrls.some((u) => u.length > 0);
    if (step === 2) return true; // platforms are optional
    if (step === 3) return selectedAction.length > 0;
    return true;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // TODO: Call API to create company, brand, competitors, and first task
      // For now, navigate to dashboard
      await new Promise((r) => setTimeout(r, 2000));
      navigate("/");
    } catch {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-10">
      <div className="w-full max-w-lg space-y-8">
        {/* Progress */}
        <div className="flex items-center justify-center gap-2">
          {STEPS.map((s, i) => (
            <div key={s.key} className="flex items-center gap-2">
              <div
                className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors",
                  i < step
                    ? "bg-green-600 text-white"
                    : i === step
                      ? "bg-foreground text-background"
                      : "bg-muted text-muted-foreground",
                )}
              >
                {i < step ? <Check className="w-4 h-4" /> : i + 1}
              </div>
              {i < STEPS.length - 1 && (
                <div className={cn("w-8 h-px", i < step ? "bg-green-600" : "bg-border")} />
              )}
            </div>
          ))}
        </div>

        {/* Step 0: Brand */}
        {step === 0 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Tell us about your brand</h1>
              <p className="text-muted-foreground mt-2">
                This helps your AI team create on-brand content from day one.
              </p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium mb-1 block">Brand name</label>
                <input
                  type="text"
                  value={brandName}
                  onChange={(e) => setBrandName(e.target.value)}
                  placeholder="e.g. Glossier, Allbirds, Warby Parker"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Website</label>
                <input
                  type="url"
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  placeholder="https://yourbrand.com"
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Industry</label>
                <div className="grid grid-cols-2 gap-2">
                  {INDUSTRIES.map((ind) => (
                    <button
                      key={ind}
                      onClick={() => setIndustry(ind)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-sm text-left transition-colors",
                        industry === ind
                          ? "border-foreground bg-muted font-medium"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      {ind}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm font-medium mb-1 block">Brand voice</label>
                <div className="grid grid-cols-2 gap-2">
                  {VOICE_OPTIONS.map((v) => (
                    <button
                      key={v.value}
                      onClick={() => setVoice(v.value)}
                      className={cn(
                        "rounded-lg border px-3 py-2 text-left transition-colors",
                        voice === v.value
                          ? "border-foreground bg-muted"
                          : "border-border hover:bg-muted/50",
                      )}
                    >
                      <div className="text-sm font-medium">{v.label}</div>
                      <div className="text-xs text-muted-foreground">{v.desc}</div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 1: Competitors */}
        {step === 1 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Who are your competitors?</h1>
              <p className="text-muted-foreground mt-2">
                We'll track their marketing moves so you can stay ahead.
              </p>
            </div>
            <div className="space-y-3">
              {competitorUrls.map((url, i) => (
                <input
                  key={i}
                  type="url"
                  value={url}
                  onChange={(e) => {
                    const updated = [...competitorUrls];
                    updated[i] = e.target.value;
                    setCompetitorUrls(updated);
                  }}
                  placeholder={`Competitor ${i + 1} website`}
                  className="w-full rounded-lg border border-border bg-background px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                />
              ))}
              <button
                onClick={() => setCompetitorUrls([...competitorUrls, ""])}
                className="text-sm text-muted-foreground hover:text-foreground"
              >
                + Add another
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Platforms */}
        {step === 2 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">Connect your platforms</h1>
              <p className="text-muted-foreground mt-2">
                Optional — you can connect these later in Settings.
              </p>
            </div>
            <div className="space-y-2">
              {["TikTok", "Instagram", "YouTube", "X (Twitter)", "LinkedIn", "Google Ads", "Meta Ads"].map(
                (platform) => (
                  <button
                    key={platform}
                    className="w-full flex items-center justify-between rounded-lg border border-border px-4 py-3 hover:bg-muted/50 transition-colors"
                  >
                    <span className="text-sm font-medium">{platform}</span>
                    <span className="text-xs text-muted-foreground">Connect →</span>
                  </button>
                ),
              )}
            </div>
            <p className="text-xs text-center text-muted-foreground">
              You can publish content manually or connect platforms later.
            </p>
          </div>
        )}

        {/* Step 3: First action */}
        {step === 3 && (
          <div className="space-y-6">
            <div className="text-center">
              <h1 className="text-2xl font-semibold">What should we do first?</h1>
              <p className="text-muted-foreground mt-2">
                Pick a quick win — your AI team will start immediately.
              </p>
            </div>
            <div className="space-y-2">
              {FIRST_ACTIONS.map((action) => (
                <button
                  key={action.key}
                  onClick={() => setSelectedAction(action.key)}
                  className={cn(
                    "w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-left transition-colors",
                    selectedAction === action.key
                      ? "border-foreground bg-muted"
                      : "border-border hover:bg-muted/50",
                  )}
                >
                  <span className="text-2xl">{action.icon}</span>
                  <div>
                    <div className="text-sm font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground">{action.desc}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="flex items-center justify-between pt-4">
          {step > 0 ? (
            <button
              onClick={() => setStep(step - 1)}
              className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="w-4 h-4" /> Back
            </button>
          ) : (
            <div />
          )}

          {step < STEPS.length - 1 ? (
            <button
              onClick={() => setStep(step + 1)}
              disabled={!canProceed()}
              className="flex items-center gap-1 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              Continue <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <button
              onClick={handleSubmit}
              disabled={!canProceed() || isSubmitting}
              className="flex items-center gap-2 px-4 py-2 rounded-lg bg-foreground text-background text-sm font-medium hover:opacity-90 disabled:opacity-40 transition-opacity"
            >
              {isSubmitting ? (
                <>Setting up your AI team...</>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" /> Launch my AI team
                </>
              )}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
