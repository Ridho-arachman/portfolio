"use client";

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

        {/* The Avatar Image - Optimized for LCP - Plain img tag for fastest load */}
        <div className="relative rounded-3xl overflow-visible">
          <img
            src="/avatar-hero.avif"
            alt="Ridho Arachman"
            width={800}
            height={1000}
            className="w-full h-100 md:h-125 object-contain object-center drop-shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_35px_rgba(168,85,247,0.6)]"
            fetchPriority="high"
            decoding="async"
            loading="eager"
          />

          {/* Floating Glassmorphism Badge */}
          <AvatarBadge />
        </div>
      </div>
    </div>
  );
}
