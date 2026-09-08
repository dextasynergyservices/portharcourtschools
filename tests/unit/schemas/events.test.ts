import { describe, expect, it } from "vitest";
import { eventSchema } from "@/lib/validations/event";

describe("Event Zod Schema Validation", () => {
  const validEvent = {
    title: "Teachers' Spotlight Summit & Awards 2026",
    slug: "teachers-spotlight-summit-awards-2026",
    description:
      "Annual grand conference celebrating educator excellence across Rivers State.",
    type: "summit" as const,
    startDate: "2026-10-14T09:00:00.000Z",
    endDate: "2026-10-14T17:00:00.000Z",
    venue: "Atlantic Hall, Hotel Presidential, GRA Phase 2, Port Harcourt",
    isPaid: false,
    price: 0,
    status: "published" as const,
  };

  it("validates a standard event payload successfully", () => {
    const result = eventSchema.safeParse(validEvent);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.title).toBe(
        "Teachers' Spotlight Summit & Awards 2026",
      );
      expect(result.data.type).toBe("summit");
    }
  });

  it("rejects event title shorter than 3 characters", () => {
    const result = eventSchema.safeParse({ ...validEvent, title: "PH" });
    expect(result.success).toBe(false);
  });

  it("rejects invalid event type", () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      type: "hackathon",
    });
    expect(result.success).toBe(false);
  });

  it("requires a non-empty start date", () => {
    const result = eventSchema.safeParse({ ...validEvent, startDate: "" });
    expect(result.success).toBe(false);
  });

  it("requires venue of at least 3 characters", () => {
    const result = eventSchema.safeParse({ ...validEvent, venue: "PH" });
    expect(result.success).toBe(false);
  });

  it("rejects negative ticket price", () => {
    const result = eventSchema.safeParse({
      ...validEvent,
      isPaid: true,
      price: -5000,
    });
    expect(result.success).toBe(false);
  });
});
