import { and, asc, desc, eq, ilike } from "drizzle-orm";
import { ExternalLink, Handshake, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { db, partners } from "@/lib/db";
import { DashboardShell } from "../dashboard/dashboard-shell";
import { PartnerActionsMenu } from "./partner-actions-menu";
import { PartnersTable } from "./partners-table";

export const metadata = {
  title:
    "Partners — Admin Portal | Schools Voice (Formerly Port Harcourt Schools)",
};

interface AdminPartnersPageProps {
  searchParams: Promise<{
    tier?: string;
    q?: string;
  }>;
}

export default async function AdminPartnersPage({
  searchParams,
}: AdminPartnersPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { tier, q } = await searchParams;

  const conditions = [];
  if (tier && tier !== "all") {
    conditions.push(eq(partners.tier, tier));
  }
  if (q) {
    conditions.push(ilike(partners.name, `%${q}%`));
  }

  const whereClause =
    conditions.length > 0
      ? conditions.length === 1
        ? conditions[0]
        : and(...conditions)
      : undefined;

  const allPartners = await db.query.partners.findMany({
    where: whereClause,
    orderBy: [asc(partners.order), desc(partners.createdAt)],
  });

  const rawAll = await db
    .select({
      id: partners.id,
      isActive: partners.isActive,
      tier: partners.tier,
    })
    .from(partners);

  const totalCount = rawAll.length;
  const activeCount = rawAll.filter((p) => p.isActive).length;
  const hiddenCount = rawAll.filter((p) => !p.isActive).length;

  const activeTier = tier || "all";

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#151B2E]">
                Partners &amp; Collaborators
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
                {activeCount} Active Live
              </Badge>
              {hiddenCount > 0 && (
                <Badge
                  variant="outline"
                  className="text-[10px] font-bold uppercase border-amber-200 bg-amber-50 text-amber-800"
                >
                  {hiddenCount} Hidden
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-0.5">
              Manage educational partners, sponsors, and institutional
              collaborators appearing on the public site and homepage ticker.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <Link href="/admin/partners/new">
              <Button className="h-10 text-xs bg-[#184098] hover:bg-[#08276B] text-white font-bold shadow-xs">
                <Plus className="size-4 mr-1.5" />
                Add New Partner
              </Button>
            </Link>
          </div>
        </div>

        {/* Tier Filter Bar */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 border-b border-[#D9DEEC] text-xs">
          <Link
            href="/admin/partners?tier=all"
            className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap transition-colors ${
              activeTier === "all"
                ? "bg-[#184098] text-white shadow-xs"
                : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
            }`}
          >
            All ({totalCount})
          </Link>
          {(
            [
              "headline",
              "strategic",
              "corporate",
              "technology",
              "education",
              "partner",
            ] as const
          ).map((t) => {
            const count = rawAll.filter((p) => p.tier === t).length;
            return (
              <Link
                key={t}
                href={`/admin/partners?tier=${t}`}
                className={`px-3 py-1.5 rounded-md text-xs font-bold whitespace-nowrap capitalize transition-colors ${
                  activeTier === t
                    ? "bg-[#184098] text-white shadow-xs"
                    : "text-muted-foreground hover:bg-[#EEF2FA] hover:text-[#184098]"
                }`}
              >
                {t} ({count})
              </Link>
            );
          })}
        </div>

        {/* Desktop Table View (hidden md:block) */}
        <div className="hidden md:block">
          <PartnersTable
            partners={allPartners.map((p) => ({
              id: p.id,
              name: p.name,
              logo: p.logo,
              tier: p.tier,
              website: p.website,
              description: p.description,
              isActive: p.isActive,
              order: p.order,
              createdAt: p.createdAt,
            }))}
          />
        </div>

        {/* Mobile Cards (block md:hidden) */}
        <div className="block md:hidden space-y-3">
          {allPartners.length === 0 ? (
            <Card className="p-8 text-center text-xs text-muted-foreground space-y-2 border-[#D9DEEC] bg-white rounded-lg">
              <Handshake className="size-8 mx-auto text-muted-foreground/50" />
              <p className="font-medium">No partners found.</p>
              <p className="text-[11px]">
                Click &ldquo;Add New Partner&rdquo; above to register your first
                partner.
              </p>
            </Card>
          ) : (
            allPartners.map((partner) => (
              <Card
                key={partner.id}
                className="p-4 border-[#D9DEEC] bg-white rounded-lg shadow-xs hover:border-[#184098]/30 transition-all space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="size-10 rounded border border-[#D9DEEC] bg-[#F8FAFC] flex items-center justify-center p-1 shrink-0 overflow-hidden">
                      {/* biome-ignore lint/performance/noImgElement: Dynamic CMS partner logo */}
                      <img
                        src={partner.logo}
                        alt={partner.name}
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                    <div>
                      <Badge
                        variant="outline"
                        className="text-[9px] uppercase font-bold border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
                      >
                        {partner.tier}
                      </Badge>
                      <Badge
                        variant={partner.isActive ? "success" : "outline"}
                        className="text-[9px] uppercase font-bold ml-1"
                      >
                        {partner.isActive ? "Active" : "Hidden"}
                      </Badge>
                    </div>
                  </div>

                  <PartnerActionsMenu
                    partnerId={partner.id}
                    partnerName={partner.name}
                    partnerWebsite={partner.website}
                    isActive={partner.isActive}
                  />
                </div>

                <div>
                  <Link
                    href={`/admin/partners/${partner.id}/edit`}
                    className="font-bold text-sm text-[#184098] hover:underline block leading-snug"
                  >
                    {partner.name}
                  </Link>
                  {partner.description && (
                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-relaxed">
                      {partner.description}
                    </p>
                  )}
                </div>

                {partner.website && (
                  <div className="pt-2 border-t border-[#D9DEEC]/60 flex items-center justify-between text-xs">
                    <a
                      href={partner.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-[11px] font-semibold text-[#184098] hover:underline inline-flex items-center gap-1"
                    >
                      <span>Visit Partner Website</span>
                      <ExternalLink className="size-3" />
                    </a>
                  </div>
                )}
              </Card>
            ))
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
