"use client";

import {
  Calendar,
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  MapPin,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PartnerEventDialog } from "./partner-event-dialog";
import { RegisterEventDialog } from "./register-event-dialog";

export interface FlagshipEventItem {
  id: string;
  title: string;
  slug: string;
  description: string;
  type: "summit" | "masterclass" | "workshop" | "awards" | string;
  startDate: Date | string;
  endDate?: Date | string | null;
  venue: string;
  coverImage?: string | null;
  isFeatured: boolean;
  isPaid: boolean;
  price?: number | null;
  paymentLink?: string | null;
  status: string;
}

interface FlagshipEventShowcaseProps {
  events: FlagshipEventItem[];
}

export function FlagshipEventShowcase({ events }: FlagshipEventShowcaseProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  if (!events || events.length === 0) {
    return null;
  }

  // Ensure index stays in bounds
  const activeEvent = events[currentIndex] || events[0];
  const hasMultiple = events.length > 1;

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev > 0 ? prev - 1 : events.length - 1));
  };

  const handleNext = () => {
    setCurrentIndex((prev) => (prev < events.length - 1 ? prev + 1 : 0));
  };

  const startDateObj = new Date(activeEvent.startDate);
  const formattedDate = startDateObj.toLocaleDateString("en-GB", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const dayNumber = startDateObj.toLocaleDateString("en-GB", {
    day: "numeric",
  });
  const monthAbbr = startDateObj
    .toLocaleDateString("en-GB", { month: "short" })
    .toUpperCase();

  const coverSrc =
    activeEvent.coverImage?.trim() || "/images/ph_hero_classroom.jpg";

  return (
    <section className="relative py-12 sm:py-16 bg-white border-b border-[#E4E0D5]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Solid #08276B Container — Explicitly NO Gradients */}
        <div className="bg-[#08276B] text-white rounded-xl p-6 sm:p-10 lg:p-12 shadow-xl border border-[#184098]">
          {/* Header Switcher if multiple flagship events */}
          {hasMultiple && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/15 pb-4 mb-8">
              <div className="flex items-center gap-2">
                <span className="text-xs font-display font-bold uppercase tracking-wider text-[#C49A45]">
                  Flagship Spotlight ({currentIndex + 1} of {events.length})
                </span>
                <span className="text-white/40">•</span>
                <span className="text-xs text-[#D9DEEC] hidden sm:inline">
                  Select an event to view
                </span>
              </div>

              <div className="flex items-center gap-1.5 overflow-x-auto">
                <div className="flex items-center gap-1 bg-[#061e52] p-1 rounded-lg border border-white/10">
                  {events.map((evt, idx) => (
                    <button
                      key={evt.id}
                      type="button"
                      onClick={() => setCurrentIndex(idx)}
                      className={`px-3 py-1 text-xs font-bold rounded transition-colors whitespace-nowrap ${
                        idx === currentIndex
                          ? "bg-white text-[#08276B] shadow-xs"
                          : "text-[#D9DEEC] hover:text-white hover:bg-white/10"
                      }`}
                      title={evt.title}
                    >
                      Event {idx + 1}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-1 ml-2">
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handlePrev}
                    className="size-8 p-0 bg-[#061e52] border-white/20 text-white hover:bg-white hover:text-[#08276B]"
                    aria-label="Previous flagship event"
                  >
                    <ChevronLeft className="size-4" />
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    onClick={handleNext}
                    className="size-8 p-0 bg-[#061e52] border-white/20 text-white hover:bg-white hover:text-[#08276B]"
                    aria-label="Next flagship event"
                  >
                    <ChevronRight className="size-4" />
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* 2-Column Responsive Showcase Grid — items-start aligns image with the text */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-start">
            {/* Left Column: Event Details & Actions */}
            <div className="lg:col-span-7 space-y-6">
              {/* Badges */}
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="inline-block px-3 py-1 bg-[#C49A45] text-[#08276B] font-display text-xs font-black uppercase tracking-widest rounded">
                  Featured Flagship Event
                </span>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold border-white/30 text-white bg-white/10"
                >
                  {activeEvent.type}
                </Badge>
                {activeEvent.isPaid ? (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-bold border-emerald-400 bg-[#043320] text-emerald-300"
                  >
                    ₦{(activeEvent.price || 0).toLocaleString()} • Ticket
                  </Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-bold border-white/30 text-white bg-white/10"
                  >
                    Free Admission
                  </Badge>
                )}
              </div>

              {/* Title */}
              <h2 className="font-heading text-2xl sm:text-4xl lg:text-5xl font-black text-white uppercase tracking-tight leading-tight">
                <Link
                  href={`/events/${activeEvent.slug}`}
                  className="hover:underline"
                >
                  {activeEvent.title}
                </Link>
              </h2>

              {/* Date & Venue Metadata */}
              <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-semibold text-[#D9DEEC]">
                <span className="flex items-center gap-2">
                  <Calendar className="size-4 text-white" />
                  <span>{formattedDate}</span>
                </span>
                <span className="text-white/40 hidden sm:inline">•</span>
                <span className="flex items-center gap-2 text-[#D9DEEC]">
                  <MapPin className="size-4 text-white" />
                  <span>{activeEvent.venue}</span>
                </span>
              </div>

              {/* Description */}
              <p className="text-base sm:text-lg text-[#D9DEEC] leading-relaxed font-sans">
                {activeEvent.description}
              </p>

              {/* Highlights cards (Summit / Awards context) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-white/15">
                <div className="bg-[#061e52] border border-white/15 p-4 rounded-lg space-y-1.5">
                  <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                    The Summit
                  </h3>
                  <p className="text-xs text-[#D9DEEC] leading-relaxed font-sans">
                    Brings together school leaders, educators, and institutional
                    partners for keynote panels on curriculum modernization and
                    educator retention.
                  </p>
                </div>

                <div className="bg-[#061e52] border border-white/15 p-4 rounded-lg space-y-1.5">
                  <h3 className="font-heading text-base font-bold text-white uppercase tracking-wide">
                    Classroom Champions
                  </h3>
                  <p className="text-xs text-[#D9DEEC] leading-relaxed font-sans">
                    Shines a deserving light on classroom teachers whose work
                    transforms pupils&apos; lives, celebrated directly by the
                    communities they serve.
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 flex flex-wrap items-center gap-4">
                <RegisterEventDialog
                  event={activeEvent}
                  triggerClassName="cta-button cta-primary group"
                  triggerText={
                    activeEvent.isPaid
                      ? "Register & Get Tickets"
                      : "Register for Free"
                  }
                />

                {/* Partner with this Event: Solid white background with #184098 navy text */}
                <PartnerEventDialog
                  eventTitle={activeEvent.title}
                  triggerClassName="bg-white text-[#184098] hover:bg-[#EEF2FA] hover:text-[#08276B] border border-white font-display font-bold text-xs uppercase tracking-wider px-5 h-11 shadow-xs transition-colors rounded-sm inline-flex items-center gap-2"
                />

                <Link
                  href={`/events/${activeEvent.slug}`}
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#D9DEEC] hover:text-white underline underline-offset-4 py-2"
                >
                  <span>Event Details</span>
                  <ExternalLink className="size-3.5" />
                </Link>
              </div>
            </div>

            {/* Right Column: High-Impact Cover Image Display (NO Gradients) */}
            <div className="lg:col-span-5">
              <div className="relative rounded-xl overflow-hidden border-2 border-white/20 shadow-2xl bg-[#061e52]">
                {/* 16:11 Aspect ratio container */}
                <div className="relative aspect-[16/11] w-full">
                  <Image
                    src={coverSrc}
                    alt={activeEvent.title}
                    fill
                    sizes="(max-width: 1024px) 100vw, 42vw"
                    priority
                    className="object-cover"
                  />
                </div>

                {/* Floating Date Badge on Image — Solid white & navy, NO gradients */}
                <div className="absolute top-3 left-3 bg-white text-[#08276B] rounded-lg shadow-lg border border-[#D9DEEC] px-3 py-2 text-center">
                  <span className="block font-heading text-xl font-black leading-none">
                    {dayNumber}
                  </span>
                  <span className="block font-display text-[10px] font-bold tracking-widest text-[#184098] mt-0.5">
                    {monthAbbr}
                  </span>
                </div>

                {/* Solid bottom info bar on image */}
                <div className="bg-[#061e52] border-t border-white/15 px-4 py-3 flex items-center justify-between text-xs text-[#D9DEEC]">
                  <div className="flex items-center gap-2 truncate">
                    <MapPin className="size-3.5 text-[#C49A45] shrink-0" />
                    <span className="truncate font-medium">
                      {activeEvent.venue}
                    </span>
                  </div>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-bold border-white/30 text-white shrink-0 ml-2 bg-white/10"
                  >
                    {activeEvent.type}
                  </Badge>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
