"use server";

import { and, eq, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { auth } from "@/lib/auth";
import { db, programmes } from "@/lib/db";

const programmeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  provider: z.string().default("GeePhill"),
  category: z.string().optional().nullable(),
  isAccredited: z.boolean().default(false),
  coverImage: z.string().optional().nullable(),
  status: z.enum(["draft", "published", "archived"]),
});

export type ProgrammeActionState = {
  error?: string;
  success?: boolean;
  slug?: string;
  id?: string;
};

export async function checkProgrammeSlugAvailabilityAction(
  slug: string,
  currentProgrammeId?: string,
): Promise<{ available: boolean }> {
  if (!slug || slug.length < 2) {
    return { available: false };
  }

  const conditions = [eq(programmes.slug, slug.trim().toLowerCase())];
  if (currentProgrammeId) {
    conditions.push(ne(programmes.id, currentProgrammeId));
  }

  const [existing] = await db
    .select({ id: programmes.id })
    .from(programmes)
    .where(and(...conditions))
    .limit(1);

  return { available: !existing };
}

export async function createProgrammeAction(
  _prevState: ProgrammeActionState,
  formData: FormData,
): Promise<ProgrammeActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  const rawTitle = formData.get("title") as string;
  const rawSlug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || "";
  const provider = (formData.get("provider") as string) || "GeePhill";
  const category = (formData.get("category") as string) || null;
  const isAccredited =
    formData.get("isAccredited") === "true" ||
    formData.get("isAccredited") === "on";
  const coverImage = (formData.get("coverImage") as string) || null;
  const status =
    (formData.get("status") as "draft" | "published" | "archived") || "draft";

  if (role === "creator" && (status === "published" || status === "archived")) {
    return {
      error: "Creators can only save programmes as Draft.",
    };
  }

  const parsed = programmeSchema.safeParse({
    title: rawTitle,
    slug: rawSlug,
    description,
    provider,
    category,
    isAccredited,
    coverImage,
    status,
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { error: errorMsg };
  }

  const data = parsed.data;

  const [existingSlug] = await db
    .select({ id: programmes.id })
    .from(programmes)
    .where(eq(programmes.slug, data.slug))
    .limit(1);

  if (existingSlug) {
    return { error: "A programme with this URL slug already exists." };
  }

  try {
    const [newProgramme] = await db
      .insert(programmes)
      .values({
        title: data.title,
        slug: data.slug,
        description: data.description,
        provider: data.provider,
        category: data.category,
        isAccredited: data.isAccredited,
        coverImage: data.coverImage,
        status: data.status,
      })
      .returning({ id: programmes.id, slug: programmes.slug });

    revalidatePath("/events");
    revalidatePath("/admin/programmes");
    revalidatePath("/");

    return { success: true, slug: newProgramme.slug, id: newProgramme.id };
  } catch (err) {
    console.error("Failed to create programme:", err);
    return {
      error: "An unexpected database error occurred. Please try again.",
    };
  }
}

export async function updateProgrammeAction(
  id: string,
  _prevState: ProgrammeActionState,
  formData: FormData,
): Promise<ProgrammeActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  const rawTitle = formData.get("title") as string;
  const rawSlug = formData.get("slug") as string;
  const description = (formData.get("description") as string) || "";
  const provider = (formData.get("provider") as string) || "GeePhill";
  const category = (formData.get("category") as string) || null;
  const isAccredited =
    formData.get("isAccredited") === "true" ||
    formData.get("isAccredited") === "on";
  const coverImage = (formData.get("coverImage") as string) || null;
  const status =
    (formData.get("status") as "draft" | "published" | "archived") || "draft";

  if (role === "creator" && (status === "published" || status === "archived")) {
    return {
      error: "Creators cannot publish or archive programmes.",
    };
  }

  const parsed = programmeSchema.safeParse({
    title: rawTitle,
    slug: rawSlug,
    description,
    provider,
    category,
    isAccredited,
    coverImage,
    status,
  });

  if (!parsed.success) {
    const errorMsg = parsed.error.issues.map((i) => i.message).join(", ");
    return { error: errorMsg };
  }

  const data = parsed.data;

  try {
    const [existing] = await db
      .select({ id: programmes.id, slug: programmes.slug })
      .from(programmes)
      .where(eq(programmes.id, id))
      .limit(1);

    if (!existing) {
      return { error: "Programme not found." };
    }

    if (existing.slug !== data.slug) {
      const [conflict] = await db
        .select({ id: programmes.id })
        .from(programmes)
        .where(and(eq(programmes.slug, data.slug), ne(programmes.id, id)))
        .limit(1);

      if (conflict) {
        return { error: "This slug is already taken by another programme." };
      }
    }

    await db
      .update(programmes)
      .set({
        title: data.title,
        slug: data.slug,
        description: data.description,
        provider: data.provider,
        category: data.category,
        isAccredited: data.isAccredited,
        coverImage: data.coverImage,
        status: data.status,
        updatedAt: new Date(),
      })
      .where(eq(programmes.id, id));

    revalidatePath("/events");
    revalidatePath("/admin/programmes");
    revalidatePath("/");

    return { success: true, slug: data.slug, id };
  } catch (err) {
    console.error("Failed to update programme:", err);
    return {
      error: "An unexpected database error occurred. Please try again.",
    };
  }
}

export async function deleteProgrammeAction(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();

  if (!session?.user) {
    return { error: "Unauthorized." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  if (role === "creator") {
    return { error: "Creators do not have permission to delete programmes." };
  }

  try {
    await db.delete(programmes).where(eq(programmes.id, id));

    revalidatePath("/events");
    revalidatePath("/admin/programmes");
    revalidatePath("/");

    return { success: true };
  } catch (err) {
    console.error("Failed to delete programme:", err);
    return { error: "Failed to delete programme." };
  }
}
