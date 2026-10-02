// app/api/faq/route.ts
// Endpoint PortoBot: rate limit per IP, validasi body, lalu ambil data publik
// yang sudah terpublikasi dan terjawab oleh `lib/faq.ts` tanpa LLM.
import { NextRequest, NextResponse } from "next/server";

import prisma from "@/lib/prisma";
import { applyRateLimit } from "@/lib/rate-limit";
import { composePublicContent } from "@/lib/public-content";
import {
  localizeCertificates,
  localizeExperiences,
  localizeProjects,
} from "@/lib/localized-content";
import { getSiteSettings } from "@/lib/settings";
import { notDeleted } from "@/lib/soft-delete";
import { getMessages } from "@/lib/translations";
import { answerQuestion, buildGreeting, type FaqContext } from "@/lib/faq";
import { faqApiSchema } from "@/schema/faq";
import { getClientIp } from "@/utils/client-ip";

export async function POST(request: NextRequest) {
  // Portofolio hanya baca data yang memang publik, jadi tidak ada efek samping
  // yang perlu dilindungi CSRF; rate limit yang menahan penyalahgunaan.
  const ip = getClientIp(request.headers);
  const rate = await applyRateLimit("search", ip);
  if (!rate.allowed) {
    return NextResponse.json({ error: "RATE_LIMITED" }, { status: 429, headers: rate.headers });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "INVALID_JSON" }, { status: 400 });
  }

  const parsed = faqApiSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "VALIDATION_ERROR", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const { question, locale } = parsed.data;

  try {
    const [messages, settings, projects, experience, certificates, skills] = await Promise.all([
      getMessages(locale),
      getSiteSettings(locale),
      prisma.project.findMany({
        where: { ...notDeleted, isPublished: true },
        orderBy: { order: "asc" },
        select: {
          slug: true,
          title: true,
          description: true,
          liveUrl: true,
          repoUrl: true,
          technologies: true,
          role: true,
          year: true,
          translations: true,
        },
      }),
      prisma.experience.findMany({
        where: { ...notDeleted, isPublished: true },
        orderBy: { order: "asc" },
        select: { slug: true, title: true, company: true, startDate: true, endDate: true, isCurrent: true, translations: true },
      }),
      prisma.certificate.findMany({
        where: { ...notDeleted, isPublished: true },
        orderBy: { order: "asc" },
        select: { slug: true, title: true, issuer: true, issueDate: true, translations: true },
      }),
      // Skill tidak punya `isPublished` — hanya soft delete yang membedakannya.
      prisma.skill.findMany({
        where: notDeleted,
        orderBy: { order: "asc" },
        select: { name: true, category: true },
      }),
    ]);

    // Locale datang dari body (default "en"): jawaban ID memakai copy
    // Indonesia yang sudah diisi admin, field yang kosong mewarisi base.
    const ctx: FaqContext = {
      locale,
      messages: composePublicContent(messages, settings),
      settings,
      projects: localizeProjects(projects, locale),
      experience: localizeExperiences(experience, locale),
      certificates: localizeCertificates(certificates, locale),
      skills,
    };

    // Tanpa `{ data }` wrapper: `porto-bot.tsx` membaca `payload.answer` /
    // `payload.intro` langsung dari body.
    return NextResponse.json(question ? answerQuestion(question, ctx) : buildGreeting(ctx));
  } catch (error) {
    console.error("[faq] gagal menyusun jawaban:", error);
    return NextResponse.json({ error: "INTERNAL_SERVER_ERROR" }, { status: 500 });
  }
}
