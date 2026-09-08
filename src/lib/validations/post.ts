import { z } from "zod";

export const postSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters long"),
  slug: z.string().min(3, "Slug must be at least 3 characters long"),
  excerpt: z.string().optional(),
  body: z.string().min(10, "Article content must be at least 10 characters"),
  coverImage: z.string().optional(),
  categoryId: z.string().nullable().optional(),
  tags: z.array(z.string()).default([]),
  status: z.enum(["draft", "in_review", "published", "archived"]),
});

export type PostFormData = z.infer<typeof postSchema>;
