"use client";

import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Calendar,
  Check,
  ChevronDown,
  Eye,
  FolderTree,
  Globe,
  Loader2,
  Monitor,
  RotateCcw,
  Share2,
  Smartphone,
  Tablet,
  TrendingUp,
  Users,
  X,
} from "lucide-react";
import { useId, useState, useTransition } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import type {
  AnalyticsFilterParams,
  AnalyticsPeriodPreset,
  AnalyticsSummary,
} from "@/lib/analytics";

interface AnalyticsDashboardSectionProps {
  initialData: AnalyticsSummary;
}

const PERIOD_OPTIONS: Array<{ value: AnalyticsPeriodPreset; label: string }> = [
  { value: "30d", label: "Last 30 Days (Default)" },
  { value: "7d", label: "Last 7 Days" },
  { value: "today", label: "Today (Live 24h)" },
  { value: "yesterday", label: "Yesterday" },
  { value: "90d", label: "Last 90 Days" },
  { value: "custom", label: "Custom Date Range..." },
];

const SECTION_OPTIONS = [
  { value: "all", label: "All Sections" },
  { value: "/", label: "Frontpage (/)" },
  { value: "/schools", label: "Schools Directory (/schools)" },
  { value: "/events", label: "Events & Programmes (/events)" },
  { value: "/blog", label: "Editorial Blog (/blog)" },
];

const DEVICE_OPTIONS = [
  { value: "all", label: "All Devices" },
  { value: "mobile", label: "Mobile Only" },
  { value: "desktop", label: "Desktop Only" },
  { value: "tablet", label: "Tablet Only" },
];

const CHANNEL_OPTIONS = [
  { value: "all", label: "All Traffic Sources" },
  { value: "Direct", label: "Direct Traffic" },
  { value: "WhatsApp", label: "WhatsApp" },
  { value: "Google", label: "Google Search" },
  { value: "Facebook", label: "Facebook" },
  { value: "Instagram", label: "Instagram" },
  { value: "Twitter / X", label: "Twitter / X" },
  { value: "LinkedIn", label: "LinkedIn" },
  { value: "Other", label: "Other Referrers" },
];

