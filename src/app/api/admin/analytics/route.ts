import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";
import { errorResponseFrom } from "@/lib/api-helpers";
import { parseDateRange, eachDayInRange } from "@/lib/date-range";

export const dynamic = "force-dynamic";

function toDayKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(req.url);
    // Tanpa param = 30 hari terakhir (backward-compat).
    const { from, to } = parseDateRange(searchParams, 30);

    // parseDateRange dengan defaultDays selalu mengembalikan from & to.
    const rangeTo = to ?? new Date();
    const rangeFrom =
      from ?? new Date(rangeTo.getTime() - 30 * 24 * 60 * 60 * 1000);

    const durationMs = Math.max(
      rangeTo.getTime() - rangeFrom.getTime(),
      24 * 60 * 60 * 1000,
    );
    const prevTo = new Date(rangeFrom.getTime());
    const prevFrom = new Date(rangeFrom.getTime() - durationMs);

    const [visitsInRange, visitsPrev, locationData, totalAll] =
      await Promise.all([
        prisma.visit.groupBy({
          by: ["createdAt"],
          where: { createdAt: { gte: rangeFrom, lte: rangeTo } },
          _count: { id: true },
        }),
        prisma.visit.groupBy({
          by: ["createdAt"],
          where: { createdAt: { gte: prevFrom, lt: prevTo } },
          _count: { id: true },
        }),
        prisma.visit.groupBy({
          by: ["countryCode", "country", "region", "city", "lat", "lng"],
          where: { createdAt: { gte: rangeFrom, lte: rangeTo } },
          _count: { id: true },
          orderBy: { _count: { id: "desc" } },
        }),
        prisma.visit.count(),
      ]);

    // Aggregate daily visits for chart — satu titik per hari dalam rentang.
    const dailyMap = new Map<string, number>();
    for (const day of eachDayInRange(rangeFrom, rangeTo)) {
      dailyMap.set(toDayKey(day), 0);
    }

    for (const group of visitsInRange) {
      const key = toDayKey(group.createdAt);
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) || 0) + group._count.id);
      }
    }

    const visitsOverview = Array.from(dailyMap.entries()).map(
      ([date, visits]) => ({
        date: new Date(date + "T00:00:00").toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
        }),
        visits,
      }),
    );

    const totalInRange = visitsOverview.reduce((sum, p) => sum + p.visits, 0);
    const totalPrev = visitsPrev.reduce((sum, g) => sum + g._count.id, 0);
    const deltaPct =
      totalPrev > 0
        ? Math.round(((totalInRange - totalPrev) / totalPrev) * 100)
        : totalInRange > 0
          ? 100
          : 0;
    const deltaLabel =
      deltaPct >= 0
        ? `+${deltaPct}% vs previous period`
        : `${deltaPct}% vs previous period`;

    // Aggregate by country
    const countryMap = new Map<
      string,
      {
        code: string;
        country: string;
        region: string;
        visits: number;
        cities: Map<
          string,
          { name: string; visits: number; lat: number; lng: number }
        >;
      }
    >();

    for (const row of locationData) {
      const cc = row.countryCode;
      if (!countryMap.has(cc)) {
        countryMap.set(cc, {
          code: cc,
          country: row.country,
          region: row.region,
          visits: 0,
          cities: new Map(),
        });
      }
      const entry = countryMap.get(cc)!;
      entry.visits += row._count.id;

      if (row.city && row.lat && row.lng) {
        const cityKey = row.city;
        if (!entry.cities.has(cityKey)) {
          entry.cities.set(cityKey, {
            name: row.city,
            visits: 0,
            lat: row.lat,
            lng: row.lng,
          });
        }
        entry.cities.get(cityKey)!.visits += row._count.id;
      }
    }

    const COUNTRY_FLAGS: Record<string, string> = {
      id: "🇮🇩",
      us: "🇺🇸",
      in: "🇮🇳",
      sg: "🇸🇬",
      my: "🇲🇾",
      jp: "🇯🇵",
      nl: "🇳🇱",
      gb: "🇬🇧",
      de: "🇩🇪",
      au: "🇦🇺",
      sa: "🇸🇦",
      br: "🇧🇷",
      ca: "🇨🇦",
      fr: "🇫🇷",
      es: "🇪🇸",
      it: "🇮🇹",
      kr: "🇰🇷",
      tw: "🇹🇼",
      hk: "🇭🇰",
      ph: "🇵🇭",
      th: "🇹🇭",
      vn: "🇻🇳",
      mx: "🇲🇽",
      nz: "🇳🇿",
      eg: "🇪🇬",
      ng: "🇳🇬",
      ae: "🇦🇪",
      tr: "🇹🇷",
      ru: "🇷🇺",
      cn: "🇨🇳",
    };

    const visitorLocations = Array.from(countryMap.values())
      .map((c) => ({
        ...c,
        flag: COUNTRY_FLAGS[c.code] ?? "🌐",
        cities: Array.from(c.cities.values()).sort(
          (a, b) => b.visits - a.visits,
        ),
      }))
      .sort((a, b) => b.visits - a.visits);

    // Regions with data
    const regionSet = new Set(visitorLocations.map((c) => c.region));
    const regions = Array.from(regionSet).sort();

    return NextResponse.json({
      data: {
        visitsOverview,
        totalVisits: totalInRange,
        totalVisitsAllTime: totalAll,
        deltaLabel,
        visitorLocations,
        regions,
        from: rangeFrom.toISOString(),
        to: rangeTo.toISOString(),
      },
    });
  } catch (error) {
    if (error instanceof Error && error.message === "Unauthorized") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return errorResponseFrom(error, "Failed to load analytics");
  }
}
