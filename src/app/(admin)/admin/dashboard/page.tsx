import { count, desc } from "drizzle-orm";
import {
  ArrowUpRight,
  BookOpen,
  Calendar,
  Eye,
  Inbox,
  Plus,
  School,
} from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { AnalyticsDashboardSection } from "@/components/admin/analytics/analytics-dashboard-section";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { type AnalyticsSummary, getAnalyticsSummary } from "@/lib/analytics";
import { auth } from "@/lib/auth";
import {
  contactSubmissions,
  db,
  events,
  nominations,
  posts,
  schools,
} from "@/lib/db";
import { SubmissionDetailsDialog } from "../submissions/submission-details-dialog";
import { DashboardShell } from "./dashboard-shell";

export default async function AdminDashboardPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  // Fetch real counts safely with fallback to 0
  let schoolsCount = 0;
  let postsCount = 0;
  let eventsCount = 0;
  let submissionsCount = 0;
  let recentSubmissions: Array<typeof contactSubmissions.$inferSelect> = [];
  let analyticsData: AnalyticsSummary = {
    periodDays: 30,
    filters: {
      period: "30d",
      startDate: "",
      endDate: "",
      device: "all",
      channel: "all",
      section: "all",
      periodLabel: "Last 30 Days",
      isFiltered: false,
    },
    totalViews: 0,
    totalViewsChange: 0,
    uniqueVisitors: 0,
    uniqueVisitorsChange: 0,
    viewsToday: 0,
    visitorsToday: 0,
    trend: [],
    topPages: [],
    referrers: [],
    deviceBreakdown: [],
    topCountries: [],
  };

  try {
    const [
      schoolsRes,
      postsRes,
      eventsRes,
      contactsRes,
      nominationsRes,
      recentSubmissionsRes,
      analyticsRes,
    ] = await Promise.all([
      db.select({ value: count() }).from(schools),
      db.select({ value: count() }).from(posts),
      db.select({ value: count() }).from(events),
      db.select({ value: count() }).from(contactSubmissions),
      db.select({ value: count() }).from(nominations),
      db
        .select()
        .from(contactSubmissions)
        .orderBy(desc(contactSubmissions.createdAt))
        .limit(5),
      getAnalyticsSummary(30),
    ]);

    schoolsCount = schoolsRes[0]?.value ?? 0;
    postsCount = postsRes[0]?.value ?? 0;
    eventsCount = eventsRes[0]?.value ?? 0;
    submissionsCount =
      (contactsRes[0]?.value ?? 0) + (nominationsRes[0]?.value ?? 0);
    recentSubmissions = recentSubmissionsRes;
    analyticsData = analyticsRes;
  } catch (error) {
    console.error("Dashboard stats query error:", error);
  }

  const statCards = [
    {
      title: "Schools Directory",
      count: schoolsCount,
      description: "Active & pending school listings",
      icon: School,
      href: "/admin/schools",
      badge: "Directory",
    },
    {
      title: "Editorial Blog",
      count: postsCount,
      description: "Published articles & drafts",
      icon: BookOpen,
      href: "/admin/posts",
      badge: "Content",
    },
    {
      title: "Events & Programmes",
      count: eventsCount,
      description: "Flagship summit & workshops",
      icon: Calendar,
      href: "/admin/events",
      badge: "Programmes",
    },
    {
      title: "Lead Capture",
      count: submissionsCount,
      description: "Contact inquiries & nominations",
      icon: Inbox,
      href: "/admin/submissions",
      badge: "Inbound",
    },
  ];

  return (
    <DashboardShell user={session.user}>
      <div className="space-y-6 max-w-7xl mx-auto">
        {/* Top Welcome Banner */}
        <div className="rounded-2xl border border-[#D9DEEC] bg-white p-5 sm:p-7 shadow-xs">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1.5">
                <Badge
                  variant="outline"
                  className="text-xs uppercase tracking-wider border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
                >
                  {session.user.role || "super_admin"}
                </Badge>
                <span className="text-xs text-muted-foreground">
                  Port Harcourt, NG
                </span>
              </div>
              <h1 className="font-heading text-xl sm:text-2xl font-black text-[#184098]">
                Welcome, {session.user.name || "Administrator"}!
              </h1>
              <p className="text-xs sm:text-sm text-muted-foreground mt-1">
                Here is a summary of the PortHarcourtSchools education platform.
              </p>
            </div>

            {/* Quick Action Links */}
            <div className="flex flex-wrap items-center gap-2">
              <Link href="/admin/pages">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs border-[#D9DEEC] text-[#184098] hover:bg-[#EEF2FA] font-medium"
                >
                  Pages CMS
                </Button>
              </Link>
              <Link href="/admin/media">
                <Button
                  variant="outline"
                  size="sm"
                  className="h-9 text-xs border-[#D9DEEC] text-[#184098] hover:bg-[#EEF2FA] font-medium"
                >
                  Media Library
                </Button>
              </Link>
              <Link href="/admin/schools/new">
                <Button
                  size="sm"
                  className="h-9 text-xs bg-[#184098] text-white hover:bg-[#08276B]"
                >
                  <Plus className="size-3.5 mr-1" />
                  Add School
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Real-time Website Traffic & Visitor Analytics */}
        <AnalyticsDashboardSection initialData={analyticsData} />

        {/* Platform Content & Directory Management Overview */}
        <div className="pt-4 space-y-3">
          <div>
            <h2 className="font-heading text-lg font-bold text-[#151B2E]">
              Platform &amp; Directory Overview
            </h2>
            <p className="text-xs text-muted-foreground">
              Direct access to registered schools, published editorial posts,
              upcoming events, and lead capture.
            </p>
          </div>

          {/* Responsive Stat Cards: 1-col mobile, 2-col tablet, 4-col desktop */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {statCards.map((stat) => {
              const Icon = stat.icon;
              return (
                <Card
                  key={stat.title}
                  className="border-[#D9DEEC] bg-white hover:border-[#184098]/40 hover:shadow-md transition-all"
                >
                  <CardHeader className="flex flex-row items-center justify-between pb-2">
                    <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">
                      {stat.badge}
                    </span>
                    <div className="flex size-8 items-center justify-center rounded-lg bg-[#EEF2FA] text-[#184098]">
                      <Icon className="size-4" />
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="font-heading text-3xl font-black text-[#151B2E]">
                      {stat.count}
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 font-medium">
                      {stat.title}
                    </p>
                    <div className="mt-3 pt-3 border-t border-[#D9DEEC]/60 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground truncate">
                        {stat.description}
                      </span>
                      <Link
                        href={stat.href}
                        className="text-xs font-bold text-[#184098] hover:underline flex items-center shrink-0 ml-1"
                      >
                        <span>View</span>
                        <ArrowUpRight className="size-3.5 ml-0.5" />
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>

        {/* Recent Submissions Section */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-heading text-base sm:text-lg font-bold text-[#151B2E]">
                Recent Inbound Inquiries
              </h2>
              <p className="text-xs text-muted-foreground">
                Latest submissions from parents, teachers, and school partners.
              </p>
            </div>
            <Link
              href="/admin/submissions"
              className="text-xs font-bold text-[#184098] hover:underline flex items-center"
            >
              <span>View All</span>
              <ArrowUpRight className="size-3.5 ml-1" />
            </Link>
          </div>

          {recentSubmissions.length === 0 ? (
            <Card className="border-[#D9DEEC] bg-white p-8 text-center">
              <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-[#EEF2FA] text-[#184098] mb-3">
                <Inbox className="size-6 text-[#184098]" />
              </div>
              <h3 className="font-heading text-sm font-bold text-[#151B2E]">
                No Submissions Yet
              </h3>
              <p className="text-xs text-muted-foreground max-w-sm mx-auto mt-1">
                When parents or teachers submit inquiries via the public contact
                or nomination forms, they will appear here.
              </p>
            </Card>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Submitter</TableHead>
                  <TableHead>Persona</TableHead>
                  <TableHead>Subject</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentSubmissions.map((sub) => (
                  <TableRow key={sub.id}>
                    <TableCell className="font-medium">
                      <div>
                        <p className="text-xs font-bold text-[#151B2E]">
                          {sub.name}
                        </p>
                        <p className="text-[11px] text-muted-foreground">
                          {sub.email}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant="outline"
                        className="capitalize text-[10px]"
                      >
                        {sub.personaType}
                      </Badge>
                    </TableCell>
                    <TableCell className="max-w-[200px] truncate text-xs">
                      {sub.subject || "General inquiry"}
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={sub.status === "new" ? "amber" : "success"}
                        className="text-[10px] uppercase"
                      >
                        {sub.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <SubmissionDetailsDialog
                        submission={sub}
                        trigger={
                          <Button
                            variant="ghost"
                            size="xs"
                            className="size-7 p-0 hover:bg-[#EEF2FA]"
                            aria-label={`View submission from ${sub.name}`}
                          >
                            <Eye className="size-3.5 text-[#184098]" />
                          </Button>
                        }
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </div>
    </DashboardShell>
  );
}
