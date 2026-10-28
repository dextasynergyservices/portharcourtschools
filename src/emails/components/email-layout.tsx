import {
  Body,
  Button,
  Column,
  Container,
  Head,
  Heading,
  Html,
  Img,
  Link,
  Preview,
  Row,
  Section,
  Text,
} from "@react-email/components";
import type { ReactNode } from "react";

/**
 * Shared Schools Voice email chrome and building blocks.
 * Colours mirror the brand tokens in src/app/globals.css.
 */

// Images must load from the public production host: a localhost or preview URL
// renders as a broken image in the recipient's inbox.
export const EMAIL_SITE_URL = (
  process.env.EMAIL_ASSET_URL || "https://www.schoolsvoice.com"
).replace(/\/$/, "");

export const brand = {
  navy: "#003cb8",
  shadow: "#002c8c",
  gold: "#fcda04",
  ink: "#151b2e",
  muted: "#55627d",
  subtle: "#8a94ad",
  border: "#d9deec",
  surface: "#f6f8fd",
  canvas: "#eef1f8",
  success: "#2e8b57",
};

const headingFont =
  "'Sora', 'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif";
const bodyFont =
  "'Public Sans', 'Segoe UI', -apple-system, BlinkMacSystemFont, Helvetica, Arial, sans-serif";
const monoFont =
  "'Space Grotesk', 'SFMono-Regular', Menlo, Consolas, monospace";

interface EmailLayoutProps {
  preview: string;
  eyebrow: string;
  title: string;
  intro?: ReactNode;
  children: ReactNode;
  /** Footer line explaining why the recipient got this email. */
  footerNote?: string;
}

