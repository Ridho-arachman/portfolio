import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { requireAdminSession } from "@/lib/session";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await requireAdminSession();

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const sixtyDaysAgo = new Date();
    sixtyDaysAgo.setDate(sixtyDaysAgo.getDate() - 60);

    const [visitsLast30, visitsPrev30, locationData, totalAll] = await Promise.all([
      prisma.visit.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
      }),
      prisma.visit.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: sixtyDaysAgo, lt: thirtyDaysAgo } },
        _count: { id: true },
      }),
      prisma.visit.groupBy({
        by: ["countryCode", "country", "region", "city", "lat", "lng"],
        where: { createdAt: { gte: thirtyDaysAgo } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
      }),
      prisma.visit.count(),
    ]);

    // Aggregate daily visits for chart
    const dailyMap = new Map<string, number>();
    for (let i = 0; i < 30; i++) {
      const d = new Date();
      d.setDate(d.getDate() - (29 - i));
      const key = d.toISOString().split("T")[0];
      dailyMap.set(key, 0);
    }

    for (const group of visitsLast30) {
      const key = group.createdAt.toISOString().split("T")[0];
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) || 0) + group._count.id);
      }
    }

    const visitsOverview = Array.from(dailyMap.entries()).map(([date, visits]) => ({
      date: new Date(date + "T00:00:00").toLocaleDateString("en-US", { month: "short", day: "numeric" }),
      visits,
    }));

    const totalLast30 = visitsOverview.reduce((sum, p) => sum + p.visits, 0);
    const totalPrev30 = visitsPrev30.reduce((sum, g) => sum + g._count.id, 0);
    const deltaPct = totalPrev30 > 0
      ? Math.round(((totalLast30 - totalPrev30) / totalPrev30) * 100)
      : totalLast30 > 0 ? 100 : 0;
    const deltaLabel = deltaPct >= 0 ? `+${deltaPct}% vs last month` : `${deltaPct}% vs last month`;

    // Aggregate by country
    const countryMap = new Map<string, {
      code: string; country: string; region: string; visits: number;
      cities: Map<string, { name: string; visits: number; lat: number; lng: number }>;
    }>();

    for (const row of locationData) {
      const cc = row.countryCode;
      if (!countryMap.has(cc)) {
        countryMap.set(cc, {
          code: cc, country: row.country, region: row.region, visits: 0,
          cities: new Map(),
        });
      }
      const entry = countryMap.get(cc)!;
      entry.visits += row._count.id;

      if (row.city && row.lat && row.lng) {
        const cityKey = row.city;
        if (!entry.cities.has(cityKey)) {
          entry.cities.set(cityKey, { name: row.city, visits: 0, lat: row.lat, lng: row.lng });
        }
        entry.cities.get(cityKey)!.visits += row._count.id;
      }
    }

    const COUNTRY_FLAGS: Record<string, string> = {
      id: "🇮🇩", us: "🇺🇸", in: "🇮🇳", sg: "🇸🇬", my: "🇲🇾", jp: "🇯🇵",
      nl: "🇳🇱", gb: "🇬🇧", de: "🇩🇪", au: "🇦🇺", sa: "🇸🇦", br: "🇧🇷",
      ca: "🇨🇦", fr: "🇫🇷", es: "🇪🇸", it: "🇮🇹", kr: "🇰🇷", tw: "🇹🇼",
      hk: "🇭🇰", ph: "🇵🇭", th: "🇹🇭", vn: "🇻🇳", mx: "🇲🇽", nz: "🇳🇿",
      eg: "🇪🇬", ng: "🇳🇬", ae: "🇦🇪", tr: "🇹🇷", ru: "🇷🇺", cn: "🇨🇳",
    };

    const visitorLocations = Array.from(countryMap.values())
      .map((c) => ({
        ...c,
        flag: COUNTRY_FLAGS[c.code] ?? "🌐",
        cities: Array.from(c.cities.values()).sort((a, b) => b.visits - a.visits),
      }))
      .sort((a, b) => b.visits - a.visits);

    // Regions with data
    const regionSet = new Set(visitorLocations.map((c) => c.region));
    const regions = Array.from(regionSet).sort();

    return NextResponse.json({
      data: {
        visitsOverview,
        totalVisits: totalLast30,
        totalVisitsAllTime: totalAll,
        deltaLabel,
        visitorLocations,
        regions,
      },
    });
  } catch {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
}
