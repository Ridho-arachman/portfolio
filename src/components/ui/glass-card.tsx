// _components/ui/glass-card.tsx
import { cn } from "@/lib/utils";
import { type HTMLMotionProps } from "framer-motion";
import * as m from "motion/react-m";
import * as React from "react";

interface GlassCardProps extends Omit<HTMLMotionProps<"div">, "children"> {
  variant?: "default" | "hover" | "accent";
  children: React.ReactNode;
}

const GlassCard = React.forwardRef<HTMLDivElement, GlassCardProps>(
  ({ className, variant = "default", children, ...props }, ref) => {
    return (
      <m.div
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-50px" }}
        transition={{ duration: 0.5 }}
        className={cn(
          // Base glassmorphism styles
          "relative rounded-xl border border-white/8",
          "bg-white/3 backdrop-blur-xl",
          "transition-all duration-300 ease-out",

          // Variant: default
          variant === "default" && "shadow-lg",

          // Variant: hover - lift effect
          variant === "hover" && [
            "hover:-translate-y-2 hover:shadow-2xl",
            "hover:border-white/12 hover:bg-white/5",
          ],

          // Variant: accent - subtle violet border
          variant === "accent" && [
            "border-accent/30",
            "shadow-[0_0_20px_rgba(167,139,250,0.1)]",
            "hover:border-accent/50 hover:shadow-[0_0_30px_rgba(167,139,250,0.15)]",
          ],

          className,
        )}
        {...props}
      >
        {/* Inner gradient overlay for depth */}
        <div className="absolute inset-0 rounded-xl bg-linear-to-br from-white/5 to-transparent pointer-events-none" />

        {/* Content */}
        <m.div className="relative z-10">{children}</m.div>
      </m.div>
    );
  },
);

GlassCard.displayName = "GlassCard";

export { GlassCard };
