import { neon } from "@neondatabase/serverless";
import bcrypt from "bcryptjs";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../src/lib/db/schema";

const dbUrl = process.env.DATABASE_URL;

if (!dbUrl) {
  console.error("DATABASE_URL environment variable is missing.");
  process.exit(1);
}

const sql = neon(dbUrl);
const db = drizzle({ client: sql, schema });

const PH_AREAS = [
  { name: "Old GRA", slug: "old-gra", lga: "Port Harcourt City" },
  { name: "New GRA", slug: "new-gra", lga: "Port Harcourt City" },
  { name: "Woji", slug: "woji", lga: "Obio-Akpor" },
  { name: "Rumuola", slug: "rumuola", lga: "Obio-Akpor" },
  { name: "Trans-Amadi", slug: "trans-amadi", lga: "Port Harcourt City" },
  { name: "Peter Odili Road", slug: "peter-odili", lga: "Port Harcourt City" },
  { name: "Ada George", slug: "ada-george", lga: "Obio-Akpor" },
  { name: "D/Line", slug: "d-line", lga: "Port Harcourt City" },
  { name: "Elelenwo", slug: "elelenwo", lga: "Obio-Akpor" },
  { name: "Rumuokwuta", slug: "rumuokwuta", lga: "Obio-Akpor" },
  { name: "Choba", slug: "choba", lga: "Obio-Akpor" },
  { name: "Alakahia", slug: "alakahia", lga: "Obio-Akpor" },
  { name: "Rumuigbo", slug: "rumuigbo", lga: "Obio-Akpor" },
  { name: "Eliozu", slug: "eliozu", lga: "Obio-Akpor" },
  { name: "Rumuodomaya", slug: "rumuodomaya", lga: "Obio-Akpor" },
];

async function seed() {
  console.log("🌱 Starting seed script for PortHarcourtSchools...");

  // 1. Seed Curated Areas
  console.log("📍 Seeding Port Harcourt curated areas...");
  for (const area of PH_AREAS) {
    const [existing] = await db
      .select()
      .from(schema.areas)
      .where(eq(schema.areas.slug, area.slug))
      .limit(1);

    if (!existing) {
      await db.insert(schema.areas).values({
        name: area.name,
        slug: area.slug,
        lga: area.lga,
        isActive: true,
      });
      console.log(`  + Inserted area: ${area.name}`);
    } else {
      console.log(`  = Area already exists: ${area.name}`);
    }
  }

  // 2. Seed Super Admin
  const adminEmail = "admin@portharcourtschools.com";
  const defaultPassword = "Admin@PHS2026!";

  console.log(`👤 Checking for Super Admin (${adminEmail})...`);
  const [existingAdmin] = await db
    .select()
    .from(schema.users)
    .where(eq(schema.users.email, adminEmail))
    .limit(1);

  if (!existingAdmin) {
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(defaultPassword, salt);

    await db.insert(schema.users).values({
      name: "Super Admin",
      email: adminEmail,
      passwordHash,
      role: "super_admin",
      status: "active",
    });

    console.log("✅ Super Admin created successfully!");
    console.log(`   Email:    ${adminEmail}`);
    console.log(`   Password: ${defaultPassword}`);
  } else {
    console.log("ℹ️  Super Admin already exists.");
  }

  console.log("🎉 Seed finished successfully!");
}

seed().catch((err) => {
  console.error("❌ Seed failed:", err);
  process.exit(1);
});
