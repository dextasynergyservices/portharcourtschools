import { and, desc, eq, gte, like, lt, lte, or, sql } from "drizzle-orm";
import { db, pageViews } from "@/lib/db";

export type AnalyticsPeriodPreset =
  | "today"
  | "yesterday"
  | "7d"
  | "30d"
  | "90d"
  | "custom";

export interface AnalyticsFilterParams {
  period?: AnalyticsPeriodPreset;
  startDate?: string; // YYYY-MM-DD
  endDate?: string; // YYYY-MM-DD
  device?: string; // 'all' | 'mobile' | 'desktop' | 'tablet'
  channel?: string; // 'all' | 'Direct' | 'WhatsApp' | 'Google' | ...
  section?: string; // 'all' | '/' | '/schools' | '/events' | '/blog'
}

export interface ActiveFilters {
  period: AnalyticsPeriodPreset;
  startDate: string;
  endDate: string;
  device: string;
  channel: string;
  section: string;
  periodLabel: string;
  isFiltered: boolean;
}

export interface AnalyticsTrendPoint {
  date: string;
  label: string;
  views: number;
  visitors: number;
}

export interface TopPageItem {
  path: string;
  views: number;
  visitors: number;
}

export interface ReferrerItem {
  source: string;
  views: number;
  percentage: number;
}

export interface DeviceBreakdownItem {
  device: string;
  views: number;
  percentage: number;
}

export interface AnalyticsSummary {
  periodDays: number;
  filters: ActiveFilters;
  totalViews: number;
  totalViewsChange: number; // percentage change vs previous period
  uniqueVisitors: number;
  uniqueVisitorsChange: number;
  viewsToday: number;
  visitorsToday: number;
  trend: AnalyticsTrendPoint[];
  topPages: TopPageItem[];
  referrers: ReferrerItem[];
  deviceBreakdown: DeviceBreakdownItem[];
  topCountries: Array<{ country: string; views: number }>;
}

