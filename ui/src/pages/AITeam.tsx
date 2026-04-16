import { useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { agentsApi } from "../api/agents";
import { heartbeatsApi } from "../api/heartbeats";
import { activityApi } from "../api/activity";
import type { Agent } from "@paperclipai/shared";
import {
  Crown,
  PenTool,
  Video,
  Search,
  MessageCircle,
  BarChart3,
  Zap,
  Bot,
  Play,
  Pause,
  Moon,
  AlertCircle,
  Clock,
  CheckCircle2,
  XCircle,
} from "lucide-react";
import { cn } from "../lib/utils";

const ROLE_ICONS: Record<string, React.ReactNode> = {
  cmo: <Crown className="w-5 h-5" />,
  ceo: <Crown className="w-5 h-5" />,
  "content-creator": <PenTool className="w-5 h-5" />,
  "content_creator": <PenTool className="w-5 h-5" />,
  "video-analyst": <Video className="w-5 h-5" />,
  "video_analyst": <Video className="w-5 h-5" />,
  "competitor-analyst": <Search className="w-5 h-5" />,
  "competitor_analyst": <Search className="w-5 h-5" />,
  "social-media-manager": <MessageCircle className="w-5 h-5" />,
  "social_media_manager": <MessageCircle className="w-5 h-5" />,
  "seo-specialist": <BarChart3 className="w-5 h-5" />,
  "seo_specialist": <BarChart3 className="w-5 h-5" />,
  "ad-campaign-manager": <Zap className="w-5 h-5" />,
  "ad_campaign_manager": <Zap className="w-5 h-5" />,
};

const STATUS_CONFIG: Record<string, {
  label: string;
  icon: React.ReactNode;
  dotColor: string;
  bgColor: string;
}> = {
  running: {
    label: "Working",
    icon: <Play className="w-3 h-3" />,
    dotColor: "bg-green-500",
    bgColor: "bg-green-500/10 text-green-700 dark:text-green-400",
  },
  active: {
    label: "Active",
    icon: <CheckCircle2 className="w-3 h-3" />,
    dotColor: "bg-blue-500",
    bgColor: "bg-blue-500/10 text-blue-700 dark:text-blue-400",
  },
  idle: {
    label: "Sleeping",
    icon: <Moon className="w-3 h-3" />,
    dotColor: "bg-gray-400",
    bgColor: "bg-gray-500/10 text-gray-600 dark:text-gray-400",
  },
  paused: {
    label: "Paused",
    icon: <Pause className="w-3 h-3" />,
    dotColor: "bg-amber-500",
    bgColor: "bg-amber-500/10 text-amber-700 dark:text-amber-400",
  },
  error: {
    label: "Error",
    icon: <AlertCircle className="w-3 h-3" />,
    dotColor: "bg-red-500",
    bgColor: "bg-red-500/10 text-red-700 dark:text-red-400",
  },
};

function getTimeUntilNext(agent: Agent): string | null {
  const rc = agent.runtimeConfig as { heartbeat?: { enabled?: boolean; intervalSec?: number } } | null;
  if (!rc?.heartbeat?.enabled || !rc.heartbeat.intervalSec) return null;
  if (!agent.lastHeartbeatAt) return "First run pending";

  const lastRun = new Date(agent.lastHeartbeatAt).getTime();
  const interval = rc.heartbeat.intervalSec * 1000;
  const nextRun = lastRun + interval;
  const diff = nextRun - Date.now();

  if (diff <= 0) return "Due now";
  if (diff < 60_000) return `in ${Math.ceil(diff / 1000)}s`;
  if (diff < 3600_000) return `in ${Math.ceil(diff / 60_000)}m`;
  return `in ${Math.round(diff / 3600_000)}h ${Math.round((diff % 3600_000) / 60_000)}m`;
}

function getHeartbeatLabel(agent: Agent): string {
  const rc = agent.runtimeConfig as { heartbeat?: { enabled?: boolean; intervalSec?: number; wakeOnDemand?: boolean } } | null;
  if (!rc?.heartbeat) return "On-demand";
  if (!rc.heartbeat.enabled) return "On-demand";
  const sec = rc.heartbeat.intervalSec || 0;
  if (sec < 3600) return `Every ${Math.round(sec / 60)}min`;
  return `Every ${Math.round(sec / 3600)}h`;
}

function timeAgo(date: Date | string | null): string {
  if (!date) return "never";
  const diff = Date.now() - new Date(date).getTime();
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "just now";
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

function AgentCard({
  agent,
  latestRun,
  isLive,
}: {
  agent: Agent;
  latestRun?: { status: string; startedAt?: string | Date | null; finishedAt?: string | Date | null; triggerDetail?: string | null } | null;
  isLive: boolean;
}) {
  const effectiveStatus = isLive ? "running" : agent.status;
  const config = STATUS_CONFIG[effectiveStatus] || STATUS_CONFIG.idle;
  const roleIcon = ROLE_ICONS[agent.role] || ROLE_ICONS[agent.name.toLowerCase().replace(/\s+/g, "-")] || <Bot className="w-5 h-5" />;
  const nextRun = getTimeUntilNext(agent);
  const heartbeatLabel = getHeartbeatLabel(agent);

  return (
    <div className="rounded-xl border border-border bg-card p-4 hover:border-foreground/20 transition-colors">
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
            {roleIcon}
          </div>
          <div>
            <div className="text-sm font-semibold">{agent.name}</div>
            <div className="text-xs text-muted-foreground">{agent.title || agent.role}</div>
          </div>
        </div>
        <span className={cn("inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium", config.bgColor)}>
          <span className={cn("w-1.5 h-1.5 rounded-full", config.dotColor, isLive && "animate-pulse")} />
          {config.label}
        </span>
      </div>

      {/* Current activity */}
      {isLive && latestRun && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-green-500/5 border border-green-500/20">
          <div className="text-xs text-green-700 dark:text-green-400 font-medium flex items-center gap-1.5">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
            </span>
            Working now
          </div>
          {latestRun.triggerDetail && (
            <div className="text-xs text-muted-foreground mt-1">{latestRun.triggerDetail}</div>
          )}
          <div className="text-xs text-muted-foreground mt-0.5">
            Started {timeAgo(latestRun.startedAt ?? null)}
          </div>
        </div>
      )}

      {/* Last activity */}
      {!isLive && latestRun && latestRun.finishedAt && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground flex items-center gap-1.5">
            {latestRun.status === "completed" ? (
              <CheckCircle2 className="w-3 h-3 text-green-500" />
            ) : latestRun.status === "failed" ? (
              <XCircle className="w-3 h-3 text-red-500" />
            ) : (
              <Clock className="w-3 h-3" />
            )}
            Last run: {latestRun.status} {timeAgo(latestRun.finishedAt)}
          </div>
          {latestRun.triggerDetail && (
            <div className="text-xs text-muted-foreground mt-0.5 truncate">{latestRun.triggerDetail}</div>
          )}
        </div>
      )}

      {!isLive && !latestRun && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-muted/50">
          <div className="text-xs text-muted-foreground">No runs yet — waiting for first task</div>
        </div>
      )}

      {/* Footer: schedule + cost */}
      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <div className="flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {heartbeatLabel}
          {nextRun && effectiveStatus !== "running" && (
            <span className="text-foreground/60">· next {nextRun}</span>
          )}
        </div>
        {agent.spentMonthlyCents > 0 && (
          <span>${(agent.spentMonthlyCents / 100).toFixed(2)} this month</span>
        )}
      </div>

      {/* Capabilities */}
      {agent.capabilities && (
        <div className="mt-3 pt-3 border-t border-border">
          <div className="text-xs text-muted-foreground line-clamp-2">{agent.capabilities}</div>
        </div>
      )}
    </div>
  );
}

