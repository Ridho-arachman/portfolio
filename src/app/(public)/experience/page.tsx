// app/experience/page.tsx
import { ArrowRight, Award, Briefcase, Calendar, MapPin } from "lucide-react";
import { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "All Experiences | Ridho.dev",
  description:
    "Daftar lengkap pengalaman profesional, peran kepemimpinan, dan pencapaian saya.",
};

// --- DATA (Ditambahkan properti 'thumbnail') ---
const experiences = [
  {
    id: 1,
    slug: "frontend-developer-intern",
    role: "Frontend Developer Intern",
    company: "PT Tech Startup Indonesia",
    type: "Work",
    period: "Jan 2024 - Present",
    location: "Jakarta, Indonesia (Remote)",
    thumbnail:
      "https://images.unsplash.com/photo-1498050108023-c5249f4df085?q=80&w=800&auto=format&fit=crop",
    description: [
      "Mengembangkan dan memelihara fitur UI menggunakan Next.js, TypeScript, dan Tailwind CSS.",
      "Meningkatkan performa website sebesar 30% melalui optimasi gambar, code splitting, dan caching.",
      "Berkolaborasi erat dengan tim backend untuk integrasi API RESTful dan memastikan tipe data yang aman.",
      "Mengimplementasikan unit testing menggunakan Jest dan React Testing Library untuk menjaga kualitas kode.",
    ],
  },
  {
    id: 2,
    slug: "kepala-divisi-teknologi",
    role: "Kepala Divisi Teknologi",
    company: "Himpunan Mahasiswa Sistem Informasi",
    type: "Organization",
    period: "Aug 2023 - Aug 2024",
    location: "Universitas XYZ",
    thumbnail:
      "https://images.unsplash.com/photo-1522071820081-009f0129c71c?q=80&w=800&auto=format&fit=crop",
    description: [
      "Memimpin tim yang terdiri dari 15 developer untuk membangun sistem informasi manajemen acara kampus.",
      "Mengadakan 4 workshop teknologi (React, Node.js, UI/UX) dengan total 200+ peserta.",
      "Mengelola infrastruktur server (VPS) dan database PostgreSQL untuk event organisasi berskala besar.",
    ],
  },
  {
    id: 3,
    slug: "freelance-web-developer",
    role: "Freelance Web Developer",
    company: "Self-Employed",
    type: "Freelance",
    period: "Mar 2023 - Present",
    location: "Remote",
    thumbnail:
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop",
    description: [
      "Membangun 5+ website company profile dan landing page untuk UMKM lokal menggunakan Next.js.",
      "Mengimplementasikan SEO best practices yang meningkatkan traffic organik klien hingga 40% dalam 3 bulan.",
      "Menyediakan maintenance, update konten, dan support teknis berkelanjutan kepada klien.",
    ],
  },
];

// Helper untuk ikon berdasarkan tipe pengalaman
const getTypeIcon = (type: string) => {
  switch (type) {
    case "Work":
      return <Briefcase className="w-4 h-4" />;
    case "Organization":
      return <Award className="w-4 h-4" />;
    case "Freelance":
      return <Briefcase className="w-4 h-4" />;
    default:
      return <Briefcase className="w-4 h-4" />;
  }
};

export default function ExperienceListPage() {
  return (
    <main className="min-h-screen pt-32 pb-20 bg-bg-primary">
      <div className="container mx-auto px-4 max-w-5xl">
        {/* Header */}
        <div className="text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">
            All <span className="text-gradient-elegant">Experiences</span>
          </h1>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            A comprehensive look at my professional journey, leadership roles,
            and the impact I&apos;ve made.
          </p>
        </div>

        {/* Grid List */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {experiences.map((exp) => (
            <Link
              key={exp.id}
              href={`/experience/${exp.slug}`}
              className="group block rounded-2xl border border-glass-border bg-glass-bg overflow-hidden hover:border-accent/40 hover:shadow-[0_0_30px_rgba(167,139,250,0.1)] transition-all duration-300"
            >
              {/* 1. Thumbnail Image */}
              <div className="relative h-48 w-full overflow-hidden">
                <div className="absolute inset-0 bg-accent/10 group-hover:bg-transparent transition-colors duration-500 z-10" />
                <Image
                  src={exp.thumbnail}
                  alt={exp.role}
                  fill
                  className="object-cover grayscale group-hover:grayscale-0 group-hover:scale-105 transition-all duration-700 ease-out"
                />
                {/* Badge Type di atas gambar */}
                <div className="absolute top-4 left-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-primary/80 backdrop-blur-md border border-glass-border text-xs font-semibold text-accent">
                  {getTypeIcon(exp.type)}
                  {exp.type}
                </div>
              </div>

              {/* 2. Card Content */}
              <div className="p-6">
                <div className="flex items-start justify-between mb-3">
                  <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors">
                    {exp.role}
                  </h3>
                  <ArrowRight className="w-5 h-5 text-text-muted group-hover:text-accent group-hover:translate-x-1 transition-all mt-1" />
                </div>

                <div className="space-y-1.5 mb-4">
                  <p className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    {exp.company} • {exp.location}
                  </p>
                  <p className="text-xs font-medium text-text-muted flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {exp.period}
                  </p>
                </div>

                {/* Deskripsi ringkas (digabung jadi string, dibatasi 3 baris) */}
                <p className="text-sm text-text-secondary line-clamp-3 leading-relaxed">
                  {exp.description.join(" ")}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </main>
  );
}
