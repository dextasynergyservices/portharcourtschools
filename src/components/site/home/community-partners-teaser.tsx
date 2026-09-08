"use client";

import { Building2 } from "lucide-react";
import Link from "next/link";
import { FadeIn } from "@/components/site/motion-wrapper";

function InstagramIcon({ className = "size-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      width="24"
      height="24"
      stroke="currentColor"
      strokeWidth="2"
      fill="none"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      aria-hidden="true"
    >
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  );
}

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

export function CommunityPartnersTeaser() {
  return (
    <section
      id="community"
      className="relative py-16 sm:py-24 bg-[#F5F4F0] border-b border-[#E4E0D5] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Community Teaser Card */}
          <FadeIn>
            <div className="h-full flex flex-col justify-between bg-white rounded-[2px] p-8 border border-[#D9DEEC] hover:border-[#184098] transition-all shadow-xs hover:shadow-md relative overflow-hidden group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[11px] font-bold uppercase tracking-widest text-[#184098] bg-[#EEF2FA] px-2.5 py-1 rounded-[2px]">
                    Social &amp; Parent Network
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-[2px] bg-[#EEF2FA] text-[#184098] group-hover:bg-[#184098] group-hover:text-white transition-colors">
                    <InstagramIcon className="size-5" />
                  </div>
                </div>

                <h3 className="font-heading text-2xl font-black text-[#151B2E] group-hover:text-[#184098] transition-colors">
                  Join the Community
                </h3>

                <p className="text-sm sm:text-base text-[#55627D] leading-relaxed font-sans">
                  Join thousands of parents and educators already following the
                  conversation on Instagram (@portharcourtschools), where we
                  break down what’s really happening in Port Harcourt schools,
                  from curriculum shifts to safeguarding to what to look for on
                  a school tour.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#D9DEEC]/70">
                <a
                  href="https://instagram.com/portharcourtschools"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="cta-button group inline-flex items-center"
                >
                  <span>Follow on Instagram</span>
                  <ArrowDiagonal className="text-[#FDDA32]" />
                </a>
              </div>
            </div>
          </FadeIn>

          {/* Partners Teaser Card */}
          <FadeIn delay={0.1}>
            <div className="h-full flex flex-col justify-between bg-white rounded-[2px] p-8 border border-[#D9DEEC] hover:border-[#184098] transition-all shadow-xs hover:shadow-md relative overflow-hidden group">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="font-display text-[11px] font-bold uppercase tracking-widest text-[#2E8B57] bg-[#2E8B57]/10 px-2.5 py-1 rounded-[2px]">
                    Institutional Alignment
                  </span>
                  <div className="flex size-10 items-center justify-center rounded-[2px] bg-[#2E8B57]/10 text-[#2E8B57] group-hover:bg-[#2E8B57] group-hover:text-white transition-colors">
                    <Building2 className="size-5" />
                  </div>
                </div>

                <h3 className="font-heading text-2xl font-black text-[#151B2E] group-hover:text-[#184098] transition-colors">
                  Partner With Us
                </h3>

                <p className="text-sm sm:text-base text-[#55627D] leading-relaxed font-sans">
                  We work with schools, brands and organisations who believe
                  education deserves better visibility and better resourcing.
                  From event sponsorships to accredited capacity programs, we
                  create credible channels for educational investment in Rivers
                  State.
                </p>
              </div>

              <div className="pt-6 mt-6 border-t border-[#D9DEEC]/70">
                <Link
                  href="/partners"
                  className="cta-button outline group inline-flex items-center"
                >
                  <span>Explore Partnership Options</span>
                  <ArrowDiagonal />
                </Link>
              </div>
            </div>
          </FadeIn>
        </div>
      </div>
    </section>
  );
}
