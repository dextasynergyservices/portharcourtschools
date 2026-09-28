import { and, desc, eq, ne } from "drizzle-orm";
import {
  Calendar,
  CheckCircle2,
  Clock,
  MapPin,
  Ticket,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { cache } from "react";
import { EventShareButtons } from "@/components/site/events/event-share-buttons";
import { PartnerEventDialog } from "@/components/site/events/partner-event-dialog";
import { RegisterEventDialog } from "@/components/site/events/register-event-dialog";
import { FadeIn } from "@/components/site/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import { getOrSetCache } from "@/lib/cache";
import { db, events } from "@/lib/db";

export const revalidate = 600;

interface EventPageProps {
  params: Promise<{
    slug: string;
  }>;
}

const getEventBySlug = cache(async (slug: string) => {
  return getOrSetCache(
    `event:${slug}`,
    ["events", `event:${slug}`],
    async () => {
      const event = await db.query.events.findFirst({
        where: and(eq(events.slug, slug), eq(events.status, "published")),
      });
      return event || null;
    },
    600,
  );
});

export async function generateStaticParams() {
  const allEvents = await db.query.events.findMany({
    where: eq(events.status, "published"),
    columns: {
      slug: true,
    },
  });

  return allEvents.map((evt) => ({
    slug: evt.slug,
  }));
}

export async function generateMetadata({
  params,
}: EventPageProps): Promise<Metadata> {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    return {
      title: "Event Not Found — Schools Voice (Formerly Port Harcourt Schools)",
      description: "The requested education event could not be found.",
    };
  }

  const title = `${event.title} — Events | Schools Voice (Formerly Port Harcourt Schools)`;
  const description =
    event.description.length > 160
      ? `${event.description.slice(0, 157)}...`
      : event.description;

  return {
    title,
    description,
    alternates: {
      canonical: `/events/${event.slug}`,
    },
    openGraph: {
      title,
      description,
      type: "website",
      url: `https://portharcourtschools.com/events/${event.slug}`,
      images: event.coverImage ? [{ url: event.coverImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: event.coverImage ? [event.coverImage] : undefined,
    },
  };
}

export default async function EventDetailPage({ params }: EventPageProps) {
  const { slug } = await params;
  const event = await getEventBySlug(slug);

  if (!event) {
    notFound();
  }

  // Fetch other upcoming events
  const otherEvents = await db.query.events.findMany({
    where: and(ne(events.id, event.id), eq(events.status, "published")),
    orderBy: [desc(events.startDate)],
    limit: 2,
  });

  // Date formatting
  const startDateObj = new Date(event.startDate);
  const formattedFullDate = startDateObj.toLocaleDateString("en-NG", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const formattedTime = startDateObj.toLocaleTimeString("en-NG", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const endDateObj = event.endDate ? new Date(event.endDate) : null;
  const formattedEndDate = endDateObj
    ? endDateObj.toLocaleDateString("en-NG", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : null;

  // JSON-LD Structured Data Schema for Event
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Event",
    name: event.title,
    description: event.description,
    startDate: startDateObj.toISOString(),
    endDate: endDateObj ? endDateObj.toISOString() : undefined,
    eventStatus: "https://schema.org/EventScheduled",
    eventAttendanceMode: "https://schema.org/OfflineEventAttendanceMode",
    location: {
      "@type": "Place",
      name: event.venue,
      address: {
        "@type": "PostalAddress",
        addressLocality: "Port Harcourt",
        addressRegion: "Rivers State",
        addressCountry: "NG",
      },
    },
    image: event.coverImage ? [event.coverImage] : undefined,
    organizer: {
      "@type": "Organization",
      name: "PortHarcourtSchools / EdFocus Africa",
      url: "https://portharcourtschools.com",
    },
    offers: event.isPaid
      ? {
          "@type": "Offer",
          url:
            event.paymentLink ||
            `https://portharcourtschools.com/events/${event.slug}`,
          price: String(event.price || 0),
          priceCurrency: "NGN",
          availability: "https://schema.org/InStock",
        }
      : {
          "@type": "Offer",
          price: "0",
          priceCurrency: "NGN",
          availability: "https://schema.org/InStock",
        },
  };

  return (
    <>
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <div className="w-full bg-[#F5F4F0] text-[#151B2E]">
        {/* Navigation Breadcrumb Bar */}
        <section className="border-b border-[#E4E0D5] bg-[#FFFFFF] py-4">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <nav
              aria-label="Breadcrumb"
              className="flex items-center space-x-2 text-xs text-muted-foreground"
            >
              <Link href="/" className="transition-colors hover:text-[#184098]">
                Home
              </Link>
              <span>/</span>
              <Link
                href="/events"
                className="transition-colors hover:text-[#184098]"
              >
                Events &amp; Programmes
              </Link>
              <span>/</span>
              <span className="font-medium text-[#151B2E] truncate max-w-xs sm:max-w-md">
                {event.title}
              </span>
            </nav>
          </div>
        </section>

        {/* Hero Section */}
        <section className="relative overflow-hidden bg-[#151B2E] text-white py-12 sm:py-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="max-w-3xl space-y-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white font-mono text-[11px] uppercase tracking-wider"
                  >
                    {event.type}
                  </Badge>

                  {event.ticketTiers && event.ticketTiers.length > 0 ? (
                    <Badge className="bg-[#184098] hover:bg-[#184098] text-white text-[11px] font-semibold border-none">
                      {event.ticketTiers.some((t) => Number(t.price) === 0)
                        ? `${event.ticketTiers.length} Ticket Tiers Available (Free & VIP)`
                        : `${event.ticketTiers.length} Ticket Tiers Available`}
                    </Badge>
                  ) : event.isPaid ? (
                    <Badge className="bg-[#184098] hover:bg-[#184098] text-white text-[11px] font-semibold border-none">
                      ₦{(event.price || 0).toLocaleString()} • Paid Event
                    </Badge>
                  ) : (
                    <Badge className="bg-[#2E8B57] hover:bg-[#2E8B57] text-white text-[11px] font-semibold border-none">
                      Free Admission
                    </Badge>
                  )}
                </div>

                <h1 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-black text-white leading-tight">
                  {event.title}
                </h1>

                {/* Key Event Details Grid in Hero */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-4 text-sm text-[#D9DEEC] border-t border-white/15">
                  <div className="flex items-start gap-2.5">
                    <Calendar className="size-4 text-[#D9DEEC] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">
                        {formattedFullDate}
                      </p>
                      {formattedEndDate &&
                        formattedEndDate !== formattedFullDate && (
                          <p className="text-xs text-[#D9DEEC]/80">
                            to {formattedEndDate}
                          </p>
                        )}
                      <p className="text-xs text-[#D9DEEC]/80 flex items-center gap-1 mt-0.5">
                        <Clock className="size-3" />
                        {formattedTime}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <MapPin className="size-4 text-[#D9DEEC] shrink-0 mt-0.5" />
                    <div>
                      <p className="font-medium text-white">{event.venue}</p>
                      <p className="text-xs text-[#D9DEEC]/80">
                        Port Harcourt, Rivers State
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </FadeIn>
          </div>
        </section>

        {/* Main Content Area: 2 Columns */}
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-16 pb-32 sm:pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
            {/* Left/Main Column: Overview, Schedule, Details */}
            <div className="lg:col-span-8 space-y-10">
              {/* Event Cover Image if exists */}
              {event.coverImage && (
                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-lg border border-[#E4E0D5] bg-white shadow-sm">
                  <Image
                    src={event.coverImage}
                    alt={event.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 800px"
                    className="object-cover"
                    priority
                  />
                </div>
              )}

              {/* Event Overview */}
              <section className="bg-white rounded-lg border border-[#E4E0D5] p-6 sm:p-8 space-y-4 shadow-sm">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#151B2E]">
                  About This Event
                </h2>
                <div className="prose prose-slate max-w-none text-[#4A5568] leading-relaxed font-sans text-base space-y-4">
                  <p className="whitespace-pre-line">{event.description}</p>
                </div>

                {event.slug === "teachers-spotlight-summit-awards-2026" && (
                  <div className="mt-6 rounded-lg border border-[#184098]/20 bg-[#EEF2FA]/70 p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider text-[#184098] block">
                        Featured Coverage
                      </span>
                      <p className="text-sm font-semibold text-[#151B2E]">
                        Teachers Spotlight Awards &amp; Summit 2026 Set to Bring
                        Educators Together in Port Harcourt
                      </p>
                    </div>
                    <Link
                      href="/blog/teachers-spotlight-awards-summit-2026-set-to-bring-educators-together-in-port-harcourt"
                      className="text-xs font-bold text-[#184098] hover:text-[#15327A] underline shrink-0 inline-flex items-center gap-1"
                    >
                      Read Full Article →
                    </Link>
                  </div>
                )}
              </section>

              {/* Target Audience / Who Should Attend */}
              <section className="bg-white rounded-lg border border-[#E4E0D5] p-6 sm:p-8 space-y-5 shadow-sm">
                <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#151B2E] flex items-center gap-2">
                  <Users className="size-5 text-[#184098]" />
                  Who Should Attend
                </h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm font-sans text-[#4A5568]">
                  <div className="p-4 rounded-md bg-[#F5F4F0] border border-[#E4E0D5]">
                    <h3 className="font-bold text-[#151B2E] mb-1">
                      School Proprietors &amp; Directors
                    </h3>
                    <p className="text-xs text-[#5C6479]">
                      Gain critical governance frameworks, modern curriculum
                      strategies, and school sustainability insights.
                    </p>
                  </div>

                  <div className="p-4 rounded-md bg-[#F5F4F0] border border-[#E4E0D5]">
                    <h3 className="font-bold text-[#151B2E] mb-1">
                      Principals &amp; Headteachers
                    </h3>
                    <p className="text-xs text-[#5C6479]">
                      Master teacher retention strategies, classroom leadership,
                      and academic performance management.
                    </p>
                  </div>

                  <div className="p-4 rounded-md bg-[#F5F4F0] border border-[#E4E0D5]">
                    <h3 className="font-bold text-[#151B2E] mb-1">
                      Classroom Teachers &amp; Educators
                    </h3>
                    <p className="text-xs text-[#5C6479]">
                      Level up interactive teaching methodologies, STEM
                      pedagogy, and classroom champions awards recognition.
                    </p>
                  </div>

                  <div className="p-4 rounded-md bg-[#F5F4F0] border border-[#E4E0D5]">
                    <h3 className="font-bold text-[#151B2E] mb-1">
                      Education Partners &amp; Sponsors
                    </h3>
                    <p className="text-xs text-[#5C6479]">
                      Directly connect with top decision-makers across hundreds
                      of leading schools in Port Harcourt and Rivers State.
                    </p>
                  </div>
                </div>
              </section>

              {/* Tickets & Admission Tiers Section */}
              {event.ticketTiers && event.ticketTiers.length > 0 && (
                <section className="bg-white rounded-lg border border-[#E4E0D5] p-6 sm:p-8 space-y-6 shadow-sm">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 border-b border-[#E4E0D5] pb-4">
                    <div>
                      <div className="flex items-center gap-2">
                        <Ticket className="size-5 text-[#184098]" />
                        <h2 className="font-heading text-xl sm:text-2xl font-bold text-[#151B2E]">
                          Tickets &amp; Admission Tiers
                        </h2>
                      </div>
                      <p className="text-xs text-[#5C6479] mt-1">
                        Choose the admission package that best suits your goals,
                        school, or organization.
                      </p>
                    </div>
                    <Badge
                      variant="outline"
                      className="w-fit text-xs font-bold border-[#184098] text-[#184098] bg-[#EEF2FA]"
                    >
                      {event.ticketTiers.length} Tier Options Available
                    </Badge>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    {event.ticketTiers.map((tier) => {
                      const isFree = Number(tier.price) === 0;
                      return (
                        <div
                          key={tier.id}
                          className="flex flex-col justify-between rounded-lg border border-[#E4E0D5] bg-[#FAFBFF] p-5 sm:p-6 transition-all hover:border-[#184098]/60 hover:shadow-md relative"
                        >
                          <div>
                            <div className="flex items-start justify-between gap-2 mb-2">
                              <div>
                                <h3 className="font-heading text-base sm:text-lg font-black text-[#151B2E]">
                                  {tier.name}
                                </h3>
                                {tier.description && (
                                  <p className="text-xs text-[#5C6479] mt-1 leading-relaxed">
                                    {tier.description}
                                  </p>
                                )}
                              </div>
                              {tier.badge && (
                                <Badge className="bg-[#184098] hover:bg-[#184098] text-white text-[10px] font-bold shrink-0">
                                  {tier.badge}
                                </Badge>
                              )}
                            </div>

                            <div className="my-4 py-3 border-y border-[#D9DEEC]/70">
                              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                                Admission Fee
                              </span>
                              <span className="font-heading text-2xl sm:text-3xl font-black text-[#184098]">
                                {isFree
                                  ? "Free (₦0)"
                                  : `₦${Number(tier.price).toLocaleString()}`}
                              </span>
                              {!isFree && (
                                <span className="text-xs text-[#5C6479] ml-1 font-medium">
                                  / delegate
                                </span>
                              )}
                            </div>

                            {tier.benefits && tier.benefits.length > 0 && (
                              <div className="space-y-2 mb-6">
                                <span className="text-[11px] font-bold uppercase tracking-wider text-[#151B2E] block">
                                  Includes:
                                </span>
                                <ul className="space-y-1.5 text-xs text-[#4A5568]">
                                  {tier.benefits.map((benefit, bIdx) => (
                                    <li
                                      key={`${tier.id}-${bIdx}-${benefit.slice(0, 10)}`}
                                      className="flex items-start gap-2"
                                    >
                                      <CheckCircle2 className="size-3.5 text-[#2E8B57] shrink-0 mt-0.5" />
                                      <span>{benefit}</span>
                                    </li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>

                          <div className="pt-2">
                            <RegisterEventDialog
                              event={event}
                              defaultTierId={tier.id}
                              triggerClassName="w-full justify-center text-xs h-10 font-bold bg-[#184098] hover:bg-[#15327A] text-white cursor-pointer"
                              triggerText={
                                isFree
                                  ? "Claim Free Ticket"
                                  : `Select ${tier.name}`
                              }
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </section>
              )}
            </div>

            {/* Right Column: Sticky Action & Ticket Box */}
            <div className="lg:col-span-4 space-y-6">
              <div className="sticky top-24 space-y-6">
                {/* Registration & CTAs Card */}
                <div className="bg-white rounded-lg border border-[#E4E0D5] p-6 shadow-sm space-y-6">
                  <div className="border-b border-[#E4E0D5] pb-4">
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">
                      Registration &amp; Attendance
                    </span>
                    <div className="mt-1 flex items-baseline justify-between">
                      <span className="font-heading text-2xl font-black text-[#151B2E]">
                        {event.ticketTiers && event.ticketTiers.length > 0
                          ? event.ticketTiers.some((t) => Number(t.price) === 0)
                            ? "Free / Multi-Tier"
                            : `From ₦${Math.min(...event.ticketTiers.map((t) => Number(t.price))).toLocaleString()}`
                          : event.isPaid && event.price
                            ? `₦${event.price.toLocaleString()}`
                            : event.isPaid
                              ? "Paid Event"
                              : "Free Admission"}
                      </span>
                      {event.ticketTiers && event.ticketTiers.length > 0 ? (
                        <span className="text-xs font-semibold text-[#184098] bg-[#EEF2FA] px-2 py-0.5 rounded">
                          {event.ticketTiers.length} Tiers
                        </span>
                      ) : event.isPaid ? (
                        <span className="text-xs font-semibold text-[#184098] bg-[#EEF2FA] px-2 py-0.5 rounded">
                          Per Attendee
                        </span>
                      ) : (
                        <span className="text-xs font-semibold text-[#2E8B57] bg-[#2E8B57]/10 px-2 py-0.5 rounded">
                          Open to All
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Primary CTA */}
                  <div className="space-y-3">
                    <RegisterEventDialog
                      event={event}
                      triggerText={
                        event.isPaid
                          ? "Register & Get Tickets"
                          : "Register to Attend"
                      }
                    />

                    {/* Secondary Actions */}
                    <div className="pt-2">
                      <PartnerEventDialog
                        eventTitle={event.title}
                        triggerClassName="w-full justify-center text-xs h-9 border-[#D9DEEC] text-[#151B2E]"
                      />
                    </div>
                  </div>

                  {/* Quick Summary Grid */}
                  <div className="pt-4 border-t border-[#E4E0D5] space-y-3 text-xs text-[#5C6479]">
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#151B2E]">
                        Organizer
                      </span>
                      <span>PortHarcourtSchools</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#151B2E]">
                        Accreditation
                      </span>
                      <span>GeePhill Partnered</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="font-medium text-[#151B2E]">
                        Certificates
                      </span>
                      <span>Provided upon completion</span>
                    </div>
                  </div>

                  {/* Social Share Box */}
                  <div className="pt-4 border-t border-[#E4E0D5]">
                    <EventShareButtons title={event.title} />
                  </div>
                </div>

                {/* Other Events Mini-Card */}
                {otherEvents.length > 0 && (
                  <div className="bg-white rounded-lg border border-[#E4E0D5] p-5 shadow-sm space-y-4">
                    <h3 className="font-heading text-sm font-bold text-[#151B2E] uppercase tracking-wider">
                      More Upcoming Events
                    </h3>
                    <div className="space-y-4 divide-y divide-[#E4E0D5]">
                      {otherEvents.map((oe) => (
                        <div key={oe.id} className="pt-3 first:pt-0 space-y-1">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-[#184098]">
                            {oe.type}
                          </span>
                          <Link
                            href={`/events/${oe.slug}`}
                            className="block font-heading text-xs font-bold text-[#151B2E] hover:text-[#184098] transition-colors line-clamp-2"
                          >
                            {oe.title}
                          </Link>
                          <p className="text-[11px] text-muted-foreground flex items-center gap-1">
                            <Calendar className="size-3" />
                            {new Date(oe.startDate).toLocaleDateString(
                              "en-NG",
                              {
                                month: "short",
                                day: "numeric",
                                year: "numeric",
                              },
                            )}
                          </p>
                        </div>
                      ))}
                    </div>

                    <Link
                      href="/events"
                      className="block text-center text-xs font-bold text-[#184098] hover:underline pt-2"
                    >
                      View full events calendar →
                    </Link>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Mobile Fixed Bottom Action Bar */}
        <div className="fixed bottom-16 inset-x-0 z-[9990] md:hidden bg-white/95 backdrop-blur-md border-t border-[#D9DEEC] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
          <div className="flex items-center justify-between gap-4">
            <div className="min-w-0">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
                {event.isPaid ? "Admission Fee" : "Admission"}
              </span>
              <div className="flex items-baseline gap-1">
                <span className="font-heading text-lg font-black text-[#151B2E]">
                  {event.isPaid && event.price
                    ? `₦${event.price.toLocaleString()}`
                    : "Free"}
                </span>
                {event.isPaid && (
                  <span className="text-[11px] text-muted-foreground">
                    / person
                  </span>
                )}
              </div>
            </div>

            <div className="shrink-0">
              <RegisterEventDialog
                event={event}
                triggerClassName="h-10 px-5 rounded-md bg-[#184098] hover:bg-[#15327A] text-white font-bold text-xs shadow-sm transition-colors"
                triggerText={event.isPaid ? "Get Tickets" : "Register Now"}
              />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
