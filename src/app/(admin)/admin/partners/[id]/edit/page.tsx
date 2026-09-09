import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { db, partners } from "@/lib/db";
import { DashboardShell } from "../../../dashboard/dashboard-shell";
import { PartnerForm } from "../../partner-form";

export const metadata = {
  title: "Edit Partner — Admin Portal | PortHarcourtSchools",
};

interface EditPartnerPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPartnerPage({
  params,
}: EditPartnerPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const [partner] = await db
    .select()
    .from(partners)
    .where(eq(partners.id, id))
    .limit(1);

  if (!partner) {
    notFound();
  }

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto">
        <PartnerForm initialData={partner} />
      </div>
    </DashboardShell>
  );
}
