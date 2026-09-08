"use client";

import type { ColumnDef } from "@tanstack/react-table";
import { CheckCircle, GraduationCap, MapPin, Star } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { toast } from "sonner";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { SchoolActionsMenu } from "@/components/admin/schools/school-actions-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bulkDeleteSchoolsAction,
  bulkUpdateSchoolStatusAction,
} from "./actions";

export interface SchoolRowData {
  id: string;
  name: string;
  slug: string;
  schoolType: "private" | "public" | "faith_based" | "international";
  curriculum: "nigerian" | "british" | "american" | "ib" | "mixed";
  gender: "co_ed" | "boys" | "girls";
  boardingType: "day" | "boarding" | "both";
  levels: string[];
  area?: {
    id: string;
    name: string;
    lga: string;
  } | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  feeMin: number | null;
  feeMax: number | null;
  feePeriod: "per_term" | "per_session";
  feeVisibility: "exact" | "band_only" | "on_request" | "hidden";
  logo: string | null;
  verified: boolean;
  featured: boolean;
  status: "draft" | "published" | "archived";
  createdAt: Date | string;
}

interface SchoolsTableProps {
  schools: SchoolRowData[];
}

export function SchoolsTable({ schools }: SchoolsTableProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  const handleBulkStatus = (
    selectedRows: SchoolRowData[],
    status: "draft" | "published" | "archived",
  ) => {
    startTransition(async () => {
      const ids = selectedRows.map((r) => r.id);
      await bulkUpdateSchoolStatusAction(ids, status);
      toast.success(`Updated ${selectedRows.length} schools to ${status}`);
      router.refresh();
    });
  };

  const handleBulkDelete = (selectedRows: SchoolRowData[]) => {
    if (
      !confirm(
        `Are you sure you want to delete ${selectedRows.length} schools? This cannot be undone.`,
      )
    ) {
      return;
    }
    startTransition(async () => {
      const ids = selectedRows.map((r) => r.id);
      await bulkDeleteSchoolsAction(ids);
      toast.success(`Deleted ${selectedRows.length} school listings`);
      router.refresh();
    });
  };

  const columns: ColumnDef<SchoolRowData>[] = [
    // 1. Selection Checkbox
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

    // 2. School Name & Identity
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="School & Profile" />
      ),
      cell: ({ row }) => {
        const school = row.original;
        return (
          <div className="flex items-center gap-3 max-w-[260px] lg:max-w-xs">
            <div className="size-9 rounded-md bg-[#EEF2FA] text-[#184098] flex items-center justify-center font-bold text-xs shrink-0 overflow-hidden border border-[#D9DEEC]">
              {school.logo ? (
                <Image
                  src={school.logo}
                  alt={school.name}
                  width={36}
                  height={36}
                  unoptimized
                  className="object-cover size-full"
                />
              ) : (
                <GraduationCap className="size-4.5" />
              )}
            </div>
            <div className="min-w-0">
              <Link
                href={`/admin/schools/${school.id}/edit`}
                className="font-bold text-sm text-[#184098] hover:underline block truncate leading-snug"
                title={school.name}
              >
                {school.name}
              </Link>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge
                  variant="outline"
                  className="text-[9px] uppercase font-bold border-[#D9DEEC] bg-[#FAFBFF] text-[#151B2E] px-1 py-0"
                >
                  {school.schoolType.replace("_", " ")}
                </Badge>
                <span className="text-[11px] text-muted-foreground truncate">
                  /schools/{school.slug}
                </span>
              </div>
            </div>
          </div>
        );
      },
    },

    // 3. Location / Area
    {
      accessorKey: "area",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Neighbourhood" />
      ),
      cell: ({ row }) => {
        const area = row.original.area;
        return (
          <div className="text-xs space-y-0.5 max-w-[170px]">
            {area ? (
              <span className="font-semibold text-[#151B2E] flex items-center gap-1">
                <MapPin className="size-3 text-[#184098] shrink-0" />
                <span className="truncate">{area.name}</span>
              </span>
            ) : (
              <span className="text-muted-foreground italic">
                Unassigned Area
              </span>
            )}
            {row.original.address && (
              <p
                title={row.original.address}
                className="text-[11px] text-muted-foreground truncate"
              >
                {row.original.address}
              </p>
            )}
          </div>
        );
      },
    },

    // 4. Curriculum & Levels
    {
      id: "curriculum_levels",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Curriculum & Levels" />
      ),
      cell: ({ row }) => {
        const school = row.original;
        return (
          <div className="text-xs space-y-1">
            <Badge
              variant="outline"
              className="text-[10px] uppercase font-bold border-[#D9DEEC] bg-[#F4F6FC] text-[#184098]"
            >
              {school.curriculum} curriculum
            </Badge>
            <div className="text-[11px] text-muted-foreground line-clamp-1 max-w-[160px]">
              {school.levels.join(", ")}
            </div>
          </div>
        );
      },
    },

    // 5. Tuition Fees
    {
      accessorKey: "feeMin",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Tuition Range" />
      ),
      cell: ({ row }) => {
        const s = row.original;
        if (s.feeVisibility === "hidden") {
          return (
            <span className="text-[11px] text-muted-foreground italic">
              Fees Hidden
            </span>
          );
        }
        if (s.feeVisibility === "on_request" || (!s.feeMin && !s.feeMax)) {
          return (
            <span className="text-[11px] text-muted-foreground">
              On Request
            </span>
          );
        }

        const periodStr = s.feePeriod === "per_session" ? "session" : "term";
        const minStr = s.feeMin ? `₦${s.feeMin.toLocaleString()}` : "₦0";
        const maxStr = s.feeMax ? `₦${s.feeMax.toLocaleString()}` : "";

        return (
          <div className="text-xs">
            <span className="font-bold text-[#151B2E]">
              {maxStr ? `${minStr} – ${maxStr}` : minStr}
            </span>
            <span className="text-[10px] text-muted-foreground block">
              per {periodStr}
            </span>
          </div>
        );
      },
    },

    // 6. Badges (Verified & Featured)
    {
      id: "badges",
      header: "Badges",
      cell: ({ row }) => {
        const s = row.original;
        return (
          <div className="flex items-center gap-1.5 flex-wrap">
            {s.verified && (
              <Badge
                variant="outline"
                className="text-[9px] uppercase font-bold border-emerald-200 bg-emerald-50 text-emerald-700 flex items-center gap-1 px-1.5 py-0"
                title="Verified School"
              >
                <CheckCircle className="size-2.5" />
                Verified
              </Badge>
            )}
            {s.featured && (
              <Badge
                variant="outline"
                className="text-[9px] uppercase font-bold border-amber-200 bg-amber-50 text-amber-700 flex items-center gap-1 px-1.5 py-0"
                title="Featured School"
              >
                <Star className="size-2.5 fill-amber-700" />
                Featured
              </Badge>
            )}
          </div>
        );
      },
    },

    // 7. Status
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
                : status === "archived"
                  ? "outline"
                  : "amber"
            }
            className="text-[10px] uppercase font-bold"
          >
            {status}
          </Badge>
        );
      },
    },

    // 8. Actions
    {
      id: "actions",
      cell: ({ row }) => {
        const school = row.original;
        return (
          <div className="text-right">
            <SchoolActionsMenu
              schoolId={school.id}
              schoolName={school.name}
              schoolSlug={school.slug}
              isPublished={school.status === "published"}
              isVerified={school.verified}
              isFeatured={school.featured}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={schools}
      searchKey="name"
      searchPlaceholder="Search school name or address..."
      renderBulkActions={(selected) => (
        <>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleBulkStatus(selected, "published")}
            className="h-8 text-xs bg-white text-[#184098] hover:bg-[#EEF2FA] border-none font-bold"
          >
            Publish Selected
          </Button>
          <Button
            size="sm"
            variant="outline"
            disabled={isPending}
            onClick={() => handleBulkStatus(selected, "archived")}
            className="h-8 text-xs bg-white/10 text-white hover:bg-white/20 border-white/20"
          >
            Archive Selected
          </Button>
          <Button
            size="sm"
            variant="destructive"
            disabled={isPending}
            onClick={() => handleBulkDelete(selected)}
            className="h-8 text-xs font-bold"
          >
            Delete Selected
          </Button>
        </>
      )}
    />
  );
}
