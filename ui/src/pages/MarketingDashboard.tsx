import { useEffect } from "react";
import { Link } from "@/lib/router";
import { useQuery } from "@tanstack/react-query";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { mediaAssetsApi } from "../api/mediaAssets";
import { competitorsApi } from "../api/competitors";
import { campaignMetricsApi } from "../api/campaignMetrics";
import { contentCalendarApi } from "../api/contentCalendar";
import {
  Video,
  Eye,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  XCircle,
  Calendar,
  ArrowRight,
} from "lucide-react";
import { cn } from "../lib/utils";

function formatNumber(n: number): string {
  if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
  return n.toString();
}

function formatCurrency(cents: number): string {
  return `$${(cents / 100).toLocaleString("en-US", { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function SeverityBadge({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    high: "bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300",
    medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
    low: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  };
  return (
    <span className={cn("px-2 py-0.5 rounded-full text-xs font-medium", colors[severity] || colors.low)}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { icon: React.ReactNode; label: string; className: string }> = {
    pending_review: {
      icon: <Clock className="w-3 h-3" />,
      label: "Needs review",
      className: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
    },
    approved: {
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Approved",
      className: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
    },
    rejected: {
      icon: <XCircle className="w-3 h-3" />,
      label: "Rejected",
      className: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
    },
    published: {
      icon: <CheckCircle className="w-3 h-3" />,
      label: "Published",
      className: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
    },
  };
  const c = config[status] || config.pending_review;
  return (
    <span className={cn("inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium", c.className)}>
      {c.icon} {c.label}
    </span>
  );
}

function PlatformIcon({ platform }: { platform: string }) {
  const colors: Record<string, string> = {
    tiktok: "bg-black text-white",
    instagram: "bg-gradient-to-br from-purple-600 to-pink-500 text-white",
    youtube: "bg-red-600 text-white",
    x: "bg-black text-white",
    linkedin: "bg-blue-700 text-white",
  };
  return (
    <span
      className={cn(
        "inline-flex items-center justify-center w-6 h-6 rounded text-[10px] font-bold uppercase",
        colors[platform] || "bg-gray-200 text-gray-700",
      )}
    >
      {platform.slice(0, 2)}
    </span>
  );
}

export function MarketingDashboard() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "Dashboard" }]);
  }, [setBreadcrumbs]);

  const { data: metrics } = useQuery({
    queryKey: ["campaign-metrics", selectedCompanyId],
    queryFn: () => campaignMetricsApi.get(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: pendingAssets } = useQuery({
    queryKey: ["media-assets-pending", selectedCompanyId],
    queryFn: () => mediaAssetsApi.listPending(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: allAssets } = useQuery({
    queryKey: ["media-assets", selectedCompanyId],
    queryFn: () => mediaAssetsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: competitorEvents } = useQuery({
    queryKey: ["competitor-events", selectedCompanyId],
    queryFn: () => competitorsApi.events(selectedCompanyId!, { limit: 10 }),
    enabled: !!selectedCompanyId,
  });

  const { data: calendarEntries } = useQuery({
    queryKey: ["content-calendar", selectedCompanyId],
    queryFn: () => {
      const now = new Date().toISOString();
      const weekLater = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString();
      return contentCalendarApi.list(selectedCompanyId!, now, weekLater);
    },
    enabled: !!selectedCompanyId,
  });

  const totals = metrics?.totals;
  const contentProduced = allAssets?.length || 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      {/* Metric cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Video className="w-4 h-4" /> Content produced
          </div>
          <div className="text-2xl font-semibold">{contentProduced}</div>
          <div className="text-xs text-muted-foreground mt-1">this month</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <Eye className="w-4 h-4" /> Total reach
          </div>
          <div className="text-2xl font-semibold">
            {formatNumber(totals?.totalImpressions || 0)}
          </div>
          <div className="text-xs text-muted-foreground mt-1">impressions</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <TrendingUp className="w-4 h-4" /> Engagement rate
          </div>
          <div className="text-2xl font-semibold">{totals?.engagementRate || 0}%</div>
          <div className="text-xs text-muted-foreground mt-1">avg across platforms</div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1">
            <DollarSign className="w-4 h-4" /> ROAS
          </div>
          <div className="text-2xl font-semibold">{totals?.roas || 0}x</div>
          <div className="text-xs text-muted-foreground mt-1">
            {formatCurrency(totals?.totalRevenueCents || 0)} revenue
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Approval queue */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-sm">Awaiting your approval</h2>
            <Link
              to="/approvals"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(!pendingAssets || pendingAssets.length === 0) && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No content waiting for review. Your AI team is working on it.
              </div>
            )}
            {pendingAssets?.slice(0, 5).map((asset) => (
              <Link
                key={asset.id}
                to={`/content/assets/${asset.id}`}
                className="flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors"
              >
                <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                  <Video className="w-5 h-5" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium truncate">{asset.title}</div>
                  <div className="text-xs text-muted-foreground">
                    {asset.type} · {new Date(asset.createdAt).toLocaleDateString()}
                  </div>
                </div>
                <StatusBadge status={asset.status} />
              </Link>
            ))}
          </div>
        </div>

        {/* Competitor alerts */}
        <div className="rounded-xl border border-border bg-card">
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <h2 className="font-semibold text-sm flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-amber-500" /> Competitor activity
            </h2>
            <Link
              to="/competitors"
              className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
            >
              View all <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
          <div className="divide-y divide-border">
            {(!competitorEvents || competitorEvents.length === 0) && (
              <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                No competitor activity detected yet. Add competitors in Settings.
              </div>
            )}
            {competitorEvents?.slice(0, 5).map((event) => (
              <div key={event.id} className="px-4 py-3">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm font-medium">{event.title}</span>
                  <SeverityBadge severity={event.severity} />
                </div>
                <div className="text-xs text-muted-foreground">
                  {event.eventType.replace(/_/g, " ")} ·{" "}
                  {new Date(event.detectedAt).toLocaleDateString()}
                </div>
                {event.description && (
                  <div className="text-xs text-muted-foreground mt-1 line-clamp-2">
                    {event.description}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upcoming scheduled content */}
      <div className="rounded-xl border border-border bg-card">
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <h2 className="font-semibold text-sm flex items-center gap-2">
            <Calendar className="w-4 h-4" /> Scheduled this week
          </h2>
          <Link
            to="/content/calendar"
            className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
          >
            Full calendar <ArrowRight className="w-3 h-3" />
          </Link>
        </div>
        <div className="divide-y divide-border">
          {(!calendarEntries || calendarEntries.length === 0) && (
            <div className="px-4 py-8 text-center text-sm text-muted-foreground">
              Nothing scheduled this week. Your content team will fill this up.
            </div>
          )}
          {calendarEntries?.slice(0, 8).map((entry) => (
            <div key={entry.calendar.id} className="flex items-center gap-3 px-4 py-3">
              <PlatformIcon platform={entry.calendar.platform} />
              <div className="flex-1 min-w-0">
                <div className="text-sm font-medium truncate">
                  {entry.asset?.title || "Untitled"}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {entry.calendar.caption?.slice(0, 80)}
                </div>
              </div>
              <div className="text-xs text-muted-foreground whitespace-nowrap">
                {new Date(entry.calendar.scheduledAt).toLocaleDateString("en-US", {
                  weekday: "short",
                  month: "short",
                  day: "numeric",
                  hour: "numeric",
                  minute: "2-digit",
                })}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
