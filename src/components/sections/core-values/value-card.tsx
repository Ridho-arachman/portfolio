"use client";

import { Card } from "@/components/ui/card";
import * as m from "motion/react-m";
import { cardVariants, REPLAY_VIEWPORT, ValueCardProps } from "./constants";

export function ValueCard({ value, index }: ValueCardProps) {
  const Icon = value.icon;

  return (
    <m.div
      variants={cardVariants}
      initial="hidden"
      whileInView="visible"
      viewport={REPLAY_VIEWPORT}
      transition={{ delay: index * 0.1 }}
      whileHover={{ y: -8 }}
      className="group h-full"
    >
      {/* Menggunakan Card dari shadcn/ui, dengan override class untuk glassmorphism */}
      <Card className="h-full p-6 rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl hover:border-accent/40 hover:bg-accent-muted/10 transition-all duration-300">
        <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
          <Icon className="w-6 h-6 text-accent" />
        </div>

        <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
          {value.title}
        </h3>

        <p className="text-sm text-text-secondary leading-relaxed">
          {value.desc}
        </p>
      </Card>
    </m.div>
  );
}
