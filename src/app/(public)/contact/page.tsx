import { Mail, MapPin, MessageSquare, Phone } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPageContent } from "@/app/(admin)/admin/pages/actions";
import { getSiteSettings } from "@/app/(admin)/admin/settings/actions";
import { FadeIn } from "@/components/site/motion-wrapper";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = {
  title: "Contact Us — Enquiries, Partnerships & Support",
  description:
    "Reach the PortHarcourtSchools team for school listings, event partnerships, teacher nominations, or parental enquiries.",
  alternates: {
    canonical: "/contact",
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

export default async function ContactPage() {
  const [pageData, settings] = await Promise.all([
    getPageContent("contact"),
    getSiteSettings(),
  ]);

  const sections =
    (pageData.sections as Record<string, Record<string, string | undefined>>) ||
    {};
  const heroBadge = sections.hero?.badge || "Inquiries & Engagement";
  const heroTitle = sections.hero?.title || "Let’s Talk.";
  const heroSubtitle =
    sections.hero?.subtitle ||
    "Whether you’re a parent with a question, a teacher looking to get involved, a school interested in our programmes, or an organisation exploring partnership, we’d like to hear from you.";

  const directContactHeading =
    sections.directContact?.heading || "Direct Contact";
  const directContactBody =
    sections.directContact?.body ||
    "Our team typically responds to all inquiries within 24 to 48 business hours.";
  const officeHours =
    sections.directContact?.officeHours ||
    "Monday – Friday: 9:00 AM – 5:00 PM (WAT)";

  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://portharcourtschools.com";
  const siteUrl = rawUrl.replace(/\/$/, "");

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact PortHarcourtSchools",
    description: heroSubtitle,
    url: `${siteUrl}/contact`,
    mainEntity: {
      "@type": "EducationalOrganization",
      name: "PortHarcourtSchools",
      telephone: settings.contactPhones?.[0] || undefined,
      email: settings.contactEmails?.[0] || undefined,
      address: settings.contactAddresses?.[0]
        ? {
            "@type": "PostalAddress",
            streetAddress: settings.contactAddresses[0],
            addressLocality: "Port Harcourt",
            addressRegion: "Rivers State",
            addressCountry: "NG",
          }
        : undefined,
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

      {/* Header */}
      <section className="relative overflow-hidden bg-[#F5F4F0] border-b border-[#E4E0D5] pt-16 pb-20 sm:pt-24 sm:pb-28">
        <span className="offset_subheader" aria-hidden="true">
          Contact
        </span>

        <div className="relative z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 space-y-6">
          <FadeIn>
            <div className="inline-flex items-center rounded-[2px] border border-[#184098]/30 bg-white/80 px-3 py-1 font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              {heroBadge}
            </div>
          </FadeIn>

          <FadeIn delay={0.08}>
            <h1 className="font-heading text-4xl sm:text-6xl font-black tracking-tight text-[#151B2E] uppercase leading-tight">
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

      {/* Main Content: Form & Direct Contact Info */}
      <section className="relative py-16 sm:py-24 bg-white border-b border-[#E4E0D5]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Form Column (7 cols) */}
            <div className="lg:col-span-7">
              <div className="bg-[#F5F4F0] p-6 sm:p-10 rounded-[2px] border border-[#D9DEEC] shadow-xs">
                <ContactForm />
              </div>
            </div>

            {/* Direct Contact & Details (5 cols) */}
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-3">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
                  {directContactHeading}
                </span>
                <h2 className="font-heading text-2xl sm:text-3xl font-bold text-[#151B2E]">
                  Channels &amp; Locations
                </h2>
                <p className="text-sm text-[#55627D] font-sans leading-relaxed">
                  {directContactBody}
                </p>
                {officeHours && (
                  <p className="text-xs text-[#184098] font-semibold">
                    {officeHours}
                  </p>
                )}
              </div>

              <div className="space-y-4">
                {/* Phone Lines (Multi-Entry) */}
                {settings.contactPhones && settings.contactPhones.length > 0 ? (
                  settings.contactPhones.map((phone) => {
                    const cleanPhone = phone.number.replace(/[^0-9+]/g, "");
                    const waLink = phone.isWhatsapp
                      ? `https://wa.me/${cleanPhone.replace("+", "")}`
                      : null;

                    return (
                      <div
                        key={phone.id}
                        className="flex items-start gap-4 p-4 rounded-[2px] border border-[#D9DEEC] bg-[#F5F4F0]"
                      >
                        <div className="size-10 rounded-[2px] bg-[#184098] text-[#FDDA32] flex items-center justify-center shrink-0">
                          {phone.isWhatsapp ? (
                            <MessageSquare className="size-5" />
                          ) : (
                            <Phone className="size-5" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <h4 className="font-heading text-sm font-bold text-[#151B2E] truncate">
                              {phone.label}
                            </h4>
                            {phone.isPrimary && (
                              <span className="text-[10px] bg-[#184098]/10 text-[#184098] px-1.5 py-0.5 rounded font-medium">
                                Primary
                              </span>
                            )}
                            {phone.isWhatsapp && (
                              <span className="text-[10px] bg-emerald-600/10 text-emerald-700 px-1.5 py-0.5 rounded font-medium">
                                WhatsApp
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-[#55627D] font-sans mt-0.5">
                            {waLink ? (
                              <a
                                href={waLink}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:text-[#184098] hover:underline"
                              >
                                {phone.number}
                              </a>
                            ) : (
                              <a
                                href={`tel:${cleanPhone}`}
                                className="hover:text-[#184098] hover:underline"
                              >
                                {phone.number}
                              </a>
                            )}
                          </p>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="flex items-start gap-4 p-4 rounded-[2px] border border-[#D9DEEC] bg-[#F5F4F0]">
                    <div className="size-10 rounded-[2px] bg-[#184098] text-[#FDDA32] flex items-center justify-center shrink-0">
                      <Phone className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-[#151B2E]">
                        Phone &amp; WhatsApp
                      </h4>
                      <p className="text-sm text-[#55627D] font-sans">
                        +234 803 123 4567
                      </p>
                    </div>
                  </div>
                )}

                {/* Email Inboxes (Multi-Entry) */}
                {settings.contactEmails && settings.contactEmails.length > 0 ? (
                  settings.contactEmails.map((email) => (
                    <div
                      key={email.id}
                      className="flex items-start gap-4 p-4 rounded-[2px] border border-[#D9DEEC] bg-[#F5F4F0]"
                    >
                      <div className="size-10 rounded-[2px] bg-[#184098] text-[#FDDA32] flex items-center justify-center shrink-0">
                        <Mail className="size-5" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h4 className="font-heading text-sm font-bold text-[#151B2E] truncate">
                            {email.label}
                          </h4>
                          {email.isPrimary && (
                            <span className="text-[10px] bg-[#184098]/10 text-[#184098] px-1.5 py-0.5 rounded font-medium">
                              Primary
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-[#55627D] font-sans mt-0.5 truncate">
                          <a
                            href={`mailto:${email.email}`}
                            className="hover:text-[#184098] hover:underline"
                          >
                            {email.email}
                          </a>
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-4 p-4 rounded-[2px] border border-[#D9DEEC] bg-[#F5F4F0]">
                    <div className="size-10 rounded-[2px] bg-[#184098] text-[#FDDA32] flex items-center justify-center shrink-0">
                      <Mail className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-[#151B2E]">
                        Email Inquiries
                      </h4>
                      <p className="text-sm text-[#55627D] font-sans">
                        edfocusafrica@gmail.com
                      </p>
                    </div>
                  </div>
                )}

                {/* Physical Locations (Multi-Entry) */}
                {settings.contactAddresses &&
                settings.contactAddresses.length > 0 ? (
                  settings.contactAddresses.map((addr) => (
                    <div
                      key={addr.id}
                      className="flex items-start gap-4 p-4 rounded-[2px] border border-[#D9DEEC] bg-[#F5F4F0]"
                    >
                      <div className="size-10 rounded-[2px] bg-[#184098] text-[#FDDA32] flex items-center justify-center shrink-0">
                        <MapPin className="size-5" />
                      </div>
                      <div>
                        <h4 className="font-heading text-sm font-bold text-[#151B2E]">
                          {addr.label}
                        </h4>
                        <p className="text-sm text-[#55627D] font-sans mt-0.5">
                          {addr.address}
                          {addr.city && `, ${addr.city}`}
                          {addr.state && `, ${addr.state}`}
                        </p>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="flex items-start gap-4 p-4 rounded-[2px] border border-[#D9DEEC] bg-[#F5F4F0]">
                    <div className="size-10 rounded-[2px] bg-[#184098] text-[#FDDA32] flex items-center justify-center shrink-0">
                      <MapPin className="size-5" />
                    </div>
                    <div>
                      <h4 className="font-heading text-sm font-bold text-[#151B2E]">
                        Headquarters
                      </h4>
                      <p className="text-sm text-[#55627D] font-sans">
                        Port Harcourt, Rivers State, Nigeria
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Closing CTAs */}
              <div className="pt-6 border-t border-[#D9DEEC] space-y-3">
                <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098] block">
                  Quick Actions
                </span>
                <div className="flex flex-wrap gap-2.5">
                  <a
                    href="https://instagram.com/portharcourtschools"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="cta-button text-xs py-2 px-3"
                  >
                    <span>Join the Community</span>
                    <ArrowDiagonal className="text-[#FDDA32]" />
                  </a>

                  <Link
                    href="/partners"
                    className="cta-button outline text-xs py-2 px-3"
                  >
                    <span>Partner With Us</span>
                    <ArrowDiagonal />
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
