"use client";

import { Quote } from "lucide-react";
import Image from "next/image";
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

export interface FounderTeaserData {
  badge?: string;
  title?: string;
  quote?: string;
  author?: string;
  role?: string;
  bio?: string;
  image?: string;
  imageAlt?: string;
  ctaLabel?: string;
  ctaLink?: string;
}

export function FounderTeaser({ data }: { data?: FounderTeaserData }) {
  const badge = data?.badge || "Meet the Founder";
  const title = data?.title || "A Vision for Education in Port Harcourt";
  const quote =
    data?.quote ||
    "When we improve the people, systems and conversations around education, we improve the future of our children.";
  const author = data?.author || "Dr. Grace Phillips-Ayonuwe";
  const role =
    data?.role ||
    "Founder, Schools Voice (Formerly Port Harcourt Schools) & GeePhill Education";
  const bio =
    data?.bio ||
    "Dr. Grace Phillips-Ayonuwe is an education strategist, consultant, teacher educator, content creator and entrepreneur passionate about improving the quality of education in Nigeria. With a PhD in Educational Administration/Management, she founded Schools Voice (formerly Port Harcourt Schools) to connect families, celebrate educators through the Teachers Spotlight Awards & Summit, and build a trusted education ecosystem across Port Harcourt and beyond.";
  const image = data?.image || "/images/dr-grace-phillips-ayonuwe.jpg";
  const imageAlt =
    data?.imageAlt ||
    `${author} — Founder of Schools Voice (Formerly Port Harcourt Schools)`;
  const ctaLabel = data?.ctaLabel || "Read Full Profile & Vision";
  const ctaLink = data?.ctaLink || "/about#founder";

  return (
    <section className="relative py-16 sm:py-24 bg-white border-b border-[#E4E0D5] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Founder Note & Narrative */}
          <div className="lg:col-span-7 space-y-6">
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-[2px] border border-[#003cb8]/25 bg-[#003cb8]/5 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-[#003cb8]">
                <span>{badge}</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h2 className="font-heading text-2xl sm:text-4xl font-black text-[#151B2E] tracking-tight uppercase leading-tight">
                {title}
              </h2>
            </FadeIn>

            <FadeIn delay={0.12}>
              {/* Highlighted Quote Block */}
              <div className="relative pl-6 sm:pl-7 border-l-4 border-[#003cb8] bg-[#F5F4F0] p-5 sm:p-6 rounded-r-lg">
                <Quote className="size-6 text-[#003cb8]/30 absolute top-4 right-4" />
                <p className="font-heading text-base sm:text-lg font-bold text-[#151B2E] italic leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-3 pt-3 border-t border-[#D9DEEC]/70 flex items-center justify-between">
                  <div>
                    <span className="block font-heading text-sm font-black text-[#003cb8]">
                      {author}
                    </span>
                    <span className="block text-xs text-[#55627D] font-medium">
                      {role}
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>

            <FadeIn delay={0.18}>
              <p className="text-sm sm:text-base text-[#55627D] leading-relaxed font-sans">
                {bio}
              </p>
            </FadeIn>

            <FadeIn delay={0.24}>
              <div className="pt-2 flex flex-wrap items-center gap-4">
                <Link
                  href={ctaLink}
                  className="bg-[#003cb8] hover:bg-[#002c8c] text-white font-display font-bold text-xs uppercase tracking-wider px-6 h-12 rounded-[2px] inline-flex items-center gap-2 transition-colors shadow-xs group"
                >
                  <span>{ctaLabel}</span>
                  <ArrowDiagonal className="text-[#fcda04]" />
                </Link>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Prominent Founder Picture */}
          <div className="lg:col-span-5">
            <FadeIn delay={0.15}>
              <div className="relative mx-auto max-w-md lg:max-w-none">
                {/* Decorative architectural frame accents */}
                <div
                  className="absolute -top-3 -right-3 w-full h-full rounded-2xl bg-[#fcda04]/20 -z-10 transform translate-x-1 translate-y-1"
                  aria-hidden="true"
                />
                <div
                  className="absolute -bottom-3 -left-3 w-full h-full rounded-2xl bg-[#003cb8]/10 -z-10 transform -translate-x-1 -translate-y-1"
                  aria-hidden="true"
                />

                <div className="bg-white rounded-2xl overflow-hidden border border-[#D9DEEC] shadow-xl">
                  {/* Portrait Picture: natural square ratio, uncropped, clean without any gradient overlay */}
                  <div className="relative aspect-square w-full bg-[#f8fafc] overflow-hidden">
                    <Image
                      src={image}
                      alt={imageAlt}
                      fill
                      sizes="(max-width: 1024px) 100vw, 40vw"
                      className="object-cover object-center hover:scale-[1.01] transition-transform duration-300"
                      priority
                    />
                  </div>

                  {/* Founder nameplate cleanly beneath the photo */}
                  <div className="p-5 sm:p-6 bg-white border-t border-[#E4E0D5]">
                    <span className="inline-block text-[10px] font-display font-bold uppercase tracking-widest text-[#003cb8] bg-[#003cb8]/10 px-2.5 py-0.5 rounded mb-1.5">
                      Founder &amp; Visionary
                    </span>
                    <h3 className="font-heading text-xl sm:text-2xl font-black text-[#151B2E] leading-tight">
                      {author}
                    </h3>
                    <p className="text-xs text-[#55627D] font-sans mt-0.5">
                      {role}
                    </p>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
