import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { categories, db } from "@/lib/db";
import { DashboardShell } from "../../dashboard/dashboard-shell";
import { PostForm } from "../post-form";

export const metadata = {
  title: "New Article — Admin Portal | PortHarcourtSchools",
};

export default async function NewPostPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const allCategories = await db
    .select({
      id: categories.id,
      name: categories.name,
      slug: categories.slug,
    })
    .from(categories)
    .orderBy(categories.name);

  return (
    <DashboardShell user={session.user}>
      <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
        <PostForm
          categories={allCategories}
          userRole={(session.user as { role?: string }).role || "creator"}
        />
      </main>
    </DashboardShell>
  );
}
