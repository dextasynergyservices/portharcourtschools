"use client";

import { Check, FolderOpen, ImageIcon, Loader2, Search } from "lucide-react";
import Image from "next/image";
import { useCallback, useEffect, useState } from "react";
import { getMediaListAction } from "@/app/(admin)/admin/media/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import type { MediaItem } from "@/lib/db/schema";
import { normalizeImageUrl } from "@/lib/utils";

interface MediaLibraryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSelect: (media: { url: string; altText: string }) => void;
  currentUrl?: string | null;
}

export function MediaLibraryDrawer({
  open,
  onOpenChange,
  onSelect,
  currentUrl,
}: MediaLibraryDrawerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [selectedItem, setSelectedItem] = useState<MediaItem | null>(null);

  const loadMedia = useCallback(async (query?: string) => {
    setLoading(true);
    try {
      const res = await getMediaListAction({ search: query, limit: 40 });
      if (res.success && res.items) {
        setItems(res.items);
      }
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (open) {
      loadMedia();
    }
  }, [open, loadMedia]);

  function handleSearchSubmit(e: React.FormEvent) {
    e.preventDefault();
    loadMedia(search);
  }

  function handleConfirm() {
    if (selectedItem) {
      onSelect({
        url: selectedItem.url,
        altText: selectedItem.altText || "",
      });
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl h-[85vh] flex flex-col p-6 overflow-hidden">
        <DialogHeader className="shrink-0 pb-4 border-b border-border">
          <DialogTitle className="flex items-center gap-2 text-xl font-bold">
            <FolderOpen className="size-5 text-primary" />
            Select from Media Library
          </DialogTitle>
          <DialogDescription>
            Choose an existing image uploaded to Cloudflare R2 across any
            section or page.
          </DialogDescription>

          <form
            onSubmit={handleSearchSubmit}
            className="flex items-center gap-2 mt-3"
          >
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
              <Input
                placeholder="Search by filename or alt-text..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-9 h-10"
              />
            </div>
            <Button
              type="submit"
              variant="outline"
              disabled={loading}
              className="h-10"
            >
              Search
            </Button>
          </form>
        </DialogHeader>

        {/* Media Grid */}
        <div className="flex-1 overflow-y-auto py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-64 gap-2 text-muted-foreground">
              <Loader2 className="size-6 animate-spin text-primary" />
              <p className="text-sm">Loading media assets...</p>
            </div>
          ) : items.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 gap-3 text-muted-foreground">
              <ImageIcon className="size-10 text-muted-foreground/50" />
              <p className="text-sm font-medium">No media assets found</p>
              <p className="text-xs max-w-sm text-center">
                Upload new images directly in the section editor to populate
                your library.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
              {items.map((item) => {
                const isSelected =
                  selectedItem?.id === item.id ||
                  (!selectedItem && currentUrl === item.url);
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setSelectedItem(item)}
                    className={`group relative flex flex-col rounded-lg border text-left overflow-hidden transition-all focus:outline-none ${
                      isSelected
                        ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                        : "border-border hover:border-foreground/30 bg-card"
                    }`}
                  >
                    <div className="relative aspect-video w-full bg-muted/40 overflow-hidden">
                      <Image
                        src={normalizeImageUrl(item.url)}
                        alt={item.altText || item.filename}
                        fill
                        unoptimized
                        className="object-cover group-hover:scale-105 transition-transform duration-200"
                      />
                      {isSelected && (
                        <div className="absolute top-2 right-2 size-6 rounded-full bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                          <Check className="size-3.5" />
                        </div>
                      )}
                    </div>
                    <div className="p-2 flex flex-col gap-0.5">
                      <p className="text-xs font-medium truncate text-foreground">
                        {item.filename}
                      </p>
                      <p className="text-[11px] text-muted-foreground truncate">
                        {item.altText || "No alt text"}
                      </p>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="shrink-0 pt-4 border-t border-border flex items-center justify-between">
          <div className="text-xs text-muted-foreground">
            {selectedItem ? (
              <span>
                Selected:{" "}
                <strong className="text-foreground">
                  {selectedItem.filename}
                </strong>
              </span>
            ) : (
              <span>Select an image from the library</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              disabled={!selectedItem}
              onClick={handleConfirm}
            >
              Apply Image
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
