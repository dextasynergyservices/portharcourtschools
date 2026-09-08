import { desc } from "drizzle-orm";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/app/(admin)/admin/dashboard/dashboard-shell";
import { MediaClient } from "@/app/(admin)/admin/media/media-client";
import { auth } from "@/lib/auth";
import { db, media } from "@/lib/db";
import { isR2Configured } from "@/lib/r2";

export const metadata: Metadata = {
  title: "Media Library | Admin",
  description: "Manage Cloudflare R2 media files, campus images, and assets.",
};

export default async function MediaPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  const items = await db
    .select()
    .from(media)
    .orderBy(desc(media.createdAt))
    .limit(100);

  const r2Ready = isR2Configured();

  return (
    <DashboardShell user={session.user}>
      <MediaClient initialItems={items} isR2Configured={r2Ready} />
    </DashboardShell>
  );
}
