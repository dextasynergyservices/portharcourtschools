"use client";

import Link from "next/link";
import { FadeIn } from "@/components/site/motion-wrapper";

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

export interface LivePostSummary {
  id: string;
  title: string;
  slug: string;
  publishedAt: Date | null;
  category?: {
    name: string;
    slug: string;
  } | null;
  author?: {
    name: string | null;
  } | null;
}

export interface RecentlyPublishedCmsData {
  badge?: string;
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

interface RecentlyPublishedProps {
  livePosts?: LivePostSummary[];
  cmsData?: RecentlyPublishedCmsData;
}

const CATEGORY_COLORS: Record<string, string> = {
  "parent-corner": "#FDDA32",
  "teacher-school-leadership": "#184098",
  "curriculum-watch": "#E0B71E",
  "safeguarding-wellbeing": "#2E8B57",
  "community-spotlight": "#D97706",
  "events-announcements": "#DC2626",
};

export function RecentlyPublished({
  livePosts,
  cmsData,
}: RecentlyPublishedProps) {
  const badge = cmsData?.badge || "Editorial Desk";
  const title = cmsData?.title || "Recently Published";
  const subtitle =
    cmsData?.subtitle ||
    "Stories, insights and clarity from inside Port Harcourt’s schools, curriculum changes, and classroom best practices.";
  const ctaLabel = cmsData?.ctaLabel || "More Publications";
  const ctaLink = cmsData?.ctaLink || "/blog";
  const defaultArticles = [
    {
      category: "Parent Corner",
      categoryColor: "#FDDA32",
      title:
        "Navigating Primary School Admissions in Port Harcourt: What to Ask on a Tour",
      date: "September 7, 2026",
      href: "/blog/navigating-primary-school-admissions-port-harcourt",
    },
    {
      category: "Curriculum Watch",
      categoryColor: "#E0B71E",
      title:
        "The 2026 NERDC Curriculum Reforms: What Every Rivers State Educator Needs to Know",
      date: "September 7, 2026",
      href: "/blog/nerdc-curriculum-reforms-rivers-state-educators",
    },
    {
      category: "Safeguarding & Wellbeing",
      categoryColor: "#2E8B57",
      title:
        "Child Protection Standards: Five Safeguarding Protocols Every School Must Enforce",
      date: "September 7, 2026",
      href: "/blog/child-protection-standards-safeguarding-protocols-schools",
    },
    {
      category: "Community Spotlight",
      categoryColor: "#D97706",
      title:
        "Honouring Our Unsung Champions: Why the Teachers Spotlight Awards Matter",
      date: "September 7, 2026",
      href: "/blog/honouring-unsung-champions-teachers-spotlight-awards",
    },
    {
      category: "Teacher & School Leadership",
      categoryColor: "#184098",
      title:
        "The Role of Accredited Professional Development in Teacher Retention",
      date: "September 7, 2026",
      href: "/blog/accredited-professional-development-teacher-retention",
    },
    {
      category: "Events & Announcements",
      categoryColor: "#DC2626",
      title: "Announcing The Teachers Spotlight Education Summit & Awards 2026",
      date: "September 7, 2026",
      href: "/blog/announcing-teachers-spotlight-summit-awards-2026",
    },
  ];

  const displayArticles =
    livePosts && livePosts.length > 0
      ? livePosts.slice(0, 6).map((post) => {
          const catSlug = post.category?.slug || "";
          return {
            category: post.category?.name || "Editorial Desk",
            categoryColor: CATEGORY_COLORS[catSlug] || "#FDDA32",
            title: post.title,
            author: post.author?.name || "Editorial Staff",
            date: post.publishedAt
              ? new Date(post.publishedAt).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                })
              : "Recent",
            href: `/blog/${post.slug}`,
          };
        })
      : defaultArticles;

  return (
    <section
      id="publications"
      className="dark-section relative py-20 sm:py-28 bg-[#08276B] text-white overflow-hidden border-b border-[#0A1F4D]"
    >
      {/* Giant architectural watermark in dark contrast */}
      <span className="offset_subheader" aria-hidden="true">
        {title}
      </span>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Left Column: Subhead Wrap (3 cols) */}
          <div className="lg:col-span-3 space-y-4">
            <FadeIn>
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[#FDDA32]">
                {badge}
              </span>
              <h2 className="font-heading text-3xl sm:text-4xl font-black text-white uppercase tracking-tight mt-1">
                {title}
              </h2>
              <p className="text-sm text-[#D9DEEC] leading-relaxed font-sans pt-1">
                {subtitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.1}>
              <div className="pt-2">
                <Link href={ctaLink} className="subheader_cta group text-white">
                  <span className="text-white">{ctaLabel}</span>
                  <ArrowDiagonal className="text-[#FDDA32]" />
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: 3-Column Grid with Hairline Separators (9 cols) */}
          <div className="lg:col-span-9 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 with-separators">
            {displayArticles.map((item) => (
              <FadeIn key={item.title}>
                <article className="grid_card group flex flex-col justify-between h-full space-y-4">
                  <div className="space-y-3">
                    {/* ICLE Category Flag Pill with 4px colored rule */}
                    <div className="category-flag">
                      <span
                        className="category-flag-bar"
                        style={{ backgroundColor: item.categoryColor }}
                      />
                      <span className="text-[11px] font-display font-bold uppercase tracking-widest text-[#D9DEEC] group-hover:text-[#FDDA32] transition-colors">
                        {item.category}
                      </span>
                    </div>

                    <Link href={item.href} className="block">
                      <h3 className="font-heading text-lg font-bold text-white group-hover:text-[#FDDA32] transition-colors leading-snug">
                        {item.title}
                      </h3>
                    </Link>
                  </div>

                  <div className="pt-4 border-t border-white/15 text-xs text-[#D9DEEC]/70 font-sans">
                    <p>{item.date}</p>
                  </div>
                </article>
              </FadeIn>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
