import { z } from "zod";

export const schoolSchema = z.object({
  name: z.string().min(2, "School name is required"),
  slug: z.string().min(2, "Slug is required"),
  schoolType: z
    .enum(["private", "public", "faith_based", "international"])
    .default("private"),
  curriculum: z
    .enum(["nigerian", "british", "american", "ib", "mixed"])
    .default("nigerian"),
  gender: z.enum(["co_ed", "boys", "girls"]).default("co_ed"),
  boardingType: z.enum(["day", "boarding", "both"]).default("day"),
  levels: z.array(z.string()).min(1, "Select at least one level"),
  areaId: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  lga: z.string().optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  website: z.string().optional().nullable(),
  socials: z
    .object({
      instagram: z.string().optional(),
      facebook: z.string().optional(),
      x: z.string().optional(),
      tiktok: z.string().optional(),
    })
    .optional()
    .default({}),
  feeMin: z.coerce.number().optional().nullable(),
  feeMax: z.coerce.number().optional().nullable(),
  feePeriod: z.enum(["per_term", "per_session"]).default("per_term"),
  feeVisibility: z
    .enum(["exact", "band_only", "on_request", "hidden"])
    .default("band_only"),
  logo: z.string().optional().nullable(),
  coverImage: z.string().optional().nullable(),
  gallery: z.array(z.string()).default([]),
  description: z.string().optional().nullable(),
  verified: z.boolean().default(false),
  featured: z.boolean().default(false),
  status: z.enum(["draft", "published", "archived"]).default("draft"),
});

export type SchoolFormData = z.infer<typeof schoolSchema>;
