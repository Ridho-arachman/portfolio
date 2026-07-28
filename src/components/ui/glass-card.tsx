// _components/ui/glass-card.tsx
import * as React from "react";
import { cn } from "@/lib/utils";
import * as m from "motion/react-m";
import { type HTMLMotionProps } from "framer-motion";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "hover" | "glow";
  glow?: "cyan" | "purple" | "pink" | null;
  children: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  (
    { className, variant = "default", glow = null, children, ...props },
    ref,
  ) => {
    return (
      <m.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className={cn(
          // Base glassmorphism styles
          "relative rounded-xl border border-white/10",
          "bg-white/5 backdrop-blur-xl",
          "transition-all duration-300 ease-out",

          // Variant: default
          variant === "default" && "shadow-lg",

          // Variant: hover - lift effect
          variant === "hover" && [
            "hover:-translate-y-2 hover:shadow-2xl",
            "hover:border-white/20 hover:bg-white/10",
          ],

          // Variant: glow - neon border
          variant === "glow" && [
            "border-neon-cyan/50",
            "shadow-[0_0_20px_rgba(0,240,255,0.3)]",
          ],

          // Glow color variants
          glow === "cyan" && [
            "border-neon-cyan/50",
            "shadow-[0_0_20px_rgba(0,240,255,0.3)]",
            "hover:shadow-[0_0_30px_rgba(0,240,255,0.5)]",
          ],
          glow === "purple" && [
            "border-neon-purple/50",
            "shadow-[0_0_20px_rgba(176,38,255,0.3)]",
            "hover:shadow-[0_0_30px_rgba(176,38,255,0.5)]",
          ],
          glow === "pink" && [
            "border-neon-pink/50",
            "shadow-[0_0_20px_rgba(255,0,229,0.3)]",
            "hover:shadow-[0_0_30px_rgba(255,0,229,0.5)]",
          ],

          className,
        )}
        {...props}
      >
        {/* Inner gradient overlay for depth */}
        <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

        {/* Content - Gunakan m.div juga untuk konsistensi */}
        <m.div className="relative z-10">{children}</m.div>
      </m.div>
    );
  },
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
