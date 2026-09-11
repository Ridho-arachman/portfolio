// _components/ui/magnetic-button.tsx
"use client";

import { cn } from "@/lib/utils";
import { useState, useRef, useEffect } from "react";

interface MagneticButtonProps extends Omit<
  React.ButtonHTMLAttributes<HTMLButtonElement>,
  "children"
> {
  children: React.ReactNode;
  className?: string;
}

/** Tracks `(pointer: fine)` capability; false during SSR and for touch devices. */
function useFinePointer(): boolean {
  const [isFinePointer, setIsFinePointer] = useState(false);

  useEffect(() => {
    // Defensif: lingkungan tanpa matchMedia (mis. beberapa setup uji) di-skip.
    if (typeof window.matchMedia !== "function") return;

    const mediaQuery = window.matchMedia("(pointer: fine)");
    const update = () => setIsFinePointer(mediaQuery.matches);
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  return isFinePointer;
}

export function MagneticButton({
  children,
  className,
  ...props
}: MagneticButtonProps) {
  const ref = useRef<HTMLButtonElement>(null);
  const isFinePointer = useFinePointer();
  // Magnet effect hanya aktif untuk pointer presisi (mouse) tanpa reduced motion.
  const magnetEnabled = isFinePointer;

  const [x, setX] = useState(0);
  const [y, setY] = useState(0);

  // Store rect to avoid getBoundingClientRect on every mousemove (prevents forced reflow)
  const rectRef = useRef<DOMRect | null>(null);

  // Update rect on resize and initial mount
  useEffect(() => {
    if (!ref.current) return;
    rectRef.current = ref.current.getBoundingClientRect();
    
    const handleResize = () => {
      if (ref.current) {
        rectRef.current = ref.current.getBoundingClientRect();
      }
    };
    
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleMouseMove = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (!magnetEnabled || !ref.current || !rectRef.current) return;
    const { clientX, clientY } = e;
    const { left, top, width, height } = rectRef.current;

    const centerX = left + width / 2;
    const centerY = top + height / 2;

    setX((clientX - centerX) * 0.3);
    setY((clientY - centerY) * 0.3);
  };

  const handleMouseLeave = () => {
    setX(0);
    setY(0);
  };

  return (
    <button
      ref={ref}
      style={{ 
        transform: `translate(${x}px, ${y}px)`,
        transition: 'transform 0.15s ease-out'
      }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn(
        "relative px-6 py-3 text-base sm:px-8 sm:py-4 rounded-full bg-accent-muted border border-accent/50 text-accent font-semibold overflow-hidden group transition-colors hover:bg-accent/20",
        className,
      )}
      {...props}
    >
      <span className="relative z-10 flex items-center gap-2">{children}</span>

      {/* Subtle glow effect */}
      <div className="absolute inset-0 bg-accent/20 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none" />
    </button>
  );
}
