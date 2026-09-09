"use client";

import Image from "next/image";
import { AvatarBackground } from "./avatar-background";
import { AvatarBadge } from "./avatar-badge";
import { AboutAvatarProps } from "./constants";

export function AboutAvatar({}: AboutAvatarProps) {
  return (
    <div className="relative group mx-auto md:ml-16 w-full max-w-md animate-fade-in-up delay-200">
      {/* Background Parallax Elements */}
      <AvatarBackground />

      {/* Main Container */}
      <div className="relative w-full">
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-linear-to-tr from-purple-600/20 via-transparent to-violet-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />

        {/* The Avatar Image - Optimized for LCP */}
        <div className="relative rounded-3xl overflow-visible">
          <picture>
            <source srcSet="/avatar-hero.avif" type="image/avif" />
            <source srcSet="/avatar-hero.webp" type="image/webp" />
            <Image
              src="/avatar.png"
              alt="Ridho Arachman"
              width={800}
              height={1000}
              className="w-full h-100 md:h-125 object-contain object-center drop-shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_35px_rgba(168,85,247,0.6)]"
              priority
              fetchPriority="high"
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 500px"
              placeholder="blur"
              blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
            />
          </picture>

          {/* Floating Glassmorphism Badge */}
          <AvatarBadge />
        </div>
      </div>
    </div>
  );
}