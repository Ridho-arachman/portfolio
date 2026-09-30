import { describe, expect, it } from "vitest";

import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";
import {
  answerQuestion,
  buildGreeting,
  normalizeFaqText,
  type FaqCertificate,
  type FaqContext,
  type FaqExperience,
  type FaqProject,
  type FaqSkill,
} from "@/lib/faq";
import { composePublicContent } from "@/lib/public-content";
import { testSiteSettings } from "@/test-fixtures/public-content";
import type { Locale } from "@/lib/i18n";

const projects: FaqProject[] = [
  {
    slug: "porto-folio",
    title: "Portofolio Landing Page",
    description: "Landing page statis.",
    liveUrl: "https://porto.example.com",
    repoUrl: "https://github.com/ridho/porto",
    technologies: ["Next.js", "Tailwind"],
    role: "Frontend",
    year: "2024",
  },
  {
    slug: "presence-labs",
    title: "Presence Labs Dashboard",
    description: "Dashboard analitik.",
    liveUrl: null,
    repoUrl: "https://github.com/ridho/presence",
    technologies: ["React"],
    role: "Full Stack",
    year: "2023",
  },
];

const experience: FaqExperience[] = [
  {
    slug: "acme",
    title: "Frontend Engineer",
    company: "Acme",
    startDate: new Date("2023-01-01T00:00:00Z"),
    endDate: null,
    isCurrent: true,
  },
];

const certificates: FaqCertificate[] = [
  {
    slug: "aws-saa",
    title: "AWS Solutions Architect",
    issuer: "Amazon Web Services",
    // Tanggal 1 Januari: tanpa timeZone UTC, ini tampil jadi Desember di
    // timezone negatif, dan test ini menangkapnya.
    issueDate: new Date("2024-01-01T00:00:00Z"),
  },
];

// Kategori harus dari enum Prisma: `en.json` hanya punya 5 label tersebut, dan
// labelnya yang ter-lokalisasi ("Basis Data", bukan "DATABASE").
const skills: FaqSkill[] = [
  { name: "TypeScript", category: "BACKEND" },
  { name: "Next.js", category: "FRONTEND" },
  { name: "PostgreSQL", category: "DATABASE" },
];

function context(locale: Locale, overrides: Partial<FaqContext> = {}): FaqContext {
  const base = locale === "id" ? idMessages : enMessages;
  return {
    locale,
    messages: composePublicContent(base, testSiteSettings),
    settings: testSiteSettings,
    projects,
    experience,
    certificates,
    skills,
    ...overrides,
  };
}

describe("normalizeFaqText", () => {
  it("meratakan huruf besar, tanda baca, dan spasi berlebih", () => {
    expect(normalizeFaqText("  Skill, Bahasa &   TEKNOLOGI!  ")).toBe(
      "skill bahasa teknologi",
    );
  });

  it("melepaskan aksen", () => {
    expect(normalizeFaqText("Pengalaman résumé")).toBe("pengalaman resume");
  });
});

describe("intent routing", () => {
  const cases: [Locale, string, RegExp][] = [
    ["en", "who is this site about?", /Ridho Arachman/],
    ["en", "what technologies does he use?", /Backend: TypeScript/],
    ["en", "tell me about his projects", /published 2 projects/],
    ["en", "what is his work experience?", /Frontend Engineer — Acme/],
    ["en", "does he have any certificates?", /AWS Solutions Architect/],
    ["en", "what did he study?", /Bachelor/],
    ["en", "is he available for freelance?", /Open to Full-time & Freelance/],
    ["en", "how can I contact him?", /ridho@example\.com/],
  ];

  it.each(cases)("menjawab %s: %s", (locale, question, expected) => {
    expect(answerQuestion(question, context(locale)).answer).toMatch(expected);
  });

  it("mengenali intent Bahasa Indonesia", () => {
    const reply = answerQuestion("sertifikat apa saja yang dimiliki?", context("id"));
    expect(reply.answer).toMatch(/AWS Solutions Architect/);
  });

  it("memakai template dan label kategori dari locale yang diminta", () => {
    const reply = answerQuestion("skill apa saja?", context("id"));
    // "Basis Data" hanya ada di id.json; en.json punya "Database" untuk key yang
    // sama. Assertion ini sekaligus membuktikan template dan label ikut locale.
    expect(reply.answer).toMatch(/Basis Data: PostgreSQL/);
    expect(reply.answer).toMatch(/Ini yang dipakai/);
  });

  it("tidak pernah membocorkan nilai enum mentah ke jawaban", () => {
    const reply = answerQuestion("what technologies does he use?", context("en"));
    // Kalau lookup label gagal, `?? category` diam-diam menampilkan "DATABASE".
    expect(reply.answer).not.toMatch(/\b(BACKEND|FRONTEND|DATABASE|DEVOPS_TOOLS):/);
  });
});

