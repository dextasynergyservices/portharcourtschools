"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { Archive, CheckCircle2, FileEdit, Trash2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useEffect, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bulkDeleteProgrammesAction,
  bulkUpdateProgrammesStatusAction,
} from "./actions";
import { ProgrammeActionsMenu } from "./programme-actions-menu";

export interface ProgrammeRowData {
  id: string;
  title: string;
  slug: string;
  provider: string;
  category: string | null;
  isAccredited: boolean;
  status: string;
}

interface ProgrammesTableProps {
  programmes: ProgrammeRowData[];
}

export function ProgrammesTable({ programmes }: ProgrammesTableProps) {
  const router = useRouter();
  const [data, setData] = useState<ProgrammeRowData[]>(programmes);
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
    setData(programmes);
  }, [programmes]);

  const executeBulkStatus = async (
    selectedRows: ProgrammeRowData[],
    newStatus: "draft" | "published" | "archived",
    clearSelection: () => void,
  ) => {
    setIsBulkPending(true);
    try {
      const ids = selectedRows.map((p) => p.id);
      const res = await bulkUpdateProgrammesStatusAction(ids, newStatus);
      if (res.success) {
        toast.success(
          `Successfully updated ${res.count} programme(s) to ${newStatus}.`,
        );
        setData((prev) =>
          prev.map((p) =>
            ids.includes(p.id) ? { ...p, status: newStatus } : p,
          ),
        );
        clearSelection();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update programmes.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleBulkStatus = (
    selectedRows: ProgrammeRowData[],
    newStatus: "draft" | "published" | "archived",
    clearSelection: () => void,
  ) => {
    if (newStatus === "archived") {
      setConfirmDialog({
        open: true,
        title: `Archive ${selectedRows.length} Programme${selectedRows.length === 1 ? "" : "s"}`,
        variant: "warning",
        confirmLabel: "Archive Programmes",
        description: (
          <>
            Are you sure you want to archive{" "}
            <strong className="text-[#151B2E]">{selectedRows.length}</strong>{" "}
            selected programme{selectedRows.length === 1 ? "" : "s"}? They will
            be hidden from the public programmes catalogue.
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
    selectedRows: ProgrammeRowData[],
    clearSelection: () => void,
  ) => {
    setIsBulkPending(true);
    try {
      const ids = selectedRows.map((p) => p.id);
      const res = await bulkDeleteProgrammesAction(ids);
      if (res.success) {
        toast.success(`Successfully deleted ${res.count} programme(s).`);
        setData((prev) => prev.filter((p) => !ids.includes(p.id)));
        clearSelection();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete programmes.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleBulkDelete = (
    selectedRows: ProgrammeRowData[],
    clearSelection: () => void,
  ) => {
    setConfirmDialog({
      open: true,
      title: `Permanently Delete ${selectedRows.length} Programme${selectedRows.length === 1 ? "" : "s"}`,
      variant: "destructive",
      confirmLabel: "Delete Programmes Permanently",
      description: (
        <>
          Are you sure you want to permanently delete{" "}
          <strong className="text-[#151B2E]">{selectedRows.length}</strong>{" "}
          selected programme{selectedRows.length === 1 ? "" : "s"}? All course
          modules and registrations will be removed. This action cannot be
          undone.
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

  const columns: ColumnDef<ProgrammeRowData>[] = [
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
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Programme Title" />
      ),
      cell: ({ row }) => {
        const prog = row.original;
        return (
          <div className="max-w-[280px] lg:max-w-md">
            <Link
              href={`/admin/programmes/${prog.id}/edit`}
              title={prog.title}
              className="font-bold text-sm text-[#184098] hover:underline block truncate leading-snug"
            >
              {prog.title}
            </Link>
            <span className="font-mono text-[11px] text-muted-foreground block truncate mt-0.5">
              {prog.slug}
            </span>
          </div>
        );
      },
    },
    {
      accessorKey: "provider",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Provider / Partner" />
      ),
      cell: ({ row }) => (
        <span className="text-xs font-medium text-[#151B2E]">
          {row.original.provider}
        </span>
      ),
    },
    {
      accessorKey: "category",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-muted-foreground">
          {row.original.category || "General CPD"}
        </span>
      ),
    },
    {
      accessorKey: "isAccredited",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Accredited" />
      ),
      cell: ({ row }) => {
        const accredited = row.original.isAccredited;
        return accredited ? (
          <Badge
            variant="outline"
            className="text-[10px] uppercase font-bold border-emerald-200 bg-emerald-50 text-emerald-700 inline-flex items-center gap-1"
          >
            <CheckCircle2 className="size-3" /> TRCN Certified
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Unaccredited
          </span>
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
            variant={status === "published" ? "success" : "outline"}
            className="text-[10px] uppercase font-bold"
          >
            {status}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const prog = row.original;
        return (
          <div className="text-right">
            <ProgrammeActionsMenu
              programmeId={prog.id}
              programmeTitle={prog.title}
            />
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
        searchKey="title"
        searchPlaceholder="Filter programmes by title..."
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
