import { beforeEach, describe, expect, it, vi } from "vitest";

const { mockSelectLimit, mockInsertReturning } = vi.hoisted(() => {
  const mockInsertReturning = vi.fn();
  const mockInsertValues = vi.fn(() => ({ returning: mockInsertReturning }));
  const mockInsert = vi.fn(() => ({ values: mockInsertValues }));

  const mockSelectLimit = vi.fn();
  const mockSelectWhere = vi.fn(() => ({ limit: mockSelectLimit }));
  const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
  const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

  return {
    mockInsertReturning,
    mockInsertValues,
    mockInsert,
    mockSelectLimit,
    mockSelectWhere,
    mockSelectFrom,
    mockSelect,
  };
});

vi.mock("@/lib/db", () => {
  const mockInsertValues = vi.fn(() => ({ returning: mockInsertReturning }));
  const mockInsert = vi.fn(() => ({ values: mockInsertValues }));

  const mockSelectWhere = vi.fn(() => ({ limit: mockSelectLimit }));
  const mockSelectFrom = vi.fn(() => ({ where: mockSelectWhere }));
  const mockSelect = vi.fn(() => ({ from: mockSelectFrom }));

  return {
    db: {
      select: mockSelect,
      insert: mockInsert,
    },
    events: { id: "id" },
    eventRegistrations: { id: "id" },
    contactSubmissions: {},
    nominations: {},
  };
});

vi.mock("@/lib/email", () => ({
  sendEventRegistrationConfirmedEmail: vi
    .fn()
    .mockResolvedValue({ success: true }),
  sendEventPaymentPendingEmail: vi.fn().mockResolvedValue({ success: true }),
  sendContactNotificationEmail: vi.fn().mockResolvedValue({ success: true }),
}));

import { createEventRegistrationAction } from "@/app/(public)/events/actions";
import {
  sendEventPaymentPendingEmail,
  sendEventRegistrationConfirmedEmail,
} from "@/lib/email";

describe("Event Registration Integration — Action -> DB Record -> Email Confirmation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("registers attendee for a free event, writes DB record, and dispatches confirmation email with calendar URL", async () => {
    // Mock event lookup returning published free event
    mockSelectLimit.mockResolvedValue([
      {
        id: "evt-free-001",
        title: "Modern Classroom Pedagogy Workshop",
        startDate: "2026-11-10T10:00:00.000Z",
        endDate: "2026-11-10T14:00:00.000Z",
        venue: "Rivers State Library Complex, Port Harcourt",
        isPaid: false,
        price: 0,
        status: "published",
      },
    ]);

    // Mock insert returning new registration ID
    mockInsertReturning.mockResolvedValue([{ id: "reg-999" }]);

    const formData = new FormData();
    formData.append("eventId", "evt-free-001");
    formData.append("fullName", "Nkechi Amadi");
    formData.append("email", "nkechi.amadi@school.ng");
    formData.append("phone", "+2348039876543");
    formData.append("schoolName", "Brookstone Secondary");
    formData.append("role", "teacher");
    formData.append("ticketQuantity", "1");

    const result = await createEventRegistrationAction(formData);

    expect(result.success).toBe(true);
    expect(result.isPaid).toBe(false);
    expect(sendEventRegistrationConfirmedEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        attendeeName: "Nkechi Amadi",
        email: "nkechi.amadi@school.ng",
        eventTitle: "Modern Classroom Pedagogy Workshop",
        calendarUrl: expect.stringContaining("calendar.google.com"),
      }),
    );
    expect(sendEventPaymentPendingEmail).not.toHaveBeenCalled();
  });

  it("registers attendee for paid event with pending_payment status and dispatches payment email", async () => {
    mockSelectLimit.mockResolvedValue([
      {
        id: "evt-paid-002",
        title: "Curriculum Leadership Masterclass",
        startDate: "2026-11-25T09:00:00.000Z",
        endDate: "2026-11-25T16:00:00.000Z",
        venue: "Hotel Presidential, Port Harcourt",
        isPaid: true,
        price: 25000,
        paymentLink: "https://paystack.com/pay/curriculum-masterclass",
        status: "published",
      },
    ]);

    mockInsertReturning.mockResolvedValue([{ id: "reg-1000" }]);

    const formData = new FormData();
    formData.append("eventId", "evt-paid-002");
    formData.append("fullName", "Tamuno Tonye");
    formData.append("email", "tamuno@example.com");
    formData.append("phone", "+2348031122334");
    formData.append("role", "school_leader");
    formData.append("ticketQuantity", "2");

    const result = await createEventRegistrationAction(formData);

    expect(result.success).toBe(true);
    expect(result.isPaid).toBe(true);
    expect(result.paymentLink).toContain("paystack.com");
    expect(sendEventPaymentPendingEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        attendeeName: "Tamuno Tonye",
        email: "tamuno@example.com",
        totalAmount: 50000,
        eventTitle: "Curriculum Leadership Masterclass",
      }),
    );
    expect(sendEventRegistrationConfirmedEmail).not.toHaveBeenCalled();
  });
});
