"use client";

import { type MotionValue, type Variants } from "framer-motion";
import * as m from "motion/react-m";
import { HIGHLIGHT_POINTS } from "./constants";
import { REPLAY_VIEWPORT } from "./use-about-animations";

interface AboutContentProps {
  textY: MotionValue<number>;
}

const contentVariants: Variants = {
  hidden: { opacity: 0, x: 50 },
  visible: {
    opacity: 1,
    x: 0,
    transition: { duration: 0.7, delay: 0.1, ease: "easeOut" },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, x: 20 },
  visible: (i: number) => ({
    opacity: 1,
    x: 0,
    transition: { duration: 0.5, delay: i * 0.1 },
  }),
};

export function AboutContent({ textY }: AboutContentProps) {
  return (
    <m.div
      style={{ y: textY }}
      variants={contentVariants}
      initial="hidden"
      whileInView="visible"
      viewport={REPLAY_VIEWPORT}
      className="space-y-6"
    >
      <h3 className="text-2xl md:text-3xl font-bold text-text-primary">
        Hi, I&apos;m <span className="text-accent">Ridho Arachman</span>
      </h3>

      <p className="text-text-secondary leading-relaxed text-lg">
        Saya adalah mahasiswa{" "}
        <span className="text-text-primary font-medium">Sistem Informasi</span>{" "}
        yang memiliki passion mendalam dalam membangun pengalaman web yang
        imersif, berkinerja tinggi, dan berorientasi pada pengguna.
      </p>

      <p className="text-text-secondary leading-relaxed">
        Dengan fondasi yang kuat dalam pemecahan masalah bisnis dan keahlian
        teknis modern, saya menjembatani kesenjangan antara kebutuhan
        stakeholder dan implementasi teknologi yang elegan.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
        {HIGHLIGHT_POINTS.map((item, idx) => (
          <m.div
            key={idx}
            custom={idx}
            variants={itemVariants}
            initial="hidden"
            whileInView="visible"
            viewport={REPLAY_VIEWPORT}
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
  );
}
