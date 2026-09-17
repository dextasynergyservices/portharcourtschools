"use client";

import {
  AlertTriangle,
  CheckCircle2,
  Info,
  Loader2,
  Trash2,
} from "lucide-react";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

export interface ConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: ReactNode;
  confirmLabel?: string;
  confirmText?: string;
  cancelLabel?: string;
  variant?: "destructive" | "warning" | "default" | "success";
  isLoading?: boolean;
  onConfirm: () => void | Promise<void>;
}

export function ConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  confirmText,
  cancelLabel = "Cancel",
  variant = "destructive",
  isLoading = false,
  onConfirm,
}: ConfirmDialogProps) {
  const effectiveConfirmLabel = confirmLabel || confirmText || "Confirm";
  const getIcon = () => {
    switch (variant) {
      case "destructive":
        return (
          <div className="flex size-10 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-950/50 dark:text-red-400 shrink-0">
            <Trash2 className="size-5" />
          </div>
        );
      case "warning":
        return (
          <div className="flex size-10 items-center justify-center rounded-full bg-amber-100 text-amber-600 dark:bg-amber-950/50 dark:text-amber-400 shrink-0">
            <AlertTriangle className="size-5" />
          </div>
        );
      case "success":
        return (
          <div className="flex size-10 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-950/50 dark:text-emerald-400 shrink-0">
            <CheckCircle2 className="size-5" />
          </div>
        );
      default:
        return (
          <div className="flex size-10 items-center justify-center rounded-full bg-blue-100 text-[#184098] dark:bg-blue-950/50 dark:text-blue-400 shrink-0">
            <Info className="size-5" />
          </div>
        );
    }
  };

  const getConfirmButtonClass = () => {
    switch (variant) {
      case "destructive":
        return "bg-red-600 hover:bg-red-700 text-white font-bold";
      case "warning":
        return "bg-amber-600 hover:bg-amber-700 text-white font-bold";
      case "success":
        return "bg-emerald-600 hover:bg-emerald-700 text-white font-bold";
      default:
        return "bg-[#184098] hover:bg-[#123075] text-white font-bold";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="gap-3 sm:gap-4">
          <div className="flex items-start gap-3">
            {getIcon()}
            <div className="space-y-1 text-left">
              <DialogTitle className="text-base sm:text-lg font-bold text-[#151B2E]">
                {title}
              </DialogTitle>
              <DialogDescription className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
                {description}
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <DialogFooter className="mt-4 flex-row justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            disabled={isLoading}
            onClick={() => onOpenChange(false)}
            className="h-9 text-xs border-[#D9DEEC] font-semibold"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            disabled={isLoading}
            onClick={async () => {
              await onConfirm();
            }}
            className={`h-9 text-xs font-bold ${getConfirmButtonClass()}`}
          >
            {isLoading && <Loader2 className="mr-1.5 size-3.5 animate-spin" />}
            {effectiveConfirmLabel}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
