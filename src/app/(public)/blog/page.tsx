import { and, asc, count, desc, eq } from "drizzle-orm";
import { BookOpen } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { FadeIn } from "@/components/site/motion-wrapper";
import { categories, db, posts } from "@/lib/db";
import { isExternalImage, normalizeImageUrl } from "@/lib/utils";
import { BlogPostsFeed } from "./blog-posts-feed";

export const revalidate = 180;

export const metadata: Metadata = {
  title:
    "Editorial Blog — Schools Voice (Formerly Port Harcourt Schools) | Stories, Insights & Clarity",
  description:
    "Stories, insights and clarity from inside Port Harcourt's schools. Breaking down curriculum changes, safeguarding practices, school leadership challenges and everyday realities of education.",
  alternates: {
    canonical: "/blog",
  },
};

function ArrowDiagonal({
  className = "size-3.5 ml-1",
}: {
  className?: string;
}) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 ${className}`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.43934 3.21973H3.37645V0.219727H13.5607V10.1145H10.5607V5.34105L2.12132 13.7804L0 11.6591L8.43934 3.21973Z"
        fill="currentColor"
      />
    </svg>
  );
}

interface BlogPageProps {
  searchParams: Promise<{
    category?: string;
    page?: string;
  }>;
}

export default async function BlogListingPage({ searchParams }: BlogPageProps) {
  const { category: activeCategorySlug } = await searchParams;

  // 1. Fetch all categories
  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .orderBy(categories.name);

  // 2. Resolve selected category ID
  let selectedCategoryId: string | undefined;
  let activeCategoryName: string | undefined;

  if (activeCategorySlug) {
    const matched = allCategories.find((c) => c.slug === activeCategorySlug);
    if (matched) {
      selectedCategoryId = matched.id;
      activeCategoryName = matched.name;
    }
  }

  // 3. Query published posts with total count
  const whereConditions = [eq(posts.status, "published")];
  if (selectedCategoryId) {
    whereConditions.push(eq(posts.categoryId, selectedCategoryId));
  }

  const [countResult] = await db
    .select({ value: count() })
    .from(posts)
    .where(and(...whereConditions));
  const totalPublishedCount = countResult?.value || 0;

  const INITIAL_BATCH_SIZE = 7; // 1 featured + 6 initial grid cards
  const publishedPosts = await db.query.posts.findMany({
    where: and(...whereConditions),
    with: {
      category: true,
      author: true,
    },
    orderBy: [
      asc(posts.sortOrder),
      desc(posts.publishedAt),
      desc(posts.createdAt),
    ],
    limit: INITIAL_BATCH_SIZE,
  });

  const featuredPost = publishedPosts[0];
  const remainingPosts = publishedPosts.slice(1).map((p) => ({
    id: p.id,
    title: p.title,
    slug: p.slug,
    excerpt: p.excerpt,
    coverImage: p.coverImage,
    publishedAt: p.publishedAt,
    createdAt: p.createdAt,
    category: p.category
      ? {
          id: p.category.id,
          name: p.category.name,
          slug: p.category.slug,
        }
      : null,
  }));
  const totalRemainingCount = Math.max(0, totalPublishedCount - 1);

  return (
    <div className="w-full bg-[#F5F4F0] text-[#151B2E]">
      {/* Header with ICLE Watermark */}
      <section className="relative overflow-hidden bg-[#F5F4F0] border-b border-[#E4E0D5] pt-16 pb-16 sm:pt-24 sm:pb-24">
        <span className="offset_subheader" aria-hidden="true">
          Editorial Insights
        </span>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          <FadeIn>
            <div className="inline-flex items-center rounded-[2px] border border-[#184098]/30 bg-white/80 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              PortHarcourtSchools Journalism &amp; Policy
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#151B2E] uppercase leading-tight max-w-4xl">
              Stories, insights and clarity from inside Port Harcourt&rsquo;s
              schools.
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="text-base sm:text-xl text-[#35362B] leading-relaxed max-w-3xl font-sans">
              Our blog is where we go deeper than a social post allows, breaking
              down curriculum changes, safeguarding practices, school leadership
              challenges and the everyday realities of education in Port
              Harcourt and beyond.
            </p>
          </FadeIn>

          {/* Category Filter Pills */}
          <FadeIn delay={0.24}>
            <div className="pt-4 flex flex-wrap items-center gap-2">
              <Link
                href="/blog"
                className={`px-3.5 py-1.5 rounded-[2px] font-display text-xs font-bold uppercase tracking-wider transition-all ${
                  !activeCategorySlug
                    ? "bg-[#184098] text-white shadow-xs"
                    : "bg-white border border-[#D9DEEC] text-[#151B2E] hover:border-[#184098] hover:text-[#184098]"
                }`}
              >
                All Stories ({publishedPosts.length})
              </Link>
              {allCategories.map((cat) => {
                const isActive = activeCategorySlug === cat.slug;
                return (
                  <Link
                    key={cat.id}
                    href={`/blog?category=${cat.slug}`}
                    className={`px-3.5 py-1.5 rounded-[2px] font-display text-xs font-bold uppercase tracking-wider transition-all ${
                      isActive
                        ? "bg-[#184098] text-white shadow-xs"
                        : "bg-white border border-[#D9DEEC] text-[#151B2E] hover:border-[#184098] hover:text-[#184098]"
                    }`}
                  >
                    {cat.name}
                  </Link>
                );
              })}
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-12 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        {publishedPosts.length === 0 ? (
          /* Exact brief placeholder when empty */
          <FadeIn className="bg-white border border-[#D9DEEC] rounded-[2px] p-8 sm:p-16 text-center max-w-2xl mx-auto space-y-6 shadow-sm">
            <div className="flex size-14 items-center justify-center rounded-full bg-[#EEF2FA] text-[#184098] mx-auto">
              <BookOpen className="size-7" />
            </div>
            <div className="space-y-2">
              <h3 className="font-heading text-xl font-bold text-[#151B2E]">
                {activeCategoryName
                  ? `No stories in "${activeCategoryName}" yet`
                  : "No stories published yet"}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                New stories are added regularly. Check back soon, or follow
                @portharcourtschools so you never miss one.
              </p>
            </div>
            <a
              href="https://instagram.com/portharcourtschools"
              target="_blank"
              rel="noopener noreferrer"
              className="cta-button cta-primary inline-flex font-bold"
            >
              <span>Join the Community</span>
              <ArrowDiagonal className="text-[#151B2E]" />
            </a>
          </FadeIn>
        ) : (
          <>
            {/* Featured Hero Article (First Item) */}
            {featuredPost && (
              <FadeIn>
                <div className="group relative bg-white border border-[#D9DEEC] rounded-[2px] overflow-hidden hover:shadow-xl transition-all duration-300">
                  {/* Top 5px Accent Bar */}
                  <div className="h-1.5 w-full bg-[#184098]" />

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-0">
                    {/* Cover Photo */}
                    <div className="lg:col-span-6 relative min-h-[280px] lg:min-h-[420px] bg-[#EEF2FA] overflow-hidden">
                      <Image
                        src={normalizeImageUrl(featuredPost.coverImage)}
                        alt={featuredPost.title}
                        fill
                        sizes="(max-width: 1024px) 100vw, 50vw"
                        className="object-cover group-hover:scale-102 transition-transform duration-500"
                        priority
                        unoptimized={isExternalImage(featuredPost.coverImage)}
                      />
                    </div>

                    {/* Content */}
                    <div className="lg:col-span-6 p-6 sm:p-10 flex flex-col justify-between space-y-6">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="inline-block px-2.5 py-0.5 bg-[#184098] text-white font-display text-[10px] font-bold uppercase tracking-widest rounded-[2px]">
                            Featured Editorial
                          </span>
                          {featuredPost.category && (
                            <span className="font-display text-xs font-bold uppercase tracking-wider text-[#184098]">
                              {featuredPost.category.name}
                            </span>
                          )}
                        </div>

                        <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black text-[#151B2E] leading-tight group-hover:text-[#184098] transition-colors">
                          <Link href={`/blog/${featuredPost.slug}`}>
                            {featuredPost.title}
                          </Link>
                        </h2>

                        <p className="text-sm sm:text-base text-[#35362B] leading-relaxed font-sans line-clamp-3">
                          {featuredPost.excerpt}
                        </p>
                      </div>

                      <div className="pt-4 border-t border-[#D9DEEC] flex items-center justify-between">
                        <div className="text-xs text-muted-foreground">
                          <span>
                            By {featuredPost.author?.name || "Editorial Staff"}
                          </span>
                          {featuredPost.publishedAt && (
                            <span className="ml-2">
                              •{" "}
                              {new Date(
                                featuredPost.publishedAt,
                              ).toLocaleDateString("en-GB", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                              })}
                            </span>
                          )}
                        </div>

                        <Link
                          href={`/blog/${featuredPost.slug}`}
                          className="font-display text-xs font-bold uppercase tracking-widest text-[#184098] group-hover:text-[#08276B] inline-flex items-center"
                        >
                          <span>Read Full Story</span>
                          <ArrowDiagonal />
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              </FadeIn>
            )}

            {/* Remaining Articles 3-Column Grid with Load More */}
            {remainingPosts.length > 0 && (
              <BlogPostsFeed
                initialPosts={remainingPosts}
                totalRemainingCount={totalRemainingCount}
                categoryId={selectedCategoryId}
                initialOffset={1 + remainingPosts.length}
              />
            )}
          </>
        )}
      </section>
    </div>
  );
}
