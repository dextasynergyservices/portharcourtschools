import { NuqsAdapter } from "nuqs/adapters/next/app";
import type { ReactNode } from "react";
import { PublicShell } from "@/components/site/public-shell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <PublicShell>{children}</PublicShell>
    </NuqsAdapter>
  );
}
