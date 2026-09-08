"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";
import { db, posts } from "@/lib/db";

import { postSchema } from "@/lib/validations/post";

export type PostActionState = {
  error?: string;
  success?: boolean;
  slug?: string;
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export async function createPostAction(
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  const rawTitle = formData.get("title") as string;
  const rawSlug = (formData.get("slug") as string) || slugify(rawTitle || "");
  const excerpt = (formData.get("excerpt") as string) || undefined;
  const body = (formData.get("body") as string) || "";
  const coverImage = (formData.get("coverImage") as string) || undefined;
  const categoryId = (formData.get("categoryId") as string) || null;
  const rawTags = (formData.get("tags") as string) || "";
  const tags = rawTags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const status = (formData.get("status") as string) || "draft";

  // Role gating: Creators cannot publish directly
  if (role === "creator" && (status === "published" || status === "archived")) {
    return {
      error:
        "Creators cannot publish directly. Please save as Draft or Submit for Review.",
    };
  }

  // Validate fields
  const parseResult = postSchema.safeParse({
    title: rawTitle,
    slug: rawSlug,
    excerpt,
    body,
    coverImage,
    categoryId: categoryId === "none" ? null : categoryId,
    tags,
    status,
  });

  if (!parseResult.error && !parseResult.data) {
    return { error: "Validation failed." };
  }

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const data = parseResult.data;

  // Check unique slug collision
  const [existing] = await db
    .select({ id: posts.id })
    .from(posts)
    .where(eq(posts.slug, data.slug))
    .limit(1);

  const finalSlug = existing
    ? `${data.slug}-${Math.random().toString(36).substring(2, 6)}`
    : data.slug;

  try {
    await db.insert(posts).values({
      title: data.title,
      slug: finalSlug,
      excerpt: data.excerpt,
      body: data.body,
      coverImage: data.coverImage,
      categoryId: data.categoryId,
      tags: data.tags,
      authorId: session.user.id || null,
      status: data.status,
      publishedAt: data.status === "published" ? new Date() : null,
    });

    revalidatePath("/blog");
    revalidatePath(`/blog/${finalSlug}`);
    revalidatePath("/");
    await invalidateCache(["posts", "homepage"]);

    return { success: true, slug: finalSlug };
  } catch (err) {
    console.error("Failed to create post:", err);
    return {
      error: "An unexpected database error occurred. Please try again.",
    };
  }
}

export async function updatePostAction(
  id: string,
  _prevState: PostActionState,
  formData: FormData,
): Promise<PostActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  const rawTitle = formData.get("title") as string;
  const rawSlug = (formData.get("slug") as string) || slugify(rawTitle || "");
  const excerpt = (formData.get("excerpt") as string) || undefined;
  const body = (formData.get("body") as string) || "";
  const coverImage = (formData.get("coverImage") as string) || undefined;
  const categoryId = (formData.get("categoryId") as string) || null;
  const rawTags = (formData.get("tags") as string) || "";
  const tags = rawTags
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const status = (formData.get("status") as string) || "draft";

  // Role gating: Creators cannot publish directly
  if (role === "creator" && (status === "published" || status === "archived")) {
    return {
      error:
        "Creators cannot publish directly. Please save as Draft or Submit for Review.",
    };
  }

  const parseResult = postSchema.safeParse({
    title: rawTitle,
    slug: rawSlug,
    excerpt,
    body,
    coverImage,
    categoryId: categoryId === "none" ? null : categoryId,
    tags,
    status,
  });

  if (!parseResult.success) {
    return { error: parseResult.error.issues[0].message };
  }

  const data = parseResult.data;

  try {
    const [existingPost] = await db
      .select()
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    if (!existingPost) {
      return { error: "Post not found." };
    }

    const isPublishingNow =
      data.status === "published" && existingPost.status !== "published";

    await db
      .update(posts)
      .set({
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        body: data.body,
        coverImage: data.coverImage,
        categoryId: data.categoryId,
        tags: data.tags,
        status: data.status,
        publishedAt: isPublishingNow ? new Date() : existingPost.publishedAt,
        updatedAt: new Date(),
      })
      .where(eq(posts.id, id));

    revalidatePath("/blog");
    revalidatePath(`/blog/${data.slug}`);
    if (existingPost.slug !== data.slug) {
      revalidatePath(`/blog/${existingPost.slug}`);
    }
    revalidatePath("/");
    await invalidateCache(["posts", "homepage"]);

    return { success: true, slug: data.slug };
  } catch (err) {
    console.error("Failed to update post:", err);
    return {
      error: "An unexpected database error occurred. Please try again.",
    };
  }
}

export async function deletePostAction(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  if (role === "creator") {
    return { error: "Creators do not have permission to delete posts." };
  }

  try {
    const [existing] = await db
      .select({ slug: posts.slug })
      .from(posts)
      .where(eq(posts.id, id))
      .limit(1);

    await db.delete(posts).where(eq(posts.id, id));

    revalidatePath("/blog");
    if (existing) {
      revalidatePath(`/blog/${existing.slug}`);
    }
    revalidatePath("/");
    await invalidateCache(["posts", "homepage"]);

    return { success: true };
  } catch (err) {
    console.error("Failed to delete post:", err);
    return { error: "Failed to delete post." };
  }
}
