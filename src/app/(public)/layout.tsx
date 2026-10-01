import { NuqsAdapter } from "nuqs/adapters/next/app";
import { type ReactNode, Suspense } from "react";
import { AnalyticsTracker } from "@/components/site/analytics-tracker";
import { PublicShell } from "@/components/site/public-shell";

export default function PublicLayout({ children }: { children: ReactNode }) {
  return (
    <NuqsAdapter>
      <Suspense fallback={null}>
        <AnalyticsTracker />
      </Suspense>
      <PublicShell>{children}</PublicShell>
    </NuqsAdapter>
  );
}
