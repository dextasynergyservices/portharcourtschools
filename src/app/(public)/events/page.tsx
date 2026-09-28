import { and, asc, desc, eq } from "drizzle-orm";
import { Calendar, GraduationCap, MapPin } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { getPageContent } from "@/app/(admin)/admin/pages/actions";
import { FlagshipEventShowcase } from "@/components/site/events/flagship-event-showcase";
import { RegisterEventDialog } from "@/components/site/events/register-event-dialog";
import {
  FadeIn,
  StaggerContainer,
  StaggerItem,
} from "@/components/site/motion-wrapper";
import { Badge } from "@/components/ui/badge";
import { db, events, programmes } from "@/lib/db";

export const revalidate = 180;

export const metadata: Metadata = {
  title:
    "Events & Programmes — Schools Voice (Formerly Port Harcourt Schools) | EdFocus Africa",
  description:
    "From our flagship Teachers Spotlight Summit & Awards to ongoing accredited training programmes with GeePhill, this is where Schools Voice (formerly Port Harcourt Schools) brings its mission to life.",
  alternates: {
    canonical: "/events",
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

interface EventsPageProps {
  searchParams: Promise<{
    type?: string;
  }>;
}

export default async function EventsAndProgrammesPage({
  searchParams,
}: EventsPageProps) {
  const { type } = await searchParams;

  const pageData = await getPageContent("events");
  const sections =
    (pageData.sections as Record<string, Record<string, string | undefined>>) ||
    {};

  const heroBadge = sections.hero?.badge || "Public Engagement & Training";
  const heroTitle = sections.hero?.title || "Events & Programmes";
  const heroSubtitle =
    sections.hero?.subtitle ||
    "From our flagship education summit to ongoing professional development masterclasses, this is where PortHarcourtSchools convenes, honors, and equips educators across Rivers State.";

  // 1. Fetch published events
  const eventConditions = [eq(events.status, "published")];
  if (type && type !== "all") {
    eventConditions.push(
      eq(events.type, type as "summit" | "masterclass" | "workshop" | "awards"),
    );
  }

  const allPublishedEvents = await db.query.events.findMany({
    where: and(...eventConditions),
    orderBy: [asc(events.sortOrder), desc(events.startDate)],
  });

  // Flagship spotlight events: prioritize events explicitly marked isFeatured: true
  // Fallback to summit format or most recent event if none are explicitly marked
  const featuredFlagshipEvents = allPublishedEvents.filter((e) => e.isFeatured);
  const showcaseEvents =
    featuredFlagshipEvents.length > 0
      ? featuredFlagshipEvents
      : allPublishedEvents.filter(
            (e) => e.type === "summit" || e.slug.includes("summit"),
          ).length > 0
        ? allPublishedEvents.filter(
            (e) => e.type === "summit" || e.slug.includes("summit"),
          )
        : allPublishedEvents.slice(0, 1);

  // 2. Fetch published programmes
  const allProgrammes = await db.query.programmes.findMany({
    where: eq(programmes.status, "published"),
    orderBy: [desc(programmes.createdAt)],
  });

  const activeType = type || "all";

  return (
    <div className="w-full bg-[#F5F4F0] text-[#151B2E]">
      {/* Header */}
      <section className="relative overflow-hidden bg-[#F5F4F0] border-b border-[#E4E0D5] pt-16 pb-16 sm:pt-24 sm:pb-20">
        <span className="offset_subheader" aria-hidden="true">
          Events
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

      {/* Featured Flagship Event Showcase (Solid #08276B, No Gradients, Displays Cover Image) */}
      {showcaseEvents.length > 0 && (
        <FlagshipEventShowcase events={showcaseEvents} />
      )}

      {/* Upcoming Events Grid */}
      <section className="py-16 sm:py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
          <div>
            <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              {sections.upcomingHeader?.badge || "Calendar & Gatherings"}
            </span>
            <h2 className="font-heading text-2xl sm:text-3xl font-black text-[#151B2E] mt-1">
              {sections.upcomingHeader?.title || "Upcoming Events & Workshops"}
            </h2>
          </div>

          {/* Type Filter Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <Link
              href="/events"
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeType === "all"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "bg-white border border-[#D9DEEC] text-[#151B2E] hover:border-[#184098] hover:text-[#184098]"
              }`}
            >
              All Events
            </Link>
            {(["summit", "masterclass", "workshop", "awards"] as const).map(
              (t) => (
                <Link
                  key={t}
                  href={`/events?type=${t}`}
                  className={`px-3 py-1.5 rounded-md text-xs font-bold capitalize whitespace-nowrap transition-colors ${
                    activeType === t
                      ? "bg-[#184098] text-white shadow-xs"
                      : "bg-white border border-[#D9DEEC] text-[#151B2E] hover:border-[#184098] hover:text-[#184098]"
                  }`}
                >
                  {t}s
                </Link>
              ),
            )}
          </div>
        </div>

        {allPublishedEvents.length === 0 ? (
          <div className="bg-white border border-[#D9DEEC] rounded-lg p-12 text-center max-w-lg mx-auto space-y-3">
            <Calendar className="size-10 text-muted-foreground/40 mx-auto" />
            <h3 className="font-heading text-base font-bold text-[#151B2E]">
              No events scheduled in this category
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              Check back soon as new training masterclasses and workshop dates
              are announced.
            </p>
          </div>
        ) : (
          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {allPublishedEvents.map((ev) => (
              <StaggerItem key={ev.id}>
                <article className="h-full flex flex-col justify-between bg-white border border-[#D9DEEC] rounded-xl overflow-hidden hover:-translate-y-1 hover:shadow-xl hover:border-[#184098]/40 transition-all duration-300 group">
                  {/* Event Thumbnail */}
                  <div className="relative h-48 w-full bg-[#EEF2FA] overflow-hidden">
                    <Image
                      src={ev.coverImage || "/images/ph_hero_classroom.jpg"}
                      alt={ev.title}
                      fill
                      loading="lazy"
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-cover group-hover:scale-103 transition-transform duration-300"
                    />
                    <div className="absolute top-3 left-3 flex items-center gap-1.5">
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold border-[#D9DEEC] bg-white text-[#184098] shadow-xs"
                      >
                        {ev.type}
                      </Badge>
                      {ev.isPaid ? (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-bold border-emerald-300 bg-emerald-50 text-emerald-800 shadow-xs"
                        >
                          ₦{ev.price?.toLocaleString() ?? "Paid"}
                        </Badge>
                      ) : (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-semibold border-white/60 bg-white/90 text-[#151B2E] shadow-xs"
                        >
                          Free
                        </Badge>
                      )}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2 text-xs font-semibold text-[#184098]">
                        <Calendar className="size-3.5" />
                        <span>
                          {new Date(ev.startDate).toLocaleDateString("en-GB", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </span>
                      </div>

                      <h3 className="font-heading text-lg font-bold text-[#151B2E] leading-snug group-hover:text-[#184098] transition-colors line-clamp-2">
                        <Link href={`/events/${ev.slug}`}>{ev.title}</Link>
                      </h3>

                      <p className="text-xs text-muted-foreground line-clamp-3 leading-relaxed">
                        {ev.description}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-[#D9DEEC] flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate max-w-[140px]">
                        <MapPin className="size-3 shrink-0" />
                        <span className="truncate">{ev.venue}</span>
                      </div>

                      <div className="flex items-center gap-2">
                        <RegisterEventDialog
                          event={ev}
                          triggerClassName="h-7 px-2.5 rounded text-[11px] font-bold bg-[#184098] hover:bg-[#15327A] text-white transition-colors"
                          triggerText="Register"
                        />
                        <Link
                          href={`/events/${ev.slug}`}
                          className="font-display text-[11px] font-bold uppercase tracking-wider text-muted-foreground hover:text-[#184098] inline-flex items-center"
                          title="View Full Details"
                        >
                          <ArrowDiagonal />
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              </StaggerItem>
            ))}
          </StaggerContainer>
        )}
      </section>

      {/* Programmes with GeePhill Education Consulting */}
      <section
        id="programmes"
        className="relative py-16 sm:py-24 bg-[#EFECE6] border-b border-[#E4E0D5]"
      >
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-10">
          <FadeIn className="max-w-3xl pb-4 border-b border-[#D9DEEC]">
            <span className="font-display text-xs font-bold uppercase tracking-widest text-[#184098]">
              {sections.programmesHeader?.badge ||
                "Accredited Capacity Development"}
            </span>
            <h2 className="font-heading text-3xl sm:text-4xl font-black text-[#151B2E] mt-1">
              {sections.programmesHeader?.title || "Accredited Programmes"}
            </h2>
            <p className="text-sm sm:text-base text-[#55627D] font-sans mt-2 leading-relaxed">
              {sections.programmesHeader?.subtitle ||
                "We deliver practical, certified training for school leaders and teachers through our technical delivery partner, GeePhill Education Consulting."}
            </p>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {allProgrammes.map((prog) => (
              <StaggerItem key={prog.id}>
                <div className="h-full flex flex-col justify-between bg-white rounded-xl p-7 border border-[#D9DEEC] hover:border-[#184098] transition-all shadow-xs group">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 text-[#184098]">
                        <GraduationCap className="size-5 text-[#184098]" />
                        <span className="font-display text-[11px] font-bold uppercase tracking-widest text-muted-foreground">
                          {prog.provider} Certified
                        </span>
                      </div>

                      {prog.isAccredited && (
                        <Badge
                          variant="outline"
                          className="text-[10px] uppercase font-bold border-emerald-200 bg-emerald-50 text-emerald-700"
                        >
                          TRCN Accredited
                        </Badge>
                      )}
                    </div>

                    <h3 className="font-heading text-lg font-bold text-[#151B2E]">
                      {prog.title}
                    </h3>
                    <p className="text-sm text-[#55627D] leading-relaxed font-sans">
                      {prog.description}
                    </p>
                  </div>

                  <div className="pt-5 mt-5 border-t border-[#D9DEEC]/70 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">
                      {prog.category || "Professional Development"}
                    </span>

                    <Link
                      href="/contact?type=training"
                      className="inline-flex items-center text-xs font-display font-bold uppercase tracking-wider text-[#184098] group-hover:text-[#08276B] transition-colors"
                    >
                      <span>Inquire About Training</span>
                      <ArrowDiagonal />
                    </Link>
                  </div>
                </div>
              </StaggerItem>
            ))}
          </StaggerContainer>

          {/* Coming Soon Section */}
          <div className="p-8 rounded-xl border border-[#D9DEEC] bg-white text-center max-w-2xl mx-auto space-y-2 shadow-xs">
            <h4 className="font-heading text-base font-bold text-[#151B2E]">
              More Dates Coming Soon
            </h4>
            <p className="text-xs sm:text-sm text-[#55627D] font-sans leading-relaxed">
              Additional workshop cohorts, termly leadership roundtable dates,
              and community forums are announced regularly. Follow
              @portharcourtschools or join the community list to receive
              notifications first.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
