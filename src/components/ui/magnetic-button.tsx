// _components/ui/magnetic-button.tsx
"use client";

import { cn } from "@/lib/utils";
import { useMotionValue, useSpring, type HTMLMotionProps } from "framer-motion";
import * as m from "motion/react-m";
import { useRef } from "react";

interface MagneticButtonProps extends Omit<
  HTMLMotionProps<"button">,
  "children"
> {
  children: React.ReactNode;
  className?: string;
}

export function MagneticButton({
  children,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);

  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const springX = useSpring(x, { stiffness: 150, damping: 15 });
  const springY = useSpring(y, { stiffness: 150, damping: 15 });

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!ref.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = ref.current.getBoundingClientRect();

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    x.set((clientX - centerX) * 0.3);
    y.set((clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };

  return (
    <m.button
      ref={ref}
      style={{ x: springX, y: springY }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative px-8 py-4 rounded-full bg-accent-muted border border-accent/50 text-accent font-semibold overflow-hidden group transition-colors hover:bg-accent/20",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </m.button>
  );
}
