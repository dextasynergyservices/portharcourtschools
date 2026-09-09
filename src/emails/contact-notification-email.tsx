import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Img,
  Preview,
  Section,
  Text,
} from "@react-email/components";

interface ContactNotificationEmailProps {
  name: string;
  email: string;
  phone?: string | null;
  personaType: string;
  subject?: string | null;
  message: string;
  submittedAt?: string;
}

const PERSONA_TITLES: Record<string, string> = {
  parent: "Parent / Guardian",
  teacher: "Educator / Teacher",
  school_leader: "School Leader / Admin",
  partner: "Event / Corporate Partner",
  general: "General Inquiry",
};

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

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://portharcourtschools.ng");

  return (
    <Html>
      <Head />
      <Preview>
        New {personaLabel} submission from {name} on PortHarcourtSchools
      </Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Brand Logo Bar */}
          <Section style={logoBarStyle}>
            <Img
              src={`${siteUrl}/images/brand-logo.jpg`}
              alt="PortHarcourtSchools"
              width="64"
              height="64"
              style={logoImageStyle}
            />
          </Section>

          {/* Header */}
          <Section style={headerSectionStyle}>
            <Text style={brandLabelStyle}>COMMUNICATIONS DESK</Text>
            <Heading style={headingStyle}>New Website Inquiry</Heading>
            <Text style={subheadingStyle}>
              A new message has been received from the public lead capture desk.
            </Text>
          </Section>

          {/* Persona Badge */}
          <Section style={badgeSectionStyle}>
            <Text style={badgeStyle}>{personaLabel.toUpperCase()}</Text>
          </Section>

          {/* Sender Details */}
          <Section style={detailsCardStyle}>
            <Text style={fieldLabelStyle}>SENDER NAME</Text>
            <Text style={fieldValueStyle}>{name}</Text>

            <Text style={fieldLabelStyle}>EMAIL ADDRESS</Text>
            <Text style={fieldValueStyle}>
              <a
                href={`mailto:${email}`}
                style={{
                  color: "#184098",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                {email}
              </a>
            </Text>

            {phone && (
              <>
                <Text style={fieldLabelStyle}>PHONE / WHATSAPP</Text>
                <Text style={fieldValueStyle}>
                  <a
                    href={`tel:${phone}`}
                    style={{ color: "#151B2E", textDecoration: "none" }}
                  >
                    {phone}
                  </a>
                </Text>
              </>
            )}

            {subject && (
              <>
                <Text style={fieldLabelStyle}>SUBJECT</Text>
                <Text style={fieldValueStyle}>{subject}</Text>
              </>
            )}

            <Hr style={dividerStyle} />

            <Text style={fieldLabelStyle}>MESSAGE CONTENT</Text>
            <Text style={messageBodyStyle}>{message}</Text>

            <Hr style={dividerStyle} />

            <Text style={timestampStyle}>Submitted at: {submittedAt}</Text>
          </Section>

          {/* Footer */}
          <Section style={footerSectionStyle}>
            <Text style={footerTextStyle}>
              PortHarcourtSchools — The Authoritative Education Platform for
              Port Harcourt.
            </Text>
            <Text style={footerSubtextStyle}>
              You received this automated notification because your email is
              registered on the administrative notifications desk.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default ContactNotificationEmail;

// Inline CSS styles for broad email client compatibility
const mainStyle = {
  backgroundColor: "#FAFBFF",
  fontFamily:
    "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
  padding: "20px 0",
};

const containerStyle = {
  backgroundColor: "#FFFFFF",
  border: "1px solid #D9DEEC",
  borderRadius: "8px",
  maxWidth: "580px",
  margin: "0 auto",
  overflow: "hidden" as const,
};

const logoBarStyle = {
  backgroundColor: "#FFFFFF",
  padding: "20px 24px",
  textAlign: "center" as const,
  borderBottom: "1px solid #EEF2FA",
};

const logoImageStyle = {
  margin: "0 auto",
  display: "block",
};

const headerSectionStyle = {
  backgroundColor: "#184098",
  padding: "28px 24px",
  textAlign: "center" as const,
};

const brandLabelStyle = {
  fontSize: "11px",
  fontWeight: "bold" as const,
  letterSpacing: "1.5px",
  textTransform: "uppercase" as const,
  color: "#FDDA32",
  margin: "0 0 6px 0",
};

const headingStyle = {
  fontSize: "22px",
  fontWeight: "bold" as const,
  color: "#FFFFFF",
  margin: "0 0 6px 0",
};

const subheadingStyle = {
  fontSize: "13px",
  color: "rgba(255, 255, 255, 0.8)",
  margin: "0",
  lineHeight: "1.4",
};

const badgeSectionStyle = {
  padding: "16px 24px 0 24px",
};

const badgeStyle = {
  display: "inline-block" as const,
  backgroundColor: "#EEF2FA",
  color: "#184098",
  border: "1px solid #D9DEEC",
  fontSize: "10px",
  fontWeight: "bold" as const,
  letterSpacing: "1px",
  padding: "4px 10px",
  borderRadius: "4px",
  margin: "0",
};

const detailsCardStyle = {
  padding: "16px 24px 24px 24px",
};

const fieldLabelStyle = {
  fontSize: "10px",
  fontWeight: "bold" as const,
  letterSpacing: "1px",
  color: "#707D9D",
  margin: "12px 0 2px 0",
};

const fieldValueStyle = {
  fontSize: "14px",
  fontWeight: "500" as const,
  color: "#151B2E",
  margin: "0 0 6px 0",
};

const dividerStyle = {
  borderColor: "#D9DEEC",
  margin: "16px 0",
};

const messageBodyStyle = {
  fontSize: "14px",
  lineHeight: "1.6",
  color: "#151B2E",
  backgroundColor: "#FAFBFF",
  border: "1px solid #D9DEEC",
  borderRadius: "6px",
  padding: "12px 16px",
  margin: "4px 0 0 0",
  whiteSpace: "pre-wrap" as const,
};

const timestampStyle = {
  fontSize: "11px",
  color: "#707D9D",
  margin: "0",
};

const footerSectionStyle = {
  backgroundColor: "#F4F6FC",
  borderTop: "1px solid #D9DEEC",
  padding: "18px 24px",
  textAlign: "center" as const,
};

const footerTextStyle = {
  fontSize: "11px",
  fontWeight: "bold" as const,
  color: "#151B2E",
  margin: "0 0 4px 0",
};

const footerSubtextStyle = {
  fontSize: "10px",
  color: "#707D9D",
  margin: "0",
  lineHeight: "1.4",
};
