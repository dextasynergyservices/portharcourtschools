import {
  Calendar,
  ExternalLink,
  FileText,
  Globe,
  GraduationCap,
  Home,
  Info,
  Layers,
  Mail,
  Pencil,
  Users,
} from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/app/(admin)/admin/dashboard/dashboard-shell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { auth } from "@/lib/auth";
import { CMS_PAGES_CONFIG } from "@/lib/cms-defaults";
import { db, pages } from "@/lib/db";

export const metadata: Metadata = {
  title: "Pages & Content CMS | Admin",
  description: "Manage content, copy, and images across public pages.",
};

const PAGE_ICONS: Record<string, React.ElementType> = {
  home: Home,
  about: Info,
  contact: Mail,
  partners: Users,
  events: Calendar,
  schools: GraduationCap,
  research: Layers,
};

export default async function PagesIndexPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const dbPages = await db.select().from(pages);
  const dbMap = new Map(dbPages.map((p) => [p.slug, p]));

  const pagesList = Object.values(CMS_PAGES_CONFIG);

  return (
    <DashboardShell user={session.user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Pages &amp; Content CMS
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Edit headlines, text copy, call-to-actions, and section imagery
              across all public pages without touching code.
            </p>
          </div>
        </div>

        {/* Pages Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {pagesList.map((cfg) => {
            const dbPage = dbMap.get(cfg.slug);
            const Icon = PAGE_ICONS[cfg.slug] || FileText;
            const isCustomized = Boolean(dbPage);

            return (
              <div
                key={cfg.slug}
                className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs hover:border-primary/40 transition-colors"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="size-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      <Icon className="size-5" />
                    </div>
                    {isCustomized ? (
                      <Badge className="bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20 text-xs">
                        Customized
                      </Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="text-xs text-muted-foreground"
                      >
                        Factory Default
                      </Badge>
                    )}
                  </div>

                  <div>
                    <h2 className="text-lg font-bold font-heading text-foreground">
                      {cfg.title}
                    </h2>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                      {cfg.description}
                    </p>
                  </div>

                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-mono bg-muted/40 px-2.5 py-1 rounded-md w-fit">
                    <Globe className="size-3.5" />
                    {cfg.path}
                  </div>
                </div>

                <div className="pt-5 mt-5 border-t border-border/60 flex items-center justify-between">
                  <a
                    href={cfg.path}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1 transition-colors"
                  >
                    <ExternalLink className="size-3" />
                    View Live
                  </a>

                  <Button asChild size="sm" className="gap-1.5 h-8">
                    <Link href={`/admin/pages/${cfg.slug}`}>
                      <Pencil className="size-3.5" />
                      Edit Content
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
