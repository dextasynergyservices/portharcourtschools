"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileEdit,
  GripVertical,
  ListOrdered,
  MapPin,
  RotateCcw,
  Save,
  Star,
  Table as TableIcon,
  Trash2,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bulkDeleteEventsAction,
  bulkUpdateEventsStatusAction,
  reorderEventsAction,
} from "./actions";
import { EventActionsMenu } from "./event-actions-menu";

export interface EventRowData {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "in_review" | "published" | "archived";
  type: string;
  startDate: Date | string;
  venue?: string | null;
  isPaid?: boolean;
  price?: number | null;
  paymentLink?: string | null;
  registrationsCount?: number;
  isFeatured?: boolean;
  sortOrder?: number;
  publishedAt?: Date | string | null;
  createdAt?: Date | string;
}

interface EventsTableProps {
  events: EventRowData[];
}

export function EventsTable({ events }: EventsTableProps) {
  const router = useRouter();
  const [items, setItems] = useState<EventRowData[]>(events);
  const [viewMode, setViewMode] = useState<"table" | "reorder">("table");
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkPending, setIsBulkPending] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Professional Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "destructive" | "warning" | "default" | "success";
    isLoading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const hasChanges = items.some(
    (item, index) => (item.sortOrder ?? index) !== index,
  );

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updated = reordered.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));
    setItems(updated);
  };

  const handleReset = () => {
    setItems(events);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      const orderedIds = items.map((item) => item.id);
      const res = await reorderEventsAction(orderedIds);
      if (res.success) {
        toast.success("Event display order saved successfully.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update event order.");
      }
    } catch {
      toast.error("Failed to update event order.");
    } finally {
      setIsSaving(false);
    }
  };

  const executeBulkStatus = async (
    selectedRows: EventRowData[],
    newStatus: "draft" | "in_review" | "published" | "archived",
    clearSelection: () => void,
  ) => {
    setIsBulkPending(true);
    try {
      const ids = selectedRows.map((e) => e.id);
      const res = await bulkUpdateEventsStatusAction(ids, newStatus);
      if (res.success) {
        toast.success(
          `Successfully updated ${res.count} event(s) to ${newStatus}.`,
        );
        setItems((prev) =>
          prev.map((e) =>
            ids.includes(e.id) ? { ...e, status: newStatus } : e,
          ),
        );
        clearSelection();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update events.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleBulkStatus = (
    selectedRows: EventRowData[],
    newStatus: "draft" | "in_review" | "published" | "archived",
    clearSelection: () => void,
  ) => {
    if (newStatus === "archived") {
      setConfirmDialog({
        open: true,
        title: `Archive ${selectedRows.length} Event${selectedRows.length === 1 ? "" : "s"}`,
        variant: "warning",
        confirmLabel: "Archive Events",
        description: (
          <>
            Are you sure you want to archive{" "}
            <strong className="text-[#151B2E]">{selectedRows.length}</strong>{" "}
            selected event{selectedRows.length === 1 ? "" : "s"}? They will be
            hidden from the live public events directory.
          </>
        ),
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          try {
            await executeBulkStatus(selectedRows, "archived", clearSelection);
            setConfirmDialog((prev) => ({ ...prev, open: false }));
          } finally {
            setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          }
        },
      });
      return;
    }

    executeBulkStatus(selectedRows, newStatus, clearSelection);
  };

  const executeBulkDelete = async (
    selectedRows: EventRowData[],
    clearSelection: () => void,
  ) => {
    setIsBulkPending(true);
    try {
      const ids = selectedRows.map((e) => e.id);
      const res = await bulkDeleteEventsAction(ids);
      if (res.success) {
        toast.success(`Successfully deleted ${res.count} event(s).`);
        setItems((prev) => prev.filter((e) => !ids.includes(e.id)));
        clearSelection();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete events.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleBulkDelete = (
    selectedRows: EventRowData[],
    clearSelection: () => void,
  ) => {
    setConfirmDialog({
      open: true,
      title: `Permanently Delete ${selectedRows.length} Event${selectedRows.length === 1 ? "" : "s"}`,
      variant: "destructive",
      confirmLabel: "Delete Events Permanently",
      description: (
        <>
          Are you sure you want to permanently delete{" "}
          <strong className="text-[#151B2E]">{selectedRows.length}</strong>{" "}
          selected event{selectedRows.length === 1 ? "" : "s"}? All registration
          records and attendee passes will also be removed. This action cannot
          be undone.
        </>
      ),
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await executeBulkDelete(selectedRows, clearSelection);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const columns: ColumnDef<EventRowData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          aria-label="Select all"
          className="size-3.5 accent-[#184098] rounded cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          aria-label="Select row"
          className="size-3.5 accent-[#184098] rounded cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "rank",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="#" />
      ),
      cell: ({ row }) => {
        const idx = row.index + 1;
        return (
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
              idx === 1
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "text-muted-foreground bg-muted"
            }`}
          >
            #{idx}
          </span>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event Title" />
      ),
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="max-w-[280px] lg:max-w-md">
            <div className="flex items-center gap-1.5 flex-wrap">
              <Link
                href={`/admin/events/${event.id}/edit`}
                title={event.title}
                className="font-bold text-sm text-[#184098] hover:underline truncate leading-snug"
              >
                {event.title}
              </Link>
              {event.isFeatured && (
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase font-bold border-[#C49A45]/40 bg-[#C49A45]/15 text-[#8F6B1E] shrink-0 h-4 px-1.5"
                >
                  <Star className="size-2.5 mr-0.5 text-[#C49A45] fill-current" />
                  Flagship
                </Badge>
              )}
            </div>
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
        <DataTableColumnHeader column={column} title="Type" />
      ),
      cell: ({ row }) => {
        const type = row.original.type;
        return (
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-semibold capitalize bg-[#FAFBFF] text-[#151B2E] border-[#D9DEEC]"
          >
            {type}
          </Badge>
        );
      },
    },
    {
      accessorKey: "startDate",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date & Venue" />
      ),
      cell: ({ row }) => {
        const event = row.original;
        return (
          <div className="text-xs space-y-0.5">
            <div className="flex items-center gap-1 text-[#151B2E] font-medium whitespace-nowrap">
              <Calendar className="size-3 text-muted-foreground" />
              <span>
                {new Date(event.startDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground truncate max-w-[180px]">
              <MapPin className="size-2.5 shrink-0" />
              <span className="truncate">{event.venue}</span>
            </div>
          </div>
        );
      },
    },
    {
      id: "admission",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Admission" />
      ),
      cell: ({ row }) => {
        const event = row.original;
        if (!event.isPaid || !event.price || event.price === 0) {
          return (
            <Badge
              variant="outline"
              className="text-[10px] bg-emerald-50 text-emerald-800 border-emerald-200 font-bold"
            >
              Free
            </Badge>
          );
        }
        return (
          <span className="font-mono font-bold text-xs text-[#184098]">
            ₦{event.price.toLocaleString()}
          </span>
        );
      },
    },
    {
      accessorKey: "registrationsCount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Signups" />
      ),
      cell: ({ row }) => {
        const count = row.original.registrationsCount;
        return (
          <div className="flex items-center gap-1 text-xs font-semibold text-[#151B2E]">
            <Users className="size-3 text-muted-foreground" />
            <span>{count}</span>
          </div>
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
          <EventActionsMenu
            eventId={event.id}
            eventTitle={event.title}
            eventSlug={event.slug}
            isPublished={event.status === "published"}
            isFeatured={event.isFeatured}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar with Mode Switcher & Reorder Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#D9DEEC] bg-white shadow-xs">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md bg-[#F5F4F0] p-1 border border-[#D9DEEC]">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                viewMode === "table"
                  ? "bg-white text-[#184098] shadow-xs"
                  : "text-[#55627D] hover:text-[#151B2E]"
              }`}
            >
              <TableIcon className="size-3.5" />
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("reorder")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                viewMode === "reorder"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-[#55627D] hover:text-[#184098]"
              }`}
            >
              <ListOrdered className="size-3.5" />
              Drag & Reorder
            </button>
          </div>
          <span className="text-xs text-muted-foreground hidden lg:inline">
            {viewMode === "reorder"
              ? "Drag cards to change display priority on the events page"
              : `${items.length} events`}
          </span>
        </div>

        {viewMode === "reorder" && (
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="h-8 text-xs font-semibold border-[#D9DEEC] text-muted-foreground"
              >
                <RotateCcw className="size-3.5 mr-1" />
                Reset
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSaveOrder}
              disabled={isSaving || !hasChanges}
              className="h-8 text-xs font-bold bg-[#184098] hover:bg-[#15327A] text-white shadow-xs"
            >
              <Save className="size-3.5 mr-1.5" />
              {isSaving ? "Saving Order..." : "Save New Order"}
            </Button>
          </div>
        )}
      </div>

      {viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={items}
          searchKey="title"
          searchPlaceholder="Filter by event title..."
          renderBulkActions={(selectedRows, { clearSelection }) => (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isBulkPending}
                onClick={() =>
                  handleBulkStatus(selectedRows, "published", clearSelection)
                }
                className="h-8 text-xs bg-white text-[#184098] hover:bg-[#EEF2FA] border-none font-bold"
              >
                <CheckCircle2 className="size-3.5 mr-1 text-emerald-600" />
                Publish Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isBulkPending}
                onClick={() =>
                  handleBulkStatus(selectedRows, "draft", clearSelection)
                }
                className="h-8 text-xs bg-white/10 text-white hover:bg-white/20 border-white/20 font-semibold"
              >
                <FileEdit className="size-3.5 mr-1" />
                Move to Draft
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isBulkPending}
                onClick={() =>
                  handleBulkStatus(selectedRows, "archived", clearSelection)
                }
                className="h-8 text-xs bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 border-amber-400/30 font-semibold"
              >
                <Archive className="size-3.5 mr-1" />
                Archive Selected
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isBulkPending}
                onClick={() => handleBulkDelete(selectedRows, clearSelection)}
                className="h-8 text-xs font-bold"
              >
                <Trash2 className="size-3.5 mr-1" />
                Delete Selected
              </Button>
            </div>
          )}
        />
      ) : (
        <div className="space-y-2.5">
          <div className="p-3 bg-[#EEF2FA]/70 border border-[#184098]/20 rounded-lg text-xs text-[#184098] flex items-center justify-between">
            <span>
              💡 <strong>Tip:</strong> The <strong>#1 Event</strong> is given
              top billing and featured spotlight presentation on the events
              directory.
            </span>
            {hasChanges && (
              <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="space-y-2">
            {items.map((event, index) => {
              const isFirst = index === 0;
              const isLast = index === items.length - 1;
              const isBeingDragged = draggedIdx === index;

              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: drag and drop item
                <div
                  key={event.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIdx(index);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIdx !== null && draggedIdx !== index) {
                      moveItem(draggedIdx, index);
                    }
                    setDraggedIdx(null);
                  }}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`flex items-center gap-3 p-3.5 rounded-lg border bg-white shadow-xs transition-all select-none ${
                    isBeingDragged
                      ? "opacity-40 border-dashed border-[#184098] scale-[0.99]"
                      : isFirst
                        ? "border-amber-300 bg-amber-50/20 hover:border-amber-400"
                        : "border-[#D9DEEC] hover:border-[#184098]/40 hover:shadow-sm"
                  }`}
                >
                  {/* Drag Handle */}
                  <div
                    title="Drag to reposition"
                    className="p-1 rounded text-[#8F9BB3] hover:text-[#184098] hover:bg-[#EEF2FA] cursor-grab active:cursor-grabbing shrink-0"
                  >
                    <GripVertical className="size-4" />
                  </div>

                  {/* Rank Badge */}
                  <div className="shrink-0">
                    <span
                      className={`font-mono text-xs font-black px-2.5 py-1 rounded-md block text-center min-w-[38px] ${
                        isFirst
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-[#F5F4F0] text-[#151B2E] border border-[#D9DEEC]"
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </div>

                  {/* Event Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      {event.isFeatured && (
                        <Badge
                          variant="outline"
                          className="text-[9px] uppercase font-bold border-[#C49A45]/40 bg-[#C49A45]/15 text-[#8F6B1E]"
                        >
                          <Star className="size-2.5 mr-0.5 text-[#C49A45] fill-current" />
                          Flagship
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-semibold capitalize bg-[#FAFBFF] text-[#151B2E] border-[#D9DEEC]"
                      >
                        {event.type}
                      </Badge>
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
                    </div>
                    <p className="font-bold text-sm text-[#151B2E] truncate">
                      {event.title}
                    </p>
                    <p className="text-[11px] text-muted-foreground truncate flex items-center gap-2">
                      <span>{event.venue}</span>
                      <span>•</span>
                      <span>
                        {new Date(event.startDate).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </span>
                    </p>
                  </div>

                  {/* Move Up / Move Down Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveItem(index, index - 1)}
                      disabled={isFirst}
                      title="Move up"
                      className="p-1.5 rounded text-[#55627D] hover:text-[#184098] hover:bg-[#EEF2FA] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, index + 1)}
                      disabled={isLast}
                      title="Move down"
                      className="p-1.5 rounded text-[#55627D] hover:text-[#184098] hover:bg-[#EEF2FA] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        isLoading={confirmDialog.isLoading}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
