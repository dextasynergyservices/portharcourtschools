"use client";

import type { Column } from "@tanstack/react-table";
import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { HTMLAttributes } from "react";
import { cn } from "@/lib/utils";

interface DataTableColumnHeaderProps<TData, TValue>
  extends HTMLAttributes<HTMLDivElement> {
  column: Column<TData, TValue>;
  title: string;
}

export function DataTableColumnHeader<TData, TValue>({
  column,
  title,
  className,
}: DataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return (
      <div
        className={cn(
          "font-bold text-xs uppercase tracking-wider text-[#151B2E]",
          className,
        )}
      >
        {title}
      </div>
    );
  }

  const isSorted = column.getIsSorted();

  return (
    <button
      type="button"
      onClick={() => column.toggleSorting(isSorted === "asc")}
      className={cn(
        "flex items-center gap-1.5 font-bold text-xs uppercase tracking-wider text-[#151B2E] hover:text-[#184098] transition-colors focus:outline-none -ml-1 px-1 py-0.5 rounded",
        isSorted && "text-[#184098]",
        className,
      )}
    >
      <span>{title}</span>
      {isSorted === "desc" ? (
        <ArrowDown className="size-3.5 text-[#184098]" />
      ) : isSorted === "asc" ? (
        <ArrowUp className="size-3.5 text-[#184098]" />
      ) : (
        <ArrowUpDown className="size-3 text-muted-foreground/60" />
      )}
    </button>
  );
}
