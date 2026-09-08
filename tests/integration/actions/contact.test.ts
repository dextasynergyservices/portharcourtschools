import { beforeEach, describe, expect, it, vi } from "vitest";

// Mock external services and database
vi.mock("@/lib/turnstile", () => ({
  verifyTurnstileToken: vi.fn(),
}));

vi.mock("@/lib/email", () => ({
  sendContactNotificationEmail: vi.fn(),
}));

const { mockInsert, mockValues } = vi.hoisted(() => {
  const mockValues = vi.fn();
  const mockInsert = vi.fn(() => ({ values: mockValues }));
  return { mockInsert, mockValues };
});

vi.mock("@/lib/db", () => ({
  db: {
    insert: mockInsert,
  },
  contactSubmissions: {},
}));

import { submitContactFormAction } from "@/app/(public)/contact/actions";
import { sendContactNotificationEmail } from "@/lib/email";
import { verifyTurnstileToken } from "@/lib/turnstile";

describe("Contact Action Integration — Form Submission -> DB Row -> Email Sent", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("successfully processes valid submission, writes to DB, and triggers notification email", async () => {
    // Arrange: Turnstile succeeds, DB succeeds, email succeeds
    vi.mocked(verifyTurnstileToken).mockResolvedValue({ success: true });
    mockValues.mockResolvedValue([{ id: "sub-123" }]);
    vi.mocked(sendContactNotificationEmail).mockResolvedValue({
      success: true,
      id: "msg-123",
    });

    const formData = new FormData();
    formData.append("name", "Dr. Amadi Okoro");
    formData.append("email", "amadi.okoro@example.com");
    formData.append("phone", "+2348031234567");
    formData.append("personaType", "school_leader");
    formData.append("subject", "Partnership Inquiry for STEM Programme");
    formData.append(
      "message",
      "We are interested in collaborating on teacher development masterclasses.",
    );
    formData.append("turnstileToken", "mock-valid-turnstile-token");

    // Act
    const response = await submitContactFormAction(formData);

    // Assert
    expect(response).toEqual({ success: true });

    // Verify Turnstile verification was invoked
    expect(verifyTurnstileToken).toHaveBeenCalledWith(
      "mock-valid-turnstile-token",
    );

    // Verify DB insertion was invoked with properly mapped persona
    expect(mockInsert).toHaveBeenCalledTimes(1);
    expect(mockValues).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Dr. Amadi Okoro",
        email: "amadi.okoro@example.com",
        phone: "+2348031234567",
        personaType: "school", // mapped from school_leader
        subject: "Partnership Inquiry for STEM Programme",
        status: "new",
      }),
    );

    // Verify Notification Email was dispatched
    expect(sendContactNotificationEmail).toHaveBeenCalledWith(
      expect.objectContaining({
        name: "Dr. Amadi Okoro",
        email: "amadi.okoro@example.com",
        personaType: "school_leader",
      }),
    );
  });

  it("returns error and halts when turnstile verification fails", async () => {
    vi.mocked(verifyTurnstileToken).mockResolvedValue({
      success: false,
      error: "Spam token invalid",
    });

    const formData = new FormData();
    formData.append("name", "Spam Bot");
    formData.append("email", "bot@spammer.com");
    formData.append(
      "message",
      "Spam content message that is over ten characters",
    );
    formData.append("turnstileToken", "bad-token");

    const response = await submitContactFormAction(formData);

    expect(response.success).toBeUndefined();
    expect(response.error).toContain("Spam token invalid");
    expect(mockInsert).not.toHaveBeenCalled();
    expect(sendContactNotificationEmail).not.toHaveBeenCalled();
  });

  it("rejects invalid email address before hitting database or email services", async () => {
    const formData = new FormData();
    formData.append("name", "Jane Doe");
    formData.append("email", "not-a-valid-email");
    formData.append(
      "message",
      "A valid inquiry message longer than ten characters",
    );

    const response = await submitContactFormAction(formData);

    expect(response.success).toBeUndefined();
    expect(response.error).toContain("valid email");
    expect(verifyTurnstileToken).not.toHaveBeenCalled();
    expect(mockInsert).not.toHaveBeenCalled();
  });
});
