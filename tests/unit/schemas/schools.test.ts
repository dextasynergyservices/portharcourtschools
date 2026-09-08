import { describe, expect, it } from "vitest";
import { schoolSchema } from "@/lib/validations/school";

describe("School Zod Schema Validation", () => {
  const validSchool = {
    name: "Greenoak International School",
    slug: "greenoak-international-school",
    schoolType: "international" as const,
    curriculum: "british" as const,
    gender: "co_ed" as const,
    boardingType: "day" as const,
    levels: ["early_years", "primary", "secondary"],
    areaId: "old-gra",
    address: "99 Tombia Street, GRA Phase 2",
    lga: "Port Harcourt",
    phone: "+2348037087226",
    whatsapp: "+2348037087226",
    email: "admissions@greenoak.org",
    website: "https://greenoak.org",
    feeMin: 500000,
    feeMax: 850000,
    feePeriod: "per_term" as const,
    feeVisibility: "band_only" as const,
    verified: true,
    featured: true,
    status: "published" as const,
  };

  it("validates a fully formed school payload successfully", () => {
    const result = schoolSchema.safeParse(validSchool);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.name).toBe("Greenoak International School");
      expect(result.data.levels).toHaveLength(3);
    }
  });

  it("requires school name to be at least 2 characters", () => {
    const result = schoolSchema.safeParse({ ...validSchool, name: "A" });
    expect(result.success).toBe(false);
  });

  it("requires slug to be at least 2 characters", () => {
    const result = schoolSchema.safeParse({ ...validSchool, slug: "" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid school type enum values", () => {
    const result = schoolSchema.safeParse({
      ...validSchool,
      schoolType: "invalid_type",
    });
    expect(result.success).toBe(false);
  });

  it("rejects invalid curriculum enum values", () => {
    const result = schoolSchema.safeParse({
      ...validSchool,
      curriculum: "french_curriculum",
    });
    expect(result.success).toBe(false);
  });

  it("requires at least one education level", () => {
    const result = schoolSchema.safeParse({ ...validSchool, levels: [] });
    expect(result.success).toBe(false);
  });

  it("coerces numerical fee strings into numbers", () => {
    const result = schoolSchema.safeParse({
      ...validSchool,
      feeMin: "400000",
      feeMax: "800000",
    });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.feeMin).toBe(400000);
      expect(result.data.feeMax).toBe(800000);
    }
  });
});
