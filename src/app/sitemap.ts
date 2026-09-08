import { eq } from "drizzle-orm";
import type { MetadataRoute } from "next";
import { getOrSetCache } from "@/lib/cache";
import { db, events, posts, schools } from "@/lib/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://portharcourtschools.com";
  const baseUrl = rawUrl.replace(/\/$/, "");

  // Static routes
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: `${baseUrl}`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/schools`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/blog`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/events`,
      lastModified: new Date(),
      changeFrequency: "weekly",
      priority: 0.8,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/partners`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly",
      priority: 0.6,
    },
  ];

  try {
    // Dynamic school profiles cached for 1 hour
    const schoolRoutes = await getOrSetCache<MetadataRoute.Sitemap>(
      "sitemap:schools",
      ["schools"],
      async () => {
        const publishedSchools = await db.query.schools.findMany({
          where: eq(schools.status, "published"),
          columns: { slug: true, updatedAt: true },
        });

        return publishedSchools.map((s) => ({
          url: `${baseUrl}/schools/${s.slug}`,
          lastModified: s.updatedAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.8,
        }));
      },
      3600,
    );

    // Dynamic blog articles cached for 1 hour
    const blogRoutes = await getOrSetCache<MetadataRoute.Sitemap>(
      "sitemap:posts",
      ["posts"],
      async () => {
        const publishedPosts = await db.query.posts.findMany({
          where: eq(posts.status, "published"),
          columns: { slug: true, updatedAt: true, publishedAt: true },
        });

        return publishedPosts.map((p) => ({
          url: `${baseUrl}/blog/${p.slug}`,
          lastModified: p.updatedAt || p.publishedAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
      },
      3600,
    );

    // Dynamic event pages cached for 1 hour
    const eventRoutes = await getOrSetCache<MetadataRoute.Sitemap>(
      "sitemap:events",
      ["events"],
      async () => {
        const publishedEvents = await db.query.events.findMany({
          where: eq(events.status, "published"),
          columns: { slug: true, updatedAt: true, startDate: true },
        });

        return publishedEvents.map((e) => ({
          url: `${baseUrl}/events/${e.slug}`,
          lastModified: e.updatedAt || new Date(),
          changeFrequency: "weekly" as const,
          priority: 0.7,
        }));
      },
      3600,
    );

    return [...staticRoutes, ...schoolRoutes, ...blogRoutes, ...eventRoutes];
  } catch (err) {
    console.warn(
      "[Sitemap] Failed to fetch dynamic entities, falling back to static routes:",
      err,
    );
    return staticRoutes;
  }
}
