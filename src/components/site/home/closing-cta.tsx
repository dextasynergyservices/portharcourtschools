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

export interface ClosingCtaData {
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
}

export function ClosingCta({ data }: { data?: ClosingCtaData }) {
  const badge = data?.badge || "Community Invitation";
  const title = data?.title || "There’s a Place for You Here.";
  const subtitle =
    data?.subtitle ||
    "Whether you’re a parent seeking clarity, a teacher looking to sharpen your craft, or a school ready to share your story—PortHarcourtSchools is built for you.";
  const primaryCtaLabel = data?.primaryCtaLabel || "Explore School Directory";
  const primaryCtaLink = data?.primaryCtaLink || "/schools";
  const secondaryCtaLabel = data?.secondaryCtaLabel || "Get In Touch";
  const secondaryCtaLink = data?.secondaryCtaLink || "/contact";

  return (
    <section className="relative py-20 sm:py-28 bg-[#184098] text-white overflow-hidden border-b border-[#08276B]">
      {/* Decorative SVG Accent Grid */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 select-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 text-center space-y-8">
        <FadeIn>
          <span className="inline-block px-3 py-1 bg-white/10 text-[#FDDA32] border border-white/20 rounded-[2px] font-display text-xs font-bold uppercase tracking-widest">
            {badge}
          </span>
        </FadeIn>

        <FadeIn delay={0.08}>
          <h2 className="font-heading text-3xl sm:text-5xl font-black uppercase tracking-tight text-white leading-tight max-w-3xl mx-auto">
            {title}
          </h2>
        </FadeIn>

        <FadeIn delay={0.16}>
          <p className="text-base sm:text-xl text-[#D9DEEC] max-w-2xl mx-auto leading-relaxed font-sans">
            {subtitle}
          </p>
        </FadeIn>

        {/* Closing CTAs */}
        <FadeIn delay={0.24}>
          <div className="pt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <Link
              href={primaryCtaLink}
              className="cta-button gold group touch-target"
            >
              <span>{primaryCtaLabel}</span>
              <ArrowDiagonal className="text-[#08276B]" />
            </Link>

            <Link
              href={secondaryCtaLink}
              className="cta-button outline-white group touch-target"
            >
              <span>{secondaryCtaLabel}</span>
              <ArrowDiagonal />
            </Link>

            <Link
              href="/partners"
              className="cta-button outline-white group touch-target"
            >
              <span>Partner With Us</span>
              <ArrowDiagonal />
            </Link>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
