import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { competitorsApi, type CompetitorEvent, type Competitor } from "../api/competitors";
import {
  AlertTriangle,
  Video,
  Megaphone,
  DollarSign,
  Package,
  Globe,
  FileText,
  Filter,
  ExternalLink,
} from "lucide-react";
import { cn } from "../lib/utils";

function EventTypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    new_video: <Video className="w-4 h-4" />,
    new_ad: <Megaphone className="w-4 h-4" />,
    price_change: <DollarSign className="w-4 h-4" />,
    new_product: <Package className="w-4 h-4" />,
    new_campaign: <Megaphone className="w-4 h-4" />,
    social_post: <FileText className="w-4 h-4" />,
    website_change: <Globe className="w-4 h-4" />,
    new_content: <FileText className="w-4 h-4" />,
  };
  return <>{icons[type] || <AlertTriangle className="w-4 h-4" />}</>;
}

function SeverityDot({ severity }: { severity: string }) {
  const colors: Record<string, string> = {
    critical: "bg-red-500",
    high: "bg-orange-500",
    medium: "bg-yellow-500",
    low: "bg-gray-400",
  };
  return <span className={cn("w-2 h-2 rounded-full inline-block", colors[severity] || colors.low)} />;
}

function TimelineEvent({ event, competitors }: { event: CompetitorEvent; competitors: Competitor[] }) {
  const competitor = competitors.find((c) => c.id === event.competitorId);
  const timeAgo = getTimeAgo(event.detectedAt);

  return (
    <div className="flex gap-3 py-3">
      <div className="flex flex-col items-center">
        <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground">
          <EventTypeIcon type={event.eventType} />
        </div>
        <div className="w-px flex-1 bg-border mt-2" />
      </div>
      <div className="flex-1 pb-4">
        <div className="flex items-center gap-2 mb-1">
          <SeverityDot severity={event.severity} />
          <span className="text-sm font-medium">{event.title}</span>
        </div>
        <div className="text-xs text-muted-foreground mb-1">
          {competitor?.name || "Unknown"} · {event.eventType.replace(/_/g, " ")} · {timeAgo}
          {event.platform && <> · {event.platform}</>}
        </div>
        {event.description && (
          <p className="text-sm text-muted-foreground mt-1">{event.description}</p>
        )}
        {event.sourceUrl && (
          <a
            href={event.sourceUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-xs text-blue-600 hover:text-blue-800 mt-2"
          >
            View source <ExternalLink className="w-3 h-3" />
          </a>
        )}
      </div>
    </div>
  );
}

function getTimeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString();
}

export function CompetitorOverview() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [severityFilter, setSeverityFilter] = useState<string | null>(null);

  useEffect(() => {
    setBreadcrumbs([{ label: "Competitors" }]);
  }, [setBreadcrumbs]);

  const { data: competitors } = useQuery({
    queryKey: ["competitors", selectedCompanyId],
    queryFn: () => competitorsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: events, isLoading } = useQuery({
    queryKey: ["competitor-events", selectedCompanyId, severityFilter],
    queryFn: () =>
      competitorsApi.events(selectedCompanyId!, {
        severity: severityFilter || undefined,
        limit: 50,
      }),
    enabled: !!selectedCompanyId,
  });

  const severityCounts = events?.reduce(
    (acc, e) => {
      acc[e.severity] = (acc[e.severity] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 space-y-6">
      <div>
        <h1 className="text-lg font-semibold">Competitor intelligence</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Real-time activity feed from {competitors?.length || 0} tracked competitors.
        </p>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {(["critical", "high", "medium", "low"] as const).map((sev) => (
          <button
            key={sev}
            onClick={() => setSeverityFilter(severityFilter === sev ? null : sev)}
            className={cn(
              "rounded-lg border p-3 text-left transition-colors",
              severityFilter === sev
                ? "border-foreground bg-muted"
                : "border-border bg-card hover:bg-muted/50",
            )}
          >
            <div className="flex items-center gap-2 mb-1">
              <SeverityDot severity={sev} />
              <span className="text-xs text-muted-foreground capitalize">{sev}</span>
            </div>
            <div className="text-xl font-semibold">{severityCounts?.[sev] || 0}</div>
          </button>
        ))}
      </div>

      {/* Filter bar */}
      {severityFilter && (
        <div className="flex items-center gap-2 text-sm">
          <Filter className="w-4 h-4 text-muted-foreground" />
          <span className="text-muted-foreground">Showing:</span>
          <span className="font-medium capitalize">{severityFilter}</span>
          <button
            onClick={() => setSeverityFilter(null)}
            className="text-xs text-blue-600 hover:text-blue-800 ml-2"
          >
            Clear
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="rounded-xl border border-border bg-card px-4">
        {isLoading && (
          <div className="py-12 text-center text-sm text-muted-foreground">Loading events...</div>
        )}
        {!isLoading && (!events || events.length === 0) && (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No competitor activity yet. Your AI analyst is monitoring — events will appear here.
          </div>
        )}
        {events?.map((event) => (
          <TimelineEvent key={event.id} event={event} competitors={competitors || []} />
        ))}
      </div>
    </div>
  );
}
