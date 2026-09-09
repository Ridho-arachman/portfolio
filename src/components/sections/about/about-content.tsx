"use client";

import { AboutContentProps, HIGHLIGHT_POINTS } from "./constants";

export function AboutContent({}: AboutContentProps) {
  return (
    <div className="space-y-6 animate-fade-in-up delay-300">
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
          <div
            key={idx}
            className="flex items-start gap-3 p-3 rounded-xl border border-transparent hover:border-glass-border transition-all duration-300 cursor-default animate-fade-in-up delay-400"
          >
            <item.icon className="w-5 h-5 text-accent mt-1 shrink-0" />
            <div>
              <p className="text-sm font-semibold text-text-primary">
                {item.title}
              </p>
              <p className="text-xs text-text-muted">{item.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}