"use client";

import { Calendar, MapPin } from "lucide-react";
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

export function FeaturedEventBanner() {
  return (
    <section
      id="featured-events"
      className="relative overflow-hidden bg-[#F5F4F0] border-b border-[#E4E0D5] py-16 sm:py-24"
    >
      {/* Signature ICLE Watermark */}
      <span className="offset_subheader" aria-hidden="true">
        Upcoming Events
      </span>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#E4E0D5] pb-6">
          <FadeIn className="flex items-center gap-3">
            <div className="flex size-10 items-center justify-center rounded-[2px] bg-[#184098] text-[#FDDA32]">
              <Calendar className="size-5" />
            </div>
            <div>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#151B2E] tracking-tight uppercase">
                Events &amp; Summits
              </h2>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Link
              href="/events"
              className="group inline-flex items-center font-display text-xs font-bold uppercase tracking-widest text-[#184098] hover:text-[#08276B]"
            >
              <span>All Events</span>
              <ArrowDiagonal />
            </Link>
          </FadeIn>
        </div>

        {/* 2-Column Event Cards with 3-Tier Date Boxes */}
        <StaggerContainer className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Card 1: Flagship Annual Summit (The Teachers Spotlight Summit & Awards 2026) */}
          <StaggerItem>
            <div className="group flex flex-col sm:flex-row bg-white border border-[#D9DEEC] rounded-[2px] overflow-hidden hover:shadow-xl hover:border-[#184098]/40 transition-all duration-300 h-full">
              {/* 3-Tier Solid Brand Date Box */}
              <div className="bg-[#184098] text-white flex flex-row sm:flex-col items-center justify-between sm:justify-center px-6 py-4 sm:py-8 sm:w-36 shrink-0 text-center border-b sm:border-b-0 sm:border-r border-[#08276B]">
                <span className="font-display text-xs font-black uppercase tracking-widest text-[#FDDA32]">
                  NOV
                </span>
                <span className="font-heading text-3xl sm:text-5xl font-black text-white leading-none my-1 sm:my-2">
                  21
                </span>
                <span className="font-mono text-xs text-white/75 font-semibold">
                  2026
                </span>
              </div>

              {/* Event Content Details */}
              <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center rounded-[2px] bg-[#EEF2FA] text-[#184098] border border-[#D9DEEC] px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider">
                    Annual Summit &amp; Awards
                  </div>

                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#151B2E] leading-snug group-hover:text-[#184098] transition-colors">
                    <Link href="/events">
                      The Teachers Spotlight Education Summit &amp; Awards 2026
                    </Link>
                  </h3>

                  <div className="flex items-start gap-2 text-xs text-[#35362B] pt-1">
                    <MapPin className="size-4 text-[#184098] shrink-0 mt-0.5" />
                    <span>
                      Celebrate Center, Olu Obasanjo Road, Port Harcourt
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                    Honouring the teachers shaping the next generation alongside
                    a summit on the conversations that matter most in Nigerian
                    education.
                  </p>
                </div>

                {/* Card Footer Divider */}
                <div className="flex items-center justify-between pt-4 mt-6 border-t border-[#D9DEEC] text-xs">
                  <span className="text-muted-foreground font-medium">
                    Registration Open
                  </span>
                  <Link
                    href="/events"
                    className="font-display font-bold uppercase tracking-wider text-[#184098] group-hover:text-[#08276B] inline-flex items-center"
                  >
                    <span>Learn More &amp; Register</span>
                    <ArrowDiagonal />
                  </Link>
                </div>
              </div>
            </div>
          </StaggerItem>

          {/* Card 2: GeePhill Masterclass / Accredited Training */}
          <StaggerItem>
            <div className="group flex flex-col sm:flex-row bg-white border border-[#D9DEEC] rounded-[2px] overflow-hidden hover:shadow-xl hover:border-[#184098]/40 transition-all duration-300 h-full">
              {/* 3-Tier Light Date Box */}
              <div className="bg-[#EEF2FA] text-[#151B2E] flex flex-row sm:flex-col items-center justify-between sm:justify-center px-6 py-4 sm:py-8 sm:w-36 shrink-0 text-center border-b sm:border-b-0 sm:border-r border-[#D9DEEC]">
                <span className="font-display text-xs font-black uppercase tracking-widest text-[#184098]">
                  OCT
                </span>
                <span className="font-heading text-3xl sm:text-5xl font-black text-[#151B2E] leading-none my-1 sm:my-2">
                  14
                </span>
                <span className="font-mono text-xs text-muted-foreground font-semibold">
                  2026
                </span>
              </div>

              {/* Event Content Details */}
              <div className="flex-1 p-6 sm:p-7 flex flex-col justify-between">
                <div className="space-y-2.5">
                  <div className="inline-flex items-center rounded-[2px] bg-[#EEF2FA] text-[#184098] border border-[#D9DEEC] px-2.5 py-0.5 font-display text-[10px] font-bold uppercase tracking-wider">
                    Executive Masterclass • GeePhill
                  </div>

                  <h3 className="font-heading text-xl sm:text-2xl font-bold text-[#151B2E] leading-snug group-hover:text-[#184098] transition-colors">
                    <Link href="/events">
                      Curriculum Leadership &amp; Star Teacher Retention
                    </Link>
                  </h3>

                  <div className="flex items-start gap-2 text-xs text-[#35362B] pt-1">
                    <MapPin className="size-4 text-[#184098] shrink-0 mt-0.5" />
                    <span>
                      GeePhill Training Center, Old GRA, Port Harcourt
                    </span>
                  </div>

                  <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed pt-1">
                    TRCN-accredited executive training for proprietors,
                    principals, and headteachers on institutional resilience and
                    educator growth.
                  </p>
                </div>

                {/* Card Footer Divider */}
                <div className="flex items-center justify-between pt-4 mt-6 border-t border-[#D9DEEC] text-xs">
                  <span className="text-muted-foreground font-medium">
                    For School Leaders
                  </span>
                  <Link
                    href="/events"
                    className="font-display font-bold uppercase tracking-wider text-[#184098] group-hover:text-[#08276B] inline-flex items-center"
                  >
                    <span>Reserve Seat</span>
                    <ArrowDiagonal />
                  </Link>
                </div>
              </div>
            </div>
          </StaggerItem>
        </StaggerContainer>
      </div>
    </section>
  );
}
