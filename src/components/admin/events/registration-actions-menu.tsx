"use client";

import { Menu } from "@base-ui/react/menu";
import {
  Check,
  CheckCircle2,
  Clock,
  Copy,
  Eye,
  Loader2,
  Mail,
  MessageCircle,
  MoreVertical,
  School,
  Ticket,
  Trash2,
  XCircle,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteEventRegistrationAction,
  updateEventRegistrationStatusAction,
} from "@/app/(admin)/admin/events/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface RegistrationItemData {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  schoolName: string | null;
  role: string;
  ticketQuantity: number;
  ticketTierName?: string | null;
  ticketTierPrice?: number | null;
  totalAmount: number;
  status: "pending_payment" | "confirmed" | "cancelled";
  notes: string | null;
  createdAt: Date | string;
  event?: {
    id: string;
    title: string;
    slug: string;
    type: string;
    isPaid: boolean;
    price: number | null;
    startDate: Date | string;
  } | null;
}

interface RegistrationActionsMenuProps {
  registration: RegistrationItemData;
}

export function RegistrationActionsMenu({
  registration,
}: RegistrationActionsMenuProps) {
  const router = useRouter();
  const [detailsOpen, setDetailsOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    toast.success(`${field} copied to clipboard`);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const handleStatusChange = (
    newStatus: "pending_payment" | "confirmed" | "cancelled",
  ) => {
    setError(null);
    startTransition(async () => {
      const res = await updateEventRegistrationStatusAction(
        registration.id,
        newStatus,
      );
      if (res.error) {
        setError(res.error);
        toast.error("Failed to update status", { description: res.error });
      } else {
        toast.success(
          `Registration status updated to ${newStatus.replace("_", " ")}`,
        );
        router.refresh();
      }
    });
  };

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteEventRegistrationAction(registration.id);
      if (res.error) {
        setError(res.error);
        toast.error("Failed to delete registration", {
          description: res.error,
        });
      } else {
        setDeleteOpen(false);
        toast.success("Registration record deleted");
        router.refresh();
      }
    });
  };

  // Clean phone for WhatsApp link
  const rawDigits = registration.phone.replace(/[^0-9]/g, "");
  const whatsappNumber = rawDigits.startsWith("0")
    ? `234${rawDigits.slice(1)}`
    : rawDigits.startsWith("234")
      ? rawDigits
      : `234${rawDigits}`;

  const createdDateStr = new Date(registration.createdAt).toLocaleString(
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
    <>
      <Menu.Root>
        <Menu.Trigger
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-[4px] text-muted-foreground hover:text-[#184098] hover:bg-[#EEF2FA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#184098]/30"
          aria-label="Registration actions"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-[#184098]" />
          ) : (
            <MoreVertical className="size-4" />
          )}
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner
            side="bottom"
            align="end"
            sideOffset={4}
            className="z-50"
          >
            <Menu.Popup className="min-w-[190px] rounded-md border border-[#D9DEEC] bg-white p-1.5 shadow-xl text-xs outline-none animate-in fade-in zoom-in-95">
              {/* View Full Details */}
              <Menu.Item
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                onClick={() => setDetailsOpen(true)}
              >
                <Eye className="size-3.5 text-muted-foreground" />
                <span>View Full Details</span>
              </Menu.Item>

              {/* Status toggles */}
              {registration.status !== "confirmed" && (
                <Menu.Item
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded text-emerald-700 hover:bg-emerald-50 cursor-pointer outline-none select-none transition-colors font-medium"
                  onClick={() => handleStatusChange("confirmed")}
                >
                  <CheckCircle2 className="size-3.5 text-emerald-600" />
                  <span>Mark as Confirmed / Paid</span>
                </Menu.Item>
              )}

              {registration.status !== "pending_payment" && (
                <Menu.Item
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded text-amber-700 hover:bg-amber-50 cursor-pointer outline-none select-none transition-colors font-medium"
                  onClick={() => handleStatusChange("pending_payment")}
                >
                  <Clock className="size-3.5 text-amber-600" />
                  <span>Mark as Pending Payment</span>
                </Menu.Item>
              )}

              {registration.status !== "cancelled" && (
                <Menu.Item
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded text-gray-700 hover:bg-gray-100 cursor-pointer outline-none select-none transition-colors"
                  onClick={() => handleStatusChange("cancelled")}
                >
                  <XCircle className="size-3.5 text-gray-500" />
                  <span>Cancel Registration</span>
                </Menu.Item>
              )}

              <Menu.Separator className="my-1 h-px bg-[#D9DEEC]" />

              {/* Contact actions */}
              <Menu.Item
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                onClick={() =>
                  window.open(`mailto:${registration.email}`, "_blank")
                }
              >
                <Mail className="size-3.5 text-muted-foreground" />
                <span>Email Attendee</span>
              </Menu.Item>

              <Menu.Item
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[#151B2E] hover:bg-emerald-50 hover:text-emerald-700 cursor-pointer outline-none select-none transition-colors"
                onClick={() =>
                  window.open(
                    `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(`Hello ${registration.fullName}, regarding your registration for ${registration.event?.title || "our event"} on PortHarcourtSchools:`)}`,
                    "_blank",
                  )
                }
              >
                <MessageCircle className="size-3.5 text-emerald-600" />
                <span>Message on WhatsApp</span>
              </Menu.Item>

              <Menu.Separator className="my-1 h-px bg-[#D9DEEC]" />

              {/* Delete */}
              <Menu.Item
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-red-600 hover:bg-red-50 cursor-pointer outline-none select-none transition-colors font-medium"
                onClick={() => setDeleteOpen(true)}
              >
                <Trash2 className="size-3.5 text-red-600" />
                <span>Delete Registration</span>
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* View Details Dialog */}
      <Dialog open={detailsOpen} onOpenChange={setDetailsOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <div className="flex items-center justify-between gap-2 pr-6">
              <div className="flex items-center gap-2">
                <div className="size-9 rounded-full bg-[#184098]/10 text-[#184098] flex items-center justify-center font-bold text-sm">
                  {registration.fullName
                    .split(" ")
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join("")
                    .toUpperCase()}
                </div>
                <div>
                  <DialogTitle className="text-base sm:text-lg font-bold text-[#151B2E]">
                    {registration.fullName}
                  </DialogTitle>
                  <p className="text-xs text-muted-foreground capitalize">
                    {registration.role.replace("_", " ")}
                  </p>
                </div>
              </div>

              <Badge
                variant={
                  registration.status === "confirmed"
                    ? "success"
                    : registration.status === "pending_payment"
                      ? "amber"
                      : "outline"
                }
                className="text-[10px] uppercase font-bold"
              >
                {registration.status.replace("_", " ")}
              </Badge>
            </div>
            <DialogDescription className="text-xs text-muted-foreground pt-1">
              Registered on {createdDateStr}
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Event Info */}
            {registration.event && (
              <div className="p-3 rounded-lg bg-[#FAFBFF] border border-[#D9DEEC] space-y-1.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Registered Event
                </span>
                <div className="flex items-center justify-between gap-2">
                  <span className="font-bold text-sm text-[#184098]">
                    {registration.event.title}
                  </span>
                  <Badge
                    variant="outline"
                    className="text-[10px] uppercase font-bold border-[#D9DEEC] bg-white text-[#184098]"
                  >
                    {registration.event.type}
                  </Badge>
                </div>
                <div className="text-[11px] text-muted-foreground flex items-center justify-between">
                  <span>
                    {new Date(registration.event.startDate).toLocaleDateString(
                      "en-GB",
                      { day: "numeric", month: "short", year: "numeric" },
                    )}
                  </span>
                  <span>
                    {registration.event.isPaid && registration.event.price
                      ? `₦${registration.event.price.toLocaleString()} / ticket`
                      : "Free Admission"}
                  </span>
                </div>
              </div>
            )}

            {/* School / Institution */}
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 rounded-lg border border-[#D9DEEC] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <School className="size-3 text-[#184098]" />
                  School / Organization
                </span>
                <p className="font-medium text-[#151B2E] text-xs">
                  {registration.schoolName || "Not specified"}
                </p>
              </div>

              <div className="p-3 rounded-lg border border-[#D9DEEC] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
                  <Ticket className="size-3 text-[#184098]" />
                  Tickets &amp; Total
                </span>
                <p className="font-bold text-[#151B2E] text-xs">
                  {registration.ticketQuantity}{" "}
                  {registration.ticketQuantity === 1 ? "ticket" : "tickets"} •{" "}
                  {registration.totalAmount > 0
                    ? `₦${registration.totalAmount.toLocaleString()}`
                    : "Free"}
                </p>
              </div>
            </div>

            {/* Contact Details */}
            <div className="p-3 rounded-lg border border-[#D9DEEC] space-y-2">
              <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                Contact Channels
              </span>

              <div className="flex items-center justify-between gap-2">
                <a
                  href={`mailto:${registration.email}`}
                  className="flex items-center gap-2 text-[#184098] hover:underline font-medium"
                >
                  <Mail className="size-3.5" />
                  <span>{registration.email}</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(registration.email, "email")}
                  className="text-muted-foreground hover:text-[#184098] p-1 rounded transition-colors"
                  title="Copy email"
                >
                  {copiedField === "email" ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>

              <div className="flex items-center justify-between gap-2 pt-1 border-t border-[#D9DEEC]/60">
                <a
                  href={`https://wa.me/${whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-2 text-emerald-700 hover:underline font-medium"
                >
                  <MessageCircle className="size-3.5 text-emerald-600" />
                  <span>{registration.phone} (WhatsApp)</span>
                </a>
                <button
                  type="button"
                  onClick={() => handleCopy(registration.phone, "phone")}
                  className="text-muted-foreground hover:text-[#184098] p-1 rounded transition-colors"
                  title="Copy phone"
                >
                  {copiedField === "phone" ? (
                    <Check className="size-3.5 text-emerald-600" />
                  ) : (
                    <Copy className="size-3.5" />
                  )}
                </button>
              </div>
            </div>

            {/* Notes / Special Requests */}
            {registration.notes && (
              <div className="p-3 rounded-lg border border-[#D9DEEC] space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  Attendee Notes / Special Requests
                </span>
                <p className="text-[#151B2E] italic bg-[#FAFBFF] p-2 rounded border border-[#D9DEEC]/60">
                  &ldquo;{registration.notes}&rdquo;
                </p>
              </div>
            )}
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2 border-t border-[#D9DEEC] pt-3">
            <div className="flex items-center gap-2 mr-auto">
              {registration.status !== "confirmed" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleStatusChange("confirmed");
                    setDetailsOpen(false);
                  }}
                  className="text-xs border-emerald-300 text-emerald-700 hover:bg-emerald-50"
                >
                  <CheckCircle2 className="size-3.5 mr-1 text-emerald-600" />
                  Confirm
                </Button>
              )}
              {registration.status !== "pending_payment" && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => {
                    handleStatusChange("pending_payment");
                    setDetailsOpen(false);
                  }}
                  className="text-xs border-amber-300 text-amber-700 hover:bg-amber-50"
                >
                  <Clock className="size-3.5 mr-1 text-amber-600" />
                  Set Pending
                </Button>
              )}
            </div>

            <Button
              size="sm"
              variant="outline"
              onClick={() => setDetailsOpen(false)}
              className="text-xs border-[#D9DEEC]"
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto sm:mx-0 flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
              <Trash2 className="size-5" />
            </div>
            <DialogTitle className="text-base sm:text-lg">
              Delete Registration
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Are you sure you want to remove the registration for{" "}
              <span className="font-semibold text-[#151B2E]">
                {registration.fullName}
              </span>
              ? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <DialogFooter className="mt-2 sm:mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setDeleteOpen(false)}
              className="h-9 text-xs border-[#D9DEEC]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
              className="h-9 text-xs font-bold"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Registration"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
