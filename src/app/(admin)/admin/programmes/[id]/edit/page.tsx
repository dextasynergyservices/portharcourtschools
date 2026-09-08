import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db, programmes } from "@/lib/db";
import { DashboardShell } from "../../../dashboard/dashboard-shell";
import { ProgrammeForm } from "../../programme-form";

export const metadata = {
  title: "Edit Programme — Admin Portal | PortHarcourtSchools",
};

interface EditProgrammePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditProgrammePage({
  params,
}: EditProgrammePageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const [programme] = await db
    .select()
    .from(programmes)
    .where(eq(programmes.id, id))
    .limit(1);

  if (!programme) {
    notFound();
  }

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <ProgrammeForm
          initialData={programme}
          userRole={(session.user as { role?: string }).role || "creator"}
        />
      </div>
    </DashboardShell>
  );
}
