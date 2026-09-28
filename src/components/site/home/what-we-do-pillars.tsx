"use client";

import { Award, BookOpen, GraduationCap } from "lucide-react";
import Link from "next/link";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion-wrapper";

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

export interface WhatWeDoCmsData {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export function WhatWeDoPillars({ cmsData }: { cmsData?: WhatWeDoCmsData }) {
  const badge = cmsData?.badge || "Strategic Framework";
  const title = cmsData?.title || "What We Do (Three Pillars)";
  const pillars = [
    {
      number: "01",
      title: "Media & Community",
      subtitle: "Schools Voice Platform",
      desc: "Our platform reaches thousands of parents and educators with weekly content on school admissions, curriculum updates, child safeguarding, and day-to-day school life across Port Harcourt.",
      icon: BookOpen,
      href: "/blog",
      linkText: "Read Editorial Insights",
    },
    {
      number: "02",
      title: "Programmes & Consulting",
      subtitle: "GeePhill Education Partnership",
      desc: "Accredited teacher training, TRCN-certified CPD masterclasses, and executive consulting support for school proprietors and educational leadership teams.",
      icon: GraduationCap,
      href: "/events#programmes",
      linkText: "Explore Programmes",
    },
    {
      number: "03",
      title: "Recognition & Awards",
      subtitle: "Teachers Spotlight Initiative",
      desc: "Through flagship gatherings like the annual Teachers Spotlight Summit & Awards, we shine a well-deserved light on classroom champions shaping the next generation.",
      icon: Award,
      href: "/events",
      linkText: "Summit & Nominations",
    },
  ];

  return (
    <section
      id="what-we-do"
      className="relative py-16 sm:py-24 bg-[#EFECE6] border-b border-[#E4E0D5] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between pb-4 border-b border-[#D9DEEC] mb-10 gap-2">
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              {badge}
            </span>
            <h2 className="h2_subheader mt-1">{title}</h2>
          </div>
          <Link href="/about" className="subheader_cta group">
            <span>Our Full Mission</span>
            <ArrowDiagonal />
          </Link>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {pillars.map((pillar) => {
            const Icon = pillar.icon;
            return (
              <StaggerItem key={pillar.number}>
                <div className="h-full flex flex-col justify-between bg-white rounded-[2px] p-8 border border-[#D9DEEC] hover:border-[#184098] transition-all shadow-xs hover:shadow-md group">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-2xl font-black text-[#184098]">
                        {pillar.number}
                      </span>
                      <div className="flex size-10 items-center justify-center rounded-[2px] bg-[#EEF2FA] text-[#184098] group-hover:bg-[#184098] group-hover:text-white transition-colors">
                        <Icon className="size-5" />
                      </div>
                    </div>

                    <div>
                      <span className="text-[11px] font-display font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                        {pillar.subtitle}
                      </span>
                      <h3 className="font-heading text-xl font-black text-[#151B2E] group-hover:text-[#184098] transition-colors">
                        {pillar.title}
                      </h3>
                      <p className="text-sm text-[#55627D] mt-2.5 leading-relaxed font-sans">
                        {pillar.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#D9DEEC]/70">
                    <Link
                      href={pillar.href}
                      className="inline-flex items-center text-xs font-display font-bold uppercase tracking-wider text-[#184098] group-hover:text-[#08276B] transition-colors"
                    >
                      <span>{pillar.linkText}</span>
                      <ArrowDiagonal />
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            );
          })}
        </StaggerContainer>
      </div>
    </section>
  );
}
