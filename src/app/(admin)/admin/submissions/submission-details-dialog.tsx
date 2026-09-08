"use client";

import {
  Archive,
  CheckCircle2,
  Clock,
  Eye,
  Mail,
  MessageSquare,
  Phone,
  Trash2,
} from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { ContactSubmission } from "@/lib/db";
import {
  deleteSubmissionAction,
  updateSubmissionStatusAction,
} from "./actions";

interface SubmissionDetailsDialogProps {
  submission: ContactSubmission;
  onUpdated?: () => void;
  trigger?: React.ReactNode;
}

const PERSONA_LABELS: Record<string, { label: string; color: string }> = {
  parent: {
    label: "Parent / Guardian",
    color: "bg-blue-50 text-blue-700 border-blue-200",
  },
  teacher: {
    label: "Educator / Teacher",
    color: "bg-indigo-50 text-indigo-700 border-indigo-200",
  },
  school: {
    label: "School Leader",
    color: "bg-emerald-50 text-emerald-700 border-emerald-200",
  },
  partner: {
    label: "Partner / Sponsor",
    color: "bg-amber-50 text-amber-800 border-amber-200",
  },
  other: {
    label: "General Inquiry",
    color: "bg-slate-100 text-slate-700 border-slate-200",
  },
};

export function SubmissionDetailsDialog({
  submission,
  onUpdated,
  trigger,
}: SubmissionDetailsDialogProps) {
  const [open, setOpen] = useState(false);
  const [isPending, startTransition] = useTransition();

  const personaMeta =
    PERSONA_LABELS[submission.personaType] || PERSONA_LABELS.other;

  const handleStatusChange = (status: "new" | "read" | "archived") => {
    startTransition(async () => {
      await updateSubmissionStatusAction(submission.id, status);
      toast.success(`Submission marked as ${status}`);
      onUpdated?.();
    });
  };

  const handleDelete = () => {
    if (
      !confirm("Are you sure you want to permanently delete this submission?")
    ) {
      return;
    }
    startTransition(async () => {
      await deleteSubmissionAction(submission.id);
      toast.success("Submission deleted");
      setOpen(false);
      onUpdated?.();
    });
  };

  // Format Nigerian phone number for WhatsApp
  const cleanPhone = submission.phone?.replace(/[^0-9]/g, "") || "";
  let waNumber = cleanPhone;
  if (cleanPhone.startsWith("0")) {
    waNumber = `234${cleanPhone.slice(1)}`;
  } else if (!cleanPhone.startsWith("234") && cleanPhone.length === 10) {
    waNumber = `234${cleanPhone}`;
  }

  const formattedDate = new Date(submission.createdAt).toLocaleDateString(
    "en-GB",
    {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        // Automatically mark as read if it was new
        if (next && submission.status === "new") {
          startTransition(async () => {
            await updateSubmissionStatusAction(submission.id, "read");
            onUpdated?.();
          });
        }
      }}
    >
      <DialogTrigger asChild>
        {trigger ? (
          trigger
        ) : (
          <Button
            variant="ghost"
            size="sm"
            className="h-8 px-2 text-xs text-[#184098] hover:bg-[#EEF2FA]"
          >
            <Eye className="size-3.5 mr-1" />
            View
          </Button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2 border-b border-border/40 pb-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <Badge
              variant="outline"
              className={`text-[11px] font-semibold uppercase tracking-wider ${personaMeta.color}`}
            >
              {personaMeta.label}
            </Badge>

            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <Clock className="size-3.5" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <DialogTitle className="text-xl font-bold font-heading text-[#151B2E]">
            {submission.subject || "General Inquiry"}
          </DialogTitle>
          <DialogDescription className="text-xs text-muted-foreground">
            Submission ID: <span className="font-mono">{submission.id}</span>
          </DialogDescription>
        </DialogHeader>

        {/* Sender details */}
        <div className="py-2 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-muted/40 rounded-lg border border-border/50 text-xs">
            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold tracking-wider">
                Full Name
              </span>
              <span className="font-bold text-[#151B2E] text-sm">
                {submission.name}
              </span>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold tracking-wider">
                Email Address
              </span>
              <a
                href={`mailto:${submission.email}`}
                className="text-[#184098] hover:underline font-medium break-all"
              >
                {submission.email}
              </a>
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold tracking-wider">
                Phone Number
              </span>
              {submission.phone ? (
                <a
                  href={`tel:${submission.phone}`}
                  className="text-[#151B2E] hover:underline font-medium"
                >
                  {submission.phone}
                </a>
              ) : (
                <span className="text-muted-foreground italic">
                  Not provided
                </span>
              )}
            </div>

            <div>
              <span className="text-muted-foreground block text-[10px] uppercase font-semibold tracking-wider">
                Status
              </span>
              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                  submission.status === "new"
                    ? "bg-blue-100 text-blue-800 font-extrabold"
                    : submission.status === "read"
                      ? "bg-slate-100 text-slate-700"
                      : "bg-zinc-100 text-zinc-600"
                }`}
              >
                {submission.status}
              </span>
            </div>
          </div>

          {/* Full Message Body */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
              Message Content
            </span>
            <div className="p-4 rounded-lg bg-card border border-border/60 text-xs sm:text-sm text-[#151B2E] leading-relaxed whitespace-pre-wrap font-sans">
              {submission.message}
            </div>
          </div>

          {/* Quick Communication Actions */}
          <div className="space-y-2 pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
              Quick Actions
            </span>
            <div className="flex flex-wrap items-center gap-2">
              <a
                href={`mailto:${submission.email}?subject=${encodeURIComponent(
                  `Re: ${submission.subject || "Inquiry at PortHarcourtSchools"}`,
                )}`}
                className="inline-flex items-center justify-center rounded-md px-3 h-9 text-xs bg-[#184098] hover:bg-[#08276B] text-white font-bold transition-colors"
              >
                <Mail className="size-3.5 mr-1.5" />
                Reply via Email
              </a>

              {submission.phone && waNumber && (
                <a
                  href={`https://wa.me/${waNumber}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center justify-center rounded-md px-3 h-9 text-xs border border-emerald-300 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 hover:text-emerald-800 font-bold transition-colors"
                >
                  <MessageSquare className="size-3.5 mr-1.5" />
                  WhatsApp
                </a>
              )}

              {submission.phone && (
                <a
                  href={`tel:${submission.phone}`}
                  className="inline-flex items-center justify-center rounded-md px-3 h-9 text-xs border border-[#D9DEEC] bg-white text-[#151B2E] hover:bg-muted font-medium transition-colors"
                >
                  <Phone className="size-3.5 mr-1.5" />
                  Call
                </a>
              )}
            </div>
          </div>
        </div>

        {/* Footer controls: Status and Delete */}
        <DialogFooter className="flex-col sm:flex-row sm:justify-between items-stretch sm:items-center gap-2 border-t border-border/40 pt-4 mt-2">
          <div className="flex items-center gap-1.5">
            <span className="text-[11px] text-muted-foreground mr-1">
              Mark as:
            </span>
            <Button
              type="button"
              variant={submission.status === "new" ? "secondary" : "outline"}
              size="sm"
              disabled={isPending || submission.status === "new"}
              onClick={() => handleStatusChange("new")}
              className="h-7 px-2.5 text-[11px]"
            >
              New
            </Button>
            <Button
              type="button"
              variant={submission.status === "read" ? "secondary" : "outline"}
              size="sm"
              disabled={isPending || submission.status === "read"}
              onClick={() => handleStatusChange("read")}
              className="h-7 px-2.5 text-[11px]"
            >
              <CheckCircle2 className="size-3 mr-1" />
              Read
            </Button>
            <Button
              type="button"
              variant={
                submission.status === "archived" ? "secondary" : "outline"
              }
              size="sm"
              disabled={isPending || submission.status === "archived"}
              onClick={() => handleStatusChange("archived")}
              className="h-7 px-2.5 text-[11px]"
            >
              <Archive className="size-3 mr-1" />
              Archived
            </Button>
          </div>

          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={isPending}
            onClick={handleDelete}
            className="h-8 text-xs text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="size-3.5 mr-1" />
            Delete
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
