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

export function SpotlightsScroller() {
  const spotlights = [
    {
      title:
        "The 2026 NERDC Basic Education Curriculum: What Every Port Harcourt Parent Must Know",
      category: "Curriculum Watch",
      href: "/blog/nerdc-curriculum-overview",
    },
    {
      title:
        "Safety Benchmarks: Child Protection Protocols Required in Rivers State Schools",
      category: "Safeguarding & Wellbeing",
      href: "/blog/safeguarding-standards",
    },
    {
      title:
        "Evaluating Early Childhood Centers: Montessori vs Play-Based Foundations",
      category: "Parent Corner",
      href: "/blog/montessori-vs-play-based",
    },
    {
      title:
        "Retention Realities: How Top Independent Schools Keep Outstanding Science & Math Teachers",
      category: "Teacher & School Leadership",
      href: "/blog/teacher-retention-strategies",
    },
  ];

  return (
    <section
      id="spotlights"
      className="relative pt-16 pb-20 sm:pt-24 sm:pb-28 border-b border-[#E4E0D5] overflow-hidden"
    >
      {/* Giant architectural watermark */}
      <span className="offset_subheader" aria-hidden="true">
        Spotlights
      </span>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between pb-4 border-b border-[#D9DEEC] mb-10 gap-2">
          <div>
            <h2 className="h2_subheader">Spotlights</h2>
            <p className="text-xs sm:text-sm text-[#55627D] font-sans mt-1">
              Simple primers on complex educational issues in Rivers State
            </p>
          </div>
          <Link href="/blog" className="subheader_cta group">
            <span>All Spotlights</span>
            <ArrowDiagonal />
          </Link>
        </FadeIn>

        {/* Mobile Horizontal Snap Scroller / Desktop 4-Column Grid */}
        <div className="flex overflow-x-auto snap-x snap-mandatory gap-4 sm:gap-6 sm:grid sm:grid-cols-2 lg:grid-cols-4 pb-4 sm:pb-0 -mx-4 px-4 sm:mx-0 sm:px-0 no-scrollbar">
          {spotlights.map((spot) => (
            <Link
              key={spot.title}
              href={spot.href}
              className="group flex flex-col justify-between bg-[#E4E0D5] rounded-[2px] p-6 border border-[#D9DEEC] hover:border-[#184098] transition-all h-[270px] w-[285px] sm:w-auto shrink-0 snap-start relative overflow-hidden shadow-xs hover:shadow-md"
            >
              <div className="space-y-3 relative z-10">
                <span className="font-display text-[10px] font-bold uppercase tracking-widest text-[#184098] block">
                  {spot.category}
                </span>
                <h3 className="font-heading text-base font-bold text-[#151B2E] group-hover:text-[#184098] transition-colors leading-snug line-clamp-4">
                  {spot.title}
                </h3>
              </div>

              <div className="pt-3 border-t border-[#D9DEEC]/80 flex items-center justify-between text-xs font-display font-bold uppercase tracking-widest text-[#184098] relative z-10">
                <span>Read more</span>
                <ArrowDiagonal />
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
