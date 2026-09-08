import { and, desc, eq, ilike } from "drizzle-orm";
import { Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { db, schools } from "@/lib/db";
import { DashboardShell } from "../dashboard/dashboard-shell";
import { type SchoolRowData, SchoolsTable } from "./schools-table";

export const metadata = {
  title: "Schools Directory — Admin Portal | PortHarcourtSchools",
};

interface AdminSchoolsPageProps {
  searchParams: Promise<{
    status?: string;
    areaId?: string;
    q?: string;
  }>;
}

export default async function AdminSchoolsPage({
  searchParams,
}: AdminSchoolsPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { status, areaId, q } = await searchParams;

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(
      eq(schools.status, status as "draft" | "published" | "archived"),
    );
  }
  if (areaId && areaId !== "all") {
    conditions.push(eq(schools.areaId, areaId));
  }
  if (q) {
    conditions.push(ilike(schools.name, `%${q}%`));
  }

  const whereClause =
    conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined;

  const schoolRows = await db.query.schools.findMany({
    where: whereClause,
    orderBy: [desc(schools.createdAt)],
    with: {
      area: true,
    },
  });

  const rawAll = await db.select({ status: schools.status }).from(schools);
  const totalCount = rawAll.length;
  const publishedCount = rawAll.filter((s) => s.status === "published").length;
  const draftCount = rawAll.filter((s) => s.status === "draft").length;
  const archivedCount = rawAll.filter((s) => s.status === "archived").length;

  const activeStatus = status || "all";

  // Format data for client table
  const formattedSchools: SchoolRowData[] = schoolRows.map((s) => ({
    id: s.id,
    name: s.name,
    slug: s.slug,
    schoolType: s.schoolType,
    curriculum: s.curriculum,
    gender: s.gender,
    boardingType: s.boardingType,
    levels: s.levels,
    area: s.area
      ? {
          id: s.area.id,
          name: s.area.name,
          lga: s.area.lga,
        }
      : null,
    address: s.address,
    phone: s.phone,
    email: s.email,
    feeMin: s.feeMin,
    feeMax: s.feeMax,
    feePeriod: s.feePeriod,
    feeVisibility: s.feeVisibility,
    logo: s.logo,
    verified: s.verified,
    featured: s.featured,
    status: s.status,
    createdAt: s.createdAt,
  }));

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#151B2E]">
                Schools Directory
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
                {publishedCount} Published
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage verified profiles, curriculum details, tuition schedules,
              and media for Port Harcourt schools.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/schools/new">
              <Button className="h-10 text-xs bg-[#184098] hover:bg-[#08276B] text-white font-bold shadow-xs">
                <Plus className="size-4 mr-1.5" />
                New School
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-[#D9DEEC]">
          <Link
            href="/admin/schools?status=all"
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeStatus === "all"
                ? "bg-[#184098] text-white shadow-xs"
                : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
            }`}
          >
            All ({totalCount})
          </Link>
          <Link
            href="/admin/schools?status=published"
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeStatus === "published"
                ? "bg-[#184098] text-white shadow-xs"
                : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
            }`}
          >
            Published ({publishedCount})
          </Link>
          <Link
            href="/admin/schools?status=draft"
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeStatus === "draft"
                ? "bg-[#184098] text-white shadow-xs"
                : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
            }`}
          >
            Drafts ({draftCount})
          </Link>
          <Link
            href="/admin/schools?status=archived"
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeStatus === "archived"
                ? "bg-[#184098] text-white shadow-xs"
                : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
            }`}
          >
            Archived ({archivedCount})
          </Link>
        </div>

        {/* TanStack Table View */}
        <SchoolsTable schools={formattedSchools} />
      </div>
    </DashboardShell>
  );
}
