import { neon } from "@neondatabase/serverless";
import { eq, or } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  console.error("DATABASE_URL is not set");
  process.exit(1);
}

const sql = neon(connectionString);
const db = drizzle({ client: sql, schema });

const AREA_SEEDS = [
  { name: "Old GRA", slug: "old-gra", lga: "Port Harcourt" },
  { name: "New GRA", slug: "new-gra", lga: "Port Harcourt" },
  { name: "Peter Odili Road", slug: "peter-odili-road", lga: "Port Harcourt" },
  { name: "Trans-Amadi", slug: "trans-amadi", lga: "Port Harcourt" },
  { name: "Woji", slug: "woji", lga: "Obio/Akpor" },
  { name: "Ada George", slug: "ada-george", lga: "Obio/Akpor" },
  { name: "Rumuola", slug: "rumuola", lga: "Obio/Akpor" },
  { name: "D/Line", slug: "d-line", lga: "Port Harcourt" },
  { name: "Choba", slug: "choba", lga: "Obio/Akpor" },
  { name: "Rumuibekwe", slug: "rumuibekwe", lga: "Obio/Akpor" },
  { name: "Elelenwo", slug: "elelenwo", lga: "Obio/Akpor" },
  {
    name: "Airport Road / Igwuruta",
    slug: "airport-road-igwuruta",
    lga: "Ikwerre",
  },
  { name: "Rumuokwuta", slug: "rumuokwuta", lga: "Obio/Akpor" },
  { name: "Diobu", slug: "diobu", lga: "Port Harcourt" },
];

