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
    <div className="space-y-3 rounded-lg border border-[#D9DEEC] bg-[#F8FAFC] p-3.5">
      {/* Header with Title and Media Library Action */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs font-bold text-[#151B2E] flex items-center gap-1.5">
            <span>{label}</span>
            {required && <span className="text-red-500 text-xs">*</span>}
          </Label>

          {/* Choose from Media Library Button */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsDrawerOpen(true)}
            className="h-7 px-2.5 text-[11px] font-semibold border-[#D9DEEC] text-[#184098] bg-white hover:bg-[#EEF2FA] shrink-0 gap-1.5 shadow-2xs"
          >
            <FolderOpen className="size-3.5 text-[#184098]" />
            <span>Media Library</span>
          </Button>
        </div>

        {description && (
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {/* R2 Not Configured Notice (Clean non-blocking fallback with manual URL) */}
      {isR2Ready === false && (
        <div className="rounded-md border border-[#D9DEEC] bg-white p-2.5 space-y-1.5 text-xs shadow-2xs">
          <div className="flex items-center justify-between text-[11px]">
            <span className="font-bold text-[#151B2E]">
              Or enter Image URL:
            </span>
            <span className="text-[10px] text-muted-foreground">
              External or static path
            </span>
          </div>
          <Input
            placeholder="https://... or /images/..."
            value={manualUrl}
            onChange={(e) => handleManualUrlChange(e.target.value)}
            className="h-8 text-xs border-[#D9DEEC] bg-[#FAFBFF] focus:bg-white"
          />
        </div>
      )}

      {/* Main Dropzone / Preview Area */}
      {value ? (
        <div className="space-y-2.5">
          <div
            className={`relative ${aspectClass} w-full overflow-hidden rounded-md border border-[#D9DEEC] bg-white shadow-2xs`}
          >
            <Image
              src={value}
              alt={currentAlt || "Cover preview"}
              fill
              unoptimized
              className="object-cover"
            />
            <div className="absolute top-2 right-2 flex items-center gap-1.5 bg-black/65 backdrop-blur-xs p-1 rounded-md shadow-sm">
              <button
                type="button"
                onClick={() => setIsDrawerOpen(true)}
                className="text-[11px] px-2 py-0.5 bg-white text-neutral-900 hover:bg-neutral-100 rounded font-bold transition-colors shadow-2xs"
              >
                Change
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="p-1 text-white hover:text-red-400 transition-colors rounded"
                title="Remove image"
              >
                <Trash2 className="size-3.5" />
              </button>
            </div>
          </div>

          {/* Alt Text Input */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <Label className="text-[11px] font-bold text-[#151B2E]">
                Image Alt Text
              </Label>
              <span className="text-[10px] text-muted-foreground">
                For accessibility &amp; SEO
              </span>
            </div>
            <Input
              placeholder="Short description of this image..."
              value={currentAlt}
              onChange={(e) => handleAltChange(e.target.value)}
              className="h-8 text-xs border-[#D9DEEC] bg-white"
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
          className={`relative ${aspectClass} w-full flex flex-col items-center justify-center rounded-lg border-2 border-dashed p-4 text-center transition-all ${
            isR2Ready === false
              ? "border-[#D9DEEC] bg-white cursor-pointer hover:border-[#184098]/50"
              : "border-[#D9DEEC] bg-white hover:border-[#184098] hover:bg-[#EEF2FA]/20 cursor-pointer shadow-2xs"
          }`}
        >
          {isUploading ? (
            <div className="flex flex-col items-center gap-2 px-4">
              <Loader2 className="size-6 animate-spin text-[#184098]" />
              <p className="text-xs font-bold text-[#151B2E]">
                Uploading directly to Cloudflare R2...
              </p>
              <div className="w-36 h-1.5 bg-[#EEF2FA] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#184098] transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-2 text-muted-foreground px-2">
              <div className="size-9 rounded-full bg-[#EEF2FA] border border-[#D9DEEC] flex items-center justify-center text-[#184098]">
                <UploadCloud className="size-4.5" />
              </div>
              <div>
                <p className="text-xs font-bold text-[#151B2E]">
                  Drag &amp; drop, or{" "}
                  <span className="text-[#184098] underline underline-offset-2">
                    browse file
                  </span>
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5">
                  16:9 Master · JPG, PNG, WebP up to 10MB
                </p>
              </div>
            </div>
          )}
        </button>
      )}

      {errorMessage && (
        <p className="text-xs text-red-600 font-medium flex items-center gap-1 mt-1">
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
