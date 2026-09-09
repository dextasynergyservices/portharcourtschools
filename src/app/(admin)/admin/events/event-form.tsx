"use client";

import {
  AlertCircle,
  ArrowLeft,
  CheckCircle2,
  DollarSign,
  Eye,
  Globe,
  Loader2,
  MapPin,
  Save,
  Send,
  Sparkles,
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
    formData.set("isPaid", isPaid ? "true" : "false");
    formData.set("price", price);
    formData.set("paymentLink", paymentLink);
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

            {/* Paid Event Toggle & External Checkout URL */}
            <div className="rounded-lg border border-[#D9DEEC] bg-[#FAFBFF] p-4 space-y-3">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-heading text-xs font-bold text-[#151B2E]">
                    Ticket / Registration Pricing
                  </h4>
                  <p className="text-[11px] text-muted-foreground mt-0.5">
                    Is this event paid, or free admission / RSVP?
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
                <div className="pt-3 border-t border-[#D9DEEC]/70 space-y-4">
                  <div className="space-y-1.5">
                    <label
                      htmlFor="event-price"
                      className="block text-xs font-bold text-[#151B2E]"
                    >
                      Ticket Price (₦ Naira){" "}
                      <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="event-price"
                        type="number"
                        min="0"
                        step="500"
                        placeholder="e.g. 25000"
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        className="h-10 pl-8 border-[#D9DEEC] text-xs font-bold text-[#151B2E]"
                      />
                      <span className="text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2 font-bold text-xs select-none">
                        ₦
                      </span>
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Fee per attendee in Naira. Shown on the event card, detail
                      page, and registration modal.
                    </p>
                  </div>

                  <div className="space-y-1.5">
                    <label
                      htmlFor="event-payment-link"
                      className="block text-xs font-bold text-[#151B2E]"
                    >
                      External Checkout URL (Paystack / Flutterwave / Ticket
                      Link) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        id="event-payment-link"
                        type="url"
                        placeholder="https://paystack.com/pay/your-event-link"
                        value={paymentLink}
                        onChange={(e) => setPaymentLink(e.target.value)}
                        className="h-10 pl-9 border-[#D9DEEC] text-xs font-mono text-[#184098]"
                      />
                      <DollarSign className="size-4 text-muted-foreground absolute left-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      After attendees submit their details in the registration
                      form, they will be routed to this checkout URL to finalize
                      payment.
                    </p>
                  </div>
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
                <Sparkles className="size-4 text-[#C49A45]" />
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
