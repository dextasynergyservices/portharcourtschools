"use client";

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

export function IndentedFeature() {
  return (
    <section
      id="scholars"
      className="relative py-20 sm:py-28 bg-[#EFECE6] overflow-hidden border-b border-[#E4E0D5]"
    >
      {/* Floating Graphic Emblem in Upper Right */}
      <div className="absolute right-0 top-0 w-36 sm:w-64 lg:w-80 pointer-events-none opacity-40 mix-blend-multiply select-none -translate-y-6 sm:-translate-y-12">
        <Image
          src="/images/classroom_champions_emblem.jpg"
          alt="Classroom Champions Emblem"
          width={400}
          height={400}
          className="w-full h-auto"
        />
      </div>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-4xl space-y-6">
          <FadeIn>
            <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              Teacher Recognition Initiative
            </span>
          </FadeIn>

          {/* Signature ICLE Hanging Indent Headline */}
          <FadeIn delay={0.08}>
            <h2 className="h2_featured text-[#151B2E]">
              A new generation of classroom champions
            </h2>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="text-base sm:text-xl text-[#35362B] leading-relaxed font-sans max-w-3xl">
              PortHarcourtSchools’ Teachers Spotlight Initiative honors,
              develops, and supports outstanding educators across Rivers State.
              The program identifies excellence in curriculum delivery, provides
              educators with platforms to publish teaching insights, and
              connects classroom champions to institutional partners.
            </p>
          </FadeIn>

          <FadeIn delay={0.24}>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link href="/events" className="cta-button group">
                <span>Explore Events &amp; Summit</span>
                <ArrowDiagonal className="text-[#FDDA32]" />
              </Link>
              <Link href="/about" className="cta-button outline group">
                <span>About the Program</span>
                <ArrowDiagonal />
              </Link>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
