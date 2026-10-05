import "dotenv/config";
import prisma from "../src/lib/prisma";

/**
 * Seed taksonomi kategori portofolio.
 *
 * Hanya kategori. Skrip ini SENGAJA tidak menyentuh project, certificate,
 * experience, atau skill apa pun — kategori adalah label, dan menambah label
 * baru tidak boleh mengubah isi konten yang sudah dianggap final.
 *
 * Berbeda dengan `seed-portfolio.ts`, skrip ini TIDAK menghapus apa pun dan aman
 * dijalankan berulang: kategori di-`upsert` berdasarkan `slug`, jadi slug yang
 * sudah ada di-update dan slug yang baru ditambahkan. Kategori yang tidak ada
 * di daftar ini — termasuk kategori kustom yang dibuat sendiri di admin —
 * tidak ikut tersentuh.
 *
 * `name` memakai istilah industri yang dipakai apa adanya di kedua bahasa.
 * Hanya `description` yang diterjemahkan, karena deskripsi kategori adalah copy
 * yang benar-benar ditulis ulang untuk pembaca Indonesia.
 */

interface Seed {
  name: string;
  slug: string;
  /** Copy untuk DEFAULT_LOCALE (en). */
  description: string;
  /** Deskripsi versi Indonesia, dipakai sebagai override locale `id`. */
  idDescription: string;
}

