export interface ExperienceListData {
  id: number;
  slug: string;
  role: string;
  company: string;
  type: "Work" | "Organization" | "Freelance";
  period: string;
  location: string;
  thumbnail: string;
  description: string[];
}

export interface ExperienceListItemProps {
  exp: ExperienceListData;
  index?: number; // Ditambahkan untuk animasi staggered (bertahap)
}

export const EXPERIENCES_LIST: ExperienceListData[] = [
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
