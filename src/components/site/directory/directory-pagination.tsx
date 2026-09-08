"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface DirectoryPaginationProps {
  currentPage: number;
  totalPages: number;
  totalCount: number;
  pageSize: number;
  onPageChange: (page: number) => void;
}

export function DirectoryPagination({
  currentPage,
  totalPages,
  totalCount,
  pageSize,
  onPageChange,
}: DirectoryPaginationProps) {
  if (totalPages <= 1) return null;

  const startItem = (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalCount);

  // Generate page items with unique keys
  type PageItem =
    | { type: "page"; value: number; key: string }
    | { type: "ellipsis"; key: string };

  const items: PageItem[] = [];
  if (totalPages <= 5) {
    for (let i = 1; i <= totalPages; i++) {
      items.push({ type: "page", value: i, key: `page-${i}` });
    }
  } else {
    items.push({ type: "page", value: 1, key: "page-1" });
    if (currentPage > 3) {
      items.push({ type: "ellipsis", key: "ellipsis-start" });
    }
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) {
      items.push({ type: "page", value: i, key: `page-${i}` });
    }
    if (currentPage < totalPages - 2) {
      items.push({ type: "ellipsis", key: "ellipsis-end" });
    }
    items.push({
      type: "page",
      value: totalPages,
      key: `page-${totalPages}`,
    });
  }

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 py-6 border-t border-[#D9DEEC]">
      <p className="text-xs text-muted-foreground order-2 sm:order-1">
        Showing <span className="font-bold text-[#151B2E]">{startItem}</span> to{" "}
        <span className="font-bold text-[#151B2E]">{endItem}</span> of{" "}
        <span className="font-bold text-[#151B2E]">{totalCount}</span> schools
      </p>

      <div className="flex items-center gap-1.5 order-1 sm:order-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-9 px-2.5 text-xs font-semibold border-[#D9DEEC] text-[#151B2E] hover:bg-[#EEF2FA] disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="size-4 mr-1" />
          Previous
        </Button>

        <div className="hidden sm:flex items-center gap-1">
          {items.map((item) => {
            if (item.type === "ellipsis") {
              return (
                <span
                  key={item.key}
                  className="px-2 text-xs text-muted-foreground"
                >
                  …
                </span>
              );
            }
            const pageNum = item.value;
            const isActive = pageNum === currentPage;
            return (
              <Button
                key={item.key}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => onPageChange(pageNum)}
                className={`size-9 text-xs font-bold ${
                  isActive
                    ? "bg-[#184098] text-white hover:bg-[#08276B]"
                    : "border-[#D9DEEC] text-[#151B2E] hover:bg-[#EEF2FA]"
                }`}
              >
                {pageNum}
              </Button>
            );
          })}
        </div>

        <span className="sm:hidden text-xs font-bold text-[#151B2E] px-2">
          {currentPage} / {totalPages}
        </span>

        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages}
          className="h-9 px-2.5 text-xs font-semibold border-[#D9DEEC] text-[#151B2E] hover:bg-[#EEF2FA] disabled:opacity-40"
          aria-label="Next page"
        >
          Next
          <ChevronRight className="size-4 ml-1" />
        </Button>
      </div>
    </div>
  );
}
