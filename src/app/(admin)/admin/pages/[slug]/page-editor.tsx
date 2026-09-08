"use client";

import {
  ArrowLeft,
  Check,
  ExternalLink,
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

  async function handleReset() {
    if (
      !confirm(
        "Are you sure you want to reset this page to factory defaults? All custom text and image edits will be reverted.",
      )
    ) {
      return;
    }

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
            onClick={handleReset}
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
          {/* HOME PAGE SECTIONS */}
          {config.slug === "home" && (
            <>
              {/* Hero */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  1. Hero Banner Section
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge / Kicker</Label>
                    <Input
                      value={sections.hero?.badge || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "badge", e.target.value)
                      }
                      className="mt-1 text-xs"
                      placeholder="e.g. The Port Harcourt Education Hub"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Primary Headline</Label>
                    <Input
                      value={sections.hero?.title || ""}
                      onChange={(e) =>
                        updateSectionField("hero", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                      placeholder="Headline..."
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle / Intro Copy</Label>
                  <Textarea
                    rows={3}
                    value={sections.hero?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                    placeholder="Brief description..."
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
                  label="Hero Banner Image"
                  description="High-resolution photo of school life or classroom in Port Harcourt."
                  value={sections.hero?.coverImage}
                  altText={sections.hero?.coverImageAlt}
                  folder="pages/home"
                  onChange={({ url, altText }) => {
                    updateSectionField("hero", "coverImage", url);
                    updateSectionField("hero", "coverImageAlt", altText);
                  }}
                />
              </div>

              {/* Tuition Transparency Banner */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  2. Tuition Transparency Callout Block
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Section Badge</Label>
                    <Input
                      value={sections.tuitionBanner?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "tuitionBanner",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Headline</Label>
                    <Input
                      value={sections.tuitionBanner?.headline || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "tuitionBanner",
                          "headline",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Body Text</Label>
                  <Textarea
                    rows={2}
                    value={sections.tuitionBanner?.body || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "tuitionBanner",
                        "body",
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
                      value={sections.tuitionBanner?.buttonText || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "tuitionBanner",
                          "buttonText",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Button Link</Label>
                    <Input
                      value={sections.tuitionBanner?.buttonLink || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "tuitionBanner",
                          "buttonLink",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Community Block */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  3. Community Invitation Block
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={sections.community?.title || ""}
                      onChange={(e) =>
                        updateSectionField("community", "title", e.target.value)
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">CTA Label</Label>
                    <Input
                      value={sections.community?.ctaLabel || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "community",
                          "ctaLabel",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                </div>
                <div>
                  <Label className="text-xs">Subtitle / Copy</Label>
                  <Textarea
                    rows={2}
                    value={sections.community?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "community",
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

          {/* ABOUT US SECTIONS */}
          {config.slug === "about" && (
            <>
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  1. Hero Section
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
                  <Label className="text-xs">Subtitle</Label>
                  <Textarea
                    rows={3}
                    value={sections.hero?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <SectionImageUpload
                  label="About Us Header Image"
                  description="Team photo or educational impact image."
                  value={sections.hero?.coverImage}
                  altText={sections.hero?.coverImageAlt}
                  folder="pages/about"
                  onChange={({ url, altText }) => {
                    updateSectionField("hero", "coverImage", url);
                    updateSectionField("hero", "coverImageAlt", altText);
                  }}
                />
              </div>

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

              {/* Founder / Leadership Quote */}
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  4. Leadership Quote Block
                </h3>
                <div>
                  <Label className="text-xs">Quote Body</Label>
                  <Textarea
                    rows={3}
                    value={sections.leadershipQuote?.quote || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "leadershipQuote",
                        "quote",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Author Name</Label>
                    <Input
                      value={sections.leadershipQuote?.author || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "leadershipQuote",
                          "author",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Author Role</Label>
                    <Input
                      value={sections.leadershipQuote?.role || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "leadershipQuote",
                          "role",
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

          {/* CONTACT US SECTIONS */}
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

          {/* PARTNERS SECTIONS */}
          {config.slug === "partners" && (
            <>
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  1. Hero Section
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
                  <Label className="text-xs">Subtitle</Label>
                  <Textarea
                    rows={3}
                    value={sections.hero?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <SectionImageUpload
                  label="Partnership Banner Image"
                  value={sections.hero?.coverImage}
                  altText={sections.hero?.coverImageAlt}
                  folder="pages/partners"
                  onChange={({ url, altText }) => {
                    updateSectionField("hero", "coverImage", url);
                    updateSectionField("hero", "coverImageAlt", altText);
                  }}
                />
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  2. Value Proposition
                </h3>
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
                <div>
                  <Label className="text-xs">Description</Label>
                  <Textarea
                    rows={3}
                    value={sections.valueProp?.description || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "valueProp",
                        "description",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
                </div>
              </div>
            </>
          )}

          {/* EVENTS SECTIONS */}
          {config.slug === "events" && (
            <>
              <div className="rounded-xl border border-border bg-card p-5 space-y-4 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  1. Events Hub Header
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
                  <Label className="text-xs">Subtitle</Label>
                  <Textarea
                    rows={3}
                    value={sections.hero?.subtitle || ""}
                    onChange={(e) =>
                      updateSectionField("hero", "subtitle", e.target.value)
                    }
                    className="mt-1 text-xs"
                  />
                </div>
                <SectionImageUpload
                  label="Events Header Image"
                  value={sections.hero?.coverImage}
                  altText={sections.hero?.coverImageAlt}
                  folder="pages/events"
                  onChange={({ url, altText }) => {
                    updateSectionField("hero", "coverImage", url);
                    updateSectionField("hero", "coverImageAlt", altText);
                  }}
                />
              </div>

              <div className="rounded-xl border border-border bg-card p-5 space-y-3 shadow-xs">
                <h3 className="font-heading font-bold text-base text-foreground border-b border-border/60 pb-2">
                  2. Summit Spotlight
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs">Badge</Label>
                    <Input
                      value={sections.summitSpotlight?.badge || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "summitSpotlight",
                          "badge",
                          e.target.value,
                        )
                      }
                      className="mt-1 text-xs"
                    />
                  </div>
                  <div>
                    <Label className="text-xs">Title</Label>
                    <Input
                      value={sections.summitSpotlight?.title || ""}
                      onChange={(e) =>
                        updateSectionField(
                          "summitSpotlight",
                          "title",
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
                    rows={3}
                    value={sections.summitSpotlight?.description || ""}
                    onChange={(e) =>
                      updateSectionField(
                        "summitSpotlight",
                        "description",
                        e.target.value,
                      )
                    }
                    className="mt-1 text-xs"
                  />
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
    </div>
  );
}
