"use client";

import {
  type ColumnDef,
  type ColumnFiltersState,
  flexRender,
  getCoreRowModel,
  getFilteredRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  type SortingState,
  useReactTable,
  type VisibilityState,
} from "@tanstack/react-table";
import { Search } from "lucide-react";
import type { ReactNode } from "react";
import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DataTablePagination } from "./data-table-pagination";

interface DataTableProps<TData, TValue> {
  columns: ColumnDef<TData, TValue>[];
  data: TData[];
  searchKey?: string;
  searchPlaceholder?: string;
  filterSlot?: ReactNode;
  renderBulkActions?: (selectedRows: TData[]) => ReactNode;
  initialPageSize?: number;
}

export function DataTable<TData, TValue>({
  columns,
  data,
  searchKey,
  searchPlaceholder = "Search records...",
  filterSlot,
  renderBulkActions,
  initialPageSize = 20,
}: DataTableProps<TData, TValue>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({});
  const [rowSelection, setRowSelection] = useState({});
  const [globalFilter, setGlobalFilter] = useState("");

  const table = useReactTable({
    data,
    columns,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
      rowSelection,
      globalFilter,
    },
    initialState: {
      pagination: {
        pageSize: initialPageSize,
      },
    },
    enableRowSelection: true,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    onRowSelectionChange: setRowSelection,
    onGlobalFilterChange: setGlobalFilter,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
  });

  const selectedRows = table
    .getSelectedRowModel()
    .rows.map((row) => row.original);

  return (
    <div className="space-y-4">
      {/* Search & Filter Toolbar */}
      {(searchKey || filterSlot) && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          {searchKey ? (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                value={
                  (table.getColumn(searchKey)?.getFilterValue() as string) ?? ""
                }
                onChange={(event) =>
                  table.getColumn(searchKey)?.setFilterValue(event.target.value)
                }
                className="pl-9 h-10 text-xs border-[#D9DEEC] focus-visible:ring-[#184098] bg-white"
              />
            </div>
          ) : (
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
              <Input
                placeholder={searchPlaceholder}
                value={globalFilter ?? ""}
                onChange={(e) => setGlobalFilter(e.target.value)}
                className="pl-9 h-10 text-xs border-[#D9DEEC] focus-visible:ring-[#184098] bg-white"
              />
            </div>
          )}

          {filterSlot && (
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              {filterSlot}
            </div>
          )}
        </div>
      )}

      {/* Floating Bulk Action Bar if rows selected */}
      {selectedRows.length > 0 && renderBulkActions && (
        <div className="sticky top-2 z-20 flex items-center justify-between p-3 bg-[#184098] text-white rounded-lg shadow-lg text-xs animate-in fade-in slide-in-from-top-2">
          <span className="font-bold">
            {selectedRows.length} item{selectedRows.length === 1 ? "" : "s"}{" "}
            selected
          </span>
          <div className="flex items-center gap-2">
            {renderBulkActions(selectedRows)}
          </div>
        </div>
      )}

      {/* Table Container */}
      <Card className="border-[#D9DEEC] bg-white rounded-lg shadow-xs overflow-visible">
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow
                  key={headerGroup.id}
                  className="bg-[#FAFBFF] border-b border-[#D9DEEC]"
                >
                  {headerGroup.headers.map((header) => (
                    <TableHead
                      key={header.id}
                      className="py-3 px-3.5 text-xs text-[#151B2E]"
                    >
                      {header.isPlaceholder
                        ? null
                        : flexRender(
                            header.column.columnDef.header,
                            header.getContext(),
                          )}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow
                    key={row.id}
                    data-state={row.getIsSelected() && "selected"}
                    className="hover:bg-[#FAFBFF] transition-colors border-b border-[#D9DEEC]/60 data-[state=selected]:bg-[#EEF2FA]/60"
                  >
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id} className="py-3 px-3.5 text-xs">
                        {flexRender(
                          cell.column.columnDef.cell,
                          cell.getContext(),
                        )}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell
                    colSpan={columns.length}
                    className="h-32 text-center text-xs text-muted-foreground"
                  >
                    No records found matching your criteria.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* Pagination Bar */}
        <DataTablePagination table={table} />
      </Card>
    </div>
  );
}
