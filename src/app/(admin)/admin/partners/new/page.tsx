import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "../../dashboard/dashboard-shell";
import { PartnerForm } from "../partner-form";

export const metadata = {
  title:
    "Add New Partner — Admin Portal | Schools Voice (Formerly Port Harcourt Schools)",
};

export default async function NewPartnerPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <PartnerForm />
      </div>
    </DashboardShell>
  );
}
