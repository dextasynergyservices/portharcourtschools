import {
  Body,
  Button,
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
  attendeeName,
  eventTitle,
  eventDateStr,
  eventVenue,
  ticketQuantity,
  ticketTierName,
  isPaid,
  totalAmount,
  registrationId,
  calendarUrl,
}: EventRegistrationConfirmedEmailProps) {
  const previewText = `Your ticket for ${eventTitle} is confirmed!`;

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://portharcourtschools.ng");

  return (
    <Html>
      <Head />
      <Preview>{previewText}</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Brand Logo Header */}
          <Section style={logoBar}>
            <Img
              src={`${siteUrl}/images/brand-logo.jpg`}
              alt="PortHarcourtSchools"
              width="64"
              height="64"
              style={{ margin: "0 auto", display: "block" }}
            />
          </Section>

          {/* Header Banner */}
          <Section style={headerSection}>
            <Text style={brandLabel}>EVENTS &amp; WORKSHOPS DESK</Text>
            <Heading style={heading}>Registration Confirmed!</Heading>
            <Text style={subheading}>
              Your seat has been officially reserved. We look forward to
              welcoming you.
            </Text>
          </Section>

          {/* Body Content */}
          <Section style={contentSection}>
            <Text style={paragraph}>
              Hello <strong>{attendeeName}</strong>,
            </Text>
            <Text style={paragraph}>
              Thank you for registering for <strong>{eventTitle}</strong>. Your
              details have been processed and confirmed in our registry.
            </Text>

            {/* Event Summary Card */}
            <Section style={eventCard}>
              <Text style={eventCardTitle}>{eventTitle}</Text>

              <Section style={detailRow}>
                <Text style={detailLabel}>DATE &amp; TIME</Text>
                <Text style={detailValue}>{eventDateStr}</Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>VENUE</Text>
                <Text style={detailValue}>{eventVenue}</Text>
              </Section>

              {ticketTierName && (
                <Section style={detailRow}>
                  <Text style={detailLabel}>TICKET TIER / CATEGORY</Text>
                  <Text style={detailValue}>{ticketTierName}</Text>
                </Section>
              )}

              <Section style={detailRow}>
                <Text style={detailLabel}>TICKETS / PASSES</Text>
                <Text style={detailValue}>
                  {ticketQuantity} {ticketQuantity === 1 ? "Ticket" : "Tickets"}
                </Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>STATUS</Text>
                <Text style={statusConfirmed}>
                  ✓ Confirmed{" "}
                  {isPaid
                    ? `(Paid: ₦${(totalAmount || 0).toLocaleString()})`
                    : "(Free Pass)"}
                </Text>
              </Section>

              <Section style={detailRow}>
                <Text style={detailLabel}>REGISTRATION ID</Text>
                <Text style={detailValueMono}>{registrationId}</Text>
              </Section>
            </Section>

            {/* Primary Action: Add to Calendar */}
            <Section style={actionContainer}>
              <Button href={calendarUrl} style={calendarButton}>
                📅 Add to Google Calendar
              </Button>
            </Section>

            <Text style={noteText}>
              Please present this email or your Registration ID at the event
              reception desk for seamless entry.
            </Text>

            <Hr style={divider} />

            <Text style={footerText}>
              Need assistance or wish to transfer your pass? Reach our events
              coordinator at{" "}
              <a
                href="mailto:events@portharcourtschools.ng"
                style={{ color: "#184098", fontWeight: "bold" }}
              >
                events@portharcourtschools.ng
              </a>
              .
            </Text>

            <Text style={footerCopyright}>
              © {new Date().getFullYear()} PortHarcourtSchools. All rights
              reserved. Port Harcourt, Rivers State, Nigeria.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export default EventRegistrationConfirmedEmail;

// ==========================================
// STYLES
// ==========================================

const main = {
  backgroundColor: "#f5f4f0",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: "0 auto",
  padding: "40px 10px",
};

const container = {
  backgroundColor: "#ffffff",
  borderRadius: "8px",
  border: "1px solid #e4e0d5",
  maxWidth: "580px",
  margin: "0 auto",
  overflow: "hidden" as const,
  boxShadow: "0 2px 8px rgba(0, 0, 0, 0.04)",
};

const logoBar = {
  backgroundColor: "#ffffff",
  padding: "20px 30px",
  textAlign: "center" as const,
  borderBottom: "1px solid #eef2fa",
};

const headerSection = {
  backgroundColor: "#184098",
  padding: "32px 30px",
  textAlign: "center" as const,
};

const brandLabel = {
  color: "#fdda32",
  fontSize: "11px",
  fontWeight: "bold" as const,
  letterSpacing: "1.5px",
  margin: "0 0 8px 0",
};

const heading = {
  color: "#ffffff",
  fontSize: "24px",
  fontWeight: "800" as const,
  margin: "0 0 8px 0",
  lineHeight: "1.2",
};

const subheading = {
  color: "#d9deec",
  fontSize: "13px",
  margin: "0",
  lineHeight: "1.4",
};

const contentSection = {
  padding: "30px",
};

const paragraph = {
  color: "#151b2e",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const eventCard = {
  backgroundColor: "#fafbff",
  border: "1px solid #d9deec",
  borderRadius: "6px",
  padding: "20px",
  margin: "24px 0",
};

const eventCardTitle = {
  color: "#151b2e",
  fontSize: "16px",
  fontWeight: "bold" as const,
  margin: "0 0 16px 0",
  borderBottom: "1px solid #eef2fa",
  paddingBottom: "10px",
};

const detailRow = {
  marginBottom: "10px",
};

const detailLabel = {
  color: "#6b7280",
  fontSize: "10px",
  fontWeight: "700" as const,
  letterSpacing: "1px",
  margin: "0 0 2px 0",
};

const detailValue = {
  color: "#151b2e",
  fontSize: "13px",
  fontWeight: "600" as const,
  margin: "0",
};

const detailValueMono = {
  color: "#184098",
  fontSize: "12px",
  fontWeight: "600" as const,
  fontFamily: "monospace",
  margin: "0",
};

const statusConfirmed = {
  color: "#059669",
  fontSize: "13px",
  fontWeight: "bold" as const,
  margin: "0",
};

const actionContainer = {
  textAlign: "center" as const,
  margin: "28px 0 20px 0",
};

const calendarButton = {
  backgroundColor: "#184098",
  color: "#ffffff",
  padding: "14px 28px",
  borderRadius: "6px",
  fontSize: "13px",
  fontWeight: "bold" as const,
  textDecoration: "none",
  display: "inline-block",
  boxShadow: "0 2px 4px rgba(24, 64, 152, 0.2)",
};

const noteText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0 0 20px 0",
  textAlign: "center" as const,
};

const divider = {
  borderColor: "#e4e0d5",
  margin: "24px 0 16px 0",
};

const footerText = {
  color: "#6b7280",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "0 0 12px 0",
};

const footerCopyright = {
  color: "#9ca3af",
  fontSize: "11px",
  margin: "0",
};
