import {
  brand,
  DetailCard,
  DetailRow,
  EmailLayout,
  Note,
  Paragraph,
  PrimaryButton,
  Signoff,
} from "./components/email-layout";

interface EventRegistrationConfirmedEmailProps {
  attendeeName: string;
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

export function EventRegistrationConfirmedEmail({
  attendeeName = "Ada Okafor",
  eventTitle = "Port Harcourt Teachers Summit 2026",
  eventDateStr = "Sat, Nov 21, 2026",
  eventVenue = "Hotel Presidential, Port Harcourt",
  ticketQuantity = 1,
  ticketTierName = "Standard",
  isPaid = false,
  totalAmount = 0,
  registrationId = "b3f1c2d4-0000-4000-8000-123456789abc",
  calendarUrl = "https://calendar.google.com",
}: EventRegistrationConfirmedEmailProps) {
  const firstName = attendeeName.trim().split(/\s+/)[0] || attendeeName;

  return (
    <EmailLayout
      preview={`You're in! Your registration for ${eventTitle} is confirmed.`}
      eyebrow="Registration Confirmed"
      title="You're in! See you there."
      intro={`Your seat at ${eventTitle} is officially reserved.`}
      footerNote="You received this email because you registered for an event on Schools Voice."
    >
      <Paragraph>Hello {firstName},</Paragraph>
      <Paragraph>
        Thank you for registering for <strong>{eventTitle}</strong>. Your
        registration has been confirmed — here are your details:
      </Paragraph>

      <DetailCard title={eventTitle}>
        <DetailRow label="Date">{eventDateStr}</DetailRow>
        <DetailRow label="Venue">{eventVenue}</DetailRow>
        {ticketTierName && (
          <DetailRow label="Ticket type">{ticketTierName}</DetailRow>
        )}
        <DetailRow label="Tickets">
          {ticketQuantity} {ticketQuantity === 1 ? "ticket" : "tickets"}
        </DetailRow>
        <DetailRow label="Status">
          <span style={{ color: brand.success }}>
            ✓ Confirmed
            {isPaid
              ? ` · Paid ₦${(totalAmount || 0).toLocaleString()}`
              : " · Free"}
          </span>
        </DetailRow>
        <DetailRow label="Reference" mono>
          {registrationId}
        </DetailRow>
      </DetailCard>

      <PrimaryButton href={calendarUrl}>Add to Google Calendar</PrimaryButton>

      <Note>
        <strong>On the day:</strong> show this email or quote your reference
        number at the registration desk for quick check-in.
      </Note>

      <Paragraph>
        Need help or want to transfer your ticket? Just reply to this email and
        our events team will assist you.
      </Paragraph>

      <Signoff team="The Schools Voice Events Team" />
    </EmailLayout>
  );
}

export default EventRegistrationConfirmedEmail;
