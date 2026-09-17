/**
 * Centralized Incremental Static Regeneration (ISR) configuration
 *
 * Serving pages from Vercel's Edge CDN drastically reduces serverless execution
 * time and protects Neon Database and Upstash Redis from request spikes.
 */

export const REVALIDATE_INTERVALS = {
  /** Fast-changing public index / directory listings (5 minutes) */
  HOMEPAGE: 300,
  DIRECTORY: 300,
  /** Blog & Event listing pages (3 minutes) */
  BLOG_LIST: 180,
  EVENTS_LIST: 180,
  /** Content detail pages (10 minutes) */
  ARTICLE_DETAIL: 600,
  EVENT_DETAIL: 600,
  /** Static / rarely changed institutional pages (15 minutes) */
  ABOUT: 900,
  PARTNERS: 900,
  RESEARCH: 900,
} as const;
