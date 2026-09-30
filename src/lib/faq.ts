// lib/faq.ts
// PortoBot menjawab pertanyaan tentang pemilik situs TANPA model bahasa.
//
// Tidak ada LLM di jalur ini, dan itu keputusan, bukan keterbatasan. Bot hanya
// bisa mengembalikan kalimat yang dirakit dari data yang sudah ada di database
// (settings + projects/experience/certificates/skills). Tidak ada generator,
// jadi tidak ada yang bisa disuruh keluar topik, dipakai menulis spam, atau
// dibuat mengarang fakta. Pertanyaan di luar topik mendapat jawaban penutup.
//
// Modul ini murni: tanpa I/O, tanpa React, tanpa `next/*`. Route handler yang
// ambil data, lalu memanggil `answerQuestion`. Itu yang membuat seluruh
// kecocokan intent bisa diuji tanpa database.

import { addLocaleToPath, type Locale } from "@/lib/i18n";
import type { SiteSettings } from "@/lib/settings";
import type { Messages } from "@/lib/translation-types";

/**
 * Bentuk facts Deliberately lebih sempit dari baris Prisma: route handler memilih
 * hanya kolom yang dipakai di sini, jadi menambah kolom database tidak mengubah
 * kontrak modul ini.
 */
export type FaqProject = {
  slug: string;
  title: string;
  description: string;
  liveUrl: string | null;
  repoUrl: string | null;
  technologies: string[];
  role: string | null;
  year: string | null;
};

export type FaqExperience = {
  slug: string;
  title: string;
  company: string;
  startDate: Date;
  endDate: Date | null;
  isCurrent: boolean;
};

export type FaqCertificate = {
  slug: string;
  title: string;
  issuer: string;
  issueDate: Date;
};

export type FaqSkill = { name: string; category: string };

export type FaqContext = {
  locale: Locale;
  messages: Messages;
  settings: SiteSettings;
  projects: FaqProject[];
  experience: FaqExperience[];
  certificates: FaqCertificate[];
  skills: FaqSkill[];
};

export type FaqLink = { label: string; href: string };

export type FaqReply = {
  answer: string;
  links?: FaqLink[];
  suggestions?: string[];
};

export type FaqIntent =
  | "identity"
  | "skills"
  | "projects"
  | "experience"
  | "certificates"
  | "education"
  | "availability"
  | "contact";

/**
 * Kata kunci per intent, per locale. `Record<Locale, ...>` bukan `Partial`:
 * kalau ada locale baru, TypeScript memaksa kata kuncinya diisi, bukan diam-diam
 * membuat bot-nya lumpuh di bahasa itu.
 *
 * Substring match, bukan word-boundary. Konsekuensinya "skill" ikut cocok pada
 * "skilled" — tidak apa-apa, jawaban yang meleset masih tentang pemilik situs.
 * Yang penting matching tetap bisa ditebak, dan tiap intent punya beberapa
 * sinonim sehingga yang wins bisa dihitung.
 *
 * Urutan array = prioritas. Skor seri dimenangkan oleh intent yang lebih dulu,
 * jadi `availability` ditulis sebelum `contact`: "are you available to hire"
 * mengandung kata dari keduanya, dan availability yang benar.
 */
const INTENTS: readonly { id: FaqIntent; keywords: Record<Locale, readonly string[]> }[] = [
  {
    id: "identity",
    keywords: {
      en: ["who", "introduce", "introduction", "profile", "biodata", "about you", "about him"],
      id: ["siapa", "perkenalan", "profil", "biodata", "nama lengkap", "tentang kamu", "tentang anda"],
    },
  },
  {
    id: "skills",
    keywords: {
      en: ["skill", "stack", "technolog", "framework", "tool", "expertise", "proficient", "what can he do", "what can you do", "language"],
      id: ["skill", "teknologi", "framework", "tools", "kemampuan", "keahlian", "bisa apa", "ahli", "bahasa pemrograman"],
    },
  },
  {
    id: "projects",
    keywords: {
      en: ["project", "portfolio", "built", "build", "made", "app", "application", "website", "repo", "repository", "codebase"],
      id: ["project", "proyek", "karya", "aplikasi", "website", "situs", "repo", "repository", "portofolio", "dibuat"],
    },
  },
  {
    id: "experience",
    keywords: {
      en: ["experience", "career", "job", "internship", "intern", "company", "employed", "position", "work history", "previous work", "cv"],
      id: ["pengalaman", "karier", "karir", "kerja", "magang", "perusahaan", "jabatan", "riwayat", "pernah"],
    },
  },
  {
    id: "certificates",
    keywords: {
      en: ["certificate", "certification", "certified", "credential", "licence", "license"],
      id: ["sertifikat", "sertifikasi", "kredensial", "lisensi"],
    },
  },
  {
    id: "education",
    keywords: {
      en: ["education", "degree", "major", "studied", "study", "university", "college", "school", "graduate", "bachelor", "alma mater"],
      id: ["kuliah", "pendidikan", "gelar", "jurusan", "kampus", "sekolah", "wisuda", "sarjana", "alumni"],
    },
  },
  {
    id: "availability",
    keywords: {
      en: ["available", "availability", "freelance", "full time", "full-time", "remote", "open for", "taking work", "job opening", "not looking"],
      id: ["tersedia", "ketersediaan", "freelance", "full time", "remote", "buka", "lowongan", "menerima", "melamar"],
    },
  },
  {
    id: "contact",
    keywords: {
      en: ["contact", "email", "reach", "hire", "dm", "social", "github", "linkedin", "twitter", "in touch", "talk to", "message", "connect"],
      id: ["kontak", "email", "hubungi", "menghubungi", "rekrut", "github", "linkedin", "twitter", "sosial", "dm"],
    },
  },
];

