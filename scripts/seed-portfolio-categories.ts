import "dotenv/config";
import prisma from "../src/lib/prisma";

/**
 * Seed kategori portofolio.
 *
 * Berbeda dengan `seed-portfolio.ts`, skrip ini TIDAK menghapus apa pun dan aman
 * dijalankan berulang: kategori di-`upsert` berdasarkan `slug`, jadi slug yang
 * sudah ada di-update dan slug yang baru ditambahkan. Yang perlu crecimiento
 * repositori — misalnya kategori yang belum dipakai — tidak ikut tersentuh.
 *
 * Dipakai untuk mengisi taksonomi yang kamu minta (CRM, Multi-tenant SaaS,
 * E-commerce) tanpa kehilangan kategori lama.
 */

interface Seed {
  name: string;
  slug: string;
  description: string;
  idName: string;
  idDescription: string;
}

const CATEGORIES: Seed[] = [
  {
    name: "Customer Relationship Management",
    slug: "crm",
    description:
      "Sales pipeline, contact management and customer history in one place.",
    idName: "Customer Relationship Management",
    idDescription:
      "Pipeline penjualan, manajemen kontak, dan riwayat pelanggan dalam satu tempat.",
  },
  {
    name: "Multi-tenant SaaS",
    slug: "multi-tenant-saas",
    description:
      "Multi-tenant products: isolated data per organisation, shared infrastructure.",
    idName: "Multi-tenant SaaS",
    idDescription:
      "Produk multi-tenant: data terisolasi per organisasi, infrastruktur berbagi.",
  },
  {
    name: "E-commerce",
    slug: "e-commerce",
    description:
      "Storefront, catalogue, cart and checkout for buying and selling online.",
    idName: "E-commerce",
    idDescription:
      "Toko, katalog, keranjang, dan checkout untuk jual beli online.",
  },
  {
    name: "Web Development",
    slug: "web-dev",
    description: "Web applications built with modern browser tooling.",
    idName: "Web Development",
    idDescription: "Aplikasi web yang dibangun dengan tooling browser modern.",
  },
  {
    name: "Mobile Development",
    slug: "mobile-dev",
    description: "Native and cross-platform mobile applications.",
    idName: "Mobile Development",
    idDescription: "Aplikasi mobile native maupun lintas platform.",
  },
];

/**
 * Project yang dipindah ke kategori yang lebih spesifik. Sengaja hanya berisi
 * yang sudah pasti dari judul project — menebak bahwa sebuah aplikasi adalah
 * "multi-tenant" adalah klaim arsitektur, bukan keputusan yang boleh diambil
 * seed script. Sisanya dibiarkan di kategori lamanya untuk kamu tetapkan dari
 * admin.
 */
const REASSIGN: Record<string, string> = {
  "e-commerce-platform": "e-commerce",
};

async function main() {
  console.log("Seeding kategori (upsert, tidak menghapus data)...\n");

  const bySlug = new Map<string, string>();
  for (const c of CATEGORIES) {
    const data = {
      name: c.name,
      description: c.description,
      translations: { id: { name: c.idName, description: c.idDescription } },
    };
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      create: { ...data, slug: c.slug },
      update: data,
    });
    bySlug.set(c.slug, row.id);
    console.log(`  ✓ ${c.name}  [${c.slug}]`);
  }

  console.log("\nMemindahkan project ke kategori yang lebih spesifik:");
  for (const [projectSlug, categorySlug] of Object.entries(REASSIGN)) {
    const categoryId = bySlug.get(categorySlug);
    const project = await prisma.project.findUnique({
      where: { slug: projectSlug },
      select: { id: true, title: true, category: { select: { slug: true } } },
    });
    if (!project) {
      console.log(`  - ${projectSlug}: tidak ada, dilewati`);
      continue;
    }
    if (!categoryId) {
      console.log(`  - ${projectSlug}: kategori ${categorySlug} tidak ada, dilewati`);
      continue;
    }
    if (project.category?.slug === categorySlug) {
      console.log(`  = ${project.title}: sudah di ${categorySlug}`);
      continue;
    }
    await prisma.project.update({
      where: { id: project.id },
      data: { categoryId },
    });
    console.log(
      `  ✓ ${project.title}: ${project.category?.slug ?? "(kosong)"} → ${categorySlug}`,
    );
  }

  const [catCount, projects] = await Promise.all([
    prisma.category.count(),
    prisma.project.findMany({
      select: { title: true, category: { select: { name: true, slug: true } } },
      orderBy: { order: "asc" },
    }),
  ]);

  console.log(`\nTotal kategori: ${catCount}`);
  console.log("Project per kategori:");
  for (const p of projects) {
    console.log(`  - ${p.title} → ${p.category?.name ?? "TANPA KATEGORI"}`);
  }
  const orphans = projects.filter((p) => !p.category).length;
  if (orphans > 0) {
    console.log(
      `\nPERINGATAN: ${orphans} project tanpa kategori. Pilih kategori dari admin.`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());