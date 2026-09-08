"use client";

import { ArrowDown, Check, Loader2 } from "lucide-react";
import { parseAsInteger, useQueryState } from "nuqs";
import { useTransition } from "react";
import { Button } from "@/components/ui/button";

interface LoadMoreButtonProps {
  currentCount: number;
  totalCount: number;
  batchSize?: number;
}

export function LoadMoreButton({
  currentCount,
  totalCount,
  batchSize = 9,
}: LoadMoreButtonProps) {
  const [isPending, startTransition] = useTransition();
  const [limit, setLimit] = useQueryState(
    "limit",
    parseAsInteger.withDefault(batchSize).withOptions({ shallow: false }),
  );

  if (totalCount <= 0) return null;

  const percentage = Math.min(
    100,
    Math.round((Math.min(currentCount, totalCount) / totalCount) * 100),
  );
  const hasMore = currentCount < totalCount;
  const remaining = totalCount - currentCount;

  const handleLoadMore = () => {
    startTransition(async () => {
      const nextLimit = (limit ?? batchSize) + batchSize;
      await setLimit(nextLimit);
    });
  };

  return (
    <div className="flex flex-col items-center justify-center py-10 space-y-4 border-t border-[#D9DEEC] w-full">
      {/* Progress counter & bar */}
      <div className="w-full max-w-xs space-y-1.5 text-center">
        <div className="flex items-center justify-between text-xs text-muted-foreground font-medium">
          <span>
            Showing{" "}
            <strong className="text-[#151B2E]">
              {Math.min(currentCount, totalCount)}
            </strong>{" "}
            of <strong className="text-[#151B2E]">{totalCount}</strong> schools
          </span>
          <span className="text-[11px] font-bold text-[#184098]">
            {percentage}%
          </span>
        </div>

        <div className="w-full h-1.5 rounded-full bg-[#EEF2FA] overflow-hidden">
          <div
            className="h-full rounded-full bg-[#184098] transition-all duration-500 ease-out"
            style={{ width: `${percentage}%` }}
          />
        </div>
      </div>

      {/* Button or Finished state */}
      {hasMore ? (
        <Button
          type="button"
          onClick={handleLoadMore}
          disabled={isPending}
          className="h-11 px-8 rounded-lg bg-[#184098] hover:bg-[#08276B] text-white font-bold text-xs shadow-xs transition-all flex items-center gap-2"
        >
          {isPending ? (
            <>
              <Loader2 className="size-4 animate-spin text-[#FDDA32]" />
              Loading schools...
            </>
          ) : (
            <>
              <ArrowDown className="size-4 text-[#FDDA32]" />
              Load More Schools ({Math.min(remaining, batchSize)} more)
            </>
          )}
        </Button>
      ) : (
        <div className="text-center py-2 space-y-1">
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
            <Check className="size-3.5 text-emerald-600" />
            All {totalCount} Schools Displayed
          </div>
          <p className="text-[11px] text-muted-foreground">
            Looking for other areas or fee ranges? Try adjusting your search
            filters above.
          </p>
        </div>
      )}
    </div>
  );
}