export async function getAnalyticsSummary(
  params?: AnalyticsFilterParams | number,
): Promise<AnalyticsSummary> {
  const filterParams: AnalyticsFilterParams =
    typeof params === "number"
      ? {
          period: params === 7 ? "7d" : params === 90 ? "90d" : "30d",
          device: "all",
          channel: "all",
          section: "all",
        }
      : {
          period: params?.period || "30d",
          startDate: params?.startDate,
          endDate: params?.endDate,
          device: params?.device || "all",
          channel: params?.channel || "all",
          section: params?.section || "all",
        };

  const period = filterParams.period || "30d";
  const device = filterParams.device || "all";
  const channel = filterParams.channel || "all";
  const section = filterParams.section || "all";

  const now = new Date();
  let start: Date;
  let end: Date = now;
  let prevStart: Date;
  let prevEnd: Date;
  let periodDays = 30;
  let periodLabel = "Last 30 Days";
  let isHourly = false;

  switch (period) {
    case "today": {
      periodDays = 1;
      start = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          0,
          0,
          0,
          0,
        ),
      );
      end = now;

      // Previous period: yesterday same time
      const yStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
      const ySameTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      prevStart = yStart;
      prevEnd = ySameTime;
      periodLabel = "Today";
      isHourly = true;
      break;
    }
    case "yesterday": {
      periodDays = 1;
      start = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - 1,
          0,
          0,
          0,
          0,
        ),
      );
      end = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate() - 1,
          23,
          59,
          59,
          999,
        ),
      );

      prevStart = new Date(start.getTime() - 24 * 60 * 60 * 1000);
      prevEnd = new Date(end.getTime() - 24 * 60 * 60 * 1000);
      periodLabel = "Yesterday";
      isHourly = true;
      break;
    }
    case "7d": {
      periodDays = 7;
      start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      end = now;
      prevStart = new Date(start.getTime() - 7 * 24 * 60 * 60 * 1000);
      prevEnd = start;
      periodLabel = "Last 7 Days";
      isHourly = false;
      break;
    }
    case "90d": {
      periodDays = 90;
      start = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
      end = now;
      prevStart = new Date(start.getTime() - 90 * 24 * 60 * 60 * 1000);
      prevEnd = start;
      periodLabel = "Last 90 Days";
      isHourly = false;
      break;
    }
    case "custom": {
      if (filterParams.startDate && filterParams.endDate) {
        const parsedStart = new Date(`${filterParams.startDate}T00:00:00.000Z`);
        const parsedEnd = new Date(`${filterParams.endDate}T23:59:59.999Z`);
        if (
          !Number.isNaN(parsedStart.getTime()) &&
          !Number.isNaN(parsedEnd.getTime()) &&
          parsedStart <= parsedEnd
        ) {
          start = parsedStart;
          end = parsedEnd;
          const diffMs = end.getTime() - start.getTime();
          periodDays = Math.max(1, Math.round(diffMs / (24 * 60 * 60 * 1000)));
          prevStart = new Date(start.getTime() - diffMs);
          prevEnd = start;
          periodLabel = `${filterParams.startDate} to ${filterParams.endDate}`;
          isHourly = periodDays <= 1;
          break;
        }
      }
      // Fallback
      periodDays = 30;
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = now;
      prevStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevEnd = start;
      periodLabel = "Last 30 Days";
      isHourly = false;
      break;
    }
    default: {
      periodDays = 30;
      start = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
      end = now;
      prevStart = new Date(start.getTime() - 30 * 24 * 60 * 60 * 1000);
      prevEnd = start;
      periodLabel = "Last 30 Days";
      isHourly = false;
      break;
    }
  }

  const isFiltered =
    period !== "30d" ||
    device !== "all" ||
    channel !== "all" ||
    section !== "all";

  const activeFilters: ActiveFilters = {
    period,
    startDate: start.toISOString().slice(0, 10),
    endDate: end.toISOString().slice(0, 10),
    device,
    channel,
    section,
    periodLabel,
    isFiltered,
  };

  // Build SQL conditions
  const dimensionConditions = [];
  if (device && device !== "all") {
    dimensionConditions.push(eq(pageViews.deviceType, device));
  }
  if (channel && channel !== "all") {
    dimensionConditions.push(eq(pageViews.referrerDomain, channel));
  }
  if (section && section !== "all") {
    if (section === "/") {
      dimensionConditions.push(eq(pageViews.path, "/"));
    } else {
      const sectionMatch = or(
        eq(pageViews.path, section),
        like(pageViews.path, `${section}/%`),
      );
      if (sectionMatch) {
        dimensionConditions.push(sectionMatch);
      }
    }
  }

  const currentConditions = [
    gte(pageViews.createdAt, start),
    lte(pageViews.createdAt, end),
    ...dimensionConditions,
  ];

  const prevConditions = [
    gte(pageViews.createdAt, prevStart),
    lt(pageViews.createdAt, prevEnd),
    ...dimensionConditions,
  ];

  const todayMidnight = new Date(
    Date.UTC(
      now.getUTCFullYear(),
      now.getUTCMonth(),
      now.getUTCDate(),
      0,
      0,
      0,
      0,
    ),
  );
  const todayConditions = [
    gte(pageViews.createdAt, todayMidnight),
    ...dimensionConditions,
  ];

  try {
    // 1. Current Period Totals
    const [currentTotals] = await db
      .select({
        totalViews: sql<number>`cast(count(${pageViews.id}) as int)`,
        uniqueVisitors: sql<number>`cast(count(distinct ${pageViews.visitorHash}) as int)`,
      })
      .from(pageViews)
      .where(and(...currentConditions));

    // 2. Previous Period Totals (for % change)
    const [prevTotals] = await db
      .select({
        totalViews: sql<number>`cast(count(${pageViews.id}) as int)`,
        uniqueVisitors: sql<number>`cast(count(distinct ${pageViews.visitorHash}) as int)`,
      })
      .from(pageViews)
      .where(and(...prevConditions));

    // 3. Today's Live Stats
    const [todayTotals] = await db
      .select({
        viewsToday: sql<number>`cast(count(${pageViews.id}) as int)`,
        visitorsToday: sql<number>`cast(count(distinct ${pageViews.visitorHash}) as int)`,
      })
      .from(pageViews)
      .where(and(...todayConditions));

    // 4. Trend Data Generation
    const trend: AnalyticsTrendPoint[] = [];

    if (isHourly) {
      const hourlyRaw = await db
        .select({
          timeStr: sql<string>`to_char(${pageViews.createdAt}, 'YYYY-MM-DD HH24')`,
          views: sql<number>`cast(count(${pageViews.id}) as int)`,
          visitors: sql<number>`cast(count(distinct ${pageViews.visitorHash}) as int)`,
        })
        .from(pageViews)
        .where(and(...currentConditions))
        .groupBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM-DD HH24')`);

      const hourlyMap = new Map<string, { views: number; visitors: number }>();
      for (const row of hourlyRaw) {
        hourlyMap.set(row.timeStr, {
          views: row.views,
          visitors: row.visitors,
        });
      }

      const cursor = new Date(start);
      cursor.setUTCMinutes(0, 0, 0);

      while (cursor <= end) {
        const timeKey = `${cursor.toISOString().slice(0, 10)} ${String(
          cursor.getUTCHours(),
        ).padStart(2, "0")}`;

        const h = cursor.getUTCHours();
        const ampm = h >= 12 ? "PM" : "AM";
        const h12 = h % 12 === 0 ? 12 : h % 12;
        const label = `${h12} ${ampm}`;

        const stats = hourlyMap.get(timeKey) || { views: 0, visitors: 0 };
        trend.push({
          date: timeKey,
          label,
          views: stats.views,
          visitors: stats.visitors,
        });
        cursor.setUTCHours(cursor.getUTCHours() + 1);
      }
    } else {
      const dailyRaw = await db
        .select({
          dayStr: sql<string>`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`,
          views: sql<number>`cast(count(${pageViews.id}) as int)`,
          visitors: sql<number>`cast(count(distinct ${pageViews.visitorHash}) as int)`,
        })
        .from(pageViews)
        .where(and(...currentConditions))
        .groupBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`)
        .orderBy(sql`to_char(${pageViews.createdAt}, 'YYYY-MM-DD')`);

      const dailyMap = new Map<string, { views: number; visitors: number }>();
      for (const row of dailyRaw) {
        dailyMap.set(row.dayStr, { views: row.views, visitors: row.visitors });
      }

      const cursor = new Date(start);
      let dayCount = 0;
      while (cursor <= end && dayCount < 180) {
        const dayStr = cursor.toISOString().slice(0, 10);
        const label = cursor.toLocaleDateString("en-US", {
          timeZone: "UTC",
          month: "short",
          day: "numeric",
        });
        const stats = dailyMap.get(dayStr) || { views: 0, visitors: 0 };
        trend.push({
          date: dayStr,
          label,
          views: stats.views,
          visitors: stats.visitors,
        });
        cursor.setUTCDate(cursor.getUTCDate() + 1);
        dayCount++;
      }
    }

    // 5. Top Visited Pages
    const topPagesRaw = await db
      .select({
        path: pageViews.path,
        views: sql<number>`cast(count(${pageViews.id}) as int)`,
        visitors: sql<number>`cast(count(distinct ${pageViews.visitorHash}) as int)`,
      })
      .from(pageViews)
      .where(and(...currentConditions))
      .groupBy(pageViews.path)
      .orderBy(desc(sql`count(${pageViews.id})`))
      .limit(6);

    // 6. Referrer Channels
    const referrersRaw = await db
      .select({
        source: pageViews.referrerDomain,
        views: sql<number>`cast(count(${pageViews.id}) as int)`,
      })
      .from(pageViews)
      .where(and(...currentConditions))
      .groupBy(pageViews.referrerDomain)
      .orderBy(desc(sql`count(${pageViews.id})`))
      .limit(6);

    const totalViewsCount = currentTotals?.totalViews || 0;
    const referrers: ReferrerItem[] = referrersRaw.map((r) => ({
      source: r.source || "Direct",
      views: r.views,
      percentage:
        totalViewsCount > 0 ? Math.round((r.views / totalViewsCount) * 100) : 0,
    }));

    // 7. Device Breakdown
    const devicesRaw = await db
      .select({
        device: pageViews.deviceType,
        views: sql<number>`cast(count(${pageViews.id}) as int)`,
      })
      .from(pageViews)
      .where(and(...currentConditions))
      .groupBy(pageViews.deviceType)
      .orderBy(desc(sql`count(${pageViews.id})`));

    const deviceBreakdown: DeviceBreakdownItem[] = devicesRaw.map((d) => ({
      device: d.device || "desktop",
      views: d.views,
      percentage:
        totalViewsCount > 0 ? Math.round((d.views / totalViewsCount) * 100) : 0,
    }));

    // 8. Top Countries
    const topCountriesRaw = await db
      .select({
        country: pageViews.country,
        views: sql<number>`cast(count(${pageViews.id}) as int)`,
      })
      .from(pageViews)
      .where(
        and(
          ...currentConditions,
          sql`${pageViews.country} is not null`,
          sql`${pageViews.country} != ''`,
        ),
      )
      .groupBy(pageViews.country)
      .orderBy(desc(sql`count(${pageViews.id})`))
      .limit(4);

    const topCountries = topCountriesRaw.map((c) => ({
      country: c.country || "Unknown",
      views: c.views,
    }));

    // Calculate percentage change
    const calcChange = (curr: number, prev: number) => {
      if (prev === 0) return curr > 0 ? 100 : 0;
      return Math.round(((curr - prev) / prev) * 100);
    };

    return {
      periodDays,
      filters: activeFilters,
      totalViews: currentTotals?.totalViews || 0,
      totalViewsChange: calcChange(
        currentTotals?.totalViews || 0,
        prevTotals?.totalViews || 0,
      ),
      uniqueVisitors: currentTotals?.uniqueVisitors || 0,
      uniqueVisitorsChange: calcChange(
        currentTotals?.uniqueVisitors || 0,
        prevTotals?.uniqueVisitors || 0,
      ),
      viewsToday: todayTotals?.viewsToday || 0,
      visitorsToday: todayTotals?.visitorsToday || 0,
      trend,
      topPages: topPagesRaw,
      referrers,
      deviceBreakdown,
      topCountries,
    };
  } catch (error) {
    console.error("[getAnalyticsSummary Error]:", error);
    return {
      periodDays,
      filters: activeFilters,
      totalViews: 0,
      totalViewsChange: 0,
      uniqueVisitors: 0,
      uniqueVisitorsChange: 0,
      viewsToday: 0,
      visitorsToday: 0,
      trend: [],
      topPages: [],
      referrers: [],
      deviceBreakdown: [],
      topCountries: [],
    };
  }
}
