import {
  DetailCard,
  DetailRow,
  EmailLayout,
  FallbackLink,
  Note,
  Paragraph,
  PrimaryButton,
  Signoff,
} from "./components/email-layout";

interface EventPaymentPendingEmailProps {
  attendeeName: string;
  eventTitle: string;
  eventDateStr: string;
  eventVenue: string;
  ticketQuantity: number;
  ticketTierName?: string | null;
  totalAmount: number;
  paymentLink: string;
  registrationId: string;
}

export function EventPaymentPendingEmail({
  attendeeName = "Ada Okafor",
  eventTitle = "Port Harcourt Teachers Summit 2026",
  eventDateStr = "Sat, Nov 21, 2026",
  eventVenue = "Hotel Presidential, Port Harcourt",
  ticketQuantity = 2,
  ticketTierName = "VIP",
  totalAmount = 50000,
  paymentLink = "https://paystack.com/pay/sample",
  registrationId = "b3f1c2d4-0000-4000-8000-123456789abc",
}: EventPaymentPendingEmailProps) {
  const firstName = attendeeName.trim().split(/\s+/)[0] || attendeeName;
  const amount = `₦${totalAmount.toLocaleString()}`;

  return (
    <EmailLayout
      preview={`One last step: complete your ${amount} payment for ${eventTitle}.`}
      eyebrow="Payment Pending"
      title="One last step to secure your seat"
      intro={`Complete your payment to confirm your registration for ${eventTitle}.`}
      footerNote="You received this email because you registered for an event on Schools Voice."
    >
      <Paragraph>Hello {firstName},</Paragraph>
      <Paragraph>
        Thank you for registering for <strong>{eventTitle}</strong>. We've saved
        your details — your seat will be confirmed as soon as payment is
        received.
      </Paragraph>

      <DetailCard title="Order summary">
        <DetailRow label="Event">{eventTitle}</DetailRow>
        <DetailRow label="Date">{eventDateStr}</DetailRow>
        <DetailRow label="Venue">{eventVenue}</DetailRow>
        {ticketTierName && (
          <DetailRow label="Ticket type">{ticketTierName}</DetailRow>
        )}
        <DetailRow label="Tickets">
          {ticketQuantity} {ticketQuantity === 1 ? "ticket" : "tickets"}
        </DetailRow>
        <DetailRow label="Reference" mono>
          {registrationId}
        </DetailRow>
        <DetailRow label="Amount due" emphasis>
          {amount}
        </DetailRow>
      </DetailCard>

      <PrimaryButton href={paymentLink}>Pay {amount} securely</PrimaryButton>

      <Note>
        Once your payment goes through, we'll automatically email your confirmed
        ticket with a calendar invite. No further action needed.
      </Note>

      <FallbackLink href={paymentLink} />

      <Paragraph>
        Questions about your payment? Reply to this email and our team will
        help.
      </Paragraph>

      <Signoff team="The Schools Voice Events Team" />
    </EmailLayout>
  );
}

export default EventPaymentPendingEmail;
