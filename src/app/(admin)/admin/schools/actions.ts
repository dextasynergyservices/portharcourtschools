"use server";

import { and, eq, inArray, ne } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";
import { db, schools } from "@/lib/db";

import { schoolSchema } from "@/lib/validations/school";

export type SchoolActionState = {
  error?: string;
  success?: boolean;
  slug?: string;
  id?: string;
};

export async function checkSchoolSlugAvailabilityAction(
  slug: string,
  currentSchoolId?: string,
): Promise<{ available: boolean }> {
  if (!slug || slug.length < 2) {
    return { available: false };
  }

  const conditions = [eq(schools.slug, slug.trim().toLowerCase())];
  if (currentSchoolId) {
    conditions.push(ne(schools.id, currentSchoolId));
  }

  const [existing] = await db
    .select({ id: schools.id })
    .from(schools)
    .where(and(...conditions))
    .limit(1);

  return { available: !existing };
}

export async function createSchoolAction(
  _prevState: SchoolActionState,
  formData: FormData,
): Promise<SchoolActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const rawLevels = formData.getAll("levels") as string[];
  const rawGallery = formData.get("gallery")
    ? JSON.parse(formData.get("gallery") as string)
    : [];

  const rawSocials = {
    instagram: (formData.get("social_instagram") as string) || undefined,
    facebook: (formData.get("social_facebook") as string) || undefined,
    x: (formData.get("social_x") as string) || undefined,
    tiktok: (formData.get("social_tiktok") as string) || undefined,
  };

  const parseResult = schoolSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    schoolType: formData.get("schoolType") || "private",
    curriculum: formData.get("curriculum") || "nigerian",
    gender: formData.get("gender") || "co_ed",
    boardingType: formData.get("boardingType") || "day",
    levels: rawLevels.length > 0 ? rawLevels : ["Primary"],
    areaId: (formData.get("areaId") as string) || null,
    address: (formData.get("address") as string) || null,
    lga: (formData.get("lga") as string) || null,
    phone: (formData.get("phone") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    email: (formData.get("email") as string) || null,
    website: (formData.get("website") as string) || null,
    socials: rawSocials,
    feeMin: formData.get("feeMin") ? Number(formData.get("feeMin")) : null,
    feeMax: formData.get("feeMax") ? Number(formData.get("feeMax")) : null,
    feePeriod: formData.get("feePeriod") || "per_term",
    feeVisibility: formData.get("feeVisibility") || "band_only",
    logo: (formData.get("logo") as string) || null,
    coverImage: (formData.get("coverImage") as string) || null,
    gallery: rawGallery,
    description: (formData.get("description") as string) || null,
    verified: formData.get("verified") === "true",
    featured: formData.get("featured") === "true",
    status: formData.get("status") || "draft",
  });

  if (!parseResult.success) {
    return {
      error: parseResult.error.issues.map((e) => e.message).join(", "),
    };
  }

  const data = parseResult.data;

  // Check unique slug
  const [existing] = await db
    .select({ id: schools.id })
    .from(schools)
    .where(eq(schools.slug, data.slug))
    .limit(1);

  if (existing) {
    return { error: `A school with slug "${data.slug}" already exists.` };
  }

  try {
    const [inserted] = await db
      .insert(schools)
      .values({
        ...data,
        createdBy: session.user.id || null,
      })
      .returning({ id: schools.id, slug: schools.slug });

    revalidatePath("/schools");
    revalidatePath(`/schools/${inserted.slug}`);
    revalidatePath("/admin/schools");
    revalidatePath("/");
    await invalidateCache(["schools", "homepage"]);

    return { success: true, slug: inserted.slug, id: inserted.id };
  } catch (err) {
    console.error("Failed to create school:", err);
    return { error: "Failed to create school profile. Please try again." };
  }
}

