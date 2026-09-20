export function FooterBottom() {
  const currentYear = new Date().getFullYear();

  return (
    <div className="pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-center gap-4 animate-fade-in-up delay-500">
      <p className="text-text-muted text-sm text-center md:text-left">
        © {currentYear} Ridho Arachman. Built with{" "}
        <span className="text-accent font-medium">Next.js</span> &{" "}
        <span className="text-accent font-medium">Tailwind v4</span>.
      </p>

      <div className="flex items-center gap-2 text-text-secondary text-xs">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
        </span>
        <span>System Online</span>
      </div>
    </div>
  );
}