"use server";

import { and, desc, eq } from "drizzle-orm";
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
  const whereConditions = [eq(posts.status, "published")];
  if (categoryId) {
    whereConditions.push(eq(posts.categoryId, categoryId));
  }

  const items = await db.query.posts.findMany({
    where: and(...whereConditions),
    with: {
      category: true,
      author: true,
    },
    orderBy: [desc(posts.publishedAt), desc(posts.createdAt)],
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
