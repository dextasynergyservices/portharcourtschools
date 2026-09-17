import { desc, eq } from "drizzle-orm";
import {
  Banknote,
  Building2,
  GraduationCap,
  MapPin,
  RotateCcw,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { getPageContent } from "@/app/(admin)/admin/pages/actions";
import { LoadMoreButton } from "@/components/site/directory/load-more-button";
import { SchoolCard } from "@/components/site/directory/school-card";
import { SchoolFilterPanel } from "@/components/site/directory/school-filter-panel";
import { FadeIn } from "@/components/site/motion-wrapper";
import { Button } from "@/components/ui/button";
import { getOrSetCache } from "@/lib/cache";
import { areas, db, schools } from "@/lib/db";

export const revalidate = 300;

export const metadata: Metadata = {
  title:
    "Schools Directory — Find Top Primary & Secondary Schools in Port Harcourt",
  description:
    "Explore accredited private, international, faith-based, and public schools across Port Harcourt. Compare tuition fees in Naira, curriculum, levels, and admissions.",
  alternates: {
    canonical: "/schools",
  },
};

const PAGE_SIZE = 9;

interface PublicSchoolsPageProps {
  searchParams: Promise<{
    q?: string;
    area?: string;
    category?: string;
    curriculum?: string;
    level?: string;
    feeBand?: string;
    sort?: string;
    verifiedOnly?: string;
    limit?: string;
  }>;
}

export default async function PublicSchoolsPage({
  searchParams,
}: PublicSchoolsPageProps) {
  const params = await searchParams;
  const {
    q,
    area,
    category,
    curriculum,
    level,
    feeBand,
    sort = "featured",
    verifiedOnly,
    limit,
  } = params;

  const pageData = await getPageContent("schools");
  const sections =
    (pageData.sections as Record<string, Record<string, string | undefined>>) ||
    {};
  const heroBadge = sections.hero?.badge || "Garden City Education Index";
  const heroTitle = sections.hero?.title || "Port Harcourt Schools Directory";
  const heroSubtitle =
    sections.hero?.subtitle ||
    "Find, compare, and connect with accredited nursery, primary, and secondary institutions across Port Harcourt. Explore transparent tuition ranges in Naira, academic curriculums, and campus facilities.";

  // 1. Fetch active areas for dropdown filter (cached)
  const allAreas = await getOrSetCache(
    "schools:active_areas",
    ["schools"],
    async () => {
      return db.query.areas.findMany({
        where: eq(areas.isActive, true),
        orderBy: [areas.name],
      });
    },
    3600,
  );

  // 2. Fetch all published schools with area relation (cached in memory/Redis)
  const publishedSchools = await getOrSetCache(
    "schools:published_all",
    ["schools"],
    async () => {
      return db.query.schools.findMany({
        where: eq(schools.status, "published"),
        with: {
          area: true,
        },
        orderBy: [desc(schools.createdAt)],
      });
    },
    600,
  );

  // 3. In-memory filter pipeline (fast, handles JSONB levels & fee ranges seamlessly)
  let filtered = publishedSchools.filter((school) => {
    // Search query: name, address, description, area name
    if (q && q.trim().length > 0) {
      const term = q.trim().toLowerCase();
      const matchName = school.name.toLowerCase().includes(term);
      const matchAddress =
        school.address?.toLowerCase().includes(term) || false;
      const matchDesc =
        school.description?.toLowerCase().includes(term) || false;
      const matchArea = school.area?.name.toLowerCase().includes(term) || false;
      if (!matchName && !matchAddress && !matchDesc && !matchArea) {
        return false;
      }
    }

    // Area filter
    if (area && area !== "all") {
      if (school.area?.slug !== area && school.areaId !== area) {
        return false;
      }
    }

    // Category filter
    if (category && category !== "all") {
      if (school.schoolType !== category) {
        return false;
      }
    }

    // Curriculum filter
    if (curriculum && curriculum !== "all") {
      if (school.curriculum !== curriculum) {
        return false;
      }
    }

    // Educational Level filter (checks jsonb levels array)
    if (level && level !== "all") {
      const schoolLevels = school.levels || [];
      if (!schoolLevels.includes(level)) {
        return false;
      }
    }

    // Fee band in Naira
    if (feeBand && feeBand !== "all") {
      const min = school.feeMin ?? 0;
      const max = school.feeMax ?? min;
      if (feeBand === "under_500k") {
        if (min > 500000) return false;
      } else if (feeBand === "500k_1m") {
        if (max < 500000 || min > 1000000) return false;
      } else if (feeBand === "1m_2m") {
        if (max < 1000000 || min > 2000000) return false;
      } else if (feeBand === "above_2m") {
        if (max < 2000000) return false;
      }
    }

    // Verified only filter
    if (verifiedOnly === "true") {
      if (!school.verified) return false;
    }

    return true;
  });

  // 4. Sorting
  filtered = filtered.sort((a, b) => {
    if (sort === "name_asc") {
      return a.name.localeCompare(b.name);
    }
    if (sort === "fees_asc") {
      const feeA = a.feeMin ?? Number.MAX_SAFE_INTEGER;
      const feeB = b.feeMin ?? Number.MAX_SAFE_INTEGER;
      return feeA - feeB;
    }
    if (sort === "fees_desc") {
      const feeA = a.feeMax ?? 0;
      const feeB = b.feeMax ?? 0;
      return feeB - feeA;
    }
    if (sort === "newest") {
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    }
    // Default: "featured" (featured first, then verified, then name)
    if (a.featured !== b.featured) {
      return a.featured ? -1 : 1;
    }
    if (a.verified !== b.verified) {
      return a.verified ? -1 : 1;
    }
    return a.name.localeCompare(b.name);
  });

  // 5. Pagination / Load More batching
  const totalCount = filtered.length;
  const currentLimit = Math.max(
    PAGE_SIZE,
    parseInt(limit || "9", 10) || PAGE_SIZE,
  );
  const visibleSchools = filtered.slice(0, currentLimit);

  const hasFiltersActive =
    Boolean(q?.trim()) ||
    (area && area !== "all") ||
    (category && category !== "all") ||
    (curriculum && curriculum !== "all") ||
    (level && level !== "all") ||
    (feeBand && feeBand !== "all") ||
    verifiedOnly === "true";

  return (
    <div className="w-full bg-[#FAFBFF] text-[#151B2E]">
      {/* Header Banner */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#EEF2FA] to-[#FAFBFF] border-b border-[#D9DEEC] pt-12 pb-12 sm:pt-16 sm:pb-16">
        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-4">
          <FadeIn>
            <div className="inline-flex items-center gap-2 rounded-full border border-[#184098]/20 bg-white px-3.5 py-1 text-xs font-bold uppercase tracking-widest text-[#184098] shadow-xs">
              <GraduationCap className="size-4" />
              {heroBadge}
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <h1 className="font-heading font-black text-2xl sm:text-4xl lg:text-5xl text-[#151B2E] tracking-tight">
              {heroTitle}
            </h1>
          </FadeIn>

          <FadeIn delay={0.2}>
            <p className="text-sm sm:text-base text-muted-foreground max-w-3xl leading-relaxed">
              {heroSubtitle}
            </p>
          </FadeIn>

          {/* Quick stats pills */}
          <FadeIn delay={0.3}>
            <div className="flex items-center gap-2 sm:gap-4 flex-wrap pt-2 text-xs">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D9DEEC] font-semibold text-[#151B2E]">
                <Building2 className="size-3.5 text-[#184098]" />
                {publishedSchools.length} Verified Institutions
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D9DEEC] font-semibold text-[#151B2E]">
                <MapPin className="size-3.5 text-[#184098]" />
                {allAreas.length} Neighbourhoods
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white border border-[#D9DEEC] font-semibold text-[#151B2E]">
                <Banknote className="size-3.5 text-[#184098]" />
                Transparent Tuition Data
              </span>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* Directory Main Grid */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Filter Sidebar (Desktop) + Filter Drawer (Mobile) */}
          <SchoolFilterPanel
            areas={allAreas.map((a) => ({
              id: a.id,
              name: a.name,
              slug: a.slug,
            }))}
            totalResults={totalCount}
          />

          {/* School Listings Content */}
          <div className="flex-1 min-w-0">
            {/* Desktop Top Controls */}
            <div className="hidden lg:flex items-center justify-between gap-4 bg-white p-4 rounded-xl border border-[#D9DEEC] shadow-xs mb-6">
              <div>
                <p className="text-xs text-muted-foreground">
                  Showing{" "}
                  <span className="font-bold text-[#151B2E]">
                    {Math.min(visibleSchools.length, totalCount)}
                  </span>{" "}
                  of{" "}
                  <span className="font-bold text-[#151B2E]">{totalCount}</span>{" "}
                  schools
                </p>
              </div>

              {/* Sort Selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-muted-foreground">
                  Sort by:
                </span>
                <Link
                  href={`/schools?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(area ? { area } : {}),
                    ...(category ? { category } : {}),
                    ...(curriculum ? { curriculum } : {}),
                    ...(level ? { level } : {}),
                    ...(feeBand ? { feeBand } : {}),
                    ...(verifiedOnly ? { verifiedOnly } : {}),
                    sort: "featured",
                  }).toString()}`}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    sort === "featured"
                      ? "bg-[#184098] text-white"
                      : "text-muted-foreground hover:text-[#184098] hover:bg-[#EEF2FA]"
                  }`}
                >
                  Featured
                </Link>
                <Link
                  href={`/schools?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(area ? { area } : {}),
                    ...(category ? { category } : {}),
                    ...(curriculum ? { curriculum } : {}),
                    ...(level ? { level } : {}),
                    ...(feeBand ? { feeBand } : {}),
                    ...(verifiedOnly ? { verifiedOnly } : {}),
                    sort: "name_asc",
                  }).toString()}`}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    sort === "name_asc"
                      ? "bg-[#184098] text-white"
                      : "text-muted-foreground hover:text-[#184098] hover:bg-[#EEF2FA]"
                  }`}
                >
                  Name (A–Z)
                </Link>
                <Link
                  href={`/schools?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(area ? { area } : {}),
                    ...(category ? { category } : {}),
                    ...(curriculum ? { curriculum } : {}),
                    ...(level ? { level } : {}),
                    ...(feeBand ? { feeBand } : {}),
                    ...(verifiedOnly ? { verifiedOnly } : {}),
                    sort: "fees_asc",
                  }).toString()}`}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    sort === "fees_asc"
                      ? "bg-[#184098] text-white"
                      : "text-muted-foreground hover:text-[#184098] hover:bg-[#EEF2FA]"
                  }`}
                >
                  Fees: Low
                </Link>
                <Link
                  href={`/schools?${new URLSearchParams({
                    ...(q ? { q } : {}),
                    ...(area ? { area } : {}),
                    ...(category ? { category } : {}),
                    ...(curriculum ? { curriculum } : {}),
                    ...(level ? { level } : {}),
                    ...(feeBand ? { feeBand } : {}),
                    ...(verifiedOnly ? { verifiedOnly } : {}),
                    sort: "fees_desc",
                  }).toString()}`}
                  className={`px-2.5 py-1 rounded text-xs font-bold transition-colors ${
                    sort === "fees_desc"
                      ? "bg-[#184098] text-white"
                      : "text-muted-foreground hover:text-[#184098] hover:bg-[#EEF2FA]"
                  }`}
                >
                  Fees: High
                </Link>
              </div>
            </div>

            {/* School Cards Grid */}
            {visibleSchools.length === 0 ? (
              <div className="bg-white rounded-xl border border-[#D9DEEC] p-12 text-center space-y-4">
                <div className="size-14 rounded-full bg-[#EEF2FA] text-[#184098] flex items-center justify-center mx-auto">
                  <Building2 className="size-7" />
                </div>
                <div className="space-y-1 max-w-md mx-auto">
                  <h3 className="font-heading font-black text-lg text-[#151B2E]">
                    No schools match your search
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    We couldn&apos;t find any schools matching your current
                    filter criteria. Try adjusting your neighbourhood, tuition
                    range, or clearing search terms.
                  </p>
                </div>
                {hasFiltersActive && (
                  <div>
                    <Link href="/schools">
                      <Button
                        variant="outline"
                        className="h-9 text-xs font-bold border-[#184098] text-[#184098] hover:bg-[#EEF2FA]"
                      >
                        <RotateCcw className="size-3.5 mr-1.5" />
                        Reset All Filters
                      </Button>
                    </Link>
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {visibleSchools.map((school) => (
                  <SchoolCard key={school.id} school={school} />
                ))}
              </div>
            )}

            {/* Professional Load More Pagination */}
            <div className="mt-8">
              <LoadMoreButton
                currentCount={visibleSchools.length}
                totalCount={totalCount}
                batchSize={PAGE_SIZE}
              />
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
