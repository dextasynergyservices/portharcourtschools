"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  CheckCircle2,
  ExternalLink,
  Image as ImageIcon,
  Trash2,
  XCircle,
} from "lucide-react";
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
  bulkDeletePartnersAction,
  bulkUpdatePartnersActiveAction,
} from "./actions";
import { PartnerActionsMenu } from "./partner-actions-menu";

export interface PartnerRowData {
  id: string;
  name: string;
  logo: string;
  tier: string;
  website: string | null;
  description: string | null;
  isActive: boolean;
  order: number;
  createdAt: Date | string;
}

interface PartnersTableProps {
  partners: PartnerRowData[];
}

export function PartnersTable({ partners }: PartnersTableProps) {
  const router = useRouter();
  const [data, setData] = useState<PartnerRowData[]>(partners);
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
    setData(partners);
  }, [partners]);

  const executeBulkToggleActive = async (
    selectedRows: PartnerRowData[],
    isActive: boolean,
    clearSelection: () => void,
  ) => {
    setIsBulkPending(true);
    try {
      const ids = selectedRows.map((p) => p.id);
      const res = await bulkUpdatePartnersActiveAction(ids, isActive);
      if (res.success) {
        toast.success(
          `Successfully ${isActive ? "activated" : "deactivated"} ${res.count} partner(s).`,
        );
        setData((prev) =>
          prev.map((p) => (ids.includes(p.id) ? { ...p, isActive } : p)),
        );
        clearSelection();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update partners.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleBulkToggleActive = (
    selectedRows: PartnerRowData[],
    isActive: boolean,
    clearSelection: () => void,
  ) => {
    if (!isActive) {
      setConfirmDialog({
        open: true,
        title: `Deactivate ${selectedRows.length} Partner${selectedRows.length === 1 ? "" : "s"}`,
        variant: "warning",
        confirmLabel: "Deactivate Partners",
        description: (
          <>
            Are you sure you want to deactivate{" "}
            <strong className="text-[#151B2E]">{selectedRows.length}</strong>{" "}
            selected partner{selectedRows.length === 1 ? "" : "s"}? Their logos
            will be hidden from the website marquee and directory.
          </>
        ),
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          try {
            await executeBulkToggleActive(selectedRows, false, clearSelection);
            setConfirmDialog((prev) => ({ ...prev, open: false }));
          } finally {
            setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          }
        },
      });
      return;
    }

    executeBulkToggleActive(selectedRows, true, clearSelection);
  };

  const executeBulkDelete = async (
    selectedRows: PartnerRowData[],
    clearSelection: () => void,
  ) => {
    setIsBulkPending(true);
    try {
      const ids = selectedRows.map((p) => p.id);
      const res = await bulkDeletePartnersAction(ids);
      if (res.success) {
        toast.success(`Successfully deleted ${res.count} partner(s).`);
        setData((prev) => prev.filter((p) => !ids.includes(p.id)));
        clearSelection();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete partners.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleBulkDelete = (
    selectedRows: PartnerRowData[],
    clearSelection: () => void,
  ) => {
    setConfirmDialog({
      open: true,
      title: `Permanently Delete ${selectedRows.length} Partner${selectedRows.length === 1 ? "" : "s"}`,
      variant: "destructive",
      confirmLabel: "Delete Partners Permanently",
      description: (
        <>
          Are you sure you want to permanently delete{" "}
          <strong className="text-[#151B2E]">{selectedRows.length}</strong>{" "}
          selected partner{selectedRows.length === 1 ? "" : "s"}? All
          partnership details and media associations will be removed. This
          action cannot be undone.
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

  const columns: ColumnDef<PartnerRowData>[] = [
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
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Partner Organization" />
      ),
      cell: ({ row }) => {
        const partner = row.original;
        return (
          <div className="flex items-center gap-3 max-w-[320px]">
            {/* Logo box */}
            <div className="size-10 rounded border border-[#D9DEEC] bg-[#F8FAFC] flex items-center justify-center p-1 shrink-0 overflow-hidden">
              {partner.logo ? (
                // biome-ignore lint/performance/noImgElement: Dynamic partner logo thumbnail
                <img
                  src={partner.logo}
                  alt={partner.name}
                  className="max-h-full max-w-full object-contain"
                  onError={(e) => {
                    (e.target as HTMLElement).style.display = "none";
                  }}
                />
              ) : (
                <ImageIcon className="size-4 text-muted-foreground/50" />
              )}
            </div>

            <div className="truncate">
              <Link
                href={`/admin/partners/${partner.id}/edit`}
                title={partner.name}
                className="font-bold text-sm text-[#184098] hover:underline truncate block leading-snug"
              >
                {partner.name}
              </Link>
              {partner.website ? (
                <a
                  href={partner.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-mono text-[11px] text-muted-foreground hover:text-[#184098] truncate mt-0.5"
                >
                  <span>
                    {partner.website.replace(/^https?:\/\/(www\.)?/, "")}
                  </span>
                  <ExternalLink className="size-2.5" />
                </a>
              ) : (
                <span className="text-[11px] text-muted-foreground/60 italic">
                  No website linked
                </span>
              )}
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "tier",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tier / Category" />
      ),
      cell: ({ row }) => {
        const tier = row.original.tier;
        return (
          <Badge
            variant="outline"
            className={`text-[10px] uppercase font-bold ${
              tier === "headline"
                ? "border-[#C49A45]/40 bg-[#C49A45]/15 text-[#8F6B1E]"
                : tier === "strategic"
                  ? "border-blue-300 bg-blue-50 text-blue-800"
                  : tier === "corporate"
                    ? "border-purple-300 bg-purple-50 text-purple-800"
                    : "border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
            }`}
          >
            {tier.replace("_", " ")}
          </Badge>
        );
      },
    },
    {
      accessorKey: "order",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Sort Order" />
      ),
      cell: ({ row }) => (
        <span className="font-mono text-xs font-semibold text-[#151B2E]">
          #{row.original.order}
        </span>
      ),
    },
    {
      accessorKey: "isActive",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const active = row.original.isActive;
        return (
          <Badge
            variant={active ? "success" : "outline"}
            className="text-[10px] uppercase font-bold"
          >
            {active ? "Active" : "Hidden"}
          </Badge>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const partner = row.original;
        return (
          <div className="text-right">
            <PartnerActionsMenu
              partnerId={partner.id}
              partnerName={partner.name}
              partnerWebsite={partner.website}
              isActive={partner.isActive}
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
        searchKey="name"
        searchPlaceholder="Filter partners by name..."
        renderBulkActions={(selectedRows, { clearSelection }) => (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={isBulkPending}
              onClick={() =>
                handleBulkToggleActive(selectedRows, true, clearSelection)
              }
              className="h-8 text-xs bg-white text-[#184098] hover:bg-[#EEF2FA] border-none font-bold"
            >
              <CheckCircle2 className="size-3.5 mr-1 text-emerald-600" />
              Activate Selected
            </Button>
            <Button
              size="sm"
              variant="outline"
              disabled={isBulkPending}
              onClick={() =>
                handleBulkToggleActive(selectedRows, false, clearSelection)
              }
              className="h-8 text-xs bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 border-amber-400/30 font-semibold"
            >
              <XCircle className="size-3.5 mr-1" />
              Deactivate Selected
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
