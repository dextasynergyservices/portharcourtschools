import { Link, Text } from "@react-email/components";
import {
  brand,
  DetailCard,
  DetailRow,
  EmailLayout,
  Paragraph,
  PrimaryButton,
} from "./components/email-layout";

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  phone?: string | null;
  personaType: string;
  subject?: string | null;
  message: string;
  submittedAt?: string;
}

export const PERSONA_TITLES: Record<string, string> = {
  parent: "Parent / Guardian",
  teacher: "Educator / Teacher",
  school_leader: "School Leader / Admin",
  partner: "Event / Corporate Partner",
  general: "General Inquiry",
};

/** Internal alert sent to the admin inbox for each contact or partner lead. */
export function ContactNotificationEmail({
  name = "Parent Inquirer",
  email = "parent@example.com",
  phone = "+234 803 123 4567",
  personaType = "parent",
  subject = "Admissions Inquiry",
  message = "Hello, I would like to inquire about nursery admission in Port Harcourt.",
  submittedAt = new Date().toLocaleString("en-GB"),
}: ContactNotificationEmailProps) {
  const personaLabel = PERSONA_TITLES[personaType] || personaType;

  return (
    <EmailLayout
      preview={`New ${personaLabel} inquiry from ${name}`}
      eyebrow="Communications Desk"
      title="New website inquiry"
      intro={`${name} sent a message through the website. Reply directly to this email to respond to them.`}
      footerNote="You received this because your address is set as the Schools Voice admin notification inbox."
    >
      <DetailCard title={subject || "Website inquiry"}>
        <DetailRow label="Persona">{personaLabel}</DetailRow>
        <DetailRow label="Name">{name}</DetailRow>
        <DetailRow label="Email">
          <Link href={`mailto:${email}`} style={{ color: brand.navy }}>
            {email}
          </Link>
        </DetailRow>
        {phone && (
          <DetailRow label="Phone">
            <Link href={`tel:${phone}`} style={{ color: brand.navy }}>
              {phone}
            </Link>
          </DetailRow>
        )}
        <DetailRow label="Received">{submittedAt}</DetailRow>
      </DetailCard>

      <Paragraph>
        <strong>Message</strong>
      </Paragraph>
      <Text style={messageStyle}>{message}</Text>

      <PrimaryButton
        href={`mailto:${email}?subject=${encodeURIComponent(`Re: ${subject || "Your message to Schools Voice"}`)}`}
      >
        Reply to {name.split(" ")[0]}
      </PrimaryButton>
    </EmailLayout>
  );
}

export default ContactNotificationEmail;

const messageStyle = {
  backgroundColor: brand.surface,
  border: `1px solid ${brand.border}`,
  borderRadius: "8px",
  color: brand.ink,
  fontSize: "15px",
  lineHeight: "1.65",
  padding: "16px 18px",
  margin: "0 0 26px 0",
  whiteSpace: "pre-wrap" as const,
};
