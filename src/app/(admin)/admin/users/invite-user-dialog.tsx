"use client";

import { AlertCircle, Check, Copy, Loader2, UserPlus } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { inviteUserAction } from "@/app/(admin)/admin/users/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function InviteUserDialog() {
  const [open, setOpen] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<
    "super_admin" | "admin" | "editor" | "creator"
  >("editor");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [inviteResult, setInviteResult] = useState<{
    inviteUrl: string;
    emailSent: boolean;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  function handleReset() {
    setName("");
    setEmail("");
    setRole("editor");
    setErrorMessage(null);
    setInviteResult(null);
    setCopied(false);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !email.trim()) {
      setErrorMessage("Please fill in all required fields.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await inviteUserAction({
        name,
        email,
        role,
      });

      if (res.success && res.inviteUrl) {
        setInviteResult({
          inviteUrl: res.inviteUrl,
          emailSent: Boolean(res.emailSent),
        });
        toast.success("Invitation generated successfully!", {
          description: res.emailSent
            ? `Invite email delivered to ${email}`
            : "Copy the link below to share with your team member.",
        });
      } else {
        setErrorMessage(res.error || "Failed to invite user.");
        toast.error("Invitation failed", {
          description: res.error,
        });
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (inviteResult?.inviteUrl) {
      await navigator.clipboard.writeText(inviteResult.inviteUrl);
      setCopied(true);
      toast.success("Invite link copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    }
  }

  return (
    <Dialog
      open={open}
      onOpenChange={(val) => {
        setOpen(val);
        if (!val) handleReset();
      }}
    >
      <DialogTrigger asChild>
        <Button className="gap-1.5 h-9">
          <UserPlus className="size-4" />
          Invite Team Member
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {inviteResult ? (
          <div className="space-y-4 py-2">
            <div className="size-12 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center mx-auto">
              <Check className="size-6" />
            </div>

            <div className="text-center space-y-1">
              <DialogTitle className="text-lg font-bold">
                Invitation Generated!
              </DialogTitle>
              <DialogDescription className="text-xs">
                An invitation token has been created for{" "}
                <strong className="text-foreground">{email}</strong>.
              </DialogDescription>
            </div>

            {inviteResult.emailSent ? (
              <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-200 rounded-md text-xs">
                Email dispatched to {email} via Resend.
              </div>
            ) : (
              <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-900 dark:text-amber-200 rounded-md text-xs">
                Resend email was not sent (or is in test mode). You can copy the
                password link below and send it directly via WhatsApp, Slack, or
                email.
              </div>
            )}

            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">
                Set Password Link (Valid for 48 hours)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  readOnly
                  value={inviteResult.inviteUrl}
                  className="h-9 text-xs font-mono bg-muted"
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCopy}
                  className="h-9 px-3 shrink-0 text-xs gap-1.5"
                >
                  {copied ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      Copy Link
                    </>
                  )}
                </Button>
              </div>
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                onClick={() => {
                  setOpen(false);
                  handleReset();
                }}
                className="w-full"
              >
                Done
              </Button>
            </DialogFooter>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2 text-lg font-bold">
                <UserPlus className="size-5 text-primary" />
                Invite New Team Member
              </DialogTitle>
              <DialogDescription className="text-xs">
                They will receive a branded set-password link to activate their
                account and access the admin dashboard.
              </DialogDescription>
            </DialogHeader>

            {errorMessage && (
              <div className="p-2.5 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-xs flex items-center gap-2">
                <AlertCircle className="size-4 shrink-0" />
                {errorMessage}
              </div>
            )}

            <div className="space-y-3 py-1">
              <div>
                <Label htmlFor="name" className="text-xs">
                  Full Name <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="name"
                  placeholder="e.g. Alison GeePhill"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email" className="text-xs">
                  Email Address <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="name@edfocusafrica.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="h-9 text-xs mt-1"
                  required
                />
              </div>

              <div>
                <Label htmlFor="role" className="text-xs">
                  Role Assignment <span className="text-destructive">*</span>
                </Label>
                <select
                  id="role"
                  value={role}
                  onChange={(e) =>
                    setRole(
                      e.target.value as
                        | "super_admin"
                        | "admin"
                        | "editor"
                        | "creator",
                    )
                  }
                  className="w-full mt-1 h-9 rounded-md border border-input bg-background px-3 py-1 text-xs shadow-xs focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
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
            </div>

            <DialogFooter className="pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting} className="gap-2">
                {isSubmitting && <Loader2 className="size-3.5 animate-spin" />}
                Send Invitation
              </Button>
            </DialogFooter>
          </form>
        )}
      </DialogContent>
    </Dialog>
  );
}
