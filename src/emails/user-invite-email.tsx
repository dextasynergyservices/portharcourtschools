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

interface UserInviteEmailProps {
  name: string;
  email: string;
  role: string;
  inviterName?: string;
  setPassLink: string;
  expiresInHours?: number;
}

const ROLE_LABELS: Record<string, string> = {
  super_admin: "Super Administrator",
  admin: "Administrator",
  editor: "Editor & Content Manager",
  creator: "Content Creator",
};

export function UserInviteEmail({
  name = "Team Member",
  email = "member@example.com",
  role = "editor",
  inviterName = "Port Harcourt Schools Leadership",
  setPassLink = "https://portharcourtschools.ng/admin/set-password?token=sample",
  expiresInHours = 48,
}: UserInviteEmailProps) {
  const roleName = ROLE_LABELS[role] || role;

  const siteUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}`
      : "https://portharcourtschools.ng");

  return (
    <Html>
      <Head />
      <Preview>
        You have been invited to join the PortHarcourtSchools team as {roleName}
      </Preview>
      <Body style={mainStyle}>
        <Container style={containerStyle}>
          {/* Brand Header */}
          <Section style={logoBarStyle}>
            <Img
              src={`${siteUrl}/images/brand-logo.jpg`}
              width="64"
              height="64"
              alt="PortHarcourtSchools"
              style={logoStyle}
            />
          </Section>

          {/* Body Content */}
          <Section style={contentStyle}>
            <Text style={badgeStyle}>TEAM INVITATION</Text>
            <Heading style={headingStyle}>Welcome to the Workspace</Heading>
            <Text style={paragraphStyle}>Hello {name},</Text>
            <Text style={paragraphStyle}>
              {inviterName} has invited you to join the{" "}
              <strong>PortHarcourtSchools</strong> administrative team with the
              role of:
            </Text>

            <Section style={roleCardStyle}>
              <Text style={roleTitleStyle}>{roleName}</Text>
              <Text style={roleSubStyle}>Account: {email}</Text>
            </Section>

            <Text style={paragraphStyle}>
              To complete your account activation and access your dashboard,
              please click the button below to set your secure password:
            </Text>

            {/* CTA Button */}
            <Section style={buttonContainerStyle}>
              <Button style={buttonStyle} href={setPassLink}>
                Set Your Password &amp; Join Team
              </Button>
            </Section>

            <Text style={noteStyle}>
              This invitation link is strictly confidential and will expire in{" "}
              <strong>{expiresInHours} hours</strong>. If you did not expect
              this invite, you can safely ignore this email.
            </Text>

            <Hr style={hrStyle} />

            <Text style={fallbackNoteStyle}>
              Button not working? Copy and paste this link into your browser:
              <br />
              <span style={linkStyle}>{setPassLink}</span>
            </Text>
          </Section>

          {/* Footer */}
          <Section style={footerStyle}>
            <Text style={footerTextStyle}>
              &copy; {new Date().getFullYear()} PortHarcourtSchools &bull;
              EdFocus Africa
              <br />
              Trans-Amadi Commercial Layout, Port Harcourt, Rivers State,
              Nigeria
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

const mainStyle = {
  backgroundColor: "#f5f4f0",
  fontFamily:
    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  margin: "0",
  padding: "40px 0",
};

const containerStyle = {
  backgroundColor: "#ffffff",
  margin: "0 auto",
  maxWidth: "560px",
  borderRadius: "4px",
  border: "1px solid #e4e0d5",
  overflow: "hidden" as const,
};

const logoBarStyle = {
  backgroundColor: "#08276b",
  padding: "24px 32px",
  textAlign: "left" as const,
};

const logoStyle = {
  display: "block",
};

const contentStyle = {
  padding: "32px",
};

const badgeStyle = {
  display: "inline-block",
  fontSize: "11px",
  fontWeight: "700" as const,
  letterSpacing: "1.5px",
  color: "#184098",
  backgroundColor: "rgba(24, 64, 152, 0.08)",
  padding: "4px 10px",
  borderRadius: "2px",
  margin: "0 0 12px 0",
};

const headingStyle = {
  color: "#151b2e",
  fontSize: "22px",
  fontWeight: "800" as const,
  lineHeight: "1.3",
  margin: "0 0 16px 0",
};

const paragraphStyle = {
  color: "#35362b",
  fontSize: "14px",
  lineHeight: "1.6",
  margin: "0 0 16px 0",
};

const roleCardStyle = {
  backgroundColor: "#f5f4f0",
  border: "1px solid #d9deec",
  borderLeft: "4px solid #184098",
  padding: "16px",
  borderRadius: "2px",
  margin: "16px 0 20px 0",
};

const roleTitleStyle = {
  color: "#151b2e",
  fontSize: "16px",
  fontWeight: "700" as const,
  margin: "0 0 4px 0",
};

const roleSubStyle = {
  color: "#55627d",
  fontSize: "13px",
  margin: "0",
};

const buttonContainerStyle = {
  margin: "24px 0",
  textAlign: "center" as const,
};

const buttonStyle = {
  backgroundColor: "#08276b",
  borderRadius: "4px",
  color: "#ffffff",
  fontSize: "14px",
  fontWeight: "700" as const,
  textDecoration: "none",
  textAlign: "center" as const,
  display: "inline-block",
  padding: "14px 28px",
};

const noteStyle = {
  color: "#55627d",
  fontSize: "12px",
  lineHeight: "1.5",
  margin: "16px 0 0 0",
};

const hrStyle = {
  borderTop: "1px solid #e4e0d5",
  borderBottom: "none",
  borderLeft: "none",
  borderRight: "none",
  margin: "24px 0",
};

const fallbackNoteStyle = {
  color: "#85867f",
  fontSize: "11px",
  lineHeight: "1.5",
  margin: "0",
};

const linkStyle = {
  color: "#184098",
  wordBreak: "break-all" as const,
};

const footerStyle = {
  backgroundColor: "#f5f4f0",
  borderTop: "1px solid #e4e0d5",
  padding: "20px 32px",
  textAlign: "center" as const,
};

const footerTextStyle = {
  color: "#85867f",
  fontSize: "11px",
  lineHeight: "1.5",
  margin: "0",
};
