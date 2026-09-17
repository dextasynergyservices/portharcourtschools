"use client";

import {
  ArrowLeft,
  Check,
  ExternalLink,
  Info,
  Loader2,
  RefreshCw,
  Save,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { toast } from "sonner";
import {
  resetPageToDefaultsAction,
  savePageContentAction,
} from "@/app/(admin)/admin/pages/actions";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { SectionImageUpload } from "@/components/admin/media/section-image-upload";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { PageConfig } from "@/lib/cms-defaults";

interface PageEditorProps {
  config: PageConfig;
  initialData: {
    title: string;
    sections: Record<string, Record<string, string | undefined>>;
    seoMeta: {
      title?: string;
      description?: string;
      ogImage?: string;
    };
  };
}

export function PageEditor({ config, initialData }: PageEditorProps) {
  const [activeTab, setActiveTab] = useState<"sections" | "seo">("sections");
  const [pageTitle, setPageTitle] = useState(initialData.title);
  const [sections, setSections] = useState<
    Record<string, Record<string, string | undefined>>
  >(initialData.sections || {});
  const [seo, setSeo] = useState(initialData.seoMeta || {});
  const [isSaving, setIsSaving] = useState(false);
  const [isResetting, setIsResetting] = useState(false);
  const [resetConfirmOpen, setResetConfirmOpen] = useState(false);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saved" | "error">(
    "idle",
  );
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  function updateSectionField(
    sectionKey: string,
    field: string,
    value: string | undefined,
  ) {
    setSections((prev) => ({
      ...prev,
      [sectionKey]: {
        ...(prev[sectionKey] || {}),
        [field]: value,
      },
    }));
    setSaveStatus("idle");
  }

  function updateSeoField(field: string, value: string) {
    setSeo((prev) => ({
      ...prev,
      [field]: value,
    }));
    setSaveStatus("idle");
  }

  async function handleSave() {
    setIsSaving(true);
    setErrorMessage(null);
    try {
      const res = await savePageContentAction({
        slug: config.slug,
        title: pageTitle,
        sections,
        seoMeta: seo,
      });

      if (res.success) {
        setSaveStatus("saved");
        toast.success("Page content saved successfully!");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        setSaveStatus("error");
        setErrorMessage(res.error || "Failed to save content.");
        toast.error("Failed to save page", {
          description: res.error,
        });
      }
    } finally {
      setIsSaving(false);
    }
  }

  async function executeReset() {
    setIsResetting(true);
    try {
      const res = await resetPageToDefaultsAction(config.slug);
      if (res.success) {
        setSections(
          config.defaultSections as Record<
            string,
            Record<string, string | undefined>
          >,
        );
        setSeo(config.defaultSeo);
        setPageTitle(config.title);
        setSaveStatus("saved");
        toast.success("Page reset to defaults");
        setTimeout(() => setSaveStatus("idle"), 3000);
      } else {
        toast.error("Failed to reset page", {
          description: res.error,
        });
      }
    } finally {
      setIsResetting(false);
      setResetConfirmOpen(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-border">
        <div className="flex items-center gap-3">
          <Button asChild variant="ghost" size="sm" className="h-9 w-9 p-0">
            <Link href="/admin/pages">
              <ArrowLeft className="size-4" />
            </Link>
          </Button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold font-heading text-foreground">
                Edit {config.title}
              </h1>
              <span className="text-xs text-muted-foreground font-mono bg-muted px-2 py-0.5 rounded">
                {config.path}
              </span>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Updates to this page take effect immediately across all devices.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setResetConfirmOpen(true)}
            disabled={isResetting || isSaving}
            className="text-xs gap-1.5 h-9"
          >
            <RefreshCw
              className={`size-3.5 ${isResetting ? "animate-spin" : ""}`}
            />
            Reset Defaults
          </Button>

          <Button
            asChild
            variant="outline"
            size="sm"
            className="text-xs gap-1.5 h-9"
          >
            <a href={config.path} target="_blank" rel="noopener noreferrer">
              <ExternalLink className="size-3.5" />
              View Live
            </a>
          </Button>

          <Button
            type="button"
            size="sm"
            onClick={handleSave}
            disabled={isSaving}
            className="text-xs gap-1.5 h-9 min-w-[110px]"
          >
            {isSaving ? (
              <>
                <Loader2 className="size-3.5 animate-spin" />
                Saving...
              </>
            ) : saveStatus === "saved" ? (
              <>
                <Check className="size-3.5 text-emerald-300" />
                Saved!
              </>
            ) : (
              <>
                <Save className="size-3.5" />
                Save Changes
              </>
            )}
          </Button>
        </div>
      </div>

      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-xs">
          {errorMessage}
        </div>
      )}

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-border">
        <button
          type="button"
          onClick={() => setActiveTab("sections")}
          className={`pb-2.5 text-sm font-medium border-b-2 transition-colors px-3 ${
            activeTab === "sections"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          Content Sections
        </button>
        <button
          type="button"
          onClick={() => setActiveTab("seo")}
          className={`pb-2.5 text-sm font-medium border-b-2 transition-colors px-3 ${
            activeTab === "seo"
              ? "border-primary text-foreground"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          SEO &amp; Social Meta
        </button>
      </div>

      {/* TAB 1: Content Sections */}
      {activeTab === "sections" && (
        <div className="space-y-6">
          {/* ========================================================================= */}
          {/* HOME PAGE SECTIONS (9 Visible Sections) */}
          {/* ========================================================================= */}
          {config.slug === "home" && (
            <>
              {/* 1. Hero */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    1. Hero Section
                  </h3>
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                    Above The Fold
                  </span>
                </div>

                <div>
                  <Label className="text-xs">Eyebrow Badge / Pill</Label>
                  <Input
                    value={sections.hero?.badge || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "badge", e.target.value)
                    }
                    className="mt-1 text-xs"
                    placeholder="e.g. Independent Educational Resource & Policy Forum"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div>
                    <Label className="text-xs">Headline Part 1</Label>
                    <Input
                      value={sections.hero?.headlinePart1 || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "hero",
                          "headlinePart1",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Clarity for Parents."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">
                      Headline Part 2 (Brand Blue)
                    </Label>
                    <Input
                      value={sections.hero?.headlinePart2 || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "hero",
                          "headlinePart2",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Growth for Schools."
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Headline Part 3</Label>
                    <Input
                      value={sections.hero?.headlinePart3 || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "hero",
                          "headlinePart3",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Voice for Teachers."
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Editorial Subtitle / Intro</Label>
                  <Textarea
                    rows={3}
                    value={sections.hero?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                    placeholder="Brief intro..."
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Primary CTA Label</Label>
                    <Input
                      value={sections.hero?.primaryCtaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "hero",
                          "primaryCtaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Primary CTA Link</Label>
                    <Input
                      value={sections.hero?.primaryCtaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "hero",
                          "primaryCtaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Secondary CTA Label</Label>
                    <Input
                      value={sections.hero?.secondaryCtaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "hero",
                          "secondaryCtaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Secondary CTA Link</Label>
                    <Input
                      value={sections.hero?.secondaryCtaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "hero",
                          "secondaryCtaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <SectionImageUpload
                  label="Hero Featured Image"
                  description="Prominent classroom photo on the right of the hero banner."
                  value={sections.hero?.coverImage}
                  altText={sections.hero?.coverImageAlt}
                  folder="pages/home"
                  onChange={({ url, altText }) => {
                    updateSectionField("hero", "coverImage", url);
                    updateSectionField("hero", "coverImageAlt", altText);
                  }}
                />
              </div>

              {/* 2. Meet the Founder (Homepage Teaser) */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    2. Meet the Founder (Homepage Teaser)
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Picture On Right
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge / Eyebrow</Label>
                    <Input
                      value={sections.founderTeaser?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founderTeaser",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Section Heading</Label>
                    <Input
                      value={sections.founderTeaser?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founderTeaser",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Founder Name</Label>
                    <Input
                      value={sections.founderTeaser?.author || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founderTeaser",
                          "author",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Founder Title &amp; Role</Label>
                    <Input
                      value={sections.founderTeaser?.role || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founderTeaser",
                          "role",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Highlighted Quote</Label>
                  <Textarea
                    rows={2}
                    value={sections.founderTeaser?.quote || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "founderTeaser",
                        "quote",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>

                <div>
                  <Label className="text-xs">Founder Narrative / Bio</Label>
                  <Textarea
                    rows={3}
                    value={sections.founderTeaser?.bio || ""}
                    onChange={(e) =>
                      updateSectionField("founderTeaser", "bio", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>

                <SectionImageUpload
                  label="Founder Portrait Picture (Homepage Right Side)"
                  description="Portrait photo of the founder displayed prominently on the right of this section."
                  value={sections.founderTeaser?.image}
                  altText={sections.founderTeaser?.imageAlt}
                  folder="founder"
                  onChange={({ url, altText }) => {
                    updateSectionField("founderTeaser", "image", url);
                    updateSectionField("founderTeaser", "imageAlt", altText);
                  }}
                />

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">CTA Button Label</Label>
                    <Input
                      value={sections.founderTeaser?.ctaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founderTeaser",
                          "ctaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CTA Button Link</Label>
                    <Input
                      value={sections.founderTeaser?.ctaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founderTeaser",
                          "ctaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Recently Published (Blog / News Framing) */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    3. Blog &amp; News (Recently Published)
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                    <Info className="size-3" /> Auto-Pulls from Admin &gt; Posts
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Eyebrow Badge</Label>
                    <Input
                      value={sections.recentlyPublished?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "recentlyPublished",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Editorial Desk"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Section Heading</Label>
                    <Input
                      value={sections.recentlyPublished?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "recentlyPublished",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Recently Published"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Subtitle Description</Label>
                  <Textarea
                    rows={2}
                    value={sections.recentlyPublished?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "recentlyPublished",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">More Link Label</Label>
                    <Input
                      value={sections.recentlyPublished?.ctaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "recentlyPublished",
                          "ctaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. More Publications"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">More Link Destination</Label>
                    <Input
                      value={sections.recentlyPublished?.ctaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "recentlyPublished",
                          "ctaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. /blog"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Events & Summits Framing */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    4. Events &amp; Summits Banner
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                    <Info className="size-3" /> Auto-Pulls from Admin &gt;
                    Events
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Eyebrow / Watermark</Label>
                    <Input
                      value={sections.featuredEvents?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "featuredEvents",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Upcoming Events"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Section Heading</Label>
                    <Input
                      value={sections.featuredEvents?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "featuredEvents",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Events & Summits"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">CTA Button Label</Label>
                    <Input
                      value={sections.featuredEvents?.ctaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "featuredEvents",
                          "ctaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. All Events"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CTA Button Link</Label>
                    <Input
                      value={sections.featuredEvents?.ctaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "featuredEvents",
                          "ctaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. /events"
                    />
                  </div>
                </div>
              </div>

              {/* 5. Partners Marquee Framing */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    5. Our Partners (Marquee Header)
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                    <Info className="size-3" /> Logos Auto-Pull from Admin &gt;
                    Partners
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Eyebrow Badge</Label>
                    <Input
                      value={sections.partnersMarquee?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "partnersMarquee",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Ecosystem Network"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Marquee Heading</Label>
                    <Input
                      value={sections.partnersMarquee?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "partnersMarquee",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Trusted by Institutions & Education Leaders..."
                    />
                  </div>
                </div>
              </div>

              {/* 6. Schools Directory Banner */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    6. Schools Directory Callout Banner
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Map / Directory CTA
                  </span>
                </div>

                <div>
                  <Label className="text-xs">Banner Headline</Label>
                  <Input
                    value={sections.directoryBanner?.title || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "directoryBanner",
                        "title",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                    placeholder="e.g. Explore Verified Schools Across Port Harcourt"
                  />
                </div>

                <div>
                  <Label className="text-xs">Banner Subtitle</Label>
                  <Textarea
                    rows={2}
                    value={sections.directoryBanner?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "directoryBanner",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">Button Label</Label>
                    <Input
                      value={sections.directoryBanner?.ctaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "directoryBanner",
                          "ctaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Launch Schools Directory"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Button Destination Link</Label>
                    <Input
                      value={sections.directoryBanner?.ctaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "directoryBanner",
                          "ctaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. /schools"
                    />
                  </div>
                </div>

                <SectionImageUpload
                  label="Campus Backdrop Image"
                  description="Background architectural/campus image displayed behind the dark navy overlay."
                  value={sections.directoryBanner?.coverImage}
                  altText={sections.directoryBanner?.coverImageAlt}
                  folder="pages/home"
                  onChange={({ url, altText }) => {
                    updateSectionField("directoryBanner", "coverImage", url);
                    updateSectionField(
                      "directoryBanner",
                      "coverImageAlt",
                      altText,
                    );
                  }}
                />
              </div>

              {/* 7. Newsletter Sign-up Section */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  7. Newsletter Sign-up Section
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.newsletter?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "newsletter",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Weekly Digest"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Headline</Label>
                    <Input
                      value={sections.newsletter?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "newsletter",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Stay Informed on Port Harcourt Education"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Subtitle</Label>
                  <Textarea
                    rows={2}
                    value={sections.newsletter?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "newsletter",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* 8. Research & Focus Areas Framing */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  8. Research &amp; Focus Areas Header
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge / Watermark</Label>
                    <Input
                      value={sections.focusAreas?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "focusAreas",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Focus Areas"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Section Headline</Label>
                    <Input
                      value={sections.focusAreas?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "focusAreas",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Where We Do the Work"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Subtitle</Label>
                  <Textarea
                    rows={2}
                    value={sections.focusAreas?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "focusAreas",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* 9. Closing CTA */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  9. Closing Call-To-Action (&ldquo;There&apos;s a Place for You
                  Here&rdquo;)
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.closingCta?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "closingCta",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Community Invitation"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Main Headline</Label>
                    <Input
                      value={sections.closingCta?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "closingCta",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. There's a Place for You Here."
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Body Copy</Label>
                  <Textarea
                    rows={2}
                    value={sections.closingCta?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "closingCta",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Primary CTA Label</Label>
                    <Input
                      value={sections.closingCta?.primaryCtaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "closingCta",
                          "primaryCtaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Primary CTA Link</Label>
                    <Input
                      value={sections.closingCta?.primaryCtaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "closingCta",
                          "primaryCtaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Secondary CTA Label</Label>
                    <Input
                      value={sections.closingCta?.secondaryCtaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "closingCta",
                          "secondaryCtaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Secondary CTA Link</Label>
                    <Input
                      value={sections.closingCta?.secondaryCtaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "closingCta",
                          "secondaryCtaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* ABOUT US SECTIONS (8 Sections) */}
          {/* ========================================================================= */}
          {config.slug === "about" && (
            <>
              {/* 1. Hero */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  1. Hero Section (Who We Are)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.hero?.badge || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "badge", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Main Title</Label>
                    <Input
                      value={sections.hero?.title || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle Lead</Label>
                  <Textarea
                    rows={2}
                    value={sections.hero?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">
                    Editorial Narrative Paragraph
                  </Label>
                  <Textarea
                    rows={3}
                    value={sections.hero?.narrative || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "narrative", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* 2. Mission & Vision */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                  <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                    2. The Mission
                  </h3>
                  <div>
                    <Label className="text-xs">Mission Title</Label>
                    <Input
                      value={sections.mission?.title || ""}
                      onChange={(e) =>
                        updateSectionField("mission", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Mission Statement</Label>
                    <Textarea
                      rows={4}
                      value={sections.mission?.description || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "mission",
                          "description",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                  <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                    3. The Vision
                  </h3>
                  <div>
                    <Label className="text-xs">Vision Title</Label>
                    <Input
                      value={sections.vision?.title || ""}
                      onChange={(e) =>
                        updateSectionField("vision", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Vision Statement</Label>
                    <Textarea
                      rows={4}
                      value={sections.vision?.description || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "vision",
                          "description",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Meet the Founder (Full Profile & Letter) */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    4. Meet the Founder (Full Profile &amp; Letter)
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-primary/10 text-primary">
                    Portrait &amp; Letter
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge / Eyebrow</Label>
                    <Input
                      value={sections.founder?.badge || ""}
                      onChange={(e) =>
                        updateSectionField("founder", "badge", e.target.value)
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Office of the Founder"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Section Heading</Label>
                    <Input
                      value={sections.founder?.title || ""}
                      onChange={(e) =>
                        updateSectionField("founder", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Meet the Founder"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Subtitle</Label>
                  <Input
                    value={sections.founder?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("founder", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Founder Name</Label>
                    <Input
                      value={sections.founder?.author || ""}
                      onChange={(e) =>
                        updateSectionField("founder", "author", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Founder Title &amp; Role</Label>
                    <Input
                      value={sections.founder?.role || ""}
                      onChange={(e) =>
                        updateSectionField("founder", "role", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Guiding Philosophy Quote</Label>
                  <Textarea
                    rows={2}
                    value={sections.founder?.quote || ""}
                    onChange={(e) =>
                      updateSectionField("founder", "quote", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>

                <SectionImageUpload
                  label="Founder Portrait Picture (About Page)"
                  description="High-resolution portrait photo of the founder displayed prominently on the About Us page."
                  value={sections.founder?.image}
                  altText={sections.founder?.imageAlt}
                  folder="founder"
                  onChange={({ url, altText }) => {
                    updateSectionField("founder", "image", url);
                    updateSectionField("founder", "imageAlt", altText);
                  }}
                />

                <div className="border-t border-border/60 pt-4 space-y-3">
                  <h4 className="font-heading font-semibold text-sm text-foreground">
                    Founder&apos;s Letter / Narrative
                  </h4>
                  <div>
                    <Label className="text-xs">Letter Heading</Label>
                    <Input
                      value={sections.founder?.letterTitle || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founder",
                          "letterTitle",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Why We Built PortHarcourtSchools"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Paragraph 1</Label>
                    <Textarea
                      rows={3}
                      value={sections.founder?.letterParagraph1 || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founder",
                          "letterParagraph1",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Paragraph 2</Label>
                    <Textarea
                      rows={3}
                      value={sections.founder?.letterParagraph2 || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founder",
                          "letterParagraph2",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Paragraph 3</Label>
                    <Textarea
                      rows={3}
                      value={sections.founder?.letterParagraph3 || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founder",
                          "letterParagraph3",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Paragraph 4</Label>
                    <Textarea
                      rows={3}
                      value={sections.founder?.letterParagraph4 || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "founder",
                          "letterParagraph4",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* 4. Who We Serve — Three Audiences */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  5. Who We Serve (Three Audiences Framing)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.whoWeServe?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "whoWeServe",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Heading</Label>
                    <Input
                      value={sections.whoWeServe?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "whoWeServe",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle Description</Label>
                  <Textarea
                    rows={2}
                    value={sections.whoWeServe?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "whoWeServe",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* 5. What We Do — Strategic Pillars */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  6. What We Do (Three Pillars Framing)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.whatWeDo?.badge || ""}
                      onChange={(e) =>
                        updateSectionField("whatWeDo", "badge", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Heading</Label>
                    <Input
                      value={sections.whatWeDo?.title || ""}
                      onChange={(e) =>
                        updateSectionField("whatWeDo", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle Description</Label>
                  <Textarea
                    rows={2}
                    value={sections.whatWeDo?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("whatWeDo", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* 6. Implementation Methodology */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  7. Implementation Methodology (How We Execute)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.methodology?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "methodology",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Heading</Label>
                    <Input
                      value={sections.methodology?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "methodology",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle Description</Label>
                  <Textarea
                    rows={2}
                    value={sections.methodology?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "methodology",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* 7. Our Story */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  8. Our Story (From Content to Institution)
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.ourStory?.badge || ""}
                      onChange={(e) =>
                        updateSectionField("ourStory", "badge", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Heading</Label>
                    <Input
                      value={sections.ourStory?.title || ""}
                      onChange={(e) =>
                        updateSectionField("ourStory", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Our Story Narrative</Label>
                  <Textarea
                    rows={3}
                    value={sections.ourStory?.narrative || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "ourStory",
                        "narrative",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
                  <div>
                    <Label className="text-xs">Primary CTA Label</Label>
                    <Input
                      value={sections.ourStory?.primaryCtaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "ourStory",
                          "primaryCtaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Primary CTA Link</Label>
                    <Input
                      value={sections.ourStory?.primaryCtaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "ourStory",
                          "primaryCtaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Secondary CTA Label</Label>
                    <Input
                      value={sections.ourStory?.secondaryCtaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "ourStory",
                          "secondaryCtaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Secondary CTA Link</Label>
                    <Input
                      value={sections.ourStory?.secondaryCtaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "ourStory",
                          "secondaryCtaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* PARTNERS SECTIONS */}
          {/* ========================================================================= */}
          {config.slug === "partners" && (
            <>
              {/* 1. Hero */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  1. Partners Page Hero Header
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.hero?.badge || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "badge", e.target.value)
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Strategic Collaboration"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Headline</Label>
                    <Input
                      value={sections.hero?.title || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle Description</Label>
                  <Textarea
                    rows={3}
                    value={sections.hero?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* 2. Value Proposition */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    2. Why Partner With Us (Value Proposition)
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                    <Info className="size-3" /> Logos Auto-Pull from Admin &gt;
                    Partners
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Section Badge</Label>
                    <Input
                      value={sections.valueProp?.badge || ""}
                      onChange={(e) =>
                        updateSectionField("valueProp", "badge", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Section Title</Label>
                    <Input
                      value={sections.valueProp?.title || ""}
                      onChange={(e) =>
                        updateSectionField("valueProp", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>

                <div>
                  <Label className="text-xs">Introductory Description</Label>
                  <Textarea
                    rows={2}
                    value={sections.valueProp?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "valueProp",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>

                <div className="space-y-3 pt-2">
                  <Label className="text-xs font-semibold">
                    Four Strategic Value Bullets
                  </Label>
                  <Input
                    value={sections.valueProp?.point1 || ""}
                    onChange={(e) =>
                      updateSectionField("valueProp", "point1", e.target.value)
                    }
                    className="text-xs"
                    placeholder="Point 1..."
                  />
                  <Input
                    value={sections.valueProp?.point2 || ""}
                    onChange={(e) =>
                      updateSectionField("valueProp", "point2", e.target.value)
                    }
                    className="text-xs"
                    placeholder="Point 2..."
                  />
                  <Input
                    value={sections.valueProp?.point3 || ""}
                    onChange={(e) =>
                      updateSectionField("valueProp", "point3", e.target.value)
                    }
                    className="text-xs"
                    placeholder="Point 3..."
                  />
                  <Input
                    value={sections.valueProp?.point4 || ""}
                    onChange={(e) =>
                      updateSectionField("valueProp", "point4", e.target.value)
                    }
                    className="text-xs"
                    placeholder="Point 4..."
                  />
                </div>
              </div>

              {/* 3. Partnership CTA */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  3. Partnership Inquiries CTA Card
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Headline</Label>
                    <Input
                      value={sections.partnershipCta?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "partnershipCta",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Button Label</Label>
                    <Input
                      value={sections.partnershipCta?.ctaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "partnershipCta",
                          "ctaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    rows={2}
                    value={sections.partnershipCta?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "partnershipCta",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* EVENTS SECTIONS */}
          {/* ========================================================================= */}
          {config.slug === "events" && (
            <>
              {/* 1. Hero */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  1. Events &amp; Programmes Hub Header
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.hero?.badge || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "badge", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Main Title</Label>
                    <Input
                      value={sections.hero?.title || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle Description</Label>
                  <Textarea
                    rows={3}
                    value={sections.hero?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* 2. Upcoming Events Section Framing */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    2. Upcoming Events &amp; Workshops Header
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                    <Info className="size-3" /> Event Cards Auto-Pull from Admin
                    &gt; Events
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.upcomingHeader?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "upcomingHeader",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Calendar & Gatherings"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Section Heading</Label>
                    <Input
                      value={sections.upcomingHeader?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "upcomingHeader",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Upcoming Events & Workshops"
                    />
                  </div>
                </div>
              </div>

              {/* 3. Programmes Section Framing */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <div className="flex items-center justify-between border-b border-border/60 pb-2">
                  <h3 className="font-heading font-bold text-base text-foreground">
                    3. Ongoing Programmes &amp; Masterclasses Header
                  </h3>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                    <Info className="size-3" /> Cards Auto-Pull from Admin &gt;
                    Programmes
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.programmesHeader?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "programmesHeader",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Accredited Training"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Section Heading</Label>
                    <Input
                      value={sections.programmesHeader?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "programmesHeader",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Ongoing Programmes & Masterclasses"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle Description</Label>
                  <Textarea
                    rows={2}
                    value={sections.programmesHeader?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "programmesHeader",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* SCHOOLS DIRECTORY SECTIONS */}
          {/* ========================================================================= */}
          {config.slug === "schools" && (
            <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
              <div className="flex items-center justify-between border-b border-border/60 pb-2">
                <h3 className="font-heading font-bold text-base text-foreground">
                  1. Directory Header Section
                </h3>
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground flex items-center gap-1">
                  <Info className="size-3" /> Listings Auto-Pull from Admin &gt;
                  Schools
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs">Eyebrow Badge</Label>
                  <Input
                    value={sections.hero?.badge || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "badge", e.target.value)
                    }
                    className="mt-1 text-xs"
                    placeholder="e.g. Garden City Education Index"
                  />
                </div>
                <div>
                  <Label className="text-xs">Main Title</Label>
                  <Input
                    value={sections.hero?.title || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "title", e.target.value)
                    }
                    className="mt-1 text-xs"
                    placeholder="e.g. Port Harcourt Schools Directory"
                  />
                </div>
              </div>
              <div>
                <Label className="text-xs">Subtitle / Guide Description</Label>
                <Textarea
                  rows={3}
                  value={sections.hero?.subtitle || ""}
                  onChange={(e) =>
                    updateSectionField("hero", "subtitle", e.target.value)
                  }
                  className="mt-1 text-xs"
                />
              </div>
            </div>
          )}

          {/* ========================================================================= */}
          {/* CONTACT US SECTIONS */}
          {/* ========================================================================= */}
          {config.slug === "contact" && (
            <>
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  1. Contact Header Section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.hero?.badge || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "badge", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Headline</Label>
                    <Input
                      value={sections.hero?.title || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Introductory Paragraph</Label>
                  <Textarea
                    rows={3}
                    value={sections.hero?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  2. Direct Contact Explanatory Text
                </h3>
                <div>
                  <Label className="text-xs">Card Heading</Label>
                  <Input
                    value={sections.directContact?.heading || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "directContact",
                        "heading",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Response Time Expectation</Label>
                  <Input
                    value={sections.directContact?.body || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "directContact",
                        "body",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div>
                  <Label className="text-xs">Office Hours Note</Label>
                  <Input
                    value={sections.directContact?.officeHours || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "directContact",
                        "officeHours",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground italic">
                  Note: Phone numbers, emails, and address locations are managed
                  globally in{" "}
                  <Link
                    href="/admin/settings"
                    className="underline text-primary"
                  >
                    Admin &gt; Settings
                  </Link>
                  .
                </p>
              </div>
            </>
          )}

          {/* ========================================================================= */}
          {/* RESEARCH & FOCUS AREAS SECTIONS */}
          {/* ========================================================================= */}
          {config.slug === "research" && (
            <>
              {/* 1. Hero Header */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  1. Hero Header
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.hero?.badge || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "badge", e.target.value)
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Strategic Themes & Research"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Main Title</Label>
                    <Input
                      value={sections.hero?.title || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Research & Focus Areas"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle Description</Label>
                  <Textarea
                    rows={2}
                    value={sections.hero?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>

              {/* 2. Focus Tracks (1 through 6) */}
              {[1, 2, 3, 4, 5, 6].map((num) => {
                const trackKey = `track${num}`;
                const track = sections[trackKey] || {};
                return (
                  <div
                    key={trackKey}
                    className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs"
                  >
                    <div className="flex items-center justify-between border-b border-border/60 pb-2">
                      <h3 className="font-heading font-bold text-base text-foreground">
                        Focus Track #{num}: {track.title || `Track ${num}`}
                      </h3>
                      <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-muted text-muted-foreground">
                        Card #{num}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div>
                        <Label className="text-xs">Display Number</Label>
                        <Input
                          value={track.number || `0${num}`}
                          onChange={(e) =>
                            updateSectionField(
                              trackKey,
                              "number",
                              e.target.value,
                            )
                          }
                          className="mt-1 text-xs"
                          placeholder={`0${num}`}
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Category Tag</Label>
                        <Input
                          value={track.tag || ""}
                          onChange={(e) =>
                            updateSectionField(trackKey, "tag", e.target.value)
                          }
                          className="mt-1 text-xs"
                          placeholder="e.g. Ages 1–5, Flagship, Innovation"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Accent Color (Hex)</Label>
                        <Input
                          value={track.color || "#184098"}
                          onChange={(e) =>
                            updateSectionField(
                              trackKey,
                              "color",
                              e.target.value,
                            )
                          }
                          className="mt-1 text-xs"
                          placeholder="#184098"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-xs">Track Title</Label>
                        <Input
                          value={track.title || ""}
                          onChange={(e) =>
                            updateSectionField(
                              trackKey,
                              "title",
                              e.target.value,
                            )
                          }
                          className="mt-1 text-xs"
                        />
                      </div>
                      <div>
                        <Label className="text-xs">Target Link / URL</Label>
                        <Input
                          value={track.href || ""}
                          onChange={(e) =>
                            updateSectionField(trackKey, "href", e.target.value)
                          }
                          className="mt-1 text-xs"
                          placeholder="e.g. /schools?level=primary"
                        />
                      </div>
                    </div>

                    <div>
                      <Label className="text-xs">Subtitle / Summary</Label>
                      <Textarea
                        rows={2}
                        value={track.subtitle || ""}
                        onChange={(e) =>
                          updateSectionField(
                            trackKey,
                            "subtitle",
                            e.target.value,
                          )
                        }
                        className="mt-1 text-xs"
                      />
                    </div>

                    <SectionImageUpload
                      label={`Card Background Image (Track ${num})`}
                      description="Cover photo displayed inside the program scroller card."
                      value={track.bgImage}
                      folder="pages"
                      aspectRatio="video"
                      onChange={({ url }) =>
                        updateSectionField(trackKey, "bgImage", url)
                      }
                    />
                  </div>
                );
              })}

              {/* 3. Closing Call-To-Action */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  3. Closing Call-To-Action
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.closingCta?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "closingCta",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Collaborate With Us"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Headline</Label>
                    <Input
                      value={sections.closingCta?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "closingCta",
                          "title",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. Have research, curriculum data or insights to share?"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle</Label>
                  <Textarea
                    rows={2}
                    value={sections.closingCta?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "closingCta",
                        "subtitle",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <Label className="text-xs">CTA Button Label</Label>
                    <Input
                      value={sections.closingCta?.primaryCtaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "closingCta",
                          "primaryCtaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CTA Button Link</Label>
                    <Input
                      value={sections.closingCta?.primaryCtaLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "closingCta",
                          "primaryCtaLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>
            </>
          )}
        </div>
      )}

      {/* TAB 2: SEO & Social Meta */}
      {activeTab === "seo" && (
        <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
          <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
            Search Engine &amp; Social Share Metadata
          </h3>

          <div>
            <Label className="text-xs">Browser Title Tag</Label>
            <Input
              value={seo.title || ""}
              onChange={(e) => updateSeoField("title", e.target.value)}
              className="mt-1 text-xs"
              placeholder="Page title displayed in search results..."
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Recommended length: 50–60 characters.
            </p>
          </div>

          <div>
            <Label className="text-xs">Meta Description</Label>
            <Textarea
              rows={3}
              value={seo.description || ""}
              onChange={(e) => updateSeoField("description", e.target.value)}
              className="mt-1 text-xs"
              placeholder="Compelling summary shown in Google search previews..."
            />
            <p className="text-[11px] text-muted-foreground mt-1">
              Recommended length: 140–160 characters.
            </p>
          </div>

          <SectionImageUpload
            label="Social Share OpenGraph Image (OG Image)"
            description="Displayed when this page is shared on WhatsApp, Facebook, LinkedIn, and X."
            value={seo.ogImage}
            folder="seo"
            aspectRatio="banner"
            onChange={({ url }) => updateSeoField("ogImage", url)}
          />
        </div>
      )}

      <ConfirmDialog
        open={resetConfirmOpen}
        onOpenChange={setResetConfirmOpen}
        title="Reset Page to Defaults"
        description="Are you sure you want to reset this page to factory defaults? All custom text, layout preferences, and image edits will be reverted immediately."
        confirmText="Reset to Defaults"
        variant="warning"
        isLoading={isResetting}
        onConfirm={executeReset}
      />
    </div>
  );
}
