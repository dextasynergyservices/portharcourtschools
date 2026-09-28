import { eq } from "drizzle-orm";
import { notFound, redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { categories, db, posts } from "@/lib/db";
import { DashboardShell } from "../../../dashboard/dashboard-shell";
import { PostForm } from "../../post-form";

export const metadata = {
  title:
    "Edit Article — Admin Portal | Schools Voice (Formerly Port Harcourt Schools)",
};

interface EditPostPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function EditPostPage({ params }: EditPostPageProps) {
  const { id } = await params;
  const session = await auth();

  if (!session?.user) {
    redirect("/admin/login");
  }

  const [post] = await db.select().from(posts).where(eq(posts.id, id)).limit(1);

  if (!post) {
    notFound();
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
          initialData={post}
          categories={allCategories}
          userRole={(session.user as { role?: string }).role || "creator"}
        />
      </main>
    </DashboardShell>
  );
}
