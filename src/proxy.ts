import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";

// Public admin routes that must NOT require prior authentication
const PUBLIC_ADMIN_PATHS = ["/admin/login", "/admin/set-password"];

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // 1. Admin Authentication & Route Protection
  if (pathname.startsWith("/admin")) {
    const isPublicAdminRoute = PUBLIC_ADMIN_PATHS.some((p) =>
      pathname.startsWith(p),
    );

    if (!isPublicAdminRoute) {
      const session = await auth();

      if (!session?.user) {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("callbackUrl", pathname);
        return NextResponse.redirect(loginUrl);
      }

      // Deactivated or blocked users are blocked from admin panel
      if ((session.user as { status?: string }).status === "inactive") {
        const loginUrl = new URL("/admin/login", request.url);
        loginUrl.searchParams.set("error", "AccountInactive");
        return NextResponse.redirect(loginUrl);
      }
    }
  }

  const response = NextResponse.next();

  // 2. Comprehensive Security Headers (Defense in Depth)
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "SAMEORIGIN");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=()",
  );
  response.headers.set("X-DNS-Prefetch-Control", "on");

  // Production HSTS (Strict-Transport-Security)
  if (process.env.NODE_ENV === "production") {
    response.headers.set(
      "Strict-Transport-Security",
      "max-age=63072000; includeSubDomains; preload",
    );
  }

  // Content-Security-Policy (CSP)
  const cspHeader = [
    "default-src 'self'",
    "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://challenges.cloudflare.com",
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com data:",
    "img-src 'self' data: blob: https://images.unsplash.com https://*.r2.cloudflarestorage.com https://*.cloudflare.com https://*.r2.dev https://*.paystack.com https://*.flutterwave.com https://assets.paystack.com",
    "connect-src 'self' https://*.upstash.io https://challenges.cloudflare.com https://api.paystack.co https://api.flutterwave.com https://*.r2.cloudflarestorage.com https://*.r2.dev",
    "frame-src 'self' https://challenges.cloudflare.com https://checkout.paystack.com https://*.flutterwave.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self' https://* http://*",
  ].join("; ");

  response.headers.set("Content-Security-Policy", cspHeader);

  return response;
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (svg, png, jpg, webp, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp|avif|ico|woff|woff2)$).*)",
  ],
};
