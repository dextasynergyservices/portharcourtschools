"use client";

import {
  Calendar,
  CheckCircle2,
  CreditCard,
  ExternalLink,
  Loader2,
  MapPin,
  Ticket,
} from "lucide-react";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createEventRegistrationAction } from "@/app/(public)/events/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TicketTier } from "@/lib/db/schema";

interface RegisterEventDialogProps {
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
  defaultTierId?: string;
  children?: React.ReactNode;
  triggerClassName?: string;
  triggerText?: string;
}

export function RegisterEventDialog({
  event,
  defaultTierId,
  children,
  triggerClassName,
  triggerText,
}: RegisterEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [registrationResult, setRegistrationResult] = useState<{
    isPaid?: boolean;
    totalAmount?: number;
    paymentLink?: string | null;
    registrationId?: string;
  } | null>(null);

  const [isPending, startTransition] = useTransition();

  const tiers = event.ticketTiers || [];
  const hasTiers = Array.isArray(tiers) && tiers.length > 0;

  const [selectedTier, setSelectedTier] = useState<TicketTier | null>(() => {
    if (!hasTiers) return null;
    if (defaultTierId) {
      const found = tiers.find((t) => t.id === defaultTierId);
      if (found) return found;
    }
    return tiers[0] || null;
  });

  const unitPrice = selectedTier
    ? Number(selectedTier.price)
    : event.isPaid
      ? event.price || 0
      : 0;
  const isPaidSelection = unitPrice > 0;
  const totalAmount = unitPrice * quantity;

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);
    formData.set("ticketQuantity", String(quantity));
    if (selectedTier) {
      formData.set("ticketTierName", selectedTier.name);
      formData.set("ticketTierPrice", String(selectedTier.price));
      if (selectedTier.paymentLink) {
        formData.set("tierPaymentLink", selectedTier.paymentLink);
      }
    }

    startTransition(async () => {
      const res = await createEventRegistrationAction(formData);
      if (res.error) {
        setError(res.error);
        toast.error("Registration failed", {
          description: res.error,
        });
      } else {
        setRegistrationResult(res);
        setSubmitted(true);
        toast.success(
          res.isPaid ? "Registration submitted!" : "Registration confirmed!",
          {
            description: res.isPaid
              ? "Please complete your payment via the link to confirm your seat."
              : "Check your email for your ticket and Google Calendar invite.",
          },
        );
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setError(null);
        setQuantity(1);
        setRegistrationResult(null);
        if (hasTiers) {
          const init = defaultTierId
            ? tiers.find((t) => t.id === defaultTierId) || tiers[0]
            : tiers[0];
          setSelectedTier(init || null);
        }
      }, 300);
    }
  };

  const eventDateStr = new Date(event.startDate).toLocaleDateString("en-NG", {
    weekday: "short",
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {children ? (
          children
        ) : (
          <Button
            type="button"
            className={
              triggerClassName ||
              "w-full flex items-center justify-center gap-2 px-5 py-3.5 rounded-md bg-[#184098] hover:bg-[#15327A] text-white font-bold text-sm transition-colors shadow-sm text-center"
            }
          >
            <Ticket className="size-4" />
            <span>
              {triggerText ||
                (event.isPaid
                  ? "Register & Get Tickets"
                  : "Register to Attend")}
            </span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[560px] max-h-[90vh] overflow-y-auto p-0 gap-0 border-[#D9DEEC] bg-white rounded-lg shadow-xl">
        {submitted && registrationResult ? (
          <div className="p-6 sm:p-8 space-y-6 text-center">
            <div className="size-16 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="size-9" />
            </div>

            <div className="space-y-2">
              <DialogTitle className="font-heading text-2xl font-black text-[#151B2E]">
                {registrationResult.isPaid
                  ? "Registration Details Saved!"
                  : "You're Registered!"}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground max-w-md mx-auto leading-relaxed">
                {registrationResult.isPaid
                  ? `Your registration details have been captured in our system. Please finalize your payment of ₦${(registrationResult.totalAmount || 0).toLocaleString()} to confirm your ticket.`
                  : "Your seat has been reserved. A confirmation email and event reminder will be sent to you before the event."}
              </DialogDescription>
            </div>

            {/* Event Summary Card */}
            <div className="p-4 rounded-lg bg-[#F5F4F0] border border-[#E4E0D5] text-left text-xs space-y-2">
              <p className="font-bold text-sm text-[#151B2E]">{event.title}</p>
              <div className="text-muted-foreground space-y-1">
                <p className="flex items-center gap-1.5">
                  <Calendar className="size-3.5 text-[#184098]" />
                  <span>{eventDateStr}</span>
                </p>
                <p className="flex items-center gap-1.5">
                  <MapPin className="size-3.5 text-[#184098]" />
                  <span>{event.venue}</span>
                </p>
              </div>

              {selectedTier && (
                <div className="pt-2 border-t border-[#E4E0D5] flex items-center justify-between font-semibold">
                  <span>Ticket Tier:</span>
                  <span className="text-[#184098] font-bold">
                    {selectedTier.name}
                  </span>
                </div>
              )}

              {registrationResult.isPaid && (
                <div className="pt-2 border-t border-[#E4E0D5] flex items-center justify-between font-semibold">
                  <span>Total Amount Due:</span>
                  <span className="text-[#184098] font-bold text-sm">
                    ₦{(registrationResult.totalAmount || 0).toLocaleString()}
                  </span>
                </div>
              )}
            </div>

            {/* CTA Buttons */}
            <div className="pt-2 flex flex-col gap-3">
              {registrationResult.isPaid && registrationResult.paymentLink ? (
                <a
                  href={registrationResult.paymentLink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-6 rounded-md bg-[#184098] hover:bg-[#15327A] text-white font-bold text-sm transition-all shadow-md"
                >
                  <CreditCard className="size-4" />
                  <span>Proceed to Paystack / Secure Payment</span>
                  <ExternalLink className="size-4 ml-1" />
                </a>
              ) : (
                <Button
                  type="button"
                  onClick={() => handleOpenChange(false)}
                  className="w-full bg-[#184098] hover:bg-[#15327A] text-white font-bold text-sm py-3"
                >
                  Close &amp; Return to Event
                </Button>
              )}

              {registrationResult.isPaid && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => handleOpenChange(false)}
                  className="text-xs text-muted-foreground border-[#D9DEEC]"
                >
                  I will pay later (Check your email)
                </Button>
              )}
            </div>
          </div>
        ) : (
          <>
            {/* Header with Pricing Banner */}
            <DialogHeader className="p-6 bg-[#151B2E] text-white rounded-t-lg space-y-3">
              <div className="flex items-center justify-between flex-wrap gap-2">
                <div className="flex items-center gap-2">
                  <Badge
                    variant="outline"
                    className="border-white/20 bg-white/10 text-white font-mono text-[10px] uppercase tracking-wider"
                  >
                    Registration
                  </Badge>
                  {selectedTier && (
                    <Badge className="bg-[#184098] hover:bg-[#184098] text-white text-[10px] font-semibold border-none">
                      {selectedTier.name}
                    </Badge>
                  )}
                </div>
                {isPaidSelection ? (
                  <span className="text-xs font-bold text-white bg-[#184098] px-2.5 py-1 rounded">
                    ₦{unitPrice.toLocaleString()} / attendee
                  </span>
                ) : (
                  <span className="text-xs font-bold text-white bg-[#2E8B57] px-2.5 py-1 rounded">
                    Free Admission
                  </span>
                )}
              </div>

              <DialogTitle className="font-heading text-lg sm:text-xl font-black text-white leading-snug">
                {event.title}
              </DialogTitle>

              <div className="flex flex-wrap items-center gap-3 text-xs text-[#D9DEEC]">
                <span className="flex items-center gap-1">
                  <Calendar className="size-3 text-[#D9DEEC]" />
                  {eventDateStr}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <MapPin className="size-3 text-[#D9DEEC]" />
                  <span className="truncate max-w-[200px]">{event.venue}</span>
                </span>
              </div>
            </DialogHeader>

            {/* Registration Form */}
            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <input type="hidden" name="eventId" value={event.id} />

              {error && (
                <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-700">
                  {error}
                </div>
              )}

              {/* Ticket Tier Selector */}
              {hasTiers && (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="block text-xs font-bold text-[#151B2E]">
                      Select Admission / Ticket Tier{" "}
                      <span className="text-red-500">*</span>
                    </span>
                    <span className="text-[11px] text-muted-foreground">
                      {tiers.length} Tiers Available
                    </span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {tiers.map((tier) => {
                      const isSelected =
                        selectedTier?.id === tier.id ||
                        (!selectedTier && tier.id === tiers[0]?.id);
                      const isFree = Number(tier.price) === 0;
                      return (
                        <button
                          key={tier.id}
                          type="button"
                          onClick={() => setSelectedTier(tier)}
                          className={`p-3 rounded-lg border text-left transition-all relative cursor-pointer ${
                            isSelected
                              ? "border-[#184098] bg-[#EEF2FA] shadow-xs ring-2 ring-[#184098]"
                              : "border-[#D9DEEC] bg-white hover:border-[#184098]/40 hover:bg-[#F8FAFC]"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="font-heading text-xs font-bold text-[#151B2E] line-clamp-1">
                              {tier.name}
                            </span>
                            {tier.badge && (
                              <Badge
                                variant="outline"
                                className="text-[9px] px-1 py-0 h-4 border-amber-300 bg-amber-50 text-amber-800 shrink-0"
                              >
                                {tier.badge}
                              </Badge>
                            )}
                          </div>
                          <div className="flex items-baseline justify-between mt-1">
                            <span className="font-mono text-xs font-black text-[#184098]">
                              {isFree
                                ? "Free (₦0)"
                                : `₦${Number(tier.price).toLocaleString()}`}
                            </span>
                            {isSelected && (
                              <span className="text-[10px] font-bold text-[#184098]">
                                Selected ✓
                              </span>
                            )}
                          </div>
                          {tier.description && (
                            <p className="text-[10px] text-muted-foreground mt-1 line-clamp-2">
                              {tier.description}
                            </p>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Quantity selector for ticket if paid */}
              {isPaidSelection && (
                <div className="p-3.5 rounded-md bg-[#EEF2FA] border border-[#D9DEEC] flex items-center justify-between">
                  <div>
                    <label
                      htmlFor="quantity-select"
                      className="block text-xs font-bold text-[#151B2E]"
                    >
                      Number of Attendees / Tickets
                    </label>
                    <span className="text-[11px] text-[#5C6479]">
                      Registering multiple colleagues or staff?
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <select
                      id="quantity-select"
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="h-9 px-3 rounded border border-[#D9DEEC] bg-white text-xs font-bold text-[#151B2E]"
                    >
                      {[1, 2, 3, 4, 5, 6, 7, 8, 10].map((num) => (
                        <option key={num} value={num}>
                          {num} {num === 1 ? "Ticket" : "Tickets"}
                        </option>
                      ))}
                    </select>

                    <div className="text-right">
                      <span className="text-[10px] text-muted-foreground uppercase block font-semibold">
                        Total
                      </span>
                      <span className="text-sm font-black text-[#184098]">
                        ₦{totalAmount.toLocaleString()}
                      </span>
                    </div>
                  </div>
                </div>
              )}

              {/* Attendee Contact Information */}
              <div className="space-y-3">
                <div className="space-y-1">
                  <label
                    htmlFor="fullName"
                    className="block text-xs font-bold text-[#151B2E]"
                  >
                    Full Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="fullName"
                    name="fullName"
                    required
                    placeholder="e.g. Dr. Ngozi Adeleke"
                    className="h-10 border-[#D9DEEC] text-xs font-medium"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="email"
                      className="block text-xs font-bold text-[#151B2E]"
                    >
                      Email Address <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="email"
                      name="email"
                      type="email"
                      required
                      placeholder="e.g. ngozi@greensprings.edu.ng"
                      className="h-10 border-[#D9DEEC] text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="phone"
                      className="block text-xs font-bold text-[#151B2E]"
                    >
                      WhatsApp / Phone <span className="text-red-500">*</span>
                    </label>
                    <Input
                      id="phone"
                      name="phone"
                      type="tel"
                      required
                      placeholder="e.g. 0803 123 4567"
                      className="h-10 border-[#D9DEEC] text-xs font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label
                      htmlFor="schoolName"
                      className="block text-xs font-bold text-[#151B2E]"
                    >
                      School / Institution
                    </label>
                    <Input
                      id="schoolName"
                      name="schoolName"
                      placeholder="e.g. Brookstone School, PH"
                      className="h-10 border-[#D9DEEC] text-xs font-medium"
                    />
                  </div>

                  <div className="space-y-1">
                    <label
                      htmlFor="role"
                      className="block text-xs font-bold text-[#151B2E]"
                    >
                      Designation / Role
                    </label>
                    <Select
                      id="role"
                      name="role"
                      defaultValue="teacher"
                      className="h-10 border-[#D9DEEC] text-xs font-medium bg-white"
                    >
                      <option value="teacher">Classroom Teacher</option>
                      <option value="principal">Principal / Headteacher</option>
                      <option value="proprietor">Proprietor / Director</option>
                      <option value="parent">Parent</option>
                      <option value="partner">Education Stakeholder</option>
                      <option value="other">Other</option>
                    </Select>
                  </div>
                </div>

                <div className="space-y-1">
                  <label
                    htmlFor="notes"
                    className="block text-xs font-semibold text-muted-foreground"
                  >
                    Special Requests or Questions (Optional)
                  </label>
                  <Textarea
                    id="notes"
                    name="notes"
                    rows={2}
                    placeholder="Dietary requirements, accessibility, or specific questions for panelists..."
                    className="border-[#D9DEEC] text-xs font-sans resize-none"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-3 border-t border-[#D9DEEC]">
                <Button
                  type="submit"
                  disabled={isPending}
                  className="w-full h-11 bg-[#184098] hover:bg-[#15327A] text-white font-bold text-sm shadow-md transition-all flex items-center justify-center gap-2"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="size-4 animate-spin" />
                      <span>Saving Registration...</span>
                    </>
                  ) : event.isPaid ? (
                    <>
                      <CreditCard className="size-4" />
                      <span>Continue to Payment</span>
                    </>
                  ) : (
                    <>
                      <Ticket className="size-4" />
                      <span>Complete Free Registration</span>
                    </>
                  )}
                </Button>
                <p className="text-[11px] text-muted-foreground text-center mt-2">
                  Your information is kept secure and will only be used for
                  event logistics and updates.
                </p>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
