"use server";

import { eq, inArray } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { contactSubmissions, db } from "@/lib/db";

export async function updateSubmissionStatusAction(
  id: string,
  status: "new" | "read" | "archived",
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    await db
      .update(contactSubmissions)
      .set({ status })
      .where(eq(contactSubmissions.id, id));

    revalidatePath("/admin/submissions");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to update submission status:", err);
    return { error: "Failed to update status." };
  }
}

export async function deleteSubmissionAction(id: string) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized. Please sign in." };
  }

  try {
    await db.delete(contactSubmissions).where(eq(contactSubmissions.id, id));

    revalidatePath("/admin/submissions");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete submission:", err);
    return { error: "Failed to delete submission." };
  }
}

export async function bulkUpdateSubmissionStatusAction(
  ids: string[],
  status: "new" | "read" | "archived",
) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized. Please sign in." };
  }

  if (!ids.length) return { success: true };

  try {
    await db
      .update(contactSubmissions)
      .set({ status })
      .where(inArray(contactSubmissions.id, ids));

    revalidatePath("/admin/submissions");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to bulk update submissions:", err);
    return { error: "Failed to update submissions." };
  }
}

export async function bulkDeleteSubmissionsAction(ids: string[]) {
  const session = await auth();
  if (!session?.user) {
    return { error: "Unauthorized. Please sign in." };
  }

  if (!ids.length) return { success: true };

  try {
    await db
      .delete(contactSubmissions)
      .where(inArray(contactSubmissions.id, ids));

    revalidatePath("/admin/submissions");
    revalidatePath("/admin/dashboard");
    return { success: true };
  } catch (err) {
    console.error("Failed to bulk delete submissions:", err);
    return { error: "Failed to delete submissions." };
  }
}
