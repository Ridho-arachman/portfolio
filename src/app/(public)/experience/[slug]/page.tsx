// app/experience/[slug]/page.tsx
"use client";

import { useScroll, useTransform } from "framer-motion";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  Briefcase,
  Calendar,
  CheckCircle2,
  Image as ImageIcon,
  MapPin,
  X,
} from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { use, useRef, useState } from "react";

// --- MOCK DATA ---
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
    gallery: [
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=800&auto=format&fit=crop",
    ],
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
    gallery: [
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=800&auto=format&fit=crop",
    ],
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
    gallery: [
      "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=800&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=800&auto=format&fit=crop",
    ],
    description: [
      "Membangun 5+ website company profile dan landing page untuk UMKM lokal menggunakan Next.js.",
      "Mengimplementasikan SEO best practices yang meningkatkan traffic organik klien hingga 40% dalam 3 bulan.",
      "Menyediakan maintenance, update konten, dan support teknis berkelanjutan kepada klien.",
    ],
  },
];

// KOMPONEN UTAMA (Single File)
export default function ExperienceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  // Trik Next.js 15+: Gunakan React.use() untuk unwrap Promise di Client Component
  const { slug } = use(params);
  const exp = experiences.find((e) => e.slug === slug);

  if (!exp) {
    notFound();
  }

  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end start"],
  });

  // Parallax effect untuk header image
  const headerY = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const headerScale = useTransform(scrollYProgress, [0, 1], [1, 1.1]);
  const headerOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const currentIndex = experiences.findIndex((e) => e.slug === exp.slug);
  const prevExp = currentIndex > 0 ? experiences[currentIndex - 1] : null;
  const nextExp =
    currentIndex < experiences.length - 1
      ? experiences[currentIndex + 1]
      : null;
  const TypeIcon = exp.type === "Organization" ? Award : Briefcase;

  return (
    <>
      <div ref={containerRef} className="min-h-screen bg-bg-primary">
        {/* ==========================================
            HERO HEADER WITH PARALLAX
        ========================================== */}
        <div className="relative h-[60vh] md:h-[70vh] overflow-hidden">
          <m.div
            style={{ y: headerY, scale: headerScale }}
            className="absolute inset-0"
          >
            <Image
              src={exp.thumbnail}
              alt={exp.role}
              fill
              className="object-cover"
              priority
            />
          </m.div>

          <div className="absolute inset-0 bg-linear-to-t from-bg-primary via-bg-primary/60 to-transparent" />
          <div className="absolute inset-0 bg-linear-to-b from-bg-primary/40 to-transparent" />

          <div className="absolute top-24 left-0 right-0 z-20">
            <div className="container mx-auto px-4 max-w-5xl">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm text-text-secondary hover:text-accent transition-colors group"
              >
                <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                Kembali ke Halaman About
              </Link>
            </div>
          </div>

          <m.div
            style={{ opacity: headerOpacity }}
            className="absolute bottom-0 left-0 right-0 z-10 pb-12"
          >
            <div className="container mx-auto px-4 max-w-5xl">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 0.2 }}
              >
                <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-accent/20 backdrop-blur-md border border-accent/30 text-xs font-semibold text-accent mb-4">
                  <TypeIcon className="w-3.5 h-3.5" />
                  {exp.type}
                </div>
                <h1 className="text-4xl md:text-6xl font-bold text-text-primary mb-4 leading-tight">
                  {exp.role}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm md:text-base text-text-secondary">
                  <span className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-accent" /> {exp.company} •{" "}
                    {exp.location}
                  </span>
                  <span className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-accent" /> {exp.period}
                  </span>
                </div>
              </m.div>
            </div>
          </m.div>
        </div>

        {/* ==========================================
            MAIN CONTENT
        ========================================== */}
        <div className="container mx-auto px-4 max-w-5xl py-16 md:py-24">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
            {/* Main Description */}
            <div className="md:col-span-2 space-y-8">
              <m.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6">
                  <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                  Pencapaian & Tanggung Jawab
                </h2>
                <ul className="space-y-6">
                  {exp.description.map((point, idx) => (
                    <m.li
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: idx * 0.1 }}
                      className="flex items-start gap-4 text-text-secondary leading-relaxed text-base md:text-lg"
                    >
                      <span className="mt-2.5 w-2 h-2 rounded-full bg-accent shrink-0 shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
                      <span>{point}</span>
                    </m.li>
                  ))}
                </ul>
              </m.div>
            </div>

            {/* Sidebar: Gallery */}
            {exp.gallery && exp.gallery.length > 0 && (
              <m.div
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="md:col-span-1"
              >
                <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-6 flex items-center gap-3">
                  <ImageIcon className="w-6 h-6 md:w-8 md:h-8 text-accent" />
                  Galeri
                </h2>
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                  {exp.gallery.map((img, idx) => (
                    <m.div
                      key={idx}
                      initial={{ opacity: 0, scale: 0.9 }}
                      whileInView={{ opacity: 1, scale: 1 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.4, delay: idx * 0.1 }}
                      whileHover={{ scale: 1.05 }}
                      className="relative aspect-square rounded-xl overflow-hidden border border-glass-border group cursor-pointer"
                      onClick={() => setSelectedImage(img)}
                    >
                      <Image
                        src={img}
                        alt={`Gallery ${idx + 1}`}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                      />
                      <div className="absolute inset-0 bg-accent/0 group-hover:bg-accent/10 transition-colors duration-300" />
                    </m.div>
                  ))}
                </div>
              </m.div>
            )}
          </div>

          {/* ==========================================
              PREVIOUS / NEXT NAVIGATION
          ========================================== */}
          <m.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="mt-24 pt-12 border-t border-glass-border"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {prevExp ? (
                <Link
                  href={`/experience/${prevExp.slug}`}
                  className="group p-6 rounded-2xl border border-glass-border bg-glass-bg hover:border-accent/40 hover:bg-accent-muted/10 transition-all duration-300"
                >
                  <div className="flex items-center gap-2 text-xs text-text-muted mb-2">
                    <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" />{" "}
                    Pengalaman Sebelumnya
                  </div>
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
                    {prevExp.role}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {prevExp.company}
                  </p>
                </Link>
              ) : (
                <div />
              )}

              {nextExp ? (
                <Link
                  href={`/experience/${nextExp.slug}`}
                  className="group p-6 rounded-2xl border border-glass-border bg-glass-bg hover:border-accent/40 hover:bg-accent-muted/10 transition-all duration-300 text-right"
                >
                  <div className="flex items-center justify-end gap-2 text-xs text-text-muted mb-2">
                    Pengalaman Selanjutnya{" "}
                    <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                  </div>
                  <h3 className="text-lg font-bold text-text-primary group-hover:text-accent transition-colors">
                    {nextExp.role}
                  </h3>
                  <p className="text-sm text-text-secondary mt-1">
                    {nextExp.company}
                  </p>
                </Link>
              ) : (
                <div />
              )}
            </div>
          </m.div>
        </div>
      </div>

      {/* ==========================================
          LIGHTBOX MODAL
      ========================================== */}
      {selectedImage && (
        <m.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-bg-primary/95 backdrop-blur-xl p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            onClick={() => setSelectedImage(null)}
            className="absolute top-6 right-6 p-2 rounded-full bg-glass-bg border border-glass-border hover:bg-accent-muted transition-colors"
          >
            <X className="w-6 h-6 text-text-primary" />
          </button>
          <m.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            className="relative max-w-5xl w-full aspect-video"
            onClick={(e) => e.stopPropagation()}
          >
            <Image
              src={selectedImage}
              alt="Full view"
              fill
              className="object-contain"
            />
          </m.div>
        </m.div>
      )}
    </>
  );
}