async function seedSchools() {
  console.log("🌱 Seeding Areas...");

  const areaMap = new Map<string, string>();

  for (const a of AREA_SEEDS) {
    const [existing] = await db
      .select({ id: schema.areas.id })
      .from(schema.areas)
      .where(or(eq(schema.areas.slug, a.slug), eq(schema.areas.name, a.name)))
      .limit(1);

    if (existing) {
      areaMap.set(a.slug, existing.id);
    } else {
      const [inserted] = await db
        .insert(schema.areas)
        .values({
          name: a.name,
          slug: a.slug,
          lga: a.lga,
          isActive: true,
        })
        .returning({ id: schema.areas.id });
      areaMap.set(a.slug, inserted.id);
      console.log(`  ✓ Created Area: ${a.name}`);
    }
  }

  console.log("🌱 Seeding Schools...");

  const SCHOOL_SEEDS = [
    {
      name: "Graceland International School",
      slug: "graceland-international-school",
      schoolType: "private" as const,
      curriculum: "mixed" as const,
      gender: "co_ed" as const,
      boardingType: "boarding" as const,
      levels: ["Junior Secondary", "Senior Secondary"],
      areaSlug: "new-gra",
      address:
        "25/27 Liberation Stadium Road, Elekahia / New GRA, Port Harcourt",
      lga: "Port Harcourt",
      phone: "+234 803 310 2400",
      whatsapp: "+234 803 310 2400",
      email: "info@graceland.sch.ng",
      website: "https://graceland.sch.ng",
      description:
        "Graceland International School is one of the premier academic institutions in Port Harcourt, renowned for consistently leading Rivers State and Nigeria in WAEC, NECO, and international STEM olympiads. The school provides state-of-the-art boarding, serene campus facilities, and an intensive academic curriculum.",
      feeMin: 450000,
      feeMax: 750000,
      feePeriod: "per_term" as const,
      feeVisibility: "band_only" as const,
      verified: true,
      featured: true,
      status: "published" as const,
      coverImage:
        "https://images.unsplash.com/photo-1580582932707-520aed937b7b?auto=format&fit=crop&w=1600&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1000&q=80",
        "https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      name: "Brookstone School (Secondary)",
      slug: "brookstone-school-secondary",
      schoolType: "international" as const,
      curriculum: "british" as const,
      gender: "co_ed" as const,
      boardingType: "boarding" as const,
      levels: ["Junior Secondary", "Senior Secondary"],
      areaSlug: "airport-road-igwuruta",
      address:
        "Brookstone Close, Igwuruta, near International Airport, Port Harcourt",
      lga: "Ikwerre",
      phone: "+234 807 095 8000",
      whatsapp: "+234 807 095 8000",
      email: "admissions@brookstoneschool.com.ng",
      website: "https://brookstoneschool.com.ng",
      description:
        "Brookstone School delivers a high-calibre British and international curriculum. Situated on an expansive, purpose-built campus near the Port Harcourt International Airport, it fosters academic rigor, international sports, arts, and leadership excellence.",
      feeMin: 850000,
      feeMax: 1400000,
      feePeriod: "per_term" as const,
      feeVisibility: "band_only" as const,
      verified: true,
      featured: true,
      status: "published" as const,
      coverImage:
        "https://images.unsplash.com/photo-1541829070764-84a7d30dd3f3?auto=format&fit=crop&w=1600&q=80",
      gallery: [
        "https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1000&q=80",
      ],
    },
    {
      name: "Greenoak International School",
      slug: "greenoak-international-school",
      schoolType: "international" as const,
      curriculum: "british" as const,
      gender: "co_ed" as const,
      boardingType: "day" as const,
      levels: ["Nursery", "Primary", "Junior Secondary", "Senior Secondary"],
      areaSlug: "old-gra",
      address: "St. Michael's Lane, Off Tombia Street, Old GRA, Port Harcourt",
      lga: "Port Harcourt",
      phone: "+234 803 708 7226",
      whatsapp: "+234 803 708 7226",
      email: "info@greenoakinternational.org",
      website: "https://greenoakinternational.org",
      description:
        "Greenoak International School (GIS) operates in the heart of Old GRA, Port Harcourt. Operating primary and secondary campuses with modern laboratories, digital classrooms, and British council accredited teachers.",
      feeMin: 600000,
      feeMax: 950000,
      feePeriod: "per_term" as const,
      feeVisibility: "exact" as const,
      verified: true,
      featured: true,
      status: "published" as const,
      coverImage:
        "https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1600&q=80",
      gallery: [],
    },
    {
      name: "Bloombreed Schools",
      slug: "bloombreed-schools",
      schoolType: "private" as const,
      curriculum: "mixed" as const,
      gender: "co_ed" as const,
      boardingType: "both" as const,
      levels: ["Nursery", "Primary", "Junior Secondary", "Senior Secondary"],
      areaSlug: "peter-odili-road",
      address: "Boskel Road, Off Peter Odili Road, Trans-Amadi, Port Harcourt",
      lga: "Port Harcourt",
      phone: "+234 803 309 6428",
      whatsapp: "+234 803 309 6428",
      email: "contact@bloombreed.com",
      website: "https://bloombreed.com",
      description:
        "Bloombreed Schools provides an inspiring learning environment along the Peter Odili corridor. Featuring British and Nigerian curricula, dedicated day and boarding options, modern robotics labs, and comprehensive pastoral care.",
      feeMin: 500000,
      feeMax: 850000,
      feePeriod: "per_term" as const,
      feeVisibility: "band_only" as const,
      verified: true,
      featured: true,
      status: "published" as const,
      coverImage:
        "https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=1600&q=80",
      gallery: [],
    },
    {
      name: "Charles Dale Memorial International School",
      slug: "charles-dale-memorial-international-school",
      schoolType: "international" as const,
      curriculum: "british" as const,
      gender: "co_ed" as const,
      boardingType: "boarding" as const,
      levels: ["Junior Secondary", "Senior Secondary"],
      areaSlug: "airport-road-igwuruta",
      address: "Army Range Road, Igwuruta-Ali, Port Harcourt",
      lga: "Ikwerre",
      phone: "+234 803 400 3201",
      whatsapp: "+234 803 400 3201",
      email: "info@charlesdaleschool.com",
      website: "https://charlesdaleschool.com",
      description:
        "Charles Dale Memorial International School is an all-boarding co-educational secondary school committed to world-class academic standards, moral integrity, and exceptional cultural education in Rivers State.",
      feeMin: 900000,
      feeMax: 1500000,
      feePeriod: "per_term" as const,
      feeVisibility: "band_only" as const,
      verified: true,
      featured: false,
      status: "published" as const,
      coverImage:
        "https://images.unsplash.com/photo-1562774053-701939374585?auto=format&fit=crop&w=1600&q=80",
      gallery: [],
    },
    {
      name: "Jesuit Memorial College",
      slug: "jesuit-memorial-college",
      schoolType: "faith_based" as const,
      curriculum: "nigerian" as const,
      gender: "co_ed" as const,
      boardingType: "boarding" as const,
      levels: ["Junior Secondary", "Senior Secondary"],
      areaSlug: "airport-road-igwuruta",
      address: "Spur Road, Mbodo, Aluu-Igwuruta Road, Greater Port Harcourt",
      lga: "Ikwerre",
      phone: "+234 806 000 0000",
      whatsapp: "+234 806 000 0000",
      email: "admissions@jmc.sch.ng",
      website: "https://jmc.sch.ng",
      description:
        "Jesuit Memorial College (JMC) is a Catholic co-educational boarding school founded by the Society of Jesus. Renowned for spiritual and moral discipline, outstanding scholastic rigor, and character formation.",
      feeMin: 800000,
      feeMax: 1200000,
      feePeriod: "per_term" as const,
      feeVisibility: "on_request" as const,
      verified: true,
      featured: false,
      status: "published" as const,
      coverImage:
        "https://images.unsplash.com/photo-1590012314607-cda9d9b699ae?auto=format&fit=crop&w=1600&q=80",
      gallery: [],
    },
  ];

  for (const s of SCHOOL_SEEDS) {
    const areaId = areaMap.get(s.areaSlug);
    const [existing] = await db
      .select({ id: schema.schools.id })
      .from(schema.schools)
      .where(eq(schema.schools.slug, s.slug))
      .limit(1);

    const values = {
      name: s.name,
      slug: s.slug,
      schoolType: s.schoolType,
      curriculum: s.curriculum,
      gender: s.gender,
      boardingType: s.boardingType,
      levels: s.levels,
      areaId: areaId || null,
      address: s.address,
      lga: s.lga,
      phone: s.phone,
      whatsapp: s.whatsapp,
      email: s.email,
      website: s.website,
      description: s.description,
      feeMin: s.feeMin,
      feeMax: s.feeMax,
      feePeriod: s.feePeriod,
      feeVisibility: s.feeVisibility,
      verified: s.verified,
      featured: s.featured,
      status: s.status,
      coverImage: s.coverImage,
      gallery: s.gallery,
    };

    if (existing) {
      await db
        .update(schema.schools)
        .set({ ...values, updatedAt: new Date() })
        .where(eq(schema.schools.id, existing.id));
      console.log(`  ↻ Updated School: ${s.name}`);
    } else {
      await db.insert(schema.schools).values(values);
      console.log(`  ✓ Created School: ${s.name}`);
    }
  }

  console.log("✅ Seeding complete!");
  process.exit(0);
}

seedSchools().catch((err) => {
  console.error("❌ Seeding failed:", err);
  process.exit(1);
});
