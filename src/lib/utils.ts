export { cn } from "cn";

export function normalizeImageUrl(
  url?: string | null,
  fallback = "/images/ph_hero_classroom.jpg",
): string {
  if (!url || typeof url !== "string" || !url.trim()) {
    return fallback;
  }
  const trimmed = url.trim();

  // Handle Google Drive links
  if (trimmed.includes("drive.google.com")) {
    const match =
      trimmed.match(/\/d\/([a-zA-Z0-9_-]+)/) ||
      trimmed.match(/[?&]id=([a-zA-Z0-9_-]+)/);
    if (match?.[1]) {
      return `https://drive.google.com/uc?export=view&id=${match[1]}`;
    }
  }

  return trimmed;
}

export function isExternalImage(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}
