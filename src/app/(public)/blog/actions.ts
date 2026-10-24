"use server";

import { and, asc, desc, eq } from "drizzle-orm";
import { getOrSetCache } from "@/lib/cache";
import { db, posts } from "@/lib/db";

export type BlogCardPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
  publishedAt: Date | null;
  createdAt: Date;
  category?: {
    id: string;
    name: string;
    slug: string;
  } | null;
};

export async function fetchMoreBlogPostsAction({
  categoryId,
  offset,
  limit = 6,
}: {
  categoryId?: string;
  offset: number;
  limit?: number;
}): Promise<BlogCardPost[]> {
  const safeOffset = Math.max(0, Math.floor(offset) || 0);
  const safeLimit = Math.min(24, Math.max(1, Math.floor(limit) || 6));

  return getOrSetCache(
    `blog:more:${categoryId || "all"}:${safeOffset}:${safeLimit}`,
    ["posts"],
    () => queryBlogPosts(categoryId, safeOffset, safeLimit),
    600,
  );
}

async function queryBlogPosts(
  categoryId: string | undefined,
  offset: number,
  limit: number,
): Promise<BlogCardPost[]> {
  const whereConditions = [eq(posts.status, "published")];
  if (categoryId) {
    whereConditions.push(eq(posts.categoryId, categoryId));
  }

  const items = await db.query.posts.findMany({
    where: and(...whereConditions),
    with: {
      category: true,
    },
    orderBy: [
      asc(posts.sortOrder),
      desc(posts.publishedAt),
      desc(posts.createdAt),
    ],
    offset,
    limit,
  });

  return items.map((p) => ({
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
}
