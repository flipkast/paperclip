import { useEffect, useState } from "react";
import { Link } from "@/lib/router";
import { useQuery } from "@tanstack/react-query";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { mediaAssetsApi, type MediaAsset } from "../api/mediaAssets";
import { Video, FileText, Image, Mail, Filter } from "lucide-react";
import { cn } from "../lib/utils";

const TYPE_TABS = [
  { key: "all", label: "All" },
  { key: "video", label: "Videos", icon: Video },
  { key: "image", label: "Images", icon: Image },
  { key: "copy", label: "Copy", icon: FileText },
  { key: "email", label: "Emails", icon: Mail },
];

const STATUS_COLORS: Record<string, string> = {
  draft: "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300",
  pending_review: "bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
  published: "bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300",
};

function AssetCard({ asset }: { asset: MediaAsset }) {
  return (
    <Link
      to={`/content/assets/${asset.id}`}
      className="rounded-xl border border-border bg-card overflow-hidden hover:border-foreground/20 transition-colors"
    >
      <div className="aspect-video bg-muted flex items-center justify-center text-muted-foreground">
        {asset.thumbnailUrl ? (
          <img src={asset.thumbnailUrl} alt={asset.title} className="w-full h-full object-cover" />
        ) : asset.type === "video" ? (
          <Video className="w-8 h-8" />
        ) : asset.type === "image" ? (
          <Image className="w-8 h-8" />
        ) : (
          <FileText className="w-8 h-8" />
        )}
      </div>
      <div className="p-3 space-y-2">
        <div className="text-sm font-medium truncate">{asset.title}</div>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">
            {asset.type} · {new Date(asset.createdAt).toLocaleDateString()}
          </span>
          <span
            className={cn(
              "text-xs px-2 py-0.5 rounded-full",
              STATUS_COLORS[asset.status] || STATUS_COLORS.draft,
            )}
          >
            {asset.status.replace(/_/g, " ")}
          </span>
        </div>
        {asset.platformTargets && asset.platformTargets.length > 0 && (
          <div className="flex gap-1">
            {asset.platformTargets.map((p) => (
              <span key={p} className="px-1.5 py-0.5 bg-muted rounded text-[10px] text-muted-foreground uppercase">
                {p}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}

export function ContentAssets() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [typeFilter, setTypeFilter] = useState("all");

  useEffect(() => {
    setBreadcrumbs([{ label: "Content" }, { label: "Assets" }]);
  }, [setBreadcrumbs]);

  const { data: assets, isLoading } = useQuery({
    queryKey: ["media-assets", selectedCompanyId, typeFilter],
    queryFn: () =>
      mediaAssetsApi.list(selectedCompanyId!, {
        type: typeFilter === "all" ? undefined : typeFilter,
      }),
    enabled: !!selectedCompanyId,
  });

  return (
    <div className="max-w-6xl mx-auto px-4 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Content library</h1>
          <p className="text-sm text-muted-foreground mt-1">
            All AI-generated content — videos, images, copy, and emails.
          </p>
        </div>
      </div>

      {/* Type tabs */}
      <div className="flex gap-1 border-b border-border">
        {TYPE_TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setTypeFilter(tab.key)}
            className={cn(
              "px-3 py-2 text-sm transition-colors border-b-2 -mb-px",
              typeFilter === tab.key
                ? "border-foreground text-foreground font-medium"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Grid */}
      {isLoading && (
        <div className="py-12 text-center text-sm text-muted-foreground">Loading assets...</div>
      )}

      {!isLoading && (!assets || assets.length === 0) && (
        <div className="py-12 text-center space-y-2">
          <div className="text-muted-foreground text-sm">
            No content yet. Your AI team is working on it.
          </div>
          <div className="text-xs text-muted-foreground">
            Content will appear here as your agents create videos, copy, and images.
          </div>
        </div>
      )}

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {assets?.map((asset) => (
          <AssetCard key={asset.id} asset={asset} />
        ))}
      </div>
    </div>
  );
}
