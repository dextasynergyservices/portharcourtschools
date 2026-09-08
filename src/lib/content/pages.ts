import { eq } from "drizzle-orm";
import { db, pages } from "@/lib/db";

export interface PageSection {
  id: string;
  type: string;
  title?: string;
  subtitle?: string;
  content?: string;
  items?: Array<Record<string, unknown>>;
  [key: string]: unknown;
}

export interface PageContent {
  slug: string;
  title: string;
  seoMeta?: {
    title?: string;
    description?: string;
    ogImage?: string;
  } | null;
  sections: PageSection[];
}

export async function getPageContent(
  slug: string,
  fallback: PageContent,
): Promise<PageContent> {
  try {
    const [page] = await db
      .select()
      .from(pages)
      .where(eq(pages.slug, slug))
      .limit(1);

    const hasSections = Array.isArray(page?.sections)
      ? page.sections.length > 0
      : Boolean(page?.sections && Object.keys(page.sections).length > 0);

    if (page?.sections && hasSections) {
      const parsedSections = Array.isArray(page.sections)
        ? (page.sections as unknown as PageSection[])
        : (Object.values(
            page.sections as Record<string, unknown>,
          ) as unknown as PageSection[]);

      return {
        slug: page.slug,
        title: page.title,
        seoMeta: page.seoMeta || fallback.seoMeta,
        sections: parsedSections,
      };
    }
  } catch (error) {
    console.error(`Error querying page content for ${slug}:`, error);
  }

  return fallback;
}
