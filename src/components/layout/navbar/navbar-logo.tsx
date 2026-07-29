"use client";

import * as m from "motion/react-m";
import Link from "next/link";

export function NavbarLogo() {
  return (
    <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link href="/" className="group flex items-center gap-2">
        <div className="relative">
          <div className="absolute inset-0 bg-accent/30 blur-lg group-hover:bg-accent/50 transition-all duration-500" />
          <div className="relative w-10 h-10 rounded-lg bg-linear-to-br from-accent to-accent-hover flex items-center justify-center font-bold text-bg-primary">
            R
          </div>
        </div>
        <span className="text-xl font-bold text-gradient-elegant">
          Ridho.dev
        </span>
      </Link>
    </m.div>
  );
}
