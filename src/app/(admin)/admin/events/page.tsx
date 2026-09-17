import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { Calendar, Plus, Users } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db, events } from "@/lib/db";
import { DashboardShell } from "../dashboard/dashboard-shell";
import { EventActionsMenu } from "./event-actions-menu";
import { EventsTable } from "./events-table";

export const metadata = {
  title: "Events & Summits — Admin Portal | PortHarcourtSchools",
};

interface AdminEventsPageProps {
  searchParams: Promise<{
    status?: string;
    type?: string;
    q?: string;
  }>;
}

export default async function AdminEventsPage({
  searchParams,
}: AdminEventsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { status, type, q } = await searchParams;

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(
      eq(
        events.status,
        status as "draft" | "in_review" | "published" | "archived",
      ),
    );
  }
  if (type && type !== "all") {
    conditions.push(
      eq(events.type, type as "summit" | "masterclass" | "workshop" | "awards"),
    );
  }
  if (q) {
    conditions.push(ilike(events.title, `%${q}%`));
  }

  const whereClause =
    conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined;

  const allEvents = await db.query.events.findMany({
    where: whereClause,
    orderBy: [asc(events.sortOrder), desc(events.startDate)],
    with: {
      registrations: true,
    },
  });

  const rawAll = await db.select({ status: events.status }).from(events);
  const totalCount = rawAll.length;
  const publishedCount = rawAll.filter((e) => e.status === "published").length;
  const inReviewCount = rawAll.filter((e) => e.status === "in_review").length;
  const draftCount = rawAll.filter((e) => e.status === "draft").length;
  const totalRegistrations = allEvents.reduce(
    (sum, e) => sum + (e.registrations?.length || 0),
    0,
  );

  const activeStatus = status || "all";

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#151B2E]">
                Events
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
              >
                {totalCount} Total
              </Badge>
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase border-emerald-200 bg-emerald-50 text-emerald-700"
              >
                <Users className="size-3 mr-1" />
                {totalRegistrations} Attendees
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage flagship education summits, awards, executive
              masterclasses, and educator workshops.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/events/registrations">
              <Button
                variant="outline"
                className="h-10 text-xs border-[#D9DEEC] text-[#184098] hover:bg-[#EEF2FA] font-bold"
              >
                <Users className="size-3.5 mr-1.5" />
                Registrations ({totalRegistrations})
              </Button>
            </Link>
            <Link href="/admin/events/new">
              <Button className="h-10 text-xs bg-[#184098] hover:bg-[#08276B] text-white font-bold shadow-xs">
                <Plus className="size-4 mr-1.5" />
                New Event
              </Button>
            </Link>
          </div>
        </div>

        {/* Status & Type Filter Bar */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3 border-b border-[#D9DEEC] pb-3">
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            <Link
              href={`/admin/events?status=all${type ? `&type=${type}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "all"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              All ({totalCount})
            </Link>
            <Link
              href={`/admin/events?status=published${type ? `&type=${type}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "published"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              Published ({publishedCount})
            </Link>
            <Link
              href={`/admin/events?status=in_review${type ? `&type=${type}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "in_review"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              In Review ({inReviewCount})
            </Link>
            <Link
              href={`/admin/events?status=draft${type ? `&type=${type}` : ""}`}
              className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
                activeStatus === "draft"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
              }`}
            >
              Drafts ({draftCount})
            </Link>
          </div>

          {/* Type filter pills */}
          <div className="flex items-center gap-1 overflow-x-auto pb-1 text-xs">
            <span className="text-[11px] uppercase font-bold text-muted-foreground mr-1 shrink-0">
              Format:
            </span>
            <Link
              href={`/admin/events?status=${activeStatus}`}
              className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap transition-colors ${
                !type || type === "all"
                  ? "bg-[#EEF2FA] text-[#184098] font-bold"
                  : "text-muted-foreground hover:text-[#184098] hover:bg-[#FAFBFF]"
              }`}
            >
              All
            </Link>
            {(["summit", "masterclass", "workshop", "awards"] as const).map(
              (t) => (
                <Link
                  key={t}
                  href={`/admin/events?status=${activeStatus}&type=${t}`}
                  className={`px-2.5 py-1 rounded text-[11px] font-semibold whitespace-nowrap capitalize transition-colors ${
                    type === t
                      ? "bg-[#EEF2FA] text-[#184098] font-bold"
                      : "text-muted-foreground hover:text-[#184098] hover:bg-[#FAFBFF]"
                  }`}
                >
                  {t}
                </Link>
              ),
            )}
          </div>
        </div>

        {/* Desktop Events Table (hidden md:block) */}
        <div className="hidden md:block">
          <EventsTable
            events={allEvents.map((event) => ({
              id: event.id,
              title: event.title,
              slug: event.slug,
              type: event.type,
              startDate: event.startDate,
              venue: event.venue,
              isPaid: event.isPaid,
              price: event.price,
              paymentLink: event.paymentLink,
              status: event.status,
              isFeatured: event.isFeatured,
              registrationsCount: event.registrations?.length || 0,
            }))}
          />
        </div>

        {/* Mobile Events Cards (block md:hidden) */}
        <div className="block md:hidden space-y-3">
          {allEvents.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground space-y-2 border-[#D9DEEC] bg-white rounded-lg">
              <Calendar className="size-8 mx-auto text-muted-foreground/50" />
              <p className="font-medium">No events found.</p>
              <p className="text-[11px]">
                Click &ldquo;New Event&rdquo; above to publish your first event.
              </p>
            </Card>
          ) : (
            allEvents.map((event) => (
              <Card
                key={event.id}
                className="p-4 border-[#D9DEEC] bg-white rounded-lg shadow-xs hover:border-[#184098]/30 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant={
                        event.status === "published"
                          ? "success"
                          : event.status === "in_review"
                            ? "amber"
                            : "outline"
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {event.status.replace("_", " ")}
                    </Badge>
                    <Badge
                      variant="outline"
                      className="text-[10px] uppercase font-bold border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
                    >
                      {event.type}
                    </Badge>
                    {event.isPaid ? (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        ₦{event.price?.toLocaleString() ?? "Paid"}
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-semibold border-[#D9DEEC] text-muted-foreground"
                      >
                        Free
                      </Badge>
                    )}
                    {event.isFeatured && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold border-[#C49A45]/40 bg-[#C49A45]/15 text-[#8F6B1E]"
                      >
                        Flagship
                      </Badge>
                    )}
                  </div>

                  <EventActionsMenu
                    eventId={event.id}
                    eventTitle={event.title}
                    eventSlug={event.slug}
                    isPublished={event.status === "published"}
                    isFeatured={event.isFeatured}
                  />
                </div>

                <div>
                  <Link
                    href={`/admin/events/${event.id}/edit`}
                    title={event.title}
                    className="font-bold text-sm text-[#184098] hover:underline line-clamp-1 leading-snug"
                  >
                    {event.title}
                  </Link>
                  <span
                    title={`/events/${event.slug}`}
                    className="font-mono text-[11px] text-muted-foreground block truncate mt-0.5"
                  >
                    /events/{event.slug}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#D9DEEC]/60 text-[11px] text-muted-foreground">
                  <span className="truncate max-w-[170px] font-medium text-[#151B2E]">
                    {event.venue}
                  </span>
                  <span className="shrink-0 font-medium">
                    {new Date(event.startDate).toLocaleDateString("en-GB", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <div className="pt-2 border-t border-[#D9DEEC]/40 flex items-center justify-between">
                  <Link
                    href={`/admin/events/${event.id}/registrations`}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#184098] hover:underline"
                  >
                    <Users className="size-3.5" />
                    <span>
                      {event.registrations?.length || 0} Attendees &amp; CSV
                    </span>
                  </Link>
                  <Link
                    href={`/admin/events/${event.id}/registrations`}
                    className="text-[11px] font-semibold text-[#184098] bg-[#EEF2FA] px-2 py-0.5 rounded border border-[#D9DEEC] hover:bg-[#E2E8F0]"
                  >
                    View Roster →
                  </Link>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
