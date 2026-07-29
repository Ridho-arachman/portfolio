"use client";

import { useScroll, useTransform } from "framer-motion";
import { ArrowRight, Award, Briefcase, Calendar, MapPin } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

// --- MOCK DATA (Ditambahkan 'slug' untuk routing) ---
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
      "https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1551288049-bebda4e38f71?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1555099962-4199c345e5dd?q=80&w=400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1531482615713-2afd69097998?q=80&w=400&auto=format&fit=crop",
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
      "https://images.unsplash.com/photo-1547658719-da2b51169166?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?q=80&w=400&auto=format&fit=crop",
      "https://images.unsplash.com/photo-1507238691740-187a5b1d37b8?q=80&w=400&auto=format&fit=crop",
    ],
    description: [
      "Membangun 5+ website company profile dan landing page untuk UMKM lokal menggunakan Next.js.",
      "Mengimplementasikan SEO best practices yang meningkatkan traffic organik klien hingga 40% dalam 3 bulan.",
      "Menyediakan maintenance, update konten, dan support teknis berkelanjutan kepada klien.",
    ],
  },
];

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

// --- SUB-COMPONENT: Experience Teaser Card ---
function ExperienceCard({
  exp,
  index,
  isLeft,
}: {
  exp: (typeof experiences)[0];
  index: number;
  isLeft: boolean;
}) {
  // Hanya ambil 2 poin pertama untuk teaser
  const teaserDescription = exp.description.slice(0, 2);

  return (
    <m.div
      initial={{ opacity: 0, y: 50 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6, delay: index * 0.1, ease: "easeOut" }}
      className={`relative flex flex-col md:flex-row gap-8 ${isLeft ? "md:flex-row-reverse" : ""}`}
    >
      {/* Dot di tengah garis */}
      <div className="absolute left-4 md:left-1/2 w-4 h-4 rounded-full bg-bg-primary border-2 border-accent -translate-x-1/2 mt-8 z-10 shadow-[0_0_10px_rgba(167,139,250,0.5)]" />

      {/* Konten Kartu */}
      <div
        className={`flex-1 ${isLeft ? "md:text-right md:pr-12" : "md:pl-12"} pl-12 md:pl-0`}
      >
        <m.div
          whileHover={{ y: -4 }}
          className="group p-0 rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl overflow-hidden hover:border-accent/40 hover:shadow-[0_0_30px_rgba(167,139,250,0.1)] transition-all duration-300"
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
            <div
              className={`absolute top-4 z-20 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-bg-primary/80 backdrop-blur-md border border-glass-border text-xs font-semibold text-accent ${isLeft ? "right-4" : "left-4"}`}
            >
              {getTypeIcon(exp.type)}
              {exp.type}
            </div>
          </div>

          {/* 2. Card Content */}
          <div className="p-6 space-y-4">
            <div>
              <h3 className="text-xl font-bold text-text-primary group-hover:text-accent transition-colors mb-1">
                {exp.role}
              </h3>
              <p className="text-sm font-medium text-text-secondary flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 shrink-0" />
                {exp.company} • {exp.location}
              </p>
              <p className="text-xs font-medium text-text-muted mt-1 flex items-center gap-1.5">
                <Calendar className="w-3.5 h-3.5" />
                {exp.period}
              </p>
            </div>

            {/* Teaser Description */}
            <div
              className={`space-y-2 text-sm text-text-secondary leading-relaxed ${isLeft ? "md:text-right" : ""}`}
            >
              {teaserDescription.map((point, idx) => (
                <div
                  key={idx}
                  className={`flex items-start gap-2 ${isLeft ? "md:flex-row-reverse" : ""}`}
                >
                  {!isLeft && (
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0" />
                  )}
                  <span>{point}</span>
                  {isLeft && (
                    <span className="mt-1.5 w-1.5 h-1.5 rounded-full bg-accent shrink-0 order-first" />
                  )}
                </div>
              ))}
            </div>

            {/* 3. Gallery Teaser & See More Button */}
            <div className="pt-4 border-t border-glass-border space-y-4">
              {/* Gallery Preview */}
              {exp.gallery && exp.gallery.length > 0 && (
                <div className="flex gap-2">
                  {exp.gallery.slice(0, 3).map((img, idx) => (
                    <div
                      key={idx}
                      className="relative shrink-0 w-16 h-16 rounded-md overflow-hidden border border-glass-border"
                    >
                      <Image
                        src={img}
                        alt={`Preview ${idx + 1}`}
                        fill
                        className="object-cover grayscale group-hover:grayscale-0 transition-all"
                      />
                    </div>
                  ))}
                  {exp.gallery.length > 3 && (
                    <div className="shrink-0 w-16 h-16 rounded-md bg-accent/10 border border-accent/30 flex items-center justify-center text-xs font-bold text-accent">
                      +{exp.gallery.length - 3}
                    </div>
                  )}
                </div>
              )}

              {/* SEE MORE BUTTON */}
              <Link
                href={`/experience/${exp.slug}`}
                className={`group/btn inline-flex items-center gap-2 text-sm font-semibold text-accent hover:text-accent-hover transition-colors ${isLeft ? "md:flex-row-reverse" : ""}`}
              >
                Lihat Detail Lengkap
                <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
              </Link>
            </div>
          </div>
        </m.div>
      </div>

      {/* Spacer untuk sisi yang kosong di desktop */}
      <div className="hidden md:block flex-1" />
    </m.div>
  );
}

// --- MAIN SECTION (Tetap sama seperti sebelumnya) ---
export function ExperienceSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const scaleY = useTransform(scrollYProgress, [0.1, 0.9], [0, 1]);

  return (
    <section
      ref={sectionRef}
      className="relative py-20 md:py-32 overflow-hidden"
    >
      <m.div
        style={{ y: useTransform(scrollYProgress, [0, 1], [0, 100]) }}
        className="absolute top-1/4 left-1/2 -translate-x-1/2 w-125 h-125 bg-accent/5 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container relative z-10 mx-auto px-4">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          transition={{ duration: 0.6 }}
          className="text-center mb-16 md:mb-24"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
            My Journey
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Work <span className="text-gradient-elegant">Experience</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            A timeline of my professional growth, leadership roles, and
            real-world impact.
          </p>
        </m.div>

        <div className="relative max-w-5xl mx-auto">
          <div className="absolute left-4 md:left-1/2 top-0 bottom-0 w-px bg-glass-border -translate-x-1/2" />
          <m.div
            style={{ scaleY, transformOrigin: "top" }}
            className="absolute left-4 md:left-1/2 top-0 w-px bg-accent -translate-x-1/2 shadow-[0_0_10px_rgba(167,139,250,0.5)]"
          />
          <div className="space-y-12 md:space-y-16">
            {experiences.map((exp, index) => (
              <ExperienceCard
                key={exp.id}
                exp={exp}
                index={index}
                isLeft={index % 2 === 0}
              />
            ))}
          </div>
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: false, amount: 0.5 }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-16 md:mt-24"
          >
            <Link
              href="/experience"
              className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300"
            >
              Lihat Semua Pengalaman
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </m.div>
        </div>
      </div>
    </section>
  );
}