/**
 * Kata umum yang tidak boleh jadi bukti kecocokan project. Tanpa ini, "tolong
 * ceritakan tentang project yang pernah dibuat" akan mediocre setiap judul
 * project karena kata "project"/"dibuat" ada di mana-mana.
 */
const PROJECT_STOPWORDS = new Set([
  "project", "proyek", "aplikasi", "application", "website", "situs", "sistem", "system",
  "portal", "platform", "app", "web", "the", "and", "for", "with", "from", "yang", "dan",
  "untuk", "dari", "adalah", "sebuah",
]);

/**
 * Normalisasi pertanyaan dan judul project ke ruang yang sama: huruf kecil,
 * aksen dilepas, tanda baca jadi spasi.
 * Satu fungsi untuk dua sisi perbandingan — kalau berbeda normalisasi, skor
 * selalu nol dan bot hanya bisa menjawab sapaan.
 */
export function normalizeFaqText(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .trim();
}

function scoreIntent(haystack: string, locale: Locale): { intent: FaqIntent; score: number } {
  let best: { intent: FaqIntent; score: number } | undefined;

  for (const { id, keywords } of INTENTS) {
    const score = keywords[locale].filter((keyword) => haystack.includes(keyword)).length;
    // `>` bukan `>=`: seri jatuh ke intent yang lebih dulu di array.
    if (score > 0 && (!best || score > best.score)) best = { intent: id, score };
  }

  return best ?? { intent: "identity", score: 0 };
}

/**
 * Cari project yang disebutkan spesifik ("ceritakan project Portofolio").
 * Diperiksa sebelum intent umum, karena "tanya tentang project-about" dan
 * "daftar semua project" sama-sama mengandung kata "project".
 *
 * Syaratnya >= 2 kata judul yang cocok, bukan 1: satu kata umum seperti
 * "website" ada di banyak judul dan akan salah mengarahkan. Slug yang utuh
 * langsung menang karena itu tidak mungkin kebetulan.
 */
function matchProject(haystack: string, projects: readonly FaqProject[]): FaqProject | undefined {
  let best: { project: FaqProject; score: number } | undefined;

  for (const project of projects) {
    const slug = normalizeFaqText(project.slug);
    if (slug.length >= 4 && haystack.includes(slug)) return project;

    const words = normalizeFaqText(project.title)
      .split(" ")
      .filter((word) => word.length >= 4 && !PROJECT_STOPWORDS.has(word));
    const score = words.filter((word) => haystack.includes(word)).length;

    if (score >= 2 && (!best || score > best.score)) best = { project, score };
  }

  return best?.project;
}

function formatMonthYear(value: Date, locale: Locale): string {
  // Kolom tanggal di admin disimpan sebagai date-only, jadi tanpa timeZone UTC
  // baris "2024-01-01" bisa tampil jadi Desember di timezone negatif.
  return new Intl.DateTimeFormat(locale === "id" ? "id-ID" : "en-US", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  }).format(value);
}

function projectHref(ctx: FaqContext, slug: string): string {
  return addLocaleToPath(`/projects/${slug}`, ctx.locale);
}

/** Saran lanjutan. Kunci chip sengaja dibuat retroaktif: pakai `??` biar
 *  locale baru tidak menggagalkan seluruh jawaban. */
