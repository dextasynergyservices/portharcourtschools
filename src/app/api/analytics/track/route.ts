import { createHash } from "node:crypto";
import type { NextRequest } from "next/server";
import { db, pageViews } from "@/lib/db";

// Patterns to ignore
const BOT_REGEX =
  /bot|crawl|spider|slurp|facebookexternalhit|bingbot|googlebot|semrush|ahrefs|yandex|duckduckbot/i;

function normalizeReferrer(referrer: string | null): {
  raw: string | null;
  domain: string;
} {
  if (!referrer || referrer.trim() === "") {
    return { raw: null, domain: "Direct" };
  }

  const clean = referrer.trim().toLowerCase();

  if (clean.includes("whatsapp") || clean.includes("wa.me")) {
    return { raw: referrer, domain: "WhatsApp" };
  }
  if (clean.includes("google.")) {
    return { raw: referrer, domain: "Google" };
  }
  if (clean.includes("facebook.") || clean.includes("fb.com")) {
    return { raw: referrer, domain: "Facebook" };
  }
  if (clean.includes("instagram.")) {
    return { raw: referrer, domain: "Instagram" };
  }
  if (
    clean.includes("t.co") ||
    clean.includes("twitter.") ||
    clean.includes("x.com")
  ) {
    return { raw: referrer, domain: "Twitter / X" };
  }
  if (clean.includes("linkedin.")) {
    return { raw: referrer, domain: "LinkedIn" };
  }

  try {
    const url = new URL(referrer);
    // Ignore internal navigation referrer
    if (
      url.hostname.includes("portharcourtschools") ||
      url.hostname.includes("localhost")
    ) {
      return { raw: null, domain: "Direct" };
    }
    return { raw: referrer, domain: url.hostname.replace(/^www\./, "") };
  } catch {
    return { raw: referrer, domain: "Other" };
  }
}

function detectDevice(
  userAgent: string,
  screenWidth?: number,
): "mobile" | "desktop" | "tablet" {
  if (typeof screenWidth === "number" && screenWidth > 0) {
    if (screenWidth < 768) return "mobile";
    if (screenWidth < 1024) return "tablet";
    return "desktop";
  }

  const ua = userAgent.toLowerCase();
  if (/ipad|tablet|(android(?!.*mobile))/i.test(ua)) {
    return "tablet";
  }
  if (/mobile|iphone|ipod|blackberry|opera mini|iemobile|wpdesktop/i.test(ua)) {
    return "mobile";
  }
  return "desktop";
}

function detectBrowser(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("edg/")) return "Edge";
  if (ua.includes("chrome/") && !ua.includes("edg/")) return "Chrome";
  if (ua.includes("safari/") && !ua.includes("chrome/")) return "Safari";
  if (ua.includes("firefox/")) return "Firefox";
  if (ua.includes("opera") || ua.includes("opr/")) return "Opera";
  return "Other";
}

function detectOS(userAgent: string): string {
  const ua = userAgent.toLowerCase();
  if (ua.includes("android")) return "Android";
  if (ua.includes("iphone") || ua.includes("ipad") || ua.includes("ios"))
    return "iOS";
  if (ua.includes("windows")) return "Windows";
  if (ua.includes("mac os") || ua.includes("macintosh")) return "macOS";
  if (ua.includes("linux")) return "Linux";
  return "Other";
}

export async function POST(req: NextRequest) {
  try {
    const userAgent = req.headers.get("user-agent") || "";

    // Ignore crawlers, health checks, and bots
    if (BOT_REGEX.test(userAgent)) {
      return new Response(null, { status: 204 });
    }

    // Strictly restrict recording to production host https://schoolsvoice.com
    const host = (
      req.headers.get("x-forwarded-host") ||
      req.headers.get("host") ||
      ""
    ).toLowerCase();
    const origin = (
      req.headers.get("origin") ||
      req.headers.get("referer") ||
      ""
    ).toLowerCase();

    const isLiveProduction =
      host === "schoolsvoice.com" ||
      host === "www.schoolsvoice.com" ||
      host.endsWith(".schoolsvoice.com") ||
      origin.includes("schoolsvoice.com");

    if (!isLiveProduction) {
      // Discard localhost, dev ports, or test tunnels
      return new Response(null, { status: 204 });
    }

    let body: {
      path?: string;
      referrer?: string | null;
      screenWidth?: number;
      sessionId?: string;
    } = {};

    try {
      body = await req.json();
    } catch {
      return new Response(null, { status: 204 });
    }

    const path = typeof body.path === "string" ? body.path.trim() : "";

    // Ignore empty paths or internal admin / API routes
    if (
      !path ||
      path.startsWith("/admin") ||
      path.startsWith("/api") ||
      path.startsWith("/_next") ||
      path.includes("favicon")
    ) {
      return new Response(null, { status: 204 });
    }

    // IP resolution
    const clientIp =
      req.headers.get("cf-connecting-ip") ||
      req.headers.get("x-real-ip") ||
      req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
      "127.0.0.1";

    // 24-Hour Rotating Anonymous Visitor Hash (Privacy & GDPR/NDPR Safe)
    const todayStr = new Date().toISOString().slice(0, 10);
    const salt = process.env.AUTH_SECRET || "schools-voice-salt";
    const visitorHash = createHash("sha256")
      .update(`${clientIp}-${userAgent}-${todayStr}-${salt}`)
      .digest("hex")
      .slice(0, 16);

    const { raw: referrerRaw, domain: referrerDomain } = normalizeReferrer(
      body.referrer ?? req.headers.get("referer"),
    );

    const deviceType = detectDevice(userAgent, body.screenWidth);
    const browser = detectBrowser(userAgent);
    const os = detectOS(userAgent);
    const country =
      req.headers.get("cf-ipcountry") ||
      req.headers.get("x-vercel-ip-country") ||
      null;
    const city = req.headers.get("cf-ipcity") || null;

    // Asynchronously insert page view
    await db.insert(pageViews).values({
      path,
      visitorHash,
      sessionId: body.sessionId ? String(body.sessionId).slice(0, 64) : null,
      referrer: referrerRaw ? referrerRaw.slice(0, 500) : null,
      referrerDomain,
      deviceType,
      browser,
      os,
      country,
      city,
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("[Analytics Track Error]:", error);
    return new Response(null, { status: 204 });
  }
}
