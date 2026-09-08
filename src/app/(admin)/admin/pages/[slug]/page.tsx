import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { DashboardShell } from "@/app/(admin)/admin/dashboard/dashboard-shell";
import { PageEditor } from "@/app/(admin)/admin/pages/[slug]/page-editor";
import { getPageContent } from "@/app/(admin)/admin/pages/actions";
import { auth } from "@/lib/auth";
import { CMS_PAGES_CONFIG } from "@/lib/cms-defaults";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const config = CMS_PAGES_CONFIG[slug];
  if (!config) return { title: "Page Not Found | Admin" };
  return {
    title: `Edit ${config.title} | Admin`,
  };
}

export default async function AdminPageEditorPage({ params }: PageProps) {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const { slug } = await params;
  const config = CMS_PAGES_CONFIG[slug];

  if (!config) {
    notFound();
  }

  const pageData = await getPageContent(slug);

  return (
    <DashboardShell user={session.user}>
      <PageEditor
        config={config}
        initialData={{
          title: pageData.title || config.title,
          sections:
            (pageData.sections as Record<
              string,
              Record<string, string | undefined>
            >) || {},
          seoMeta: pageData.seoMeta || {},
        }}
      />
    </DashboardShell>
  );
}
