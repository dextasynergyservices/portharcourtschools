import { Redis } from "@upstash/redis";

const redisUrl = process.env.UPSTASH_REDIS_REST_URL;
const redisToken = process.env.UPSTASH_REDIS_REST_TOKEN;

function isValidUpstashConfig(url?: string, token?: string): boolean {
  if (!url || !token) return false;
  const trimmedUrl = url.trim().toLowerCase();
  const trimmedToken = token.trim().toLowerCase();

  // Detect unconfigured boilerplate / placeholder values from .env.example
  if (
    trimmedUrl.includes("your-upstash") ||
    trimmedUrl.includes("example.com") ||
    trimmedUrl.includes("placeholder") ||
    trimmedToken.includes("your-upstash") ||
    trimmedToken.startsWith("your-")
  ) {
    return false;
  }

  // Must start with http:// or https://
  if (!trimmedUrl.startsWith("http://") && !trimmedUrl.startsWith("https://")) {
    return false;
  }

  return true;
}

let redisInstance: Redis | null = null;

if (redisUrl && redisToken && isValidUpstashConfig(redisUrl, redisToken)) {
  try {
    redisInstance = new Redis({
      url: redisUrl.trim(),
      token: redisToken.trim(),
    });
  } catch (err) {
    console.warn("Failed to initialize Upstash Redis client:", err);
    redisInstance = null;
  }
}

export const redis = redisInstance;

export function isRedisAvailable(): boolean {
  return redis !== null;
}