export async function updateSchoolAction(
  id: string,
  _prevState: SchoolActionState,
  formData: FormData,
): Promise<SchoolActionState> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const rawLevels = formData.getAll("levels") as string[];
  const rawGallery = formData.get("gallery")
    ? JSON.parse(formData.get("gallery") as string)
    : [];

  const rawSocials = {
    instagram: (formData.get("social_instagram") as string) || undefined,
    facebook: (formData.get("social_facebook") as string) || undefined,
    x: (formData.get("social_x") as string) || undefined,
    tiktok: (formData.get("social_tiktok") as string) || undefined,
  };

  const parseResult = schoolSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    schoolType: formData.get("schoolType") || "private",
    curriculum: formData.get("curriculum") || "nigerian",
    gender: formData.get("gender") || "co_ed",
    boardingType: formData.get("boardingType") || "day",
    levels: rawLevels.length > 0 ? rawLevels : ["Primary"],
    areaId: (formData.get("areaId") as string) || null,
    address: (formData.get("address") as string) || null,
    lga: (formData.get("lga") as string) || null,
    phone: (formData.get("phone") as string) || null,
    whatsapp: (formData.get("whatsapp") as string) || null,
    email: (formData.get("email") as string) || null,
    website: (formData.get("website") as string) || null,
    socials: rawSocials,
    feeMin: formData.get("feeMin") ? Number(formData.get("feeMin")) : null,
    feeMax: formData.get("feeMax") ? Number(formData.get("feeMax")) : null,
    feePeriod: formData.get("feePeriod") || "per_term",
    feeVisibility: formData.get("feeVisibility") || "band_only",
    logo: (formData.get("logo") as string) || null,
    coverImage: (formData.get("coverImage") as string) || null,
    gallery: rawGallery,
    description: (formData.get("description") as string) || null,
    verified: formData.get("verified") === "true",
    featured: formData.get("featured") === "true",
    status: formData.get("status") || "draft",
  });

  if (!parseResult.success) {
    return {
      error: parseResult.error.issues.map((e) => e.message).join(", "),
    };
  }

  const data = parseResult.data;

  // Check unique slug on other schools
  const [existingSlug] = await db
    .select({ id: schools.id })
    .from(schools)
    .where(and(eq(schools.slug, data.slug), ne(schools.id, id)))
    .limit(1);

  if (existingSlug) {
    return { error: `Another school already uses the slug "${data.slug}".` };
  }

  try {
    const [updated] = await db
      .update(schools)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(eq(schools.id, id))
      .returning({ id: schools.id, slug: schools.slug });

    revalidatePath("/schools");
    revalidatePath(`/schools/${updated.slug}`);
    revalidatePath("/admin/schools");
    revalidatePath(`/admin/schools/${id}/edit`);
    revalidatePath("/");
    await invalidateCache(["schools", "homepage"]);

    return { success: true, slug: updated.slug, id: updated.id };
  } catch (err) {
    console.error("Failed to update school:", err);
    return { error: "Failed to update school profile. Please try again." };
  }
}

export async function deleteSchoolAction(
  id: string,
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const role = (session.user as { role?: string }).role || "creator";
  if (role === "creator") {
    return { error: "Creators do not have permission to delete schools." };
  }

  try {
    const [existing] = await db
      .select({ slug: schools.slug })
      .from(schools)
      .where(eq(schools.id, id))
      .limit(1);

    await db.delete(schools).where(eq(schools.id, id));

    revalidatePath("/schools");
    if (existing) {
      revalidatePath(`/schools/${existing.slug}`);
    }
    revalidatePath("/admin/schools");
    revalidatePath("/");
    await invalidateCache(["schools", "homepage"]);

    return { success: true };
  } catch (err) {
    console.error("Failed to delete school:", err);
    return { error: "Failed to delete school." };
  }
}

export async function toggleSchoolVerifiedAction(
  id: string,
  verified: boolean,
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(schools)
      .set({ verified, updatedAt: new Date() })
      .where(eq(schools.id, id));

    revalidatePath("/admin/schools");
    revalidatePath("/schools");
    await invalidateCache(["schools", "homepage"]);
    return { success: true };
  } catch (err) {
    console.error("Failed to toggle verified:", err);
    return { error: "Failed to update verification status." };
  }
}

export async function toggleSchoolFeaturedAction(
  id: string,
  featured: boolean,
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  try {
    await db
      .update(schools)
      .set({ featured, updatedAt: new Date() })
      .where(eq(schools.id, id));

    revalidatePath("/admin/schools");
    revalidatePath("/schools");
    await invalidateCache(["schools", "homepage"]);
    return { success: true };
  } catch (err) {
    console.error("Failed to toggle featured:", err);
    return { error: "Failed to update featured status." };
  }
}

export async function bulkUpdateSchoolStatusAction(
  ids: string[],
  status: "draft" | "published" | "archived",
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  if (!ids || ids.length === 0) {
    return { error: "No schools selected" };
  }

  try {
    await db
      .update(schools)
      .set({ status, updatedAt: new Date() })
      .where(inArray(schools.id, ids));

    revalidatePath("/admin/schools");
    revalidatePath("/schools");
    await invalidateCache(["schools", "homepage"]);
    return { success: true };
  } catch (err) {
    console.error("Failed bulk status update:", err);
    return { error: "Failed to update status for selected schools." };
  }
}

export async function bulkDeleteSchoolsAction(
  ids: string[],
): Promise<{ success?: boolean; error?: string }> {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized" };
  }

  const role = (session.user as { role?: string }).role || "creator";
  if (role === "creator") {
    return { error: "Creators do not have permission to delete schools." };
  }

  if (!ids || ids.length === 0) {
    return { error: "No schools selected" };
  }

  try {
    await db.delete(schools).where(inArray(schools.id, ids));

    revalidatePath("/admin/schools");
    revalidatePath("/schools");
    await invalidateCache(["schools", "homepage"]);
    return { success: true };
  } catch (err) {
    console.error("Failed bulk delete:", err);
    return { error: "Failed to delete selected schools." };
  }
}
