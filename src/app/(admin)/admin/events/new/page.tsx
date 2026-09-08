import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { DashboardShell } from "../../dashboard/dashboard-shell";
import { EventForm } from "../event-form";

export const metadata = {
  title: "New Event — Admin Portal | PortHarcourtSchools",
};

export default async function NewEventPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <EventForm
          userRole={(session.user as { role?: string }).role || "creator"}
        />
      </div>
    </DashboardShell>
  );
}
