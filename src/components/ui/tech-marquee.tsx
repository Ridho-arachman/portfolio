"use client";

import * as m from "motion/react-m";
import {
  SiBetterauth,
  SiFramer,
  SiLaravel,
  SiNextdotjs,
  SiPostgresql,
  SiPrisma,
  SiReact,
  SiShadcnui,
  SiSupabase,
  SiTailwindcss,
  SiTypescript,
  SiVercel,
  SiZod,
} from "react-icons/si";

const techStack = [
  { name: "Next.js", icon: SiNextdotjs },
  { name: "TypeScript", icon: SiTypescript },
  { name: "Tailwind CSS", icon: SiTailwindcss },
  { name: "Prisma", icon: SiPrisma },
  { name: "React", icon: SiReact },
  { name: "PostgreSQL", icon: SiPostgresql },
  { name: "Supabase", icon: SiSupabase },
  { name: "Framer Motion", icon: SiFramer },
  { name: "Zod", icon: SiZod },
  { name: "Vercel", icon: SiVercel },
  { name: "Laravel", icon: SiLaravel },
  { name: "Shadcn/ui", icon: SiShadcnui },
  { name: "Better Auth", icon: SiBetterauth },
];

export function TechMarquee() {
  // FIX: Cukup duplikasi 2 kali.
  // Total lebar menjadi 200%. Animasi ke -50% berarti geser tepat 1 set penuh.
  // Saat reset ke 0%, posisi visual identik, sehingga transisi 100% seamless.
  const duplicatedStack = [...techStack, ...techStack];

  return (
    <div className="relative w-full overflow-hidden py-8">
      {/* FIX: Gunakan bg-linear-to-r agar 100% aman dari hydration mismatch */}
      <div className="absolute left-0 top-0 bottom-0 w-20 md:w-40 bg-linear-to-r from-bg-primary to-transparent z-10 pointer-events-none" />
      <div className="absolute right-0 top-0 bottom-0 w-20 md:w-40 bg-linear-to-l from-bg-primary to-transparent z-10 pointer-events-none" />

      <m.div
        className="flex gap-8 md:gap-12 w-max"
        animate={{ x: ["0%", "-50%"] }} // Geser tepat 50% dari total lebar (yang berarti 1 set penuh)
        transition={{
          repeat: Infinity,
          ease: "linear",
          duration: 35, // Diperlambat sedikit (35s) agar lebih smooth, elegan, dan mudah dibaca
        }}
      >
        {duplicatedStack.map((tech, index) => (
          <div
            key={`${tech.name}-${index}`}
            // Gunakan fixed width (min-w) agar ukuran setiap item konsisten
            className="flex flex-col items-center gap-3 min-w-25 md:min-w-30 group"
          >
            <div className="relative p-4 rounded-2xl bg-glass-bg border border-glass-border group-hover:border-accent/50 group-hover:bg-accent-muted transition-all duration-300">
              <tech.icon
                size={32}
                className="text-text-secondary group-hover:text-accent transition-colors duration-300"
              />
              {/* Glow effect saat hover */}
              <div className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_20px_rgba(167,139,250,0.2)] pointer-events-none" />
            </div>
            <span className="text-xs md:text-sm font-medium text-text-muted group-hover:text-text-primary transition-colors text-center leading-tight">
              {tech.name}
            </span>
          </div>
        ))}
      </m.div>
    </div>
  );
}
