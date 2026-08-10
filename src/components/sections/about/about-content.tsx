// components/sections/about-content.tsx (atau sesuai path Anda)
"use client";

import * as m from "motion/react-m";
import {
  AboutContentProps,
  contentVariants,
  HIGHLIGHT_POINTS,
  itemVariants,
  REPLAY_VIEWPORT,
} from "./constants";

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
        I am a{" "}
        <span className="text-text-primary font-medium">
          recent Information Systems graduate
        </span>{" "}
        with a deep passion for crafting immersive, high-performance, and
        user-centric web experiences.
      </p>

      <p className="text-text-secondary max-w-2xl mx-auto text-lg">
        As a recent Information Systems graduate specializing in E-Business, I
        leverage a strong foundation in business problem-solving and modern tech
        stacks to bridge the gap between complex stakeholder needs and elegant,
        scalable technical solutions.
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
