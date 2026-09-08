"use client";

import { Toaster as Sonner, type ToasterProps } from "sonner";

export function Toaster({ ...props }: ToasterProps) {
  return (
    <Sonner
      theme="light"
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white group-[.toaster]:text-[#151B2E] group-[.toaster]:border-[#D9DEEC] group-[.toaster]:shadow-xl group-[.toaster]:rounded-xl font-sans text-sm",
          description: "group-[.toast]:text-muted-foreground text-xs",
          actionButton:
            "group-[.toast]:bg-[#184098] group-[.toast]:text-white font-medium",
          cancelButton:
            "group-[.toast]:bg-[#EEF2FA] group-[.toast]:text-[#184098]",
          success:
            "group-[.toast]:border-emerald-200 group-[.toast]:text-emerald-950 group-[.toast]:bg-emerald-50/40",
          error:
            "group-[.toast]:border-rose-200 group-[.toast]:text-rose-950 group-[.toast]:bg-rose-50/40",
          info: "group-[.toast]:border-blue-200 group-[.toast]:text-blue-950 group-[.toast]:bg-blue-50/40",
          warning:
            "group-[.toast]:border-amber-200 group-[.toast]:text-amber-950 group-[.toast]:bg-amber-50/40",
        },
      }}
      richColors
      closeButton
      position="top-right"
      {...props}
    />
  );
}

export { toast } from "sonner";
