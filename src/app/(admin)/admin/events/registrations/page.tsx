import { and, desc, eq, ilike, or } from "drizzle-orm";
import {
  ArrowLeft,
  CheckCircle2,
  Clock,
  Filter,
  Mail,
  MessageCircle,
  RotateCcw,
  School,
  Search,
  Ticket,
  Users,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ExportRegistrationsButton } from "@/components/admin/events/export-registrations-button";
import { RegistrationActionsMenu } from "@/components/admin/events/registration-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { auth } from "@/lib/auth";
import { db, eventRegistrations, events } from "@/lib/db";
import { DashboardShell } from "../../dashboard/dashboard-shell";
import { RegistrationsTable } from "./registrations-table";

export const metadata = {
  title:
    "Event Registrations & Attendees — Admin Portal | Schools Voice (Formerly Port Harcourt Schools)",
};

interface AdminRegistrationsPageProps {
  searchParams: Promise<{
    eventId?: string;
    status?: string;
    paymentType?: string;
    q?: string;
  }>;
}

export default async function AdminRegistrationsPage({
  searchParams,
}: AdminRegistrationsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { eventId, status, paymentType, q } = await searchParams;

  // 1. Fetch all events for dropdown filter & event resolution
  const allEventsList = await db.query.events.findMany({
    orderBy: [desc(events.startDate)],
    with: {
      registrations: true,
    },
  });

  const selectedEvent =
    eventId && eventId !== "all"
      ? allEventsList.find((e) => e.id === eventId)
      : null;

  // 2. Build where conditions for registrations
  const conditions = [];

  if (eventId && eventId !== "all") {
    conditions.push(eq(eventRegistrations.eventId, eventId));
  }

  if (status && status !== "all") {
    conditions.push(
      eq(
        eventRegistrations.status,
        status as "pending_payment" | "confirmed" | "cancelled",
      ),
    );
  }

  if (q && q.trim().length > 0) {
    const term = `%${q.trim()}%`;
    conditions.push(
      or(
        ilike(eventRegistrations.fullName, term),
        ilike(eventRegistrations.email, term),
        ilike(eventRegistrations.schoolName, term),
        ilike(eventRegistrations.phone, term),
      ),
    );
  }

  const whereClause =
    conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined;

  // 3. Fetch matched registrations with event relation
  const rawRegistrations = await db.query.eventRegistrations.findMany({
    where: whereClause,
    orderBy: [desc(eventRegistrations.createdAt)],
    with: {
      event: true,
    },
  });

  // Filter by payment type in memory (since paymentType depends on event.isPaid)
  const registrations = rawRegistrations.filter((r) => {
    if (!paymentType || paymentType === "all") return true;
    if (paymentType === "paid")
      return r.event?.isPaid === true || r.totalAmount > 0;
    if (paymentType === "free")
      return r.event?.isPaid === false && r.totalAmount === 0;
    return true;
  });

  // 4. Calculate status metrics for currently selected event scope
  const eventScopedRegistrations = await db.query.eventRegistrations.findMany({
    where:
      eventId && eventId !== "all"
        ? eq(eventRegistrations.eventId, eventId)
        : undefined,
    with: {
      event: true,
    },
  });

  const totalScopeCount = eventScopedRegistrations.length;
  const confirmedScopeCount = eventScopedRegistrations.filter(
    (r) => r.status === "confirmed",
  ).length;
  const pendingScopeCount = eventScopedRegistrations.filter(
    (r) => r.status === "pending_payment",
  ).length;
  const cancelledScopeCount = eventScopedRegistrations.filter(
    (r) => r.status === "cancelled",
  ).length;

  const totalFilteredTickets = registrations.reduce(
    (sum, r) => sum + r.ticketQuantity,
    0,
  );
  const totalFilteredRevenue = registrations.reduce(
    (sum, r) => sum + r.totalAmount,
    0,
  );

  const activeStatus = status || "all";
  const activeEventId = eventId || "all";
  const activePaymentType = paymentType || "all";
  const hasFiltersActive =
    (eventId && eventId !== "all") ||
    (status && status !== "all") ||
    (paymentType && paymentType !== "all") ||
    Boolean(q?.trim());

  // Prepare export data
  const exportItems = registrations.map((r) => ({
    id: r.id,
    fullName: r.fullName,
    email: r.email,
    phone: r.phone,
    schoolName: r.schoolName,
    role: r.role,
    ticketQuantity: r.ticketQuantity,
    ticketTierName: r.ticketTierName || "Standard",
    totalAmount: r.totalAmount,
    status: r.status,
    notes: r.notes,
    createdAt: r.createdAt,
    eventTitle: r.event?.title || "N/A",
  }));

  const exportPrefix = selectedEvent
    ? `${selectedEvent.slug}-registrations`
    : "all-event-registrations";

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/events">
              <Button
                variant="outline"
                size="sm"
                className="size-9 p-0 border-[#D9DEEC] text-[#184098] hover:bg-[#EEF2FA]"
                title="Back to Events"
              >
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#151B2E]">
                  Event Registrations
                </h1>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
                >
                  {selectedEvent ? selectedEvent.title : "All Events"}
                </Badge>
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase border-emerald-200 bg-emerald-50 text-emerald-700"
                >
                  {registrations.length} Showing
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Monitor attendee sign-ups, ticket bookings, payment
                verifications, and export rosters.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <ExportRegistrationsButton
              registrations={exportItems}
              filenamePrefix={exportPrefix}
              eventTitle={selectedEvent?.title}
            />
            <Link href="/admin/events">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-[#D9DEEC] text-[#151B2E] hover:bg-[#EEF2FA]"
              >
                Manage Events
              </Button>
            </Link>
          </div>
        </div>

        {/* Metrics Overview Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="p-4 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Users className="size-3.5 text-[#184098]" />
              Total Attendees
            </span>
            <p className="font-heading text-2xl font-black text-[#151B2E]">
              {registrations.length}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {totalFilteredTickets}{" "}
              {totalFilteredTickets === 1 ? "ticket" : "tickets"} booked
            </p>
          </Card>

          <Card className="p-4 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <CheckCircle2 className="size-3.5 text-emerald-600" />
              Confirmed
            </span>
            <p className="font-heading text-2xl font-black text-emerald-700">
              {confirmedScopeCount}
            </p>
            <p className="text-[11px] text-muted-foreground">
              {totalScopeCount > 0
                ? `${Math.round((confirmedScopeCount / totalScopeCount) * 100)}% confirmation rate`
                : "No registrations yet"}
            </p>
          </Card>

          <Card className="p-4 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Clock className="size-3.5 text-amber-600" />
              Pending Payment
            </span>
            <p className="font-heading text-2xl font-black text-amber-700">
              {pendingScopeCount}
            </p>
            <p className="text-[11px] text-muted-foreground">
              Awaiting checkout completion
            </p>
          </Card>

          <Card className="p-4 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <Ticket className="size-3.5 text-[#184098]" />
              Booked Value
            </span>
            <p className="font-heading text-2xl font-black text-[#184098]">
              {totalFilteredRevenue > 0
                ? `₦${totalFilteredRevenue.toLocaleString()}`
                : "Free / ₦0"}
            </p>
            <p className="text-[11px] text-muted-foreground">
              From current filtered set
            </p>
          </Card>
        </div>

        {/* Filter & Search Bar */}
        <Card className="p-4 bg-white border-[#D9DEEC] rounded-lg shadow-xs space-y-3">
          <form
            method="GET"
            action="/admin/events/registrations"
            className="space-y-3"
          >
            {/* Preserve active status if present */}
            {status && status !== "all" && (
              <input type="hidden" name="status" value={status} />
            )}

            <div className="flex flex-col lg:flex-row lg:items-center gap-2.5">
              {/* Search input */}
              <div className="relative flex-1 min-w-[220px]">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
                <Input
                  type="text"
                  name="q"
                  placeholder="Search attendee name, email, school, phone..."
                  defaultValue={q || ""}
                  className="pl-9 h-10 text-xs border-[#D9DEEC] focus-visible:ring-[#184098] w-full"
                />
              </div>

              <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 shrink-0">
                {/* Event Selector */}
                <div className="w-full sm:w-60">
                  <select
                    name="eventId"
                    defaultValue={activeEventId}
                    className="w-full h-10 text-xs border border-[#D9DEEC] rounded-md px-3 bg-white text-[#151B2E] focus:outline-none focus:ring-2 focus:ring-[#184098]/30 font-medium truncate"
                  >
                    <option value="all">
                      All Events (
                      {allEventsList.reduce(
                        (acc, e) => acc + (e.registrations?.length || 0),
                        0,
                      )}
                      )
                    </option>
                    {allEventsList.map((e) => (
                      <option key={e.id} value={e.id}>
                        {e.title} ({e.registrations?.length || 0})
                      </option>
                    ))}
                  </select>
                </div>

                {/* Payment Type */}
                <div className="w-full sm:w-36">
                  <select
                    name="paymentType"
                    defaultValue={activePaymentType}
                    className="w-full h-10 text-xs border border-[#D9DEEC] rounded-md px-3 bg-white text-[#151B2E] focus:outline-none focus:ring-2 focus:ring-[#184098]/30 font-medium"
                  >
                    <option value="all">All Admissions</option>
                    <option value="paid">Paid Events</option>
                    <option value="free">Free Admission</option>
                  </select>
                </div>

                {/* Submit / Filter Buttons */}
                <div className="flex items-center gap-2">
                  <Button
                    type="submit"
                    size="sm"
                    className="h-10 px-4 bg-[#184098] hover:bg-[#08276B] text-white font-bold text-xs shadow-xs"
                  >
                    <Filter className="size-3.5 mr-1.5" />
                    Filter
                  </Button>
                  {hasFiltersActive && (
                    <Link
                      href="/admin/events/registrations"
                      title="Reset all filters"
                    >
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className="h-10 px-3 border-[#D9DEEC] text-muted-foreground hover:text-[#184098] hover:bg-[#EEF2FA] text-xs font-semibold"
                      >
                        <RotateCcw className="size-3.5 mr-1.5" />
                        Reset
                      </Button>
                    </Link>
                  )}
                </div>
              </div>
            </div>
          </form>

          {/* Status Filter Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pt-2 border-t border-[#D9DEEC]/60 text-xs">
            <Link
              href={`/admin/events/registrations?status=all${eventId ? `&eventId=${eventId}` : ""}${paymentType ? `&paymentType=${paymentType}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "all"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              All ({totalScopeCount})
            </Link>
            <Link
              href={`/admin/events/registrations?status=confirmed${eventId ? `&eventId=${eventId}` : ""}${paymentType ? `&paymentType=${paymentType}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "confirmed"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              Confirmed ({confirmedScopeCount})
            </Link>
            <Link
              href={`/admin/events/registrations?status=pending_payment${eventId ? `&eventId=${eventId}` : ""}${paymentType ? `&paymentType=${paymentType}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "pending_payment"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              Pending Payment ({pendingScopeCount})
            </Link>
            <Link
              href={`/admin/events/registrations?status=cancelled${eventId ? `&eventId=${eventId}` : ""}${paymentType ? `&paymentType=${paymentType}` : ""}${q ? `&q=${encodeURIComponent(q)}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "cancelled"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              Cancelled ({cancelledScopeCount})
            </Link>
          </div>
        </Card>

        {/* Desktop Registrations Table (hidden on mobile, md:block) */}
        <div className="hidden md:block">
          <RegistrationsTable registrations={registrations} />
        </div>

        {/* Mobile Registrations Cards (block md:hidden) */}
        <div className="block md:hidden space-y-3">
          {registrations.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground space-y-2 border-[#D9DEEC] bg-white rounded-lg">
              <Users className="size-8 mx-auto text-muted-foreground/40" />
              <p className="font-semibold text-sm text-[#151B2E]">
                No registrations found.
              </p>
              <p className="text-xs">
                {hasFiltersActive
                  ? "Try resetting your search or event filter."
                  : "Registrations will appear here as soon as attendees book tickets."}
              </p>
              {hasFiltersActive && (
                <div className="pt-2">
                  <Link href="/admin/events/registrations">
                    <Button
                      variant="outline"
                      size="sm"
                      className="h-8 text-xs border-[#D9DEEC] text-[#184098]"
                    >
                      Reset All Filters
                    </Button>
                  </Link>
                </div>
              )}
            </Card>
          ) : (
            registrations.map((reg) => (
              <Card
                key={reg.id}
                className="p-4 border-[#D9DEEC] bg-white rounded-lg shadow-xs space-y-3 hover:border-[#184098]/30 transition-all"
              >
                {/* Card Header */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <div className="size-9 rounded-full bg-[#EEF2FA] text-[#184098] flex items-center justify-center font-bold text-xs shrink-0">
                      {reg.fullName
                        .split(" ")
                        .map((n) => n[0])
                        .slice(0, 2)
                        .join("")
                        .toUpperCase()}
                    </div>
                    <div>
                      <h2 className="font-bold text-sm text-[#151B2E] leading-snug">
                        {reg.fullName}
                      </h2>
                      <div className="flex items-center gap-1.5 flex-wrap mt-0.5">
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase font-bold border-[#D9DEEC] text-muted-foreground px-1.5 py-0"
                        >
                          {reg.role.replace("_", " ")}
                        </Badge>
                        <Badge
                          variant={
                            reg.status === "confirmed"
                              ? "success"
                              : reg.status === "pending_payment"
                                ? "amber"
                                : "outline"
                          }
                          className="text-[9px] uppercase font-bold px-1.5 py-0"
                        >
                          {reg.status.replace("_", " ")}
                        </Badge>
                      </div>
                    </div>
                  </div>

                  <RegistrationActionsMenu registration={reg} />
                </div>

                {/* Event info */}
                {reg.event && (
                  <div className="p-2.5 rounded bg-[#FAFBFF] border border-[#D9DEEC]/70 text-xs space-y-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-bold text-[#184098] line-clamp-1">
                        {reg.event.title}
                      </span>
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase font-bold border-[#D9DEEC] bg-white text-[#184098] px-1 py-0 shrink-0"
                      >
                        {reg.event.type}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                      <span>
                        {new Date(reg.event.startDate).toLocaleDateString(
                          "en-GB",
                          {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          },
                        )}
                      </span>
                      <span className="font-semibold text-[#151B2E]">
                        {reg.ticketQuantity}{" "}
                        {reg.ticketQuantity === 1 ? "ticket" : "tickets"} •{" "}
                        {reg.totalAmount > 0
                          ? `₦${reg.totalAmount.toLocaleString()}`
                          : "Free"}
                      </span>
                    </div>
                  </div>
                )}

                {/* School & Contact quick row */}
                <div className="space-y-1.5 text-xs text-muted-foreground pt-1">
                  {reg.schoolName && (
                    <div className="flex items-center gap-1 font-medium text-[#151B2E] truncate">
                      <School className="size-3 text-[#184098] shrink-0" />
                      <span className="truncate">{reg.schoolName}</span>
                    </div>
                  )}

                  <div className="flex items-center gap-2 pt-1 border-t border-[#D9DEEC]/50">
                    <a
                      href={`mailto:${reg.email}`}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-[#EEF2FA] text-[#184098] text-[11px] font-semibold hover:bg-[#E2E8F0] transition-colors"
                    >
                      <Mail className="size-3" />
                      Email
                    </a>
                    <a
                      href={`https://wa.me/${reg.phone.replace(/[^0-9]/g, "")}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 text-[11px] font-semibold hover:bg-emerald-100 transition-colors"
                    >
                      <MessageCircle className="size-3" />
                      WhatsApp
                    </a>
                    <span className="ml-auto text-[10px] text-muted-foreground">
                      {new Date(reg.createdAt).toLocaleDateString("en-GB", {
                        day: "numeric",
                        month: "short",
                      })}
                    </span>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
