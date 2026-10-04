// auto-translate.test.ts
// Auto-translate wiring at the route boundary, for every entity that has an
// Indonesian override column: projects, experience, certificates, categories.
//
// Three guarantees, checked for all eight handlers (POST + PUT each):
//   1. blank `id` override + working translator  -> filled from the English base
//   2. blank `id` override + broken translator    -> stays blank, save still
//                                                   succeeds (never a 500), so
//                                                   the resolver inherits English
//   3. non-blank `id` override                    -> kept verbatim, translator
//                                                   never asked for that field
//
// One table instead of four per-entity suites: the contract is identical for
// every entity, so testing it eight times in one place is what keeps the five
// sibling route files from drifting apart.
import { beforeEach, describe, expect, it, vi } from "vitest";

const { writes } = vi.hoisted(() => ({
  writes: [] as Array<Record<string, unknown>>,
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/session", () => ({
  requireAdminSession: vi.fn(),
}));

vi.mock("@/lib/rate-limit", () => ({
  applyRateLimit: vi.fn(),
}));

vi.mock("@/lib/translate", () => ({
  translateTexts: vi.fn(async (texts: string[]) =>
    texts.map((text) => `AUTO:${text}`),
  ),
}));

vi.mock("@/lib/prisma", () => {
  const model = (findManyResult: unknown[] = []) => ({
    findMany: vi.fn(async () => findManyResult),
    count: vi.fn(async () => 0),
    findUnique: vi.fn(async () => ({ id: "row-1", slug: "stable-slug" })),
    create: vi.fn(async (args: { data: Record<string, unknown> }) => {
      writes.push(args.data);
      return { id: "new-1", slug: "stable-slug" };
    }),
    update: vi.fn(async (args: { data: Record<string, unknown> }) => {
      writes.push(args.data);
      return { id: "row-1", slug: "stable-slug" };
    }),
  });

  return {
    default: {
      project: model(),
      experience: model(),
      certificate: model(),
      // `POST /api/admin/projects` kini memvalidasi `categoryId` lebih dulu,
      // jadi findMany harus melaporkan category itu ada.
      category: model([{ id: "row-1" }]),
      rateLimit: { findUnique: vi.fn(), create: vi.fn(), update: vi.fn() },
    },
  };
});

import { applyRateLimit } from "@/lib/rate-limit";
import { requireAdminSession } from "@/lib/session";
import { translateTexts } from "@/lib/translate";
import { POST as postProject } from "./projects/route";
import { PUT as putProject } from "./projects/[id]/route";
import { POST as postExperience } from "./experience/route";
import { PUT as putExperience } from "./experience/[id]/route";
import { POST as postCertificate } from "./certificates/route";
import { PUT as putCertificate } from "./certificates/[id]/route";
import { POST as postCategory } from "./categories/route";
import { PUT as putCategory } from "./categories/[id]/route";

type Body = Record<string, unknown>;

interface Entity {
  name: string;
  /** One translatable field, used as the override target in every scenario. */
  field: string;
  /** English base value written by the admin form. */
  english: string;
  create: Body;
  update: Body;
  post: (body: Body) => Promise<Response>;
  put: (body: Body) => Promise<Response>;
}

function request(url: string, body: Body): Request {
  return new Request(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  }) as Request;
}

const putCtx = { params: Promise.resolve({ id: "row-1" }) };

