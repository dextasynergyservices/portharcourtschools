"use client";

import {
  Award,
  BookOpen,
  CheckCircle2,
  GraduationCap,
  Quote,
} from "lucide-react";
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

export interface AboutFounderData {
  badge?: string;
  title?: string;
  subtitle?: string;
  author?: string;
  role?: string;
  quote?: string;
  image?: string;
  imageAlt?: string;
  letterTitle?: string;
  letterParagraph1?: string;
  letterParagraph2?: string;
  letterParagraph3?: string;
  letterParagraph4?: string;
}

export function MeetTheFounder({ data }: { data?: AboutFounderData }) {
  const badge = data?.badge || "Office of the Founder";
  const title = data?.title || "Meet the Founder";
  const subtitle =
    data?.subtitle ||
    "Education strategist, consultant, researcher, and convener of the Teachers Spotlight Awards & Summit.";
  const author = data?.author || "Dr. Grace Phillips-Ayonuwe";
  const role =
    data?.role ||
    "Founder, Schools Voice (Formerly Port Harcourt Schools) & GeePhill Education";
  const quote =
    data?.quote ||
    "When we improve the people, systems and conversations around education, we improve the future of our children.";
  const image = data?.image || "/images/dr-grace-phillips-ayonuwe.jpg";
  const imageAlt = data?.imageAlt || `${author} — Founder`;
  const letterTitle =
    data?.letterTitle || "Building a Trusted Education Ecosystem";
  const p1 =
    data?.letterParagraph1 ||
    "Dr. Grace Phillips-Ayonuwe is an education strategist, consultant, teacher educator, content creator and entrepreneur passionate about improving the quality of education in Nigeria. She is the Founder of Schools Voice (formerly Port Harcourt Schools), an education media and information platform created to connect parents, schools, teachers and education stakeholders while making reliable information about schools, education opportunities and events more accessible to families in Port Harcourt and beyond.";
  const p2 =
    data?.letterParagraph2 ||
    "With a PhD in Educational Administration/Management, Dr. Grace brings together academic knowledge, practical school experience, teacher development and education communication in her work across the education sector.";
  const p3 =
    data?.letterParagraph3 ||
    "She is also the Founder and Director of GeePhill Education, an education consultancy providing services including school consulting, teacher training, curriculum development, recruitment and education marketing. Through her work with schools and educators, she focuses on strengthening teaching practice, school leadership, systems and sustainable school growth.";
  const p4 =
    data?.letterParagraph4 ||
    "Dr. Grace is also the convener of the Teachers Spotlight Awards & Summit (TSA), an initiative created to recognise, celebrate and equip educators while creating a platform for conversations around the future of education. Through Schools Voice (formerly Port Harcourt Schools), her vision is to build a trusted education ecosystem where parents can discover schools, schools can tell their stories, educators can access opportunities and the wider education community can stay informed about what is happening across Port Harcourt.\n\nHer work is driven by a simple belief: when we improve the people, systems and conversations around education, we improve the future of our children.";

  return (
    <section
      id="founder"
      className="relative py-16 sm:py-24 bg-[#F5F4F0] border-b border-[#E4E0D5] overflow-hidden scroll-mt-20"
    >
      {/* Background Architectural Watermark */}
      <span className="offset_subheader select-none" aria-hidden="true">
        Leadership
      </span>

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <FadeIn className="max-w-3xl pb-6 border-b border-[#D9DEEC] mb-12">
          <div className="inline-flex items-center gap-2 rounded-[2px] border border-[#003cb8]/25 bg-white px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-[#003cb8]">
            <span>{badge}</span>
          </div>
          <h2 className="font-heading text-3xl sm:text-5xl font-black text-[#151B2E] tracking-tight uppercase leading-tight mt-3">
            {title}
          </h2>
          <p className="text-base sm:text-xl text-[#35362B] font-sans mt-2">
            {subtitle}
          </p>
        </FadeIn>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
          {/* Left Column: Prominent Founder Portrait & Profile Card */}
          <div className="lg:col-span-5 space-y-6">
            <FadeIn>
              <div className="bg-white rounded-xl border border-[#D9DEEC] overflow-hidden shadow-md">
                {/* Large, prominent founder portrait: natural square ratio, uncropped, clean without any gradient overlay */}
                <div className="relative aspect-square w-full bg-[#f8fafc] overflow-hidden">
                  <Image
                    src={image}
                    alt={imageAlt}
                    fill
                    sizes="(max-width: 1024px) 100vw, 40vw"
                    className="object-cover object-center"
                    priority
                  />
                </div>

                {/* Founder nameplate cleanly below the photo */}
                <div className="p-5 sm:p-6 border-b border-[#D9DEEC] bg-[#F8FAFC]">
                  <span className="inline-block text-[10px] font-display font-bold uppercase tracking-wider text-[#003cb8] bg-[#003cb8]/10 px-2.5 py-0.5 rounded mb-1">
                    Ecosystem Founder
                  </span>
                  <h3 className="font-heading text-xl sm:text-2xl font-black text-[#151B2E] leading-snug">
                    {author}
                  </h3>
                  <p className="text-xs text-[#55627D] font-sans mt-0.5">
                    {role}
                  </p>
                </div>

                <div className="p-6 sm:p-8 space-y-6">
                  {/* Key Roles & Responsibilities */}
                  <div className="space-y-3.5 text-xs font-sans text-[#35362B]">
                    <div className="flex items-start gap-3">
                      <GraduationCap className="size-4 text-[#003cb8] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#151B2E] block font-heading text-sm">
                          PhD in Educational Administration
                        </strong>
                        <span className="text-[#55627D] leading-relaxed">
                          Brings together academic research, practical school
                          experience, teacher development, and education
                          communication.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Award className="size-4 text-[#003cb8] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#151B2E] block font-heading text-sm">
                          Convener, Teachers Spotlight Awards &amp; Summit
                        </strong>
                        <span className="text-[#55627D] leading-relaxed">
                          Recognising, celebrating, and equipping educators
                          while fostering vital conversations on the future of
                          education.
                        </span>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <BookOpen className="size-4 text-[#003cb8] shrink-0 mt-0.5" />
                      <div>
                        <strong className="text-[#151B2E] block font-heading text-sm">
                          Founder &amp; Director, GeePhill Education
                        </strong>
                        <span className="text-[#55627D] leading-relaxed">
                          Educational consultancy delivering school consulting,
                          teacher training, curriculum development, recruitment,
                          and education marketing.
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Impact Metrics */}
                  <div className="grid grid-cols-3 gap-2 pt-4 border-t border-[#D9DEEC] text-center">
                    <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#D9DEEC]/60">
                      <span className="block font-heading text-lg font-black text-[#003cb8]">
                        PhD
                      </span>
                      <span className="text-[10px] text-[#55627D] font-medium leading-tight">
                        Educational Admin
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#D9DEEC]/60">
                      <span className="block font-heading text-lg font-black text-[#003cb8]">
                        TSA
                      </span>
                      <span className="text-[10px] text-[#55627D] font-medium leading-tight">
                        Summit Convener
                      </span>
                    </div>
                    <div className="p-2.5 rounded bg-[#F8FAFC] border border-[#D9DEEC]/60">
                      <span className="block font-heading text-lg font-black text-[#003cb8]">
                        GeePhill
                      </span>
                      <span className="text-[10px] text-[#55627D] font-medium leading-tight">
                        Education Director
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>

            {/* Pull Quote Card */}
            <FadeIn delay={0.1}>
              <div className="bg-[#002c8c] text-white p-6 sm:p-7 rounded-xl border border-[#003cb8] shadow-lg relative overflow-hidden">
                <Quote className="size-8 text-[#fcda04]/20 absolute top-4 right-4" />
                <p className="font-heading text-sm sm:text-base font-bold italic text-white leading-relaxed">
                  &ldquo;{quote}&rdquo;
                </p>
                <div className="mt-4 pt-3 border-t border-white/15 flex items-center justify-between text-xs text-[#D9DEEC]">
                  <span className="font-bold text-[#fcda04]">
                    Guiding Philosophy
                  </span>
                  <div className="flex flex-col text-right">
                    <span className="font-semibold text-white">
                      Schools Voice
                    </span>
                    <span className="text-[10px] text-[#D9DEEC]/70">
                      Formerly Port Harcourt Schools
                    </span>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Founder's Narrative & Letter */}
          <div className="lg:col-span-7 space-y-6">
            <FadeIn delay={0.08}>
              <div className="bg-white rounded-xl border border-[#D9DEEC] p-7 sm:p-10 shadow-sm space-y-6 font-sans">
                <div className="border-b border-[#D9DEEC] pb-4">
                  <span className="font-display text-xs font-bold uppercase tracking-widest text-[#003cb8]">
                    Founder&apos;s Perspective
                  </span>
                  <h3 className="font-heading text-xl sm:text-2xl font-black text-[#151B2E] mt-1">
                    {letterTitle}
                  </h3>
                </div>

                <div className="space-y-4 text-sm sm:text-base text-[#35362B] leading-relaxed">
                  <p className="whitespace-pre-line">{p1}</p>
                  <p className="whitespace-pre-line">{p2}</p>
                  <p className="whitespace-pre-line">{p3}</p>
                  <p className="whitespace-pre-line">{p4}</p>
                </div>

                {/* Commitments list */}
                <div className="bg-[#F8FAFC] rounded-lg border border-[#D9DEEC] p-5 space-y-3">
                  <h4 className="font-heading text-xs font-bold uppercase tracking-wider text-[#151B2E]">
                    Our Three Unwavering Commitments:
                  </h4>
                  <ul className="space-y-2 text-xs sm:text-sm text-[#55627D]">
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-[#003cb8] shrink-0 mt-0.5" />
                      <span>
                        <strong>Objective Clarity:</strong> We connect parents
                        with verified, accessible information about schools,
                        events, and opportunities across Rivers State.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-[#003cb8] shrink-0 mt-0.5" />
                      <span>
                        <strong>Teacher Dignity:</strong> Every educator
                        deserves continuous capacity building, fair recognition
                        through the Teachers Spotlight Awards, and real career
                        growth.
                      </span>
                    </li>
                    <li className="flex items-start gap-2.5">
                      <CheckCircle2 className="size-4 text-[#003cb8] shrink-0 mt-0.5" />
                      <span>
                        <strong>Ecosystem Growth:</strong> When we strengthen
                        teaching practice, school leadership, and educational
                        systems, we improve the future of our children.
                      </span>
                    </li>
                  </ul>
                </div>

                {/* Formal Sign-off */}
                <div className="pt-4 border-t border-[#D9DEEC] flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="block font-heading text-base font-black text-[#151B2E]">
                      {author}
                    </span>
                    <span className="block text-xs text-[#55627D]">{role}</span>
                  </div>

                  <Link
                    href="/contact"
                    className="bg-[#003cb8] hover:bg-[#002c8c] text-white font-display font-bold text-xs uppercase tracking-wider px-5 h-10 rounded-[2px] inline-flex items-center gap-2 transition-colors shrink-0 shadow-xs group"
                  >
                    <span>Connect with Leadership</span>
                    <ArrowDiagonal className="text-[#fcda04]" />
                  </Link>
                </div>
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
