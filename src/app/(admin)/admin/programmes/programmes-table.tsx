"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
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
  const columns: ColumnDef<ProgrammeRowData>[] = [
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
    <DataTable
      columns={columns}
      data={programmes}
      searchKey="title"
      searchPlaceholder="Filter programmes by title..."
    />
  );
}
