import { asc, desc, eq } from "drizzle-orm";
import {
  Award,
  Building2,
  CheckCircle2,
  ExternalLink,
  GraduationCap,
  Handshake,
  Megaphone,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion-wrapper";
import { getOrSetCache } from "@/lib/cache";
import { db, partners } from "@/lib/db";

export const metadata: Metadata = {
  title: "Partners — PortHarcourtSchools | EdFocus Africa",
  description:
    "Education grows faster when the right people invest in it. Partner with PortHarcourtSchools across events, content, accredited programmes, and CSR initiatives.",
  alternates: {
    canonical: "/partners",
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

const DEFAULT_PARTNERS = [
  {
    id: "default-1",
    name: "GeePhill Education Consulting",
    logo: "/images/brand-logo.jpg",
    website: "https://geeffill.com",
    tier: "strategic",
    description:
      "Accredited professional training, educator development masterclasses, and curriculum modernization across Rivers State.",
  },
  {
    id: "default-2",
    name: "EdFocus Africa",
    logo: "/images/brand-logo.jpg",
    website: "https://edfocus.africa",
    tier: "headline",
    description:
      "Continental media and policy network driving systemic investment into primary, secondary, and tertiary African education.",
  },
  {
    id: "default-3",
    name: "Rivers State Teachers Forum",
    logo: "/images/brand-logo.jpg",
    website: null,
    tier: "education",
    description:
      "State-wide community of passionate frontline educators collaborating on classroom best practices and pupil outcomes.",
  },
  {
    id: "default-4",
    name: "Classroom Champions Initiative",
    logo: "/images/classroom_champions_emblem.jpg",
    website: "https://portharcourtschools.com/events",
    tier: "strategic",
    description:
      "Honoring, mentoring, and publishing outstanding educators nominated directly by the school communities they serve.",
  },
];

export default async function PartnersPage() {
  let livePartners: Array<{
    id: string;
    name: string;
    logo: string;
    website: string | null;
    tier: string;
    description: string | null;
  }> = [];
  try {
    livePartners = await getOrSetCache(
      "partners:all",
      ["partners"],
      async () => {
        return db.query.partners.findMany({
          where: eq(partners.isActive, true),
          orderBy: [asc(partners.order), desc(partners.createdAt)],
        });
      },
      300,
    );
  } catch (err) {
    console.warn("Could not query partners from DB:", err);
  }

  const displayPartners =
    livePartners.length > 0 ? livePartners : DEFAULT_PARTNERS;

  const whyPartner = [
    "Direct access to an engaged community of parents, teachers and school leaders",
    "Visibility at flagship events like the Teachers Spotlight Education Summit & Awards",
    "Association with a credible, established platform working in education since 2018",
    "Opportunities to reach schools and educators through content, training and events",
  ];

  const waysToPartner = [
    {
      title: "Event Partnership",
      desc: "Sponsor or co-host the Teachers Spotlight Summit & Awards. Gain headline branding, VIP speaking slots, and direct access to over 600 school leaders.",
      icon: Award,
    },
    {
      title: "Content Partnership",
      desc: "Collaborate on editorial campaigns, parent guides, and social media breakdowns reaching our active parent and educator community.",
      icon: Megaphone,
    },
    {
      title: "Programme Partnership",
      desc: "Support or co-deliver accredited training initiatives, STEM laboratories, and teacher capacity workshops via GeePhill Education Consulting.",
      icon: GraduationCap,
    },
    {
      title: "Corporate & CSR Partnership",
      desc: "Align your corporate brand with genuine educational development, teacher welfare, and school resourcing in Rivers State.",
      icon: Building2,
    },
  ];

  return (
    <div className="w-full bg-[#F5F4F0] text-[#151B2E]">
      {/* Header */}
      <section className="relative overflow-hidden bg-[#F5F4F0] border-b border-[#E4E0D5] pt-16 pb-20 sm:pt-24 sm:pb-28">
        <span className="offset_subheader" aria-hidden="true">
          Partners
        </span>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <FadeIn>
            <div className="inline-flex items-center rounded-[2px] border border-[#2E8B57]/40 bg-white/80 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-[#2E8B57]">
              Strategic Collaboration
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="font-heading text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight text-[#151B2E] uppercase leading-tight">
              Education Grows Faster When the Right People Invest in It.
            </h1>
          </FadeIn>

          <FadeIn delay={0.16}>
            <p className="text-base sm:text-xl text-[#35362B] leading-relaxed max-w-3xl font-sans">
              We partner with schools, businesses, government bodies and
              organisations who want to be part of building a stronger education
              ecosystem in Port Harcourt and beyond.
            </p>
          </FadeIn>
        </div>
      </section>

      {/* Our Valued Partners Section */}
      <section className="relative py-16 sm:py-24 bg-white border-b border-[#E4E0D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4 border-b border-[#D9DEEC] pb-6">
            <div className="space-y-1.5">
              <FadeIn>
                <div className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
                  <Handshake className="size-3.5" />
                  <span>Our Trusted Ecosystem</span>
                </div>
              </FadeIn>
              <FadeIn delay={0.06}>
                <h2 className="font-heading text-2xl sm:text-4xl font-black uppercase tracking-tight text-[#151B2E]">
                  Our Valued Partners
                </h2>
              </FadeIn>
              <FadeIn delay={0.12}>
                <p className="text-sm text-muted-foreground max-w-2xl font-sans leading-relaxed">
                  Meet the visionary institutions, corporate brands, and
                  education consultancies driving real progress in Rivers State.
                </p>
              </FadeIn>
            </div>

            <FadeIn delay={0.16}>
              <Link
                href="/contact?type=partner"
                className="bg-[#184098] hover:bg-[#08276B] text-white font-display font-bold text-xs uppercase tracking-wider px-5 h-11 rounded-xs inline-flex items-center gap-2 transition-colors shadow-xs shrink-0"
              >
                <span>Become a Partner</span>
                <ArrowDiagonal className="text-white" />
              </Link>
            </FadeIn>
          </div>

          {/* Partners Logo & Profile Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {displayPartners.map((partner) => (
              <div
                key={partner.id}
                className="group flex flex-col justify-between bg-[#F8FAFC] border border-[#E4E0D5] hover:border-[#184098]/40 hover:bg-white rounded-lg p-6 transition-all shadow-xs hover:shadow-md space-y-4"
              >
                <div className="space-y-4">
                  {/* Logo Container */}
                  <div className="h-16 w-full rounded-md border border-[#D9DEEC] bg-white flex items-center justify-center p-2.5 overflow-hidden">
                    {/* biome-ignore lint/performance/noImgElement: Dynamic CMS partner logo */}
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain"
                    />
                  </div>

                  <div>
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <span className="inline-block text-[9px] font-display font-bold uppercase tracking-wider text-[#8F6B1E] bg-[#C49A45]/15 border border-[#C49A45]/30 px-2 py-0.5 rounded">
                        {partner.tier.replace("_", " ")}
                      </span>
                    </div>
                    <h3 className="font-heading text-base font-bold text-[#151B2E] group-hover:text-[#184098] transition-colors leading-snug">
                      {partner.name}
                    </h3>
                  </div>

                  {partner.description && (
                    <p className="text-xs text-[#55627D] leading-relaxed font-sans line-clamp-3">
                      {partner.description}
                    </p>
                  )}
                </div>

                {partner.website && (
                  <div className="pt-4 border-t border-[#D9DEEC]/60">
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#184098] hover:text-[#08276B] hover:underline"
                    >
                      <span>Visit Website</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Why Partner With Us */}
      <section className="relative py-16 sm:py-24 bg-[#F5F4F0] border-b border-[#E4E0D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
            <div className="lg:col-span-5 space-y-4">
              <FadeIn>
                <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
                  Value Proposition
                </span>
                <h2 className="font-heading text-3xl font-black text-[#151B2E] mt-1">
                  Why Partner With Us
                </h2>
                <p className="text-sm sm:text-base text-[#55627D] font-sans leading-relaxed pt-1">
                  Since 2018, our network has connected grassroot classroom
                  educators, institutional leadership, and parents seeking
                  uncompromising clarity.
                </p>
              </FadeIn>
            </div>

            <div className="lg:col-span-7 space-y-4">
              <StaggerContainer className="space-y-3">
                {whyPartner.map((point) => (
                  <StaggerItem key={point}>
                    <div className="flex items-start gap-3.5 p-4 rounded-[2px] border border-[#D9DEEC] bg-white">
                      <CheckCircle2 className="size-5 text-[#184098] shrink-0 mt-0.5" />
                      <p className="text-sm font-sans font-medium text-[#151B2E]">
                        {point}
                      </p>
                    </div>
                  </StaggerItem>
                ))}
              </StaggerContainer>
            </div>
          </div>
        </div>
      </section>

      {/* Ways to Partner */}
      <section className="relative py-16 sm:py-24 bg-[#EFECE6] border-b border-[#E4E0D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <FadeIn className="max-w-2xl pb-4 border-b border-[#D9DEEC] mb-10">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              Engagement Models
            </span>
            <h2 className="h2_subheader mt-1">Ways to Partner</h2>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {waysToPartner.map((way) => {
              const Icon = way.icon;
              return (
                <StaggerItem key={way.title}>
                  <div className="h-full flex flex-col justify-between bg-white rounded-[2px] p-8 border border-[#D9DEEC] hover:border-[#184098] transition-all shadow-xs group">
                    <div className="space-y-3">
                      <div className="flex size-10 items-center justify-center rounded-[2px] bg-[#EEF2FA] text-[#184098] group-hover:bg-[#184098] group-hover:text-white transition-colors">
                        <Icon className="size-5" />
                      </div>
                      <h3 className="font-heading text-xl font-bold text-[#151B2E]">
                        {way.title}
                      </h3>
                      <p className="text-sm text-[#55627D] leading-relaxed font-sans">
                        {way.desc}
                      </p>
                    </div>

                    <div className="pt-6 mt-6 border-t border-[#D9DEEC]/70">
                      <Link
                        href="/contact?type=partner"
                        className="inline-flex items-center text-xs font-display font-bold uppercase tracking-wider text-[#184098] group-hover:text-[#08276B] transition-colors"
                      >
                        <span>Inquire About {way.title}</span>
                        <ArrowDiagonal />
                      </Link>
                    </div>
                  </div>
                </StaggerItem>
              );
            })}
          </StaggerContainer>

          <FadeIn delay={0.2} className="mt-12 text-center">
            <Link href="/contact" className="cta-button cta-primary group">
              <span>Partner With Us</span>
              <ArrowDiagonal className="text-[#151B2E]" />
            </Link>
          </FadeIn>
        </div>
      </section>
    </div>
  );
}
