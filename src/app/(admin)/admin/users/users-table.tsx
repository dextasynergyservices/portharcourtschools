"use client";

import { Menu } from "@base-ui/react/menu";
import type { ColumnDef } from "@tanstack/react-table";
import {
  Check,
  Copy,
  MoreHorizontal,
  RefreshCw,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import {
  deleteUserAction,
  resendInviteAction,
  toggleUserStatusAction,
  updateUserRoleAction,
} from "@/app/(admin)/admin/users/actions";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { User } from "@/lib/db/schema";

interface UsersTableProps {
  users: User[];
  currentUserId: string;
}

const ROLE_CONFIG: Record<
  string,
  { label: string; bg: string; text: string; border: string }
> = {
  super_admin: {
    label: "Super Admin",
    bg: "bg-amber-500/10",
    text: "text-amber-800 dark:text-amber-200",
    border: "border-amber-500/20",
  },
  admin: {
    label: "Admin",
    bg: "bg-blue-500/10",
    text: "text-blue-800 dark:text-blue-200",
    border: "border-blue-500/20",
  },
  editor: {
    label: "Editor",
    bg: "bg-emerald-500/10",
    text: "text-emerald-800 dark:text-emerald-200",
    border: "border-emerald-500/20",
  },
  creator: {
    label: "Creator",
    bg: "bg-purple-500/10",
    text: "text-purple-800 dark:text-purple-200",
    border: "border-purple-500/20",
  },
};

export function UsersTable({ users, currentUserId }: UsersTableProps) {
  const [data, setData] = useState<User[]>(users);
  const [selectedRole, setSelectedRole] = useState<string>("all");
  const [selectedStatus, setSelectedStatus] = useState<string>("all");

  // Role Edit Dialog State
  const [editingRoleUser, setEditingRoleUser] = useState<User | null>(null);
  const [newRole, setNewRole] = useState<User["role"]>("editor");
  const [isUpdatingRole, setIsUpdatingRole] = useState(false);

  // Resend Invite Modal State
  const [inviteModal, setInviteModal] = useState<{
    open: boolean;
    url: string;
    email: string;
    copied: boolean;
  }>({ open: false, url: "", email: "", copied: false });

  const filteredData = useMemo(() => {
    return data.filter((u) => {
      const matchRole = selectedRole === "all" ? true : u.role === selectedRole;
      const matchStatus =
        selectedStatus === "all" ? true : u.status === selectedStatus;
      return matchRole && matchStatus;
    });
  }, [data, selectedRole, selectedStatus]);

  async function handleToggleStatus(user: User) {
    const nextStatus = user.status === "active" ? "inactive" : "active";
    const confirmMsg =
      nextStatus === "inactive"
        ? `Are you sure you want to deactivate ${user.name}? They will not be able to log in.`
        : `Reactivate account for ${user.name}?`;

    if (!confirm(confirmMsg)) return;

    const res = await toggleUserStatusAction({
      userId: user.id,
      newStatus: nextStatus,
    });

    if (res.success) {
      setData((prev) =>
        prev.map((u) => (u.id === user.id ? { ...u, status: nextStatus } : u)),
      );
      toast.success(
        `User ${nextStatus === "active" ? "reactivated" : "deactivated"} successfully`,
      );
    } else {
      toast.error("Status update failed", {
        description: res.error,
      });
    }
  }

  async function handleDelete(user: User) {
    if (
      !confirm(
        `Are you sure you want to permanently remove ${user.name} from the workspace? This action cannot be undone.`,
      )
    ) {
      return;
    }

    const res = await deleteUserAction(user.id);
    if (res.success) {
      setData((prev) => prev.filter((u) => u.id !== user.id));
      toast.success("User removed successfully");
    } else {
      toast.error("Failed to delete user", {
        description: res.error,
      });
    }
  }

  async function handleResendInvite(user: User) {
    const res = await resendInviteAction(user.id);
    if (res.success && res.inviteUrl) {
      setInviteModal({
        open: true,
        url: res.inviteUrl,
        email: user.email,
        copied: false,
      });
      toast.success("New invitation link created");
    } else {
      toast.error("Failed to resend invite", {
        description: res.error,
      });
    }
  }

  async function handleSaveRole() {
    if (!editingRoleUser) return;
    setIsUpdatingRole(true);
    try {
      const res = await updateUserRoleAction({
        userId: editingRoleUser.id,
        newRole,
      });

      if (res.success) {
        setData((prev) =>
          prev.map((u) =>
            u.id === editingRoleUser.id ? { ...u, role: newRole } : u,
          ),
        );
        setEditingRoleUser(null);
        toast.success(`Role updated to ${newRole.replace("_", " ")}`);
      } else {
        toast.error("Failed to update role", {
          description: res.error,
        });
      }
    } finally {
      setIsUpdatingRole(false);
    }
  }

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: "name",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="User" />
      ),
      cell: ({ row }) => {
        const u = row.original;
        const isSelf = u.id === currentUserId;
        const initials = (u.name || "U")
          .split(" ")
          .map((n) => n[0])
          .slice(0, 2)
          .join("")
          .toUpperCase();

        return (
          <div className="flex items-center gap-3">
            <div className="size-9 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-xs shrink-0">
              {initials}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-sm text-foreground">
                  {u.name}
                </span>
                {isSelf && (
                  <span className="text-[10px] bg-primary/10 text-primary px-1.5 py-0.2 rounded font-medium">
                    You
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground">{u.email}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "role",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Role" />
      ),
      cell: ({ row }) => {
        const roleKey = row.original.role;
        const cfg = ROLE_CONFIG[roleKey] || {
          label: roleKey,
          bg: "bg-muted",
          text: "text-foreground",
          border: "border-border",
        };

        return (
          <Badge
            variant="outline"
            className={`${cfg.bg} ${cfg.text} ${cfg.border} text-xs font-semibold`}
          >
            {cfg.label}
          </Badge>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        const isActive = status === "active";

        return (
          <Badge
            variant="outline"
            className={`text-xs gap-1 py-0.5 ${
              isActive
                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-500/20"
                : "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-500/20"
            }`}
          >
            <span
              className={`size-1.5 rounded-full ${
                isActive ? "bg-emerald-500" : "bg-amber-500"
              }`}
            />
            {isActive ? "Active" : "Inactive / Pending"}
          </Badge>
        );
      },
    },
    {
      accessorKey: "createdAt",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Joined" />
      ),
      cell: ({ row }) => {
        const date = new Date(row.original.createdAt);
        return (
          <span className="text-xs text-muted-foreground">
            {date.toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const user = row.original;
        const isSelf = user.id === currentUserId;

        return (
          <div className="flex justify-end">
            <Menu.Root>
              <Menu.Trigger
                className="flex size-8 items-center justify-center rounded-md border border-border bg-background hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Actions"
              >
                <MoreHorizontal className="size-4" />
              </Menu.Trigger>
              <Menu.Portal>
                <Menu.Positioner sideOffset={4} align="end" className="z-50">
                  <Menu.Popup className="min-w-[170px] rounded-lg border border-border bg-popover p-1 shadow-md text-popover-foreground outline-none text-xs">
                    {/* Change Role */}
                    <Menu.Item
                      className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent"
                      onClick={() => {
                        setEditingRoleUser(user);
                        setNewRole(user.role);
                      }}
                    >
                      <Shield className="size-3.5 text-muted-foreground" />
                      Change Role
                    </Menu.Item>

                    {/* Resend Invite */}
                    {user.status === "inactive" && (
                      <Menu.Item
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent"
                        onClick={() => handleResendInvite(user)}
                      >
                        <RefreshCw className="size-3.5 text-muted-foreground" />
                        Resend Invite Link
                      </Menu.Item>
                    )}

                    {/* Toggle Status */}
                    {!isSelf && (
                      <Menu.Item
                        className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 outline-none hover:bg-accent hover:text-accent-foreground data-[highlighted]:bg-accent"
                        onClick={() => handleToggleStatus(user)}
                      >
                        {user.status === "active" ? (
                          <>
                            <UserX className="size-3.5 text-amber-500" />
                            Deactivate Account
                          </>
                        ) : (
                          <>
                            <UserCheck className="size-3.5 text-emerald-500" />
                            Activate Account
                          </>
                        )}
                      </Menu.Item>
                    )}

                    {/* Delete User */}
                    {!isSelf && (
                      <>
                        <Menu.Separator className="my-1 h-px bg-border" />
                        <Menu.Item
                          className="flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-1.5 outline-none text-destructive hover:bg-destructive/10 data-[highlighted]:bg-destructive/10"
                          onClick={() => handleDelete(user)}
                        >
                          <Trash2 className="size-3.5" />
                          Delete User
                        </Menu.Item>
                      </>
                    )}
                  </Menu.Popup>
                </Menu.Positioner>
              </Menu.Portal>
            </Menu.Root>
          </div>
        );
      },
    },
  ];

  return (
    <>
      <DataTable
        columns={columns}
        data={filteredData}
        searchKey="name"
        searchPlaceholder="Search users by name..."
        filterSlot={
          <div className="flex flex-wrap items-center gap-2">
            {/* Role Filter */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md border border-border/50 text-xs">
              <span className="text-muted-foreground px-2 text-[11px] font-semibold">
                Role:
              </span>
              {[
                { id: "all", label: "All Roles" },
                { id: "super_admin", label: "Super Admin" },
                { id: "admin", label: "Admin" },
                { id: "editor", label: "Editor" },
                { id: "creator", label: "Creator" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedRole(tab.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                    selectedRole === tab.id
                      ? "bg-white text-primary shadow-xs dark:bg-card dark:text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Status Filter */}
            <div className="flex items-center gap-1 bg-muted/60 p-1 rounded-md border border-border/50 text-xs">
              <span className="text-muted-foreground px-2 text-[11px] font-semibold">
                Status:
              </span>
              {[
                { id: "all", label: "All" },
                { id: "active", label: "Active" },
                { id: "inactive", label: "Inactive" },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setSelectedStatus(tab.id)}
                  className={`px-2.5 py-1 rounded text-[11px] font-bold transition-colors ${
                    selectedStatus === tab.id
                      ? "bg-white text-primary shadow-xs dark:bg-card dark:text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        }
      />

      {/* Change Role Dialog */}
      <Dialog
        open={Boolean(editingRoleUser)}
        onOpenChange={(open) => !open && setEditingRoleUser(null)}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Change Team Role</DialogTitle>
            <DialogDescription>
              Assign new workspace permissions for{" "}
              <strong>{editingRoleUser?.name}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 py-2">
            <Label htmlFor="editRole">Select Workspace Role</Label>
            <select
              id="editRole"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value as User["role"])}
              className="w-full h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
            >
              <option value="editor">
                Editor — Can create and edit schools, posts, and events
              </option>
              <option value="creator">
                Creator — Can draft blog posts and stories
              </option>
              <option value="admin">
                Admin — Full operational access across all content &amp;
                submissions
              </option>
              <option value="super_admin">
                Super Admin — Complete access including user invites and
                settings
              </option>
            </select>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setEditingRoleUser(null)}
              disabled={isUpdatingRole}
            >
              Cancel
            </Button>
            <Button onClick={handleSaveRole} disabled={isUpdatingRole}>
              Save Role
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Resend Invite Modal */}
      <Dialog
        open={inviteModal.open}
        onOpenChange={(open) => setInviteModal((prev) => ({ ...prev, open }))}
      >
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Invitation Link Regenerated</DialogTitle>
            <DialogDescription>
              A new 48-hour password link was generated for{" "}
              <strong>{inviteModal.email}</strong>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-2 py-2">
            <Label className="text-xs">Password Creation URL</Label>
            <div className="flex items-center gap-2">
              <Input
                readOnly
                value={inviteModal.url}
                className="h-9 text-xs font-mono bg-muted"
              />
              <Button
                variant="outline"
                size="sm"
                onClick={async () => {
                  await navigator.clipboard.writeText(inviteModal.url);
                  setInviteModal((prev) => ({ ...prev, copied: true }));
                  setTimeout(
                    () =>
                      setInviteModal((prev) => ({ ...prev, copied: false })),
                    2500,
                  );
                }}
                className="h-9 px-3 shrink-0 text-xs gap-1.5"
              >
                {inviteModal.copied ? (
                  <>
                    <Check className="size-3.5 text-emerald-500" />
                    Copied!
                  </>
                ) : (
                  <>
                    <Copy className="size-3.5" />
                    Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          <DialogFooter>
            <Button
              onClick={() =>
                setInviteModal((prev) => ({ ...prev, open: false }))
              }
            >
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
