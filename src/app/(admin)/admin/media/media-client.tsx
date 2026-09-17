"use client";

import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  Edit2,
  ExternalLink,
  ImageIcon,
  Loader2,
  Search,
  Trash2,
} from "lucide-react";
import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";
import {
  deleteMediaAction,
  updateMediaAltTextAction,
} from "@/app/(admin)/admin/media/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { SectionImageUpload } from "@/components/admin/media/section-image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { MediaItem } from "@/lib/db/schema";

interface MediaClientProps {
  initialItems: MediaItem[];
  isR2Configured: boolean;
}

export function MediaClient({
  initialItems,
  isR2Configured,
}: MediaClientProps) {
  const [items, setItems] = useState<MediaItem[]>(initialItems);
  const [search, setSearch] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<MediaItem | null>(null);
  const [newAltText, setNewAltText] = useState("");
  const [isSavingAlt, setIsSavingAlt] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [assetToDelete, setAssetToDelete] = useState<MediaItem | null>(null);

  const filteredItems = items.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      item.filename.toLowerCase().includes(q) ||
      Boolean(item.altText?.toLowerCase().includes(q))
    );
  });

  function formatBytes(bytes: number): string {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return `${Number.parseFloat((bytes / k ** i).toFixed(1))} ${sizes[i]}`;
  }

  async function handleCopyUrl(url: string, id: string) {
    await navigator.clipboard.writeText(url);
    setCopiedId(id);
    toast.success("Public CDN URL copied to clipboard");
    setTimeout(() => setCopiedId(null), 2000);
  }

  function handleOpenEditAlt(item: MediaItem) {
    setEditingItem(item);
    setNewAltText(item.altText || "");
  }

  async function handleSaveAlt() {
    if (!editingItem) return;
    setIsSavingAlt(true);
    try {
      const res = await updateMediaAltTextAction(editingItem.id, newAltText);
      if (res.success) {
        setItems((prev) =>
          prev.map((i) =>
            i.id === editingItem.id ? { ...i, altText: newAltText } : i,
          ),
        );
        setEditingItem(null);
        toast.success("Alt-text updated successfully");
      } else {
        toast.error("Failed to update alt-text", {
          description: res.error,
        });
      }
    } finally {
      setIsSavingAlt(false);
    }
  }

  function handleDelete(id: string) {
    const item = items.find((i) => i.id === id);
    if (item) {
      setAssetToDelete(item);
    }
  }

  async function handleConfirmDelete() {
    if (!assetToDelete) return;
    const id = assetToDelete.id;
    setDeletingId(id);
    try {
      const res = await deleteMediaAction(id);
      if (res.success) {
        setItems((prev) => prev.filter((i) => i.id !== id));
        toast.success("Media asset deleted");
        setAssetToDelete(null);
      } else {
        toast.error("Failed to delete media", {
          description: res.error,
        });
      }
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <div className="space-y-6">
      {/* Header & Status */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Media Library
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Central repository for all Cloudflare R2 assets, event photos, and
            campus imagery.
          </p>
        </div>

        <div className="flex items-center gap-2">
          {isR2Configured ? (
            <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 gap-1.5 py-1 px-2.5">
              <CheckCircle2 className="size-3.5" />
              Cloudflare R2 Active
            </Badge>
          ) : (
            <Badge className="bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20 gap-1.5 py-1 px-2.5">
              <AlertCircle className="size-3.5" />
              R2 Unset (Setup Required)
            </Badge>
          )}
        </div>
      </div>

      {/* Quick Upload Box */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs">
        <h2 className="text-sm font-semibold text-foreground mb-1">
          Upload New Media Asset
        </h2>
        <p className="text-xs text-muted-foreground mb-4">
          Files are transferred directly to Cloudflare R2 with automatic CDN
          indexing. Alt-text is required for all uploads.
        </p>
        <SectionImageUpload
          label="Drop an asset here to upload"
          folder="library"
          onChange={({ url, altText }) => {
            if (url) {
              // Add to local state
              const newAsset: MediaItem = {
                id: crypto.randomUUID(),
                url,
                filename: url.split("/").pop() || "upload.jpg",
                mimeType: "image/jpeg",
                sizeBytes: 1024 * 200,
                altText,
                uploadedBy: null,
                createdAt: new Date(),
              };
              setItems((prev) => [newAsset, ...prev]);
            }
          }}
        />
      </div>

      {/* Search Bar & Count */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
          <Input
            placeholder="Search assets by filename or alt-text..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9 h-10"
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Showing{" "}
          <strong className="text-foreground">{filteredItems.length}</strong> of{" "}
          {items.length} assets
        </p>
      </div>

      {/* Assets Grid */}
      {filteredItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 rounded-xl border border-dashed border-border bg-card/50 text-center">
          <div className="size-12 rounded-full bg-muted flex items-center justify-center mb-3">
            <ImageIcon className="size-6 text-muted-foreground" />
          </div>
          <h3 className="text-sm font-semibold text-foreground">
            No assets found
          </h3>
          <p className="text-xs text-muted-foreground max-w-sm mt-1">
            {search
              ? "No media matched your search query. Try another keyword."
              : "Drag and drop an image into the upload box above to populate the library."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredItems.map((item) => (
            <div
              key={item.id}
              className="group relative flex flex-col rounded-xl border border-border bg-card overflow-hidden shadow-xs hover:border-primary/40 transition-colors"
            >
              <div className="relative aspect-video w-full bg-muted/40 overflow-hidden">
                <Image
                  src={item.url}
                  alt={item.altText || item.filename}
                  fill
                  unoptimized
                  className="object-cover group-hover:scale-105 transition-transform duration-300"
                />
              </div>

              <div className="p-3 flex-1 flex flex-col justify-between gap-2">
                <div>
                  <p
                    className="text-xs font-semibold text-foreground truncate"
                    title={item.filename}
                  >
                    {item.filename}
                  </p>
                  <p
                    className="text-[11px] text-muted-foreground mt-0.5 line-clamp-2"
                    title={item.altText || "No alt text"}
                  >
                    {item.altText ? (
                      item.altText
                    ) : (
                      <span className="italic text-amber-500">
                        Missing alt text
                      </span>
                    )}
                  </p>
                </div>

                <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-2 border-t border-border/50">
                  <span>{formatBytes(item.sizeBytes)}</span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => handleCopyUrl(item.url, item.id)}
                      className="p-1 hover:text-foreground transition-colors rounded"
                      title="Copy Public URL"
                    >
                      {copiedId === item.id ? (
                        <Check className="size-3.5 text-emerald-500" />
                      ) : (
                        <Copy className="size-3.5" />
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => handleOpenEditAlt(item)}
                      className="p-1 hover:text-foreground transition-colors rounded"
                      title="Edit Alt Text"
                    >
                      <Edit2 className="size-3.5" />
                    </button>
                    <a
                      href={item.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-1 hover:text-foreground transition-colors rounded"
                      title="Open full image"
                    >
                      <ExternalLink className="size-3.5" />
                    </a>
                    <button
                      type="button"
                      disabled={deletingId === item.id}
                      onClick={() => handleDelete(item.id)}
                      className="p-1 text-destructive/70 hover:text-destructive transition-colors rounded disabled:opacity-50"
                      title="Delete asset"
                    >
                      {deletingId === item.id ? (
                        <Loader2 className="size-3.5 animate-spin" />
                      ) : (
                        <Trash2 className="size-3.5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Edit Alt Text Dialog */}
      <Dialog
        open={Boolean(editingItem)}
        onOpenChange={(open) => !open && setEditingItem(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Image Alt Text</DialogTitle>
            <DialogDescription>
              Alt text ensures accessibility for screen readers and improves SEO
              visibility for Port Harcourt Schools.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="altText">Descriptive Alt Text</Label>
            <Input
              id="altText"
              value={newAltText}
              onChange={(e) => setNewAltText(e.target.value)}
              placeholder="e.g. Science students conducting chemistry experiment..."
            />
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingItem(null)}
              disabled={isSavingAlt}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveAlt} disabled={isSavingAlt}>
              {isSavingAlt && (
                <Loader2 className="size-3.5 animate-spin mr-1.5" />
              )}
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={Boolean(assetToDelete)}
        onOpenChange={(open) => !open && setAssetToDelete(null)}
        title="Delete Media Asset"
        description="Are you sure you want to permanently delete this media asset? Any pages or components referencing this image URL will no longer be able to display it."
        variant="destructive"
        confirmLabel="Delete Asset"
        isLoading={Boolean(deletingId)}
        onConfirm={handleConfirmDelete}
      />
    </div>
  );
}
