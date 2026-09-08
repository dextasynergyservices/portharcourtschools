import {
  BadgeCheck,
  Building2,
  ExternalLink,
  GraduationCap,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export interface SchoolCardData {
  id: string;
  slug: string;
  name: string;
  levels: string[];
  schoolType: string;
  curriculum: string;
  gender: string;
  boardingType: string;
  address: string | null;
  lga: string | null;
  phone: string | null;
  whatsapp: string | null;
  email: string | null;
  website: string | null;
  feeMin: number | null;
  feeMax: number | null;
  feePeriod: string;
  feeVisibility: string;
  logo: string | null;
  coverImage: string | null;
  description: string | null;
  verified: boolean;
  featured: boolean;
  area: {
    id: string;
    name: string;
    slug: string;
    lga: string;
  } | null;
}

export function formatSchoolFee(school: {
  feeMin: number | null;
  feeMax: number | null;
  feePeriod: string;
  feeVisibility: string;
}): string {
  const periodLabel = school.feePeriod === "per_session" ? "session" : "term";
  if (
    school.feeVisibility === "hidden" ||
    school.feeVisibility === "on_request"
  ) {
    return "Fees upon request";
  }
  if (!school.feeMin && !school.feeMax) {
    return "Fees upon request";
  }
  if (school.feeMin && school.feeMax) {
    if (school.feeMin === school.feeMax) {
      return `₦${school.feeMin.toLocaleString()} / ${periodLabel}`;
    }
    return `₦${school.feeMin.toLocaleString()} – ₦${school.feeMax.toLocaleString()} / ${periodLabel}`;
  }
  if (school.feeMin) {
    return `From ₦${school.feeMin.toLocaleString()} / ${periodLabel}`;
  }
  if (school.feeMax) {
    return `Up to ₦${school.feeMax.toLocaleString()} / ${periodLabel}`;
  }
  return "Fees upon request";
}

const CURRICULUM_LABELS: Record<string, string> = {
  nigerian: "Nigerian",
  british: "British",
  american: "American",
  montessori: "Montessori",
  nigerian_british: "Nigerian & British",
  ib: "International Baccalaureate",
};

const TYPE_LABELS: Record<string, string> = {
  private: "Private",
  public: "Public",
  mission: "Faith / Mission",
  international: "International",
};

export function SchoolCard({ school }: { school: SchoolCardData }) {
  const feeString = formatSchoolFee(school);
  const curriculumLabel =
    CURRICULUM_LABELS[school.curriculum] || school.curriculum.replace("_", " ");
  const typeLabel =
    TYPE_LABELS[school.schoolType] || school.schoolType.replace("_", " ");
  const areaName = school.area?.name || school.lga || "Port Harcourt";

  return (
    <Card className="group relative flex flex-col justify-between overflow-hidden border-[#D9DEEC] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#184098]/40 hover:shadow-xl rounded-xl">
      <div>
        {/* Card Header / Image preview */}
        <div className="relative h-44 w-full overflow-hidden bg-gradient-to-br from-[#184098]/10 via-[#EEF2FA] to-[#184098]/5">
          {school.coverImage ? (
            <Image
              src={school.coverImage}
              alt={school.name}
              fill
              loading="lazy"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-[#184098]/30">
              <Building2 className="size-16 stroke-[1.2]" />
            </div>
          )}

          {/* Top badges overlay */}
          <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
            <div className="flex items-center gap-1.5 flex-wrap">
              {school.featured && (
                <Badge className="bg-[#FDDA32] text-[#151B2E] font-bold text-[10px] uppercase tracking-wider border-none shadow-xs">
                  Featured
                </Badge>
              )}
              {school.verified && (
                <Badge className="bg-emerald-600 text-white font-bold text-[10px] uppercase tracking-wider border-none shadow-xs flex items-center gap-1">
                  <BadgeCheck className="size-3" />
                  Verified
                </Badge>
              )}
            </div>

            <Badge
              variant="outline"
              className="bg-white/95 text-[#184098] font-bold text-[10px] uppercase tracking-wider border-[#D9DEEC] backdrop-blur-xs shadow-xs"
            >
              {typeLabel}
            </Badge>
          </div>

          {/* Logo badge (overlapping header bottom) */}
          <div className="absolute -bottom-4 left-4 size-14 rounded-lg bg-white border-2 border-white shadow-md overflow-hidden flex items-center justify-center z-10">
            {school.logo ? (
              <Image
                src={school.logo}
                alt={`${school.name} logo`}
                width={56}
                height={56}
                loading="lazy"
                className="object-contain p-1"
              />
            ) : (
              <GraduationCap className="size-7 text-[#184098]" />
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="pt-6 p-4 sm:p-5 space-y-3.5">
          {/* Location & Title */}
          <div>
            <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
              <MapPin className="size-3.5 text-[#184098] shrink-0" />
              <span className="font-medium truncate">{areaName}</span>
              {school.boardingType && school.boardingType !== "day" && (
                <>
                  <span>•</span>
                  <span className="capitalize">
                    {school.boardingType.replace("_", " ")}
                  </span>
                </>
              )}
            </div>

            <Link href={`/schools/${school.slug}`}>
              <h3 className="font-heading font-black text-base sm:text-lg text-[#151B2E] group-hover:text-[#184098] transition-colors line-clamp-1 leading-snug">
                {school.name}
              </h3>
            </Link>

            {school.description && (
              <p className="text-xs text-muted-foreground line-clamp-2 mt-1.5 leading-relaxed">
                {school.description}
              </p>
            )}
          </div>

          {/* Educational Levels Chips */}
          {school.levels && school.levels.length > 0 && (
            <div className="flex items-center gap-1 flex-wrap pt-1">
              {school.levels.map((lvl) => (
                <span
                  key={lvl}
                  className="px-2 py-0.5 rounded text-[10px] font-semibold bg-[#EEF2FA] text-[#184098] border border-[#D9DEEC]"
                >
                  {lvl}
                </span>
              ))}
            </div>
          )}

          {/* Key details row: Curriculum */}
          <div className="flex items-center justify-between text-xs pt-1 border-t border-[#D9DEEC]/60 text-muted-foreground">
            <span>Curriculum</span>
            <span className="font-bold text-[#151B2E]">{curriculumLabel}</span>
          </div>

          {/* Fee schedule block */}
          <div className="rounded-lg bg-[#FAFBFF] border border-[#D9DEEC] p-2.5 flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground block">
                Estimated Tuition
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#184098]">
                {feeString}
              </span>
            </div>
            {school.whatsapp && (
              <a
                href={`https://wa.me/${school.whatsapp.replace(/[^0-9]/g, "")}`}
                target="_blank"
                rel="noreferrer"
                title="Chat with Admissions on WhatsApp"
                className="size-8 rounded-full bg-emerald-50 text-emerald-600 hover:bg-emerald-100 flex items-center justify-center transition-colors shrink-0"
              >
                <MessageCircle className="size-4" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Card Footer */}
      <div className="p-4 sm:p-5 pt-0 flex items-center gap-2">
        <Link href={`/schools/${school.slug}`} className="w-full">
          <Button
            variant="outline"
            className="w-full h-9 text-xs font-bold border-[#184098] text-[#184098] hover:bg-[#184098] hover:text-white active:scale-[0.98] transition-all shadow-xs"
          >
            View School Profile
            <ExternalLink className="size-3.5 ml-1.5" />
          </Button>
        </Link>
        {school.phone && (
          <a
            href={`tel:${school.phone}`}
            title={`Call ${school.name}`}
            className="size-9 rounded-md border border-[#D9DEEC] bg-white text-[#151B2E] hover:text-[#184098] hover:bg-[#EEF2FA] active:scale-95 flex items-center justify-center transition-all shrink-0"
          >
            <Phone className="size-4" />
          </a>
        )}
      </div>
    </Card>
  );
}
