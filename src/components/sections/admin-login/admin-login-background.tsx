export function AdminLoginBackground() {
  return (
    <>
      <div
        aria-hidden
        className="animate-float-slow absolute top-[-10%] left-[-10%] w-100 h-100 md:w-150 md:h-150 pointer-events-none bg-accent/10 rounded-full blur-[130px]"
      />
      <div
        aria-hidden
        className="animate-float-slow absolute bottom-[-12%] right-[-8%] w-125 h-125 md:w-175 md:h-175 pointer-events-none bg-white/5 rounded-full blur-[130px]"
        style={{ animationDelay: "-8s" }}
      />

      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.035] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <div
        aria-hidden
        className="absolute bottom-0 left-0 right-0 h-[50vh] bg-grid-elegant opacity-20 pointer-events-none"
        style={{
          maskImage: "linear-gradient(to top, black, transparent)",
          WebkitMaskImage: "linear-gradient(to top, black, transparent)",
        }}
      />
    </>
  );
}
