import { asc, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import { ClosingCta } from "@/components/site/home/closing-cta";
import { CommunityPartnersTeaser } from "@/components/site/home/community-partners-teaser";
import { DirectoryBanner } from "@/components/site/home/directory-banner";
import { FeaturedEventBanner } from "@/components/site/home/featured-event-banner";
import { HeroSection } from "@/components/site/home/hero-section";
import {
  type MarqueePartnerItem,
  PartnersMarquee,
} from "@/components/site/home/partners-marquee";
import { ProgramScroller } from "@/components/site/home/program-scroller";
import {
  type LivePostSummary,
  RecentlyPublished,
} from "@/components/site/home/recently-published";
import { SpotlightsScroller } from "@/components/site/home/spotlights-scroller";
import { WhatWeDoPillars } from "@/components/site/home/what-we-do-pillars";
import { WhoWeServe } from "@/components/site/home/who-we-serve";
import { getOrSetCache } from "@/lib/cache";
import { db, partners, posts } from "@/lib/db";

export const metadata: Metadata = {
  title:
    "PortHarcourtSchools — Clarity for Parents. Growth for Schools. Voice for Teachers.",
  description:
    "PortHarcourtSchools is the media, programmes and community platform building a stronger education ecosystem across Port Harcourt and beyond, one school, one teacher, one parent at a time.",
  alternates: {
    canonical: "/",
  },
};

export default async function HomePage() {
  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://portharcourtschools.com";
  const siteUrl = rawUrl.replace(/\/$/, "");

  let livePosts: LivePostSummary[] = [];
  try {
    livePosts = await getOrSetCache<LivePostSummary[]>(
      "homepage:live_posts",
      ["posts", "homepage"],
      async () => {
        return db.query.posts.findMany({
          where: eq(posts.status, "published"),
          with: {
            category: true,
            author: true,
          },
          orderBy: [desc(posts.publishedAt), desc(posts.createdAt)],
          limit: 6,
        });
      },
      300,
    );
  } catch (err) {
    console.warn("Could not fetch homepage live posts:", err);
  }

  let partnersList: MarqueePartnerItem[] = [];
  try {
    partnersList = await getOrSetCache<MarqueePartnerItem[]>(
      "homepage:partners",
      ["partners", "homepage"],
      async () => {
        return db.query.partners.findMany({
          where: eq(partners.isActive, true),
          orderBy: [asc(partners.order), desc(partners.createdAt)],
          columns: {
            id: true,
            name: true,
            logo: true,
            website: true,
            tier: true,
            description: true,
          },
        });
      },
      300,
    );
  } catch (err) {
    console.warn("Could not fetch homepage partners:", err);
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "PortHarcourtSchools",
        description:
          "The authoritative education platform for Port Harcourt: schools directory, teachers summit & awards, and parent clarity.",
        potentialAction: {
          "@type": "SearchAction",
          target: {
            "@type": "EntryPoint",
            urlTemplate: `${siteUrl}/schools?q={search_term_string}`,
          },
          "query-input": "required name=search_term_string",
        },
        inLanguage: "en-NG",
      },
      {
        "@type": "EducationalOrganization",
        "@id": `${siteUrl}/#organization`,
        name: "PortHarcourtSchools",
        url: siteUrl,
        logo: `${siteUrl}/images/brand-logo.jpg`,
        description:
          "Media, programmes and community platform building a stronger education ecosystem across Port Harcourt and Rivers State.",
        sameAs: [
          "https://instagram.com/portharcourtschools",
          "https://facebook.com/portharcourtschools",
          "https://linkedin.com/company/portharcourtschools",
        ],
        areaServed: {
          "@type": "AdministrativeArea",
          name: "Port Harcourt, Rivers State, Nigeria",
        },
      },
    ],
  };

  const programs = [
    {
      number: "01",
      title: "Nursery & Early Years",
      subtitle:
        "Montessori, phonics foundations, and developmental diagnostics",
      href: "/schools?level=nursery",
      tag: "Ages 1–5",
      color: "#184098",
      bgImage: "/images/ph_schools_map_banner.jpg",
    },
    {
      number: "02",
      title: "Primary Education Foundations",
      subtitle: "Literacy benchmarks, numeracy standards, and WAEC entry prep",
      href: "/schools?level=primary",
      tag: "Grades 1–6",
      color: "#08276B",
      bgImage: "/images/ph_hero_classroom.jpg",
    },
    {
      number: "03",
      title: "Secondary & College Prep",
      subtitle: "WAEC, IGCSE, Cambridge, and international STEM pathways",
      href: "/schools?level=secondary",
      tag: "JSS1–SSS3",
      color: "#151B2E",
      bgImage: "/images/ph_schools_map_banner.jpg",
    },
    {
      number: "04",
      title: "STEM, Robotics & Digital Literacy",
      subtitle: "Coding curriculum, science laboratories, and innovation clubs",
      href: "/blog?category=stem",
      tag: "Innovation",
      color: "#184098",
      bgImage: "/images/ph_hero_classroom.jpg",
    },
    {
      number: "05",
      title: "Teachers Spotlight Awards & Summit",
      subtitle:
        "Accredited recognition, public honour, and annual state-wide forum",
      href: "/events",
      tag: "Flagship",
      color: "#9A7B0C",
      bgImage: "/images/classroom_champions_emblem.jpg",
    },
    {
      number: "06",
      title: "School Leadership & Institutional Governance",
      subtitle:
        "Proprietor advisory, teacher retention, and financial resilience",
      href: "/blog?category=leadership",
      tag: "Leadership",
      color: "#08276B",
      bgImage: "/images/ph_schools_map_banner.jpg",
    },
  ];

  return (
    <div className="w-full bg-[#F5F4F0] text-[#151B2E]">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO SECTION (Clarity for Parents. Growth for Schools. Voice for Teachers.) */}
      <HeroSection />

      {/* 2. WHO WE SERVE (3 Audiences: Parents, Teachers/Schools, Partners/Organisations) */}
      <WhoWeServe />

      {/* 3. WHAT WE DO (Three Pillars: Media & Community, Programmes, Recognition) */}
      <WhatWeDoPillars />

      {/* 4. FEATURED EVENT BANNER (The Teachers Spotlight Summit & Awards 2026 — 21 Nov 2026, Celebrate Center) */}
      <FeaturedEventBanner />

      {/* 5. RESEARCH & FOCUS AREAS (Moved down as requested, with horizontal card track & side arrows) */}
      <section
        id="research-programs"
        className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-[#F5F4F0] border-b border-[#E4E0D5]"
      >
        {/* Giant architectural watermark in background */}
        <span className="offset_subheader" aria-hidden="true">
          Focus Areas
        </span>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <ProgramScroller programs={programs} />
        </div>
      </section>

      {/* 6. FULL-BLEED DIRECTORY BANNER (#map_cta) */}
      <DirectoryBanner />

      {/* 7. PARTNERS MARQUEE (Right to Left Animated Logo Ticker) */}
      <PartnersMarquee partners={partnersList} />

      {/* 8. SPOTLIGHTS SECTION (Primers with sideways scrolling on mobile) */}
      <SpotlightsScroller />

      {/* 9. RECENTLY PUBLISHED (Dark Shadow Navy Publications with 6 official categories) */}
      <RecentlyPublished livePosts={livePosts} />

      {/* 10. COMMUNITY & PARTNERS TEASERS (Instagram Community & Institutional Partnerships) */}
      <CommunityPartnersTeaser />

      {/* 11. CLOSING CTA BLOCK (There's a Place for You Here — 4 Distinct CTAs) */}
      <ClosingCta />
    </div>
  );
}
