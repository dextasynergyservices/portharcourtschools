"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Eye,
  Globe,
  GripVertical,
  Layers,
  ListPlus,
  Loader2,
  MapPin,
  Plus,
  Save,
  Send,
  Star,
  Trash2,
  XCircle,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState, useTransition } from "react";
import { toast } from "sonner";
import { SectionImageUpload } from "@/components/admin/media/section-image-upload";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import type { TicketTier } from "@/lib/db/schema";
import {
  checkEventSlugAvailabilityAction,
  createEventAction,
  updateEventAction,
} from "./actions";

interface EventFormProps {
  initialData?: {
    id: string;
    title: string;
    slug: string;
    description: string;
    type: "summit" | "masterclass" | "workshop" | "awards";
    startDate: Date;
    endDate?: Date | null;
    venue: string;
    coverImage?: string | null;
    isFeatured?: boolean;
    isPaid: boolean;
    price?: number | null;
    paymentLink?: string | null;
    ticketTiers?: TicketTier[] | null;
    status: "draft" | "in_review" | "published" | "archived";
  };
  userRole: string;
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function formatDateForInput(date?: Date | null): string {
  if (!date) return "";
  const d = new Date(date);
  const pad = (n: number) => n.toString().padStart(2, "0");
  const year = d.getFullYear();
  const month = pad(d.getMonth() + 1);
  const day = pad(d.getDate());
  const hours = pad(d.getHours());
  const minutes = pad(d.getMinutes());
  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

interface TierBenefitsEditorProps {
  tierIndex: number;
  benefits: string[];
  onChange: (benefits: string[]) => void;
}

function TierBenefitsEditor({
  tierIndex,
  benefits = [],
  onChange,
}: TierBenefitsEditorProps) {
  const [inputValue, setInputValue] = useState("");
  const [isBulkMode, setIsBulkMode] = useState(false);
  const [bulkText, setBulkText] = useState("");
  const [draggedBenefitIndex, setDraggedBenefitIndex] = useState<number | null>(
    null,
  );

  const handleMoveBenefit = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= benefits.length) return;
    const copy = [...benefits];
    const [moved] = copy.splice(fromIndex, 1);
    copy.splice(toIndex, 0, moved);
    onChange(copy);
  };

