"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const SESSION_KEY = "sv_analytics_sid";

function getOrCreateSessionId(): string {
  if (typeof window === "undefined") return "";
  try {
    let sid = window.sessionStorage.getItem(SESSION_KEY);
    if (!sid) {
      sid = `s_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 8)}`;
      window.sessionStorage.setItem(SESSION_KEY, sid);
    }
    return sid;
  } catch {
    return "";
  }
}

export function AnalyticsTracker() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only track visitors on the official live domain (schoolsvoice.com)
    if (typeof window !== "undefined") {
      const hostname = window.location.hostname.toLowerCase();
      const isProductionDomain =
        hostname === "schoolsvoice.com" ||
        hostname === "www.schoolsvoice.com" ||
        hostname.endsWith(".schoolsvoice.com");

      if (!isProductionDomain) {
        return; // Ignore localhost, test tunnels, or staging environments
      }
    }

    // Avoid double-tracking identical path & query
    const fullPath = searchParams?.toString()
      ? `${pathname}?${searchParams.toString()}`
      : pathname;

    if (
      !pathname ||
      pathname.startsWith("/admin") ||
      lastTrackedPath.current === fullPath
    ) {
      return;
    }

    lastTrackedPath.current = fullPath;

    // Small delay to ensure document.referrer and title are fully set
    const timeout = setTimeout(() => {
      try {
        const payload = JSON.stringify({
          path: fullPath,
          referrer: document.referrer || null,
          screenWidth: window.innerWidth,
          sessionId: getOrCreateSessionId(),
        });

        if (navigator.sendBeacon) {
          navigator.sendBeacon("/api/analytics/track", payload);
        } else {
          fetch("/api/analytics/track", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: payload,
            keepalive: true,
          }).catch(() => {});
        }
      } catch {
        // Silently catch any analytics tracking errors
      }
    }, 250);

    return () => clearTimeout(timeout);
  }, [pathname, searchParams]);

  return null;
}
