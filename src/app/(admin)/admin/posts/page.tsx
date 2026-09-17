import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { BookOpen, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { categories, db, posts } from "@/lib/db";
import { DashboardShell } from "../dashboard/dashboard-shell";
import { PostActionsMenu } from "./post-actions-menu";
import { PostsTable } from "./posts-table";

export const metadata = {
  title: "Blog & Editorial Posts — Admin Portal | PortHarcourtSchools",
};

interface AdminPostsPageProps {
  searchParams: Promise<{
    status?: string;
    category?: string;
    q?: string;
  }>;
}

export default async function AdminPostsPage({
  searchParams,
}: AdminPostsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { status, category, q } = await searchParams;

  // Fetch all categories for filter
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .orderBy(categories.name);

  // Build filter conditions
  const conditions = [];
  if (status && status !== "all") {
    conditions.push(
      eq(
        posts.status,
        status as "draft" | "in_review" | "published" | "archived",
      ),
    );
  }
  if (category && category !== "all") {
    conditions.push(eq(posts.categoryId, category));
  }
  if (q) {
    conditions.push(ilike(posts.title, `%${q}%`));
  }

  const whereClause =
    conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined;

  const allPosts = await db.query.posts.findMany({
    where: whereClause,
    with: {
      category: true,
      author: true,
    },
    orderBy: [
      asc(posts.sortOrder),
      desc(posts.publishedAt),
      desc(posts.createdAt),
    ],
  });

  // Count summaries
  const rawAll = await db.select({ status: posts.status }).from(posts);
  const totalCount = rawAll.length;
  const publishedCount = rawAll.filter((p) => p.status === "published").length;
  const inReviewCount = rawAll.filter((p) => p.status === "in_review").length;
  const draftCount = rawAll.filter((p) => p.status === "draft").length;

  const activeStatus = status || "all";

  return (
    <DashboardShell user={session.user}>
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#151B2E]">
                Editorial Blog Posts
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
              >
                {totalCount} Total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Publish insights, policy explainers, and stories across Port
              Harcourt.
            </p>
          </div>

          <Link href="/admin/posts/new">
            <Button className="h-10 text-xs bg-[#184098] hover:bg-[#08276B] text-white font-bold shadow-xs">
              <Plus className="size-4 mr-1.5 text-[#FDDA32]" />
              New Article
            </Button>
          </Link>
        </div>

        {/* Status & Category Filter Tabs */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-[#D9DEEC] pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <Link
              href={`/admin/posts?status=all${category ? `&category=${category}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "all"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              All ({totalCount})
            </Link>
            <Link
              href={`/admin/posts?status=published${category ? `&category=${category}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "published"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              Published ({publishedCount})
            </Link>
            <Link
              href={`/admin/posts?status=in_review${category ? `&category=${category}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "in_review"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              In Review ({inReviewCount})
            </Link>
            <Link
              href={`/admin/posts?status=draft${category ? `&category=${category}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "draft"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              Drafts ({draftCount})
            </Link>
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] uppercase font-bold text-muted-foreground mr-1 shrink-0">
              Category:
            </span>
            <Link
              href={`/admin/posts?status=${activeStatus}`}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                !category || category === "all"
                  ? "bg-[#EEF2FA] text-[#184098] font-bold"
                  : "text-muted-foreground hover:text-[#184098] hover:bg-[#FAFBFF]"
              }`}
            >
              All
            </Link>
            {allCategories.map((c) => (
              <Link
                key={c.id}
                href={`/admin/posts?status=${activeStatus}&category=${c.id}`}
                className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                  category === c.id
                    ? "bg-[#EEF2FA] text-[#184098] font-bold"
                    : "text-muted-foreground hover:text-[#184098] hover:bg-[#FAFBFF]"
                }`}
              >
                {c.name}
              </Link>
            ))}
          </div>
        </div>

        {/* Desktop Posts Table View (md:block) */}
        <div className="hidden md:block">
          <PostsTable posts={allPosts} />
        </div>

        {/* Mobile Posts Card View (block md:hidden) */}
        <div className="block md:hidden space-y-3">
          {allPosts.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground space-y-2 border-[#D9DEEC] bg-white rounded-lg">
              <BookOpen className="size-8 mx-auto text-muted-foreground/50" />
              <p className="font-medium">No articles found.</p>
              <p className="text-[11px]">
                Click &ldquo;New Article&rdquo; above to create your first
                story.
              </p>
            </Card>
          ) : (
            allPosts.map((post) => (
              <Card
                key={post.id}
                className="p-4 border-[#D9DEEC] bg-white rounded-lg shadow-xs hover:border-[#184098]/30 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant={
                        post.status === "published"
                          ? "success"
                          : post.status === "in_review"
                            ? "amber"
                            : "outline"
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {post.status.replace("_", " ")}
                    </Badge>
                    {post.category && (
                      <Badge
                        variant="outline"
                        className="text-[10px] bg-[#EEF2FA] text-[#184098] border-[#D9DEEC] font-semibold"
                      >
                        {post.category.name}
                      </Badge>
                    )}
                  </div>

                  <PostActionsMenu
                    postId={post.id}
                    postTitle={post.title}
                    postSlug={post.slug}
                    isPublished={post.status === "published"}
                  />
                </div>

                <div>
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    title={post.title}
                    className="font-bold text-sm text-[#184098] hover:underline line-clamp-1 leading-snug"
                  >
                    {post.title}
                  </Link>
                  <span
                    title={`/blog/${post.slug}`}
                    className="font-mono text-[11px] text-muted-foreground block truncate mt-0.5"
                  >
                    /blog/{post.slug}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#D9DEEC]/60 text-[11px] text-muted-foreground">
                  <span className="truncate max-w-[150px] font-medium text-[#151B2E]">
                    {post.author?.name || "Editorial Staff"}
                  </span>
                  <span className="shrink-0">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : new Date(post.createdAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                  </span>
                </div>
              </Card>
            ))
          )}
        </div>
      </main>
    </DashboardShell>
  );
}
