"use client";

import { motion, useScroll, useTransform } from "framer-motion";
import { CheckCircle2 } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

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

export interface HeroSectionData {
  badge?: string;
  headlinePart1?: string;
  headlinePart2?: string;
  headlinePart3?: string;
  subtitle?: string;
  primaryCtaLabel?: string;
  primaryCtaLink?: string;
  secondaryCtaLabel?: string;
  secondaryCtaLink?: string;
  coverImage?: string;
  coverImageAlt?: string;
}

export function HeroSection({ data }: { data?: HeroSectionData }) {
  const badge =
    data?.badge || "Independent Educational Resource & Policy Forum";
  const part1 = data?.headlinePart1 || "Clarity for Parents.";
  const part2 = data?.headlinePart2 || "Growth for Schools.";
  const part3 = data?.headlinePart3 || "Voice for Teachers.";
  const subtitle =
    data?.subtitle ||
    "PortHarcourtSchools is the media, programmes and community platform building a stronger education ecosystem across Port Harcourt and beyond, one school, one teacher, one parent at a time.";
  const primaryCtaLabel = data?.primaryCtaLabel || "Explore School Directory";
  const primaryCtaLink = data?.primaryCtaLink || "/schools";
  const secondaryCtaLabel = data?.secondaryCtaLabel || "Upcoming Events";
  const secondaryCtaLink = data?.secondaryCtaLink || "/events";
  const coverImage = data?.coverImage || "/images/ph_hero_classroom.jpg";
  const coverImageAlt =
    data?.coverImageAlt ||
    "Port Harcourt Classroom Excellence and Dedicated Educator";

  const heroRef = useRef<HTMLDivElement>(null);

  // Global window scroll for 100% reliable pixel-based parallax tracking
  const { scrollY } = useScroll();

  // Distinct parallax transforms on scroll
  const lineOneY = useTransform(scrollY, [0, 600], [0, 100]);
  const lineTwoY = useTransform(scrollY, [0, 600], [0, -70]);
  const lineThreeX = useTransform(scrollY, [0, 600], [0, 80]);

  // Main hero image card translates upwards with subtle rotation & scaling
  const imageY = useTransform(scrollY, [0, 600], [0, -130]);
  const imageRotate = useTransform(scrollY, [0, 600], [0, -3]);
  const imageScale = useTransform(scrollY, [0, 600], [1, 1.05]);

  // Background accent shadow box moves in counter-direction for 3D depth
  const accentBoxY = useTransform(scrollY, [0, 600], [0, 70]);
  const badgeY = useTransform(scrollY, [0, 600], [0, -40]);

  return (
    <section
      ref={heroRef}
      id="home_hero"
      className="relative overflow-hidden bg-[#F5F4F0] border-b border-[#E4E0D5] pt-14 pb-20 sm:pt-20 sm:pb-32 min-h-[640px] sm:min-h-[720px] flex items-center"
    >
      {/* ICLE-Inspired Angled Vector Lines with Parallax Drift */}
      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden overflow-clip max-w-full"
        aria-hidden="true"
      >
        {/* Top line background */}
        <motion.svg
          style={{ y: lineOneY }}
          className="absolute -top-10 right-0 w-[700px] h-[400px] opacity-25 text-[#003cb8] will-change-transform"
          viewBox="0 0 700 400"
          fill="none"
        >
          <path
            d="M0 80 Q350 20 700 240"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeDasharray="8 8"
          />
          <circle cx="520" cy="115" r="5" fill="#fcda04" />
        </motion.svg>

        {/* Middle line foreground */}
        <motion.svg
          style={{ y: lineTwoY }}
          className="absolute top-1/3 -left-20 w-[600px] h-[300px] opacity-20 text-[#002c8c] will-change-transform"
          viewBox="0 0 600 300"
          fill="none"
        >
          <path
            d="M0 180 Q300 240 600 80"
            stroke="currentColor"
            strokeWidth="2"
          />
          <circle cx="280" cy="220" r="4" fill="#003cb8" />
        </motion.svg>

        {/* Bottom line long */}
        <motion.svg
          style={{ x: lineThreeX }}
          className="absolute bottom-0 right-10 w-[800px] h-[220px] opacity-20 text-[#fcda04] will-change-transform"
          viewBox="0 0 800 220"
          fill="none"
        >
          <path d="M0 120 Q400 40 800 160" stroke="#003cb8" strokeWidth="1.5" />
          <circle cx="650" cy="130" r="6" fill="#fcda04" />
        </motion.svg>
      </div>

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline & Editorial Narrative (7 cols) */}
          <div className="lg:col-span-7 space-y-6 sm:space-y-7">
            {/* Tagline / Authority Pill (Without sparkles/icons per user specification) */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex items-center rounded-[2px] border border-[#003cb8]/30 bg-white/85 backdrop-blur-xs px-3.5 py-1.5 font-display text-[11px] font-bold uppercase tracking-widest text-[#003cb8] shadow-xs">
                <span>{badge}</span>
              </div>
            </motion.div>

            {/* Monumental Headline */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.08,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="space-y-1 sm:space-y-1.5"
            >
              <h1 className="font-heading text-[22px] sm:text-3xl md:text-4xl lg:text-[46px] font-black tracking-tight leading-[1.15] uppercase">
                <span className="block whitespace-nowrap text-[#151B2E]">
                  {part1}
                </span>
                <span className="block whitespace-nowrap text-[#003cb8]">
                  {part2}
                </span>
                {part3 && (
                  <span className="block whitespace-nowrap text-[#151B2E]">
                    {part3}
                  </span>
                )}
              </h1>
            </motion.div>

            {/* Editorial Subheadline */}
            <motion.p
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.16,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="text-base sm:text-xl text-[#35362B] leading-relaxed max-w-2xl font-sans"
            >
              {subtitle}
            </motion.p>

            {/* Primary CTAs in ICLE Architecture */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.24,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 max-w-full"
            >
              <Link
                href={primaryCtaLink}
                className="cta-button group touch-target w-full sm:w-auto text-center justify-center"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowDiagonal className="text-[#fcda04]" />
              </Link>

              <Link
                href={secondaryCtaLink}
                className="cta-button outline group touch-target w-full sm:w-auto text-center justify-center"
              >
                <span>{secondaryCtaLabel}</span>
                <ArrowDiagonal />
              </Link>

              <Link
                href="/partners"
                className="text-xs font-display font-bold uppercase tracking-wider text-[#003cb8] hover:text-[#002c8c] hover:underline px-2 py-2 inline-flex items-center justify-center gap-1 group w-full sm:w-auto text-center"
              >
                <span>Partner With Us</span>
                <ArrowDiagonal />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Editorial Hero Image with Guaranteed Scroll Parallax Motion (5 cols) */}
          <div className="lg:col-span-5 relative mt-4 lg:mt-0 max-w-full overflow-hidden sm:overflow-visible">
            <div className="relative mx-auto max-w-lg lg:max-w-none">
              {/* Background Geometric Accent Box with Counter-Parallax Drift */}
              <motion.div
                style={{ y: accentBoxY }}
                className="absolute right-0 bottom-0 sm:-right-4 sm:-bottom-4 w-full h-full rounded-[2px] border-2 border-[#003cb8]/30 bg-[#fcda04]/20 select-none pointer-events-none will-change-transform"
                aria-hidden="true"
              />

              {/* Main Parallax Framed Photographic Card */}
              <motion.div
                style={{ y: imageY, rotate: imageRotate, scale: imageScale }}
                className="relative overflow-hidden rounded-[2px] border border-[#003cb8]/40 bg-white shadow-2xl will-change-transform"
              >
                <Image
                  src={coverImage}
                  alt={coverImageAlt}
                  width={800}
                  height={600}
                  priority
                  className="w-full h-[320px] sm:h-[400px] lg:h-[440px] object-cover object-center transition-transform duration-500 hover:scale-105"
                />

                {/* Subtle Gradient & Vignette */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#002c8c]/80 via-black/10 to-transparent pointer-events-none" />

                {/* Floating Lower Badge with Independent Floating Parallax */}
                <motion.div
                  style={{ y: badgeY }}
                  className="absolute bottom-4 left-4 right-4 z-10 p-3.5 bg-white/95 backdrop-blur-md rounded-[2px] border border-[#D9DEEC] shadow-md flex items-center justify-between gap-3 will-change-transform"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="flex size-8 shrink-0 items-center justify-center rounded-[2px] bg-[#003cb8] text-[#fcda04]">
                      <CheckCircle2 className="size-4.5" />
                    </div>
                    <div className="min-w-0">
                      <p className="font-heading text-xs font-bold text-[#151B2E] truncate">
                        Verified Classroom Benchmark
                      </p>
                      <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-wider truncate">
                        Rivers State Education Network
                      </p>
                    </div>
                  </div>

                  <span className="font-display text-[10px] font-bold text-[#003cb8] bg-[#EEF2FA] px-2 py-1 rounded-[2px] uppercase shrink-0">
                    350+ Schools
                  </span>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
