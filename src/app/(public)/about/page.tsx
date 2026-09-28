import { Award, BookOpen, GraduationCap, Handshake } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPageContent } from "@/app/(admin)/admin/pages/actions";
import { MeetTheFounder } from "@/components/site/about/meet-the-founder";
import {
  type WhatWeDoCmsData,
  WhatWeDoPillars,
} from "@/components/site/home/what-we-do-pillars";
import {
  WhoWeServe,
  type WhoWeServeCmsData,
} from "@/components/site/home/who-we-serve";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion-wrapper";

export const revalidate = 900;

export const metadata: Metadata = {
  title:
    "About Us — Schools Voice (Formerly Port Harcourt Schools) | EdFocus Africa",
  description:
    "Schools Voice (formerly Port Harcourt Schools) is the education media and community platform of EdFocus Africa, built to close the information and support gap between schools, parents and the education system.",
  alternates: {
    canonical: "/about",
  },
};

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

export default async function AboutPage() {
  const pageData = await getPageContent("about");
  const sections =
    (pageData.sections as Record<string, Record<string, string | undefined>>) ||
    {};

  const heroBadge = sections.hero?.badge || "EdFocus Africa Platform";
  const heroTitle = sections.hero?.title || "Who We Are";
  const heroSubtitle =
    sections.hero?.subtitle ||
    "PortHarcourtSchools is the education media and community platform of EdFocus Africa, built to close the information and support gap between schools, parents and the education system meant to serve them.";

  const missionTitle = sections.mission?.title || "Our Mission";
  const missionDesc =
    sections.mission?.description ||
    "To give parents clarity and give schools the tools, visibility and recognition to grow.";

  const visionTitle = sections.vision?.title || "Our Vision";
  const visionDesc =
    sections.vision?.description ||
    "An education community where every parent can make an informed choice, every teacher has a path to grow, and every school has a clear standard to aim for, starting in Port Harcourt and expanding across Nigeria and Africa.";

  const whatWeDoActions = [
    {
      action: "Inform",
      desc: "Through content that breaks down curriculum changes, school life, safeguarding and parenting decisions in plain language.",
      icon: BookOpen,
    },
    {
      action: "Equip",
      desc: "Through accredited teacher and school leadership training delivered via GeePhill Education Consulting.",
      icon: GraduationCap,
    },
    {
      action: "Celebrate",
      desc: "Through public recognition platforms like the Teachers Spotlight Awards, which put deserving educators in the spotlight.",
      icon: Award,
    },
    {
      action: "Connect",
      desc: "Through partnerships that bring resources, visibility and opportunity into the education space.",
      icon: Handshake,
    },
  ];

  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://portharcourtschools.com";
  const siteUrl = rawUrl.replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "AboutPage",
    name: "About Schools Voice (Formerly Port Harcourt Schools)",
    description: heroSubtitle,
    url: `${siteUrl}/about`,
    publisher: {
      "@type": "EducationalOrganization",
      name: "Schools Voice (Formerly Port Harcourt Schools) / EdFocus Africa",
      url: siteUrl,
      logo: `${siteUrl}/images/logo.png`,
    },
  };

  return (
    <div className="w-full bg-[#F5F4F0] text-[#151B2E]">
      {/* Schema.org Structured Data */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Header Section with ICLE Architectural Aesthetic */}
      <section className="relative overflow-hidden bg-[#F5F4F0] border-b border-[#E4E0D5] pt-16 pb-20 sm:pt-24 sm:pb-28">
        <span className="offset_subheader" aria-hidden="true">
          About Us
        </span>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <FadeIn>
            <div className="inline-flex items-center rounded-[2px] border border-[#184098]/30 bg-white/80 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              {heroBadge}
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#151B2E] uppercase leading-tight">
              {heroTitle}
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="text-base sm:text-xl text-[#35362B] leading-relaxed max-w-3xl font-sans">
              {heroSubtitle}
            </p>
          </FadeIn>

          <FadeIn delay={0.22}>
            <p className="text-sm sm:text-base text-[#55627D] leading-relaxed max-w-3xl font-sans">
              We started as a content page documenting school life across Port
              Harcourt. Today, we’ve grown into a platform that combines media,
              structured programmes and public recognition, all working toward
              the same goal: an education ecosystem where good schools and good
              teachers are visible, supported and celebrated.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Mission & Vision Section */}
      <section className="relative py-16 sm:py-24 bg-white border-b border-[#E4E0D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <FadeIn className="bg-[#F5F4F0] p-8 sm:p-10 rounded-[2px] border border-[#D9DEEC] space-y-4">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
                Our Purpose
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#151B2E]">
                {missionTitle}
              </h2>
              <p className="text-base sm:text-lg text-[#35362B] leading-relaxed font-sans">
                {missionDesc}
              </p>
            </FadeIn>

            <FadeIn
              delay={0.1}
              className="bg-[#08276B] text-white p-8 sm:p-10 rounded-[2px] border border-[#08276B] space-y-4"
            >
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[#FDDA32]">
                Our Horizon
              </span>
              <h2 className="font-heading text-2xl sm:text-3xl font-black text-white">
                {visionTitle}
              </h2>
              <p className="text-base sm:text-lg text-[#D9DEEC] leading-relaxed font-sans">
                {visionDesc}
              </p>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* Meet the Founder Section */}
      <MeetTheFounder
        data={
          sections.founder as
            | React.ComponentProps<typeof MeetTheFounder>["data"]
            | undefined
        }
      />

      {/* One Platform • Three Audiences (Who We Serve) */}
      <WhoWeServe
        cmsData={sections.whoWeServe as WhoWeServeCmsData | undefined}
      />

      {/* Strategic Framework (What We Do - Three Pillars) */}
      <WhatWeDoPillars
        cmsData={sections.whatWeDo as WhatWeDoCmsData | undefined}
      />

      {/* Methodology: Inform, Equip, Celebrate, Connect */}
      <section className="relative py-16 sm:py-24 bg-[#EFECE6] border-b border-[#E4E0D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-2xl pb-4 border-b border-[#D9DEEC] mb-10">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              {sections.methodology?.badge || "Implementation Methodology"}
            </span>
            <h2 className="h2_subheader mt-1">
              {sections.methodology?.title || "How We Execute"}
            </h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {whatWeDoActions.map((item) => {
              const Icon = item.icon;
              return (
                <StaggerItem key={item.action}>
                  <div className="h-full flex flex-col justify-between bg-white rounded-[2px] p-7 border border-[#D9DEEC] hover:border-[#184098] transition-all shadow-xs group">
                    <div className="space-y-3">
                      <div className="flex size-10 items-center justify-center rounded-[2px] bg-[#EEF2FA] text-[#184098] group-hover:bg-[#184098] group-hover:text-white transition-colors">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-[#151B2E]">
                        {item.action}
                      </h3>
                      <p className="text-xs sm:text-sm text-[#55627D] leading-relaxed font-sans">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>
        </div>
      </section>

      {/* Our Story */}
      <section className="relative py-16 sm:py-24 bg-[#F5F4F0] border-b border-[#E4E0D5]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <FadeIn>
            <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              {sections.ourStory?.badge || "From Content to Institution"}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#151B2E] uppercase tracking-tight mt-1">
              {sections.ourStory?.title || "Our Story"}
            </h2>
          </FadeIn>

          <FadeIn delay={0.1}>
            <p className="text-base sm:text-lg text-[#35362B] leading-relaxed font-sans whitespace-pre-line">
              {sections.ourStory?.story ||
                "PortHarcourtSchools grew out of years of hands-on work with schools across Rivers State, training teachers, advising school leaders, and watching firsthand how much good work goes unseen. What began as a media page became a platform built to change that, starting with the people already doing the work: teachers, school leaders and the parents trusting them with their children."}
            </p>
          </FadeIn>

          <FadeIn delay={0.18}>
            <div className="pt-4 flex flex-wrap items-center gap-4">
              <Link
                href={sections.ourStory?.primaryCtaLink || "/events#programmes"}
                className="cta-button group"
              >
                <span>
                  {sections.ourStory?.primaryCtaLabel || "Explore Programmes"}
                </span>
                <ArrowDiagonal className="text-[#FDDA32]" />
              </Link>
              <a
                href={
                  sections.ourStory?.secondaryCtaLink ||
                  "https://instagram.com/portharcourtschools"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="cta-button outline group"
              >
                <span>
                  {sections.ourStory?.secondaryCtaLabel || "Join the Community"}
                </span>
                <ArrowDiagonal />
              </a>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
