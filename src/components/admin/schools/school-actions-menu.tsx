"use client";

import { Menu } from "@base-ui/react/menu";
import {
  CheckCircle,
  Edit,
  ExternalLink,
  Loader2,
  MoreVertical,
  Star,
  Trash2,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  deleteSchoolAction,
  toggleSchoolFeaturedAction,
  toggleSchoolVerifiedAction,
} from "@/app/(admin)/admin/schools/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

interface SchoolActionsMenuProps {
  schoolId: string;
  schoolName: string;
  schoolSlug: string;
  isPublished: boolean;
  isVerified: boolean;
  isFeatured: boolean;
}

export function SchoolActionsMenu({
  schoolId,
  schoolName,
  schoolSlug,
  isPublished,
  isVerified,
  isFeatured,
}: SchoolActionsMenuProps) {
  const router = useRouter();
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    startTransition(async () => {
      const res = await deleteSchoolAction(schoolId);
      if (res.error) {
        setError(res.error);
        toast.error("Failed to delete school", { description: res.error });
      } else {
        setDeleteDialogOpen(false);
        toast.success("School listing deleted");
        router.refresh();
      }
    });
  };

  const handleToggleVerified = () => {
    startTransition(async () => {
      await toggleSchoolVerifiedAction(schoolId, !isVerified);
      toast.success(
        !isVerified
          ? `${schoolName} marked as Verified`
          : `Verification badge removed from ${schoolName}`,
      );
      router.refresh();
    });
  };

  const handleToggleFeatured = () => {
    startTransition(async () => {
      await toggleSchoolFeaturedAction(schoolId, !isFeatured);
      toast.success(
        !isFeatured
          ? `${schoolName} marked as Featured`
          : `${schoolName} removed from Featured`,
      );
      router.refresh();
    });
  };

  return (
    <>
      <Menu.Root>
        <Menu.Trigger
          type="button"
          className="inline-flex size-8 items-center justify-center rounded-[4px] text-muted-foreground hover:text-[#184098] hover:bg-[#EEF2FA] transition-colors focus:outline-none focus:ring-2 focus:ring-[#184098]/30"
          aria-label="School actions"
        >
          {isPending ? (
            <Loader2 className="size-4 animate-spin text-[#184098]" />
          ) : (
            <MoreVertical className="size-4" />
          )}
        </Menu.Trigger>

        <Menu.Portal>
          <Menu.Positioner
            side="bottom"
            align="end"
            sideOffset={4}
            className="z-50"
          >
            <Menu.Popup className="min-w-[180px] rounded-md border border-[#D9DEEC] bg-white p-1.5 shadow-xl text-xs outline-none animate-in fade-in zoom-in-95">
              {isPublished && (
                <Menu.Item
                  className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                  onClick={() =>
                    window.open(`/schools/${schoolSlug}`, "_blank")
                  }
                >
                  <ExternalLink className="size-3.5 text-muted-foreground" />
                  <span>View Live Profile</span>
                </Menu.Item>
              )}

              <Menu.Item
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                onClick={() => router.push(`/admin/schools/${schoolId}/edit`)}
              >
                <Edit className="size-3.5 text-muted-foreground" />
                <span>Edit Profile</span>
              </Menu.Item>

              <Menu.Separator className="my-1 h-px bg-[#D9DEEC]" />

              <Menu.Item
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                onClick={handleToggleVerified}
              >
                <CheckCircle
                  className={`size-3.5 ${isVerified ? "text-emerald-600" : "text-muted-foreground"}`}
                />
                <span>
                  {isVerified ? "Unmark Verified" : "Mark as Verified"}
                </span>
              </Menu.Item>

              <Menu.Item
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] cursor-pointer outline-none select-none transition-colors"
                onClick={handleToggleFeatured}
              >
                <Star
                  className={`size-3.5 ${isFeatured ? "text-amber-500 fill-amber-500" : "text-muted-foreground"}`}
                />
                <span>
                  {isFeatured ? "Remove Featured" : "Feature on Directory"}
                </span>
              </Menu.Item>

              <Menu.Separator className="my-1 h-px bg-[#D9DEEC]" />

              <Menu.Item
                className="flex items-center gap-2.5 px-2.5 py-2 rounded text-red-600 hover:bg-red-50 cursor-pointer outline-none select-none transition-colors font-medium"
                onClick={() => setDeleteDialogOpen(true)}
              >
                <Trash2 className="size-3.5 text-red-600" />
                <span>Delete School</span>
              </Menu.Item>
            </Menu.Popup>
          </Menu.Positioner>
        </Menu.Portal>
      </Menu.Root>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="mx-auto sm:mx-0 flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 mb-2">
              <Trash2 className="size-5" />
            </div>
            <DialogTitle className="text-base sm:text-lg">
              Delete School Profile
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground leading-relaxed pt-1">
              Are you sure you want to permanently delete{" "}
              <span className="font-semibold text-[#151B2E]">
                &ldquo;{schoolName}&rdquo;
              </span>
              ? This action will remove all listings, images, and reviews
              associated with this school.
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
                "Delete School"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
