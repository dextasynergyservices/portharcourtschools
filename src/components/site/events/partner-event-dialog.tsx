"use client";

import { CheckCircle2, Handshake, Loader2, Send } from "lucide-react";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createEventPartnerInquiryAction } from "@/app/(public)/events/actions";
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
import { Textarea } from "@/components/ui/textarea";

interface PartnerEventDialogProps {
  children?: React.ReactNode;
  eventTitle?: string;
  triggerClassName?: string;
}

export function PartnerEventDialog({
  children,
  eventTitle = "The Teachers Spotlight Education Summit 2026",
  triggerClassName,
}: PartnerEventDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createEventPartnerInquiryAction(formData);
      if (res.error) {
        setError(res.error);
        toast.error("Inquiry failed", {
          description: res.error,
        });
      } else {
        setSubmitted(true);
        toast.success("Partnership inquiry received!", {
          description: "Our summit team will review and contact you shortly.",
        });
      }
    });
  };

  const handleOpenChange = (newOpen: boolean) => {
    setOpen(newOpen);
    if (!newOpen) {
      setTimeout(() => {
        setSubmitted(false);
        setError(null);
      }, 300);
    }
  };

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
              "bg-white text-[#184098] hover:bg-[#EEF2FA] hover:text-[#08276B] border border-white font-display font-bold text-xs uppercase tracking-wider px-4 h-11 shadow-xs transition-colors"
            }
          >
            <Handshake className="size-3.5 mr-1.5 text-[#184098]" />
            <span>Partner With This Event</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto sm:mx-0 flex size-10 items-center justify-center rounded-full bg-[#EEF2FA] text-[#184098] mb-1">
            <Handshake className="size-5 text-[#184098]" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-[#151B2E]">
            Partner With This Event
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Co-invest, sponsor, or exhibit at{" "}
            <span className="font-semibold text-[#151B2E]">{eventTitle}</span>.
            Connect directly with over 300+ school proprietors, principals, and
            educators across Rivers State.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#151B2E]">
              Partnership Inquiry Sent!
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Our partnerships team will reach out within 24 hours with our
              sponsor prospectus and exhibition options.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="mt-2 text-xs border-[#D9DEEC]"
            >
              Done
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="name"
                  className="block text-xs font-semibold text-[#151B2E]"
                >
                  Contact Person <span className="text-red-500">*</span>
                </label>
                <Input
                  id="name"
                  name="name"
                  required
                  placeholder="e.g. Dr. Jane Okon"
                  className="h-9 text-xs border-[#D9DEEC]"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="organization"
                  className="block text-xs font-semibold text-[#151B2E]"
                >
                  Company / Organization <span className="text-red-500">*</span>
                </label>
                <Input
                  id="organization"
                  name="organization"
                  required
                  placeholder="e.g. EdTech Solutions Africa"
                  className="h-9 text-xs border-[#D9DEEC]"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#151B2E]"
                >
                  Corporate Email <span className="text-red-500">*</span>
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  placeholder="partnerships@company.com"
                  className="h-9 text-xs border-[#D9DEEC]"
                />
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="phone"
                  className="block text-xs font-semibold text-[#151B2E]"
                >
                  Phone Number
                </label>
                <Input
                  id="phone"
                  name="phone"
                  placeholder="+234 800 000 0000"
                  className="h-9 text-xs border-[#D9DEEC]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label
                htmlFor="message"
                className="block text-xs font-semibold text-[#151B2E]"
              >
                Partnership Interest &amp; Goals{" "}
                <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="message"
                name="message"
                required
                rows={3}
                placeholder="Tell us whether you are interested in Keynote Sponsorship, Exhibition Booth, Teacher Awards Category Sponsor, or CSR Collaboration..."
                className="text-xs border-[#D9DEEC]"
              />
            </div>

            <div className="pt-3 flex items-center justify-end gap-2 border-t border-[#D9DEEC]">
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => setOpen(false)}
                className="h-9 text-xs border-[#D9DEEC]"
              >
                Cancel
              </Button>
              <Button
                type="submit"
                size="sm"
                disabled={isPending}
                className="h-9 text-xs bg-[#184098] hover:bg-[#08276B] text-white font-bold px-4"
              >
                {isPending ? (
                  <>
                    <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5 mr-1.5" />
                    Submit Inquiry
                  </>
                )}
              </Button>
            </div>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