function suggestionsFor(ctx: FaqContext, intent: FaqIntent): string[] {
  const { messages: t, settings } = ctx;
  const name = settings.fullName;
  const all = {
    identity: t.faq.suggestions.identity,
    skills: t.faq.suggestions.skills,
    projects: t.faq.suggestions.projects,
    experience: t.faq.suggestions.experience,
    certificates: t.faq.suggestions.certificates,
    contact: t.faq.suggestions.contact,
  };

  // Jangan menawarkan chip yang sama dengan pertanyaan yang baru dijawab.
  const skip = intent === "identity" ? "identity" : intent === "contact" ? "contact" : "identity";
  const order: FaqIntent[] = ["projects", "skills", "experience", "certificates", "contact", "identity"];
  const keys = order.filter((key) => key !== skip);

  return keys.slice(0, 3).map((key) => (all[key as keyof typeof all] ?? "").replaceAll("{name}", name)).filter(Boolean);
}

function renderIdentity(ctx: FaqContext): FaqReply {
  const { messages: t, settings } = ctx;
  return {
    answer: t.faq.answers.identity
      .replaceAll("{name}", settings.fullName)
      .replaceAll("{title}", settings.jobTitle)
      .replaceAll("{location}", t.contact.location)
      .replaceAll("{bio}", settings.bio),
    suggestions: suggestionsFor(ctx, "identity"),
  };
}

function renderSkills(ctx: FaqContext): FaqReply {
  const { messages: t, settings } = ctx;
  if (!ctx.skills.length) return { answer: t.faq.none, suggestions: suggestionsFor(ctx, "skills") };

  const groups = new Map<string, string[]>();
  for (const skill of ctx.skills) {
    const bucket = groups.get(skill.category) ?? [];
    bucket.push(skill.name);
    groups.set(skill.category, bucket);
  }

  const categories = t.skills.categories as Record<string, string | undefined>;
  const lines = [...groups.entries()].map(
    ([category, names]) => `• ${categories[category] ?? category}: ${names.join(", ")}`,
  );

  return {
    answer: t.faq.answers.skills
      .replaceAll("{name}", settings.fullName)
      .replaceAll("{groups}", lines.join("\n")),
    suggestions: suggestionsFor(ctx, "skills"),
  };
}

function renderProject(ctx: FaqContext, project: FaqProject): FaqReply {
  const { messages: t } = ctx;
  const links: FaqLink[] = [{ label: project.title, href: projectHref(ctx, project.slug) }];
  if (project.liveUrl) links.push({ label: project.title, href: project.liveUrl });
  if (project.repoUrl) links.push({ label: "Source", href: project.repoUrl });

  return {
    answer: t.faq.answers.project
      .replaceAll("{title}", project.title)
      .replaceAll("{year}", project.year ?? "—")
      .replaceAll("{role}", project.role ?? project.technologies.join(", "))
      .replaceAll("{tech}", project.technologies.join(", "))
      .replaceAll("{description}", project.description)
      .replaceAll("{url}", projectHref(ctx, project.slug)),
    links,
    suggestions: suggestionsFor(ctx, "projects"),
  };
}

function renderProjects(ctx: FaqContext): FaqReply {
  const { messages: t, settings } = ctx;
  if (!ctx.projects.length) return { answer: t.faq.none, suggestions: suggestionsFor(ctx, "projects") };

  const lines = ctx.projects.map(
    (project) => `• ${project.title}${project.year ? ` (${project.year})` : ""}`,
  );

  return {
    answer: t.faq.answers.projects
      .replaceAll("{name}", settings.fullName)
      .replaceAll("{count}", String(ctx.projects.length))
      .replaceAll("{items}", lines.join("\n")),
    links: ctx.projects.map((project) => ({ label: project.title, href: projectHref(ctx, project.slug) })),
    suggestions: suggestionsFor(ctx, "projects"),
  };
}

function renderExperience(ctx: FaqContext): FaqReply {
  const { messages: t, settings } = ctx;
  if (!ctx.experience.length) return { answer: t.faq.none, suggestions: suggestionsFor(ctx, "experience") };

  const lines = ctx.experience.map((item) => {
    const end = item.isCurrent || !item.endDate ? t.faq.present : formatMonthYear(item.endDate, ctx.locale);
    return `• ${item.title} — ${item.company} (${formatMonthYear(item.startDate, ctx.locale)} – ${end})`;
  });

  return {
    answer: t.faq.answers.experience
      .replaceAll("{name}", settings.fullName)
      .replaceAll("{items}", lines.join("\n")),
    suggestions: suggestionsFor(ctx, "experience"),
  };
}

