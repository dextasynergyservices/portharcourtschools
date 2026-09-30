"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  Globe,
  GraduationCap,
  Loader2,
  Save,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { SectionImageUpload } from "@/components/admin/media/section-image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  checkProgrammeSlugAvailabilityAction,
  createProgrammeAction,
  updateProgrammeAction,
} from "./actions";

interface ProgrammeFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    provider: string;
    category?: string | null;
    isAccredited: boolean;
    coverImage?: string | null;
    status: "draft" | "published" | "archived";
  };
  userRole: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ProgrammeForm({ initialData, userRole }: ProgrammeFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isCustomSlug, setIsCustomSlug] = useState(!!initialData);
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [provider, setProvider] = useState(initialData?.provider || "GeePhill");
  const [category, setCategory] = useState(initialData?.category || "");
  const [isAccredited, setIsAccredited] = useState(
    initialData?.isAccredited || false,
  );
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [status] = useState<"draft" | "published" | "archived">(
    initialData?.status || "draft",
  );

  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    if (isEditing && slug === initialData?.slug) {
      setSlugAvailable(true);
      return;
    }

    setSlugChecking(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await checkProgrammeSlugAvailabilityAction(
          slug,
          initialData?.id,
        );
        setSlugAvailable(res.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [slug, initialData?.id, initialData?.slug, isEditing]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isCustomSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = (targetStatus: "draft" | "published" | "archived") => {
    setError(null);

    if (slugAvailable === false) {
      setError("Please choose a unique URL slug before saving.");
      return;
    }

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug || slugify(title));
    formData.set("description", description);
    formData.set("provider", provider);
    formData.set("category", category);
    formData.set("isAccredited", isAccredited ? "true" : "false");
    formData.set("coverImage", coverImage);
    formData.set("status", targetStatus);

    startTransition(async () => {
      const action = isEditing
        ? updateProgrammeAction(initialData.id, {}, formData)
        : createProgrammeAction({}, formData);

      const res = await action;

      if (res?.error) {
        setError(res.error);
      } else {
        router.push("/admin/programmes");
        router.refresh();
      }
    });
  };

  const isCreator = userRole === "creator";

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/programmes">
            <Button
              variant="outline"
              size="sm"
              className="size-9 p-0 border-[#D9DEEC] text-[#184098]"
            >
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#151B2E]">
              {isEditing ? "Edit Programme" : "Create New Programme"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? `Updating: ${initialData.title}`
                : "Add an accredited training or professional development programme."}
            </p>
          </div>
        </div>
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-[#D9DEEC] bg-white p-6 space-y-5 rounded-lg">
            {/* Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="prog-title"
                className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
              >
                Programme Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="prog-title"
                placeholder="e.g. TRCN-Accredited CPD Sessions"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="h-11 border-[#D9DEEC] text-base font-bold text-[#151B2E] focus-visible:ring-[#184098]"
              />
            </div>

            {/* Editable Slug */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="prog-slug"
                  className="block text-xs font-semibold text-muted-foreground"
                >
                  Slug: {slug || "..."}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomSlug(!isCustomSlug)}
                  className="text-[11px] text-[#184098] font-semibold hover:underline"
                >
                  {isCustomSlug ? "Auto-generate" : "Customize Slug"}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="prog-slug"
                  placeholder="programme-slug"
                  value={slug}
                  onChange={(e) => {
                    setIsCustomSlug(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className="h-9 font-mono text-xs border-[#D9DEEC] pr-28"
                />

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-[11px]">
                  {slugChecking ? (
                    <span className="text-muted-foreground flex items-center gap-1 font-medium">
                      <Loader2 className="size-3 animate-spin" /> Checking
                    </span>
                  ) : slugAvailable === true ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="size-3.5" /> Available
                    </span>
                  ) : slugAvailable === false ? (
                    <span className="text-red-600 flex items-center gap-1 font-semibold">
                      <XCircle className="size-3.5" /> Taken
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="prog-desc"
                className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
              >
                Description <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="prog-desc"
                rows={4}
                placeholder="Outline programme objectives, curriculum coverage, who should attend, and outcomes..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-[#D9DEEC] text-sm text-[#151B2E] focus-visible:ring-[#184098]"
              />
            </div>

            {/* Provider & Category */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="prog-provider"
                  className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
                >
                  Delivery Partner / Provider
                </label>
                <Input
                  id="prog-provider"
                  placeholder="GeePhill"
                  value={provider}
                  onChange={(e) => setProvider(e.target.value)}
                  className="h-10 border-[#D9DEEC] text-xs font-medium"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="prog-cat"
                  className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
                >
                  Category
                </label>
                <Input
                  id="prog-cat"
                  placeholder="e.g. Teacher Professional Development"
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="h-10 border-[#D9DEEC] text-xs font-medium"
                />
              </div>
            </div>

            {/* Accreditation Toggle */}
            <div className="flex items-center justify-between rounded-lg border border-[#D9DEEC] bg-[#FAFBFF] p-4">
              <div className="flex items-center gap-2.5">
                <GraduationCap className="size-5 text-[#184098]" />
                <div>
                  <h4 className="font-heading text-xs font-bold text-[#151B2E]">
                    Official Accreditation
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Is this programme officially accredited (e.g. TRCN
                    certified)?
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsAccredited(!isAccredited)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                  isAccredited ? "bg-[#184098]" : "bg-[#D9DEEC]"
                }`}
                role="switch"
                aria-checked={isAccredited}
              >
                <span
                  className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                    isAccredited ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
            </div>
          </Card>
        </div>

        {/* Sidebar (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <Card className="border-[#D9DEEC] bg-white p-5 rounded-lg space-y-4 shadow-xs">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#151B2E] border-b border-[#D9DEEC] pb-2">
              Publishing Controls
            </CardTitle>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current Status:</span>
              <Badge
                variant={status === "published" ? "success" : "outline"}
                className="text-[10px] uppercase font-bold"
              >
                {status}
              </Badge>
            </div>

            <div className="space-y-2 pt-2">
              {isCreator ? (
                <Button
                  type="button"
                  disabled={isPending || !title}
                  onClick={() => handleSubmit("draft")}
                  variant="outline"
                  className="w-full justify-center text-xs h-9 border-[#D9DEEC]"
                >
                  <Save className="size-3.5 mr-1" />
                  Save as Draft
                </Button>
              ) : (
                <>
                  <Button
                    type="button"
                    disabled={isPending || !title}
                    onClick={() => handleSubmit("published")}
                    className="w-full justify-center text-xs h-10 bg-[#184098] hover:bg-[#08276B] text-white font-bold"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin mr-1" />
                    ) : (
                      <Globe className="size-4 mr-1.5" />
                    )}
                    {isEditing && status === "published"
                      ? "Update Programme"
                      : "Publish Programme"}
                  </Button>

                  <Button
                    type="button"
                    disabled={isPending || !title}
                    onClick={() => handleSubmit("draft")}
                    variant="outline"
                    className="w-full justify-center text-xs h-9 border-[#D9DEEC]"
                  >
                    <Save className="size-3.5 mr-1" />
                    Save as Draft
                  </Button>
                </>
              )}
            </div>
          </Card>

          {/* Media */}
          <Card className="border-[#D9DEEC] bg-white p-5 rounded-lg space-y-4 shadow-xs">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#151B2E] border-b border-[#D9DEEC] pb-2">
              Cover Media
            </CardTitle>

            <SectionImageUpload
              label="Programme Cover Image"
              description="Upload an image from your device or pick one from the media gallery."
              value={coverImage}
              folder="programmes"
              aspectRatio="video"
              onChange={({ url }) => setCoverImage(url)}
            />
          </Card>
        </div>
      </div>
    </div>
  );
}
