"use client";

import {
  AlertCircle,
  CheckCircle2,
  KeyRound,
  Loader2,
  Lock,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { setPasswordAction } from "@/app/(admin)/admin/users/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface SetPasswordClientProps {
  email: string;
  token: string;
}

export function SetPasswordClient({ email, token }: SetPasswordClientProps) {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSuccess, setIsSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (password.length < 8) {
      setErrorMessage("Password must be at least 8 characters long.");
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify and try again.");
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const res = await setPasswordAction({
        email,
        token,
        password,
      });

      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || "Failed to set password.");
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSuccess) {
    return (
      <div className="flex flex-col items-center text-center space-y-4 p-8 bg-card border border-border rounded-xl shadow-xs max-w-md w-full">
        <div className="size-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
          <CheckCircle2 className="size-8" />
        </div>
        <div>
          <h2 className="text-xl font-bold font-heading text-foreground">
            Password Set Successfully!
          </h2>
          <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
            Your account for{" "}
            <strong className="text-foreground">{email}</strong> is now active.
            You can log in to access your administrative dashboard.
          </p>
        </div>
        <Button asChild className="w-full mt-2 h-10">
          <Link href="/admin/login">Log In to Workspace</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md rounded-xl border border-border bg-card p-8 shadow-xs space-y-6">
      <div className="text-center space-y-2">
        <div className="size-12 rounded-full bg-primary/10 text-primary flex items-center justify-center mx-auto">
          <KeyRound className="size-6" />
        </div>
        <h1 className="text-2xl font-bold font-heading text-foreground">
          Create Your Password
        </h1>
        <p className="text-xs text-muted-foreground">
          Setting credentials for{" "}
          <strong className="text-foreground">{email}</strong>
        </p>
      </div>

      {errorMessage && (
        <div className="p-3 bg-destructive/10 border border-destructive/20 text-destructive rounded-md text-xs flex items-center gap-2">
          <AlertCircle className="size-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label htmlFor="password">New Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="password"
              type="password"
              placeholder="Minimum 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="pl-9 h-10 text-sm"
              required
            />
          </div>
        </div>

        <div>
          <Label htmlFor="confirmPassword">Confirm Password</Label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              id="confirmPassword"
              type="password"
              placeholder="Re-enter your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="pl-9 h-10 text-sm"
              required
            />
          </div>
        </div>

        <Button
          type="submit"
          disabled={isSubmitting}
          className="w-full h-10 mt-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin mr-2" />
              Activating Account...
            </>
          ) : (
            "Activate & Set Password"
          )}
        </Button>
      </form>
    </div>
  );
}
