import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useCompany } from "../context/CompanyContext";
import { useBreadcrumbs } from "../context/BreadcrumbContext";
import { mediaAssetsApi, type MediaAsset } from "../api/mediaAssets";
import {
  CheckCircle,
  XCircle,
  MessageSquare,
  Video,
  FileText,
  Image,
  Mail,
  Clock,
  ChevronRight,
} from "lucide-react";
import { cn } from "../lib/utils";

function AssetTypeIcon({ type }: { type: string }) {
  const icons: Record<string, React.ReactNode> = {
    video: <Video className="w-5 h-5" />,
    image: <Image className="w-5 h-5" />,
    copy: <FileText className="w-5 h-5" />,
    script: <FileText className="w-5 h-5" />,
    email: <Mail className="w-5 h-5" />,
  };
  return <>{icons[type] || <FileText className="w-5 h-5" />}</>;
}

function AssetPreview({ asset }: { asset: MediaAsset }) {
  if (asset.type === "video" && asset.fileUrl) {
    return (
      <div className="rounded-lg overflow-hidden bg-black aspect-video">
        <video
          src={asset.fileUrl}
          controls
          className="w-full h-full object-contain"
          poster={asset.thumbnailUrl || undefined}
        />
      </div>
    );
  }

  if (asset.type === "image" && asset.fileUrl) {
    return (
      <div className="rounded-lg overflow-hidden bg-muted">
        <img src={asset.fileUrl} alt={asset.title} className="w-full object-contain max-h-96" />
      </div>
    );
  }

  if (asset.content) {
    return (
      <div className="rounded-lg border border-border bg-muted/30 p-4 max-h-96 overflow-y-auto">
        <pre className="whitespace-pre-wrap text-sm font-sans">{asset.content}</pre>
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-dashed border-border bg-muted/30 p-8 text-center text-muted-foreground">
      Preview not available
    </div>
  );
}

function ReviewPanel({
  asset,
  onClose,
}: {
  asset: MediaAsset;
  onClose: () => void;
}) {
  const { selectedCompanyId } = useCompany();
  const queryClient = useQueryClient();
  const [reviewNote, setReviewNote] = useState("");

  const updateMutation = useMutation({
    mutationFn: (status: string) =>
      mediaAssetsApi.updateStatus(selectedCompanyId!, asset.id, status, reviewNote || undefined),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["media-assets-pending"] });
      queryClient.invalidateQueries({ queryKey: ["media-assets"] });
      onClose();
    },
  });

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-4 py-3 border-b border-border">
        <h2 className="font-semibold text-sm">Review: {asset.title}</h2>
        <button onClick={onClose} className="text-muted-foreground hover:text-foreground text-sm">
          Close
        </button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        <AssetPreview asset={asset} />

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">Details</div>
          <div className="grid grid-cols-2 gap-2 text-sm">
            <div>
              <span className="text-muted-foreground">Type:</span> {asset.type}
            </div>
            <div>
              <span className="text-muted-foreground">Created:</span>{" "}
              {new Date(asset.createdAt).toLocaleDateString()}
            </div>
            {asset.metadata?.duration && (
              <div>
                <span className="text-muted-foreground">Duration:</span> {asset.metadata.duration}s
              </div>
            )}
            {asset.metadata?.model && (
              <div>
                <span className="text-muted-foreground">Model:</span> {asset.metadata.model}
              </div>
            )}
          </div>
          {asset.platformTargets && asset.platformTargets.length > 0 && (
            <div className="flex gap-1 flex-wrap">
              {asset.platformTargets.map((p) => (
                <span
                  key={p}
                  className="px-2 py-0.5 bg-muted rounded text-xs text-muted-foreground"
                >
                  {p}
                </span>
              ))}
            </div>
          )}
        </div>

        {asset.description && (
          <div className="space-y-1">
            <div className="text-xs text-muted-foreground uppercase tracking-wide">Prompt / Brief</div>
            <div className="text-sm text-muted-foreground">{asset.description}</div>
          </div>
        )}

        <div className="space-y-2">
          <div className="text-xs text-muted-foreground uppercase tracking-wide">
            <MessageSquare className="w-3 h-3 inline mr-1" />
            Feedback (optional)
          </div>
          <textarea
            value={reviewNote}
            onChange={(e) => setReviewNote(e.target.value)}
            placeholder="Add notes for the AI team..."
            className="w-full rounded-lg border border-border bg-background p-3 text-sm resize-none h-20 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      <div className="flex gap-3 p-4 border-t border-border">
        <button
          onClick={() => updateMutation.mutate("approved")}
          disabled={updateMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-green-600 text-white text-sm font-medium hover:bg-green-700 transition-colors disabled:opacity-50"
        >
          <CheckCircle className="w-4 h-4" />
          Approve
        </button>
        <button
          onClick={() => updateMutation.mutate("rejected")}
          disabled={updateMutation.isPending}
          className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-lg bg-red-600 text-white text-sm font-medium hover:bg-red-700 transition-colors disabled:opacity-50"
        >
          <XCircle className="w-4 h-4" />
          Reject
        </button>
      </div>
    </div>
  );
}

