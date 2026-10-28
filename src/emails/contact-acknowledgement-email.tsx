import { Text } from "@react-email/components";
import {
  brand,
  EMAIL_SITE_URL,
  EmailLayout,
  Paragraph,
  PrimaryButton,
  Signoff,
} from "./components/email-layout";

interface ContactAcknowledgementEmailProps {
  name: string;
  subject?: string | null;
  message: string;
}

/** Receipt sent to the person who submitted the contact or partnership form. */
export function ContactAcknowledgementEmail({
  name = "Ada Okafor",
  subject = "Admissions Inquiry",
  message = "Hello, I would like to inquire about nursery admission in Port Harcourt.",
}: ContactAcknowledgementEmailProps) {
  const firstName = name.trim().split(/\s+/)[0] || name;

  return (
    <EmailLayout
      preview="Thanks for reaching out — we've received your message."
      eyebrow="Message Received"
      title={`Thank you, ${firstName}.`}
      intro="We've received your message and a member of our team will get back to you shortly."
      footerNote="You received this email because you contacted Schools Voice through our website."
    >
      <Paragraph>
        Our team reviews every message personally and typically responds within
        two working days. If your request is urgent, simply reply to this email
        and it will reach us directly.
      </Paragraph>

      <Paragraph>
        <strong>
          Here's a copy of what you sent{subject ? ` — ${subject}` : ""}:
        </strong>
      </Paragraph>
      <Text style={quoteStyle}>{message}</Text>

      <Paragraph>
        In the meantime, you can explore our schools directory, upcoming events
        and the latest stories from Port Harcourt's education community.
      </Paragraph>

      <PrimaryButton href={EMAIL_SITE_URL}>Visit Schools Voice</PrimaryButton>

      <Signoff />
    </EmailLayout>
  );
}

export default ContactAcknowledgementEmail;

const quoteStyle = {
  borderLeft: `4px solid ${brand.gold}`,
  backgroundColor: brand.surface,
  color: brand.muted,
  fontSize: "14px",
  lineHeight: "1.65",
  padding: "12px 16px",
  margin: "0 0 24px 0",
  whiteSpace: "pre-wrap" as const,
};
