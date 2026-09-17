"use client";

import { Download } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";

interface ExportRegistrationsButtonProps {
  registrations: Array<{
    id: string;
    fullName: string;
    email: string;
    phone: string;
    schoolName: string | null;
    role: string;
    ticketQuantity: number;
    totalAmount: string | number;
    status: string;
    createdAt: Date | string;
    ticketTierName?: string;
    notes?: string | null;
    eventTitle?: string;
  }>;
  filenamePrefix?: string;
  eventTitle?: string;
  className?: string;
}

export function ExportRegistrationsButton({
  registrations,
  filenamePrefix = "event-registrations",
  eventTitle,
  className,
}: ExportRegistrationsButtonProps) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = () => {
    if (!registrations || registrations.length === 0) {
      toast.error("No registrations available to export.");
      return;
    }

    setIsExporting(true);

    try {
      // Define CSV headers
      const headers = [
        "Registration ID",
        "Event Title",
        "Full Name",
        "Email Address",
        "Phone / WhatsApp",
        "School / Institution",
        "Role / Designation",
        "Ticket Tier",
        "Tickets",
        "Total Amount (NGN)",
        "Payment Status",
        "Registration Date",
        "Notes / Special Requests",
      ];

      // Format rows
      const rows = registrations.map((reg) => {
        const dateStr = new Date(reg.createdAt).toISOString();
        const roleStr = reg.role.replace(/_/g, " ").toUpperCase();
        const statusStr = reg.status.replace(/_/g, " ").toUpperCase();
        const currentEventTitle = reg.eventTitle || eventTitle || "N/A";

        return [
          reg.id,
          currentEventTitle,
          reg.fullName,
          reg.email,
          reg.phone,
          reg.schoolName || "Independent",
          roleStr,
          reg.ticketTierName || "Standard",
          reg.ticketQuantity,
          reg.totalAmount,
          statusStr,
          dateStr,
          reg.notes || "",
        ];
      });

      // Escape quotes and wrap values in quotes
      const csvContent = [
        headers.join(","),
        ...rows.map((row) =>
          row
            .map((val) => {
              const escaped = String(val ?? "").replace(/"/g, '""');
              return `"${escaped}"`;
            })
            .join(","),
        ),
      ].join("\r\n");

      // Create Blob with UTF-8 BOM so Excel opens it with proper accents and formatting
      const blob = new Blob([`\uFEFF${csvContent}`], {
        type: "text/csv;charset=utf-8;",
      });

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      const dateTag = new Date().toISOString().split("T")[0];
      const cleanPrefix = filenamePrefix
        .toLowerCase()
        .replace(/[^a-z0-9_-]/g, "-")
        .replace(/-+/g, "-");

      link.setAttribute("href", url);
      link.setAttribute("download", `${cleanPrefix}-${dateTag}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Export failed:", err);
      toast.error("Failed to export registrations. Please try again.");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Button
      type="button"
      onClick={handleExport}
      disabled={isExporting || registrations.length === 0}
      variant="outline"
      size="sm"
      className={
        className ||
        "h-9 text-xs font-semibold border-[#D9DEEC] text-[#151B2E] hover:bg-[#EEF2FA] hover:text-[#184098] transition-colors"
      }
    >
      <Download className="size-3.5 mr-1.5 text-[#184098]" />
      <span>{isExporting ? "Exporting..." : "Export to CSV"}</span>
    </Button>
  );
}
