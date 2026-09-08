import { eq } from "drizzle-orm";
import { ArrowLeft, ExternalLink } from "lucide-react";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { areas, db, schools } from "@/lib/db";
import { DashboardShell } from "../../../dashboard/dashboard-shell";
import { SchoolForm } from "../../school-form";

export const metadata = {
  title: "Edit School — Admin Portal | PortHarcourtSchools",
};

interface EditSchoolPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditSchoolPage({ params }: EditSchoolPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const [school] = await db
    .select()
    .from(schools)
    .where(eq(schools.id, id))
    .limit(1);

  if (!school) {
    notFound();
  }

  const allAreas = await db.select().from(areas).orderBy(areas.name);

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#D9DEEC] pb-4">
          <div className="flex items-center gap-3">
            <Link href="/admin/schools">
              <Button
                variant="outline"
                size="sm"
                className="size-9 p-0 border-[#D9DEEC] text-[#184098]"
              >
                <ArrowLeft className="size-4" />
              </Button>
            </Link>
            <div>
              <h1 className="font-heading text-xl sm:text-2xl font-black tracking-tight text-[#151B2E]">
                Edit School: {school.name}
              </h1>
              <p className="text-xs text-muted-foreground mt-0.5">
                Update school classification, tuition fees, contacts, and campus
                gallery.
              </p>
            </div>
          </div>

          {school.status === "published" && (
            <Link href={`/schools/${school.slug}`} target="_blank">
              <Button
                variant="outline"
                size="sm"
                className="text-xs border-[#D9DEEC] text-[#184098] hover:bg-[#EEF2FA] font-bold"
              >
                <ExternalLink className="size-3.5 mr-1.5" />
                View Live Profile
              </Button>
            </Link>
          )}
        </div>

        {/* Multi-Section Form */}
        <SchoolForm initialData={school} areas={allAreas} />
      </div>
    </DashboardShell>
  );
}
