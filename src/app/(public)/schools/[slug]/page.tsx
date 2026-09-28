import { and, eq, ne } from "drizzle-orm";
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Building2,
  CheckCircle2,
  ExternalLink,
  Globe,
  GraduationCap,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
  ShieldCheck,
} from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import {
  formatSchoolFee,
  SchoolCard,
} from "@/components/site/directory/school-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { db, schools } from "@/lib/db";

interface SchoolDetailPageProps {
  params: Promise<{
    slug: string;
  }>;
}

export async function generateMetadata({
  params,
}: SchoolDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const school = await db.query.schools.findMany({
    where: eq(schools.slug, slug),
    with: { area: true },
    limit: 1,
  });

  if (!school || school.length === 0) {
    return {
      title:
        "School Not Found | Schools Voice (Formerly Port Harcourt Schools)",
    };
  }

  const s = school[0];
  const areaName = s.area?.name || "Port Harcourt";
  const levelsStr = (s.levels || []).join(", ");

  return {
    title: `${s.name} — Schools Voice Directory (Formerly Port Harcourt Schools)`,
    description:
      s.description ||
      `Explore ${s.name}, an accredited ${s.schoolType} school located in ${areaName}, Port Harcourt offering ${s.curriculum} curriculum for ${levelsStr}.`,
    alternates: {
      canonical: `/schools/${s.slug}`,
    },
    openGraph: {
      title: `${s.name} | Schools Voice (Formerly Port Harcourt Schools)`,
      description:
        s.description ||
        `Verified details, tuition fees in Naira, and admissions contact for ${s.name} in Port Harcourt.`,
      images: s.coverImage ? [{ url: s.coverImage }] : undefined,
    },
  };
}

const CURRICULUM_LABELS: Record<string, string> = {
  nigerian: "Nigerian National Curriculum",
  british: "British National Curriculum",
  american: "American Curriculum",
  montessori: "Montessori Early Years & Primary",
  nigerian_british: "Integrated Nigerian & British Curriculum",
  ib: "International Baccalaureate (IB)",
};

const TYPE_LABELS: Record<string, string> = {
  private: "Private Institution",
  public: "Government / Public School",
  mission: "Faith / Mission-Based School",
  international: "International Academy",
};

const GENDER_LABELS: Record<string, string> = {
  co_ed: "Co-educational (Boys & Girls)",
  boys_only: "Boys Only",
  girls_only: "Girls Only",
};

const BOARDING_LABELS: Record<string, string> = {
  day: "Day School Only",
  boarding: "Full Boarding Only",
  day_and_boarding: "Day & Boarding Options Available",
};

