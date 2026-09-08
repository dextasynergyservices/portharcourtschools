"use client";

import { Menu } from "@base-ui/react/menu";
import {
  Edit,
  ExternalLink,
  Loader2,
  MoreVertical,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { deletePostAction } from "./actions";

interface PostActionsMenuProps {
  postId: string;
  postTitle: string;
  postSlug: string;
  isPublished: boolean;
}

export function PostActionsMenu({
  postId,
  postTitle,
  postSlug,
  isPublished,
}: PostActionsMenuProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deletePostAction(postId);
      if (res.error) {
        setError(res.error);
        toast.error("Failed to delete post", { description: res.error });
      } else {
        setDeleteDialogOpen(false);
        toast.success("Post deleted successfully");
        router.refresh();
      }
    });
  };

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-[4px] text-muted-foreground hover:text-[#184098] hover:bg-[#EEF2FA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#184098]/30"
          aria-label="Article actions"
        >
          <MoreVertical className="size-4" />
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner
            side="bottom"
            align="end"
            sideOffset={4}
            className="z-50"
          >
            <Menu.Popup className="min-w-[170px] rounded-md border border-[#D9DEEC] bg-white p-1.5 shadow-xl text-xs outline-none animate-in fade-in zoom-in-95">
              {isPublished && (
                <Menu.Item
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                  onClick={() => window.open(`/blog/${postSlug}`, "_blank")}
                >
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                  <span>View Live</span>
                </Menu.Item>
              )}

              <Menu.Item
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                onClick={() => router.push(`/admin/posts/${postId}/edit`)}
              >
                <Edit className="size-3.5 text-muted-foreground" />
                <span>Edit Article</span>
              </Menu.Item>

              <Menu.Separator className="my-1 h-px bg-[#D9DEEC]" />

              <Menu.Item
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-red-600 hover:bg-red-50 cursor-pointer outline-none select-none transition-colors font-medium"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-3.5 text-red-600" />
                <span>Delete Article</span>
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* Confirmation Modal Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto sm:mx-0 flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
              <Trash2 className="size-5" />
            </div>
            <DialogTitle className="text-base sm:text-lg">
              Delete Article
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-[#151B2E]">
                &ldquo;{postTitle}&rdquo;
              </span>
              ? This action cannot be undone and will permanently remove this
              post and its revisions from the database.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <div className="rounded-md bg-red-50 border border-red-200 p-2.5 text-xs text-red-600 font-medium">
              {error}
            </div>
          )}

          <DialogFooter className="mt-2 sm:mt-4">
            <Button
              type="button"
              variant="outline"
              disabled={isPending}
              onClick={() => setDeleteDialogOpen(false)}
              className="h-9 text-xs border-[#D9DEEC]"
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="destructive"
              disabled={isPending}
              onClick={handleDelete}
              className="h-9 text-xs font-bold"
            >
              {isPending ? (
                <>
                  <Loader2 className="size-3.5 mr-1.5 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete Article"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