export function AnalyticsDashboardSection({
  initialData,
}: AnalyticsDashboardSectionProps) {
  const [data, setData] = useState<AnalyticsSummary>(initialData);
  const [isPending, startTransition] = useTransition();

  // Active filter states
  const [period, setPeriod] = useState<AnalyticsPeriodPreset>(
    initialData.filters?.period || "30d",
  );
  const [customStart, setCustomStart] = useState<string>(
    initialData.filters?.startDate || "",
  );
  const [customEnd, setCustomEnd] = useState<string>(
    initialData.filters?.endDate || "",
  );
  const [showCustomPicker, setShowCustomPicker] = useState<boolean>(
    initialData.filters?.period === "custom",
  );
  const [device, setDevice] = useState<string>(
    initialData.filters?.device || "all",
  );
  const [channel, setChannel] = useState<string>(
    initialData.filters?.channel || "all",
  );
  const [section, setSection] = useState<string>(
    initialData.filters?.section || "all",
  );

  const [hoveredPoint, setHoveredPoint] = useState<{
    index: number;
    x: number;
    y: number;
    date: string;
    views: number;
    visitors: number;
  } | null>(null);

  const chartId = useId();

  // Fetch updated analytics when filters change
  const applyFilters = (overrides?: Partial<AnalyticsFilterParams>) => {
    const nextPeriod = overrides?.period ?? period;
    const nextStart = overrides?.startDate ?? customStart;
    const nextEnd = overrides?.endDate ?? customEnd;
    const nextDevice = overrides?.device ?? device;
    const nextChannel = overrides?.channel ?? channel;
    const nextSection = overrides?.section ?? section;

    const params = new URLSearchParams();
    params.set("period", nextPeriod);

    if (nextPeriod === "custom" && nextStart && nextEnd) {
      params.set("startDate", nextStart);
      params.set("endDate", nextEnd);
    }
    if (nextDevice && nextDevice !== "all") {
      params.set("device", nextDevice);
    }
    if (nextChannel && nextChannel !== "all") {
      params.set("channel", nextChannel);
    }
    if (nextSection && nextSection !== "all") {
      params.set("section", nextSection);
    }

    startTransition(async () => {
      try {
        const res = await fetch(`/api/admin/analytics?${params.toString()}`);
        if (res.ok) {
          const json = await res.json();
          setData(json);
        }
      } catch (err) {
        console.error("Failed to load filtered analytics:", err);
      }
    });
  };

  const handlePeriodChange = (newPeriod: AnalyticsPeriodPreset) => {
    setPeriod(newPeriod);
    if (newPeriod === "custom") {
      setShowCustomPicker(true);
      if (!customStart || !customEnd) {
        const today = new Date().toISOString().slice(0, 10);
        const prior = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          .toISOString()
          .slice(0, 10);
        setCustomStart(prior);
        setCustomEnd(today);
      }
    } else {
      setShowCustomPicker(false);
      applyFilters({ period: newPeriod });
    }
  };

  const handleApplyCustomDates = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customStart || !customEnd) return;
    if (customStart > customEnd) {
      alert("Start date must be before or equal to end date");
      return;
    }
    applyFilters({
      period: "custom",
      startDate: customStart,
      endDate: customEnd,
    });
  };

  const handleResetFilters = () => {
    setPeriod("30d");
    setDevice("all");
    setChannel("all");
    setSection("all");
    setShowCustomPicker(false);
    applyFilters({
      period: "30d",
      device: "all",
      channel: "all",
      section: "all",
    });
  };

  const isFiltered =
    period !== "30d" ||
    device !== "all" ||
    channel !== "all" ||
    section !== "all";

  // Label resolvers
  const periodLabel = data.filters?.periodLabel || "Last 30 Days";
  const sectionLabel =
    SECTION_OPTIONS.find((s) => s.value === section)?.label || "All Sections";
  const deviceLabel =
    DEVICE_OPTIONS.find((d) => d.value === device)?.label || "All Devices";
  const channelLabel =
    CHANNEL_OPTIONS.find((c) => c.value === channel)?.label ||
    "All Traffic Sources";

  // SVG Chart Geometry Calculations
  const trend = data.trend || [];
  const maxViews = Math.max(...trend.map((t) => t.views), 10);
  const chartHeight = 220;
  const chartWidth = 720;
  const padding = { top: 20, right: 20, bottom: 30, left: 40 };
  const graphWidth = chartWidth - padding.left - padding.right;
  const graphHeight = chartHeight - padding.top - padding.bottom;

  const pointsViews = trend.map((t, i) => {
    const x =
      padding.left +
      (trend.length > 1
        ? (i / (trend.length - 1)) * graphWidth
        : graphWidth / 2);
    const y = padding.top + graphHeight - (t.views / maxViews) * graphHeight;
    return { x, y, data: t };
  });

  const pointsVisitors = trend.map((t, i) => {
    const x =
      padding.left +
      (trend.length > 1
        ? (i / (trend.length - 1)) * graphWidth
        : graphWidth / 2);
    const y = padding.top + graphHeight - (t.visitors / maxViews) * graphHeight;
    return { x, y, data: t };
  });

  // Construct smooth SVG path
  const makeSmoothPath = (pts: Array<{ x: number; y: number }>) => {
    if (pts.length === 0) return "";
    if (pts.length === 1) return `M ${pts[0].x} ${pts[0].y}`;

    let d = `M ${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];

      const cp1x = p1.x + (p2.x - p0.x) / 6;
      const cp1y = p1.y + (p2.y - p0.y) / 6;
      const cp2x = p2.x - (p3.x - p1.x) / 6;
      const cp2y = p2.y - (p3.y - p1.y) / 6;

      d += ` C ${cp1x},${cp1y} ${cp2x},${cp2y} ${p2.x},${p2.y}`;
    }
    return d;
  };

  const linePathViews = makeSmoothPath(pointsViews);
  const areaPathViews =
    pointsViews.length > 0
      ? `${linePathViews} L ${pointsViews[pointsViews.length - 1].x},${padding.top + graphHeight} L ${pointsViews[0].x},${padding.top + graphHeight} Z`
      : "";

  const linePathVisitors = makeSmoothPath(pointsVisitors);

  const topReferrer = data.referrers?.[0] || {
    source: "Direct",
    percentage: 100,
  };

  return (
    <div className="space-y-5 sm:space-y-6 w-full max-w-full overflow-hidden">
      {/* ========================================================
          COMMAND BAR & CONTROL SECTION (100% Contained, Zero Bleed)
      ======================================================== */}
      <div className="bg-white rounded-2xl border border-[#D9DEEC] p-3.5 sm:p-6 shadow-xs space-y-3.5 sm:space-y-5 w-full max-w-full overflow-hidden">
        {/* Header Strip */}
        <div className="flex items-center justify-between gap-3 pb-3 sm:pb-4 border-b border-[#EEF2FA]">
          <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
            <div className="size-9 sm:size-11 rounded-xl bg-[#EEF2FA] text-[#184098] flex items-center justify-center shrink-0 border border-[#D9DEEC]/60 shadow-xs">
              <BarChart3 className="size-4 sm:size-5 text-[#184098]" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h2 className="font-heading text-base sm:text-xl font-bold text-[#151B2E] truncate">
                  Website Traffic &amp; Audience
                </h2>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 shrink-0">
                  <span className="size-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5 truncate hidden sm:block">
                Real-time visitor telemetry, page velocity, and acquisition
                channels.
              </p>
            </div>
          </div>

          {/* Quick Actions (Reset & Live Updating Indicator) */}
          <div className="flex items-center gap-2 shrink-0">
            {isPending && (
              <span className="flex items-center gap-1.5 text-[11px] sm:text-xs font-semibold text-[#184098] bg-[#EEF2FA] px-2.5 py-1 rounded-lg border border-[#D9DEEC]">
                <Loader2 className="size-3 sm:size-3.5 animate-spin" />
                <span className="hidden sm:inline">Updating...</span>
              </span>
            )}
            {isFiltered && (
              <button
                type="button"
                onClick={handleResetFilters}
                disabled={isPending}
                className="flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold text-[#184098] hover:bg-[#EEF2FA] border border-[#D9DEEC] transition-all cursor-pointer"
              >
                <RotateCcw className="size-3" />
                <span className="hidden sm:inline">Reset to Default</span>
                <span className="sm:hidden text-[11px]">Reset</span>
              </button>
            )}
          </div>
        </div>

        {/* --------------------------------------------------------
            BALANCED 2x2 GRID (Mobile) / 4 PODS (Desktop)
            Never stacks into 1 long column, never spans off screen!
        -------------------------------------------------------- */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-2 sm:gap-3 w-full">
          {/* Pod 1: Date Range */}
          <div
            className={`relative flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-all min-w-0 overflow-hidden ${
              period !== "30d"
                ? "border-[#184098] bg-[#EEF2FA]/70 shadow-xs ring-1 ring-[#184098]/30"
                : "border-[#D9DEEC] bg-[#FAFBFF] hover:border-[#184098]/40 hover:bg-white"
            }`}
          >
            <div
              className={`size-7 sm:size-8 rounded-lg flex items-center justify-center shrink-0 ${
                period !== "30d"
                  ? "bg-[#184098] text-white"
                  : "bg-white text-[#184098] border border-[#D9DEEC]"
              }`}
            >
              <Calendar className="size-3.5 sm:size-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground block leading-tight truncate">
                Date Range
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#151B2E] truncate block mt-0.5 leading-tight">
                {periodLabel}
              </span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0 pointer-events-none" />
            <select
              aria-label="Select Date Range Filter"
              value={period}
              onChange={(e) =>
                handlePeriodChange(e.target.value as AnalyticsPeriodPreset)
              }
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            >
              {PERIOD_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="text-black bg-white"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pod 2: Content Section */}
          <div
            className={`relative flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-all min-w-0 overflow-hidden ${
              section !== "all"
                ? "border-[#184098] bg-[#EEF2FA]/70 shadow-xs ring-1 ring-[#184098]/30"
                : "border-[#D9DEEC] bg-[#FAFBFF] hover:border-[#184098]/40 hover:bg-white"
            }`}
          >
            <div
              className={`size-7 sm:size-8 rounded-lg flex items-center justify-center shrink-0 ${
                section !== "all"
                  ? "bg-[#184098] text-white"
                  : "bg-white text-[#184098] border border-[#D9DEEC]"
              }`}
            >
              <FolderTree className="size-3.5 sm:size-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground block leading-tight truncate">
                Section
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#151B2E] truncate block mt-0.5 leading-tight">
                {sectionLabel}
              </span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0 pointer-events-none" />
            <select
              aria-label="Select Content Section Filter"
              value={section}
              onChange={(e) => {
                const val = e.target.value;
                setSection(val);
                applyFilters({ section: val });
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            >
              {SECTION_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="text-black bg-white"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pod 3: Device Type */}
          <div
            className={`relative flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-all min-w-0 overflow-hidden ${
              device !== "all"
                ? "border-[#184098] bg-[#EEF2FA]/70 shadow-xs ring-1 ring-[#184098]/30"
                : "border-[#D9DEEC] bg-[#FAFBFF] hover:border-[#184098]/40 hover:bg-white"
            }`}
          >
            <div
              className={`size-7 sm:size-8 rounded-lg flex items-center justify-center shrink-0 ${
                device !== "all"
                  ? "bg-[#184098] text-white"
                  : "bg-white text-[#184098] border border-[#D9DEEC]"
              }`}
            >
              <Smartphone className="size-3.5 sm:size-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground block leading-tight truncate">
                Device
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#151B2E] truncate block mt-0.5 leading-tight">
                {deviceLabel}
              </span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0 pointer-events-none" />
            <select
              aria-label="Select Device Filter"
              value={device}
              onChange={(e) => {
                const val = e.target.value;
                setDevice(val);
                applyFilters({ device: val });
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            >
              {DEVICE_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="text-black bg-white"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Pod 4: Acquisition Source */}
          <div
            className={`relative flex items-center gap-2 sm:gap-3 p-2 sm:p-3 rounded-xl border transition-all min-w-0 overflow-hidden ${
              channel !== "all"
                ? "border-[#184098] bg-[#EEF2FA]/70 shadow-xs ring-1 ring-[#184098]/30"
                : "border-[#D9DEEC] bg-[#FAFBFF] hover:border-[#184098]/40 hover:bg-white"
            }`}
          >
            <div
              className={`size-7 sm:size-8 rounded-lg flex items-center justify-center shrink-0 ${
                channel !== "all"
                  ? "bg-[#184098] text-white"
                  : "bg-white text-[#184098] border border-[#D9DEEC]"
              }`}
            >
              <Globe className="size-3.5 sm:size-4" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground block leading-tight truncate">
                Source
              </span>
              <span className="text-[11px] sm:text-xs font-bold text-[#151B2E] truncate block mt-0.5 leading-tight">
                {channelLabel}
              </span>
            </div>
            <ChevronDown className="size-3.5 text-muted-foreground shrink-0 pointer-events-none" />
            <select
              aria-label="Select Traffic Source Filter"
              value={channel}
              onChange={(e) => {
                const val = e.target.value;
                setChannel(val);
                applyFilters({ channel: val });
              }}
              className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10"
            >
              {CHANNEL_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  className="text-black bg-white"
                >
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Custom Date Range Form (Expands only when "Custom Date Range" is active) */}
        {showCustomPicker && (
          <form
            onSubmit={handleApplyCustomDates}
            className="p-3 sm:p-4 rounded-xl bg-[#FAFBFF] border border-[#184098]/30 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs w-full max-w-full overflow-hidden"
          >
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <span className="font-bold text-[#184098] flex items-center gap-1.5 shrink-0">
                <Calendar className="size-3.5 sm:size-4 text-[#184098]" />
                Custom Range:
              </span>
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center w-full sm:w-auto">
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                    Start Date
                  </span>
                  <Input
                    type="date"
                    value={customStart}
                    onChange={(e) => setCustomStart(e.target.value)}
                    max={customEnd || undefined}
                    className="h-8 text-[11px] sm:text-xs bg-white border-[#D9DEEC] w-full sm:w-36"
                    required
                  />
                </div>
                <div>
                  <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-0.5">
                    End Date
                  </span>
                  <Input
                    type="date"
                    value={customEnd}
                    onChange={(e) => setCustomEnd(e.target.value)}
                    min={customStart || undefined}
                    className="h-8 text-[11px] sm:text-xs bg-white border-[#D9DEEC] w-full sm:w-36"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
              <Button
                type="submit"
                size="sm"
                disabled={isPending || !customStart || !customEnd}
                className="h-8 text-xs bg-[#184098] text-white hover:bg-[#071E54] font-bold shadow-xs cursor-pointer flex-1 sm:flex-initial"
              >
                <Check className="size-3.5 mr-1" />
                Apply Range
              </Button>
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={() => {
                  setShowCustomPicker(false);
                  setPeriod("30d");
                  applyFilters({ period: "30d" });
                }}
                className="h-8 text-xs text-muted-foreground hover:text-[#151B2E]"
              >
                Cancel
              </Button>
            </div>
          </form>
        )}

        {/* Active Filter Pills (Only rendered when at least one filter is active) */}
        {isFiltered && (
          <div className="pt-2 border-t border-[#EEF2FA] flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs">
            <span className="text-[10px] sm:text-[11px] font-bold uppercase tracking-wider text-muted-foreground mr-1">
              Active:
            </span>

            {period !== "30d" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#EEF2FA] text-[#184098] font-bold text-[10px] sm:text-[11px] border border-[#D9DEEC]">
                <span>{periodLabel}</span>
                <button
                  type="button"
                  onClick={() => handlePeriodChange("30d")}
                  className="size-3 sm:size-3.5 hover:text-red-600 ml-0.5 cursor-pointer"
                  aria-label="Remove period filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {section !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#EEF2FA] text-[#184098] font-bold text-[10px] sm:text-[11px] border border-[#D9DEEC]">
                <span className="max-w-[120px] truncate">{sectionLabel}</span>
                <button
                  type="button"
                  onClick={() => {
                    setSection("all");
                    applyFilters({ section: "all" });
                  }}
                  className="size-3 sm:size-3.5 hover:text-red-600 ml-0.5 cursor-pointer"
                  aria-label="Remove section filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {device !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#EEF2FA] text-[#184098] font-bold text-[10px] sm:text-[11px] border border-[#D9DEEC]">
                <span>{deviceLabel}</span>
                <button
                  type="button"
                  onClick={() => {
                    setDevice("all");
                    applyFilters({ device: "all" });
                  }}
                  className="size-3 sm:size-3.5 hover:text-red-600 ml-0.5 cursor-pointer"
                  aria-label="Remove device filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            {channel !== "all" && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 sm:px-2.5 sm:py-1 rounded-lg bg-[#EEF2FA] text-[#184098] font-bold text-[10px] sm:text-[11px] border border-[#D9DEEC]">
                <span className="max-w-[120px] truncate">{channelLabel}</span>
                <button
                  type="button"
                  onClick={() => {
                    setChannel("all");
                    applyFilters({ channel: "all" });
                  }}
                  className="size-3 sm:size-3.5 hover:text-red-600 ml-0.5 cursor-pointer"
                  aria-label="Remove channel filter"
                >
                  <X className="size-3" />
                </button>
              </span>
            )}

            <button
              type="button"
              onClick={handleResetFilters}
              disabled={isPending}
              className="text-[10px] sm:text-[11px] text-[#184098] hover:underline font-bold ml-auto cursor-pointer"
            >
              Clear all
            </button>
          </div>
        )}
      </div>

      {/* ========================================================
          4 TOP KPI STAT CARDS (2-Col on Mobile, 4-Col on Desktop)
      ======================================================== */}
      <div
        className={`grid grid-cols-2 lg:grid-cols-4 gap-2.5 sm:gap-4 w-full max-w-full overflow-hidden transition-opacity duration-200 ${
          isPending ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Total Pageviews */}
        <Card className="border-[#D9DEEC] bg-white shadow-xs hover:border-[#184098]/40 transition-all min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 p-3 sm:p-5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              Pageviews
            </span>
            <div className="size-6 sm:size-8 rounded-lg bg-[#EEF2FA] text-[#184098] flex items-center justify-center shrink-0">
              <Eye className="size-3.5 sm:size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-5 pt-0 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span className="font-heading text-xl sm:text-2xl font-black text-[#151B2E]">
                {data.totalViews.toLocaleString()}
              </span>
              <div
                className={`flex items-center text-[10px] sm:text-[11px] font-bold ${
                  data.totalViewsChange >= 0
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {data.totalViewsChange >= 0 ? (
                  <ArrowUpRight className="size-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="size-3 mr-0.5" />
                )}
                <span>
                  {data.totalViewsChange >= 0
                    ? `+${data.totalViewsChange}%`
                    : `${data.totalViewsChange}%`}
                </span>
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 truncate">
              vs previous {periodLabel.toLowerCase()}
            </p>
          </CardContent>
        </Card>

        {/* Unique Visitors */}
        <Card className="border-[#D9DEEC] bg-white shadow-xs hover:border-[#184098]/40 transition-all min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 p-3 sm:p-5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              Visitors
            </span>
            <div className="size-6 sm:size-8 rounded-lg bg-[#FDF8E7] text-[#D97706] flex items-center justify-center shrink-0">
              <Users className="size-3.5 sm:size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-5 pt-0 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span className="font-heading text-xl sm:text-2xl font-black text-[#151B2E]">
                {data.uniqueVisitors.toLocaleString()}
              </span>
              <div
                className={`flex items-center text-[10px] sm:text-[11px] font-bold ${
                  data.uniqueVisitorsChange >= 0
                    ? "text-emerald-600"
                    : "text-amber-600"
                }`}
              >
                {data.uniqueVisitorsChange >= 0 ? (
                  <ArrowUpRight className="size-3 mr-0.5" />
                ) : (
                  <ArrowDownRight className="size-3 mr-0.5" />
                )}
                <span>
                  {data.uniqueVisitorsChange >= 0
                    ? `+${data.uniqueVisitorsChange}%`
                    : `${data.uniqueVisitorsChange}%`}
                </span>
              </div>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 truncate">
              Deduplicated 24h
            </p>
          </CardContent>
        </Card>

        {/* Today's Traffic */}
        <Card className="border-[#D9DEEC] bg-white shadow-xs hover:border-[#184098]/40 transition-all min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 p-3 sm:p-5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              Active Today
            </span>
            <div className="size-6 sm:size-8 rounded-lg bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <TrendingUp className="size-3.5 sm:size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-5 pt-0 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span className="font-heading text-xl sm:text-2xl font-black text-[#151B2E]">
                {data.viewsToday.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-emerald-600 bg-emerald-50 px-1.5 py-0.5 rounded w-fit">
                {data.visitorsToday} Users
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 truncate">
              Since midnight (WAT)
            </p>
          </CardContent>
        </Card>

        {/* Top Channel */}
        <Card className="border-[#D9DEEC] bg-white shadow-xs hover:border-[#184098]/40 transition-all min-w-0 overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-1.5 sm:pb-2 p-3 sm:p-5">
            <span className="text-[10px] sm:text-xs font-bold uppercase tracking-wider text-muted-foreground truncate">
              Top Channel
            </span>
            <div className="size-6 sm:size-8 rounded-lg bg-[#EEF2FA] text-[#184098] flex items-center justify-center shrink-0">
              <Share2 className="size-3.5 sm:size-4" />
            </div>
          </CardHeader>
          <CardContent className="p-3 sm:p-5 pt-0 sm:pt-0">
            <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-1">
              <span className="font-heading text-base sm:text-xl font-black text-[#151B2E] truncate">
                {topReferrer.source}
              </span>
              <span className="text-[10px] sm:text-xs font-bold text-[#184098] bg-[#EEF2FA] px-1.5 py-0.5 rounded w-fit">
                {topReferrer.percentage}%
              </span>
            </div>
            <p className="text-[10px] sm:text-[11px] text-muted-foreground mt-1 truncate">
              Primary source
            </p>
          </CardContent>
        </Card>
      </div>

      {/* ========================================================
          MAIN TRAFFIC VELOCITY CHART (100% Contained)
      ======================================================== */}
      <Card
        className={`border-[#D9DEEC] bg-white shadow-xs overflow-hidden w-full max-w-full transition-opacity duration-200 ${
          isPending ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        <CardHeader className="pb-3 border-b border-[#D9DEEC] p-4 sm:p-6">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div>
              <CardTitle className="font-heading text-sm sm:text-base font-bold text-[#151B2E]">
                Traffic Velocity Over Time
              </CardTitle>
              <p className="text-[11px] sm:text-xs text-muted-foreground mt-0.5">
                Views vs unique visitors for{" "}
                <span className="font-semibold text-[#184098]">
                  {periodLabel}
                </span>
                {section !== "all" && ` • ${sectionLabel}`}
                {device !== "all" && ` • ${deviceLabel}`}
                {channel !== "all" && ` • ${channelLabel}`}
              </p>
            </div>
            <div className="flex items-center gap-3 sm:gap-4 text-[11px] sm:text-xs font-semibold">
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 sm:size-3 rounded-full bg-[#184098]" />
                <span className="text-[#151B2E]">Pageviews</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="size-2.5 sm:size-3 rounded-full bg-[#FDC82F]" />
                <span className="text-[#151B2E]">Unique Visitors</span>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-3 sm:pt-4 pb-2 px-1 sm:px-6">
          {trend.length === 0 || maxViews === 0 ? (
            <div className="h-48 sm:h-56 flex flex-col items-center justify-center text-center p-4 sm:p-6 space-y-2">
              <div className="size-10 rounded-full bg-[#EEF2FA] text-[#184098] flex items-center justify-center">
                <BarChart3 className="size-5 text-[#184098]" />
              </div>
              <p className="text-xs font-bold text-[#151B2E]">
                No traffic recorded for this filter combination.
              </p>
              <p className="text-[11px] sm:text-xs text-muted-foreground max-w-sm">
                Try widening your date window or resetting filters to view all
                activity.
              </p>
              {isFiltered && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleResetFilters}
                  className="mt-2 text-xs border-[#D9DEEC] text-[#184098] cursor-pointer"
                >
                  <RotateCcw className="size-3 mr-1" />
                  Reset to Default
                </Button>
              )}
            </div>
          ) : (
            <div className="relative w-full overflow-hidden">
              <svg
                viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                className="w-full h-auto overflow-hidden select-none cursor-crosshair"
                style={{ maxHeight: "260px" }}
                role="img"
                aria-label="Website traffic trend chart"
                onMouseLeave={() => setHoveredPoint(null)}
                onMouseMove={(e) => {
                  if (trend.length === 0) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const clientX = e.clientX - rect.left;
                  const ratio = Math.max(
                    0,
                    Math.min(
                      1,
                      (clientX - (padding.left / chartWidth) * rect.width) /
                        ((graphWidth / chartWidth) * rect.width),
                    ),
                  );
                  const index = Math.min(
                    Math.max(0, Math.round(ratio * (trend.length - 1))),
                    trend.length - 1,
                  );
                  if (index >= 0 && trend[index] && pointsViews[index]) {
                    setHoveredPoint({
                      index,
                      x: pointsViews[index].x,
                      y: pointsViews[index].y,
                      date: trend[index].label,
                      views: trend[index].views,
                      visitors: trend[index].visitors,
                    });
                  }
                }}
              >
                <title>Website Traffic Velocity Chart</title>
                <defs>
                  <linearGradient
                    id={`views-grad-${chartId}`}
                    x1="0"
                    y1="0"
                    x2="0"
                    y2="1"
                  >
                    <stop offset="0%" stopColor="#184098" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#184098" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Gridlines */}
                {[0, 0.25, 0.5, 0.75, 1].map((ratio) => {
                  const y = padding.top + graphHeight * (1 - ratio);
                  const val = Math.round(maxViews * ratio);
                  return (
                    <g key={ratio}>
                      <line
                        x1={padding.left}
                        y1={y}
                        x2={chartWidth - padding.right}
                        y2={y}
                        stroke="#E4E0D5"
                        strokeDasharray="4 4"
                        strokeWidth="1"
                      />
                      <text
                        x={padding.left - 8}
                        y={y + 3}
                        textAnchor="end"
                        fontSize="10"
                        fill="#8A92A6"
                        fontWeight="600"
                      >
                        {val}
                      </text>
                    </g>
                  );
                })}

                {/* X-axis date labels */}
                {trend.map((t, i) => {
                  const step = Math.max(Math.floor(trend.length / 6), 1);
                  if (i % step !== 0 && i !== trend.length - 1) return null;
                  const x =
                    padding.left +
                    (trend.length > 1
                      ? (i / (trend.length - 1)) * graphWidth
                      : graphWidth / 2);
                  return (
                    <text
                      key={t.date}
                      x={x}
                      y={chartHeight - 6}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#8A92A6"
                      fontWeight="500"
                    >
                      {t.label}
                    </text>
                  );
                })}

                {/* Views Area Fill */}
                <path d={areaPathViews} fill={`url(#views-grad-${chartId})`} />

                {/* Views Line */}
                <path
                  d={linePathViews}
                  fill="none"
                  stroke="#184098"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Visitors Line */}
                <path
                  d={linePathVisitors}
                  fill="none"
                  stroke="#FDC82F"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                />

                {/* Hover Active Indicator */}
                {hoveredPoint && (
                  <g>
                    <line
                      x1={hoveredPoint.x}
                      y1={padding.top}
                      x2={hoveredPoint.x}
                      y2={padding.top + graphHeight}
                      stroke="#184098"
                      strokeWidth="1.5"
                      strokeDasharray="3 3"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={pointsViews[hoveredPoint.index]?.y ?? padding.top}
                      r="5"
                      fill="#184098"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                    <circle
                      cx={hoveredPoint.x}
                      cy={pointsVisitors[hoveredPoint.index]?.y ?? padding.top}
                      r="4"
                      fill="#FDC82F"
                      stroke="#ffffff"
                      strokeWidth="2"
                    />
                  </g>
                )}
              </svg>

              {/* Interactive Tooltip Card */}
              {hoveredPoint && (
                <div
                  className="absolute pointer-events-none bg-[#151B2E] text-white p-2.5 rounded-lg shadow-xl text-xs space-y-1 transition-all duration-75 z-20"
                  style={{
                    left: `${Math.min(
                      Math.max((hoveredPoint.x / chartWidth) * 100, 15),
                      85,
                    )}%`,
                    top: "10px",
                    transform: "translateX(-50%)",
                  }}
                >
                  <p className="font-bold border-b border-white/10 pb-1 text-[#D9DEEC]">
                    {hoveredPoint.date}
                  </p>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#184098]" />
                      <span>Pageviews:</span>
                    </span>
                    <span className="font-bold">{hoveredPoint.views}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-[#FDC82F]" />
                      <span>Unique Visitors:</span>
                    </span>
                    <span className="font-bold text-[#FDC82F]">
                      {hoveredPoint.visitors}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* ========================================================
          2-COLUMN BREAKDOWN: CONTENT & ACQUISITION
      ======================================================== */}
      <div
        className={`grid grid-cols-1 lg:grid-cols-12 gap-5 sm:gap-6 w-full max-w-full overflow-hidden transition-opacity duration-200 ${
          isPending ? "opacity-60 pointer-events-none" : "opacity-100"
        }`}
      >
        {/* Left Column: Top Visited Pages */}
        <Card className="lg:col-span-7 border-[#D9DEEC] bg-white shadow-xs min-w-0 overflow-hidden">
          <CardHeader className="pb-3 border-b border-[#D9DEEC] p-4 sm:p-5">
            <div className="flex items-center justify-between gap-2">
              <CardTitle className="font-heading text-sm sm:text-base font-bold text-[#151B2E]">
                Top Visited Content &amp; Pages
              </CardTitle>
              <Badge
                variant="outline"
                className="text-[10px] border-[#D9DEEC] text-[#184098] shrink-0"
              >
                {periodLabel}
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 sm:p-5">
            {data.topPages.length === 0 ? (
              <p className="text-xs text-muted-foreground text-center py-6">
                No page visit logs captured matching this slice.
              </p>
            ) : (
              <div className="space-y-2.5 sm:space-y-3">
                {data.topPages.map((page, idx) => {
                  const maxPageViews = data.topPages[0]?.views || 1;
                  const pct = Math.round((page.views / maxPageViews) * 100);

                  const cleanPath =
                    page.path === "/" ? "Home (Frontpage)" : page.path;

                  return (
                    <div
                      key={page.path}
                      className="p-2.5 sm:p-3 rounded-lg border border-[#E4E0D5] bg-[#FAFBFF] hover:border-[#184098]/30 transition-all space-y-1.5 overflow-hidden"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <span className="size-5 rounded-full bg-[#EEF2FA] text-[#184098] font-bold text-[10px] flex items-center justify-center shrink-0">
                            #{idx + 1}
                          </span>
                          <span className="font-mono text-xs font-semibold text-[#151B2E] truncate">
                            {cleanPath}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 sm:gap-3 shrink-0 text-xs">
                          <span className="font-bold text-[#184098]">
                            {page.views.toLocaleString()} views
                          </span>
                          <span className="text-muted-foreground text-[10px] sm:text-[11px] hidden sm:inline">
                            {page.visitors.toLocaleString()} users
                          </span>
                        </div>
                      </div>

                      {/* Progress visual */}
                      <div className="w-full bg-[#E4E0D5] h-1.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#184098] h-full rounded-full transition-all duration-500"
                          style={{ width: `${pct}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column: Traffic Sources & Devices */}
        <div className="lg:col-span-5 space-y-5 sm:space-y-6 min-w-0 overflow-hidden">
          {/* Traffic Sources */}
          <Card className="border-[#D9DEEC] bg-white shadow-xs min-w-0 overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#D9DEEC] p-4 sm:p-5">
              <CardTitle className="font-heading text-sm sm:text-base font-bold text-[#151B2E] flex items-center gap-2">
                <Globe className="size-4 text-[#184098]" />
                Traffic Acquisition Channels
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-5">
              {data.referrers.length === 0 ? (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Direct visits dominate. External channels appear as referral
                  links arrive.
                </p>
              ) : (
                <div className="space-y-2.5 sm:space-y-3">
                  {data.referrers.map((ref) => (
                    <div key={ref.source} className="space-y-1">
                      <div className="flex items-center justify-between text-xs font-medium">
                        <span className="text-[#151B2E] font-semibold truncate max-w-[150px]">
                          {ref.source}
                        </span>
                        <div className="flex items-center gap-2 shrink-0">
                          <span className="text-muted-foreground text-[10px] sm:text-[11px]">
                            {ref.views} views
                          </span>
                          <span className="font-bold text-[#184098] w-8 text-right">
                            {ref.percentage}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full bg-[#EEF2FA] h-2 rounded-full overflow-hidden">
                        <div
                          className="bg-[#184098] h-full rounded-full"
                          style={{ width: `${ref.percentage}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Device Breakdown */}
          <Card className="border-[#D9DEEC] bg-white shadow-xs min-w-0 overflow-hidden">
            <CardHeader className="pb-3 border-b border-[#D9DEEC] p-4 sm:p-5">
              <CardTitle className="font-heading text-sm sm:text-base font-bold text-[#151B2E]">
                Device Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="p-3.5 sm:p-5">
              <div className="grid grid-cols-3 gap-2 sm:gap-3 text-center">
                {(() => {
                  const mobile =
                    data.deviceBreakdown.find((d) => d.device === "mobile")
                      ?.percentage || 0;
                  const desktop =
                    data.deviceBreakdown.find((d) => d.device === "desktop")
                      ?.percentage || 0;
                  const tablet =
                    data.deviceBreakdown.find((d) => d.device === "tablet")
                      ?.percentage || 0;

                  return (
                    <>
                      <div className="p-2 sm:p-3 rounded-lg border border-[#E4E0D5] bg-[#FAFBFF] min-w-0 overflow-hidden">
                        <Smartphone className="size-4 sm:size-5 mx-auto text-[#184098] mb-1" />
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                          Mobile
                        </span>
                        <span className="font-heading text-sm sm:text-base font-black text-[#151B2E]">
                          {mobile}%
                        </span>
                      </div>

                      <div className="p-2 sm:p-3 rounded-lg border border-[#E4E0D5] bg-[#FAFBFF] min-w-0 overflow-hidden">
                        <Monitor className="size-4 sm:size-5 mx-auto text-[#184098] mb-1" />
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                          Desktop
                        </span>
                        <span className="font-heading text-sm sm:text-base font-black text-[#151B2E]">
                          {desktop}%
                        </span>
                      </div>

                      <div className="p-2 sm:p-3 rounded-lg border border-[#E4E0D5] bg-[#FAFBFF] min-w-0 overflow-hidden">
                        <Tablet className="size-4 sm:size-5 mx-auto text-[#184098] mb-1" />
                        <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-wider text-muted-foreground block truncate">
                          Tablet
                        </span>
                        <span className="font-heading text-sm sm:text-base font-black text-[#151B2E]">
                          {tablet}%
                        </span>
                      </div>
                    </>
                  );
                })()}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
