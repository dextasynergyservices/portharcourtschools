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
  inviterName = "Schools Voice Leadership",
  setPassLink = "https://www.schoolsvoice.com/admin/set-password?token=sample",
  expiresInHours = 48,
}: UserInviteEmailProps) {
  const roleName = ROLE_LABELS[role] || role;
  const firstName = name.trim().split(/\s+/)[0] || name;

  return (
    <EmailLayout
      preview={`${inviterName} invited you to join Schools Voice as ${roleName}.`}
      eyebrow="Team Invitation"
      title="You're invited to join the team"
      intro={`${inviterName} has invited you to help run Schools Voice.`}
      footerNote="You received this email because a Schools Voice administrator invited this address to the team."
    >
      <Paragraph>Hello {firstName},</Paragraph>
      <Paragraph>
        You've been invited to join the <strong>Schools Voice</strong> admin
        workspace. Set a password to activate your account and get started.
      </Paragraph>

      <DetailCard>
        <DetailRow label="Role">{roleName}</DetailRow>
        <DetailRow label="Account">{email}</DetailRow>
        <DetailRow label="Invited by">{inviterName}</DetailRow>
      </DetailCard>

      <PrimaryButton href={setPassLink}>Set password &amp; join</PrimaryButton>

      <Note>
        This link is personal to you and expires in{" "}
        <strong>{expiresInHours} hours</strong>. If you weren't expecting this
        invitation, you can safely ignore this email.
      </Note>

      <FallbackLink href={setPassLink} />

      <Signoff />
    </EmailLayout>
  );
}

export default UserInviteEmail;
