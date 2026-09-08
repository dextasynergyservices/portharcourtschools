import type * as React from "react";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "animate-pulse rounded-md bg-[#D9DEEC]/40 dark:bg-muted/50",
        className,
      )}
      {...props}
    />
  );
}
