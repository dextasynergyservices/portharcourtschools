"use client";

import {
  AlertCircle,
  FolderOpen,
  Loader2,
  Trash2,
  UploadCloud,
} from "lucide-react";
import Image from "next/image";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import {
  checkR2StatusAction,
  createMediaRecordAction,
  getPresignedUploadUrlAction,
} from "@/app/(admin)/admin/media/actions";
import { MediaLibraryDrawer } from "@/components/admin/media/media-library-drawer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SectionImageUploadProps {
  label: string;
  description?: string;
  value?: string | null;
  altText?: string | null;
  onChange: (data: { url: string; altText: string }) => void;
  folder?: string;
  aspectRatio?: "video" | "square" | "banner";
  required?: boolean;
}

export function SectionImageUpload({
  label,
  description,
  value,
  altText,
  onChange,
  folder = "pages",
  aspectRatio = "video",
  required = false,
}: SectionImageUploadProps) {
  const [isR2Ready, setIsR2Ready] = useState<boolean | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [currentAlt, setCurrentAlt] = useState(altText || "");
  const [manualUrl, setManualUrl] = useState(value || "");
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    async function checkR2() {
      const res = await checkR2StatusAction();
      setIsR2Ready(res.configured);
    }
    checkR2();
  }, []);

  useEffect(() => {
    setCurrentAlt(altText || "");
    setManualUrl(value || "");
  }, [value, altText]);

  const aspectClass =
    aspectRatio === "square"
      ? "aspect-square"
      : aspectRatio === "banner"
        ? "aspect-[21/9]"
        : "aspect-video";

  async function handleFileSelected(file: File) {
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file (JPG, PNG, WebP).");
      return;
    }

    // Limit to 10MB
    if (file.size > 10 * 1024 * 1024) {
      setErrorMessage("Image size must be under 10MB.");
      return;
    }

    setErrorMessage(null);
    setIsUploading(true);
    setUploadProgress(10);

    try {
      // 1. Get Presigned PUT URL for Cloudflare R2
      const presignedRes = await getPresignedUploadUrlAction({
        filename: file.name,
        mimeType: file.type,
        folder,
      });

      if (!presignedRes.success) {
        setErrorMessage(
          presignedRes.error || "Failed to initiate secure upload.",
        );
        setIsUploading(false);
        return;
      }

      setUploadProgress(40);

      // 2. Direct browser-to-Cloudflare R2 PUT upload
      const uploadRes = await fetch(presignedRes.uploadUrl, {
        method: "PUT",
        body: file,
        headers: {
          "Content-Type": file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error(
          `Upload to Cloudflare R2 failed: ${uploadRes.statusText}`,
        );
      }

      setUploadProgress(80);

      // 3. Save metadata record into database
      const initialAlt =
        currentAlt.trim() ||
        file.name.replace(/\.[^/.]+$/, "").replace(/[-_]/g, " ");
      await createMediaRecordAction({
        url: presignedRes.fileUrl,
        filename: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
        altText: initialAlt,
      });

      setUploadProgress(100);
      setCurrentAlt(initialAlt);
      onChange({
        url: presignedRes.fileUrl,
        altText: initialAlt,
      });
      toast.success("Image uploaded successfully!");
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : "An unexpected error occurred.";
      setErrorMessage(msg);
      toast.error("Upload failed", {
        description: msg,
      });
    } finally {
      setIsUploading(false);
      setUploadProgress(0);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  }

  function handleAltChange(newAlt: string) {
    setCurrentAlt(newAlt);
    if (value) {
      onChange({ url: value, altText: newAlt });
    }
  }

  function handleManualUrlChange(newUrl: string) {
    setManualUrl(newUrl);
    onChange({ url: newUrl, altText: currentAlt });
  }

  function handleRemove() {
    onChange({ url: "", altText: "" });
    setCurrentAlt("");
    setManualUrl("");
    toast.info("Image removed");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }

  return (
    <div className="space-y-3 rounded-lg border border-border bg-card p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <Label className="text-sm font-semibold text-foreground flex items-center gap-1">
            {label}
            {required && <span className="text-destructive">*</span>}
          </Label>
          {description && (
            <p className="text-xs text-muted-foreground mt-0.5">
              {description}
            </p>
          )}
        </div>

        {/* Choose from Library Button */}
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={() => setIsDrawerOpen(true)}
          className="h-8 gap-1.5 text-xs"
        >
          <FolderOpen className="size-3.5" />
          Choose from Library
        </Button>
      </div>

      {/* R2 Not Configured Notice (Graceful non-blocking fallback) */}
      {isR2Ready === false && (
        <div className="rounded-md border border-amber-500/30 bg-amber-500/10 p-3 text-xs text-amber-900 dark:text-amber-200">
          <div className="flex items-start gap-2">
            <AlertCircle className="size-4 shrink-0 text-amber-600 dark:text-amber-400 mt-0.5" />
            <div className="space-y-1">
              <p className="font-semibold">
                Cloudflare R2 Direct Uploads Not Configured
              </p>
              <p className="text-muted-foreground">
                Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, and
                R2_BUCKET_NAME in your environment to enable drag-and-drop
                uploads. You can still enter an image URL manually below.
              </p>
            </div>
          </div>
          <div className="mt-2.5">
            <Label className="text-[11px] font-medium text-foreground">
              Direct Image URL
            </Label>
            <Input
              placeholder="https://..."
              value={manualUrl}
              onChange={(e) => handleManualUrlChange(e.target.value)}
              className="mt-1 h-8 text-xs bg-background"
            />
          </div>
        </div>
      )}

      {/* Main Dropzone / Preview Area */}
      {value ? (
        <div className="space-y-3">
          <div
            className={`relative ${aspectClass} w-full overflow-hidden rounded-md border border-border bg-muted/40`}
          >
            <Image
              src={value}
              alt={currentAlt || "Section preview"}
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/60 backdrop-blur-xs p-1 rounded-md">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={isR2Ready === false}
                className="text-xs px-2 py-1 bg-white/90 text-neutral-900 hover:bg-white rounded font-medium transition-colors disabled:opacity-50"
              >
                Replace
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 text-white hover:text-destructive transition-colors rounded"
                title="Remove image"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Required Alt Text */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-xs font-medium text-foreground flex items-center gap-1">
                Image Alt Text
                <span className="text-destructive">*</span>
              </Label>
              <span className="text-[10px] text-muted-foreground">
                Crucial for accessibility & SEO
              </span>
            </div>
            <Input
              placeholder="Describe this image for screen readers (e.g. Students in biology lab)..."
              value={currentAlt}
              onChange={(e) => handleAltChange(e.target.value)}
              className="h-8 text-xs"
            />
          </div>
        </div>
      ) : (
        <button
          type="button"
          aria-label="Upload an image"
          onDragOver={(e) => {
            e.preventDefault();
            e.stopPropagation();
          }}
          onDrop={(e) => {
            e.preventDefault();
            e.stopPropagation();
            if (isR2Ready === false) return;
            const file = e.dataTransfer.files?.[0];
            if (file) handleFileSelected(file);
          }}
          onClick={() => {
            if (isR2Ready !== false && !isUploading) {
              fileInputRef.current?.click();
            }
          }}
          className={`relative ${aspectClass} w-full flex flex-col items-center justify-center rounded-md border-2 border-dashed border-border p-6 text-center transition-colors ${
            isR2Ready === false
              ? "opacity-60 cursor-not-allowed bg-muted/10"
              : "cursor-pointer hover:border-primary/50 hover:bg-primary/5"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2">
              <Loader2 className="size-7 animate-spin text-primary" />
              <p className="text-xs font-medium text-foreground">
                Uploading directly to Cloudflare R2...
              </p>
              <div className="w-32 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground">
              <div className="size-10 rounded-full bg-muted flex items-center justify-center text-foreground">
                <UploadCloud className="size-5" />
              </div>
              <div>
                <p className="text-xs font-semibold text-foreground">
                  Drag and drop an image, or click to browse
                </p>
                <p className="text-[11px] text-muted-foreground mt-0.5">
                  Direct to Cloudflare R2 · JPG, PNG, WebP up to 10MB
                </p>
              </div>
            </div>
          )}
        </button>
      )}

      {errorMessage && (
        <p className="text-xs text-destructive font-medium flex items-center gap-1 mt-1">
          <AlertCircle className="size-3.5 shrink-0" />
          {errorMessage}
        </p>
      )}

      {/* Hidden native file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleFileSelected(file);
        }}
      />

      {/* Media Library Drawer */}
      <MediaLibraryDrawer
        open={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        currentUrl={value}
        onSelect={(selected) => {
          onChange({
            url: selected.url,
            altText: selected.altText || currentAlt,
          });
          setCurrentAlt(selected.altText || currentAlt);
          toast.success("Asset selected from Media Library");
        }}
      />
    </div>
  );
}
