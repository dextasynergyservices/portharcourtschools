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

export interface DirectoryBannerData {
  title?: string;
  subtitle?: string;
  ctaLabel?: string;
  ctaLink?: string;
  coverImage?: string;
}

export function DirectoryBanner({ data }: { data?: DirectoryBannerData }) {
  const title = data?.title || "Explore Verified Schools Across Port Harcourt";
  const subtitle =
    data?.subtitle ||
    "Search accredited Montessori, nursery, primary, and secondary institutions across Old GRA, Peter Odili, Woji, Ada George, and Greater Port Harcourt.";
  const ctaLabel = data?.ctaLabel || "Launch Schools Directory";
  const ctaLink = data?.ctaLink || "/schools";
  const coverImage = data?.coverImage || "/images/ph_schools_map_banner.jpg";

  return (
    <section
      id="map_cta"
      className="relative overflow-hidden my-4 sm:my-8 border-y border-[#184098]/30"
    >
      <div className="relative h-[320px] sm:h-[420px] w-full flex items-center justify-center text-center px-4">
        {/* High-res campus backdrop */}
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{
            backgroundImage: `url('${coverImage}')`,
          }}
        />
        {/* Deep Navy/Black Overlay */}
        <div className="absolute inset-0 bg-[#08276B]/85 backdrop-brightness-75" />

        <div className="relative z-10 max-w-2xl space-y-6">
          <FadeIn>
            <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-black text-white leading-tight uppercase tracking-tight">
              {title}
            </h2>
          </FadeIn>
          <FadeIn delay={0.1}>
            <p className="text-sm sm:text-base text-[#D9DEEC] max-w-xl mx-auto font-sans">
              {subtitle}
            </p>
          </FadeIn>
          <FadeIn delay={0.2}>
            <Link href={ctaLink} className="cta-button cta-primary group">
              <span>{ctaLabel}</span>
              <ArrowDiagonal className="text-[#151B2E]" />
            </Link>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
