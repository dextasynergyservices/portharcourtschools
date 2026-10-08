"use client";

import { ChevronDown, Loader2 } from "lucide-react";
import { motion } from "motion/react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { isExternalImage, normalizeImageUrl } from "@/lib/utils";
import { type BlogCardPost, fetchMoreBlogPostsAction } from "./actions";

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

interface BlogPostsFeedProps {
  initialPosts: BlogCardPost[];
  totalRemainingCount: number;
  categoryId?: string;
  initialOffset: number;
}

export function BlogPostsFeed({
  initialPosts,
  totalRemainingCount,
  categoryId,
  initialOffset,
}: BlogPostsFeedProps) {
  const [posts, setPosts] = useState<BlogCardPost[]>(initialPosts);
  const [offset, setOffset] = useState(initialOffset);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(posts.length < totalRemainingCount);

  const handleLoadMore = async () => {
    if (isLoading || !hasMore) return;

    setIsLoading(true);
    try {
      const newItems = await fetchMoreBlogPostsAction({
        categoryId,
        offset,
        limit: 6,
      });

      if (newItems.length === 0) {
        setHasMore(false);
      } else {
        const nextPosts = [...posts, ...newItems];
        setPosts(nextPosts);
        setOffset(offset + newItems.length);
        if (nextPosts.length >= totalRemainingCount || newItems.length < 6) {
          setHasMore(false);
        }
      }
    } catch (err) {
      console.error("Failed to load more posts:", err);
    } finally {
      setIsLoading(false);
    }
  };

  if (posts.length === 0) {
    return null;
  }

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between border-b border-[#E4E0D5] pb-3">
        <h2 className="font-heading text-xl font-bold uppercase tracking-tight text-[#151B2E]">
          More Articles
        </h2>
        <span className="text-xs text-muted-foreground font-mono">
          Showing {posts.length} of {totalRemainingCount} Stories
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {posts.map((post) => (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, ease: [0.21, 0.47, 0.32, 0.98] }}
          >
            <article className="group flex flex-col bg-white border border-[#D9DEEC] rounded-[2px] overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-[#184098]/40 transition-all duration-300 h-full">
              {/* 4px Category Top Accent */}
              <div className="h-1 w-full bg-[#184098]" />

              {/* Thumbnail image */}
              {post.coverImage ? (
                <div className="relative h-44 w-full bg-[#EEF2FA] overflow-hidden">
                  <Image
                    src={normalizeImageUrl(post.coverImage)}
                    alt={post.title}
                    fill
                    loading="lazy"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                    className="object-cover group-hover:scale-103 transition-transform duration-300"
                    unoptimized={isExternalImage(post.coverImage)}
                  />
                </div>
              ) : (
                <div className="relative h-44 w-full bg-[#EEF2FA] flex items-center justify-center border-b border-[#D9DEEC] p-4 text-center">
                  <span className="font-heading text-xs font-bold uppercase tracking-wider text-[#184098]/60">
                    PortHarcourtSchools Editorial
                  </span>
                </div>
              )}

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div className="space-y-2.5">
                  {post.category && (
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold tracking-wider bg-[#EEF2FA] text-[#184098] border-[#D9DEEC]"
                    >
                      {post.category.name}
                    </Badge>
                  )}

                  <h3 className="font-heading text-lg font-bold text-[#151B2E] leading-snug group-hover:text-[#184098] transition-colors">
                    <Link href={`/blog/${post.slug}`}>{post.title}</Link>
                  </h3>

                  {post.excerpt && (
                    <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed line-clamp-3">
                      {post.excerpt}
                    </p>
                  )}
                </div>

                <div className="pt-3 border-t border-[#D9DEEC] flex items-center justify-between text-xs">
                  <span className="text-muted-foreground text-[11px]">
                    {post.publishedAt
                      ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })
                      : "Recent"}
                  </span>
                  <Link
                    href={`/blog/${post.slug}`}
                    className="font-display text-[11px] font-bold uppercase tracking-wider text-[#184098] inline-flex items-center group-hover:underline"
                  >
                    <span>Read Story</span>
                    <ArrowDiagonal />
                  </Link>
                </div>
              </div>
            </article>
          </motion.div>
        ))}
      </div>

      {/* Load More Pagination Section */}
      <div className="pt-6 pb-2 text-center">
        {hasMore ? (
          <Button
            type="button"
            onClick={handleLoadMore}
            disabled={isLoading}
            variant="outline"
            className="h-12 px-8 rounded-[2px] border-2 border-[#184098] text-[#184098] hover:bg-[#184098] hover:text-white font-display text-xs font-bold uppercase tracking-widest transition-all duration-200 shadow-sm"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin mr-2 text-current" />
                <span>Loading Stories...</span>
              </>
            ) : (
              <>
                <span>Load More Stories</span>
                <ChevronDown className="size-4 ml-2" />
              </>
            )}
          </Button>
        ) : (
          <p className="text-xs font-mono text-muted-foreground italic">
            You&rsquo;ve reached the end of our current stories.
          </p>
        )}
      </div>
    </div>
  );
}
