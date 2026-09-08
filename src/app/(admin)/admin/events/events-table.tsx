"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, MapPin, Users } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { EventActionsMenu } from "./event-actions-menu";

export interface EventRowData {
  id: string;
  title: string;
  slug: string;
  type: string;
  startDate: Date | string;
  venue: string;
  isPaid: boolean;
  price: number | null;
  paymentLink: string | null;
  status: string;
  registrationsCount: number;
}

interface EventsTableProps {
  events: EventRowData[];
}

export function EventsTable({ events }: EventsTableProps) {
  const columns: ColumnDef<EventRowData>[] = [
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event Title" />
      ),
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="max-w-[280px] lg:max-w-md">
            <Link
              href={`/admin/events/${event.id}/edit`}
              title={event.title}
              className="font-bold text-sm text-[#184098] hover:underline block truncate leading-snug"
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
        );
      },
    },
    {
      accessorKey: "type",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Format" />
      ),
      cell: ({ row }) => (
        <Badge
          variant="outline"
          className="text-[10px] uppercase font-bold border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
        >
          {row.original.type}
        </Badge>
      ),
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date & Venue" />
      ),
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="text-xs text-[#151B2E]">
            <div className="font-medium flex items-center gap-1.5">
              <Calendar className="size-3 text-[#184098]" />
              {new Date(event.startDate).toLocaleDateString("en-GB", {
                day: "numeric",
                month: "short",
                year: "numeric",
              })}
            </div>
            <div className="text-[11px] text-muted-foreground truncate max-w-[180px] flex items-center gap-1 mt-0.5">
              <MapPin className="size-2.5 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "price",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Admission" />
      ),
      cell: ({ row }) => {
        const event = row.original;
        if (!event.isPaid) {
          return (
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-semibold border-[#D9DEEC] text-muted-foreground"
            >
              Free
            </Badge>
          );
        }
        return (
          <div className="space-y-0.5">
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-bold border-emerald-200 bg-emerald-50 text-emerald-700"
            >
              ₦{event.price?.toLocaleString() ?? "Paid"}
            </Badge>
            {event.paymentLink && (
              <span className="text-[10px] text-muted-foreground block truncate max-w-[120px]">
                Online Checkout
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "registrationsCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Registrations" />
      ),
      cell: ({ row }) => {
        const event = row.original;
        return (
          <Link
            href={`/admin/events/${event.id}/registrations`}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-semibold border border-[#D9DEEC] bg-[#F4F6FC] text-[#184098] hover:bg-[#EEF2FA] hover:border-[#184098]/30 transition-colors group"
            title={`View & export ${event.registrationsCount} registrations`}
          >
            <Users className="size-3.5 text-[#184098]" />
            <span className="font-bold">{event.registrationsCount}</span>
            <span className="text-[10px] text-muted-foreground group-hover:text-[#184098]">
              {event.registrationsCount === 1 ? "attendee" : "attendees"}
            </span>
          </Link>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        return (
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
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="text-right">
            <EventActionsMenu
              eventId={event.id}
              eventTitle={event.title}
              eventSlug={event.slug}
              isPublished={event.status === "published"}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={events}
      searchKey="title"
      searchPlaceholder="Filter events by title..."
    />
  );
}
