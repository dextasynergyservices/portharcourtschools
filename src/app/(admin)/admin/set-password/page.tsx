import { and, eq, gt } from "drizzle-orm";
import { AlertCircle } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { SetPasswordClient } from "@/app/(admin)/admin/set-password/set-password-client";
import { Button } from "@/components/ui/button";
import { db, verificationTokens } from "@/lib/db";

export const metadata: Metadata = {
  title: "Set Password | Schools Voice (Formerly Port Harcourt Schools)",
  description: "Set your secure password to join the administrative team.",
};

interface SetPasswordPageProps {
  searchParams: Promise<{ token?: string; email?: string }>;
}

export default async function SetPasswordPage({
  searchParams,
}: SetPasswordPageProps) {
  const { token, email } = await searchParams;

  if (!token || !email) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 text-center space-y-4 shadow-xs">
          <div className="size-12 rounded-full bg-destructive/10 text-destructive flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground">
            Invalid Password Link
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This password creation link is incomplete or missing required
            verification parameters.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/admin/login">Return to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  // Verify token in database
  const cleanEmail = email.toLowerCase().trim();
  const [tokenRecord] = await db
    .select()
    .from(verificationTokens)
    .where(
      and(
        eq(verificationTokens.identifier, cleanEmail),
        eq(verificationTokens.token, token),
        gt(verificationTokens.expires, new Date()),
      ),
    )
    .limit(1);

  if (!tokenRecord) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-4">
        <div className="max-w-md w-full rounded-xl border border-border bg-card p-8 text-center space-y-4 shadow-xs">
          <div className="size-12 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mx-auto">
            <AlertCircle className="size-6" />
          </div>
          <h1 className="text-xl font-bold font-heading text-foreground">
            Link Expired or Already Used
          </h1>
          <p className="text-xs text-muted-foreground leading-relaxed">
            This invitation link has expired or has already been used to set a
            password. Please contact your Super Administrator to request a new
            invitation link.
          </p>
          <Button asChild variant="outline" className="mt-2">
            <Link href="/admin/login">Go to Login</Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center p-4">
      <SetPasswordClient email={cleanEmail} token={token} />
    </div>
  );
}
