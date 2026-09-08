import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/app/(admin)/admin/dashboard/dashboard-shell";
import { getSiteSettings } from "@/app/(admin)/admin/settings/actions";
import { SettingsForm } from "@/app/(admin)/admin/settings/settings-form";
import { auth } from "@/lib/auth";

export const metadata: Metadata = {
  title: "Site Settings & Contacts | Admin",
  description:
    "Manage global organization settings, phone lines, emails, and address locations.",
};

export default async function AdminSettingsPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const settings = await getSiteSettings();

  return (
    <DashboardShell user={session.user}>
      <SettingsForm initialSettings={settings} />
    </DashboardShell>
  );
}
