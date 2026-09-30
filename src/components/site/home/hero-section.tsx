"use client";

import { motion, useScroll, useTransform } from "framer-motion";
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
    data?.badge && data.badge !== "Schools Voice"
      ? data.badge
      : "SCHOOLS VOICE - YOUR VOICE FOR EDUCATION";

  const part1 =
    data?.headlinePart1 && data.headlinePart1 !== "Clarity for Parents."
      ? data.headlinePart1
      : "YOUR VOICE";

  const part2 =
    data?.headlinePart2 && data.headlinePart2 !== "Growth for Schools."
      ? data.headlinePart2
      : "FOR EDUCATION.";

  const part3 =
    data?.headlinePart3 && data.headlinePart3 !== "Voice for Teachers."
      ? data.headlinePart3
      : "";

  const subtitle =
    data?.subtitle ||
    "Schools Voice, formerly Port Harcourt Schools, is an education news blog and media platform where parents discover schools, schools connect with families, and teachers find opportunities. We share education news, stories, insights, events, and resources from Nigeria and around the world.";

  const primaryCtaLabel = data?.primaryCtaLabel || "Explore School Directory";
  const primaryCtaLink = data?.primaryCtaLink || "/schools";
  const secondaryCtaLabel = data?.secondaryCtaLabel || "Upcoming Events";
  const secondaryCtaLink = data?.secondaryCtaLink || "/events";
  const coverImage = data?.coverImage || "/images/ph_hero_classroom.jpg";
  const coverImageAlt =
    data?.coverImageAlt ||
    "Port Harcourt Classroom Excellence and Dedicated Educator";

  const heroRef = useRef<HTMLDivElement>(null);

  // Global window scroll for reliable parallax tracking
  const { scrollY } = useScroll();

  // Distinct parallax transforms on scroll
  const lineOneY = useTransform(scrollY, [0, 600], [0, 90]);
  const lineTwoY = useTransform(scrollY, [0, 600], [0, -60]);
  const lineThreeX = useTransform(scrollY, [0, 600], [0, 70]);

  // Main hero image card translates upwards with subtle rotation & scaling
  const imageY = useTransform(scrollY, [0, 600], [0, -110]);
  const imageRotate = useTransform(scrollY, [0, 600], [0, -2]);
  const imageScale = useTransform(scrollY, [0, 600], [1, 1.04]);

  // Background accent shadow box moves in counter-direction for 3D depth
  const accentBoxY = useTransform(scrollY, [0, 600], [0, 60]);

  return (
    <section
      ref={heroRef}
      id="home_hero"
      className="relative overflow-hidden bg-gradient-to-br from-[#071E54] via-[#143A8C] to-[#09205C] border-b border-white/10 pt-10 pb-16 sm:pt-16 sm:pb-24 lg:pt-20 lg:pb-28 min-h-[580px] sm:min-h-[660px] lg:min-h-[720px] flex items-center"
    >
      {/* 1. Underlying Dot Grid Pattern */}
      <div
        className="absolute inset-0 pointer-events-none select-none opacity-70"
        style={{
          backgroundImage:
            "radial-gradient(circle, rgba(255, 255, 255, 0.16) 1.5px, transparent 1.5px)",
          backgroundSize: "24px 24px",
        }}
        aria-hidden="true"
      />

      {/* 2. Architectural Blueprint Waves & Curves with Subtle Parallax */}
      <div
        className="absolute inset-0 pointer-events-none select-none overflow-hidden max-w-full"
        aria-hidden="true"
      >
        {/* Top curved wave line with dashed blueprint arc */}
        <motion.svg
          style={{ y: lineOneY }}
          className="absolute -top-12 -left-20 sm:left-auto sm:right-0 w-[600px] sm:w-[850px] h-[340px] sm:h-[420px] text-white will-change-transform"
          viewBox="0 0 850 420"
          fill="none"
        >
          <path
            d="M -50 140 C 250 80, 480 280, 850 120"
            stroke="rgba(255, 255, 255, 0.22)"
            strokeWidth="2"
            strokeDasharray="6 6"
          />
          <circle cx="560" cy="190" r="5" fill="#FDC82F" />
        </motion.svg>

        {/* Middle wave line */}
        <motion.svg
          style={{ y: lineTwoY }}
          className="absolute top-1/3 -left-28 w-[500px] sm:w-[700px] h-[300px] will-change-transform"
          viewBox="0 0 700 300"
          fill="none"
        >
          <path
            d="M 0 160 C 260 240, 440 60, 700 180"
            stroke="rgba(255, 255, 255, 0.16)"
            strokeWidth="1.8"
          />
          <circle cx="340" cy="180" r="4" fill="rgba(255, 255, 255, 0.6)" />
        </motion.svg>

        {/* Bottom long wave line */}
        <motion.svg
          style={{ x: lineThreeX }}
          className="absolute bottom-0 right-0 sm:right-10 w-[600px] sm:w-[900px] h-[240px] will-change-transform"
          viewBox="0 0 900 240"
          fill="none"
        >
          <path
            d="M 0 140 C 350 40, 600 200, 900 100"
            stroke="rgba(255, 255, 255, 0.14)"
            strokeWidth="2"
          />
          <circle cx="720" cy="120" r="5.5" fill="#FDC82F" />
        </motion.svg>

        {/* Floating Geometric Diamonds */}
        <div className="absolute top-28 right-[46%] hidden xl:block w-7 h-7 rotate-45 border-2 border-[#FDC82F]/50 pointer-events-none" />
        <div className="absolute bottom-32 left-10 hidden lg:block w-5 h-5 rotate-45 border border-white/30 pointer-events-none" />
        <div className="absolute top-1/2 right-12 hidden lg:block w-6 h-6 rotate-45 border border-white/20 pointer-events-none" />
      </div>

      {/* 3. Main Content Container */}
      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-10 lg:gap-12 items-center">
          {/* Left Column: Headline & Action Triggers (7 cols) */}
          <div className="lg:col-span-7 space-y-5 sm:space-y-6">
            {/* Tagline / Authority Pill Badge */}
            <motion.div
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
            >
              <div className="inline-flex flex-col items-start rounded-xl border border-white/25 bg-white/10 backdrop-blur-md px-4 py-2.5 shadow-sm">
                <span className="font-display text-[11px] sm:text-xs font-black uppercase tracking-wider text-white">
                  {badge}
                </span>
                <span className="text-[10px] sm:text-[11px] font-medium text-blue-100/75 tracking-normal mt-0.5">
                  Formerly Port Harcourt Schools
                </span>
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
              className="space-y-0.5 sm:space-y-1"
            >
              <h1 className="font-heading text-3xl sm:text-4xl md:text-5xl lg:text-[54px] xl:text-[60px] font-black tracking-tight leading-[1.08] uppercase">
                <span className="block text-white">{part1}</span>
                <span className="block text-[#FDC82F]">{part2}</span>
                {part3 && <span className="block text-white">{part3}</span>}
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
              className="text-sm sm:text-base lg:text-lg text-blue-50/95 leading-relaxed max-w-2xl font-sans"
            >
              {subtitle}
            </motion.p>

            {/* Primary Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 18 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{
                duration: 0.6,
                delay: 0.24,
                ease: [0.16, 1, 0.3, 1],
              }}
              className="pt-2 flex flex-col sm:flex-row items-stretch sm:items-center gap-3.5 sm:gap-4 max-w-full"
            >
              {/* Primary Gold CTA */}
              <Link
                href={primaryCtaLink}
                className="inline-flex items-center justify-center gap-2 px-6 sm:px-7 py-3.5 sm:py-4 rounded-xl bg-[#FDC82F] hover:bg-[#F2BA1D] text-[#071E54] font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 shadow-lg shadow-black/25 hover:scale-[1.02] active:scale-[0.98] group text-center touch-target"
              >
                <span>{primaryCtaLabel}</span>
                <ArrowDiagonal className="text-[#071E54] size-4 ml-1" />
              </Link>

              {/* Secondary White Outlined CTA */}
              <Link
                href={secondaryCtaLink}
                className="inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-3.5 sm:py-4 rounded-xl border-2 border-white bg-white/5 hover:bg-white/15 text-white font-black text-xs sm:text-sm uppercase tracking-wider transition-all duration-200 backdrop-blur-xs hover:scale-[1.02] active:scale-[0.98] group text-center touch-target"
              >
                <span>{secondaryCtaLabel}</span>
                <ArrowDiagonal className="text-white size-4 ml-1" />
              </Link>

              {/* Tertiary Partner Link */}
              <Link
                href="/partners"
                className="inline-flex items-center justify-center gap-1.5 px-3 py-2 text-xs sm:text-sm font-black uppercase tracking-wider text-[#FDC82F] hover:text-[#FFDF78] transition-colors group text-center"
              >
                <span>Partner With Us</span>
                <ArrowDiagonal className="text-[#FDC82F] size-3.5" />
              </Link>
            </motion.div>
          </div>

          {/* Right Column: Hero Photographic Card with Gold Frame (5 cols) */}
          <div className="lg:col-span-5 relative mt-6 lg:mt-0 max-w-full">
            <div className="relative mx-auto max-w-md lg:max-w-none">
              {/* Background Decorative Gold Accent Box with Counter-Parallax Drift */}
              <motion.div
                style={{ y: accentBoxY }}
                className="absolute -left-3 -bottom-3 sm:-left-4 sm:-bottom-4 w-full h-full rounded-2xl border-2 border-[#FDC82F]/70 select-none pointer-events-none will-change-transform"
                aria-hidden="true"
              />

              {/* Main Parallax Framed Photographic Card */}
              <motion.div
                style={{ y: imageY, rotate: imageRotate, scale: imageScale }}
                className="relative overflow-hidden rounded-2xl border border-white/20 bg-[#071E54] shadow-2xl shadow-[#000514]/70 will-change-transform"
              >
                <Image
                  src={coverImage}
                  alt={coverImageAlt}
                  width={800}
                  height={600}
                  priority
                  className="w-full h-[280px] sm:h-[380px] lg:h-[460px] object-cover object-center transition-transform duration-500 hover:scale-105"
                />

                {/* Subtle Gradient & Vignette on Image */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#071E54]/85 via-transparent to-transparent pointer-events-none" />

                {/* Floating Lower Trust Badge */}
                <div className="absolute bottom-4 left-4 right-4 sm:right-auto sm:max-w-xs z-10 p-3 px-4 bg-[#071E54]/90 backdrop-blur-md rounded-xl border border-white/20 shadow-xl flex items-center gap-3.5">
                  <div className="size-8 sm:size-9 rounded-full bg-[#FDC82F] flex items-center justify-center text-[#071E54] font-black text-sm sm:text-base shrink-0">
                    ✓
                  </div>
                  <div>
                    <p className="text-xs sm:text-sm font-black text-white leading-tight">
                      500+ Verified Schools
                    </p>
                    <p className="text-[10px] sm:text-[11px] font-medium text-blue-100/75 leading-tight mt-0.5">
                      Port Harcourt &amp; Beyond
                    </p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
