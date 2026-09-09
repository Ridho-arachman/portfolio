"use client";

import * as m from "motion/react-m";
import Image from "next/image";
import Link from "next/link";

export function NavbarLogo() {
  return (
    <m.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
      <Link href="/" className="group flex items-center gap-2">
        <Image
          src="/logo-optimized.webp"
          alt="Ridho.dev Logo"
          width={80}
          height={100}
          className="w-10 h-10 rounded-sm object-cover shadow-sm"
          priority
          sizes="40px"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
        <span className="text-xl font-bold text-gradient-elegant">
          Ridho.dev
        </span>
      </Link>
    </m.div>
  );
}
