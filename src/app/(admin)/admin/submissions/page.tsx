import { desc } from "drizzle-orm";
import { CheckCircle2, Handshake, Inbox, Mail } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { contactSubmissions, db } from "@/lib/db";
import { DashboardShell } from "../dashboard/dashboard-shell";
import { SubmissionsTable } from "./submissions-table";

export const metadata: Metadata = {
  title:
    "Submissions Inbox — Admin Portal | Schools Voice (Formerly Port Harcourt Schools)",
};

export default async function AdminSubmissionsPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  // Fetch all contact submissions
  const submissions = await db
    .select()
    .from(contactSubmissions)
    .orderBy(desc(contactSubmissions.createdAt));

  // Compute metrics
  const totalCount = submissions.length;
  const newCount = submissions.filter((s) => s.status === "new").length;
  const partnerCount = submissions.filter(
    (s) => s.personaType === "partner",
  ).length;
  const readCount = submissions.filter((s) => s.status === "read").length;

  return (
    <DashboardShell user={session.user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-border/40 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <Badge
                variant="outline"
                className="bg-[#184098]/10 text-[#184098] border-[#184098]/30 font-bold uppercase tracking-wider text-[10px]"
              >
                Communications Desk
              </Badge>
              {newCount > 0 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-100 text-blue-800 animate-pulse">
                  {newCount} New
                </span>
              )}
            </div>
            <h1 className="font-heading text-2xl sm:text-3xl font-bold tracking-tight text-[#151B2E]">
              Submissions &amp; Inquiries
            </h1>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
              Manage incoming contact leads, partnership requests, and educator
              messages.
            </p>
          </div>
        </div>

        {/* Metric Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-[#EEF2FA] text-[#184098] flex items-center justify-center shrink-0">
                <Inbox className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Total Inquiries
                </span>
                <span className="font-heading text-xl font-bold text-[#151B2E]">
                  {totalCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-blue-50 text-blue-700 flex items-center justify-center shrink-0">
                <Mail className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Unread / New
                </span>
                <span className="font-heading text-xl font-bold text-blue-700">
                  {newCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-amber-50 text-amber-700 flex items-center justify-center shrink-0">
                <Handshake className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Partnerships
                </span>
                <span className="font-heading text-xl font-bold text-amber-700">
                  {partnerCount}
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/60 shadow-xs">
            <CardContent className="p-4 flex items-center gap-3">
              <div className="size-10 rounded-lg bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
                <CheckCircle2 className="size-5" />
              </div>
              <div>
                <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground block">
                  Reviewed / Read
                </span>
                <span className="font-heading text-xl font-bold text-[#151B2E]">
                  {readCount}
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* TanStack Table */}
        <SubmissionsTable submissions={submissions} />
      </div>
    </DashboardShell>
  );
}
