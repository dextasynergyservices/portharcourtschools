import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "../../dashboard/dashboard-shell";
import { ProgrammeForm } from "../programme-form";

export const metadata = {
  title: "New Programme — Admin Portal | PortHarcourtSchools",
};

export default async function NewProgrammePage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <ProgrammeForm
          userRole={(session.user as { role?: string }).role || "creator"}
        />
      </div>
    </DashboardShell>
  );
}
