"use client";

import { ArrowRight, Building2, GraduationCap, Users } from "lucide-react";
import Link from "next/link";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion-wrapper";

export function WhoWeServe() {
  const audiences = [
    {
      title: "For Parents",
      tag: "School Choice & Clarity",
      desc: "Clear, honest information and verified benchmarks to choose and support the right nursery, primary, or secondary school for your child.",
      icon: Users,
      cta: "Explore Directory",
      href: "/schools",
      color: "#184098",
    },
    {
      title: "For Teachers & Schools",
      tag: "Training & Recognition",
      desc: "Practical professional training, curriculum leadership, media visibility, and prestigious recognition through the Teachers Spotlight Awards.",
      icon: GraduationCap,
      cta: "View Programmes",
      href: "/events#programmes",
      color: "#08276B",
    },
    {
      title: "For Partners & Organisations",
      tag: "Ecosystem Channel",
      desc: "A credible, established channel into the Port Harcourt and Rivers State education space to invest, sponsor, and scale impact.",
      icon: Building2,
      cta: "Partner With Us",
      href: "/partners",
      color: "#2E8B57",
    },
  ];

  return (
    <section
      id="who-we-serve"
      className="relative py-16 sm:py-24 bg-[#F5F4F0] border-b border-[#E4E0D5] overflow-hidden"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <FadeIn className="max-w-2xl pb-4 border-b border-[#D9DEEC] mb-10">
          <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
            One Platform • Three Audiences
          </span>
          <h2 className="h2_subheader mt-2">Who We Serve</h2>
          <p className="text-sm sm:text-base text-[#55627D] font-sans mt-2">
            Building a stronger education ecosystem across Port Harcourt and
            beyond, one school, one teacher, one parent at a time.
          </p>
        </FadeIn>

        <StaggerContainer className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {audiences.map((aud) => {
            const Icon = aud.icon;
            return (
              <StaggerItem key={aud.title}>
                <div className="h-full flex flex-col justify-between bg-white rounded-[2px] p-7 border border-[#D9DEEC] hover:border-[#184098] transition-all shadow-xs hover:shadow-md relative overflow-hidden group">
                  {/* 4px Top Accent Bar */}
                  <div
                    className="absolute top-0 inset-x-0 h-1"
                    style={{ backgroundColor: aud.color }}
                  />

                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex size-10 items-center justify-center rounded-[2px] bg-[#EEF2FA] text-[#184098] group-hover:bg-[#184098] group-hover:text-white transition-colors">
                        <Icon className="size-5" />
                      </div>
                      <span className="font-display text-[10px] font-bold uppercase tracking-widest text-muted-foreground">
                        {aud.tag}
                      </span>
                    </div>

                    <div>
                      <h3 className="font-heading text-xl font-bold text-[#151B2E] group-hover:text-[#184098] transition-colors">
                        {aud.title}
                      </h3>
                      <p className="text-sm text-[#55627D] mt-2 leading-relaxed font-sans">
                        {aud.desc}
                      </p>
                    </div>
                  </div>

                  <div className="pt-6 mt-6 border-t border-[#D9DEEC]/70">
                    <Link
                      href={aud.href}
                      className="inline-flex items-center gap-1.5 text-xs font-display font-bold uppercase tracking-wider text-[#184098] group-hover:text-[#08276B] transition-colors"
                    >
                      <span>{aud.cta}</span>
                      <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-1" />
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
