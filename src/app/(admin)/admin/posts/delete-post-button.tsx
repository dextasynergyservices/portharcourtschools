"use client";

import { Loader2, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { deletePostAction } from "./actions";

interface DeletePostButtonProps {
  postId: string;
  postTitle: string;
}

export function DeletePostButton({ postId, postTitle }: DeletePostButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [confirming, setConfirming] = useState(false);

  const handleDelete = () => {
    if (!confirming) {
      setConfirming(true);
      return;
    }

    startTransition(async () => {
      const res = await deletePostAction(postId);
      if (res.error) {
        toast.error(res.error || "Failed to delete post.");
        setConfirming(false);
      } else {
        toast.success("Post deleted successfully.");
        router.refresh();
      }
    });
  };

  return (
    <div className="inline-flex items-center gap-1">
      {confirming ? (
        <>
          <Button
            size="xs"
            variant="destructive"
            disabled={isPending}
            onClick={handleDelete}
            className="h-7 text-[11px] px-2 font-bold"
          >
            {isPending ? (
              <Loader2 className="size-3 animate-spin" />
            ) : (
              "Confirm"
            )}
          </Button>
          <Button
            size="xs"
            variant="outline"
            disabled={isPending}
            onClick={() => setConfirming(false)}
            className="h-7 text-[11px] px-2 border-[#D9DEEC]"
          >
            Cancel
          </Button>
        </>
      ) : (
        <Button
          size="xs"
          variant="ghost"
          onClick={handleDelete}
          className="size-7 p-0 text-muted-foreground hover:text-[#C0392B]"
          title={`Delete "${postTitle}"`}
        >
          <Trash2 className="size-3.5" />
        </Button>
      )}
    </div>
  );
}