export function AssetReviewPage() {
  const { selectedCompanyId } = useCompany();
  const { setBreadcrumbs } = useBreadcrumbs();
  const [selectedAsset, setSelectedAsset] = useState<MediaAsset | null>(null);

  useEffect(() => {
    setBreadcrumbs([{ label: "Approvals" }]);
  }, [setBreadcrumbs]);

  const { data: pendingAssets, isLoading } = useQuery({
    queryKey: ["media-assets-pending", selectedCompanyId],
    queryFn: () => mediaAssetsApi.listPending(selectedCompanyId!),
    enabled: !!selectedCompanyId,
  });

  const { data: recentReviewed } = useQuery({
    queryKey: ["media-assets", selectedCompanyId, "reviewed"],
    queryFn: async () => {
      const all = await mediaAssetsApi.list(selectedCompanyId!);
      return all.filter((a) => a.status === "approved" || a.status === "rejected").slice(0, 10);
    },
    enabled: !!selectedCompanyId,
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20 text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className={cn("grid gap-6", selectedAsset ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1")}>
        {/* Asset list */}
        <div className="space-y-4">
          <div>
            <h1 className="text-lg font-semibold">Content approvals</h1>
            <p className="text-sm text-muted-foreground mt-1">
              Review and approve content before it goes live. {pendingAssets?.length || 0} items waiting.
            </p>
          </div>

          {/* Pending */}
          <div className="rounded-xl border border-border bg-card">
            <div className="px-4 py-3 border-b border-border">
              <h2 className="text-sm font-medium flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-500" />
                Pending review ({pendingAssets?.length || 0})
              </h2>
            </div>
            <div className="divide-y divide-border">
              {(!pendingAssets || pendingAssets.length === 0) && (
                <div className="px-4 py-8 text-center text-sm text-muted-foreground">
                  All caught up — no content waiting for your review.
                </div>
              )}
              {pendingAssets?.map((asset) => (
                <button
                  key={asset.id}
                  onClick={() => setSelectedAsset(asset)}
                  className={cn(
                    "w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left",
                    selectedAsset?.id === asset.id && "bg-muted/50",
                  )}
                >
                  <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center text-muted-foreground">
                    <AssetTypeIcon type={asset.type} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{asset.title}</div>
                    <div className="text-xs text-muted-foreground">
                      {asset.type} · {new Date(asset.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground" />
                </button>
              ))}
            </div>
          </div>

          {/* Recently reviewed */}
          {recentReviewed && recentReviewed.length > 0 && (
            <div className="rounded-xl border border-border bg-card">
              <div className="px-4 py-3 border-b border-border">
                <h2 className="text-sm font-medium text-muted-foreground">Recently reviewed</h2>
              </div>
              <div className="divide-y divide-border">
                {recentReviewed.map((asset) => (
                  <button
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-muted/50 transition-colors text-left"
                  >
                    <div className="w-8 h-8 rounded bg-muted flex items-center justify-center text-muted-foreground">
                      <AssetTypeIcon type={asset.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm truncate">{asset.title}</div>
                    </div>
                    <span
                      className={cn(
                        "text-xs px-2 py-0.5 rounded-full",
                        asset.status === "approved"
                          ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                          : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
                      )}
                    >
                      {asset.status}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Review panel */}
        {selectedAsset && (
          <div className="rounded-xl border border-border bg-card lg:sticky lg:top-4 lg:max-h-[calc(100vh-6rem)] overflow-hidden">
            <ReviewPanel asset={selectedAsset} onClose={() => setSelectedAsset(null)} />
          </div>
        )}
      </div>
    </div>
  );
}