export function AITeamPage() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();

  useEffect(() => {
    setBreadcrumbs([{ label: "AI Team" }]);
  }, [setBreadcrumbs]);

  const { data: agents, isLoading } = useQuery({
    queryKey: ["agents", selectedCompanyId],
    queryFn: () => agentsApi.list(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    refetchInterval: 10_000,
  });

  const { data: liveRuns } = useQuery({
    queryKey: ["live-runs", selectedCompanyId],
    queryFn: () => heartbeatsApi.liveRunsForCompany(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    refetchInterval: 5_000,
  });

  const { data: recentRuns } = useQuery({
    queryKey: ["recent-runs", selectedCompanyId],
    queryFn: () => heartbeatsApi.list(selectedCompanyId!, undefined, 50),
    enabled: !!selectedCompanyId,
    refetchInterval: 15_000,
  });

  const liveRunAgentIds = new Set(liveRuns?.map((r) => r.agentId) ?? []);

  // Get latest run per agent
  const latestRunByAgent = new Map<string, (typeof recentRuns extends (infer T)[] | undefined ? T : never)>();
  if (recentRuns) {
    for (const run of recentRuns) {
      if (!latestRunByAgent.has(run.agentId)) {
        latestRunByAgent.set(run.agentId, run);
      }
    }
  }

  // Also include live runs
  if (liveRuns) {
    for (const run of liveRuns) {
      latestRunByAgent.set(run.agentId, run as any);
    }
  }

  const activeAgents = agents?.filter((a) => a.status !== "terminated") ?? [];
  const workingCount = activeAgents.filter((a) => liveRunAgentIds.has(a.id)).length;
  const totalCount = activeAgents.length;

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading your AI team...</div>;
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Your AI team</h1>
          <p className="text-sm text-muted-foreground mt-1">
            {totalCount} agents · {workingCount} working now
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-green-500" /> Working</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500" /> Active</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-gray-400" /> Sleeping</span>
          </div>
        </div>
      </div>

      {activeAgents.length === 0 && (
        <div className="rounded-xl border border-dashed border-border p-12 text-center">
          <Bot className="w-10 h-10 mx-auto text-muted-foreground mb-3" />
          <div className="text-sm font-medium">No agents hired yet</div>
          <div className="text-xs text-muted-foreground mt-1">
            Your AI marketing team will appear here once agents are provisioned.
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activeAgents.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            latestRun={latestRunByAgent.get(agent.id)}
            isLive={liveRunAgentIds.has(agent.id)}
          />
        ))}
      </div>
    </div>
  );
}
