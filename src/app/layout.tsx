import type { Metadata, Viewport } from "next";
import { Public_Sans, Sora, Space_Grotesk } from "next/font/google";
import type { ReactNode } from "react";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const sora = Sora({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-sora",
  display: "swap",
});

const publicSans = Public_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-public-sans",
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  weight: ["500", "700"],
  variable: "--font-space-grotesk",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#184098",
};

const rawUrl =
  process.env.NEXT_PUBLIC_APP_URL ||
  process.env.NEXTAUTH_URL ||
  "https://portharcourtschools.com";
const siteUrl = rawUrl.replace(/\/$/, "");

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  alternates: {
    canonical: "/",
  },
  title: {
    default: "PortHarcourtSchools — Schools Directory, Blog & Community",
    template: "%s | PortHarcourtSchools",
  },
  description:
    "The authoritative education platform for Port Harcourt: schools directory, teachers summit & awards, and parent clarity.",
  icons: {
    icon: "/images/brand-logo.jpg",
    shortcut: "/images/brand-logo.jpg",
    apple: "/images/brand-logo.jpg",
  },
  openGraph: {
    title: "PortHarcourtSchools — Schools Directory, Blog & Community",
    description:
      "The authoritative education platform for Port Harcourt: schools directory, teachers summit & awards, and parent clarity.",
    url: siteUrl,
    siteName: "PortHarcourtSchools",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "PortHarcourtSchools",
    description:
      "The authoritative education platform for Port Harcourt: schools directory, teachers summit & awards, and parent clarity.",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${sora.variable} ${publicSans.variable} ${spaceGrotesk.variable} h-full antialiased`}
    >
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body
        suppressHydrationWarning
        className="min-h-full flex flex-col bg-background text-foreground font-sans"
      >
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-[10000] focus:px-4 focus:py-2 focus:bg-[#184098] focus:text-white focus:font-bold focus:shadow-xl focus:rounded-md"
        >
          Skip to main content
        </a>
        {children}
        <Toaster />
      </body>
    </html>
  );
}
