import type { ReactElement } from "react";
import { Resend } from "resend";
import { ContactAcknowledgementEmail } from "@/emails/contact-acknowledgement-email";
import { ContactNotificationEmail } from "@/emails/contact-notification-email";
import { EventPaymentPendingEmail } from "@/emails/event-payment-pending-email";
import { EventRegistrationConfirmedEmail } from "@/emails/event-registration-confirmed-email";
import { UserInviteEmail } from "@/emails/user-invite-email";

const resendApiKey = process.env.RESEND_API_KEY;
const resend = resendApiKey ? new Resend(resendApiKey) : null;

// The sender must be on a domain verified in Resend (schoolsvoice.com),
// otherwise Resend rejects every send with a 403.
const SENDER_EMAIL =
  process.env.EMAIL_FROM || "Schools Voice <hello@schoolsvoice.com>";
const DEFAULT_ADMIN_EMAIL =
  process.env.ADMIN_NOTIFICATION_EMAIL || "hello@schoolsvoice.com";

type EmailResult = {
  success: boolean;
  id?: string;
  error?: string;
  isSimulated?: boolean;
};

/**
 * Sends a single email through Resend. Never throws: failures are logged and
 * returned so callers can decide whether they matter.
 * If RESEND_API_KEY is not configured, the send is skipped and reported as simulated.
 */
async function deliver(
  label: string,
  message: {
    to: string;
    subject: string;
    replyTo?: string;
    react: ReactElement;
  },
): Promise<EmailResult> {
  if (!resend) {
    console.warn(
      `RESEND_API_KEY not configured. Skipped "${label}" email to ${message.to}.`,
    );
    return { success: true, isSimulated: true };
  }

  try {
    const { data, error } = await resend.emails.send({
      from: SENDER_EMAIL,
      to: [message.to],
      replyTo: message.replyTo,
      subject: message.subject,
      react: message.react,
    });

    if (error) {
      console.error(
        `Resend rejected "${label}" email to ${message.to}:`,
        error,
      );
      return { success: false, error: error.message };
    }

    return { success: true, id: data?.id };
  } catch (err) {
    console.error(`Failed to send "${label}" email to ${message.to}:`, err);
    return { success: false, error: "Email delivery failed" };
  }
}

interface SendContactNotificationParams {
  name: string;
  email: string;
  phone?: string | null;
  personaType: string;
  subject?: string | null;
  message: string;
}

/**
 * Notifies the admin inbox when a contact or partnership lead is captured.
 * Reply-To is the submitter, so admins can answer straight from their inbox.
 */
export function sendContactNotificationEmail(
  params: SendContactNotificationParams,
): Promise<EmailResult> {
  return deliver("contact notification", {
    to: DEFAULT_ADMIN_EMAIL,
    replyTo: params.email,
    subject: `New ${params.personaType.replace("_", " ")} inquiry from ${params.name}: ${params.subject || "Website lead"}`,
    react: ContactNotificationEmail({
      name: params.name,
      email: params.email,
      phone: params.phone,
      personaType: params.personaType,
      subject: params.subject,
      message: params.message,
      submittedAt: new Date().toLocaleString("en-GB", {
        timeZone: "Africa/Lagos",
        dateStyle: "medium",
        timeStyle: "short",
      }),
    }),
  });
}

interface SendContactAcknowledgementParams {
  name: string;
  email: string;
  subject?: string | null;
  message: string;
}

/**
 * Sends the submitter a receipt confirming their message was received.
 */
export function sendContactAcknowledgementEmail(
  params: SendContactAcknowledgementParams,
): Promise<EmailResult> {
  return deliver("contact acknowledgement", {
    to: params.email,
    replyTo: DEFAULT_ADMIN_EMAIL,
    subject: "We've received your message — Schools Voice",
    react: ContactAcknowledgementEmail({
      name: params.name,
      subject: params.subject,
      message: params.message,
    }),
  });
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
 * Sends a ticket confirmation email with Google Calendar invite link to an attendee.
 */
export function sendEventRegistrationConfirmedEmail(
  params: SendEventRegistrationConfirmedParams,
): Promise<EmailResult> {
  return deliver("event confirmation", {
    to: params.email,
    replyTo: DEFAULT_ADMIN_EMAIL,
    subject: `You're registered: ${params.eventTitle}`,
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
 * Sends a payment link for pending (paid) event registrations.
 */
export function sendEventPaymentPendingEmail(
  params: SendEventPaymentPendingParams,
): Promise<EmailResult> {
  return deliver("event payment pending", {
    to: params.email,
    replyTo: DEFAULT_ADMIN_EMAIL,
    subject: `Complete your payment: ${params.eventTitle}`,
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
 * Sends a team invitation with a secure password-creation link.
 */
export function sendUserInviteEmail(
  params: SendUserInviteParams,
): Promise<EmailResult> {
  return deliver("team invite", {
    to: params.to,
    replyTo: DEFAULT_ADMIN_EMAIL,
    subject: "You're invited to join the Schools Voice team",
    react: UserInviteEmail({
      name: params.name,
      email: params.to,
      role: params.role,
      inviterName: params.inviterName,
      setPassLink: params.setPassLink,
      expiresInHours: params.expiresInHours || 48,
    }),
  });
}
