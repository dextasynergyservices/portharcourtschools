import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db, events } from "@/lib/db";
import { DashboardShell } from "../../../dashboard/dashboard-shell";
import { EventForm } from "../../event-form";

export const metadata = {
  title: "Edit Event — Admin Portal | PortHarcourtSchools",
};

interface EditEventPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditEventPage({ params }: EditEventPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, id))
    .limit(1);

  if (!event) {
    notFound();
  }

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <EventForm
          initialData={event}
          userRole={(session.user as { role?: string }).role || "creator"}
        />
      </div>
    </DashboardShell>
  );
}
