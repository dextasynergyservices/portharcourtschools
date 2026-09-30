"use client";

import {
  AlertCircle,
  ArrowLeft,
  Eye,
  Globe,
  Loader2,
  Save,
  Send,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { SectionImageUpload } from "@/components/admin/media/section-image-upload";
import { TiptapEditor } from "@/components/admin/tiptap-editor";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import {
  createPostAction,
  type PostActionState,
  updatePostAction,
} from "./actions";

interface CategoryOption {
  id: string;
  name: string;
  slug: string;
}

interface PostFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    body: string;
    coverImage?: string | null;
    categoryId?: string | null;
    tags?: string[] | null;
    status: "draft" | "in_review" | "published" | "archived";
  };
  categories: CategoryOption[];
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

export function PostForm({ initialData, categories, userRole }: PostFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isCustomSlug, setIsCustomSlug] = useState(!!initialData);
  const [excerpt, setExcerpt] = useState(initialData?.excerpt || "");
  const [body, setBody] = useState(initialData?.body || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [categoryId, setCategoryId] = useState(
    initialData?.categoryId || "none",
  );
  const [tags, setTags] = useState(initialData?.tags?.join(", ") || "");
  const [status] = useState<"draft" | "in_review" | "published" | "archived">(
    initialData?.status || "draft",
  );

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isCustomSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = (
    targetStatus: "draft" | "in_review" | "published" | "archived",
  ) => {
    setError(null);

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug || slugify(title));
    formData.set("excerpt", excerpt);
    formData.set("body", body);
    formData.set("coverImage", coverImage);
    formData.set("categoryId", categoryId);
    formData.set("tags", tags);
    formData.set("status", targetStatus);

    startTransition(async () => {
      let res: PostActionState;
      if (isEditing && initialData?.id) {
        res = await updatePostAction(initialData.id, {}, formData);
      } else {
        res = await createPostAction({}, formData);
      }

      if (res.error) {
        setError(res.error);
        toast.error("Failed to save article", { description: res.error });
      } else if (res.success) {
        toast.success(
          targetStatus === "published"
            ? "Article published successfully!"
            : "Article saved successfully",
        );
        router.push("/admin/posts");
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
          <Link href="/admin/posts">
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
              {isEditing ? "Edit Article" : "Create New Article"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? `Updating post: ${initialData.title}`
                : "Author an editorial story or policy breakdown for PortHarcourtSchools."}
            </p>
          </div>
        </div>

        {/* Live Preview Button if editing and published */}
        {isEditing && slug && (
          <a
            href={`/blog/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#184098] hover:underline"
          >
            <Eye className="size-3.5" />
            <span>View on Live Site</span>
          </a>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-[2px] border border-[#C0392B]/20 bg-[#C0392B]/10 p-4 text-xs text-[#C0392B]">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Content (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-[#D9DEEC] bg-white p-6 space-y-5 rounded-[2px]">
            {/* Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="post-title"
                className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
              >
                Article Title <span className="text-[#C0392B]">*</span>
              </label>
              <Input
                id="post-title"
                placeholder="e.g. Navigating Primary School Admissions in Port Harcourt"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="h-11 border-[#D9DEEC] text-base font-bold text-[#151B2E] focus-visible:ring-[#184098]"
              />
            </div>

            {/* Slug */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="post-slug"
                  className="block text-xs font-semibold text-muted-foreground"
                >
                  URL Slug: /blog/{slug || "..."}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomSlug(!isCustomSlug)}
                  className="text-[11px] text-[#184098] font-semibold hover:underline"
                >
                  {isCustomSlug ? "Auto-generate" : "Customize"}
                </button>
              </div>
              {isCustomSlug && (
                <Input
                  id="post-slug"
                  placeholder="custom-article-slug"
                  value={slug}
                  onChange={(e) => setSlug(slugify(e.target.value))}
                  className="h-9 font-mono text-xs border-[#D9DEEC]"
                />
              )}
            </div>

            {/* Excerpt */}
            <div className="space-y-1.5">
              <label
                htmlFor="post-excerpt"
                className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
              >
                Brief Summary / Excerpt
              </label>
              <Textarea
                id="post-excerpt"
                rows={3}
                placeholder="A short 1-2 sentence overview shown on blog cards and search engines."
                value={excerpt}
                onChange={(e) => setExcerpt(e.target.value)}
                className="text-xs leading-relaxed border-[#D9DEEC]"
              />
            </div>

            {/* Rich Text Body */}
            <div className="space-y-1.5">
              <span className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]">
                Article Body Content <span className="text-[#C0392B]">*</span>
              </span>
              <TiptapEditor content={body} onChange={setBody} />
            </div>
          </Card>
        </div>

        {/* Sidebar Controls (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing Card */}
          <Card className="border-[#D9DEEC] bg-white p-5 rounded-[2px] space-y-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#151B2E] border-b border-[#D9DEEC] pb-2">
              Publishing &amp; Workflow
            </CardTitle>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Current Status:</span>
                <Badge
                  variant={
                    status === "published"
                      ? "success"
                      : status === "in_review"
                        ? "amber"
                        : "outline"
                  }
                  className="text-[10px] uppercase font-bold"
                >
                  {status.replace("_", " ")}
                </Badge>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">Your Role:</span>
                <span className="font-semibold capitalize text-[#184098]">
                  {userRole}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="pt-2 space-y-2">
              {/* If Creator: can only draft or submit for review */}
              {isCreator ? (
                <>
                  <Button
                    type="button"
                    disabled={isPending || !title}
                    onClick={() => handleSubmit("draft")}
                    variant="outline"
                    className="w-full justify-center text-xs h-10 border-[#D9DEEC]"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin mr-1" />
                    ) : (
                      <Save className="size-4 mr-1" />
                    )}
                    Save Draft
                  </Button>

                  <Button
                    type="button"
                    disabled={isPending || !title}
                    onClick={() => handleSubmit("in_review")}
                    className="w-full justify-center text-xs h-10 bg-[#184098] hover:bg-[#08276B] text-white font-bold"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin mr-1" />
                    ) : (
                      <Send className="size-4 mr-1" />
                    )}
                    Submit for Review
                  </Button>
                </>
              ) : (
                /* If Editor / Admin / Super Admin: can publish directly */
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
                      <Globe className="size-4 mr-1 text-[#FDDA32]" />
                    )}
                    {isEditing && status === "published"
                      ? "Update & Revalidate"
                      : "Publish Article"}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      disabled={isPending || !title}
                      onClick={() => handleSubmit("draft")}
                      variant="outline"
                      className="text-xs h-9 border-[#D9DEEC]"
                    >
                      <Save className="size-3.5 mr-1" />
                      Draft
                    </Button>

                    <Button
                      type="button"
                      disabled={isPending || !title}
                      onClick={() => handleSubmit("in_review")}
                      variant="outline"
                      className="text-xs h-9 border-[#D9DEEC]"
                    >
                      <Send className="size-3.5 mr-1" />
                      In Review
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Categorization & Metadata */}
          <Card className="border-[#D9DEEC] bg-white p-5 rounded-[2px] space-y-4">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#151B2E] border-b border-[#D9DEEC] pb-2">
              Category &amp; Taxonomy
            </CardTitle>

            {/* Category Dropdown */}
            <div className="space-y-1.5">
              <label
                htmlFor="post-category"
                className="block text-xs font-bold text-[#151B2E]"
              >
                Editorial Category
              </label>
              <Select
                id="post-category"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="h-10 text-xs border-[#D9DEEC]"
              >
                <option value="none">Uncategorized</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </div>

            {/* Cover Image Upload */}
            <div className="space-y-1.5">
              <SectionImageUpload
                label="Featured Cover Image"
                description="Upload an image from your device or pick one from the media gallery."
                value={coverImage}
                folder="blog"
                aspectRatio="video"
                onChange={({ url }) => setCoverImage(url)}
              />
            </div>

            {/* Tags */}
            <div className="space-y-1.5">
              <label
                htmlFor="post-tags"
                className="block text-xs font-bold text-[#151B2E]"
              >
                Tags (Comma-separated)
              </label>
              <Input
                id="post-tags"
                placeholder="Admissions, Primary, Safeguarding"
                value={tags}
                onChange={(e) => setTags(e.target.value)}
                className="h-9 text-xs border-[#D9DEEC]"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
