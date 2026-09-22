import { HeroBackgroundProps } from "./constants";

export function HeroBackground({}: HeroBackgroundProps) {
  return (
    <>
      {/* Layer 1: Base gradient - subtle depth */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/3 to-transparent pointer-events-none" />

      {/* Layer 2: Radial glow - subtle accent glow at center */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />

      {/* Layer 3: Parallax grid pattern - CSS-native parallax via scroll-driven animation */}
      <div
        className="absolute inset-0 bg-grid-elegant pointer-events-none opacity-50 parallax-bg"
        style={{
          animationRange: 'cover 0% cover 100%',
        } as React.CSSProperties}
      />

      {/* Layer 4: Floating orbs - subtle color accents with parallax */}
      <div className="absolute top-20 right-20 w-64 h-64 rounded-full bg-accent/5 blur-[80px] pointer-events-none parallax-slow" />
      <div className="absolute bottom-20 left-20 w-48 h-48 rounded-full bg-neon-cyan/5 blur-[80px] pointer-events-none parallax-medium" />
      <div className="absolute top-1/2 left-10 w-32 h-32 rounded-full bg-neon-purple/5 blur-[60px] pointer-events-none parallax-fast" />

      {/* Layer 5: Subtle noise overlay for texture */}
      <div className="absolute inset-0 noise-overlay pointer-events-none" />
    </>
  );
}