const CATEGORIES: Seed[] = [
  {
    name: "Company Profile",
    slug: "company-profile",
    description:
      "Company profile, portfolio and landing pages that introduce a brand.",
    idDescription: "Profil perusahaan, portofolio, landing page",
  },
  {
    name: "Point of Sale",
    slug: "pos",
    description:
      "Point of Sale systems for retail or restaurant transactions and receipts.",
    idDescription: "Kasir, transaksi retail/resto",
  },
  {
    name: "E-commerce",
    slug: "e-commerce",
    description:
      "Online stores and product marketplaces covering catalogue to checkout.",
    idDescription: "Toko online, marketplace produk",
  },
  {
    name: "Logistics",
    slug: "logistik",
    description: "Shipping tracking plus courier and warehouse management.",
    idDescription: "Tracking pengiriman, manajemen kurir & gudang",
  },
  {
    name: "ERP",
    slug: "erp",
    description:
      "Enterprise resource planning spanning inventory, accounting and HR.",
    idDescription: "Manajemen resource perusahaan (inventory, akuntansi, HR)",
  },
  {
    name: "Customer Relationship Management",
    slug: "crm",
    description:
      "Customer relationship management with contact history and sales pipeline.",
    idDescription: "Manajemen relasi customer, sales pipeline",
  },
  {
    name: "HRIS",
    slug: "hris",
    description:
      "HR information systems covering employees, payroll and attendance.",
    idDescription: "Manajemen karyawan, payroll, absensi",
  },
  {
    name: "Learning Management System",
    slug: "lms",
    description:
      "Learning management systems for online courses and course delivery.",
    idDescription: "Platform belajar online, kursus",
  },
  {
    name: "Marketplace",
    slug: "marketplace",
    description:
      "Multi-vendor marketplaces where many sellers list on one platform.",
    idDescription: "Multi-vendor (kayak Tokopedia/Shopee versi mini)",
  },
  {
    name: "Booking and Reservation",
    slug: "booking-system",
    description:
      "Reservation systems for hotels, tickets and appointments.",
    idDescription: "Reservasi hotel, tiket, appointment",
  },
  {
    name: "Chatbot",
    slug: "chatbot",
    description: "Chatbots and customer service tooling, including AI assistants.",
    idDescription: "Live chat, AI assistant",
  },
  {
    name: "Content Management System",
    slug: "cms",
    description:
      "Content management systems backing blogs, news portals and media.",
    idDescription: "Blog, portal berita, media",
  },
  {
    name: "Forum and Community",
    slug: "forum",
    description: "Forum and community platforms built around discussion and Q&A.",
    idDescription: "Diskusi, Q&A",
  },
  {
    name: "Social Media Platform",
    slug: "social-media",
    description: "Social platforms with feeds, following and posting.",
    idDescription: "Feed, follow, posting",
  },
  {
    name: "Job Portal",
    slug: "job-portal",
    description: "Job portals listing openings and matching them to CVs.",
    idDescription: "Lowongan kerja, CV matching",
  },
  {
    name: "Real Estate Platform",
    slug: "real-estate",
    description: "Property listing platforms for renting and buying.",
    idDescription: "Listing properti, sewa/jual rumah",
  },
  {
    name: "Food Delivery",
    slug: "food-delivery",
    description: "Food delivery apps handling ordering and order tracking.",
    idDescription: "Pesan antar makanan, tracking order",
  },
  {
    name: "Ride-hailing",
    slug: "ride-hailing",
    description: "On-demand ride hailing and online transportation.",
    idDescription: "Transportasi online",
  },
  {
    name: "Project Management",
    slug: "project-management",
    description:
      "Project management tools: kanban boards and task tracking.",
    idDescription: "Kanban, task tracking (mirip Trello/Asana)",
  },
  {
    name: "Inventory and Warehouse",
    slug: "inventory-management",
    description:
      "Inventory and warehouse management for stock and storage.",
    idDescription: "Stok barang, gudang",
  },
  {
    name: "Accounting and Finance",
    slug: "accounting",
    description: "Accounting apps covering bookkeeping, invoicing and tax.",
    idDescription: "Pembukuan, invoice, pajak",
  },
  {
    name: "Telemedicine",
    slug: "telemedicine",
    description:
      "Healthcare and telemedicine: online consultations and medical records.",
    idDescription: "Konsultasi dokter online, rekam medis",
  },
  {
    name: "Event Management",
    slug: "event-management",
    description:
      "Event management with ticketing and attendee registration.",
    idDescription: "Ticketing, registrasi event",
  },
  {
    name: "Survey and Form Builder",
    slug: "form-builder",
    description:
      "Survey and form builders for questionnaires and feedback.",
    idDescription: "Kuesioner, feedback",
  },
  {
    name: "Analytics Dashboard",
    slug: "analytics-dashboard",
    description:
      "Analytics dashboards for monitoring data and business reporting.",
    idDescription: "Monitoring data & laporan bisnis",
  },
  {
    name: "Payment Gateway and Wallet",
    slug: "payment-gateway",
    description:
      "Payment gateways and digital wallets for online transactions.",
    idDescription: "Dompet digital, transaksi online",
  },
  {
    name: "Rental Platform",
    slug: "rental-platform",
    description: "Rental platforms booking equipment, vehicles or property.",
    idDescription: "Sewa alat, kendaraan, properti",
  },
  {
    name: "Auction Platform",
    slug: "auction",
    description: "Online auction platforms for bidding.",
    idDescription: "Lelang online",
  },
  {
    name: "Crowdfunding",
    slug: "crowdfunding",
    description: "Crowdfunding platforms for donations and fundraising.",
    idDescription: "Donasi, penggalangan dana",
  },
  {
    name: "News and Media Portal",
    slug: "news-portal",
    description:
      "News and media portals publishing articles and online magazines.",
    idDescription: "Berita, artikel, majalah online",
  },
  {
    name: "Ticketing and Helpdesk",
    slug: "helpdesk",
    description:
      "Ticketing and helpdesk systems for support tickets and complaints.",
    idDescription: "Support ticket, customer complaint",
  },
  {
    name: "Fleet Management",
    slug: "fleet-management",
    description: "Fleet management for vehicle and asset fleets.",
    idDescription: "Manajemen armada kendaraan",
  },
  {
    name: "School and Campus Management",
    slug: "school-management",
    description:
      "School and campus management for academics, grades and attendance.",
    idDescription: "Akademik, nilai, absensi siswa",
  },
  {
    name: "POS and Inventory Hybrid",
    slug: "pos-inventory",
    description:
      "Combined POS and inventory, the usual shape for retail businesses.",
    idDescription: "Kasir sekaligus manajemen stok (biasa buat retail)",
  },
  {
    name: "Multi-tenant SaaS",
    slug: "multi-tenant-saas",
    description:
      "Products sold as a service to many clients, with data isolated per tenant.",
    idDescription: "Aplikasi yang dijual sebagai layanan ke banyak client",
  },
];

async function main() {
  console.log("Seeding kategori (upsert, tidak menyentuh konten)...\n");

  for (const c of CATEGORIES) {
    const data = {
      name: c.name,
      description: c.description,
      translations: { id: { name: c.name, description: c.idDescription } },
    };
    await prisma.category.upsert({
      where: { slug: c.slug },
      create: { ...data, slug: c.slug },
      update: data,
    });
    console.log(`  ✓ ${c.name}  [${c.slug}]`);
  }

  const total = await prisma.category.count();
  const assigned = await prisma.project.count();

  console.log(`\nTotal kategori di database: ${total}`);
  console.log(`Project: ${assigned} (tidak diubah oleh skrip ini)`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());