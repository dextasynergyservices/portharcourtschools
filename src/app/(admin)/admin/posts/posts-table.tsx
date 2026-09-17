"use client";

import type { ColumnDef } from "@tanstack/react-table";
import {
  Archive,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  FileEdit,
  GripVertical,
  ListOrdered,
  RotateCcw,
  Save,
  Table as TableIcon,
  Trash2,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { type ReactNode, useState } from "react";
import { toast } from "sonner";
import { ConfirmDialog } from "@/components/admin/confirm-dialog";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  bulkDeletePostsAction,
  bulkUpdatePostsStatusAction,
  reorderPostsAction,
} from "./actions";
import { PostActionsMenu } from "./post-actions-menu";

export interface PostRowData {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "in_review" | "published" | "archived";
  sortOrder?: number;
  publishedAt: Date | string | null;
  createdAt: Date | string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    id: string;
    name: string | null;
  } | null;
}

interface PostsTableProps {
  posts: PostRowData[];
}

export function PostsTable({ posts }: PostsTableProps) {
  const router = useRouter();
  const [items, setItems] = useState<PostRowData[]>(posts);
  const [viewMode, setViewMode] = useState<"table" | "reorder">("table");
  const [isSaving, setIsSaving] = useState(false);
  const [isBulkPending, setIsBulkPending] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  // Professional Confirmation Dialog State
  const [confirmDialog, setConfirmDialog] = useState<{
    open: boolean;
    title: string;
    description: ReactNode;
    confirmLabel?: string;
    cancelLabel?: string;
    variant?: "destructive" | "warning" | "default" | "success";
    isLoading?: boolean;
    onConfirm: () => Promise<void> | void;
  }>({
    open: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const hasChanges = items.some(
    (item, index) => (item.sortOrder ?? index) !== index,
  );

  const moveItem = (fromIdx: number, toIdx: number) => {
    if (toIdx < 0 || toIdx >= items.length) return;
    const reordered = [...items];
    const [moved] = reordered.splice(fromIdx, 1);
    reordered.splice(toIdx, 0, moved);
    const updated = reordered.map((item, index) => ({
      ...item,
      sortOrder: index,
    }));
    setItems(updated);
  };

  const handleReset = () => {
    setItems(posts);
  };

  const handleSaveOrder = async () => {
    setIsSaving(true);
    try {
      const orderedIds = items.map((item) => item.id);
      const res = await reorderPostsAction(orderedIds);
      if (res.success) {
        toast.success("Post display order saved successfully.");
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update post order.");
      }
    } catch {
      toast.error("Failed to update post order.");
    } finally {
      setIsSaving(false);
    }
  };

  const executeBulkStatus = async (
    selectedRows: PostRowData[],
    newStatus: "draft" | "in_review" | "published" | "archived",
    clearSelection: () => void,
  ) => {
    setIsBulkPending(true);
    try {
      const ids = selectedRows.map((p) => p.id);
      const res = await bulkUpdatePostsStatusAction(ids, newStatus);
      if (res.success) {
        toast.success(
          `Successfully updated ${res.count} article(s) to ${newStatus}.`,
        );
        setItems((prev) =>
          prev.map((p) =>
            ids.includes(p.id) ? { ...p, status: newStatus } : p,
          ),
        );
        clearSelection();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to update articles.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleBulkStatus = (
    selectedRows: PostRowData[],
    newStatus: "draft" | "in_review" | "published" | "archived",
    clearSelection: () => void,
  ) => {
    if (newStatus === "archived") {
      setConfirmDialog({
        open: true,
        title: `Archive ${selectedRows.length} Article${selectedRows.length === 1 ? "" : "s"}`,
        variant: "warning",
        confirmLabel: "Archive Articles",
        description: (
          <>
            Are you sure you want to archive{" "}
            <strong className="text-[#151B2E]">{selectedRows.length}</strong>{" "}
            selected article{selectedRows.length === 1 ? "" : "s"}? They will be
            hidden from the live public blog.
          </>
        ),
        onConfirm: async () => {
          setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
          try {
            await executeBulkStatus(selectedRows, "archived", clearSelection);
            setConfirmDialog((prev) => ({ ...prev, open: false }));
          } finally {
            setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
          }
        },
      });
      return;
    }

    executeBulkStatus(selectedRows, newStatus, clearSelection);
  };

  const executeBulkDelete = async (
    selectedRows: PostRowData[],
    clearSelection: () => void,
  ) => {
    setIsBulkPending(true);
    try {
      const ids = selectedRows.map((p) => p.id);
      const res = await bulkDeletePostsAction(ids);
      if (res.success) {
        toast.success(`Successfully deleted ${res.count} article(s).`);
        setItems((prev) => prev.filter((p) => !ids.includes(p.id)));
        clearSelection();
        router.refresh();
      } else {
        toast.error(res.error || "Failed to delete articles.");
      }
    } catch {
      toast.error("An unexpected error occurred.");
    } finally {
      setIsBulkPending(false);
    }
  };

  const handleBulkDelete = (
    selectedRows: PostRowData[],
    clearSelection: () => void,
  ) => {
    setConfirmDialog({
      open: true,
      title: `Permanently Delete ${selectedRows.length} Article${selectedRows.length === 1 ? "" : "s"}`,
      variant: "destructive",
      confirmLabel: "Delete Articles Permanently",
      description: (
        <>
          Are you sure you want to permanently delete{" "}
          <strong className="text-[#151B2E]">{selectedRows.length}</strong>{" "}
          selected article{selectedRows.length === 1 ? "" : "s"}? Their contents
          and media links will be completely removed. This action cannot be
          undone.
        </>
      ),
      onConfirm: async () => {
        setConfirmDialog((prev) => ({ ...prev, isLoading: true }));
        try {
          await executeBulkDelete(selectedRows, clearSelection);
          setConfirmDialog((prev) => ({ ...prev, open: false }));
        } finally {
          setConfirmDialog((prev) => ({ ...prev, isLoading: false }));
        }
      },
    });
  };

  const columns: ColumnDef<PostRowData>[] = [
    {
      id: "select",
      header: ({ table }) => (
        <input
          type="checkbox"
          checked={table.getIsAllPageRowsSelected()}
          onChange={(e) => table.toggleAllPageRowsSelected(!!e.target.checked)}
          aria-label="Select all"
          className="size-3.5 accent-[#184098] rounded cursor-pointer"
        />
      ),
      cell: ({ row }) => (
        <input
          type="checkbox"
          checked={row.getIsSelected()}
          onChange={(e) => row.toggleSelected(!!e.target.checked)}
          aria-label="Select row"
          className="size-3.5 accent-[#184098] rounded cursor-pointer"
        />
      ),
      enableSorting: false,
      enableHiding: false,
    },
    {
      id: "rank",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="#" />
      ),
      cell: ({ row }) => {
        const idx = row.index + 1;
        return (
          <span
            className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
              idx === 1
                ? "bg-amber-100 text-amber-900 border border-amber-300"
                : "text-muted-foreground bg-muted"
            }`}
          >
            #{idx}
          </span>
        );
      },
    },
    {
      accessorKey: "title",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Article Title" />
      ),
      cell: ({ row }) => {
        const post = row.original;
        return (
          <div className="max-w-[280px] lg:max-w-md">
            <Link
              href={`/admin/posts/${post.id}/edit`}
              title={post.title}
              className="font-bold text-sm text-[#184098] hover:underline block truncate leading-snug"
            >
              {post.title}
            </Link>
            <span
              title={`/blog/${post.slug}`}
              className="font-mono text-[11px] text-muted-foreground block truncate mt-0.5"
            >
              /blog/{post.slug}
            </span>
          </div>
        );
      },
    },
    {
      id: "category",
      accessorFn: (row) => row.category?.name || "Uncategorized",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Category" />
      ),
      cell: ({ row }) => {
        const category = row.original.category;
        return category ? (
          <Badge
            variant="outline"
            className="text-[10px] bg-[#EEF2FA] text-[#184098] border-[#D9DEEC] font-semibold"
          >
            {category.name}
          </Badge>
        ) : (
          <span className="text-xs text-muted-foreground italic">
            Uncategorized
          </span>
        );
      },
    },
    {
      id: "author",
      accessorFn: (row) => row.author?.name || "Editorial Staff",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Author" />
      ),
      cell: ({ row }) => (
        <span className="text-xs text-[#151B2E] font-medium">
          {row.original.author?.name || "Editorial Staff"}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Status" />
      ),
      cell: ({ row }) => {
        const status = row.original.status;
        return (
          <Badge
            variant={
              status === "published"
                ? "success"
                : status === "in_review"
                  ? "amber"
                  : "outline"
            }
            className="text-[10px] uppercase font-bold"
          >
            {status.replace("_", " ")}
          </Badge>
        );
      },
      filterFn: (row, id, value) => {
        return value.includes(row.getValue(id));
      },
    },
    {
      id: "date",
      accessorFn: (row) => row.publishedAt || row.createdAt,
      header: ({ column }) => (
        <DataTableColumnHeader column={column} title="Date" />
      ),
      cell: ({ row }) => {
        const post = row.original;
        const dateVal = post.publishedAt || post.createdAt;
        return (
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {new Date(dateVal).toLocaleDateString("en-GB", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })}
          </span>
        );
      },
    },
    {
      id: "actions",
      cell: ({ row }) => {
        const post = row.original;
        return (
          <PostActionsMenu
            postId={post.id}
            postTitle={post.title}
            postSlug={post.slug}
            isPublished={post.status === "published"}
          />
        );
      },
    },
  ];

  return (
    <div className="space-y-4">
      {/* Top Bar with Mode Switcher & Reorder Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg border border-[#D9DEEC] bg-white shadow-xs">
        <div className="flex items-center gap-2">
          <div className="inline-flex rounded-md bg-[#F5F4F0] p-1 border border-[#D9DEEC]">
            <button
              type="button"
              onClick={() => setViewMode("table")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                viewMode === "table"
                  ? "bg-white text-[#184098] shadow-xs"
                  : "text-[#55627D] hover:text-[#151B2E]"
              }`}
            >
              <TableIcon className="size-3.5" />
              Table View
            </button>
            <button
              type="button"
              onClick={() => setViewMode("reorder")}
              className={`flex items-center gap-1.5 px-3 py-1 text-xs font-bold rounded cursor-pointer transition-colors ${
                viewMode === "reorder"
                  ? "bg-[#184098] text-white shadow-xs"
                  : "text-[#55627D] hover:text-[#184098]"
              }`}
            >
              <ListOrdered className="size-3.5" />
              Drag & Reorder
            </button>
          </div>
          <span className="text-xs text-muted-foreground hidden lg:inline">
            {viewMode === "reorder"
              ? "Drag cards to change featured order on blog & homepage"
              : `${items.length} articles`}
          </span>
        </div>

        {viewMode === "reorder" && (
          <div className="flex items-center gap-2">
            {hasChanges && (
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleReset}
                disabled={isSaving}
                className="h-8 text-xs font-semibold border-[#D9DEEC] text-muted-foreground"
              >
                <RotateCcw className="size-3.5 mr-1" />
                Reset
              </Button>
            )}
            <Button
              type="button"
              size="sm"
              onClick={handleSaveOrder}
              disabled={isSaving || !hasChanges}
              className="h-8 text-xs font-bold bg-[#184098] hover:bg-[#15327A] text-white shadow-xs"
            >
              <Save className="size-3.5 mr-1.5" />
              {isSaving ? "Saving Order..." : "Save New Order"}
            </Button>
          </div>
        )}
      </div>

      {viewMode === "table" ? (
        <DataTable
          columns={columns}
          data={items}
          searchKey="title"
          searchPlaceholder="Filter posts by title..."
          renderBulkActions={(selectedRows, { clearSelection }) => (
            <div className="flex items-center gap-2">
              <Button
                size="sm"
                variant="outline"
                disabled={isBulkPending}
                onClick={() =>
                  handleBulkStatus(selectedRows, "published", clearSelection)
                }
                className="h-8 text-xs bg-white text-[#184098] hover:bg-[#EEF2FA] border-none font-bold"
              >
                <CheckCircle2 className="size-3.5 mr-1 text-emerald-600" />
                Publish Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isBulkPending}
                onClick={() =>
                  handleBulkStatus(selectedRows, "draft", clearSelection)
                }
                className="h-8 text-xs bg-white/10 text-white hover:bg-white/20 border-white/20 font-semibold"
              >
                <FileEdit className="size-3.5 mr-1" />
                Move to Draft
              </Button>
              <Button
                size="sm"
                variant="outline"
                disabled={isBulkPending}
                onClick={() =>
                  handleBulkStatus(selectedRows, "archived", clearSelection)
                }
                className="h-8 text-xs bg-amber-500/20 text-amber-100 hover:bg-amber-500/30 border-amber-400/30 font-semibold"
              >
                <Archive className="size-3.5 mr-1" />
                Archive Selected
              </Button>
              <Button
                size="sm"
                variant="destructive"
                disabled={isBulkPending}
                onClick={() => handleBulkDelete(selectedRows, clearSelection)}
                className="h-8 text-xs font-bold"
              >
                <Trash2 className="size-3.5 mr-1" />
                Delete Selected
              </Button>
            </div>
          )}
        />
      ) : (
        <div className="space-y-2.5">
          <div className="p-3 bg-[#EEF2FA]/70 border border-[#184098]/20 rounded-lg text-xs text-[#184098] flex items-center justify-between">
            <span>
              💡 <strong>Tip:</strong> The <strong>#1 Story</strong> is
              highlighted as the <strong>Featured Story</strong> on the blog
              header and the first story on the homepage.
            </span>
            {hasChanges && (
              <span className="font-bold text-amber-700 bg-amber-100 px-2 py-0.5 rounded text-[11px]">
                Unsaved changes
              </span>
            )}
          </div>

          <div className="space-y-2">
            {items.map((post, index) => {
              const isFirst = index === 0;
              const isLast = index === items.length - 1;
              const isBeingDragged = draggedIdx === index;

              return (
                // biome-ignore lint/a11y/noStaticElementInteractions: drag and drop item
                <div
                  key={post.id}
                  draggable
                  onDragStart={(e) => {
                    setDraggedIdx(index);
                    e.dataTransfer.effectAllowed = "move";
                  }}
                  onDragOver={(e) => {
                    e.preventDefault();
                    e.dataTransfer.dropEffect = "move";
                  }}
                  onDrop={(e) => {
                    e.preventDefault();
                    if (draggedIdx !== null && draggedIdx !== index) {
                      moveItem(draggedIdx, index);
                    }
                    setDraggedIdx(null);
                  }}
                  onDragEnd={() => setDraggedIdx(null)}
                  className={`flex items-center gap-3 p-3.5 rounded-lg border bg-white shadow-xs transition-all select-none ${
                    isBeingDragged
                      ? "opacity-40 border-dashed border-[#184098] scale-[0.99]"
                      : isFirst
                        ? "border-amber-300 bg-amber-50/20 hover:border-amber-400"
                        : "border-[#D9DEEC] hover:border-[#184098]/40 hover:shadow-sm"
                  }`}
                >
                  {/* Drag Handle */}
                  <div
                    title="Drag to reposition"
                    className="p-1 rounded text-[#8F9BB3] hover:text-[#184098] hover:bg-[#EEF2FA] cursor-grab active:cursor-grabbing shrink-0"
                  >
                    <GripVertical className="size-4" />
                  </div>

                  {/* Rank Badge */}
                  <div className="shrink-0">
                    <span
                      className={`font-mono text-xs font-black px-2.5 py-1 rounded-md block text-center min-w-[38px] ${
                        isFirst
                          ? "bg-amber-500 text-white shadow-xs"
                          : "bg-[#F5F4F0] text-[#151B2E] border border-[#D9DEEC]"
                      }`}
                    >
                      #{index + 1}
                    </span>
                  </div>

                  {/* Post Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-0.5">
                      {isFirst && (
                        <Badge className="bg-amber-500 hover:bg-amber-500 text-white text-[10px] font-bold">
                          Featured Top Story
                        </Badge>
                      )}
                      {post.category && (
                        <Badge
                          variant="outline"
                          className="text-[10px] bg-[#EEF2FA] text-[#184098] border-[#D9DEEC] font-semibold"
                        >
                          {post.category.name}
                        </Badge>
                      )}
                      <Badge
                        variant={
                          post.status === "published"
                            ? "success"
                            : post.status === "in_review"
                              ? "amber"
                              : "outline"
                        }
                        className="text-[10px] uppercase font-bold"
                      >
                        {post.status.replace("_", " ")}
                      </Badge>
                    </div>
                    <p className="font-bold text-sm text-[#151B2E] truncate">
                      {post.title}
                    </p>
                    <p className="text-[11px] font-mono text-muted-foreground truncate">
                      /blog/{post.slug}
                    </p>
                  </div>

                  {/* Move Up / Move Down Buttons */}
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      type="button"
                      onClick={() => moveItem(index, index - 1)}
                      disabled={isFirst}
                      title="Move up"
                      className="p-1.5 rounded text-[#55627D] hover:text-[#184098] hover:bg-[#EEF2FA] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                    >
                      <ChevronUp className="size-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveItem(index, index + 1)}
                      disabled={isLast}
                      title="Move down"
                      className="p-1.5 rounded text-[#55627D] hover:text-[#184098] hover:bg-[#EEF2FA] disabled:opacity-30 disabled:pointer-events-none cursor-pointer transition-colors"
                    >
                      <ChevronDown className="size-4" />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      <ConfirmDialog
        open={confirmDialog.open}
        onOpenChange={(open) => setConfirmDialog((prev) => ({ ...prev, open }))}
        title={confirmDialog.title}
        description={confirmDialog.description}
        variant={confirmDialog.variant}
        confirmLabel={confirmDialog.confirmLabel}
        cancelLabel={confirmDialog.cancelLabel}
        isLoading={confirmDialog.isLoading}
        onConfirm={confirmDialog.onConfirm}
      />
    </div>
  );
}
