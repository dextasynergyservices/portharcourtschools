"use client";

import { Menu } from "@base-ui/react/menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  CheckCircle2,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { ContactSubmission } from "@/lib/db";
import {
  bulkDeleteSubmissionsAction,
  bulkUpdateSubmissionStatusAction,
  deleteSubmissionAction,
  updateSubmissionStatusAction,
} from "./actions";
import { SubmissionDetailsDialog } from "./submission-details-dialog";

interface SubmissionsTableProps {
  submissions: ContactSubmission[];
}

const PERSONA_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  parent: {
    label: "Parent",
    bg: "bg-blue-50",
    text: "text-blue-700",
    border: "border-blue-200",
  },
  teacher: {
    label: "Educator",
    bg: "bg-indigo-50",
    text: "text-indigo-700",
    border: "border-indigo-200",
  },
  school: {
    label: "School Leader",
    bg: "bg-emerald-50",
    text: "text-emerald-700",
    border: "border-emerald-200",
  },
  partner: {
    label: "Partner",
    bg: "bg-amber-50",
    text: "text-amber-800",
    border: "border-amber-200",
  },
  other: {
    label: "General",
    bg: "bg-slate-100",
    text: "text-slate-700",
    border: "border-slate-200",
  },
};

export function SubmissionsTable({ submissions }: SubmissionsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [selectedPersona, setSelectedPersona] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Client-side filtering by persona and status before passing to TanStack table
  const filteredData = useMemo(() => {
    return submissions.filter((item) => {
      const matchesPersona =
        selectedPersona === "all" || item.personaType === selectedPersona;
      const matchesStatus =
        selectedStatus === "all" || item.status === selectedStatus;
      return matchesPersona && matchesStatus;
    });
  }, [submissions, selectedPersona, selectedStatus]);

  const handleBulkStatus = (
    selectedRows: ContactSubmission[],
    status: "new" | "read" | "archived",
  ) => {
    startTransition(async () => {
      const ids = selectedRows.map((r) => r.id);
      await bulkUpdateSubmissionStatusAction(ids, status);
      router.refresh();
    });
  };

  const handleBulkDelete = (selectedRows: ContactSubmission[]) => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedRows.length} selected inquiries? This action cannot be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const ids = selectedRows.map((r) => r.id);
      await bulkDeleteSubmissionsAction(ids);
      router.refresh();
    });
  };

  const columns: ColumnDef<ContactSubmission>[] = [
    // 1. Checkbox Selection
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

    // 2. Sender Name & Email
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sender" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        const initials = item.name
          .split(" ")
          .map((n) => n[0])
          .join("")
          .toUpperCase()
          .slice(0, 2);

        return (
          <div className="flex items-center gap-3">
            <div className="size-8 rounded-full bg-[#184098]/10 text-[#184098] font-bold text-xs flex items-center justify-center shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-[#151B2E] text-xs sm:text-sm block truncate">
                {item.name}
              </span>
              <a
                href={`mailto:${item.email}`}
                className="text-[11px] text-muted-foreground hover:text-[#184098] block truncate"
              >
                {item.email}
              </a>
            </div>
          </div>
        );
      },
    },

    // 3. Persona Type Badge
    {
      accessorKey: "personaType",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Inquiring As" />
      ),
      cell: ({ row }) => {
        const persona = row.original.personaType;
        const meta = PERSONA_CONFIG[persona] || PERSONA_CONFIG.other;
        return (
          <Badge
            variant="outline"
            className={`text-[10px] uppercase font-bold tracking-wider ${meta.bg} ${meta.text} ${meta.border}`}
          >
            {meta.label}
          </Badge>
        );
      },
    },

    // 4. Subject & Message Snippet
    {
      accessorKey: "message",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Subject & Message" />
      ),
      cell: ({ row }) => {
        const item = row.original;
        return (
          <div className="max-w-xs md:max-w-md">
            <span className="font-semibold text-xs text-[#151B2E] block truncate">
              {item.subject || "No Subject"}
            </span>
            <span className="text-[11px] text-muted-foreground line-clamp-1">
              {item.message}
            </span>
          </div>
        );
      },
    },

    // 5. Received Date
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Received" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },

    // 6. Status Badge
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        if (status === "new") {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-blue-100 text-blue-800 border border-blue-300">
              <span className="size-1.5 rounded-full bg-blue-600 mr-1 animate-pulse" />
              New
            </span>
          );
        }
        if (status === "read") {
          return (
            <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider bg-slate-100 text-slate-700 border border-slate-200">
              Read
            </span>
          );
        }
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-medium uppercase tracking-wider bg-zinc-100 text-zinc-600 border border-zinc-200">
            Archived
          </span>
        );
      },
    },

    // 7. Actions Menu & View Dialog
    {
      id: "actions",
      cell: ({ row }) => {
        const item = row.original;

        return (
          <div className="flex items-center justify-end gap-1">
            <SubmissionDetailsDialog
              submission={item}
              onUpdated={() => router.refresh()}
            />

            <Menu.Root>
              <Menu.Trigger
                type="button"
                className="inline-flex size-8 items-center justify-center rounded-[4px] text-muted-foreground hover:text-[#184098] hover:bg-[#EEF2FA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#184098]/30"
                aria-label="Actions"
              >
                <MoreHorizontal className="size-4" />
              </Menu.Trigger>

              <Menu.Portal>
                <Menu.Positioner
                  side="bottom"
                  align="end"
                  sideOffset={4}
                  className="z-50"
                >
                  <Menu.Popup className="min-w-[180px] rounded-md border border-[#D9DEEC] bg-white p-1.5 shadow-xl text-xs outline-none animate-in fade-in zoom-in-95">
                    <a
                      href={`mailto:${item.email}?subject=${encodeURIComponent(
                        `Re: ${item.subject || "Inquiry at PortHarcourtSchools"}`,
                      )}`}
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                    >
                      <Mail className="size-3.5 text-muted-foreground" />
                      <span>Reply via Email</span>
                    </a>

                    {item.phone && (
                      <a
                        href={`https://wa.me/${item.phone.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                      >
                        <MessageSquare className="size-3.5 text-emerald-600" />
                        <span>Chat WhatsApp</span>
                      </a>
                    )}

                    <Menu.Separator className="my-1 h-px bg-[#D9DEEC]" />

                    {item.status !== "read" && (
                      <Menu.Item
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                        onClick={() => {
                          startTransition(async () => {
                            await updateSubmissionStatusAction(item.id, "read");
                            router.refresh();
                          });
                        }}
                      >
                        <CheckCircle2 className="size-3.5 text-blue-600" />
                        <span>Mark as Read</span>
                      </Menu.Item>
                    )}

                    {item.status !== "archived" && (
                      <Menu.Item
                        className="flex items-center gap-2 px-2.5 py-1.5 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                        onClick={() => {
                          startTransition(async () => {
                            await updateSubmissionStatusAction(
                              item.id,
                              "archived",
                            );
                            router.refresh();
                          });
                        }}
                      >
                        <Archive className="size-3.5 text-slate-600" />
                        <span>Archive Inquiry</span>
                      </Menu.Item>
                    )}

                    <Menu.Separator className="my-1 h-px bg-[#D9DEEC]" />

                    <Menu.Item
                      className="flex items-center gap-2 px-2.5 py-1.5 rounded text-red-600 hover:bg-red-50 cursor-pointer outline-none select-none transition-colors"
                      onClick={() => {
                        if (
                          confirm(
                            "Are you sure you want to delete this submission?",
                          )
                        ) {
                          startTransition(async () => {
                            await deleteSubmissionAction(item.id);
                            router.refresh();
                          });
                        }
                      }}
                    >
                      <Trash2 className="size-3.5" />
                      <span>Delete Inquiry</span>
                    </Menu.Item>
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={filteredData}
      searchKey="name"
      searchPlaceholder="Search by sender name or email..."
      filterSlot={
        <div className="flex flex-wrap items-center gap-2">
          {/* Persona Filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md border border-border/50 text-xs">
            <span className="text-muted-foreground px-2 text-[11px] font-semibold">
              Type:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "parent", label: "Parent" },
              { id: "teacher", label: "Educator" },
              { id: "school", label: "School" },
              { id: "partner", label: "Partner" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedPersona(tab.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                  selectedPersona === tab.id
                    ? "bg-white text-[#184098] shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md border border-border/50 text-xs">
            <span className="text-muted-foreground px-2 text-[11px] font-semibold">
              Status:
            </span>
            {[
              { id: "all", label: "All" },
              { id: "new", label: "New" },
              { id: "read", label: "Read" },
              { id: "archived", label: "Archived" },
            ].map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => setSelectedStatus(tab.id)}
                className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                  selectedStatus === tab.id
                    ? "bg-white text-[#184098] shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      }
      renderBulkActions={(selectedRows) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleBulkStatus(selectedRows, "read")}
            className="h-8 text-xs font-semibold text-slate-700"
          >
            <CheckCircle2 className="size-3.5 mr-1 text-blue-600" />
            Mark Read ({selectedRows.length})
          </Button>

          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleBulkStatus(selectedRows, "archived")}
            className="h-8 text-xs font-semibold text-slate-700"
          >
            <Archive className="size-3.5 mr-1" />
            Archive ({selectedRows.length})
          </Button>

          <Button
            size="sm"
            variant="ghost"
            disabled={isPending}
            onClick={() => handleBulkDelete(selectedRows)}
            className="h-8 text-xs font-semibold text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="size-3.5 mr-1" />
            Delete ({selectedRows.length})
          </Button>
        </div>
      )}
    />
  );
}
