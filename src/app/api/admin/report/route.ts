import { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { requireAdminSession } from "@/lib/session";
import { successResponse, errorResponseFrom } from "@/lib/api-helpers";
import { parseDateRange, eachDayInRange } from "@/lib/date-range";

export const dynamic = "force-dynamic";

function toDayKey(d: Date): string {
  return d.toISOString().split("T")[0];
}

export async function GET(req: NextRequest) {
  try {
    await requireAdminSession();

    const { searchParams } = new URL(req.url);
    // Tanpa param = all-time (sama seperti dashboard-stats): whereCreatedAt undefined.
    // parseDateRange tidak pernah throw: param invalid -> undefined.
    const { from, to, whereCreatedAt } = parseDateRange(searchParams);

    const baseWhere = whereCreatedAt
      ? { ...notDeleted, createdAt: whereCreatedAt }
      : { ...notDeleted };
    const visitWhere = whereCreatedAt
      ? { createdAt: whereCreatedAt }
      : undefined;

    // Rentang harian: pakai filter bila ada, fallback 30 hari terakhir agar
    // grafik selalu terisi meski mode semua-waktu.
    const rangeTo = to ?? new Date();
    const rangeFrom =
      from ?? new Date(rangeTo.getTime() - 30 * 24 * 60 * 60 * 1000);

    const [
      projects,
      certificates,
      experiences,
      messages,
      unreadMessages,
      totalFiltered,
      totalAllTime,
      visitGroups,
      countryGroups,
      cityGroups,
      recentProjects,
      recentCertificates,
      recentExperiences,
      recentMessages,
    ] = await Promise.all([
      prisma.project.count({ where: baseWhere }),
      prisma.certificate.count({ where: baseWhere }),
      prisma.experience.count({ where: baseWhere }),
      prisma.message.count({ where: baseWhere }),
      prisma.message.count({ where: { ...baseWhere, status: "NEW" } }),
      prisma.visit.count({ where: visitWhere }),
      prisma.visit.count(),
      prisma.visit.groupBy({
        by: ["createdAt"],
        where: { createdAt: { gte: rangeFrom, lte: rangeTo } },
        _count: { id: true },
      }),
      prisma.visit.groupBy({
        by: ["countryCode", "country"],
        where: visitWhere,
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.visit.groupBy({
        by: ["city", "country"],
        where: { ...visitWhere, city: { not: null } },
        _count: { id: true },
        orderBy: { _count: { id: "desc" } },
        take: 10,
      }),
      prisma.project.findMany({
        where: baseWhere,
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.certificate.findMany({
        where: baseWhere,
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.experience.findMany({
        where: baseWhere,
        select: { id: true, title: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
      prisma.message.findMany({
        where: baseWhere,
        select: { id: true, name: true, createdAt: true },
        orderBy: { createdAt: "desc" },
        take: 5,
      }),
    ]);

    const dailyMap = new Map<string, number>();
    for (const day of eachDayInRange(rangeFrom, rangeTo)) {
      dailyMap.set(toDayKey(day), 0);
    }
    for (const g of visitGroups) {
      const key = toDayKey(g.createdAt);
      if (dailyMap.has(key)) {
        dailyMap.set(key, (dailyMap.get(key) ?? 0) + g._count.id);
      }
    }
    const daily = Array.from(dailyMap.entries()).map(([date, visits]) => ({
      date,
      visits,
    }));

    const topCountries = countryGroups.map((g) => ({
      countryCode: g.countryCode,
      country: g.country,
      visits: g._count.id,
    }));
    const topCities = cityGroups.map((g) => ({
      city: g.city ?? "",
      country: g.country,
      visits: g._count.id,
    }));

    return successResponse({
      meta: {
        from: from ? from.toISOString() : null,
        to: to ? to.toISOString() : null,
      },
      counts: { projects, certificates, experiences, messages, unreadMessages },
      visits: { totalFiltered, totalAllTime, daily, topCountries, topCities },
      recent: {
        projects: recentProjects,
        certificates: recentCertificates,
        experiences: recentExperiences,
        messages: recentMessages,
      },
    });
  } catch (error) {
    return errorResponseFrom(error, "Failed to load system report");
  }
}
