import { type NextRequest, NextResponse } from "next/server";
import {
  type AnalyticsFilterParams,
  type AnalyticsPeriodPreset,
  getAnalyticsSummary,
} from "@/lib/analytics";
import { auth } from "@/lib/auth";

export async function GET(req: NextRequest) {
  const session = await auth();

  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);

  const rawPeriod = searchParams.get("period");
  const rawDays = searchParams.get("days");

  let period: AnalyticsPeriodPreset = "30d";
  if (
    rawPeriod === "today" ||
    rawPeriod === "yesterday" ||
    rawPeriod === "7d" ||
    rawPeriod === "30d" ||
    rawPeriod === "90d" ||
    rawPeriod === "custom"
  ) {
    period = rawPeriod;
  } else if (rawDays) {
    const daysNum = Number(rawDays);
    if (daysNum === 7) period = "7d";
    else if (daysNum === 90) period = "90d";
    else period = "30d";
  }

  const startDate = searchParams.get("startDate") || undefined;
  const endDate = searchParams.get("endDate") || undefined;
  const device = searchParams.get("device") || "all";
  const channel = searchParams.get("channel") || "all";
  const section = searchParams.get("section") || "all";

  const filterParams: AnalyticsFilterParams = {
    period,
    startDate,
    endDate,
    device,
    channel,
    section,
  };

  const data = await getAnalyticsSummary(filterParams);
  return NextResponse.json(data);
}
