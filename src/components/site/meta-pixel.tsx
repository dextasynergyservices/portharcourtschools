"use client";

import { usePathname, useSearchParams } from "next/navigation";
import { useEffect, useRef } from "react";

const PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID || "1677143700522794";

type Fbq = ((...args: unknown[]) => void) & {
  callMethod?: (...args: unknown[]) => void;
  queue: unknown[][];
  push: Fbq;
  loaded: boolean;
  version: string;
};

declare global {
  interface Window {
    fbq?: Fbq;
    _fbq?: Fbq;
  }
}

/** Meta's base snippet: defines a queueing fbq() and loads fbevents.js once. */
function loadPixel(): Fbq {
  if (window.fbq) return window.fbq;

  const fbq = ((...args: unknown[]) => {
    if (fbq.callMethod) fbq.callMethod(...args);
    else fbq.queue.push(args);
  }) as Fbq;
  fbq.push = fbq;
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.queue = [];
  window.fbq = fbq;
  window._fbq ??= fbq;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://connect.facebook.net/en_US/fbevents.js";
  document.head.appendChild(script);

  fbq("init", PIXEL_ID);
  return fbq;
}

/**
 * Meta (Facebook) Pixel. Fires a PageView on first load and on every
 * client-side navigation, which the stock snippet alone would miss.
 */
export function MetaPixel() {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const lastTrackedPath = useRef<string | null>(null);

  useEffect(() => {
    // Only track visitors on the official live domain (schoolsvoice.com)
    const hostname = window.location.hostname.toLowerCase();
    if (
      hostname !== "schoolsvoice.com" &&
      !hostname.endsWith(".schoolsvoice.com")
    ) {
      return;
    }

    const query = searchParams?.toString();
    const fullPath = query ? `${pathname}?${query}` : pathname;
    if (lastTrackedPath.current === fullPath) return;
    lastTrackedPath.current = fullPath;

    loadPixel()("track", "PageView");
  }, [pathname, searchParams]);

  return null;
}

/** No-JS fallback. Render outside Suspense so it is part of the server HTML. */
export function MetaPixelNoscript() {
  return (
    <noscript>
      {/* biome-ignore lint/performance/noImgElement: tracking pixel for no-JS visitors */}
      <img
        height="1"
        width="1"
        style={{ display: "none" }}
        alt=""
        src={`https://www.facebook.com/tr?id=${PIXEL_ID}&ev=PageView&noscript=1`}
      />
    </noscript>
  );
}
