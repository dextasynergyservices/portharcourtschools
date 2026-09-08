"use server";

import { desc, eq, ilike, or } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { db, media } from "@/lib/db";
import {
  deleteR2Object,
  getR2PresignedUploadUrl,
  isR2Configured,
} from "@/lib/r2";

/**
 * Check if Cloudflare R2 is configured for the admin UI.
 */
export async function checkR2StatusAction() {
  return { configured: isR2Configured() };
}

/**
 * Generates a presigned PUT upload URL for Cloudflare R2.
 * Zero local filesystem storage.
 */
export async function getPresignedUploadUrlAction(params: {
  filename: string;
  mimeType: string;
  folder?: string;
}): Promise<import("@/lib/r2").PresignedUploadResult> {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  return await getR2PresignedUploadUrl(params);
}

/**
 * Record a newly uploaded image into the media library database.
 */
export async function createMediaRecordAction(data: {
  url: string;
  filename: string;
  mimeType: string;
  sizeBytes: number;
  altText?: string;
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [inserted] = await db
      .insert(media)
      .values({
        url: data.url,
        filename: data.filename,
        mimeType: data.mimeType,
        sizeBytes: data.sizeBytes,
        altText: data.altText || "",
        uploadedBy: session.user.id,
      })
      .returning();

    revalidatePath("/admin/media");
    return { success: true, item: inserted };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to record media";
    return { success: false, error: message };
  }
}

/**
 * Query media items with optional search and limit.
 */
export async function getMediaListAction(params?: {
  search?: string;
  limit?: number;
}) {
  try {
    const query = params?.search?.trim();
    const limit = params?.limit || 50;

    let items: (typeof media.$inferSelect)[] = [];
    if (query) {
      items = await db
        .select()
        .from(media)
        .where(
          or(
            ilike(media.filename, `%${query}%`),
            ilike(media.altText, `%${query}%`),
          ),
        )
        .orderBy(desc(media.createdAt))
        .limit(limit);
    } else {
      items = await db
        .select()
        .from(media)
        .orderBy(desc(media.createdAt))
        .limit(limit);
    }

    return { success: true, items };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to fetch media";
    return { success: false, error: message, items: [] };
  }
}

/**
 * Update alt-text for a media asset.
 */
export async function updateMediaAltTextAction(
  mediaId: string,
  altText: string,
) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    await db.update(media).set({ altText }).where(eq(media.id, mediaId));

    revalidatePath("/admin/media");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to update alt text";
    return { success: false, error: message };
  }
}

/**
 * Delete a media asset from R2 and database.
 */
export async function deleteMediaAction(mediaId: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized" };
  }

  try {
    const [existing] = await db
      .select()
      .from(media)
      .where(eq(media.id, mediaId))
      .limit(1);

    if (!existing) {
      return { success: false, error: "Media item not found" };
    }

    // Attempt R2 deletion if key can be extracted and R2 is configured
    if (isR2Configured() && existing.url) {
      try {
        const urlObj = new URL(existing.url);
        const key = urlObj.pathname.replace(/^\//, "");
        if (key) {
          await deleteR2Object(key);
        }
      } catch {
        // Continue if URL parsing fails or external URL
      }
    }

    await db.delete(media).where(eq(media.id, mediaId));
    revalidatePath("/admin/media");
    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to delete media";
    return { success: false, error: message };
  }
}
