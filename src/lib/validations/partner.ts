import { z } from "zod";

export const partnerSchema = z.object({
  name: z
    .string()
    .min(2, "Partner name must be at least 2 characters")
    .max(120, "Partner name cannot exceed 120 characters"),
  logo: z
    .string()
    .min(1, "Partner logo URL or path is required")
    .refine(
      (val) =>
        val.startsWith("/") ||
        val.startsWith("http://") ||
        val.startsWith("https://"),
      "Logo must be a valid path (e.g. /images/...) or URL (https://...)",
    ),
  tier: z
    .enum([
      "headline",
      "strategic",
      "corporate",
      "technology",
      "education",
      "partner",
    ])
    .default("partner"),
  website: z
    .string()
    .optional()
    .nullable()
    .transform((val) => (val?.trim() === "" ? null : val))
    .refine(
      (val) => !val || val.startsWith("http://") || val.startsWith("https://"),
      "Website must begin with http:// or https://",
    ),
  description: z
    .string()
    .max(500, "Description cannot exceed 500 characters")
    .optional()
    .nullable(),
  isActive: z.boolean().default(true),
  order: z.coerce.number().int().default(0),
});

export type PartnerFormData = z.infer<typeof partnerSchema>;
