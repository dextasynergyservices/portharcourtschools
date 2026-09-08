"use client";

import { AlertCircle, Eye, EyeOff, Lock } from "lucide-react";
import Image from "next/image";
import { useActionState, useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { type LoginActionState, loginAction } from "./actions";

export default function AdminLoginPage() {
  const [state, formAction, isPending] = useActionState<
    LoginActionState,
    FormData
  >(loginAction, {});
  const [showPassword, setShowPassword] = useState(false);

  return (
    <div className="flex min-h-screen min-h-[100dvh] flex-col items-center justify-center bg-[#FAFBFF] px-4 py-8">
      {/* Container */}
      <div className="w-full max-w-sm">
        {/* Brand Header */}
        <div className="mb-6 flex flex-col items-center text-center">
          <div className="mb-3 relative h-16 w-48">
            <Image
              src="/images/logo.png"
              alt="PortHarcourtSchools Logo"
              fill
              sizes="192px"
              className="object-contain"
              priority
              loading="eager"
            />
          </div>
          <div className="flex items-center gap-2">
            <Badge
              variant="outline"
              className="text-[10px] uppercase tracking-wider font-bold border-[#D9DEEC] bg-[#EEF2FA] text-[#184098]"
            >
              Admin Portal
            </Badge>
            <span className="text-xs text-muted-foreground font-medium">
              Staff & Editorial
            </span>
          </div>
        </div>

        {/* Login Card */}
        <Card className="border-[#D9DEEC] bg-white shadow-lg shadow-[#184098]/5">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-lg font-bold text-[#151B2E]">
              Sign In
            </CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to manage schools, blog, events, and
              submissions.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {state?.error && (
              <div
                role="alert"
                className="mb-4 flex items-start gap-2.5 rounded-lg border border-[#C0392B]/20 bg-[#C0392B]/10 p-3 text-xs text-[#C0392B]"
              >
                <AlertCircle className="size-4 shrink-0 mt-0.5" />
                <span className="leading-snug">{state.error}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <div className="space-y-1.5">
                <label
                  htmlFor="email"
                  className="block text-xs font-semibold text-[#151B2E]"
                >
                  Email Address
                </label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  required
                  autoComplete="email"
                  inputMode="email"
                  autoCapitalize="none"
                  placeholder="admin@portharcourtschools.com"
                  className="h-11 border-[#D9DEEC] bg-white focus-visible:ring-[#184098]"
                />
              </div>

              <div className="space-y-1.5">
                <label
                  htmlFor="password"
                  className="block text-xs font-semibold text-[#151B2E]"
                >
                  Password
                </label>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    required
                    autoComplete="current-password"
                    placeholder="••••••••••••"
                    className="h-11 border-[#D9DEEC] bg-white pr-10 focus-visible:ring-[#184098]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-0 top-0 flex h-11 w-11 items-center justify-center text-muted-foreground hover:text-foreground touch-target"
                    aria-label={
                      showPassword ? "Hide password" : "Show password"
                    }
                  >
                    {showPassword ? (
                      <EyeOff className="size-4" />
                    ) : (
                      <Eye className="size-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button
                type="submit"
                disabled={isPending}
                className="h-11 w-full bg-[#184098] font-bold text-white hover:bg-[#08276B] active:scale-[0.99] transition-all touch-target mt-2"
              >
                {isPending ? (
                  <span className="flex items-center gap-2">
                    <span className="size-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    Authenticating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Lock className="size-4" />
                    Sign In to Admin
                  </span>
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Footer info */}
        <p className="mt-6 text-center text-[11px] text-muted-foreground">
          Protected administrative system. Unauthorized access is prohibited.
        </p>
      </div>
    </div>
  );
}
