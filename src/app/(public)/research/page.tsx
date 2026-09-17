import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPageContent } from "@/app/(admin)/admin/pages/actions";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion-wrapper";

export const revalidate = 900;

export const metadata: Metadata = {
  title: "Research & Focus Areas — PortHarcourtSchools | EdFocus Africa",
  description:
    "Explore our 6 core strategic focus areas shaping foundational literacy, early childhood, secondary STEM pathways, and educator leadership across Port Harcourt.",
  alternates: {
    canonical: "/research",
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

const DEFAULT_TRACKS = [
  {
    number: "01",
    title: "Nursery & Early Years",
    subtitle: "Montessori, phonics foundations, and developmental diagnostics",
    href: "/schools?level=nursery",
    tag: "Ages 1–5",
    color: "#184098",
    bgImage: "/images/ph_schools_map_banner.jpg",
  },
  {
    number: "02",
    title: "Primary Education Foundations",
    subtitle: "Literacy benchmarks, numeracy standards, and WAEC entry prep",
    href: "/schools?level=primary",
    tag: "Grades 1–6",
    color: "#08276B",
    bgImage: "/images/ph_hero_classroom.jpg",
  },
  {
    number: "03",
    title: "Secondary & College Prep",
    subtitle: "WAEC, IGCSE, Cambridge, and international STEM pathways",
    href: "/schools?level=secondary",
    tag: "JSS1–SSS3",
    color: "#151B2E",
    bgImage: "/images/ph_schools_map_banner.jpg",
  },
  {
    number: "04",
    title: "STEM, Robotics & Digital Literacy",
    subtitle: "Coding curriculum, science laboratories, and innovation clubs",
    href: "/blog?category=stem",
    tag: "Innovation",
    color: "#184098",
    bgImage: "/images/ph_hero_classroom.jpg",
  },
  {
    number: "05",
    title: "Teachers Spotlight Awards & Summit",
    subtitle:
      "Accredited recognition, public honour, and annual state-wide forum",
    href: "/events",
    tag: "Flagship",
    color: "#9A7B0C",
    bgImage: "/images/classroom_champions_emblem.jpg",
  },
  {
    number: "06",
    title: "School Leadership & Institutional Governance",
    subtitle:
      "Proprietor advisory, teacher retention, and financial resilience",
    href: "/blog?category=leadership",
    tag: "Leadership",
    color: "#08276B",
    bgImage: "/images/ph_schools_map_banner.jpg",
  },
];

export default async function ResearchAndFocusAreasPage() {
  const pageData = await getPageContent("research");
  const sections =
    (pageData.sections as Record<string, Record<string, string | undefined>>) ||
    {};

  const heroBadge = sections.hero?.badge || "Strategic Themes & Research";
  const heroTitle = sections.hero?.title || "Research & Focus Areas";
  const heroSubtitle =
    sections.hero?.subtitle ||
    "Targeted developmental tracks guiding foundational literacy, secondary STEM pathways, and teacher leadership across Port Harcourt.";

  // Extract the 6 tracks with default fallbacks
  const tracks = [1, 2, 3, 4, 5, 6].map((num) => {
    const key = `track${num}`;
    const item = sections[key] || {};
    const fallback = DEFAULT_TRACKS[num - 1];
    return {
      number: item.number || fallback.number,
      title: item.title || fallback.title,
      subtitle: item.subtitle || fallback.subtitle,
      href: item.href || fallback.href,
      tag: item.tag || fallback.tag,
      color: item.color || fallback.color,
      bgImage: item.bgImage || fallback.bgImage,
    };
  });

  const ctaBadge = sections.closingCta?.badge || "Collaborate With Us";
  const ctaTitle =
    sections.closingCta?.title ||
    "Have research, curriculum data or insights to share?";
  const ctaSubtitle =
    sections.closingCta?.subtitle ||
    "We partner with researchers, education non-profits, and policy advocates to build an open, verifiable repository of school performance benchmarks.";
  const ctaLabel =
    sections.closingCta?.primaryCtaLabel || "Partner On Research";
  const ctaLink =
    sections.closingCta?.primaryCtaLink || "/contact?type=partner";

  return (
    <div className="w-full bg-[#F5F4F0] text-[#151B2E]">
      {/* 1. Header Section */}
      <section className="relative overflow-hidden bg-[#F5F4F0] border-b border-[#E4E0D5] pt-16 pb-20 sm:pt-24 sm:pb-28">
        <span className="offset_subheader" aria-hidden="true">
          Focus Areas
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
        </div>
      </section>

      {/* 2. Tracks Grid */}
      <section className="relative py-16 sm:py-24 bg-white border-b border-[#E4E0D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-12">
          <FadeIn className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#D9DEEC] pb-6">
            <div className="space-y-1.5">
              <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
                Framework Pillars
              </span>
              <h2 className="font-heading text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#151B2E]">
                6 Strategic Development Tracks
              </h2>
            </div>
            <p className="text-sm text-muted-foreground max-w-md font-sans">
              Click any focus track to explore verified institutions, published
              editorial investigations, or upcoming masterclasses.
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {tracks.map((track) => (
              <StaggerItem key={track.number}>
                <Link
                  href={track.href}
                  className="group relative flex flex-col justify-between overflow-hidden rounded-[2px] border border-[#D9DEEC] bg-white transition-all duration-300 hover:-translate-y-1.5 hover:border-[#184098] hover:shadow-xl h-full"
                >
                  {/* Top Image Preview Banner */}
                  <div className="relative h-48 w-full overflow-hidden bg-[#EEF2FA]">
                    <Image
                      src={track.bgImage}
                      alt={track.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#08276B]/90 via-[#08276B]/40 to-transparent" />

                    <div className="absolute top-4 left-4">
                      <span className="inline-block px-2.5 py-1 text-[10px] font-display font-bold uppercase tracking-wider bg-white/95 text-[#08276B] rounded-[2px] shadow-xs">
                        {track.tag}
                      </span>
                    </div>

                    <div className="absolute bottom-3 left-4">
                      <span className="font-display text-3xl font-black text-[#FDDA32]">
                        {track.number}
                      </span>
                    </div>
                  </div>

                  {/* Card Content */}
                  <div className="flex flex-1 flex-col justify-between p-6 space-y-4">
                    <div>
                      <h3 className="font-heading text-xl font-bold text-[#151B2E] group-hover:text-[#184098] transition-colors leading-snug">
                        {track.title}
                      </h3>
                      <p className="mt-2 text-sm text-[#55627D] font-sans leading-relaxed">
                        {track.subtitle}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-[#D9DEEC]/70 flex items-center justify-between text-xs font-display font-bold uppercase tracking-wider text-[#184098]">
                      <span>Explore Pathway</span>
                      <ArrowDiagonal />
                    </div>
                  </div>
                </Link>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </div>
      </section>

      {/* 3. Methodology & Strategic Intent */}
      <section className="relative py-16 sm:py-24 bg-[#EFECE6] border-b border-[#E4E0D5]">
        <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-8">
          <FadeIn className="space-y-3">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              Methodology &amp; Standards
            </span>
            <h2 className="font-heading text-2xl sm:text-4xl font-black text-[#151B2E] uppercase">
              Why We Segment Educational Focus
            </h2>
            <p className="text-base text-[#35362B] font-sans leading-relaxed">
              Every stage of a child’s education in Port Harcourt presents
              unique challenges. Nursery foundations require sensory and phonics
              rigor; secondary transitions demand international exam readiness;
              and schools require financial resilience and teacher retention
              systems.
            </p>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-4">
            <div className="p-6 bg-white rounded-[2px] border border-[#D9DEEC] space-y-2">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-[#184098]">
                Diagnostic Clarity
              </span>
              <p className="text-xs text-[#55627D] leading-relaxed">
                Parents get transparent data regarding school fees, curriculum
                type, and pupil-teacher ratios across all 6 tracks.
              </p>
            </div>
            <div className="p-6 bg-white rounded-[2px] border border-[#D9DEEC] space-y-2">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-[#184098]">
                Teacher Elevation
              </span>
              <p className="text-xs text-[#55627D] leading-relaxed">
                Frontline educators receive TRCN-accredited training
                masterclasses and public honour through the Spotlight Awards.
              </p>
            </div>
            <div className="p-6 bg-white rounded-[2px] border border-[#D9DEEC] space-y-2">
              <span className="font-display text-xs font-bold uppercase tracking-wider text-[#184098]">
                Systemic Growth
              </span>
              <p className="text-xs text-[#55627D] leading-relaxed">
                Connecting schools with accredited consultancies, corporate CSR,
                and developmental capital across Rivers State.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* 4. Closing CTA */}
      <section className="relative py-16 sm:py-24 bg-[#F5F4F0] border-b border-[#E4E0D5]">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 text-center space-y-5">
          <FadeIn>
            <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              {ctaBadge}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#151B2E] uppercase mt-2">
              {ctaTitle}
            </h2>
            <p className="text-sm sm:text-base text-[#55627D] font-sans max-w-2xl mx-auto mt-3 leading-relaxed">
              {ctaSubtitle}
            </p>
            <div className="pt-6">
              <Link href={ctaLink} className="cta-button cta-primary group">
                <span>{ctaLabel}</span>
                <ArrowDiagonal className="text-[#151B2E]" />
              </Link>
            </div>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