const entities: Entity[] = [
  {
    name: "project",
    field: "title",
    english: "English Project Title",
    create: {
      title: "English Project Title",
      description: "English project description long enough.",
      thumbnail: "https://example.com/thumb.png",
      technologies: [],
      gallery: [],
      highlights: [],
      isPublished: true,
      order: 0,
      categoryId: "row-1",
    },
    update: {
      title: "English Project Title",
      description: "English project description long enough.",
    },
    post: (body) => postProject(request("http://x/api/admin/projects", body)),
    put: (body) =>
      putProject(request("http://x/api/admin/projects/row-1", body), putCtx),
  },
  {
    name: "experience",
    field: "title",
    english: "English Role Title",
    create: {
      title: "English Role Title",
      company: "Acme",
      type: "WORK",
      location: "Jakarta",
      startDate: "2020-01-01",
      isCurrent: false,
      description: ["English achievement bullet"],
      gallery: [],
      isPublished: true,
      order: 0,
    },
    update: {
      title: "English Role Title",
      description: ["English achievement bullet"],
    },
    post: (body) =>
      postExperience(request("http://x/api/admin/experience", body)),
    put: (body) =>
      putExperience(request("http://x/api/admin/experience/row-1", body), putCtx),
  },
  {
    name: "certificate",
    field: "title",
    english: "English Certificate Title",
    create: {
      title: "English Certificate Title",
      issuer: "Issuer Inc",
      issueDate: "2024-01-01",
      skills: [],
      summary: ["English summary point"],
      isPublished: true,
      order: 0,
    },
    update: {
      title: "English Certificate Title",
      summary: ["English summary point"],
    },
    post: (body) =>
      postCertificate(request("http://x/api/admin/certificates", body)),
    put: (body) =>
      putCertificate(
        request("http://x/api/admin/certificates/row-1", body),
        putCtx,
      ),
  },
  {
    name: "category",
    field: "name",
    english: "English Category",
    create: {
      name: "English Category",
      description: "English category description",
      order: 0,
    },
    update: {
      name: "English Category",
      description: "English category description",
    },
    post: (body) => postCategory(request("http://x/api/admin/categories", body)),
    put: (body) =>
      putCategory(request("http://x/api/admin/categories/row-1", body), putCtx),
  },
];

function storedIdOverride(field: string): string {
  const translations = writes.at(-1)?.translations as
    | { id?: Record<string, string> }
    | undefined;
  return translations?.id?.[field] ?? "";
}

function translateCalls(): string[] {
  return vi.mocked(translateTexts).mock.calls.flatMap(([texts]) => texts);
}

describe.each(entities)("$name auto-translate", (entity) => {
  const cases = [
    { verb: "POST", run: entity.post, base: entity.create, ok: 201 },
    { verb: "PUT", run: entity.put, base: entity.update, ok: 200 },
  ] as const;

  beforeEach(() => {
    writes.length = 0;
    vi.mocked(translateTexts).mockClear();
    vi.mocked(translateTexts).mockImplementation(async (texts) =>
      texts.map((text) => `AUTO:${text}`),
    );
    vi.mocked(requireAdminSession).mockResolvedValue({
      user: { id: "admin-1" },
    } as Awaited<ReturnType<typeof requireAdminSession>>);
    vi.mocked(applyRateLimit).mockResolvedValue({
      allowed: true,
      headers: {},
    } as Awaited<ReturnType<typeof applyRateLimit>>);
  });

  it.each(cases)(
    "$verb fills a blank id override from the English base",
    async ({ run, base, ok }) => {
      const res = await run({
        ...base,
        translations: { id: { [entity.field]: "" } },
      });

      expect(res.status).toBe(ok);
      expect(storedIdOverride(entity.field)).toBe(`AUTO:${entity.english}`);
    },
  );

  it.each(cases)(
    "$verb saves successfully with a blank id override when the translator fails",
    async ({ run, base, ok }) => {
      // translateOne swallows network errors, timeouts and MyMemory error
      // statuses alike and resolves to "", so this one mock covers them all.
      vi.mocked(translateTexts).mockImplementation(async (texts) =>
        texts.map(() => ""),
      );

      const res = await run({
        ...base,
        translations: { id: { [entity.field]: "" } },
      });

      expect(res.status).toBe(ok);
      expect(writes).toHaveLength(1);
      expect(storedIdOverride(entity.field)).toBe("");
    },
  );

  it.each(cases)(
    "$verb never overwrites a manual id override",
    async ({ run, base, ok }) => {
      const res = await run({
        ...base,
        translations: { id: { [entity.field]: "Judul Manual" } },
      });

      expect(res.status).toBe(ok);
      expect(storedIdOverride(entity.field)).toBe("Judul Manual");
      expect(translateCalls()).not.toContain("Judul Manual");
    },
  );
});