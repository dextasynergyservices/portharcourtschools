import { desc } from "drizzle-orm";
import { Shield, ShieldAlert, UserCheck, Users } from "lucide-react";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { DashboardShell } from "@/app/(admin)/admin/dashboard/dashboard-shell";
import { InviteUserDialog } from "@/app/(admin)/admin/users/invite-user-dialog";
import { UsersTable } from "@/app/(admin)/admin/users/users-table";
import { auth } from "@/lib/auth";
import { db, users } from "@/lib/db";

export const metadata: Metadata = {
  title: "User Management | Admin",
  description: "Manage team members, assign permissions, and send invitations.",
};

export default async function AdminUsersPage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/admin/login");
  }

  // Role Guard: Super Admin Only
  if (session.user.role !== "super_admin") {
    return (
      <DashboardShell user={session.user}>
        <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
          <div className="size-14 rounded-full bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center mb-4">
            <ShieldAlert className="size-8" />
          </div>
          <h1 className="text-2xl font-bold font-heading text-foreground">
            Restricted Access
          </h1>
          <p className="text-sm text-muted-foreground max-w-md mt-2">
            Only Super Administrators have permission to manage team accounts,
            assign roles, or send workspace invitations.
          </p>
        </div>
      </DashboardShell>
    );
  }

  const allUsers = await db.select().from(users).orderBy(desc(users.createdAt));

  // Quick stats
  const totalCount = allUsers.length;
  const superAdminCount = allUsers.filter(
    (u) => u.role === "super_admin",
  ).length;
  const activeCount = allUsers.filter((u) => u.status === "active").length;
  const pendingCount = allUsers.filter((u) => u.status === "inactive").length;

  return (
    <DashboardShell user={session.user}>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold font-heading text-foreground">
              Team &amp; User Management
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Invite team members, assign administrative roles, and control
              platform permissions.
            </p>
          </div>

          <InviteUserDialog />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-1">
              <Users className="size-4 text-primary" />
              Total Members
            </div>
            <div className="text-2xl font-extrabold font-heading text-foreground">
              {totalCount}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-1">
              <Shield className="size-4 text-amber-500" />
              Super Admins
            </div>
            <div className="text-2xl font-extrabold font-heading text-foreground">
              {superAdminCount}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-1">
              <UserCheck className="size-4 text-emerald-500" />
              Active Users
            </div>
            <div className="text-2xl font-extrabold font-heading text-foreground">
              {activeCount}
            </div>
          </div>

          <div className="p-4 rounded-xl border border-border bg-card shadow-xs">
            <div className="flex items-center gap-2 text-muted-foreground text-xs font-semibold mb-1">
              <span className="size-2 rounded-full bg-amber-500" />
              Pending Activation
            </div>
            <div className="text-2xl font-extrabold font-heading text-foreground">
              {pendingCount}
            </div>
          </div>
        </div>

        {/* Users Table */}
        <UsersTable users={allUsers} currentUserId={session.user.id || ""} />
      </div>
    </DashboardShell>
  );
}
