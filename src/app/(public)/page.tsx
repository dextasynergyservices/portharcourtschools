import { asc, desc, eq } from "drizzle-orm";
import type { Metadata } from "next";
import Link from "next/link";
import { getPageContent } from "@/app/(admin)/admin/pages/actions";
import {
  ClosingCta,
  type ClosingCtaData,
} from "@/components/site/home/closing-cta";
import {
  DirectoryBanner,
  type DirectoryBannerData,
} from "@/components/site/home/directory-banner";
import {
  FeaturedEventBanner,
  type FeaturedEventBannerCmsData,
} from "@/components/site/home/featured-event-banner";
import {
  FounderTeaser,
  type FounderTeaserData,
} from "@/components/site/home/founder-teaser";
import {
  HeroSection,
  type HeroSectionData,
} from "@/components/site/home/hero-section";
import {
  type NewsletterCmsData,
  NewsletterSection,
} from "@/components/site/home/newsletter-section";
import {
  type MarqueePartnerItem,
  PartnersMarquee,
} from "@/components/site/home/partners-marquee";
import { ProgramScroller } from "@/components/site/home/program-scroller";
import {
  type LivePostSummary,
  RecentlyPublished,
  type RecentlyPublishedCmsData,
} from "@/components/site/home/recently-published";
import { getOrSetCache } from "@/lib/cache";
import { db, partners, posts } from "@/lib/db";

export const revalidate = 300;

export const metadata: Metadata = {
  title:
    "PortHarcourtSchools — Clarity for Parents. Growth for Schools. Voice for Teachers.",
  description:
    "PortHarcourtSchools is the media, programmes and community platform building a stronger education ecosystem across Port Harcourt and beyond, one school, one teacher, one parent at a time.",
  alternates: {
    canonical: "/",
  },
};

function ArrowDiagonal({
  className = "size-3.5 ml-1",
}: {
  className?: string;
}) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`inline-block transition-transform duration-200 group-hover:translate-x-1 group-hover:-translate-y-1 ${className}`}
      aria-hidden="true"
    >
      <path
        fillRule="evenodd"
        clipRule="evenodd"
        d="M8.43934 3.21973H3.37645V0.219727H13.5607V10.1145H10.5607V5.34105L2.12132 13.7804L0 11.6591L8.43934 3.21973Z"
        fill="currentColor"
      />
    </svg>
  );
}

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
          orderBy: [
            asc(posts.sortOrder),
            desc(posts.publishedAt),
            desc(posts.createdAt),
          ],
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

  let heroData: HeroSectionData | undefined;
  let founderTeaserData: FounderTeaserData | undefined;
  let recentlyPublishedData: RecentlyPublishedCmsData | undefined;
  let featuredEventsData: FeaturedEventBannerCmsData | undefined;
  let directoryBannerData: DirectoryBannerData | undefined;
  let newsletterData: NewsletterCmsData | undefined;
  let closingCtaData: ClosingCtaData | undefined;
  let focusAreasData: { watermark?: string; title?: string } | undefined;

  try {
    const homeContent = await getPageContent("home");
    const sections = homeContent?.sections as
      | Record<string, unknown>
      | undefined;
    if (sections) {
      heroData = sections.hero as HeroSectionData;
      founderTeaserData = sections.founderTeaser as FounderTeaserData;
      recentlyPublishedData =
        sections.recentlyPublished as RecentlyPublishedCmsData;
      featuredEventsData =
        sections.featuredEvents as FeaturedEventBannerCmsData;
      directoryBannerData = sections.directoryBanner as DirectoryBannerData;
      newsletterData = sections.newsletter as NewsletterCmsData;
      closingCtaData = sections.closingCta as ClosingCtaData;
      focusAreasData = sections.focusAreas as {
        watermark?: string;
        title?: string;
      };
    }
  } catch (err) {
    console.warn("Could not fetch homepage CMS content:", err);
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

  let dynamicPrograms = programs;
  try {
    const researchContent = await getPageContent("research");
    const rSections = researchContent?.sections as
      | Record<string, Record<string, string | undefined>>
      | undefined;
    if (rSections) {
      dynamicPrograms = [1, 2, 3, 4, 5, 6].map((num, idx) => {
        const item = rSections[`track${num}`] || {};
        const fallback = programs[idx];
        return {
          number: item.number || fallback.number,
          title: item.title || fallback.title,
          subtitle: item.subtitle || fallback.subtitle,
          href: item.href || fallback.href,
          tag: item.tag || fallback.tag,
          color: item.color || fallback.color,
          bgImage: item.bgImage || fallback.bgImage,
        };
      });
    }
  } catch (err) {
    console.warn("Could not fetch research CMS content:", err);
  }

  return (
    <div className="w-full bg-[#F5F4F0] text-[#151B2E]">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* 1. HERO SECTION */}
      <HeroSection data={heroData} />

      {/* 2. MEET THE FOUNDER (Teaser) */}
      <FounderTeaser data={founderTeaserData} />

      {/* 3. BLOG / NEWS (Recently Published) */}
      <RecentlyPublished
        livePosts={livePosts}
        cmsData={recentlyPublishedData}
      />

      {/* 4. EVENTS (Featured Event Banner) */}
      <FeaturedEventBanner cmsData={featuredEventsData} />

      {/* 5. OUR PARTNERS (Right to Left Animated Logo Ticker) */}
      <PartnersMarquee partners={partnersList} />

      {/* 6. SCHOOL DIRECTORY (#map_cta) */}
      <DirectoryBanner data={directoryBannerData} />

      {/* 7. NEWSLETTER SIGN-UP */}
      <NewsletterSection cmsData={newsletterData} />

      {/* 8. RESEARCH & FOCUS AREAS */}
      <section
        id="research-programs"
        className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 overflow-hidden bg-[#F5F4F0] border-b border-[#E4E0D5]"
      >
        {/* Giant architectural watermark in background */}
        <span className="offset_subheader" aria-hidden="true">
          {focusAreasData?.watermark || "Focus Areas"}
        </span>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between pb-4 border-b border-[#D9DEEC] mb-10 gap-2">
            <div>
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
                Strategic Focus Tracks
              </span>
              <h2 className="h2_subheader mt-1">
                {focusAreasData?.title || "Research & Focus Areas"}
              </h2>
            </div>
            <Link href="/research" className="subheader_cta group">
              <span>Explore All Focus Areas</span>
              <ArrowDiagonal />
            </Link>
          </div>
          <ProgramScroller programs={dynamicPrograms} />
        </div>
      </section>

      {/* 9. CLOSING CTA BLOCK (There's a Place for You Here) */}
      <ClosingCta data={closingCtaData} />
    </div>
  );
}
