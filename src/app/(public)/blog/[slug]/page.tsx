import { and, asc, desc, eq, ne } from "drizzle-orm";
import { ArrowLeft, Calendar, Clock, Tag } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import { getOrSetCache } from "@/lib/cache";
import { db, posts } from "@/lib/db";
import { ShareButtons } from "./share-buttons";

export const revalidate = 600;

interface ArticlePageProps {
  params: Promise<{
    slug: string;
  }>;
}

function calculateReadingTime(html: string): number {
  const text = html.replace(/<[^>]*>/g, "");
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.ceil(words / 200));
}

const getPostBySlug = cache(async (slug: string) => {
  return getOrSetCache(
    `post:${slug}`,
    ["posts", `post:${slug}`],
    async () => {
      const [post] = await db.query.posts.findMany({
        where: eq(posts.slug, slug),
        with: {
          category: true,
          author: true,
        },
        limit: 1,
      });
      return post || null;
    },
    600,
  );
});

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

export async function generateMetadata({
  params,
}: ArticlePageProps): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPostBySlug(slug);

  if (!post) {
    return {
      title:
        "Article Not Found — Schools Voice (Formerly Port Harcourt Schools)",
    };
  }

  const title = `${post.title} — Schools Voice (Formerly Port Harcourt Schools)`;
  const description =
    post.excerpt ||
    "In-depth analysis and educational clarity from inside Port Harcourt's schools.";
  const image = post.coverImage || "/images/ph_hero_classroom.jpg";

  return {
    title,
    description,
    alternates: {
      canonical: `/blog/${post.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "article",
      publishedTime: post.publishedAt?.toISOString(),
      modifiedTime: post.updatedAt?.toISOString(),
      authors: [post.author?.name || "PortHarcourtSchools Editorial Staff"],
      images: [
        {
          url: image,
          width: 1200,
          height: 630,
          alt: post.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [image],
    },
  };
}

export default async function ArticleDetailPage({ params }: ArticlePageProps) {
  const { slug } = await params;

  const post = await getPostBySlug(slug);

  if (!post || post.status !== "published") {
    notFound();
  }

  const readingTime = calculateReadingTime(post.body);
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    (process.env.VERCEL_URL && process.env.VERCEL_URL !== "undefined"
      ? `https://${process.env.VERCEL_URL}`
      : "https://portharcourtschools.com");
  const siteUrl = (
    rawUrl.includes("undefined") ? "https://portharcourtschools.com" : rawUrl
  ).replace(/\/$/, "");
  const articleUrl = `${siteUrl}/blog/${post.slug}`;

  // Fetch related articles from same category or newest
  const relatedPosts = await db.query.posts.findMany({
    where: and(
      eq(posts.status, "published"),
      ne(posts.id, post.id),
      post.categoryId ? eq(posts.categoryId, post.categoryId) : undefined,
    ),
    with: {
      category: true,
      author: true,
    },
    orderBy: [asc(posts.sortOrder), desc(posts.publishedAt)],
    limit: 3,
  });

  // JSON-LD Structured Data
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt,
    image: post.coverImage ? [`${siteUrl}${post.coverImage}`] : [],
    datePublished: post.publishedAt?.toISOString(),
    dateModified: post.updatedAt?.toISOString(),
    author: {
      "@type": "Person",
      name: post.author?.name || "Schools Voice Editorial Staff",
    },
    publisher: {
      "@type": "Organization",
      name: "Schools Voice (Formerly Port Harcourt Schools)",
      logo: {
        "@type": "ImageObject",
        url: `${siteUrl}/images/logo.png`,
      },
    },
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": articleUrl,
    },
  };

  return (
    <article className="w-full bg-[#FAFBFF] text-[#151B2E]">
      {/* Inject Structured Data */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top 5px Accent Bar */}
      <div className="h-1.5 w-full bg-[#184098]" />

      {/* Header Container */}
      <header className="bg-white border-b border-[#D9DEEC] py-10 sm:py-16">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Breadcrumb Navigation */}
          <FadeIn>
            <nav className="flex items-center gap-2 text-xs text-muted-foreground font-sans">
              <Link href="/" className="hover:text-[#184098] transition-colors">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/blog"
                className="hover:text-[#184098] transition-colors"
              >
                Blog
              </Link>
              {post.category && (
                <>
                  <span>/</span>
                  <Link
                    href={`/blog?category=${post.category.slug}`}
                    className="text-[#184098] font-semibold hover:underline"
                  >
                    {post.category.name}
                  </Link>
                </>
              )}
            </nav>
          </FadeIn>

          {/* Category Tag & Metadata */}
          <FadeIn delay={0.08}>
            <div className="flex flex-wrap items-center gap-3">
              {post.category && (
                <span className="inline-block px-3 py-1 bg-[#184098] text-white font-display text-xs font-bold uppercase tracking-widest rounded-[2px]">
                  {post.category.name}
                </span>
              )}

              <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-sans">
                <Clock className="size-3.5" />
                {readingTime} min read
              </span>

              {post.publishedAt && (
                <span className="inline-flex items-center gap-1 text-xs text-muted-foreground font-sans">
                  <Calendar className="size-3.5" />
                  {new Date(post.publishedAt).toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "long",
                    year: "numeric",
                  })}
                </span>
              )}
            </div>
          </FadeIn>

          {/* Headline */}
          <FadeIn delay={0.16}>
            <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-[#151B2E] tracking-tight leading-tight">
              {post.title}
            </h1>
          </FadeIn>

          {/* Excerpt / Lead Paragraph */}
          {post.excerpt && (
            <FadeIn delay={0.24}>
              <p className="text-lg sm:text-xl text-[#35362B] leading-relaxed font-sans border-l-4 border-[#FDDA32] pl-4 italic">
                {post.excerpt}
              </p>
            </FadeIn>
          )}

          {/* Author & Share Row */}
          <FadeIn
            delay={0.32}
            className="pt-4 border-t border-[#D9DEEC] flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"
          >
            <div className="flex items-center gap-3">
              <div className="flex size-10 items-center justify-center rounded-full bg-[#184098] text-[#FDDA32] font-bold text-sm">
                {post.author?.name ? post.author.name.charAt(0) : "P"}
              </div>
              <div>
                <p className="font-bold text-xs sm:text-sm text-[#151B2E]">
                  {post.author?.name || "PortHarcourtSchools Editorial Staff"}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  EdFocus Africa Research &amp; Journalism
                </p>
              </div>
            </div>

            <ShareButtons title={post.title} url={articleUrl} />
          </FadeIn>
        </div>
      </header>

      {/* Featured Cover Photo */}
      {post.coverImage && (
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 -mt-6 sm:-mt-8">
          <div className="relative h-[300px] sm:h-[480px] w-full rounded-[2px] overflow-hidden border border-[#D9DEEC] shadow-lg bg-[#EEF2FA]">
            <Image
              src={post.coverImage}
              alt={post.title}
              fill
              sizes="(max-width: 1024px) 100vw, 1024px"
              className="object-cover"
              priority
            />
          </div>
        </div>
      )}

      {/* Article Body Content */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16">
        <div
          className="font-sans text-base sm:text-lg text-[#151B2E] leading-relaxed space-y-6
            [&>h2]:font-heading [&>h2]:text-2xl [&>h2]:sm:text-3xl [&>h2]:font-black [&>h2]:text-[#184098] [&>h2]:mt-10 [&>h2]:mb-4 [&>h2]:leading-snug
            [&>h3]:font-heading [&>h3]:text-xl [&>h3]:sm:text-2xl [&>h3]:font-bold [&>h3]:text-[#151B2E] [&>h3]:mt-8 [&>h3]:mb-3
            [&>p]:leading-relaxed [&>p]:text-[#151B2E]
            [&>ul]:list-disc [&>ul]:pl-6 [&>ul]:space-y-2 [&>ul]:my-4
            [&>ol]:list-decimal [&>ol]:pl-6 [&>ol]:space-y-2 [&>ol]:my-4
            [&>blockquote]:border-l-4 [&>blockquote]:border-[#FDDA32] [&>blockquote]:pl-5 [&>blockquote]:py-2 [&>blockquote]:my-8 [&>blockquote]:bg-[#F5F4F0] [&>blockquote]:text-lg [&>blockquote]:italic [&>blockquote]:text-[#184098]
            [&>img]:rounded-[2px] [&>img]:my-6 [&>img]:shadow-md
            [&>a]:text-[#184098] [&>a]:font-bold [&>a]:underline hover:[&>a]:text-[#08276B]"
          // biome-ignore lint/security/noDangerouslySetInnerHtml: Sanitized article body content
          dangerouslySetInnerHTML={{ __html: post.body }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-12 pt-6 border-t border-[#D9DEEC] flex flex-wrap items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground mr-1 flex items-center gap-1">
              <Tag className="size-3" />
              Tags:
            </span>
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="px-2.5 py-1 rounded-[2px] bg-[#EEF2FA] text-[#184098] text-xs font-medium border border-[#D9DEEC]"
              >
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Bottom Share Row */}
        <div className="mt-8 pt-6 border-t border-[#D9DEEC] flex items-center justify-between">
          <Link
            href="/blog"
            className="inline-flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-[#184098] hover:text-[#08276B]"
          >
            <ArrowLeft className="size-3.5" />
            <span>Back to All Stories</span>
          </Link>
          <ShareButtons title={post.title} url={articleUrl} />
        </div>
      </div>

      {/* Related Stories */}
      {relatedPosts.length > 0 && (
        <section className="bg-[#F5F4F0] border-t border-[#E4E0D5] py-16 sm:py-24">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
            <div className="flex items-center justify-between border-b border-[#E4E0D5] pb-4">
              <h2 className="font-heading text-xl sm:text-2xl font-black uppercase tracking-tight text-[#151B2E]">
                Related Stories &amp; Insights
              </h2>
              <Link
                href="/blog"
                className="font-display text-xs font-bold uppercase tracking-widest text-[#184098] hover:underline"
              >
                View Blog
              </Link>
            </div>

            <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {relatedPosts.map((rPost) => (
                <StaggerItem key={rPost.id}>
                  <div className="group bg-white border border-[#D9DEEC] rounded-[2px] overflow-hidden hover:shadow-xl transition-all duration-300 h-full flex flex-col justify-between">
                    <div className="h-1 w-full bg-[#184098]" />

                    {rPost.coverImage && (
                      <div className="relative h-40 w-full bg-[#EEF2FA] overflow-hidden">
                        <Image
                          src={rPost.coverImage}
                          alt={rPost.title}
                          fill
                          loading="lazy"
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover group-hover:scale-103 transition-transform duration-300"
                        />
                      </div>
                    )}

                    <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
                      <div className="space-y-2">
                        {rPost.category && (
                          <Badge
                            variant="outline"
                            className="text-[9px] uppercase font-bold tracking-wider bg-[#EEF2FA] text-[#184098] border-[#D9DEEC]"
                          >
                            {rPost.category.name}
                          </Badge>
                        )}
                        <h3 className="font-heading text-base font-bold text-[#151B2E] leading-snug group-hover:text-[#184098] transition-colors line-clamp-2">
                          <Link href={`/blog/${rPost.slug}`}>
                            {rPost.title}
                          </Link>
                        </h3>
                      </div>

                      <div className="pt-2 border-t border-[#D9DEEC] flex items-center justify-between text-[11px]">
                        <span className="text-muted-foreground">
                          {rPost.publishedAt
                            ? new Date(rPost.publishedAt).toLocaleDateString(
                                "en-GB",
                                {
                                  day: "numeric",
                                  month: "short",
                                },
                              )
                            : "Recent"}
                        </span>
                        <Link
                          href={`/blog/${rPost.slug}`}
                          className="font-bold text-[#184098] group-hover:underline inline-flex items-center"
                        >
                          <span>Read</span>
                          <ArrowDiagonal className="size-3" />
                        </Link>
                      </div>
                    </div>
                  </div>
                </StaggerItem>
              ))}
            </StaggerContainer>
          </div>
        </section>
      )}
    </article>
  );
}
