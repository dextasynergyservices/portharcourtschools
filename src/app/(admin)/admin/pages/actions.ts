"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { getOrSetCache, invalidateCache } from "@/lib/cache";
import { CMS_PAGES_CONFIG } from "@/lib/cms-defaults";
import { db, pages } from "@/lib/db";

/**
 * Fetch page content from database with fallback to default config.
 * Safe for server components and public routes.
 * Fully cached in L1 memory and Redis to avoid hammering Neon on every render.
 */
export async function getPageContent(slug: string) {
  return getOrSetCache(
    `page_content:${slug}`,
    ["pages", `page:${slug}`],
    async () => {
      try {
        const [page] = await db
          .select()
          .from(pages)
          .where(eq(pages.slug, slug))
          .limit(1);

        const config = CMS_PAGES_CONFIG[slug];

        if (!page) {
          return {
            slug,
            title: config?.title || slug,
            sections: config?.defaultSections || {},
            seoMeta: config?.defaultSeo || {},
          };
        }

        // Merge default sections with saved sections so missing keys always have fallbacks
        const mergedSections = {
          ...(config?.defaultSections || {}),
          ...(page.sections &&
          typeof page.sections === "object" &&
          !Array.isArray(page.sections)
            ? (page.sections as Record<string, unknown>)
            : {}),
        };

        return {
          id: page.id,
          slug: page.slug,
          title: page.title,
          sections: mergedSections,
          seoMeta: page.seoMeta || config?.defaultSeo || {},
          updatedAt: page.updatedAt,
        };
      } catch (err) {
        console.error(`Error fetching page content for ${slug}:`, err);
        const config = CMS_PAGES_CONFIG[slug];
        return {
          slug,
          title: config?.title || slug,
          sections: config?.defaultSections || {},
          seoMeta: config?.defaultSeo || {},
        };
      }
    },
    900,
  );
}

/**
 * Save page content action from admin page editor.
 */
export async function savePageContentAction(params: {
  slug: string;
  title: string;
  sections: Record<string, unknown>;
  seoMeta?: {
    title?: string;
    description?: string;
    ogImage?: string;
  };
}) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized. Please log in." };
  }

  const { slug, title, sections, seoMeta } = params;

  try {
    const [existing] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);

    if (existing) {
      await db
        .update(pages)
        .set({
          title,
          sections,
          seoMeta: seoMeta || {},
          updatedBy: session.user.id,
          updatedAt: new Date(),
        })
        .where(eq(pages.id, existing.id));
    } else {
      await db.insert(pages).values({
        slug,
        title,
        sections,
        seoMeta: seoMeta || {},
        updatedBy: session.user.id,
      });
    }

    // Invalidate multi-tier cache and trigger Next.js route revalidation
    await invalidateCache(["pages", `page:${slug}`]);
    const publicPath = CMS_PAGES_CONFIG[slug]?.path || `/${slug}`;
    revalidatePath(publicPath);
    revalidatePath(`/admin/pages/${slug}`);
    revalidatePath("/admin/pages");

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to save page content.";
    return { success: false, error: message };
  }
}

/**
 * Reset page to system defaults.
 */
export async function resetPageToDefaultsAction(slug: string) {
  const session = await auth();
  if (!session?.user) {
    return { success: false, error: "Unauthorized." };
  }

  const config = CMS_PAGES_CONFIG[slug];
  if (!config) {
    return { success: false, error: "Invalid page slug." };
  }

  try {
    await db.delete(pages).where(eq(pages.slug, slug));

    // Invalidate multi-tier cache and trigger Next.js route revalidation
    await invalidateCache(["pages", `page:${slug}`]);
    const publicPath = config.path || `/${slug}`;
    revalidatePath(publicPath);
    revalidatePath(`/admin/pages/${slug}`);
    revalidatePath("/admin/pages");

    return { success: true };
  } catch (err) {
    const message =
      err instanceof Error ? err.message : "Failed to reset page.";
    return { success: false, error: message };
  }
}
