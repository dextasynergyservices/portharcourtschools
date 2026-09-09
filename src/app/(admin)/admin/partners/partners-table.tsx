"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { ExternalLink, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
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
  const columns: ColumnDef<PartnerRowData>[] = [
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
    <DataTable
      columns={columns}
      data={partners}
      searchKey="name"
      searchPlaceholder="Filter partners by name..."
    />
  );
}
