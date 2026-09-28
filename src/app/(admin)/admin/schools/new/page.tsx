import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { areas, db } from "@/lib/db";
import { DashboardShell } from "../../dashboard/dashboard-shell";
import { SchoolForm } from "../school-form";

export const metadata = {
  title:
    "Add New School — Admin Portal | Schools Voice (Formerly Port Harcourt Schools)",
};

export default async function NewSchoolPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const allAreas = await db.select().from(areas).orderBy(areas.name);

  return (
    <DashboardShell user={session.user}>
      <div className="p-4 sm:p-6 lg:p-8 max-w-5xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-3 border-b border-[#D9DEEC] pb-4">
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
              Add New School Listing
            </h1>
            <p className="text-xs text-muted-foreground mt-0.5">
              Create a comprehensive directory listing for an educational
              institution in Port Harcourt.
            </p>
          </div>
        </div>

        {/* Multi-Section Form */}
        <SchoolForm areas={allAreas} />
      </div>
    </DashboardShell>
  );
}
