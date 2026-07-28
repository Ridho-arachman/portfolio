// _components/sections/about-section.tsx
"use client";

import { TechMarquee } from "@/components/ui/tech-marquee";
import { useScroll, useTransform } from "framer-motion";
import { Code2, Database, Globe, Sparkles } from "lucide-react";
import * as m from "motion/react-m";
import Image from "next/image";

export function AboutSection() {
  // Hook untuk mendeteksi scroll pada section ini
  const { scrollYProgress } = useScroll({
    offset: ["start end", "end start"],
  });

  // Parallax Transforms
  const blobY = useTransform(scrollYProgress, [0, 1], [0, 100]);
  const avatarY = useTransform(scrollYProgress, [0, 1], [0, -40]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -20]);

  // Konfigurasi viewport yang bisa di-replay
  const replayViewport = {
    once: false, // <-- KUNCI: Izinkan animasi berulang
    amount: 0.2, // Trigger saat 20% elemen terlihat
    margin: "0px 0px -100px 0px", // Trigger sedikit lebih awal sebelum elemen sepenuhnya masuk
  };

  return (
    <section className="relative py-20 md:py-32 overflow-hidden">
      {/* Background accent subtle dengan PARALLAX */}
      <m.div
        style={{ y: blobY }}
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-150 h-150 bg-accent/5 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container relative z-10 mx-auto px-4">
        {/* Header Section */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={replayViewport}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="text-center mb-16"
        >
          <span className="inline-block px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4">
            About Me
          </span>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Bridging <span className="text-linear-elegant">Business</span> &{" "}
            <span className="text-linear-elegant">Technology</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Sebagai mahasiswa Sistem Informasi, saya tidak hanya menulis kode,
            tetapi juga merancang solusi yang berdampak.
          </p>
        </m.div>

        {/* 2-Column Layout dengan Parallax */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 md:gap-16 items-center mb-20">
          {/* Left Column: Avatar Card dengan PARALLAX */}
          <m.div
            style={{ y: avatarY }}
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={replayViewport}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative group mx-auto md:mx-0 w-full max-w-md"
          >
            {/* FIX: bg-linear-to-br */}
            <div className="absolute -inset-1 bg-linear-to-br from-accent/40 to-transparent rounded-3xl blur-2xl opacity-60 group-hover:opacity-100 transition-opacity duration-500" />

            {/* Glass Card */}
            <div className="relative rounded-3xl border border-glass-border bg-glass-bg backdrop-blur-xl overflow-hidden shadow-2xl">
              {/* FIX: h-[400px] agar proporsional */}
              <Image
                src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=800&auto=format&fit=crop"
                alt="Ridho Arachman"
                width={800}
                height={800}
                className="w-full h-100 object-cover object-center grayscale group-hover:grayscale-0 transition-all duration-500"
              />

              {/* Floating Badge di dalam kartu */}
              <m.div
                animate={{ y: [0, -8, 0] }}
                transition={{
                  duration: 3,
                  repeat: Infinity,
                  ease: "easeInOut",
                }}
                className="absolute bottom-6 left-6 right-6 p-4 rounded-2xl bg-bg-primary/80 backdrop-blur-md border border-glass-border"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-accent/20 text-accent">
                    <Sparkles size={20} />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      Available for Hire
                    </p>
                    <p className="text-xs text-text-muted">
                      Open to Full-time & Freelance
                    </p>
                  </div>
                </div>
              </m.div>
            </div>
          </m.div>

          {/* Right Column: Text & Details dengan PARALLAX */}
          <m.div
            style={{ y: textY }}
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={replayViewport}
            transition={{ duration: 0.7, delay: 0.1, ease: "easeOut" }}
            className="space-y-6"
          >
            <h3 className="text-2xl md:text-3xl font-bold text-text-primary">
              Hi, I&apos;m <span className="text-accent">Ridho Arachman</span>
            </h3>

            <p className="text-text-secondary leading-relaxed text-lg">
              Saya adalah mahasiswa{" "}
              <span className="text-text-primary font-medium">
                Sistem Informasi
              </span>{" "}
              yang memiliki passion mendalam dalam membangun pengalaman web yang
              imersif, berkinerja tinggi, dan berorientasi pada pengguna.
            </p>

            <p className="text-text-secondary leading-relaxed">
              Dengan fondasi yang kuat dalam pemecahan masalah bisnis dan
              keahlian teknis modern, saya menjembatani kesenjangan antara
              kebutuhan stakeholder dan implementasi teknologi yang elegan.
            </p>

            {/* Highlight Points */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
              {[
                {
                  icon: Code2,
                  title: "Clean Code",
                  desc: "Type-safe & Maintainable",
                },
                {
                  icon: Globe,
                  title: "Web Performance",
                  desc: "Optimized & Fast",
                },
                {
                  icon: Database,
                  title: "Data Driven",
                  desc: "Scalable Architecture",
                },
              ].map((item, idx) => (
                <m.div
                  key={idx}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={replayViewport}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  whileHover={{
                    x: 5,
                    backgroundColor: "rgba(255, 255, 255, 0.03)",
                  }}
                  className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-glass-border transition-all duration-300 cursor-default"
                >
                  <item.icon className="w-5 h-5 text-accent mt-1 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-text-primary">
                      {item.title}
                    </p>
                    <p className="text-xs text-text-muted">{item.desc}</p>
                  </div>
                </m.div>
              ))}
            </div>
          </m.div>
        </div>

        {/* Tech Stack Marquee Section */}
        <m.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={replayViewport}
          transition={{ duration: 0.6 }}
          className="mt-12"
        >
          <div className="text-center mb-8">
            <p className="text-sm font-semibold text-text-muted uppercase tracking-widest">
              Technologies I Work With
            </p>
          </div>
          <TechMarquee />
        </m.div>
      </div>
    </section>
  );
}
