import {
  Award,
  Building2,
  CheckCircle2,
  GraduationCap,
  Megaphone,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion-wrapper";

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

export default function PartnersPage() {
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

      {/* Why Partner With Us */}
      <section className="relative py-16 sm:py-24 bg-white border-b border-[#E4E0D5]">
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
                    <div className="flex items-start gap-3.5 p-4 rounded-[2px] border border-[#D9DEEC] bg-[#F5F4F0]">
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
