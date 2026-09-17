"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Calendar, CheckCircle2, School, Trash2, XCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import {
  RegistrationActionsMenu,
  type RegistrationItemData,
} from "@/components/admin/events/registration-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bulkDeleteRegistrationsAction,
  bulkUpdateRegistrationsStatusAction,
} from "../actions";

export type RegistrationRowData = RegistrationItemData;

interface RegistrationsTableProps {
  registrations: RegistrationRowData[];
}

export function RegistrationsTable({ registrations }: RegistrationsTableProps) {
  const router = useRouter();
  const [data, setData] = useState<RegistrationRowData[]>(registrations);
  const [isBulkPending, setIsBulkPending] = useState(false);

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

  useEffect(() => {
    setData(registrations);
  }, [registrations]);

  const executeBulkStatus = async (
    selectedRows: RegistrationRowData[],
    newStatus: "confirmed" | "pending_payment" | "cancelled",
    clearSelection: () => void,
  ) => {
    setIsBulkPending(true);
    try {
      const ids = selectedRows.map((r) => r.id);
      const res = await bulkUpdateRegistrationsStatusAction(ids, newStatus);
      if (res.success) {
        toast.success(
          `Successfully updated ${res.count} registration(s) to ${newStatus}.`,
        );
        setData((prev) =>
          prev.map((r) =>
            ids.includes(r.id) ? { ...r, status: newStatus } : r,
          ),
        );
        clearSelection();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update registrations.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleBulkStatus = (
    selectedRows: RegistrationRowData[],
    newStatus: "confirmed" | "pending_payment" | "cancelled",
    clearSelection: () => void,
  ) => {
    if (newStatus === "cancelled") {
      setConfirmDialog({
        open: true,
        title: `Cancel ${selectedRows.length} Registration${selectedRows.length === 1 ? "" : "s"}`,
        variant: "warning",
        confirmLabel: "Cancel Registrations",
        description: (
          <>
            Are you sure you want to mark{" "}
            <strong className="text-[#151B2E]">{selectedRows.length}</strong>{" "}
            selected registration{selectedRows.length === 1 ? "" : "s"} as
            cancelled? Attendees will be marked as cancelled.
          </>
        ),
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          try {
            await executeBulkStatus(selectedRows, "cancelled", clearSelection);
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
    selectedRows: RegistrationRowData[],
    clearSelection: () => void,
  ) => {
    setIsBulkPending(true);
    try {
      const ids = selectedRows.map((r) => r.id);
      const res = await bulkDeleteRegistrationsAction(ids);
      if (res.success) {
        toast.success(`Successfully deleted ${res.count} registration(s).`);
        setData((prev) => prev.filter((r) => !ids.includes(r.id)));
        clearSelection();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete registrations.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleBulkDelete = (
    selectedRows: RegistrationRowData[],
    clearSelection: () => void,
  ) => {
    setConfirmDialog({
      open: true,
      title: `Permanently Delete ${selectedRows.length} Registration${selectedRows.length === 1 ? "" : "s"}`,
      variant: "destructive",
      confirmLabel: "Delete Registrations",
      description: (
        <>
          Are you sure you want to permanently delete{" "}
          <strong className="text-[#151B2E]">{selectedRows.length}</strong>{" "}
          selected registration{selectedRows.length === 1 ? "" : "s"}? Attendee
          records and ticket barcodes will be permanently purged. This action
          cannot be undone.
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

  const columns: ColumnDef<RegistrationRowData>[] = [
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
      accessorKey: "fullName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Attendee" />
      ),
      cell: ({ row }) => {
        const reg = row.original;
        const initials = reg.fullName
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div className="flex items-center gap-2.5">
            <div className="size-8 rounded-full bg-[#EEF2FA] text-[#184098] flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div className="min-w-0">
              <span className="font-bold text-sm text-[#151B2E] block truncate">
                {reg.fullName}
              </span>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase font-bold border-[#D9DEEC] text-muted-foreground px-1.5 py-0"
                >
                  {reg.role.replace("_", " ")}
                </Badge>
                <span className="text-[11px] text-muted-foreground truncate">
                  {reg.email}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },
    {
      id: "event",
      accessorFn: (row) => row.event?.title || "N/A",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Event" />
      ),
      cell: ({ row }) => {
        const reg = row.original;
        if (!reg.event) {
          return (
            <span className="text-muted-foreground italic text-xs">
              Unknown Event
            </span>
          );
        }

        return (
          <div className="text-xs">
            <Link
              href={`/admin/events/${reg.event.id}/edit`}
              className="font-bold text-[#184098] hover:underline block truncate max-w-[220px]"
              title={reg.event.title}
            >
              {reg.event.title}
            </Link>
            <div className="flex items-center gap-1 text-[11px] text-muted-foreground mt-0.5">
              <Calendar className="size-3 text-[#184098]" />
              <span>
                {new Date(reg.event.startDate).toLocaleDateString("en-GB", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                })}
              </span>
              <Badge
                variant="outline"
                className="text-[9px] uppercase font-bold border-[#D9DEEC] bg-[#F4F6FC] text-[#184098] px-1 py-0 ml-1"
              >
                {reg.event.type}
              </Badge>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "schoolName",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="School / Org" />
      ),
      cell: ({ row }) => {
        const reg = row.original;
        return (
          <div className="space-y-0.5 max-w-[180px] text-xs">
            {reg.schoolName ? (
              <span className="flex items-center gap-1 font-medium text-[#151B2E] truncate">
                <School className="size-3 text-[#184098] shrink-0" />
                <span className="truncate">{reg.schoolName}</span>
              </span>
            ) : (
              <span className="text-muted-foreground italic">Independent</span>
            )}
            {reg.notes && (
              <p
                title={reg.notes}
                className="text-[10px] text-muted-foreground truncate"
              >
                &ldquo;{reg.notes}&rdquo;
              </p>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "totalAmount",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tickets & Amount" />
      ),
      cell: ({ row }) => {
        const reg = row.original;
        return (
          <div className="text-xs">
            <div className="font-bold text-[#151B2E]">
              {reg.totalAmount > 0
                ? `₦${reg.totalAmount.toLocaleString()}`
                : "Free Admission"}
            </div>
            <div className="flex items-center gap-1.5 mt-0.5 flex-wrap">
              <span className="text-[11px] text-muted-foreground">
                {reg.ticketQuantity}{" "}
                {reg.ticketQuantity === 1 ? "ticket" : "tickets"}
              </span>
              {reg.ticketTierName && (
                <Badge
                  variant="outline"
                  className="text-[9px] font-bold border-[#184098]/30 bg-[#EEF2FA] text-[#184098] px-1 py-0"
                >
                  {reg.ticketTierName}
                </Badge>
              )}
            </div>
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
              status === "confirmed"
                ? "success"
                : status === "pending_payment"
                  ? "amber"
                  : "outline"
            }
            className="text-[10px] uppercase font-bold"
          >
            {status.replace("_", " ")}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const dateVal = row.original.createdAt;
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(dateVal).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const reg = row.original;
        return (
          <div className="text-right">
            <RegistrationActionsMenu registration={reg} />
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={data}
        searchKey="fullName"
        searchPlaceholder="Search attendee name, email..."
        renderBulkActions={(selectedRows, { clearSelection }) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isBulkPending}
              onClick={() =>
                handleBulkStatus(selectedRows, "confirmed", clearSelection)
              }
              className="h-8 text-xs bg-white text-[#184098] hover:bg-[#EEF2FA] border-none font-bold"
            >
              <CheckCircle2 className="size-3.5 mr-1 text-emerald-600" />
              Confirm Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBulkPending}
              onClick={() =>
                handleBulkStatus(selectedRows, "cancelled", clearSelection)
              }
              className="h-8 text-xs bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 border-amber-400/30 font-semibold"
            >
              <XCircle className="size-3.5 mr-1" />
              Cancel Selected
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
    </>
  );
}
