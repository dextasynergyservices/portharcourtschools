"use client";

import { Turnstile } from "@marsidev/react-turnstile";
import {
  Briefcase,
  CheckCircle2,
  GraduationCap,
  HelpCircle,
  Loader2,
  Send,
  User,
  Users,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { submitContactFormAction } from "./actions";

const PERSONAS = [
  {
    id: "parent",
    label: "Parent / Guardian",
    icon: Users,
    desc: "Admissions, fees, or advice for choosing a school",
  },
  {
    id: "teacher",
    label: "Educator / Teacher",
    icon: GraduationCap,
    desc: "Professional training, workshops, or career inquiries",
  },
  {
    id: "school_leader",
    label: "School Leader / Admin",
    icon: Briefcase,
    desc: "Listing updates, school verification, or accreditation",
  },
  {
    id: "partner",
    label: "Partner / Sponsor",
    icon: User,
    desc: "Events, corporate sponsorship, or brand partnership",
  },
  {
    id: "general",
    label: "General Inquiry",
    icon: HelpCircle,
    desc: "Media, feedback, or general questions",
  },
] as const;

export function ContactForm() {
  const [persona, setPersona] = useState<string>("parent");
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const siteKey = process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const form = e.currentTarget;
    const formData = new FormData(form);
    formData.set("personaType", persona);
    if (turnstileToken) {
      formData.set("turnstileToken", turnstileToken);
    }

    startTransition(async () => {
      const res = await submitContactFormAction(formData);
      if (res.error) {
        setError(res.error);
        toast.error("Failed to send message", {
          description: res.error,
        });
      } else {
        setSubmitted(true);
        toast.success("Message sent successfully!", {
          description: "We'll review your inquiry and get back to you shortly.",
        });
      }
    });
  };

  if (submitted) {
    return (
      <div className="p-8 sm:p-12 text-center space-y-5 bg-white rounded-xl border border-emerald-200 shadow-sm animate-in fade-in duration-300">
        <div className="size-14 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-xs">
          <CheckCircle2 className="size-8" />
        </div>
        <div className="space-y-2 max-w-md mx-auto">
          <h3 className="font-heading text-2xl font-bold text-[#151B2E]">
            Message Received!
          </h3>
          <p className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
            Thank you for reaching out to PortHarcourtSchools. Your message has
            been logged on our administrative desk, and a member of our team
            will respond to your email address shortly.
          </p>
        </div>
        <div className="pt-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => {
              setSubmitted(false);
              setTurnstileToken(null);
            }}
            className="h-10 text-xs font-bold border-[#D9DEEC] text-[#184098] hover:bg-[#EEF2FA]"
          >
            Send Another Message
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Persona Selector */}
      <div className="space-y-2.5">
        <span className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]">
          I Am Inquiring As A:
        </span>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
          {PERSONAS.map((p) => {
            const Icon = p.icon;
            const isSelected = persona === p.id;
            return (
              <button
                key={p.id}
                type="button"
                onClick={() => setPersona(p.id)}
                className={`p-3 rounded-lg border text-left transition-all duration-200 flex flex-col justify-between ${
                  isSelected
                    ? "border-[#184098] bg-[#EEF2FA] shadow-xs ring-1 ring-[#184098]"
                    : "border-[#D9DEEC] bg-white hover:border-[#184098]/40 hover:bg-[#FAFBFF]"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <Icon
                    className={`size-4 ${
                      isSelected ? "text-[#184098]" : "text-muted-foreground"
                    }`}
                  />
                  <span
                    className={`text-xs font-bold ${
                      isSelected ? "text-[#184098]" : "text-[#151B2E]"
                    }`}
                  >
                    {p.label}
                  </span>
                </div>
                <p className="text-[10px] text-muted-foreground line-clamp-2 leading-snug">
                  {p.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Name and Email */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="contact-name"
            className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
          >
            Full Name <span className="text-red-500">*</span>
          </label>
          <Input
            id="contact-name"
            name="name"
            required
            placeholder="e.g. Chief Emeka Briggs"
            className="h-10 text-xs border-[#D9DEEC] bg-white focus:border-[#184098]"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="contact-email"
            className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
          >
            Email Address <span className="text-red-500">*</span>
          </label>
          <Input
            id="contact-email"
            name="email"
            type="email"
            required
            placeholder="e.g. emeka.briggs@example.com"
            className="h-10 text-xs border-[#D9DEEC] bg-white focus:border-[#184098]"
          />
        </div>
      </div>

      {/* Phone and Subject */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label
            htmlFor="contact-phone"
            className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
          >
            Phone / WhatsApp (Optional)
          </label>
          <Input
            id="contact-phone"
            name="phone"
            placeholder="e.g. 0803 123 4567"
            className="h-10 text-xs border-[#D9DEEC] bg-white focus:border-[#184098]"
          />
        </div>

        <div className="space-y-1.5">
          <label
            htmlFor="contact-subject"
            className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
          >
            Subject / Topic
          </label>
          <Input
            id="contact-subject"
            name="subject"
            placeholder="e.g. School Admissions & Fee Inquiry"
            className="h-10 text-xs border-[#D9DEEC] bg-white focus:border-[#184098]"
          />
        </div>
      </div>

      {/* Message */}
      <div className="space-y-1.5">
        <label
          htmlFor="contact-message"
          className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
        >
          Your Message <span className="text-red-500">*</span>
        </label>
        <Textarea
          id="contact-message"
          name="message"
          required
          rows={5}
          placeholder="Please share details on how our team or community partners can assist you..."
          className="text-xs border-[#D9DEEC] bg-white focus:border-[#184098] leading-relaxed resize-y"
        />
      </div>

      {/* Error alert */}
      {error && (
        <div className="p-3.5 rounded-lg bg-red-50 border border-red-200 text-xs font-medium text-red-700">
          {error}
        </div>
      )}

      {/* Cloudflare Turnstile Spam Protection */}
      {siteKey && (
        <div className="pt-1 flex justify-start">
          <Turnstile
            siteKey={siteKey}
            onSuccess={(token) => setTurnstileToken(token)}
            onError={() => setTurnstileToken(null)}
            onExpire={() => setTurnstileToken(null)}
          />
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isPending}
        className="w-full h-11 bg-[#184098] hover:bg-[#08276B] text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-2"
      >
        {isPending ? (
          <>
            <Loader2 className="size-4 animate-spin text-[#FDDA32]" />
            Sending Message...
          </>
        ) : (
          <>
            <Send className="size-4 text-[#FDDA32]" />
            Submit Inquiry
          </>
        )}
      </Button>
    </form>
  );
}
