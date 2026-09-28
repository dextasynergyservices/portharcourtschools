import { and, desc, eq, ilike } from "drizzle-orm";
import { Award, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db, programmes } from "@/lib/db";
import { DashboardShell } from "../dashboard/dashboard-shell";
import { ProgrammeActionsMenu } from "./programme-actions-menu";
import { ProgrammesTable } from "./programmes-table";

export const metadata = {
  title:
    "Programmes & Training — Admin Portal | Schools Voice (Formerly Port Harcourt Schools)",
};

interface AdminProgrammesPageProps {
  searchParams: Promise<{
    status?: string;
    q?: string;
  }>;
}

export default async function AdminProgrammesPage({
  searchParams,
}: AdminProgrammesPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { status, q } = await searchParams;

  const conditions = [];
  if (status && status !== "all") {
    conditions.push(
      eq(programmes.status, status as "draft" | "published" | "archived"),
    );
  }
  if (q) {
    conditions.push(ilike(programmes.title, `%${q}%`));
  }

  const whereClause =
    conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined;

  const allProgrammes = await db.query.programmes.findMany({
    where: whereClause,
    orderBy: [desc(programmes.createdAt)],
  });

  const rawAll = await db
    .select({ status: programmes.status })
    .from(programmes);
  const totalCount = rawAll.length;
  const publishedCount = rawAll.filter((p) => p.status === "published").length;
  const draftCount = rawAll.filter((p) => p.status === "draft").length;

  const activeStatus = status || "all";

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#151B2E]">
                Programmes
              </h1>
              <Badge
                variant="outline"
                className="text-[10px] font-bold uppercase border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
              >
                {totalCount} Total
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Accredited teacher CPD, school leadership, and administrative
              workshops delivered with GeePhill.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/programmes/new">
              <Button className="h-10 text-xs bg-[#184098] hover:bg-[#08276B] text-white font-bold shadow-xs">
                <Plus className="size-4 mr-1.5" />
                New Programme
              </Button>
            </Link>
          </div>
        </div>

        {/* Status Filter Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs border-b border-[#D9DEEC]">
          <Link
            href="/admin/programmes?status=all"
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeStatus === "all"
                ? "bg-[#184098] text-white shadow-xs"
                : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
            }`}
          >
            All ({totalCount})
          </Link>
          <Link
            href="/admin/programmes?status=published"
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeStatus === "published"
                ? "bg-[#184098] text-white shadow-xs"
                : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
            }`}
          >
            Published ({publishedCount})
          </Link>
          <Link
            href="/admin/programmes?status=draft"
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeStatus === "draft"
                ? "bg-[#184098] text-white shadow-xs"
                : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
            }`}
          >
            Drafts ({draftCount})
          </Link>
        </div>

        {/* Desktop Table */}
        <div className="hidden md:block">
          <ProgrammesTable
            programmes={allProgrammes.map((prog) => ({
              id: prog.id,
              title: prog.title,
              slug: prog.slug,
              provider: prog.provider,
              category: prog.category,
              isAccredited: prog.isAccredited,
              status: prog.status,
            }))}
          />
        </div>

        {/* Mobile Cards */}
        <div className="block md:hidden space-y-3">
          {allProgrammes.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground space-y-2 border-[#D9DEEC] bg-white rounded-lg">
              <Award className="size-8 mx-auto text-muted-foreground/50" />
              <p className="font-medium">No programmes found.</p>
            </Card>
          ) : (
            allProgrammes.map((prog) => (
              <Card
                key={prog.id}
                className="p-4 border-[#D9DEEC] bg-white rounded-lg shadow-xs hover:border-[#184098]/30 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Badge
                      variant={
                        prog.status === "published" ? "success" : "outline"
                      }
                      className="text-[10px] uppercase font-bold"
                    >
                      {prog.status}
                    </Badge>
                    {prog.isAccredited && (
                      <Badge
                        variant="outline"
                        className="text-[10px] uppercase font-bold border-emerald-200 bg-emerald-50 text-emerald-700"
                      >
                        TRCN
                      </Badge>
                    )}
                  </div>

                  <ProgrammeActionsMenu
                    programmeId={prog.id}
                    programmeTitle={prog.title}
                  />
                </div>

                <div>
                  <Link
                    href={`/admin/programmes/${prog.id}/edit`}
                    title={prog.title}
                    className="font-bold text-sm text-[#184098] hover:underline line-clamp-1 leading-snug"
                  >
                    {prog.title}
                  </Link>
                  <p className="text-xs text-muted-foreground line-clamp-2 mt-1">
                    {prog.description}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-[#D9DEEC]/60 text-[11px] text-muted-foreground">
                  <span className="font-medium text-[#151B2E]">
                    {prog.provider}
                  </span>
                  <span>{prog.category || "General CPD"}</span>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
