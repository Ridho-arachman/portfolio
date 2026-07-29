"use client";

import * as m from "motion/react-m";
import Image from "next/image";
import { AvatarBackground } from "./avatar-background";
import { AvatarBadge } from "./avatar-badge";
import { AboutAvatarProps, cardVariants, REPLAY_VIEWPORT } from "./constants";
import { use3dTilt } from "./use-3d-tilt";

export function AboutAvatar({ avatarY }: AboutAvatarProps) {
  const {
    bgX,
    bgY,
    imgRotateX,
    imgRotateY,
    imgTranslateX,
    imgTranslateY,
    handleMouseMove,
    handleMouseLeave,
  } = use3dTilt();

  return (
    <m.div
      style={{ y: avatarY }}
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={REPLAY_VIEWPORT}
      className="relative group mx-auto md:ml-16 w-full max-w-md"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* 1. Background Parallax Elements */}
      <AvatarBackground bgX={bgX} bgY={bgY} />

      {/* 2. Main 3D Tilt Container */}
      <m.div
        style={{
          rotateX: imgRotateX,
          rotateY: imgRotateY,
          x: imgTranslateX,
          y: imgTranslateY,
          transformStyle: "preserve-3d",
        }}
        className="relative w-full"
      >
        {/* Ambient Glow */}
        <div className="absolute inset-0 bg-linear-to-tr from-purple-600/20 via-transparent to-violet-500/20 rounded-full blur-3xl opacity-50 group-hover:opacity-80 transition-opacity duration-700" />

        {/* The Avatar Image */}
        <div className="relative rounded-3xl overflow-visible">
          <Image
            src="/avatar.png"
            alt="Ridho Arachman"
            width={6000}
            height={6000}
            className="w-full h-100 md:h-125 object-contain object-center drop-shadow-2xl transition-all duration-500 group-hover:scale-105 group-hover:drop-shadow-[0_0_35px_rgba(168,85,247,0.6)]"
            unoptimized
            style={{ transform: "translateZ(20px)" }}
          />

          {/* 3. Floating Glassmorphism Badge */}
          <AvatarBadge />
        </div>
      </m.div>
    </m.div>
  );
}
