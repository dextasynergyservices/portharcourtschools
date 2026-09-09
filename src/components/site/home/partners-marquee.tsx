"use client";

import { ArrowRight, ExternalLink, Handshake } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/site/motion-wrapper";

export interface MarqueePartnerItem {
  id: string;
  name: string;
  logo: string;
  website?: string | null;
  tier: string;
  description?: string | null;
}

interface PartnersMarqueeProps {
  partners?: MarqueePartnerItem[];
}

const DEFAULT_PARTNERS: MarqueePartnerItem[] = [
  {
    id: "seed-1",
    name: "GeePhill Education Consulting",
    logo: "/images/brand-logo.jpg",
    website: "https://geeffill.com",
    tier: "strategic",
  },
  {
    id: "seed-2",
    name: "EdFocus Africa",
    logo: "/images/brand-logo.jpg",
    website: "https://edfocus.africa",
    tier: "headline",
  },
  {
    id: "seed-3",
    name: "Rivers State Teachers Forum",
    logo: "/images/brand-logo.jpg",
    website: "https://portharcourtschools.com/about",
    tier: "education",
  },
  {
    id: "seed-4",
    name: "Classroom Champions Initiative",
    logo: "/images/classroom_champions_emblem.jpg",
    website: "https://portharcourtschools.com/events",
    tier: "strategic",
  },
  {
    id: "seed-5",
    name: "Rivers Schools Proprietors Forum",
    logo: "/images/brand-logo.jpg",
    website: "https://portharcourtschools.com/schools",
    tier: "corporate",
  },
];

export function PartnersMarquee({ partners = [] }: PartnersMarqueeProps) {
  const displayList = partners.length > 0 ? partners : DEFAULT_PARTNERS;
  // Duplicate for seamless infinite loop
  const marqueeItems = [...displayList, ...displayList, ...displayList];

  return (
    <section className="relative py-14 sm:py-20 bg-[#F5F4F0] border-b border-[#E4E0D5] overflow-hidden">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mb-8 sm:mb-12">
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div className="space-y-2">
            <FadeIn>
              <div className="inline-flex items-center gap-1.5 font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
                <Handshake className="size-3.5" />
                <span>Our Strategic Collaborators</span>
              </div>
            </FadeIn>
            <FadeIn delay={0.06}>
              <h2 className="font-heading text-2xl sm:text-3xl lg:text-4xl font-black uppercase tracking-tight text-[#151B2E]">
                Partnering to Advance Rivers State Education
              </h2>
            </FadeIn>
          </div>

          <FadeIn delay={0.12}>
            <Link
              href="/partners"
              className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-[#184098] hover:text-[#08276B] hover:underline"
            >
              <span>Explore Partnership Opportunities</span>
              <ArrowRight className="size-3.5" />
            </Link>
          </FadeIn>
        </div>
      </div>

      {/* Marquee Track Container with Smooth Masking on Edges */}
      <div className="relative w-full overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_10%,black_90%,transparent)]">
        <div className="animate-marquee flex items-center gap-6 py-2">
          {marqueeItems.map((partner, index) => {
            const itemKey = `${partner.id}-${index}`;
            if (partner.website) {
              return (
                <a
                  key={itemKey}
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={`Visit ${partner.name}`}
                  className="group relative flex items-center gap-3 bg-white border border-[#E4E0D5] hover:border-[#184098]/40 hover:shadow-md transition-all rounded-lg px-5 py-3.5 min-w-[220px] sm:min-w-[260px] h-20 shrink-0 outline-none focus:ring-2 focus:ring-[#184098]/30"
                >
                  <div className="size-12 rounded border border-[#D9DEEC] bg-[#F8FAFC] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                    {/* biome-ignore lint/performance/noImgElement: Dynamic CMS partner logos */}
                    <img
                      src={partner.logo}
                      alt={partner.name}
                      className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                      onError={(e) => {
                        (e.target as HTMLElement).style.display = "none";
                      }}
                    />
                  </div>
                  <div className="truncate">
                    <span className="block font-heading text-xs sm:text-sm font-bold text-[#151B2E] group-hover:text-[#184098] transition-colors truncate">
                      {partner.name}
                    </span>
                    <span className="inline-block text-[10px] font-display font-bold uppercase tracking-wider text-[#8F6B1E] bg-[#C49A45]/15 px-1.5 py-0.5 rounded mt-0.5">
                      {partner.tier.replace("_", " ")}
                    </span>
                  </div>
                  <ExternalLink className="size-3 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity shrink-0 ml-auto" />
                </a>
              );
            }

            return (
              <div
                key={itemKey}
                className="group relative flex items-center gap-3 bg-white border border-[#E4E0D5] hover:border-[#184098]/40 hover:shadow-md transition-all rounded-lg px-5 py-3.5 min-w-[220px] sm:min-w-[260px] h-20 shrink-0"
              >
                <div className="size-12 rounded border border-[#D9DEEC] bg-[#F8FAFC] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                  {/* biome-ignore lint/performance/noImgElement: Dynamic CMS partner logos */}
                  <img
                    src={partner.logo}
                    alt={partner.name}
                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all duration-300"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = "none";
                    }}
                  />
                </div>
                <div className="truncate">
                  <span className="block font-heading text-xs sm:text-sm font-bold text-[#151B2E] group-hover:text-[#184098] transition-colors truncate">
                    {partner.name}
                  </span>
                  <span className="inline-block text-[10px] font-display font-bold uppercase tracking-wider text-[#8F6B1E] bg-[#C49A45]/15 px-1.5 py-0.5 rounded mt-0.5">
                    {partner.tier.replace("_", " ")}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
