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

  // Handle internal R2 S3 storage endpoints mistakenly saved as public URLs
  if (trimmed.includes(".r2.cloudflarestorage.com/")) {
    const publicBase =
      process.env.R2_PUBLIC_URL ||
      process.env.NEXT_PUBLIC_R2_PUBLIC_URL ||
      process.env.R2_PUBLIC_DOMAIN ||
      "https://pub-81ddd0db3eba42f7b90075575c17a92a.r2.dev";
    const parts = trimmed.split(".r2.cloudflarestorage.com/");
    if (parts[1]) {
      const cleanBase = publicBase.replace(/\/$/, "");
      return `${cleanBase}/${parts[1]}`;
    }
  }

  return trimmed;
}

export function isExternalImage(url?: string | null): boolean {
  if (!url) return false;
  return url.startsWith("http://") || url.startsWith("https://");
}
