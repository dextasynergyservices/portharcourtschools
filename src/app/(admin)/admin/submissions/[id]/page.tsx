import { eq } from "drizzle-orm";
import {
  ArrowLeft,
  Calendar,
  Mail,
  MessageSquare,
  Phone,
  User,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth";
import { contactSubmissions, db } from "@/lib/db";
import { DashboardShell } from "../../dashboard/dashboard-shell";

export const metadata: Metadata = {
  title:
    "Submission Details — Admin Portal | Schools Voice (Formerly Port Harcourt Schools)",
};

interface SubmissionDetailPageProps {
  params: Promise<{ id: string }>;
}

export default async function SubmissionDetailPage({
  params,
}: SubmissionDetailPageProps) {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const { id } = await params;

  const [submission] = await db
    .select()
    .from(contactSubmissions)
    .where(eq(contactSubmissions.id, id))
    .limit(1);

  if (!submission) {
    notFound();
  }

  // Auto-format phone for WhatsApp
  const cleanPhone = submission.phone?.replace(/[^0-9]/g, "") || "";
  let waNumber = cleanPhone;
  if (cleanPhone.startsWith("0")) {
    waNumber = `234${cleanPhone.slice(1)}`;
  } else if (!cleanPhone.startsWith("234") && cleanPhone.length === 10) {
    waNumber = `234${cleanPhone}`;
  }

  const formattedDate = new Date(submission.createdAt).toLocaleDateString(
    "en-GB",
    {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    },
  );

  return (
    <DashboardShell user={session.user}>
      <div className="max-w-4xl space-y-6">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link href="/admin/submissions">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-bold border-[#D9DEEC] text-[#184098] hover:bg-[#EEF2FA]"
            >
              <ArrowLeft className="size-3.5 mr-1.5" />
              Back to Submissions
            </Button>
          </Link>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="capitalize text-xs font-bold border-[#D9DEEC] bg-[#FAFBFF] text-[#184098]"
            >
              {submission.personaType}
            </Badge>
            <Badge
              variant={submission.status === "new" ? "amber" : "success"}
              className="text-xs font-bold uppercase"
            >
              {submission.status}
            </Badge>
          </div>
        </div>

        {/* Detail Card */}
        <Card className="border-[#D9DEEC] bg-white shadow-xs rounded-xl overflow-hidden">
          <CardHeader className="border-b border-[#D9DEEC] bg-[#FAFBFF] p-6">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-[#184098]">
                  Inbound Inquiry
                </span>
                <CardTitle className="font-heading text-xl font-bold text-[#151B2E] mt-1">
                  {submission.subject || "General Inquiry / Partnership"}
                </CardTitle>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5">
                  <Calendar className="size-3.5" />
                  <span>Received on {formattedDate}</span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="p-6 space-y-6">
            {/* Submitter Info Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 rounded-lg bg-[#FAFBFF] border border-[#D9DEEC]">
              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Submitter Name
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <User className="size-3.5 text-[#184098]" />
                  <span className="font-bold text-xs text-[#151B2E]">
                    {submission.name}
                  </span>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Email Address
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Mail className="size-3.5 text-[#184098]" />
                  <a
                    href={`mailto:${submission.email}`}
                    className="text-xs font-medium text-[#184098] hover:underline truncate"
                  >
                    {submission.email}
                  </a>
                </div>
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold text-muted-foreground block">
                  Phone Number
                </span>
                <div className="flex items-center gap-1.5 mt-1">
                  <Phone className="size-3.5 text-[#184098]" />
                  {submission.phone ? (
                    <a
                      href={`tel:${submission.phone}`}
                      className="text-xs font-medium text-[#151B2E] hover:underline"
                    >
                      {submission.phone}
                    </a>
                  ) : (
                    <span className="text-xs text-muted-foreground">
                      Not provided
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Message Body */}
            <div>
              <div className="flex items-center gap-2 mb-2">
                <MessageSquare className="size-4 text-[#184098]" />
                <h3 className="font-heading text-xs font-bold uppercase tracking-wider text-[#151B2E]">
                  Message Content
                </h3>
              </div>
              <div className="p-5 rounded-lg border border-[#D9DEEC] bg-white text-xs leading-relaxed text-[#151B2E] whitespace-pre-wrap">
                {submission.message}
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-4 border-t border-[#D9DEEC] flex flex-wrap items-center gap-3">
              <a
                href={`mailto:${submission.email}?subject=Re: ${encodeURIComponent(submission.subject || "Your Inquiry on PortHarcourtSchools")}`}
              >
                <Button
                  size="sm"
                  className="bg-[#184098] hover:bg-[#08276B] text-white text-xs font-bold"
                >
                  <Mail className="size-3.5 mr-1.5" />
                  Reply via Email
                </Button>
              </a>

              {waNumber && (
                <a
                  href={`https://wa.me/${waNumber}?text=${encodeURIComponent(`Hello ${submission.name}, thank you for contacting PortHarcourtSchools.com regarding: "${submission.subject || "your inquiry"}".`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Button
                    variant="outline"
                    size="sm"
                    className="border-emerald-300 text-emerald-700 hover:bg-emerald-50 text-xs font-bold"
                  >
                    <Phone className="size-3.5 mr-1.5" />
                    Chat on WhatsApp
                  </Button>
                </a>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  );
}
