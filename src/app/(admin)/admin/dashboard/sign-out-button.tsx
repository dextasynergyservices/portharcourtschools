"use client";

import { LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";

export function SignOutButton({
  className,
  variant = "outline",
}: {
  className?: string;
  variant?: "outline" | "ghost" | "default" | "destructive";
}) {
  return (
    <Button
      variant={variant}
      onClick={() => signOut({ callbackUrl: "/admin/login" })}
      className={className}
    >
      <LogOut className="size-4" />
      <span>Sign Out</span>
    </Button>
  );
}
