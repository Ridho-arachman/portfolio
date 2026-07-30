"use client";

import * as m from "motion/react-m";
import Image from "next/image";
import { FOOTER_VIEWPORT } from "./use-footer-animations";

export function FooterBrand() {
  return (
    <m.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={FOOTER_VIEWPORT}
      transition={{ duration: 0.6, ease: "easeOut" }}
    >
      <div className="flex items-center gap-3 mb-3">
        <Image
          src="/logo.png"
          alt="Ridho.dev Logo"
          width={80} // Lebar dasar
          height={100} // Tinggi dasar (lebih besar agar portrait)
          className="w-10 h-10 rounded-sm object-cover shadow-sm"
          unoptimized
          priority
        />
        <h3 className="text-2xl font-bold text-linear-elegant mb-3">
          Ridho.dev
        </h3>
      </div>
      <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
        Information Systems student crafting immersive web experiences with
        modern tech stacks.
      </p>
    </m.div>
  );
}