describe("project specific lookup", () => {
  it("mengenali slug utuh dan memberi tautan", () => {
    const reply = answerQuestion("ceritakan tentang project presence-labs", context("en"));
    expect(reply.answer).toMatch(/Presence Labs Dashboard/);
    expect(reply.links?.map((link) => link.href)).toContain("/en/projects/presence-labs");
  });

  it("mengenali judul dari dua kata, bukan satu", () => {
    expect(answerQuestion("porto-folio", context("en")).answer).toMatch(/Portofolio Landing Page/);
    // "dashboard" ada di satu judul saja, jadi belum cukup bukti.
    expect(answerQuestion("dashboard", context("en")).answer).not.toMatch(/Presence Labs/);
  });

  it("tidak salah ke project saat yang ditanya daftar semua project", () => {
    const reply = answerQuestion("list all projects", context("en"));
    expect(reply.links).toHaveLength(2);
  });
});

describe("di luar scope", () => {
  it("menolak pertanyaan yang tidak tentang pemilik situs", () => {
    const reply = answerQuestion("apa cuaca di Jakarta besok?", context("en"));
    expect(reply.answer).toMatch(/can only answer questions about/);
    expect(reply.answer).not.toMatch(/Portofolio Landing Page/);
  });

  it("tidak pernah membocorkan data project ke jawaban penutup", () => {
    const reply = answerQuestion("gimana cara install python?", context("en"));
    expect(reply.answer).toMatch(/ridho@example\.com/);
    expect(reply.answer).not.toMatch(/Next\.js/);
  });

  it("jatuh ke siteName saat email kosong", () => {
    const ctx = context("en", {
      settings: { ...testSiteSettings, contactEmail: "", siteName: "Ridho.dev" },
    });
    expect(answerQuestion("write me a poem", ctx).answer).toMatch(/Ridho\.dev/);
  });
});

describe("konten kosong", () => {
  it("jawab jujur saat belum ada data", () => {
    const ctx = context("en", { projects: [], experience: [], certificates: [], skills: [] });
    expect(answerQuestion("his projects", ctx).answer).toMatch(/Nothing is published/);
    expect(answerQuestion("his certificates", ctx).answer).toMatch(/Nothing is published/);
  });
});

describe("buildGreeting", () => {
  it("mengisi nama dan memberi chip", () => {
    const { intro, suggestions } = buildGreeting(context("en"));
    expect(intro).toMatch(/Ridho Arachman/);
    expect(intro).not.toContain("{name}");
    expect(suggestions.length).toBeGreaterThan(0);
    expect(suggestions.every((s) => !s.includes("{"))).toBe(true);
  });

  it("tidak menawarkan chip yang sama dua kali", () => {
    const { suggestions } = buildGreeting(context("en"));
    expect(new Set(suggestions).size).toBe(suggestions.length);
  });
});

describe("tanggal", () => {
  it("tidak menggeser tanggal 1 Januari ke bulan sebelumnya", () => {
    expect(answerQuestion("certificates", context("en")).answer).toMatch(/Jan 2024/);
  });

  it("menandai pekerjaan berjalan dengan 'Present'", () => {
    expect(answerQuestion("experience", context("en")).answer).toMatch(/Present/);
  });
});
