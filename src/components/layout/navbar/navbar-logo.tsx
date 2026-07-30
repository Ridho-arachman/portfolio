"use client";

import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";

export function NavbarLogo() {
  return (
    <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link href="/" className="group flex items-center gap-2">
        <Image
          src="/logo.png"
          alt="Ridho.dev Logo"
          width={80} // Lebar dasar
          height={100} // Tinggi dasar (lebih besar agar portrait)
          className="w-10 h-10 rounded-sm object-cover shadow-sm"
          unoptimized
          priority
        />
        <span className="text-xl font-bold text-gradient-elegant">
          Ridho.dev
        </span>
      </Link>
    </m.div>
  );
}