function renderCertificates(ctx: FaqContext): FaqReply {
  const { messages: t, settings } = ctx;
  if (!ctx.certificates.length) return { answer: t.faq.none, suggestions: suggestionsFor(ctx, "certificates") };

  const lines = ctx.certificates.map(
    (item) => `• ${item.title} — ${item.issuer} (${formatMonthYear(item.issueDate, ctx.locale)})`,
  );

  return {
    answer: t.faq.answers.certificates
      .replaceAll("{name}", settings.fullName)
      .replaceAll("{items}", lines.join("\n")),
    links: ctx.certificates.map((item) => ({ label: item.title, href: addLocaleToPath(`/certificates/${item.slug}`, ctx.locale) })),
    suggestions: suggestionsFor(ctx, "certificates"),
  };
}

/**
 * Université dan tahun lulus TIDAK ada di repo mana pun — `about.university` dan
 * `about.year` cuma label tanpa nilai, dan `about-content.tsx` memang tidak
 * merendernya. Jadi jawaban ini sengaja hanya menyebut gelar dan jurusan.
 * Jangan tambahkan nama kampus dari hasil inferensi: lebih baik bot jujur
 * bilang tidak tahu daripada salah.
 */
function renderEducation(ctx: FaqContext): FaqReply {
  const { messages: t, settings } = ctx;
  return {
    answer: t.faq.answers.education
      .replaceAll("{name}", settings.fullName)
      .replaceAll("{degree}", t.about.degree)
      .replaceAll("{major}", t.about.major),
    suggestions: suggestionsFor(ctx, "education"),
  };
}

function renderAvailability(ctx: FaqContext): FaqReply {
  const { messages: t, settings } = ctx;
  return {
    answer: t.faq.answers.availability
      .replaceAll("{name}", settings.fullName)
      .replaceAll("{status}", t.about.badgeOpen),
    suggestions: suggestionsFor(ctx, "availability"),
  };
}

function renderContact(ctx: FaqContext): FaqReply {
  const { messages: t, settings } = ctx;
  // Peta kolom -> label ditulis ulang di sini, bukan mengimpor
  // `resolveSocialLinks`: helper itu membawa `icon` komponen react-icons yang
  // tidak pernah dipakai di dalam teks, dan route handler tidak butuh viewport.
  const email = settings.contactEmail.trim();
  const candidates: [string, string][] = [
    ["Email", email ? `mailto:${email}` : ""],
    ["GitHub", settings.githubUrl.trim()],
    ["LinkedIn", settings.linkedinUrl.trim()],
    ["X (Twitter)", settings.twitterUrl.trim()],
  ];
  const links: FaqLink[] = candidates
    .filter(([, href]) => href)
    .map(([label, href]) => ({ label, href }));

  return {
    answer: t.faq.answers.contact
      .replaceAll("{name}", settings.fullName)
      .replaceAll("{links}", links.map((link) => `• ${link.label}: ${link.href}`).join("\n") || t.faq.none)
      .replaceAll("{location}", t.contact.location)
      .replaceAll("{responseTime}", t.contact.responseTimeValue),
    links,
    suggestions: suggestionsFor(ctx, "contact"),
  };
}

/**
 * Titik masuk tunggal: pertanyaan + data -> jawaban.
 *
 * `question` kosong bukan error, itu permintaan sapaan — pemanggil akan memakai
 * `buildGreeting`. Pertanyaan yang tidak match intent apa pun jatuh ke
 * jawaban penutup, bukan tebakan intent terdekat: gagal menjawab lebih baik
 * daripada menjawab hal yang tidak ditanya.
 */
export function answerQuestion(question: string, ctx: FaqContext): FaqReply {
  const haystack = normalizeFaqText(question);
  const project = matchProject(haystack, ctx.projects);
  if (project) return renderProject(ctx, project);

  const { intent, score } = scoreIntent(haystack, ctx.locale);
  if (score === 0) {
    const { messages: t, settings } = ctx;
    return {
      answer: t.faq.fallback
        .replaceAll("{name}", settings.fullName)
        .replaceAll("{contact}", settings.contactEmail || settings.siteName),
      suggestions: suggestionsFor(ctx, "identity"),
    };
  }

  switch (intent) {
    case "skills":
      return renderSkills(ctx);
    case "projects":
      return renderProjects(ctx);
    case "experience":
      return renderExperience(ctx);
    case "certificates":
      return renderCertificates(ctx);
    case "education":
      return renderEducation(ctx);
    case "availability":
      return renderAvailability(ctx);
    case "contact":
      return renderContact(ctx);
    case "identity":
      return renderIdentity(ctx);
  }
}

/** Sapaan pembuka, juga hasil dari pertanyaan kosong. */
export function buildGreeting(ctx: FaqContext): { intro: string; suggestions: string[] } {
  const { messages: t, settings } = ctx;
  return {
    intro: t.faq.intro.replaceAll("{name}", settings.fullName),
    suggestions: suggestionsFor(ctx, "identity").slice(0, 4),
  };
}