  const handleAdd = () => {
    const trimmed = inputValue.trim();
    if (!trimmed) return;
    const newItems = trimmed
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
    onChange([...benefits, ...newItems]);
    setInputValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      e.stopPropagation();
      handleAdd();
    }
  };

  const handleUpdateItem = (index: number, value: string) => {
    const copy = [...benefits];
    copy[index] = value;
    onChange(copy);
  };

  const handleRemoveItem = (index: number) => {
    onChange(benefits.filter((_, i) => i !== index));
  };

  const handleSwitchToBulk = () => {
    setBulkText(benefits.join("\n"));
    setIsBulkMode(true);
  };

  const handleApplyBulk = () => {
    const parsed = bulkText
      .split("\n")
      .map((b) => b.trim())
      .filter(Boolean);
    onChange(parsed);
    setIsBulkMode(false);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label
          htmlFor={`tier-benefit-input-${tierIndex}`}
          className="block text-[11px] font-bold text-[#151B2E]"
        >
          Benefits &amp; Inclusions{" "}
          <span className="text-[#55627D] font-normal">
            ({benefits.length} {benefits.length === 1 ? "perk" : "perks"})
          </span>
        </label>
        <button
          type="button"
          onClick={() => {
            if (isBulkMode) {
              handleApplyBulk();
            } else {
              handleSwitchToBulk();
            }
          }}
          className="text-[10px] font-semibold text-[#003cb8] hover:underline cursor-pointer"
        >
          {isBulkMode
            ? "Back to individual view"
            : "Paste multiple / Text mode"}
        </button>
      </div>

      {isBulkMode ? (
        <div className="space-y-1.5">
          <Textarea
            rows={4}
            value={bulkText}
            onChange={(e) => setBulkText(e.target.value)}
            placeholder="Type or paste perks, one per line (press Enter or Shift+Enter for new line)..."
            className="text-xs border-[#D9DEEC] font-sans"
          />
          <div className="flex items-center justify-between">
            <span className="text-[10px] text-[#55627D]">
              Press Enter for each new perk line. Click Done when finished.
            </span>
            <Button
              type="button"
              size="sm"
              onClick={handleApplyBulk}
              className="h-7 text-xs bg-[#003cb8] hover:bg-[#002c8c] text-white"
            >
              Done Editing
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          {benefits.length > 0 && (
            <div className="space-y-1.5 max-h-56 overflow-y-auto pr-1">
              {benefits.map((benefit, bIdx) => (
                // biome-ignore lint/a11y/noStaticElementInteractions: drag and drop item
                <div
                  // biome-ignore lint/suspicious/noArrayIndexKey: benefits are primitive strings without IDs
                  key={`b-${tierIndex}-${bIdx}`}
                  draggable={true}
                  onDragStart={(e) => {
                    const target = e.target as HTMLElement;
                    if (
                      target.tagName === "INPUT" ||
                      target.tagName === "BUTTON" ||
                      target.closest("button")
                    ) {
                      e.preventDefault();
                      return;
                    }
                    setDraggedBenefitIndex(bIdx);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (
                      draggedBenefitIndex !== null &&
                      draggedBenefitIndex !== bIdx
                    ) {
                      handleMoveBenefit(draggedBenefitIndex, bIdx);
                    }
                    setDraggedBenefitIndex(null);
                  }}
                  onDragEnd={() => setDraggedBenefitIndex(null)}
                  className={`flex items-center gap-1.5 bg-[#F8FAFC] border rounded-md px-2 py-1 transition-all ${
                    draggedBenefitIndex === bIdx
                      ? "opacity-50 border-dashed border-[#003cb8] bg-[#EEF2FA]"
                      : "border-[#D9DEEC] focus-within:border-[#003cb8]"
                  }`}
                >
                  <span
                    title="Drag to reorder perk"
                    className="cursor-grab active:cursor-grabbing text-[#55627D] hover:text-[#003cb8] p-0.5 shrink-0 select-none"
                  >
                    <GripVertical className="size-3 text-[#8A94A6]" />
                  </span>
                  <CheckCircle2 className="size-3.5 text-emerald-600 shrink-0" />
                  <input
                    type="text"
                    value={benefit}
                    onChange={(e) => handleUpdateItem(bIdx, e.target.value)}
                    className="flex-1 bg-transparent text-xs text-[#151B2E] border-none focus:outline-hidden py-0.5"
                    placeholder="Benefit description"
                  />
                  <div className="flex items-center gap-0.5 shrink-0">
                    <button
                      type="button"
                      disabled={bIdx === 0}
                      onClick={() => handleMoveBenefit(bIdx, bIdx - 1)}
                      title="Move perk up"
                      className="size-5 rounded flex items-center justify-center text-[#55627D] hover:text-[#003cb8] hover:bg-[#EEF2FA] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ChevronUp className="size-3" />
                    </button>
                    <button
                      type="button"
                      disabled={bIdx === benefits.length - 1}
                      onClick={() => handleMoveBenefit(bIdx, bIdx + 1)}
                      title="Move perk down"
                      className="size-5 rounded flex items-center justify-center text-[#55627D] hover:text-[#003cb8] hover:bg-[#EEF2FA] disabled:opacity-25 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      <ChevronDown className="size-3" />
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleRemoveItem(bIdx)}
                    title="Remove benefit"
                    className="size-5 rounded flex items-center justify-center text-[#55627D] hover:text-red-600 hover:bg-red-50 transition-colors shrink-0 cursor-pointer"
                  >
                    <Trash2 className="size-3" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Add input */}
          <div className="flex items-center gap-1.5">
            <Input
              id={`tier-benefit-input-${tierIndex}`}
              type="text"
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Add perk (e.g. TRCN CPD certificate) & press Enter"
              className="h-8 text-xs border-[#D9DEEC] flex-1"
            />
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={handleAdd}
              disabled={!inputValue.trim()}
              className="h-8 px-2.5 text-xs font-semibold border-[#D9DEEC] shrink-0 text-[#003cb8] hover:bg-[#003cb8]/5"
            >
              <Plus className="size-3.5 mr-1" />
              Add Perk
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

export function EventForm({ initialData, userRole }: EventFormProps) {
  const router = useRouter();
  const isEditing = !!initialData;

  const [title, setTitle] = useState(initialData?.title || "");
  const [slug, setSlug] = useState(initialData?.slug || "");
  const [isCustomSlug, setIsCustomSlug] = useState(!!initialData);
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [type, setType] = useState<
    "summit" | "masterclass" | "workshop" | "awards"
  >(initialData?.type || "summit");
  const [startDate, setStartDate] = useState(
    formatDateForInput(initialData?.startDate),
  );
  const [endDate, setEndDate] = useState(
    formatDateForInput(initialData?.endDate),
  );
  const [venue, setVenue] = useState(initialData?.venue || "");
  const [coverImage, setCoverImage] = useState(initialData?.coverImage || "");
  const [isFeatured, setIsFeatured] = useState(
    initialData?.isFeatured || false,
  );
  const [isPaid, setIsPaid] = useState(initialData?.isPaid || false);
  const [price, setPrice] = useState(
    initialData?.price !== undefined && initialData?.price !== null
      ? String(initialData.price)
      : "",
  );
  const [paymentLink, setPaymentLink] = useState(
    initialData?.paymentLink || "",
  );
  const [status] = useState<"draft" | "in_review" | "published" | "archived">(
    initialData?.status || "draft",
  );

  const DEFAULT_4_TIERS: TicketTier[] = [
    {
      id: "free",
      name: "Free / Access ticket",
      price: 0,
      description: "General access to plenary sessions and exhibition area.",
      benefits: [
        "Access to plenary sessions",
        "General exhibition floor access",
        "Digital event guide",
      ],
      isAvailable: true,
    },
    {
      id: "standard",
      name: "Standard ticket",
      price: 15000,
      description: "Standard summit entry with certified attendance kit.",
      benefits: [
        "Full event access",
        "Delegate welcome pack",
        "TRCN-certified CPD certificate",
        "Standard seating",
      ],
      isAvailable: true,
    },
    {
      id: "premium",
      name: "Premium ticket",
      price: 50000,
      description: "VIP experience with networking executive lunch.",
      benefits: [
        "Reserved front-row seating",
        "Executive luncheon & lounge access",
        "Private masterclass entry",
        "Physical framed certificate",
      ],
      isAvailable: true,
    },
    {
      id: "partner",
      name: "Partner / Sponsor offer",
      price: 250000,
      description: "Corporate branding and exhibition stand space.",
      benefits: [
        "Dedicated exhibition booth space",
        "Logo on summit backdrops and site",
        "Stage acknowledgement",
        "5 VIP all-access passes",
      ],
      isAvailable: true,
    },
  ];

  const [ticketTiers, setTicketTiers] = useState<TicketTier[]>(
    initialData?.ticketTiers &&
      Array.isArray(initialData.ticketTiers) &&
      initialData.ticketTiers.length > 0
      ? initialData.ticketTiers
      : [],
  );

  const handleAddTier = () => {
    const newTier: TicketTier = {
      id: `tier_${Date.now()}`,
      name: "",
      price: 0,
      badge: "",
      description: "",
      benefits: [],
      paymentLink: "",
      isAvailable: true,
    };
    setTicketTiers((prev) => [...prev, newTier]);
  };

  const handleLoadDefaultTiers = () => {
    setTicketTiers(DEFAULT_4_TIERS);
    toast.info("Loaded 4 standard ticket tiers preset");
  };

  const handleUpdateTier = <K extends keyof TicketTier>(
    index: number,
    field: K,
    value: TicketTier[K],
  ) => {
    setTicketTiers((prev) => {
      const copy = [...prev];
      copy[index] = { ...copy[index], [field]: value };
      return copy;
    });
  };

  const handleDeleteTier = (index: number) => {
    setTicketTiers((prev) => prev.filter((_, i) => i !== index));
  };

  const [draggedTierIndex, setDraggedTierIndex] = useState<number | null>(null);

  const handleMoveTier = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= ticketTiers.length) return;
    setTicketTiers((prev) => {
      const copy = [...prev];
      const [moved] = copy.splice(fromIndex, 1);
      copy.splice(toIndex, 0, moved);
      return copy;
    });
  };

  // Slug availability state
  const [slugChecking, setSlugChecking] = useState(false);
  const [slugAvailable, setSlugAvailable] = useState<boolean | null>(null);

  const [error, setError] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();

  // Debounced slug uniqueness check
  useEffect(() => {
    if (!slug || slug.length < 3) {
      setSlugAvailable(null);
      return;
    }

    if (isEditing && slug === initialData?.slug) {
      setSlugAvailable(true);
      return;
    }

    setSlugChecking(true);
    const timeoutId = setTimeout(async () => {
      try {
        const res = await checkEventSlugAvailabilityAction(
          slug,
          initialData?.id,
        );
        setSlugAvailable(res.available);
      } catch {
        setSlugAvailable(null);
      } finally {
        setSlugChecking(false);
      }
    }, 350);

    return () => clearTimeout(timeoutId);
  }, [slug, initialData?.id, initialData?.slug, isEditing]);

  const handleTitleChange = (val: string) => {
    setTitle(val);
    if (!isCustomSlug) {
      setSlug(slugify(val));
    }
  };

  const handleSubmit = (
    targetStatus: "draft" | "in_review" | "published" | "archived",
  ) => {
    setError(null);

    if (slugAvailable === false) {
      setError("Please choose a unique URL slug before saving.");
      return;
    }

    const formData = new FormData();
    formData.set("title", title);
    formData.set("slug", slug || slugify(title));
    formData.set("description", description);
    formData.set("type", type);
    formData.set("startDate", startDate);
    formData.set("endDate", endDate);
    formData.set("venue", venue);
    formData.set("coverImage", coverImage);
    formData.set("isFeatured", isFeatured ? "true" : "false");

    if (ticketTiers.length > 0) {
      const hasPaid = ticketTiers.some((t) => Number(t.price) > 0);
      const paidTiers = ticketTiers.filter((t) => Number(t.price) > 0);
      const minPrice =
        paidTiers.length > 0
          ? Math.min(...paidTiers.map((t) => Number(t.price)))
          : 0;
      formData.set("isPaid", hasPaid ? "true" : "false");
      formData.set("price", hasPaid ? String(minPrice) : "0");
      const firstPaidLink =
        ticketTiers.find((t) => t.paymentLink)?.paymentLink || paymentLink;
      formData.set("paymentLink", firstPaidLink || "");
    } else {
      formData.set("isPaid", isPaid ? "true" : "false");
      formData.set("price", price);
      formData.set("paymentLink", paymentLink);
    }
    formData.set("ticketTiers", JSON.stringify(ticketTiers));
    formData.set("status", targetStatus);

    startTransition(async () => {
      const action = isEditing
        ? updateEventAction(initialData.id, {}, formData)
        : createEventAction({}, formData);

      const res = await action;

      if (res?.error) {
        setError(res.error);
        toast.error("Failed to save event", { description: res.error });
      } else {
        toast.success(
          isEditing
            ? "Event updated successfully"
            : "Event created successfully",
        );
        router.push("/admin/events");
        router.refresh();
      }
    });
  };

  const isCreator = userRole === "creator";

  return (
    <div className="space-y-6">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
        <div className="flex items-center gap-3">
          <Link href="/admin/events">
            <Button
              variant="outline"
              size="sm"
              className="size-9 p-0 border-[#D9DEEC] text-[#184098]"
            >
              <ArrowLeft className="size-4" />
            </Button>
          </Link>
          <div>
            <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#151B2E]">
              {isEditing ? "Edit Event" : "Create New Event"}
            </h1>
            <p className="text-xs text-muted-foreground">
              {isEditing
                ? `Updating: ${initialData.title}`
                : "Organize summits, masterclasses, awards, and workshops."}
            </p>
          </div>
        </div>

        {isEditing && slug && (
          <a
            href={`/events/${slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#184098] hover:underline"
          >
            <Eye className="size-3.5" />
            <span>View on Live Site</span>
          </a>
        )}
      </div>

      {error && (
        <div className="flex items-start gap-2.5 rounded-md border border-red-200 bg-red-50 p-4 text-xs text-red-700">
          <AlertCircle className="size-4 shrink-0 mt-0.5" />
          <span>{error}</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Main Form Fields (Left 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <Card className="border-[#D9DEEC] bg-white p-6 space-y-5 rounded-lg">
            {/* Title */}
            <div className="space-y-1.5">
              <label
                htmlFor="event-title"
                className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
              >
                Event Title <span className="text-red-500">*</span>
              </label>
              <Input
                id="event-title"
                placeholder="e.g. Teachers Spotlight Education Summit & Awards 2026"
                value={title}
                onChange={(e) => handleTitleChange(e.target.value)}
                className="h-11 border-[#D9DEEC] text-base font-bold text-[#151B2E] focus-visible:ring-[#184098]"
              />
            </div>

            {/* Editable Slug with Real-time Uniqueness Validation */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label
                  htmlFor="event-slug"
                  className="block text-xs font-semibold text-muted-foreground"
                >
                  URL Slug: /events/{slug || "..."}
                </label>
                <button
                  type="button"
                  onClick={() => setIsCustomSlug(!isCustomSlug)}
                  className="text-[11px] text-[#184098] font-semibold hover:underline"
                >
                  {isCustomSlug ? "Auto-generate" : "Customize Slug"}
                </button>
              </div>

              <div className="relative">
                <Input
                  id="event-slug"
                  placeholder="custom-event-slug"
                  value={slug}
                  onChange={(e) => {
                    setIsCustomSlug(true);
                    setSlug(slugify(e.target.value));
                  }}
                  className="h-9 font-mono text-xs border-[#D9DEEC] pr-28"
                />

                <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center text-[11px]">
                  {slugChecking ? (
                    <span className="text-muted-foreground flex items-center gap-1 font-medium">
                      <Loader2 className="size-3 animate-spin" /> Checking
                    </span>
                  ) : slugAvailable === true ? (
                    <span className="text-emerald-600 flex items-center gap-1 font-semibold">
                      <CheckCircle2 className="size-3.5" /> Available
                    </span>
                  ) : slugAvailable === false ? (
                    <span className="text-red-600 flex items-center gap-1 font-semibold">
                      <XCircle className="size-3.5" /> Taken
                    </span>
                  ) : null}
                </div>
              </div>
            </div>

            {/* Event Description */}
            <div className="space-y-1.5">
              <label
                htmlFor="event-desc"
                className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
              >
                Description &amp; Highlights{" "}
                <span className="text-red-500">*</span>
              </label>
              <Textarea
                id="event-desc"
                rows={5}
                placeholder="Comprehensive description of the event agenda, keynote speakers, topics covered, and who should attend..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="border-[#D9DEEC] text-sm text-[#151B2E] focus-visible:ring-[#184098]"
              />
            </div>

            {/* Venue & Location */}
            <div className="space-y-1.5">
              <label
                htmlFor="event-venue"
                className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
              >
                Venue / Location <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Input
                  id="event-venue"
                  placeholder="e.g. Celebrate Center, Olu Obasanjo Road, Port Harcourt"
                  value={venue}
                  onChange={(e) => setVenue(e.target.value)}
                  className="h-10 pl-9 border-[#D9DEEC] text-xs font-medium text-[#151B2E]"
                />
                <MapPin className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
              </div>
            </div>

            {/* Date & Time Row */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="event-start"
                  className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
                >
                  Start Date &amp; Time <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    id="event-start"
                    type="datetime-local"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="h-10 border-[#D9DEEC] text-xs font-medium"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="event-end"
                  className="block text-xs font-bold uppercase tracking-wider text-[#151B2E]"
                >
                  End Date &amp; Time (Optional)
                </label>
                <div className="relative">
                  <Input
                    id="event-end"
                    type="datetime-local"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    className="h-10 border-[#D9DEEC] text-xs font-medium"
                  />
                </div>
              </div>
            </div>

            {/* Dynamic Ticket & Admission Tiers Manager */}
            <div className="rounded-lg border border-[#D9DEEC] bg-[#FAFBFF] p-4 sm:p-5 space-y-4">
              <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between border-b border-[#D9DEEC] pb-3">
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Layers className="size-4 text-[#184098] shrink-0" />
                    <h4 className="font-heading text-sm font-bold text-[#151B2E]">
                      Tickets &amp; Admission Tiers
                    </h4>
                    {ticketTiers.length > 0 && (
                      <Badge
                        variant="outline"
                        className="text-[10px] font-bold border-[#184098] text-[#184098] bg-[#EEF2FA]"
                      >
                        {ticketTiers.length}{" "}
                        {ticketTiers.length === 1 ? "Tier" : "Tiers"}
                      </Badge>
                    )}
                  </div>
                  <p className="text-[11px] text-muted-foreground leading-relaxed max-w-lg">
                    Configure multiple ticket tiers (e.g. Free, Standard,
                    Premium, Corporate Sponsor) with customizable prices, perks,
                    and payment links.
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-wrap shrink-0">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleLoadDefaultTiers}
                    className="h-8 text-xs font-semibold border-[#184098]/40 text-[#184098] hover:bg-[#EEF2FA] shrink-0"
                  >
                    <ListPlus className="size-3.5 mr-1.5" />
                    Load 4 Tiers Preset
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={handleAddTier}
                    className="h-8 text-xs font-bold bg-[#184098] hover:bg-[#15327A] text-white shrink-0"
                  >
                    <Plus className="size-3.5 mr-1" />
                    Add Custom Tier
                  </Button>
                </div>
              </div>

              {ticketTiers.length === 0 ? (
                <div className="rounded-md border border-dashed border-[#D9DEEC] p-6 text-center space-y-3 bg-white">
                  <p className="text-xs text-muted-foreground">
                    No multi-tier tickets configured yet. Click{" "}
                    <strong>&quot;Load 4 Tiers Preset&quot;</strong> to
                    instantly load the 4 recommended tiers (Free, Standard,
                    Premium, Partner), or configure a simple single price below.
                  </p>
                  <div className="flex flex-wrap justify-center gap-2">
                    <Button
                      type="button"
                      size="sm"
                      onClick={handleLoadDefaultTiers}
                      className="text-xs font-semibold bg-[#184098] hover:bg-[#15327A] text-white"
                    >
                      <ListPlus className="size-3.5 mr-1.5" />
                      Load 4 Tiers Preset
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTier}
                      className="text-xs font-semibold border-[#D9DEEC]"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add Custom Tier
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {ticketTiers.map((tier, idx) => (
                    // biome-ignore lint/a11y/noStaticElementInteractions: drag and drop item
                    <div
                      key={tier.id || idx}
                      draggable={true}
                      onDragStart={(e) => {
                        const target = e.target as HTMLElement;
                        if (
                          target.tagName === "INPUT" ||
                          target.tagName === "TEXTAREA" ||
                          target.tagName === "BUTTON" ||
                          target.closest("button") ||
                          target.closest("input") ||
                          target.closest("textarea")
                        ) {
                          e.preventDefault();
                          return;
                        }
                        setDraggedTierIndex(idx);
                        e.dataTransfer.effectAllowed = "move";
                      }}
                      onDragOver={(e) => {
                        e.preventDefault();
                        e.dataTransfer.dropEffect = "move";
                      }}
                      onDrop={(e) => {
                        e.preventDefault();
                        if (
                          draggedTierIndex !== null &&
                          draggedTierIndex !== idx
                        ) {
                          handleMoveTier(draggedTierIndex, idx);
                        }
                        setDraggedTierIndex(null);
                      }}
                      onDragEnd={() => setDraggedTierIndex(null)}
                      className={`p-4 rounded-lg border bg-white shadow-xs space-y-3 transition-all ${
                        draggedTierIndex === idx
                          ? "opacity-50 border-dashed border-[#184098] bg-[#EEF2FA]/30"
                          : "border-[#D9DEEC]"
                      }`}
                    >
                      <div className="flex items-center justify-between border-b border-[#D9DEEC]/70 pb-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span
                            title="Drag to reorder tier"
                            className="cursor-grab active:cursor-grabbing text-[#55627D] hover:text-[#184098] p-1 -ml-1 rounded hover:bg-[#EEF2FA] shrink-0 select-none"
                          >
                            <GripVertical className="size-4" />
                          </span>
                          <span className="size-6 rounded-full bg-[#EEF2FA] text-[#184098] font-black text-xs flex items-center justify-center">
                            {idx + 1}
                          </span>
                          <span className="text-xs font-bold text-[#151B2E]">
                            {tier.name || `Tier #${idx + 1}`}
                          </span>
                          {tier.badge && (
                            <Badge
                              variant="outline"
                              className="text-[10px] border-amber-300 text-amber-800 bg-amber-50"
                            >
                              {tier.badge}
                            </Badge>
                          )}
                          <span className="text-xs font-mono font-bold text-[#184098]">
                            {Number(tier.price) === 0
                              ? "Free (₦0)"
                              : `₦${Number(tier.price).toLocaleString()}`}
                          </span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="flex items-center border border-[#D9DEEC] rounded-md overflow-hidden mr-1">
                            <button
                              type="button"
                              disabled={idx === 0}
                              onClick={() => handleMoveTier(idx, idx - 1)}
                              title="Move tier up"
                              className="size-7 flex items-center justify-center text-[#55627D] hover:text-[#184098] hover:bg-[#EEF2FA] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              <ChevronUp className="size-3.5" />
                            </button>
                            <div className="w-[1px] h-4 bg-[#D9DEEC]" />
                            <button
                              type="button"
                              disabled={idx === ticketTiers.length - 1}
                              onClick={() => handleMoveTier(idx, idx + 1)}
                              title="Move tier down"
                              className="size-7 flex items-center justify-center text-[#55627D] hover:text-[#184098] hover:bg-[#EEF2FA] disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer transition-colors"
                            >
                              <ChevronDown className="size-3.5" />
                            </button>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeleteTier(idx)}
                            className="h-7 text-xs text-red-600 hover:text-red-700 hover:bg-red-50 px-2"
                          >
                            <Trash2 className="size-3.5 mr-1" />
                            Remove Tier
                          </Button>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
                        <div className="sm:col-span-6 space-y-1">
                          <label
                            htmlFor={`tier-name-${idx}`}
                            className="block text-[11px] font-bold text-[#151B2E]"
                          >
                            Tier Name <span className="text-red-500">*</span>
                          </label>
                          <Input
                            id={`tier-name-${idx}`}
                            placeholder="e.g. Free / Access ticket, Standard ticket"
                            value={tier.name}
                            onChange={(e) =>
                              handleUpdateTier(idx, "name", e.target.value)
                            }
                            className="h-9 text-xs border-[#D9DEEC]"
                          />
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label
                            htmlFor={`tier-price-${idx}`}
                            className="block text-[11px] font-bold text-[#151B2E]"
                          >
                            Price (₦ Naira){" "}
                            <span className="text-red-500">*</span>
                          </label>
                          <div className="relative">
                            <Input
                              id={`tier-price-${idx}`}
                              type="number"
                              min="0"
                              step="500"
                              placeholder="0 for free"
                              value={tier.price}
                              onChange={(e) =>
                                handleUpdateTier(
                                  idx,
                                  "price",
                                  Number(e.target.value),
                                )
                              }
                              className="h-9 pl-7 text-xs font-bold border-[#D9DEEC]"
                            />
                            <span className="text-muted-foreground absolute left-2.5 top-1/2 -translate-y-1/2 font-bold text-xs select-none">
                              ₦
                            </span>
                          </div>
                        </div>

                        <div className="sm:col-span-3 space-y-1">
                          <label
                            htmlFor={`tier-badge-${idx}`}
                            className="block text-[11px] font-bold text-[#151B2E]"
                          >
                            Badge / Tag{" "}
                            <span className="text-muted-foreground font-normal">
                              (Optional)
                            </span>
                          </label>
                          <Input
                            id={`tier-badge-${idx}`}
                            placeholder="Optional custom tag (e.g. VIP, Featured)"
                            value={tier.badge || ""}
                            onChange={(e) =>
                              handleUpdateTier(idx, "badge", e.target.value)
                            }
                            className="h-9 text-xs border-[#D9DEEC]"
                          />
                        </div>

                        <div className="sm:col-span-12 space-y-1">
                          <label
                            htmlFor={`tier-desc-${idx}`}
                            className="block text-[11px] font-bold text-[#151B2E]"
                          >
                            Short Description
                          </label>
                          <Input
                            id={`tier-desc-${idx}`}
                            placeholder="Brief description of who this ticket is for and what it covers"
                            value={tier.description || ""}
                            onChange={(e) =>
                              handleUpdateTier(
                                idx,
                                "description",
                                e.target.value,
                              )
                            }
                            className="h-9 text-xs border-[#D9DEEC]"
                          />
                        </div>

                        <div className="sm:col-span-12 space-y-1">
                          <TierBenefitsEditor
                            tierIndex={idx}
                            benefits={tier.benefits || []}
                            onChange={(updatedBenefits) =>
                              handleUpdateTier(idx, "benefits", updatedBenefits)
                            }
                          />
                        </div>

                        <div className="sm:col-span-6 space-y-1">
                          <label
                            htmlFor={`tier-link-${idx}`}
                            className="block text-[11px] font-bold text-[#151B2E]"
                          >
                            Specific Payment Link (Optional)
                          </label>
                          <Input
                            id={`tier-link-${idx}`}
                            type="url"
                            placeholder="https://paystack.com/pay/tier-specific-link"
                            value={tier.paymentLink || ""}
                            onChange={(e) =>
                              handleUpdateTier(
                                idx,
                                "paymentLink",
                                e.target.value,
                              )
                            }
                            className="h-9 text-xs font-mono border-[#D9DEEC]"
                          />
                          <p className="text-[10px] text-muted-foreground mt-0.5">
                            If provided, attendees choosing this tier will be
                            routed directly to this payment page.
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[#D9DEEC]/70">
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={handleLoadDefaultTiers}
                      className="h-8 text-xs font-semibold text-muted-foreground hover:text-[#184098] hover:bg-[#EEF2FA]"
                    >
                      <ListPlus className="size-3.5 mr-1.5" />
                      Reset to 4 Standard Tiers
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={handleAddTier}
                      className="h-8 text-xs font-bold border-[#184098] text-[#184098] hover:bg-[#EEF2FA]"
                    >
                      <Plus className="size-3.5 mr-1" />
                      Add Another Tier
                    </Button>
                  </div>
                </div>
              )}

              {/* Single/Fallback Price toggle if no tiers */}
              {ticketTiers.length === 0 && (
                <div className="pt-3 border-t border-[#D9DEEC] space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="text-xs font-bold text-[#151B2E]">
                        Single Price Mode
                      </h5>
                      <p className="text-[11px] text-muted-foreground">
                        Or simply set a single price for this event
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsPaid(!isPaid)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        isPaid ? "bg-[#184098]" : "bg-[#D9DEEC]"
                      }`}
                      role="switch"
                      aria-checked={isPaid}
                    >
                      <span
                        className={`pointer-events-none inline-block size-5 transform rounded-full bg-white shadow-md ring-0 transition duration-200 ease-in-out ${
                          isPaid ? "translate-x-5" : "translate-x-0"
                        }`}
                      />
                    </button>
                  </div>

                  {isPaid && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                      <div className="space-y-1">
                        <label
                          htmlFor="event-price-single"
                          className="block text-xs font-bold text-[#151B2E]"
                        >
                          Price (₦ Naira)
                        </label>
                        <div className="relative">
                          <Input
                            id="event-price-single"
                            type="number"
                            min="0"
                            step="500"
                            placeholder="e.g. 25000"
                            value={price}
                            onChange={(e) => setPrice(e.target.value)}
                            className="h-9 pl-8 border-[#D9DEEC] text-xs font-bold text-[#151B2E]"
                          />
                          <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs select-none">
                            ₦
                          </span>
                        </div>
                      </div>
                      <div className="space-y-1">
                        <label
                          htmlFor="event-link-single"
                          className="block text-xs font-bold text-[#151B2E]"
                        >
                          External Checkout URL
                        </label>
                        <Input
                          id="event-link-single"
                          type="url"
                          placeholder="https://paystack.com/pay/event-link"
                          value={paymentLink}
                          onChange={(e) => setPaymentLink(e.target.value)}
                          className="h-9 border-[#D9DEEC] text-xs font-mono text-[#184098]"
                        />
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </Card>
        </div>

        {/* Sidebar Controls (Right 4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Publishing & Actions Card */}
          <Card className="border-[#D9DEEC] bg-white p-5 rounded-lg space-y-4 shadow-xs">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#151B2E] border-b border-[#D9DEEC] pb-2">
              Publishing Controls
            </CardTitle>

            <div className="flex items-center justify-between text-xs">
              <span className="text-muted-foreground">Current Status:</span>
              <Badge
                variant={
                  status === "published"
                    ? "success"
                    : status === "in_review"
                      ? "amber"
                      : "outline"
                }
                className="text-[10px] uppercase font-bold"
              >
                {status.replace("_", " ")}
              </Badge>
            </div>

            <div className="space-y-2 pt-2">
              {isCreator ? (
                <>
                  <Button
                    type="button"
                    disabled={isPending || !title || !venue || !startDate}
                    onClick={() => handleSubmit("in_review")}
                    className="w-full justify-center text-xs h-10 bg-[#184098] hover:bg-[#08276B] text-white font-bold"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin mr-1" />
                    ) : (
                      <Send className="size-4 mr-1.5" />
                    )}
                    Submit for Review
                  </Button>

                  <Button
                    type="button"
                    disabled={isPending || !title}
                    onClick={() => handleSubmit("draft")}
                    variant="outline"
                    className="w-full justify-center text-xs h-9 border-[#D9DEEC]"
                  >
                    <Save className="size-3.5 mr-1" />
                    Save as Draft
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    type="button"
                    disabled={isPending || !title || !venue || !startDate}
                    onClick={() => handleSubmit("published")}
                    className="w-full justify-center text-xs h-10 bg-[#184098] hover:bg-[#08276B] text-white font-bold"
                  >
                    {isPending ? (
                      <Loader2 className="size-4 animate-spin mr-1" />
                    ) : (
                      <Globe className="size-4 mr-1.5" />
                    )}
                    {isEditing && status === "published"
                      ? "Update Event"
                      : "Publish Event Live"}
                  </Button>

                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      type="button"
                      disabled={isPending || !title}
                      onClick={() => handleSubmit("draft")}
                      variant="outline"
                      className="text-xs h-9 border-[#D9DEEC]"
                    >
                      <Save className="size-3.5 mr-1" />
                      Draft
                    </Button>

                    <Button
                      type="button"
                      disabled={isPending || !title}
                      onClick={() => handleSubmit("in_review")}
                      variant="outline"
                      className="text-xs h-9 border-[#D9DEEC]"
                    >
                      <Send className="size-3.5 mr-1" />
                      In Review
                    </Button>
                  </div>
                </>
              )}
            </div>
          </Card>

          {/* Flagship Spotlight Control */}
          <Card className="border-[#D9DEEC] bg-white p-5 rounded-lg space-y-3 shadow-xs">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Star className="size-4 text-[#C49A45] fill-current" />
                <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#151B2E]">
                  Flagship Spotlight
                </CardTitle>
              </div>
              <span
                className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  isFeatured
                    ? "bg-[#C49A45]/15 text-[#8F6B1E] border border-[#C49A45]/30"
                    : "bg-gray-100 text-gray-600"
                }`}
              >
                {isFeatured ? "Active Flagship" : "Standard"}
              </span>
            </div>
            <p className="text-xs text-[#555E77] leading-relaxed">
              Mark this event as a flagship spotlight. It will appear
              prominently in the Featured Flagship section at the top of the
              public Events page.
            </p>
            <label className="flex items-center justify-between gap-3 pt-2 border-t border-[#EAEFF8] cursor-pointer">
              <span className="text-xs font-semibold text-[#151B2E]">
                Feature as Flagship
              </span>
              <input
                type="checkbox"
                id="event-is-featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="size-4 rounded border-gray-300 text-[#184098] focus:ring-[#184098] cursor-pointer"
              />
            </label>
          </Card>

          {/* Event Classification & Media */}
          <Card className="border-[#D9DEEC] bg-white p-5 rounded-lg space-y-4 shadow-xs">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-[#151B2E] border-b border-[#D9DEEC] pb-2">
              Classification &amp; Media
            </CardTitle>

            {/* Type selector */}
            <div className="space-y-1.5">
              <label
                htmlFor="event-type"
                className="block text-xs font-bold text-[#151B2E]"
              >
                Event Format
              </label>
              <Select
                id="event-type"
                value={type}
                onChange={(e) =>
                  setType(
                    e.target.value as
                      | "summit"
                      | "masterclass"
                      | "workshop"
                      | "awards",
                  )
                }
                className="h-10 text-xs border-[#D9DEEC]"
              >
                <option value="summit">Summit (Flagship conference)</option>
                <option value="masterclass">
                  Masterclass (Executive training)
                </option>
                <option value="workshop">
                  Workshop (Practical educator sessions)
                </option>
                <option value="awards">Awards (Celebration ceremonies)</option>
              </Select>
            </div>

            {/* Cover Image Upload (Drag-and-Drop & Media Library Picker) */}
            <div className="pt-2 border-t border-[#D9DEEC]">
              <SectionImageUpload
                label="Master Cover Image (16:9)"
                description="Recommended: 1200×675 or 1920×1080 (JPG, PNG, WebP). Formats cleanly across event details, flagship banner, and listing cards."
                value={coverImage}
                onChange={({ url }) => setCoverImage(url)}
                folder="events"
                aspectRatio="video"
              />
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
