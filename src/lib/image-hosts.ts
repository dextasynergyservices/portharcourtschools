/**
 * Remote hosts allowed through the Next.js image optimizer (shared with next.config.ts).
 * Images from any other host must be rendered with `unoptimized`, see canOptimizeImage().
 */
export const OPTIMIZED_IMAGE_HOSTS = [
  "images.unsplash.com",
  "**.r2.cloudflarestorage.com",
  "**.r2.dev",
  "**.cloudflare.com",
  "drive.google.com",
  "**.googleusercontent.com",
] as const;

function hostMatches(hostname: string, pattern: string): boolean {
  if (pattern.startsWith("**.")) {
    return hostname.endsWith(pattern.slice(2));
  }
  return hostname === pattern;
}

/**
 * True for local images and remote images on an allowed host.
 */
export function canOptimizeImage(url?: string | null): boolean {
  if (!url) return true;
  if (!url.startsWith("http://") && !url.startsWith("https://")) return true;

  try {
    const { protocol, hostname } = new URL(url);
    return (
      protocol === "https:" &&
      OPTIMIZED_IMAGE_HOSTS.some((pattern) => hostMatches(hostname, pattern))
    );
  } catch {
    return false;
  }
}
