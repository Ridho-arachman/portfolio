import { ProjectsPageContent } from "./projects-content";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import { getMessages } from "@/lib/translations";
import { Locale, isValidLocale, DEFAULT_LOCALE, getAlternatePaths } from "@/lib/i18n";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

interface ProjectsPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: ProjectsPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const messages = await getMessages(isValidLocale(locale) ? locale : DEFAULT_LOCALE);
  const alternates = getAlternatePaths('/projects');

  return {
    title: messages.projects.title,
    description: messages.projects.subtitle,
    alternates: {
      languages: alternates,
    },
    openGraph: {
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      alternateLocale: locale === 'id' ? 'en_US' : 'id_ID',
    },
  };
}

export const dynamic = 'force-dynamic';

export const revalidate = 3600;

const getProjects = unstable_cache(
  async () => {
    return prisma.project.findMany({
      where: { isPublished: true, ...notDeleted },
      orderBy: { order: "asc" },
      // `include: { category: true }` menarik `deletedAt` ke payload cache dan
      // kolom Date kembali jadi string setelah warm. Insiden 86d09b0.
      include: {
        category: {
          select: {
            id: true,
            name: true,
            // Spread (bukan key langsung): kolom `translations` baru ada di
            // schema.prisma, client hasil generate Batch 1 menyusul.
            ...{ translations: true },
          },
        },
      },
    });
  },
  ["public-projects"],
  // Tag `categories` ikut diambil karena payload ini menyematkan
  // `category.name`. Tanpa itu, rename atau trash kategori tidak pernah menyentuh
  // cache ini dan `/projects` menampilkan nama lama sampai TTL 3600s habis.
  { revalidate: 3600, tags: ["projects", "categories"] },
);

// `category` kini relasi wajib, jadi Prisma tidak bisa memfilternya di query
// (`where` hanya berlaku untuk relasi to-one yang nullable). Membaca
// `deletedAt` di dalam `getProjects` juga dilarang: payload-nya di-cache dan
// kolom Date akan kembali jadi string. Jadi daftar id kategori yang masih hidup
// diambil terpisah di sini — hasilnya cuma kolom id, tidak ada kolom Date,
// sehingga aman dipakai di jalur cache.
//
// Yang dikembalikan WAJIB array, bukan Set: `unstable_cache` menyimpan nilai
// sebagai JSON, dan `JSON.stringify(new Set([...]))` jadi `{}`. Setelah cache
// terisi, `Set` akan hilang dan `.has()` di bawah melempar TypeError → 500 di
// halaman /projects.
const getLiveCategoryIds = unstable_cache(
  async () => {
    const rows = await prisma.category.findMany({
      where: notDeleted,
      select: { id: true },
    });
    return rows.map((row) => row.id);
  },
  ["public-project-live-category-ids"],
  { revalidate: 3600, tags: ["categories"] },
);

export default async function ProjectsPage() {
  const [projects, liveCategoryIds] = await Promise.all([
    getProjects(),
    getLiveCategoryIds(),
  ]);
  const liveCategories = new Set(liveCategoryIds);

  return (
    <ProjectsPageContent
      projects={projects.map((project) => ({
        ...project,
        category: liveCategories.has(project.categoryId)
          ? project.category
          : null,
      }))}
    />
  );
}
