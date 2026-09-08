"use client";

import type { ColumnDef } from "@tanstack/react-table";
import Link from "next/link";
import { DataTable } from "@/components/admin/data-table/data-table";
import { DataTableColumnHeader } from "@/components/admin/data-table/data-table-column-header";
import { Badge } from "@/components/ui/badge";
import { PostActionsMenu } from "./post-actions-menu";

export interface PostRowData {
  id: string;
  title: string;
  slug: string;
  status: "draft" | "in_review" | "published" | "archived";
  publishedAt: Date | string | null;
  createdAt: Date | string;
  category: {
    id: string;
    name: string;
    slug: string;
  } | null;
  author: {
    name: string | null;
  } | null;
}

interface PostsTableProps {
  posts: PostRowData[];
}

export function PostsTable({ posts }: PostsTableProps) {
  const columns: ColumnDef<PostRowData>[] = [
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
          <div className="text-right">
            <PostActionsMenu
              postId={post.id}
              postTitle={post.title}
              postSlug={post.slug}
              isPublished={post.status === "published"}
            />
          </div>
        );
      },
    },
  ];

  return (
    <DataTable
      columns={columns}
      data={posts}
      searchKey="title"
      searchPlaceholder="Search articles..."
    />
  );
}