export function EmailLayout({
  preview,
  eyebrow,
  title,
  intro,
  children,
  footerNote,
}: EmailLayoutProps) {
  return (
    <Html lang="en">
      <Head>
        <meta name="color-scheme" content="light only" />
        <meta name="supported-color-schemes" content="light" />
        {/* Clients that support web fonts (Apple Mail, iOS, Outlook.com) get the
            brand typefaces; everyone else falls back to the system stacks. */}
        <link
          href="https://fonts.googleapis.com/css2?family=Public+Sans:wght@400;600;700&family=Sora:wght@700;800&family=Space+Grotesk:wght@500;700&display=swap"
          rel="stylesheet"
        />
      </Head>
      <Preview>{preview}</Preview>
      <Body style={bodyStyle}>
        <Container style={containerStyle}>
          <Section style={goldStripStyle} />

          <Section style={logoBarStyle}>
            <Link href={EMAIL_SITE_URL}>
              <Img
                src={`${EMAIL_SITE_URL}/images/email/logo.png`}
                alt="Schools Voice"
                width="176"
                height="69"
                style={{ display: "block", border: "0" }}
              />
            </Link>
          </Section>

          <Section style={heroStyle}>
            <Text style={eyebrowStyle}>{eyebrow}</Text>
            <Heading as="h1" style={titleStyle}>
              {title}
            </Heading>
            {intro && <Text style={introStyle}>{intro}</Text>}
          </Section>

          <Section style={contentStyle}>{children}</Section>

          <Section style={footerStyle}>
            <Text style={footerBrandStyle}>Schools Voice</Text>
            <Text style={footerTextStyle}>
              Formerly Port Harcourt Schools · The education platform for Port
              Harcourt
              <br />
              Trans-Amadi Commercial Layout, Port Harcourt, Rivers State,
              Nigeria
            </Text>
            <Text style={footerLinksStyle}>
              <Link href={EMAIL_SITE_URL} style={footerLinkStyle}>
                schoolsvoice.com
              </Link>
              {"  ·  "}
              <Link
                href="https://instagram.com/portharcourtschools"
                style={footerLinkStyle}
              >
                Instagram
              </Link>
              {"  ·  "}
              <Link
                href="https://facebook.com/portharcourtschools"
                style={footerLinkStyle}
              >
                Facebook
              </Link>
              {"  ·  "}
              <Link
                href="https://linkedin.com/company/portharcourtschools"
                style={footerLinkStyle}
              >
                LinkedIn
              </Link>
            </Text>
            {footerNote && <Text style={footerNoteStyle}>{footerNote}</Text>}
            <Text style={footerNoteStyle}>
              © {new Date().getFullYear()} Schools Voice. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

export function Paragraph({ children }: { children: ReactNode }) {
  return <Text style={paragraphStyle}>{children}</Text>;
}

export function DetailCard({
  title,
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <Section style={cardStyle}>
      {title && <Text style={cardTitleStyle}>{title}</Text>}
      {children}
    </Section>
  );
}

export function DetailRow({
  label,
  children,
  mono,
  emphasis,
}: {
  label: string;
  children: ReactNode;
  mono?: boolean;
  emphasis?: boolean;
}) {
  return (
    <Row style={detailRowStyle}>
      <Column style={detailLabelCellStyle}>
        <Text style={detailLabelStyle}>{label}</Text>
      </Column>
      <Column>
        <Text
          style={
            emphasis
              ? detailEmphasisStyle
              : mono
                ? detailMonoStyle
                : detailValueStyle
          }
        >
          {children}
        </Text>
      </Column>
    </Row>
  );
}

export function PrimaryButton({
  href,
  children,
}: {
  href: string;
  children: ReactNode;
}) {
  return (
    <Section style={buttonWrapStyle}>
      <Button href={href} style={buttonStyle}>
        {children}
      </Button>
    </Section>
  );
}

export function FallbackLink({ href }: { href: string }) {
  return (
    <Text style={fallbackStyle}>
      If the button doesn't work, copy and paste this link into your browser:
      <br />
      <Link href={href} style={fallbackLinkStyle}>
        {href}
      </Link>
    </Text>
  );
}

export function Note({ children }: { children: ReactNode }) {
  return <Text style={noteStyle}>{children}</Text>;
}

export function Signoff({
  team = "The Schools Voice Team",
}: {
  team?: string;
}) {
  return (
    <Text style={paragraphStyle}>
      Warm regards,
      <br />
      <strong>{team}</strong>
    </Text>
  );
}

// ==========================================
// STYLES
// ==========================================

const bodyStyle = {
  backgroundColor: brand.canvas,
  fontFamily: bodyFont,
  margin: "0",
  padding: "32px 12px",
  WebkitTextSizeAdjust: "100%" as const,
};

const containerStyle = {
  backgroundColor: "#ffffff",
  border: `1px solid ${brand.border}`,
  borderRadius: "12px",
  maxWidth: "600px",
  margin: "0 auto",
  overflow: "hidden" as const,
};

const goldStripStyle = {
  backgroundColor: brand.gold,
  height: "5px",
  lineHeight: "5px",
  fontSize: "0",
};

const logoBarStyle = {
  padding: "24px 36px 20px 36px",
};

const heroStyle = {
  backgroundColor: brand.navy,
  backgroundImage: `linear-gradient(135deg, ${brand.navy} 0%, ${brand.shadow} 100%)`,
  padding: "36px 36px 34px 36px",
};

const eyebrowStyle = {
  color: brand.gold,
  fontFamily: monoFont,
  fontSize: "11px",
  fontWeight: "700" as const,
  letterSpacing: "2px",
  textTransform: "uppercase" as const,
  margin: "0 0 10px 0",
};

const titleStyle = {
  color: "#ffffff",
  fontFamily: headingFont,
  fontSize: "26px",
  fontWeight: "800" as const,
  lineHeight: "1.25",
  letterSpacing: "-0.3px",
  margin: "0",
};

const introStyle = {
  color: "#d6e0fa",
  fontSize: "15px",
  lineHeight: "1.6",
  margin: "12px 0 0 0",
};

const contentStyle = {
  padding: "32px 36px 12px 36px",
};

const paragraphStyle = {
  color: brand.ink,
  fontSize: "15px",
  lineHeight: "1.65",
  margin: "0 0 18px 0",
};

const cardStyle = {
  backgroundColor: brand.surface,
  border: `1px solid ${brand.border}`,
  borderLeft: `4px solid ${brand.navy}`,
  borderRadius: "8px",
  padding: "18px 20px 8px 20px",
  margin: "8px 0 26px 0",
};

const cardTitleStyle = {
  color: brand.ink,
  fontFamily: headingFont,
  fontSize: "17px",
  fontWeight: "700" as const,
  lineHeight: "1.35",
  margin: "0 0 12px 0",
};

const detailRowStyle = {
  borderTop: `1px solid ${brand.border}`,
};

const detailLabelCellStyle = {
  width: "38%",
  verticalAlign: "top" as const,
};

const detailLabelStyle = {
  color: brand.muted,
  fontFamily: monoFont,
  fontSize: "11px",
  fontWeight: "700" as const,
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
  margin: "10px 12px 10px 0",
};

const detailValueStyle = {
  color: brand.ink,
  fontSize: "14px",
  fontWeight: "600" as const,
  lineHeight: "1.5",
  margin: "9px 0",
};

const detailMonoStyle = {
  ...detailValueStyle,
  color: brand.navy,
  fontFamily: monoFont,
  fontSize: "13px",
  wordBreak: "break-all" as const,
};

const detailEmphasisStyle = {
  ...detailValueStyle,
  color: brand.navy,
  fontFamily: headingFont,
  fontSize: "18px",
  fontWeight: "800" as const,
};

const buttonWrapStyle = {
  textAlign: "center" as const,
  margin: "4px 0 22px 0",
};

const buttonStyle = {
  backgroundColor: brand.navy,
  borderRadius: "8px",
  borderBottom: `3px solid ${brand.gold}`,
  color: "#ffffff",
  fontFamily: bodyFont,
  fontSize: "15px",
  fontWeight: "700" as const,
  textDecoration: "none",
  display: "inline-block",
  padding: "15px 30px",
};

const fallbackStyle = {
  color: brand.subtle,
  fontSize: "12px",
  lineHeight: "1.55",
  margin: "0 0 20px 0",
};

const fallbackLinkStyle = {
  color: brand.navy,
  wordBreak: "break-all" as const,
};

const noteStyle = {
  backgroundColor: "#fffbe0",
  border: "1px solid #f5e27a",
  borderRadius: "8px",
  color: "#5c4a00",
  fontSize: "13px",
  lineHeight: "1.55",
  padding: "12px 16px",
  margin: "0 0 22px 0",
};

const footerStyle = {
  backgroundColor: brand.surface,
  borderTop: `1px solid ${brand.border}`,
  padding: "26px 36px 28px 36px",
  textAlign: "center" as const,
};

const footerBrandStyle = {
  color: brand.navy,
  fontFamily: headingFont,
  fontSize: "14px",
  fontWeight: "800" as const,
  margin: "0 0 6px 0",
};

const footerTextStyle = {
  color: brand.muted,
  fontSize: "12px",
  lineHeight: "1.6",
  margin: "0 0 12px 0",
};

const footerLinksStyle = {
  fontSize: "12px",
  margin: "0 0 14px 0",
};

const footerLinkStyle = {
  color: brand.navy,
  fontWeight: "600" as const,
  textDecoration: "none",
};

const footerNoteStyle = {
  color: brand.subtle,
  fontSize: "11px",
  lineHeight: "1.5",
  margin: "0 0 4px 0",
};
