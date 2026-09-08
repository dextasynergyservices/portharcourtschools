import { z } from "zod";

export const eventSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters"),
  slug: z.string().min(3, "Slug must be at least 3 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  type: z.enum(["summit", "masterclass", "workshop", "awards"]),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().optional().nullable(),
  venue: z.string().min(3, "Venue is required"),
  coverImage: z.string().optional().nullable(),
  isPaid: z.boolean().default(false),
  price: z.coerce.number().min(0, "Price must be at least 0").default(0),
  paymentLink: z.string().optional().nullable(),
  status: z.enum(["draft", "in_review", "published", "archived"]),
});

export type EventFormData = z.infer<typeof eventSchema>;
