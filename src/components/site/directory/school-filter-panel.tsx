"use client";

import {
  BadgeCheck,
  Filter,
  RotateCcw,
  Search,
  SlidersHorizontal,
  X,
} from "lucide-react";
import { useQueryState } from "nuqs";
import { useEffect, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export interface AreaOption {
  id: string;
  name: string;
  slug: string;
}

interface SchoolFilterPanelProps {
  areas: AreaOption[];
  totalResults: number;
}

const CATEGORIES = [
  { value: "all", label: "All Categories" },
  { value: "private", label: "Private Schools" },
  { value: "mission", label: "Faith / Mission" },
  { value: "international", label: "International" },
  { value: "public", label: "Public Schools" },
];

const CURRICULUMS = [
  { value: "all", label: "All Curriculums" },
  { value: "nigerian", label: "Nigerian Curriculum" },
  { value: "british", label: "British Curriculum" },
  { value: "nigerian_british", label: "Nigerian & British" },
  { value: "american", label: "American Curriculum" },
  { value: "montessori", label: "Montessori" },
  { value: "ib", label: "International Baccalaureate" },
];

const LEVELS = [
  "Creche",
  "Nursery",
  "Primary",
  "Junior Secondary",
  "Senior Secondary",
];

const FEE_BANDS = [
  { value: "all", label: "All Fee Ranges" },
  { value: "under_500k", label: "Under ₦500,000" },
  { value: "500k_1m", label: "₦500,000 – ₦1,000,000" },
  { value: "1m_2m", label: "₦1,000,000 – ₦2,000,000" },
  { value: "above_2m", label: "Above ₦2,000,000" },
];

const SORT_OPTIONS = [
  { value: "featured", label: "Featured First" },
  { value: "name_asc", label: "School Name (A–Z)" },
  { value: "fees_asc", label: "Fees: Low to High" },
  { value: "fees_desc", label: "Fees: High to Low" },
  { value: "newest", label: "Recently Added" },
];

// Standalone Search Input with local state & 300ms debounce
// Never loses focus when typing!
function SchoolSearchInput({
  id = "school-search-input",
  value,
  onChange,
}: {
  id?: string;
  value: string;
  onChange: (val: string | null) => void;
}) {
  const [localVal, setLocalVal] = useState(value);

  // Sync external changes (e.g. Reset button)
  useEffect(() => {
    setLocalVal(value);
  }, [value]);

  // Debounced commit to URL query state
  useEffect(() => {
    const timer = setTimeout(() => {
      if (localVal.trim() !== value.trim()) {
        onChange(localVal.trim() ? localVal : null);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [localVal, onChange, value]);

  return (
    <div className="relative">
      <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-3.5 text-muted-foreground" />
      <Input
        id={id}
        value={localVal}
        onChange={(e) => setLocalVal(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter") {
            onChange(localVal.trim() ? localVal : null);
          }
        }}
        placeholder="Name, street, keyword..."
        className="pl-9 pr-8 h-9 text-xs border-[#D9DEEC] bg-white focus:border-[#184098]"
      />
      {localVal && (
        <button
          type="button"
          onClick={() => {
            setLocalVal("");
            onChange(null);
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-[#151B2E]"
          aria-label="Clear search query"
        >
          <X className="size-3.5" />
        </button>
      )}
    </div>
  );
}

// Standalone Filter Fields to avoid re-mounting on state updates
interface FilterFieldsProps {
  idPrefix?: string;
  q: string;
  setQ: (val: string | null) => void;
  area: string;
  setArea: (val: string | null) => void;
  category: string;
  setCategory: (val: string | null) => void;
  curriculum: string;
  setCurriculum: (val: string | null) => void;
  level: string;
  setLevel: (val: string | null) => void;
  feeBand: string;
  setFeeBand: (val: string | null) => void;
  verifiedOnly: string;
  setVerifiedOnly: (val: string | null) => void;
  activeFilterCount: number;
  handleResetFilters: () => void;
  areas: AreaOption[];
}

function FilterFields({
  idPrefix = "filter",
  q,
  setQ,
  area,
  setArea,
  category,
  setCategory,
  curriculum,
  setCurriculum,
  level,
  setLevel,
  feeBand,
  setFeeBand,
  verifiedOnly,
  setVerifiedOnly,
  activeFilterCount,
  handleResetFilters,
  areas,
}: FilterFieldsProps) {
  const searchInputId = `${idPrefix}-school-search-input`;
  const areaSelectId = `${idPrefix}-school-area-select`;
  const categorySelectId = `${idPrefix}-school-category-select`;
  const curriculumSelectId = `${idPrefix}-school-curriculum-select`;
  const levelSelectId = `${idPrefix}-school-level-select`;
  const feeBandSelectId = `${idPrefix}-school-feeband-select`;

  return (
    <div className="space-y-5 text-xs">
      {/* Search Input with smooth debounced focus */}
      <div>
        <label
          htmlFor={searchInputId}
          className="block font-bold text-xs uppercase tracking-wider text-[#151B2E] mb-1.5"
        >
          Search Schools
        </label>
        <SchoolSearchInput id={searchInputId} value={q || ""} onChange={setQ} />
      </div>

      {/* Verified Only Toggle */}
      <div className="flex items-center justify-between p-2.5 rounded-lg border border-[#D9DEEC] bg-[#FAFBFF]">
        <div className="flex items-center gap-2">
          <BadgeCheck className="size-4 text-emerald-600" />
          <span className="font-bold text-[#151B2E]">Verified Only</span>
        </div>
        <button
          type="button"
          onClick={() => {
            setVerifiedOnly(verifiedOnly === "true" ? null : "true");
          }}
          aria-label="Filter by verified schools only"
          className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
            verifiedOnly === "true" ? "bg-emerald-600" : "bg-gray-300"
          }`}
          role="switch"
          aria-checked={verifiedOnly === "true"}
        >
          <span
            className={`pointer-events-none inline-block size-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
              verifiedOnly === "true" ? "translate-x-4" : "translate-x-0"
            }`}
          />
        </button>
      </div>

      {/* Neighbourhood / Area */}
      <div>
        <label
          htmlFor={areaSelectId}
          className="block font-bold text-xs uppercase tracking-wider text-[#151B2E] mb-1.5"
        >
          Neighbourhood / Area
        </label>
        <select
          id={areaSelectId}
          value={area || "all"}
          onChange={(e) => {
            setArea(e.target.value === "all" ? null : e.target.value);
          }}
          className="w-full h-9 rounded-md border border-[#D9DEEC] bg-white px-3 text-xs font-medium text-[#151B2E] focus:outline-none focus:ring-2 focus:ring-[#184098]/30"
        >
          <option value="all">All Port Harcourt Areas</option>
          {areas.map((a) => (
            <option key={a.id} value={a.slug}>
              {a.name}
            </option>
          ))}
        </select>
      </div>

      {/* School Category */}
      <div>
        <label
          htmlFor={categorySelectId}
          className="block font-bold text-xs uppercase tracking-wider text-[#151B2E] mb-1.5"
        >
          School Category
        </label>
        <select
          id={categorySelectId}
          value={category || "all"}
          onChange={(e) => {
            setCategory(e.target.value === "all" ? null : e.target.value);
          }}
          className="w-full h-9 rounded-md border border-[#D9DEEC] bg-white px-3 text-xs font-medium text-[#151B2E] focus:outline-none focus:ring-2 focus:ring-[#184098]/30"
        >
          {CATEGORIES.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Curriculum */}
      <div>
        <label
          htmlFor={curriculumSelectId}
          className="block font-bold text-xs uppercase tracking-wider text-[#151B2E] mb-1.5"
        >
          Curriculum
        </label>
        <select
          id={curriculumSelectId}
          value={curriculum || "all"}
          onChange={(e) => {
            setCurriculum(e.target.value === "all" ? null : e.target.value);
          }}
          className="w-full h-9 rounded-md border border-[#D9DEEC] bg-white px-3 text-xs font-medium text-[#151B2E] focus:outline-none focus:ring-2 focus:ring-[#184098]/30"
        >
          {CURRICULUMS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </select>
      </div>

      {/* Educational Level */}
      <div>
        <label
          htmlFor={levelSelectId}
          className="block font-bold text-xs uppercase tracking-wider text-[#151B2E] mb-1.5"
        >
          Educational Level
        </label>
        <select
          id={levelSelectId}
          value={level || "all"}
          onChange={(e) => {
            setLevel(e.target.value === "all" ? null : e.target.value);
          }}
          className="w-full h-9 rounded-md border border-[#D9DEEC] bg-white px-3 text-xs font-medium text-[#151B2E] focus:outline-none focus:ring-2 focus:ring-[#184098]/30"
        >
          <option value="all">All Levels (Creche – SSS)</option>
          {LEVELS.map((lvl) => (
            <option key={lvl} value={lvl}>
              {lvl}
            </option>
          ))}
        </select>
      </div>

      {/* Tuition Fee Band (₦) */}
      <div>
        <label
          htmlFor={feeBandSelectId}
          className="block font-bold text-xs uppercase tracking-wider text-[#151B2E] mb-1.5"
        >
          Tuition Fee Band (₦)
        </label>
        <select
          id={feeBandSelectId}
          value={feeBand || "all"}
          onChange={(e) => {
            setFeeBand(e.target.value === "all" ? null : e.target.value);
          }}
          className="w-full h-9 rounded-md border border-[#D9DEEC] bg-white px-3 text-xs font-medium text-[#151B2E] focus:outline-none focus:ring-2 focus:ring-[#184098]/30"
        >
          {FEE_BANDS.map((f) => (
            <option key={f.value} value={f.value}>
              {f.label}
            </option>
          ))}
        </select>
      </div>

      {/* Reset button */}
      {activeFilterCount > 0 && (
        <Button
          type="button"
          variant="outline"
          onClick={handleResetFilters}
          className="w-full h-9 text-xs font-bold border-[#D9DEEC] text-[#184098] hover:bg-[#EEF2FA] transition-colors"
        >
          <RotateCcw className="size-3.5 mr-1.5" />
          Reset All Filters ({activeFilterCount})
        </Button>
      )}
    </div>
  );
}

export function SchoolFilterPanel({
  areas,
  totalResults,
}: SchoolFilterPanelProps) {
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  // nuqs URL query states
  const [q, setQ] = useQueryState("q", { defaultValue: "", shallow: false });
  const [area, setArea] = useQueryState("area", {
    defaultValue: "all",
    shallow: false,
  });
  const [category, setCategory] = useQueryState("category", {
    defaultValue: "all",
    shallow: false,
  });
  const [curriculum, setCurriculum] = useQueryState("curriculum", {
    defaultValue: "all",
    shallow: false,
  });
  const [level, setLevel] = useQueryState("level", {
    defaultValue: "all",
    shallow: false,
  });
  const [feeBand, setFeeBand] = useQueryState("feeBand", {
    defaultValue: "all",
    shallow: false,
  });
  const [sort, setSort] = useQueryState("sort", {
    defaultValue: "featured",
    shallow: false,
  });
  const [verifiedOnly, setVerifiedOnly] = useQueryState("verifiedOnly", {
    defaultValue: "false",
    shallow: false,
  });
  const [, setLimit] = useQueryState("limit", {
    defaultValue: "9",
    shallow: false,
  });

  // Count active non-default filters
  let activeFilterCount = 0;
  if (q && q.trim().length > 0) activeFilterCount++;
  if (area && area !== "all") activeFilterCount++;
  if (category && category !== "all") activeFilterCount++;
  if (curriculum && curriculum !== "all") activeFilterCount++;
  if (level && level !== "all") activeFilterCount++;
  if (feeBand && feeBand !== "all") activeFilterCount++;
  if (verifiedOnly === "true") activeFilterCount++;

  const handleResetFilters = () => {
    setQ(null);
    setArea(null);
    setCategory(null);
    setCurriculum(null);
    setLevel(null);
    setFeeBand(null);
    setVerifiedOnly(null);
    setSort(null);
    setLimit("9");
  };

  const handleFilterChange = (setter: (val: string | null) => void) => {
    return (val: string | null) => {
      setter(val);
      setLimit("9"); // Reset batch limit when filter criteria change
    };
  };

  const filterProps: FilterFieldsProps = {
    q: q || "",
    setQ: handleFilterChange(setQ),
    area: area || "all",
    setArea: handleFilterChange(setArea),
    category: category || "all",
    setCategory: handleFilterChange(setCategory),
    curriculum: curriculum || "all",
    setCurriculum: handleFilterChange(setCurriculum),
    level: level || "all",
    setLevel: handleFilterChange(setLevel),
    feeBand: feeBand || "all",
    setFeeBand: handleFilterChange(setFeeBand),
    verifiedOnly: verifiedOnly || "false",
    setVerifiedOnly: handleFilterChange(setVerifiedOnly),
    activeFilterCount,
    handleResetFilters,
    areas,
  };

  return (
    <>
      {/* Desktop Sidebar (lg:block) */}
      <aside className="hidden lg:block w-72 shrink-0">
        <Card className="sticky top-24 p-5 border-[#D9DEEC] bg-white shadow-xs rounded-xl space-y-5">
          <div className="flex items-center justify-between border-b border-[#D9DEEC] pb-3">
            <div className="flex items-center gap-2">
              <SlidersHorizontal className="size-4 text-[#184098]" />
              <h2 className="font-heading font-black text-sm uppercase tracking-wider text-[#151B2E]">
                Filters
              </h2>
            </div>
            {activeFilterCount > 0 && (
              <Badge className="bg-[#184098] text-white text-[10px] font-bold px-2 py-0.5">
                {activeFilterCount} active
              </Badge>
            )}
          </div>

          <FilterFields {...filterProps} idPrefix="desktop" />
        </Card>
      </aside>

      {/* Mobile Top Bar with Filter Drawer Button & Sort Dropdown */}
      <div className="lg:hidden flex items-center justify-between gap-3 bg-white p-3 rounded-xl border border-[#D9DEEC] shadow-xs mb-4">
        {/* Mobile Sheet Trigger */}
        <Sheet open={mobileDrawerOpen} onOpenChange={setMobileDrawerOpen}>
          <SheetTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-10 text-xs font-bold border-[#D9DEEC] text-[#151B2E] hover:bg-[#EEF2FA] flex items-center gap-2"
            >
              <Filter className="size-4 text-[#184098]" />
              Filters
              {activeFilterCount > 0 && (
                <span className="size-5 rounded-full bg-[#184098] text-white text-[10px] font-bold flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </SheetTrigger>

          <SheetContent side="bottom" className="p-6">
            <SheetHeader className="mb-4 text-left">
              <div className="flex items-center justify-between">
                <SheetTitle className="font-heading font-black text-lg text-[#151B2E]">
                  Filter Schools
                </SheetTitle>
                {activeFilterCount > 0 && (
                  <button
                    type="button"
                    onClick={handleResetFilters}
                    className="text-xs font-bold text-[#184098] hover:underline"
                  >
                    Reset All
                  </button>
                )}
              </div>
              <SheetDescription className="text-xs text-muted-foreground">
                Showing {totalResults} schools in Port Harcourt
              </SheetDescription>
            </SheetHeader>

            <div className="max-h-[60vh] overflow-y-auto pr-1 pb-4">
              <FilterFields {...filterProps} idPrefix="mobile" />
            </div>

            <div className="pt-3 border-t border-[#D9DEEC]">
              <Button
                onClick={() => setMobileDrawerOpen(false)}
                className="w-full h-11 bg-[#184098] hover:bg-[#08276B] text-white font-bold text-xs"
              >
                Apply Filters ({totalResults} Results)
              </Button>
            </div>
          </SheetContent>
        </Sheet>

        {/* Sort Selector on Mobile */}
        <div className="flex items-center gap-1.5">
          <label htmlFor="mobile-sort-select" className="sr-only">
            Sort Schools
          </label>
          <select
            id="mobile-sort-select"
            value={sort || "featured"}
            onChange={(e) => setSort(e.target.value)}
            className="h-10 text-xs font-bold rounded-md border border-[#D9DEEC] bg-white px-2.5 text-[#151B2E] focus:outline-none"
          >
            {SORT_OPTIONS.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </div>
      </div>
    </>
  );
}
