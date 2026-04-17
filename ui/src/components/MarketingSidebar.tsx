import {
  Bot,
  LayoutDashboard,
  Video,
  Calendar,
  FolderOpen,
  Search,
  Eye,
  FileText,
  BarChart3,
  TrendingUp,
  Target,
  CheckSquare,
  Palette,
  Users,
  Link2,
  CreditCard,
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { SidebarSection } from "./SidebarSection";
import { SidebarNavItem } from "./SidebarNavItem";
import { useCompany } from "../context/CompanyContext";
import { mediaAssetsApi } from "../api/mediaAssets";
import { Button } from "@/components/ui/button";

export function MarketingSidebar() {
  const { selectedCompanyId, selectedCompany } = useCompany();

  const { data: pendingAssets } = useQuery({
    queryKey: ["media-assets-pending", selectedCompanyId],
    queryFn: () => mediaAssetsApi.listPending(selectedCompanyId!),
    enabled: !!selectedCompanyId,
    refetchInterval: 30_000,
  });

  const pendingCount = pendingAssets?.length ?? 0;

  function openSearch() {
    document.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  }

  return (
    <aside className="w-60 h-full min-h-0 border-r border-border bg-background flex flex-col">
      <div className="flex items-center gap-2 px-3 h-12 shrink-0">
        {selectedCompany?.brandColor && (
          <div
            className="w-4 h-4 rounded-sm shrink-0"
            style={{ backgroundColor: selectedCompany.brandColor }}
          />
        )}
        <span className="flex-1 text-sm font-bold text-foreground truncate">
          {selectedCompany?.name ?? "My Brand"}
        </span>
        <Button
          variant="ghost"
          size="icon-sm"
          className="text-muted-foreground shrink-0"
          onClick={openSearch}
        >
          <Search className="h-4 w-4" />
        </Button>
      </div>

      <nav className="flex-1 min-h-0 overflow-y-auto scrollbar-auto-hide flex flex-col gap-4 px-3 py-2">
        <div className="flex flex-col gap-0.5">
          <SidebarNavItem to="dashboard" label="Dashboard" icon={LayoutDashboard} />
          <SidebarNavItem to="ai-team" label="AI Team" icon={Bot} />
          <SidebarNavItem
            to="approvals"
            label="Approvals"
            icon={CheckSquare}
            badge={pendingCount}
          />
        </div>

        <SidebarSection label="Content">
          <SidebarNavItem to="content-calendar" label="Calendar" icon={Calendar} />
          <SidebarNavItem to="content-assets" label="Assets" icon={FolderOpen} />
          <SidebarNavItem to="content-create" label="Create" icon={Video} />
        </SidebarSection>

        <SidebarSection label="Intelligence">
          <SidebarNavItem to="competitors" label="Competitors" icon={Eye} />
          <SidebarNavItem to="competitor-reports" label="Reports" icon={FileText} />
        </SidebarSection>

        <SidebarSection label="Campaigns">
          <SidebarNavItem to="campaigns-active" label="Active" icon={Target} />
          <SidebarNavItem to="campaigns-performance" label="Performance" icon={TrendingUp} />
        </SidebarSection>

        <SidebarSection label="Analytics">
          <SidebarNavItem to="analytics" label="Overview" icon={BarChart3} />
        </SidebarSection>

        <SidebarSection label="Settings">
          <SidebarNavItem to="settings-brand" label="Brand" icon={Palette} />
          <SidebarNavItem to="settings-competitors" label="Competitors" icon={Users} />
          <SidebarNavItem to="settings-integrations" label="Integrations" icon={Link2} />
          <SidebarNavItem to="settings-billing" label="Billing" icon={CreditCard} />
        </SidebarSection>
      </nav>
    </aside>
  );
}
