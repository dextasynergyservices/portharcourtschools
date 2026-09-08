import { describe, expect, it } from "vitest";
import { generateGoogleCalendarUrl } from "@/lib/calendar";

describe("Calendar Utility — Google Calendar Link Generator", () => {
  it("generates a valid calendar URL with dates, title, venue, and description", () => {
    const url = generateGoogleCalendarUrl({
      title: "Teachers' Spotlight Summit 2026",
      description: "Annual gathering of Rivers State educational leaders.",
      venue: "Hotel Presidential, Port Harcourt",
      startDate: "2026-10-14T09:00:00.000Z",
      endDate: "2026-10-14T17:00:00.000Z",
    });

    expect(url).toContain("https://calendar.google.com/calendar/render?");
    expect(url).toContain("action=TEMPLATE");
    expect(url).toContain("Teachers%27+Spotlight+Summit+2026");
    expect(url).toContain("Hotel+Presidential%2C+Port+Harcourt");
    expect(url).toContain("20261014T090000Z%2F20261014T170000Z");
  });

  it("defaults end date to start date plus 3 hours when omitted", () => {
    const startDate = "2026-11-20T10:00:00.000Z";
    const url = generateGoogleCalendarUrl({
      title: "STEM Pedagogy Workshop",
      venue: "Port Harcourt Innovation Hub",
      startDate,
    });

    // 10:00 + 3 hours = 13:00
    expect(url).toContain("20261120T100000Z%2F20261120T130000Z");
  });
});
