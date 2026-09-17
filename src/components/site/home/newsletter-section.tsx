"use client";

import { CheckCircle2, Mail, Send, ShieldCheck } from "lucide-react";
import { type FormEvent, useState } from "react";
import { toast } from "sonner";
import { FadeIn } from "@/components/site/motion-wrapper";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface NewsletterCmsData {
  badge?: string;
  title?: string;
  subtitle?: string;
}

export function NewsletterSection({
  cmsData,
}: {
  cmsData?: NewsletterCmsData;
}) {
  const badge = cmsData?.badge || "Weekly Digest";
  const title =
    cmsData?.title || "Stay Informed with Weekly Education Intelligence";
  const subtitle =
    cmsData?.subtitle ||
    "Join over 4,500 parents, school proprietors, and teachers receiving our curated briefing on school admission deadlines, curriculum trends, teacher development opportunities, and community spotlights.";

  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [subscribed, setSubscribed] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("Please provide a valid email address.");
      return;
    }

    setIsSubmitting(true);
    // Simulate immediate smooth subscription
    await new Promise((resolve) => setTimeout(resolve, 600));

    try {
      localStorage.setItem("ph_schools_newsletter_subscribed", "true");
      localStorage.setItem("ph_schools_newsletter_email", email.trim());
    } catch {
      // Ignore local storage error
    }

    setIsSubmitting(false);
    setSubscribed(true);
    toast.success("Welcome to PortHarcourtSchools community updates!");
  }

  return (
    <section className="relative py-16 sm:py-24 bg-[#08276B] text-white border-b border-[#061e52] overflow-hidden">
      {/* Decorative Blueprint Grid Overlay */}
      <div
        className="absolute inset-0 pointer-events-none opacity-10 select-none"
        style={{
          backgroundImage:
            "radial-gradient(circle at 2px 2px, white 1px, transparent 0)",
          backgroundSize: "28px 28px",
        }}
        aria-hidden="true"
      />

      <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Column: Heading & Value Propositions */}
          <div className="lg:col-span-6 space-y-5">
            <FadeIn>
              <div className="inline-flex items-center gap-2 rounded-[2px] border border-white/20 bg-white/10 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-[#FDDA32]">
                <span>{badge}</span>
              </div>
            </FadeIn>

            <FadeIn delay={0.06}>
              <h2 className="font-heading text-2xl sm:text-4xl font-black tracking-tight text-white uppercase leading-tight">
                {title}
              </h2>
            </FadeIn>

            <FadeIn delay={0.12}>
              <p className="text-sm sm:text-base text-[#D9DEEC] leading-relaxed font-sans">
                {subtitle}
              </p>
            </FadeIn>

            <FadeIn delay={0.18}>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2 text-xs font-sans text-[#D9DEEC]">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#FDDA32] shrink-0" />
                  <span>Verified school admission alerts</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#FDDA32] shrink-0" />
                  <span>Teacher CPD &amp; training invites</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#FDDA32] shrink-0" />
                  <span>Curriculum &amp; WAEC benchmarks</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="size-4 text-[#FDDA32] shrink-0" />
                  <span>Early access to summit tickets</span>
                </div>
              </div>
            </FadeIn>
          </div>

          {/* Right Column: Interactive Subscription Card */}
          <div className="lg:col-span-6">
            <FadeIn delay={0.15}>
              <div className="bg-white text-[#151B2E] rounded-xl p-6 sm:p-8 shadow-2xl border border-[#D9DEEC] space-y-5">
                <div className="flex items-center gap-3 border-b border-[#D9DEEC] pb-4">
                  <div className="size-10 rounded-lg bg-[#EEF2FA] text-[#184098] flex items-center justify-center shrink-0">
                    <Mail className="size-5" />
                  </div>
                  <div>
                    <h3 className="font-heading text-base font-bold text-[#151B2E]">
                      Subscribe to the Briefing
                    </h3>
                    <p className="text-xs text-[#55627D]">
                      Delivered directly to your inbox every Thursday morning.
                    </p>
                  </div>
                </div>

                {subscribed ? (
                  <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-5 text-center space-y-2">
                    <div className="size-10 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
                      <CheckCircle2 className="size-5" />
                    </div>
                    <h4 className="font-heading text-base font-bold text-emerald-900">
                      You are subscribed!
                    </h4>
                    <p className="text-xs text-emerald-700">
                      Check your inbox for our welcome dispatch and upcoming
                      parent guide.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        htmlFor="homepage-newsletter-email"
                        className="block text-xs font-bold text-[#151B2E]"
                      >
                        Email Address <span className="text-red-500">*</span>
                      </label>
                      <Input
                        id="homepage-newsletter-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="parent@example.com or educator@school.edu.ng"
                        className="h-11 text-xs border-[#D9DEEC] bg-[#FAFBFF] focus:bg-white text-[#151B2E]"
                      />
                    </div>

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full h-11 bg-[#184098] hover:bg-[#08276B] text-white font-display font-bold text-xs uppercase tracking-wider rounded-[2px] transition-colors shadow-xs"
                    >
                      {isSubmitting ? (
                        <span>Subscribing...</span>
                      ) : (
                        <span className="inline-flex items-center gap-2">
                          <span>Join Free Briefing</span>
                          <Send className="size-3.5" />
                        </span>
                      )}
                    </Button>

                    <div className="flex items-center justify-center gap-2 text-[11px] text-[#55627D] pt-1">
                      <ShieldCheck className="size-3.5 text-emerald-600" />
                      <span>
                        Zero spam. Unsubscribe with 1 click at any time.
                      </span>
                    </div>
                  </form>
                )}
              </div>
            </FadeIn>
          </div>
        </div>
      </div>
    </section>
  );
}
