import { Resend } from "resend";
import { ContactNotificationEmail } from "@/emails/contact-notification-email";
import { EventPaymentPendingEmail } from "@/emails/event-payment-pending-email";
import { EventRegistrationConfirmedEmail } from "@/emails/event-registration-confirmed-email";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

const DEFAULT_ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "hello@portharcourtschools.ng";
const SENDER_EMAIL =
  process.env.RESEND_FROM_EMAIL ||
  "PortHarcourtSchools <notifications@portharcourtschools.ng>";

interface SendContactNotificationParams {
  name: string;
  email: string;
  phone?: string | null;
  personaType: string;
  subject?: string | null;
  message: string;
}

/**
 * Dispatches an automated email notification to admin inbox when a contact or partnership lead is captured.
 * If RESEND_API_KEY is not configured, logs to console in dev mode without throwing errors.
 */
export async function sendContactNotificationEmail(
  params: SendContactNotificationParams,
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn(
      "RESEND_API_KEY not configured. Email dispatch skipped for submission from:",
      params.email,
    );
    return { success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [DEFAULT_ADMIN_EMAIL],
      replyTo: params.email,
      subject: `[${params.personaType.toUpperCase()}] New inquiry from ${params.name}: ${params.subject || "Website Lead"}`,
      react: ContactNotificationEmail({
        name: params.name,
        email: params.email,
        phone: params.phone,
        personaType: params.personaType,
        subject: params.subject,
        message: params.message,
        submittedAt: new Date().toLocaleString("en-GB"),
      }),
    });

    if (error) {
      console.error("Resend error sending contact notification:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Failed to send contact notification email:", err);
    return { success: false, error: "Email delivery failed" };
  }
}

interface SendEventRegistrationConfirmedParams {
  attendeeName: string;
  email: string;
  eventTitle: string;
  eventDateStr: string;
  eventVenue: string;
  ticketQuantity: number;
  ticketTierName?: string | null;
  isPaid: boolean;
  totalAmount?: number | null;
  registrationId: string;
  calendarUrl: string;
}

/**
 * Dispatches a ticket confirmation email with Google Calendar invite link to an attendee.
 */
export async function sendEventRegistrationConfirmedEmail(
  params: SendEventRegistrationConfirmedParams,
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn(
      `[DEV] RESEND_API_KEY not configured. Simulated confirmed event registration email sent to: ${params.email} for ${params.eventTitle} (${params.ticketTierName || "Standard Tier"})`,
    );
    return { success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [params.email],
      replyTo: DEFAULT_ADMIN_EMAIL,
      subject: `Your Ticket is Confirmed: ${params.eventTitle}`,
      react: EventRegistrationConfirmedEmail({
        attendeeName: params.attendeeName,
        eventTitle: params.eventTitle,
        eventDateStr: params.eventDateStr,
        eventVenue: params.eventVenue,
        ticketQuantity: params.ticketQuantity,
        ticketTierName: params.ticketTierName,
        isPaid: params.isPaid,
        totalAmount: params.totalAmount,
        registrationId: params.registrationId,
        calendarUrl: params.calendarUrl,
      }),
    });

    if (error) {
      console.error("Resend error sending event confirmation email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Failed to send event confirmation email:", err);
    return { success: false, error: "Email delivery failed" };
  }
}

interface SendEventPaymentPendingParams {
  attendeeName: string;
  email: string;
  eventTitle: string;
  eventDateStr: string;
  eventVenue: string;
  ticketQuantity: number;
  ticketTierName?: string | null;
  totalAmount: number;
  paymentLink: string;
  registrationId: string;
}

/**
 * Dispatches an email with payment link for pending event registrations.
 */
export async function sendEventPaymentPendingEmail(
  params: SendEventPaymentPendingParams,
): Promise<{ success: boolean; id?: string; error?: string }> {
  if (!resend) {
    console.warn(
      `[DEV] RESEND_API_KEY not configured. Simulated pending payment email sent to: ${params.email} (₦${params.totalAmount} - ${params.ticketTierName || "Standard Tier"}) for ${params.eventTitle}`,
    );
    return { success: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [params.email],
      replyTo: DEFAULT_ADMIN_EMAIL,
      subject: `Complete Your Payment: ${params.eventTitle}`,
      react: EventPaymentPendingEmail({
        attendeeName: params.attendeeName,
        eventTitle: params.eventTitle,
        eventDateStr: params.eventDateStr,
        eventVenue: params.eventVenue,
        ticketQuantity: params.ticketQuantity,
        ticketTierName: params.ticketTierName,
        totalAmount: params.totalAmount,
        paymentLink: params.paymentLink,
        registrationId: params.registrationId,
      }),
    });

    if (error) {
      console.error("Resend error sending event pending payment email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Failed to send event pending payment email:", err);
    return { success: false, error: "Email delivery failed" };
  }
}

interface SendUserInviteParams {
  to: string;
  name: string;
  role: string;
  inviterName?: string;
  setPassLink: string;
  expiresInHours?: number;
}

/**
 * Dispatches an invite email with secure password creation link to a new team member.
 * If RESEND_API_KEY is not configured, gracefully logs without throwing errors.
 */
export async function sendUserInviteEmail(
  params: SendUserInviteParams,
): Promise<{
  success: boolean;
  id?: string;
  error?: string;
  isSimulated?: boolean;
}> {
  if (!resend) {
    console.warn(
      `[DEV] RESEND_API_KEY not configured. Simulated user invitation email for ${params.to} (${params.role}): ${params.setPassLink}`,
    );
    return { success: true, isSimulated: true };
  }

  try {
    const { UserInviteEmail } = await import("@/emails/user-invite-email");
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [params.to],
      replyTo: DEFAULT_ADMIN_EMAIL,
      subject: "You're Invited to Join PortHarcourtSchools",
      react: UserInviteEmail({
        name: params.name,
        email: params.to,
        role: params.role,
        inviterName: params.inviterName,
        setPassLink: params.setPassLink,
        expiresInHours: params.expiresInHours || 48,
      }),
    });

    if (error) {
      console.error("Resend error sending user invitation email:", error);
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error("Failed to send user invitation email:", err);
    return { success: false, error: "Email delivery failed" };
  }
}
