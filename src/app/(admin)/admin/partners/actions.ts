"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { invalidateCache } from "@/lib/cache";
import { db, partners } from "@/lib/db";
import { partnerSchema } from "@/lib/validations/partner";

export type PartnerActionState = {
  error?: string;
  success?: boolean;
  id?: string;
};

export async function createPartnerAction(
  _prevState: PartnerActionState,
  formData: FormData,
): Promise<PartnerActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const rawData = {
    name: formData.get("name"),
    logo: formData.get("logo"),
    tier: formData.get("tier") || "partner",
    website: formData.get("website") || null,
    description: formData.get("description") || null,
    isActive: formData.get("isActive") === "true",
    order: formData.get("order") ? Number(formData.get("order")) : 0,
  };

  const parsed = partnerSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message || "Invalid partner data provided.";
    return { error: firstError };
  }

  try {
    const [inserted] = await db
      .insert(partners)
      .values({
        name: parsed.data.name,
        logo: parsed.data.logo,
        tier: parsed.data.tier,
        website: parsed.data.website,
        description: parsed.data.description,
        isActive: parsed.data.isActive,
        order: parsed.data.order,
      })
      .returning({ id: partners.id });

    await invalidateCache(["partners", "homepage"]);
    revalidatePath("/");
    revalidatePath("/partners");
    revalidatePath("/admin/partners");

    return { success: true, id: inserted.id };
  } catch (err) {
    console.error("Failed to create partner:", err);
    return {
      error: "An unexpected database error occurred while creating partner.",
    };
  }
}

export async function updatePartnerAction(
  partnerId: string,
  _prevState: PartnerActionState,
  formData: FormData,
): Promise<PartnerActionState> {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to perform this action." };
  }

  const rawData = {
    name: formData.get("name"),
    logo: formData.get("logo"),
    tier: formData.get("tier") || "partner",
    website: formData.get("website") || null,
    description: formData.get("description") || null,
    isActive: formData.get("isActive") === "true",
    order: formData.get("order") ? Number(formData.get("order")) : 0,
  };

  const parsed = partnerSchema.safeParse(rawData);

  if (!parsed.success) {
    const firstError =
      parsed.error.issues[0]?.message || "Invalid partner data provided.";
    return { error: firstError };
  }

  try {
    await db
      .update(partners)
      .set({
        name: parsed.data.name,
        logo: parsed.data.logo,
        tier: parsed.data.tier,
        website: parsed.data.website,
        description: parsed.data.description,
        isActive: parsed.data.isActive,
        order: parsed.data.order,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, partnerId));

    await invalidateCache(["partners", "homepage"]);
    revalidatePath("/");
    revalidatePath("/partners");
    revalidatePath("/admin/partners");

    return { success: true, id: partnerId };
  } catch (err) {
    console.error("Failed to update partner:", err);
    return { error: "An unexpected error occurred while updating partner." };
  }
}

export async function deletePartnerAction(
  partnerId: string,
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to delete a partner." };
  }

  try {
    await db.delete(partners).where(eq(partners.id, partnerId));

    await invalidateCache(["partners", "homepage"]);
    revalidatePath("/");
    revalidatePath("/partners");
    revalidatePath("/admin/partners");

    return { success: true };
  } catch (err) {
    console.error("Failed to delete partner:", err);
    return { error: "An error occurred while deleting partner." };
  }
}

export async function togglePartnerActiveAction(
  partnerId: string,
  isActive: boolean,
): Promise<{ error?: string; success?: boolean }> {
  const session = await auth();

  if (!session?.user) {
    return { error: "You must be signed in to modify partner status." };
  }

  try {
    await db
      .update(partners)
      .set({
        isActive,
        updatedAt: new Date(),
      })
      .where(eq(partners.id, partnerId));

    await invalidateCache(["partners", "homepage"]);
    revalidatePath("/");
    revalidatePath("/partners");
    revalidatePath("/admin/partners");

    return { success: true };
  } catch (err) {
    console.error("Failed to toggle partner status:", err);
    return { error: "Failed to update partner active status." };
  }
}
