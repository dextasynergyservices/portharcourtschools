"use client";

import { useEffect, useState } from "react";
import type { TicketTier } from "@/lib/db/schema";
import { cn } from "@/lib/utils";
import { RegisterEventDialog } from "./register-event-dialog";

interface EventMobileActionBarProps {
  event: {
    id: string;
    title: string;
    slug: string;
    venue: string;
    startDate: Date | string;
    isPaid: boolean;
    price?: number | null;
    paymentLink?: string | null;
    ticketTiers?: TicketTier[] | null;
  };
}

export function EventMobileActionBar({ event }: EventMobileActionBarProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnyDialogOpen, setIsAnyDialogOpen] = useState(false);

  // Monitor DOM for any active dialog to ensure the floating bar is always hidden
  useEffect(() => {
    const checkDialog = () => {
      const dialog = document.querySelector('[role="dialog"]');
      setIsAnyDialogOpen(!!dialog);
    };

    checkDialog();
    const observer = new MutationObserver(checkDialog);
    observer.observe(document.body, { childList: true, subtree: true });

    return () => observer.disconnect();
  }, []);

  const shouldHide = isOpen || isAnyDialogOpen;

  // Compute pricing display
  const hasTiers = !!(event.ticketTiers && event.ticketTiers.length > 0);
  const priceDisplay = (() => {
    if (!event.isPaid) return "Free";
    if (hasTiers && event.ticketTiers) {
      const prices = event.ticketTiers
        .map((t) => Number(t.price) || 0)
        .filter((p) => p > 0);
      if (prices.length > 0) {
        const minPrice = Math.min(...prices);
        return `From ₦${minPrice.toLocaleString()}`;
      }
    }
    return event.price ? `₦${event.price.toLocaleString()}` : "Free";
  })();

  return (
    <div
      aria-hidden={shouldHide}
      className={cn(
        "fixed bottom-16 inset-x-0 z-30 md:hidden bg-white/95 backdrop-blur-md border-t border-[#D9DEEC] px-4 py-3 shadow-[0_-4px_20px_rgba(0,0,0,0.08)] transition-all duration-300 ease-in-out",
        shouldHide
          ? "opacity-0 pointer-events-none translate-y-8 select-none"
          : "opacity-100 pointer-events-auto translate-y-0",
      )}
    >
      <div className="flex items-center justify-between gap-4">
        <div className="min-w-0">
          <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block">
            {event.isPaid ? "Admission Fee" : "Admission"}
          </span>
          <div className="flex items-baseline gap-1">
            <span className="font-heading text-lg font-black text-[#151B2E]">
              {priceDisplay}
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
            open={isOpen}
            onOpenChange={setIsOpen}
            triggerClassName="h-10 px-5 rounded-md bg-[#184098] hover:bg-[#15327A] text-white font-bold text-xs shadow-sm transition-colors cursor-pointer"
            triggerText={event.isPaid ? "Get Tickets" : "Register Now"}
          />
        </div>
      </div>
    </div>
  );
}
