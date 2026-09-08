"use client";

import { Award, CheckCircle2, Loader2, Send } from "lucide-react";
import type React from "react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { createNominationAction } from "@/app/(public)/events/actions";
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

interface NominateTeacherDialogProps {
  children?: React.ReactNode;
  defaultCategory?: string;
  triggerClassName?: string;
}

export function NominateTeacherDialog({
  children,
  defaultCategory = "Excellence in Classroom Teaching",
  triggerClassName,
}: NominateTeacherDialogProps) {
  const [open, setOpen] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const formData = new FormData(e.currentTarget);

    startTransition(async () => {
      const res = await createNominationAction(formData);
      if (res.error) {
        setError(res.error);
        toast.error("Nomination failed", {
          description: res.error,
        });
      } else {
        setSubmitted(true);
        toast.success("Teacher nominated successfully!", {
          description:
            "Thank you for recognizing and celebrating educational excellence.",
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
              "cta-button outline border-white/30 text-white hover:bg-white hover:text-[#08276B] font-bold text-xs"
            }
          >
            <Award className="size-4 mr-2 text-[#FDDA32]" />
            <span>Nominate a Teacher</span>
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="mx-auto sm:mx-0 flex size-10 items-center justify-center rounded-full bg-[#EEF2FA] text-[#184098] mb-1">
            <Award className="size-5 text-[#184098]" />
          </div>
          <DialogTitle className="text-lg sm:text-xl font-bold font-heading text-[#151B2E]">
            Nominate an Outstanding Teacher
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            Classroom Champions Awards 2026 celebrates educators in Port
            Harcourt whose commitment inspires pupils, parents, and colleagues.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="py-8 text-center space-y-3">
            <div className="size-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
              <CheckCircle2 className="size-7" />
            </div>
            <h3 className="font-heading text-lg font-bold text-[#151B2E]">
              Nomination Received!
            </h3>
            <p className="text-xs text-muted-foreground max-w-sm mx-auto leading-relaxed">
              Thank you for recognizing teacher excellence in Rivers State. Our
              editorial screening team will review your submission ahead of the
              shortlist announcement.
            </p>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setOpen(false)}
              className="mt-2 text-xs border-[#D9DEEC]"
            >
              Close
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4 pt-1">
            {error && (
              <div className="p-3 rounded-md bg-red-50 border border-red-200 text-xs text-red-600">
                {error}
              </div>
            )}

            <div className="space-y-3">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#184098] border-b border-[#D9DEEC] pb-1">
                1. The Nominee
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="nomineeName"
                    className="block text-xs font-semibold text-[#151B2E]"
                  >
                    Teacher&apos;s Full Name{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="nomineeName"
                    name="nomineeName"
                    required
                    placeholder="e.g. Mrs. Chioma Amadi"
                    className="h-9 text-xs border-[#D9DEEC]"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="nomineeSchool"
                    className="block text-xs font-semibold text-[#151B2E]"
                  >
                    School in Port Harcourt{" "}
                    <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="nomineeSchool"
                    name="nomineeSchool"
                    required
                    placeholder="e.g. Greenoak International School"
                    className="h-9 text-xs border-[#D9DEEC]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="category"
                  className="block text-xs font-semibold text-[#151B2E]"
                >
                  Award Category <span className="text-red-500">*</span>
                </label>
                <Select
                  id="category"
                  name="category"
                  defaultValue={defaultCategory}
                  className="h-9 text-xs border-[#D9DEEC]"
                >
                  <option value="Excellence in Classroom Teaching">
                    Excellence in Classroom Teaching
                  </option>
                  <option value="STEM & Digital Innovation Champion">
                    STEM &amp; Digital Innovation Champion
                  </option>
                  <option value="Early Childhood & Foundational Literacy">
                    Early Childhood &amp; Foundational Literacy
                  </option>
                  <option value="Leadership & Educational Mentorship">
                    Leadership &amp; Educational Mentorship
                  </option>
                  <option value="Community Impact & Inclusion">
                    Community Impact &amp; Inclusion
                  </option>
                </Select>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="reason"
                  className="block text-xs font-semibold text-[#151B2E]"
                >
                  Why should this teacher be recognized?{" "}
                  <span className="text-red-500">*</span>
                </label>
                <Textarea
                  id="reason"
                  name="reason"
                  required
                  rows={3}
                  placeholder="Share a specific impact, breakthrough, or student story that demonstrates this educator's dedication..."
                  className="text-xs border-[#D9DEEC]"
                />
              </div>
            </div>

            <div className="space-y-3 pt-2">
              <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#184098] border-b border-[#D9DEEC] pb-1">
                2. Your Contact Information
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label
                    htmlFor="nominatorName"
                    className="block text-xs font-semibold text-[#151B2E]"
                  >
                    Your Name <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="nominatorName"
                    name="nominatorName"
                    required
                    placeholder="e.g. David Briggs"
                    className="h-9 text-xs border-[#D9DEEC]"
                  />
                </div>
                <div className="space-y-1">
                  <label
                    htmlFor="nominatorEmail"
                    className="block text-xs font-semibold text-[#151B2E]"
                  >
                    Your Email <span className="text-red-500">*</span>
                  </label>
                  <Input
                    id="nominatorEmail"
                    name="nominatorEmail"
                    type="email"
                    required
                    placeholder="name@example.com"
                    className="h-9 text-xs border-[#D9DEEC]"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label
                  htmlFor="nominatorPhone"
                  className="block text-xs font-semibold text-[#151B2E]"
                >
                  Phone / WhatsApp (Optional)
                </label>
                <Input
                  id="nominatorPhone"
                  name="nominatorPhone"
                  placeholder="+234 800 000 0000"
                  className="h-9 text-xs border-[#D9DEEC]"
                />
              </div>
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
                    Submitting...
                  </>
                ) : (
                  <>
                    <Send className="size-3.5 mr-1.5" />
                    Submit Nomination
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