export default async function SchoolDetailPage({
  params,
}: SchoolDetailPageProps) {
  const { slug } = await params;

  const foundSchools = await db.query.schools.findMany({
    where: eq(schools.slug, slug),
    with: {
      area: true,
    },
    limit: 1,
  });

  if (!foundSchools || foundSchools.length === 0) {
    notFound();
  }

  const school = foundSchools[0];
  const areaName = school.area?.name || school.lga || "Port Harcourt";
  const feeString = formatSchoolFee(school);
  const periodLabel = school.feePeriod === "per_session" ? "session" : "term";

  // Query nearby / related schools
  const nearbySchools = await db.query.schools.findMany({
    where: and(
      eq(schools.status, "published"),
      ne(schools.id, school.id),
      school.areaId ? eq(schools.areaId, school.areaId) : undefined,
    ),
    with: {
      area: true,
    },
    limit: 3,
  });

  // Fallback related if none in same area
  const relatedSchools =
    nearbySchools.length > 0
      ? nearbySchools
      : await db.query.schools.findMany({
          where: and(
            eq(schools.status, "published"),
            ne(schools.id, school.id),
          ),
          with: {
            area: true,
          },
          limit: 3,
        });

  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    `${school.name} ${school.address || ""} ${areaName} Port Harcourt Nigeria`,
  )}`;

  const rawUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    process.env.NEXTAUTH_URL ||
    "https://portharcourtschools.com";
  const siteUrl = rawUrl.replace(/\/$/, "");
  const schoolUrl = `${siteUrl}/schools/${school.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": ["School", "EducationalOrganization"],
    name: school.name,
    description:
      school.description || `${school.name} in ${areaName}, Port Harcourt`,
    url: schoolUrl,
    image: [school.coverImage, school.logo].filter(Boolean),
    telephone: school.phone || undefined,
    email: school.email || undefined,
    address: {
      "@type": "PostalAddress",
      streetAddress: school.address || undefined,
      addressLocality: areaName,
      addressRegion: "Rivers State",
      addressCountry: "NG",
    },
    priceRange: feeString !== "Fees upon request" ? feeString : undefined,
  };

  return (
    <div className="w-full bg-[#FAFBFF] text-[#151B2E] pb-16 sm:pb-24">
      {/* School Structured Data */}
      <script
        type="application/ld+json"
        // biome-ignore lint/security/noDangerouslySetInnerHtml: Trusted JSON-LD structured data
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Top breadcrumb navigation */}
      <div className="border-b border-[#D9DEEC] bg-white">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3.5 flex items-center justify-between">
          <Link
            href="/schools"
            className="inline-flex items-center gap-1.5 text-xs font-bold text-[#184098] hover:underline"
          >
            <ArrowLeft className="size-3.5" />
            Back to Schools Directory
          </Link>
          <span className="text-xs text-muted-foreground hidden sm:inline">
            Schools Voice &gt; {areaName} &gt; {school.name}
          </span>
        </div>
      </div>

      {/* Hero Showcase Section */}
      <section className="relative bg-gradient-to-b from-[#EEF2FA] to-[#FAFBFF] border-b border-[#D9DEEC] pt-6 pb-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 space-y-6">
          {/* Cover image banner */}
          <div className="relative h-64 sm:h-80 md:h-96 w-full rounded-2xl overflow-hidden border border-[#D9DEEC] shadow-md bg-slate-900">
            {school.coverImage ? (
              <Image
                src={school.coverImage}
                alt={`${school.name} Campus`}
                fill
                priority
                sizes="(max-width: 1200px) 100vw, 1200px"
                className="object-cover"
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-tr from-[#08276B] via-[#184098] to-[#1e52c7] flex items-center justify-center text-white/20">
                <Building2 className="size-24 stroke-[1.2]" />
              </div>
            )}

            {/* Dark gradient overlay for text legibility */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

            {/* Top badges */}
            <div className="absolute top-4 left-4 right-4 flex items-center justify-between gap-2 flex-wrap">
              <div className="flex items-center gap-2">
                {school.featured && (
                  <Badge className="bg-[#FDDA32] text-[#151B2E] font-bold text-xs uppercase tracking-wider border-none shadow-md px-3 py-1">
                    Featured School
                  </Badge>
                )}
                {school.verified && (
                  <Badge className="bg-emerald-600 text-white font-bold text-xs uppercase tracking-wider border-none shadow-md flex items-center gap-1.5 px-3 py-1">
                    <BadgeCheck className="size-3.5" />
                    Verified Institution
                  </Badge>
                )}
              </div>

              <Badge className="bg-white/90 text-[#184098] font-bold text-xs uppercase tracking-wider border-[#D9DEEC] backdrop-blur-xs shadow-md">
                {TYPE_LABELS[school.schoolType] || school.schoolType}
              </Badge>
            </div>

            {/* Bottom title & logo in hero */}
            <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-end gap-4">
              <div className="size-16 sm:size-24 rounded-xl bg-white border-2 border-white shadow-lg overflow-hidden flex items-center justify-center shrink-0">
                {school.logo ? (
                  <Image
                    src={school.logo}
                    alt={`${school.name} Logo`}
                    width={96}
                    height={96}
                    className="object-contain p-1.5"
                  />
                ) : (
                  <GraduationCap className="size-10 sm:size-14 text-[#184098]" />
                )}
              </div>

              <div className="text-white min-w-0 pb-1">
                <div className="flex items-center gap-2 text-xs sm:text-sm text-white/80 font-medium mb-1">
                  <MapPin className="size-4 text-[#FDDA32] shrink-0" />
                  <span className="truncate">{areaName}, Port Harcourt</span>
                </div>
                <h1 className="font-heading font-black text-xl sm:text-3xl lg:text-4xl text-white tracking-tight line-clamp-2">
                  {school.name}
                </h1>
              </div>
            </div>
          </div>

          {/* Quick Action Buttons Row */}
          <div className="flex items-center gap-3 flex-wrap pt-2">
            {school.whatsapp && (
              <a
                href={`https://wa.me/${school.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                  `Hello Admissions at ${school.name}, I am reaching out via the PortHarcourtSchools Directory regarding enrollment.`,
                )}`}
                target="_blank"
                rel="noreferrer"
              >
                <Button className="h-11 px-5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs">
                  <MessageCircle className="size-4 mr-2" />
                  Chat on WhatsApp
                </Button>
              </a>
            )}

            {school.phone && (
              <a href={`tel:${school.phone}`}>
                <Button
                  variant="outline"
                  className="h-11 px-5 border-[#D9DEEC] bg-white text-[#151B2E] hover:bg-[#EEF2FA] font-bold text-xs shadow-xs"
                >
                  <Phone className="size-4 mr-2 text-[#184098]" />
                  Call School ({school.phone})
                </Button>
              </a>
            )}

            {school.website && (
              <a href={school.website} target="_blank" rel="noreferrer">
                <Button
                  variant="outline"
                  className="h-11 px-4 border-[#D9DEEC] bg-white text-[#151B2E] hover:bg-[#EEF2FA] font-bold text-xs shadow-xs"
                >
                  <Globe className="size-4 mr-2 text-[#184098]" />
                  Official Website
                  <ExternalLink className="size-3 ml-1.5 opacity-60" />
                </Button>
              </a>
            )}

            <a href={mapsUrl} target="_blank" rel="noreferrer">
              <Button
                variant="outline"
                className="h-11 px-4 border-[#D9DEEC] bg-white text-[#151B2E] hover:bg-[#EEF2FA] font-bold text-xs shadow-xs"
              >
                <Navigation className="size-4 mr-2 text-[#184098]" />
                Get Directions
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Main Details 2-Column Layout */}
      <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Facts, Description, Tuition, Campus (8 cols) */}
          <div className="lg:col-span-8 space-y-8">
            {/* Quick Facts Grid */}
            <Card className="p-6 border-[#D9DEEC] bg-white shadow-xs rounded-xl space-y-4">
              <div className="flex items-center gap-2 border-b border-[#D9DEEC] pb-3">
                <Building2 className="size-5 text-[#184098]" />
                <h2 className="font-heading font-black text-base uppercase tracking-wider text-[#151B2E]">
                  Institutional Profile
                </h2>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3.5 rounded-lg bg-[#FAFBFF] border border-[#D9DEEC]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Classification
                  </span>
                  <span className="font-bold text-sm text-[#151B2E]">
                    {TYPE_LABELS[school.schoolType] || school.schoolType}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAFBFF] border border-[#D9DEEC]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Curriculum Framework
                  </span>
                  <span className="font-bold text-sm text-[#151B2E]">
                    {CURRICULUM_LABELS[school.curriculum] || school.curriculum}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAFBFF] border border-[#D9DEEC]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Gender Enrolment
                  </span>
                  <span className="font-bold text-sm text-[#151B2E]">
                    {GENDER_LABELS[school.gender] || school.gender}
                  </span>
                </div>

                <div className="p-3.5 rounded-lg bg-[#FAFBFF] border border-[#D9DEEC]">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Boarding Facilities
                  </span>
                  <span className="font-bold text-sm text-[#151B2E]">
                    {BOARDING_LABELS[school.boardingType] ||
                      school.boardingType}
                  </span>
                </div>
              </div>

              {/* Levels Offered Chips */}
              {school.levels && school.levels.length > 0 && (
                <div className="pt-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-2">
                    Levels &amp; Grades Offered
                  </span>
                  <div className="flex items-center gap-2 flex-wrap">
                    {school.levels.map((lvl) => (
                      <Badge
                        key={lvl}
                        className="px-3 py-1 bg-[#EEF2FA] text-[#184098] border-[#D9DEEC] font-bold text-xs"
                      >
                        <CheckCircle2 className="size-3.5 mr-1 text-[#184098]" />
                        {lvl}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Tuition Fees Transparency Schedule */}
            <Card className="p-6 border-[#D9DEEC] bg-white shadow-xs rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9DEEC] pb-3">
                <div className="flex items-center gap-2">
                  <Banknote className="size-5 text-[#184098]" />
                  <h2 className="font-heading font-black text-base uppercase tracking-wider text-[#151B2E]">
                    Tuition &amp; Fees Schedule
                  </h2>
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] uppercase font-bold border-[#D9DEEC] text-[#184098]"
                >
                  Naira (₦)
                </Badge>
              </div>

              <div className="rounded-xl bg-gradient-to-r from-[#EEF2FA] to-[#FAFBFF] border border-[#D9DEEC] p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                  <div>
                    <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground block">
                      Estimated Tuition ({periodLabel.toUpperCase()})
                    </span>
                    <span className="font-heading font-black text-2xl sm:text-3xl text-[#184098] mt-1 block">
                      {feeString}
                    </span>
                  </div>

                  {school.feeVisibility === "exact" && (
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 font-bold text-xs self-start sm:self-center">
                      Verified Exact Fee
                    </Badge>
                  )}
                  {school.feeVisibility === "band_only" && (
                    <Badge className="bg-[#EEF2FA] text-[#184098] border-[#D9DEEC] font-bold text-xs self-start sm:self-center">
                      Representative Band
                    </Badge>
                  )}
                </div>

                <p className="text-xs text-muted-foreground leading-relaxed pt-2 border-t border-[#D9DEEC]">
                  Fee schedules are updated periodically from school admissions
                  guides. Additional fees such as registration, uniforms,
                  textbooks, PTA levies, and boarding fees (where applicable)
                  may apply. Contact the bursary directly for official termly
                  invoices.
                </p>
              </div>
            </Card>

            {/* School Overview / Description */}
            {school.description && (
              <Card className="p-6 border-[#D9DEEC] bg-white shadow-xs rounded-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-[#D9DEEC] pb-3">
                  <GraduationCap className="size-5 text-[#184098]" />
                  <h2 className="font-heading font-black text-base uppercase tracking-wider text-[#151B2E]">
                    About {school.name}
                  </h2>
                </div>
                <div className="text-sm text-[#151B2E] leading-relaxed whitespace-pre-line space-y-3">
                  {school.description}
                </div>
              </Card>
            )}

            {/* Gallery Showcase */}
            {school.gallery && school.gallery.length > 0 && (
              <Card className="p-6 border-[#D9DEEC] bg-white shadow-xs rounded-xl space-y-4">
                <div className="flex items-center gap-2 border-b border-[#D9DEEC] pb-3">
                  <Building2 className="size-5 text-[#184098]" />
                  <h2 className="font-heading font-black text-base uppercase tracking-wider text-[#151B2E]">
                    Campus &amp; Facilities
                  </h2>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
                  {school.gallery.map((imgUrl, idx) => (
                    <div
                      key={imgUrl}
                      className="relative h-44 rounded-lg overflow-hidden border border-[#D9DEEC] bg-slate-100 group"
                    >
                      <Image
                        src={imgUrl}
                        alt={`${school.name} Photo ${idx + 1}`}
                        fill
                        sizes="(max-width: 768px) 100vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Campus Location Map & Directions */}
            <Card className="p-6 border-[#D9DEEC] bg-white shadow-xs rounded-xl space-y-4">
              <div className="flex items-center justify-between border-b border-[#D9DEEC] pb-3">
                <div className="flex items-center gap-2">
                  <MapPin className="size-5 text-[#184098]" />
                  <h2 className="font-heading font-black text-base uppercase tracking-wider text-[#151B2E]">
                    Location &amp; Address
                  </h2>
                </div>
                <a
                  href={mapsUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-xs font-bold text-[#184098] hover:underline inline-flex items-center gap-1"
                >
                  Open in Google Maps
                  <ExternalLink className="size-3" />
                </a>
              </div>

              <div className="space-y-2 text-xs">
                <p className="text-sm font-semibold text-[#151B2E]">
                  {school.address || "Street address available upon request"}
                </p>
                <p className="text-muted-foreground">
                  Neighbourhood:{" "}
                  <span className="font-bold text-[#151B2E]">{areaName}</span>
                  {school.lga && (
                    <>
                      {" "}
                      • Local Government Area:{" "}
                      <span className="font-bold text-[#151B2E]">
                        {school.lga}
                      </span>
                    </>
                  )}
                  , Rivers State, Nigeria.
                </p>
              </div>

              <div className="pt-2">
                <a href={mapsUrl} target="_blank" rel="noreferrer">
                  <Button
                    variant="outline"
                    className="h-10 text-xs font-bold border-[#184098] text-[#184098] hover:bg-[#EEF2FA]"
                  >
                    <Navigation className="size-3.5 mr-2" />
                    Navigate to Campus
                  </Button>
                </a>
              </div>
            </Card>
          </div>

          {/* Right Column: Admissions & Contact Card (4 cols, sticky) */}
          <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-24">
            <Card className="p-6 border-[#D9DEEC] bg-white shadow-md rounded-xl space-y-5">
              <div className="border-b border-[#D9DEEC] pb-4">
                <span className="text-[10px] font-bold uppercase tracking-widest text-[#184098] block mb-1">
                  Enquiries &amp; Admissions
                </span>
                <h3 className="font-heading font-black text-lg text-[#151B2E]">
                  Contact Admissions Office
                </h3>
              </div>

              <div className="space-y-3.5 text-xs">
                {school.phone && (
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-[#EEF2FA] text-[#184098] flex items-center justify-center shrink-0">
                      <Phone className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Telephone
                      </span>
                      <a
                        href={`tel:${school.phone}`}
                        className="font-bold text-sm text-[#184098] hover:underline"
                      >
                        {school.phone}
                      </a>
                    </div>
                  </div>
                )}

                {school.whatsapp && (
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <MessageCircle className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        WhatsApp Admissions
                      </span>
                      <a
                        href={`https://wa.me/${school.whatsapp.replace(/[^0-9]/g, "")}`}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-sm text-emerald-600 hover:underline"
                      >
                        {school.whatsapp}
                      </a>
                    </div>
                  </div>
                )}

                {school.email && (
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-[#EEF2FA] text-[#184098] flex items-center justify-center shrink-0">
                      <Mail className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Email Address
                      </span>
                      <a
                        href={`mailto:${school.email}`}
                        className="font-bold text-xs text-[#184098] hover:underline break-all"
                      >
                        {school.email}
                      </a>
                    </div>
                  </div>
                )}

                {school.website && (
                  <div className="flex items-start gap-3">
                    <div className="size-8 rounded-lg bg-[#EEF2FA] text-[#184098] flex items-center justify-center shrink-0">
                      <Globe className="size-4" />
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                        Official Website
                      </span>
                      <a
                        href={school.website}
                        target="_blank"
                        rel="noreferrer"
                        className="font-bold text-xs text-[#184098] hover:underline break-all"
                      >
                        {school.website.replace(/^https?:\/\//, "")}
                      </a>
                    </div>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="pt-2 space-y-2.5">
                {school.whatsapp && (
                  <a
                    href={`https://wa.me/${school.whatsapp.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(
                      `Hello Admissions at ${school.name}, I am reaching out via the PortHarcourtSchools Directory regarding enrollment.`,
                    )}`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full block"
                  >
                    <Button className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs">
                      <MessageCircle className="size-4 mr-2" />
                      Inquire on WhatsApp
                    </Button>
                  </a>
                )}

                {school.phone && (
                  <a href={`tel:${school.phone}`} className="w-full block">
                    <Button
                      variant="outline"
                      className="w-full h-11 border-[#184098] text-[#184098] hover:bg-[#EEF2FA] font-bold text-xs"
                    >
                      <Phone className="size-4 mr-2" />
                      Direct Call
                    </Button>
                  </a>
                )}
              </div>

              {/* Trust Badge */}
              <div className="rounded-lg bg-[#FAFBFF] border border-[#D9DEEC] p-3 text-[11px] text-muted-foreground flex items-center gap-2.5">
                <ShieldCheck className="size-5 text-[#184098] shrink-0" />
                <span>
                  Listed on the authoritative PortHarcourtSchools directory.
                </span>
              </div>
            </Card>
          </div>
        </div>

        {/* Related / Nearby Schools Section */}
        {relatedSchools.length > 0 && (
          <div className="mt-16 sm:mt-20 pt-12 border-t border-[#D9DEEC] space-y-6">
            <div>
              <span className="text-xs font-bold uppercase tracking-widest text-[#184098] block mb-1">
                Explore More
              </span>
              <h2 className="font-heading font-black text-xl sm:text-2xl text-[#151B2E]">
                Similar Schools in {areaName} &amp; Beyond
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedSchools.map((s) => (
                <SchoolCard key={s.id} school={s} />
              ))}
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
