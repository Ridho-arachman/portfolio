import { AboutHeroBackgroundProps } from "./constants";

export function AboutHeroBackground({
  bgY1,
  bgY2,
  bgY3,
  mouseX,
  mouseY,
}: AboutHeroBackgroundProps) {
  return (
    <>
      {/* Layer 1: Deep Background Blobs */}
      <div
        className="absolute top-0 left-1/4 w-150 h-150 bg-accent/10 rounded-full blur-[150px] pointer-events-none animate-parallax-y"
        style={{ transform: `translateY(${bgY1}px)` } as React.CSSProperties}
      />
      <div
        className="absolute bottom-0 right-1/4 w-125 h-125 bg-white/5 rounded-full blur-[150px] pointer-events-none animate-parallax-y-reverse"
        style={{ transform: `translateY(${bgY2}px)` } as React.CSSProperties}
      />

      {/* Layer 2: Perspective Grid */}
      <div
        className="absolute inset-0 bg-grid-elegant opacity-20 pointer-events-none animate-parallax-y"
        style={{ transform: `translateY(${bgY3}px)` } as React.CSSProperties}
      />

      {/* Layer 3: Small Particles (Mouse Parallax Only) */}
      <div
        className="absolute top-1/3 right-1/3 w-2 h-2 bg-accent rounded-full pointer-events-none shadow-[0_0_10px_rgba(167,139,250,0.8)] animate-mouse-parallax"
        style={{
          transform: `translate(${mouseX * 80}px, ${mouseY * 80}px)`,
        } as React.CSSProperties}
      />
      <div
        className="absolute bottom-1/4 left-1/3 w-3 h-3 bg-accent/60 rounded-full pointer-events-none shadow-[0_0_15px_rgba(167,139,250,0.6)] animate-mouse-parallax"
        style={{
          transform: `translate(${mouseX * 100}px, ${mouseY * 100}px)`,
        } as React.CSSProperties}
      />

      {/* Noise Texture */}
      <div
        className="absolute inset-0 opacity-[0.03] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
    </>
  );
}