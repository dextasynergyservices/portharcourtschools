import { describe, expect, it } from "vitest";
import { postSchema } from "@/lib/validations/post";

describe("Post Zod Schema Validation", () => {
  const validPost = {
    title: "Navigating Primary School Admissions in Port Harcourt",
    slug: "navigating-primary-school-admissions-port-harcourt",
    excerpt:
      "A comprehensive parent guide to registration deadlines and tuition bands.",
    body: "Here is the full article content providing deep actionable guidance for families.",
    coverImage: "https://images.unsplash.com/photo-1577896851231-70ef18881754",
    status: "published" as const,
    tags: ["Admissions", "Primary Education"],
  };

  it("validates a valid article payload successfully", () => {
    const result = postSchema.safeParse(validPost);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe(
        "Navigating Primary School Admissions in Port Harcourt",
      );
      expect(result.data.status).toBe("published");
    }
  });

  it("rejects title shorter than 3 characters", () => {
    const result = postSchema.safeParse({ ...validPost, title: "PH" });
    expect(result.success).toBe(false);
  });

  it("rejects slug shorter than 3 characters", () => {
    const result = postSchema.safeParse({ ...validPost, slug: "a" });
    expect(result.success).toBe(false);
  });

  it("requires article body of at least 10 characters", () => {
    const result = postSchema.safeParse({ ...validPost, body: "Short" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid status enum", () => {
    const result = postSchema.safeParse({
      ...validPost,
      status: "pending_approval",
    });
    expect(result.success).toBe(false);
  });

  it("defaults tags to empty array if omitted", () => {
    const { tags, ...withoutTags } = validPost;
    const result = postSchema.safeParse(withoutTags);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual([]);
    }
  });
});
