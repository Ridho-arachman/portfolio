import Link from "next/link";

export function HeroContent() {
  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
      <div className="text-center">
        {/* Badge - static, no client JS */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-accent-muted border border-accent/30 text-accent font-medium tracking-wider uppercase text-xs">
            <span className="relative flex h-1 w-1">
              <span className="relative inline-flex rounded-full h-1 w-1 bg-accent" />
            </span>
            Available for hire
          </span>
        </div>

        {/* Main Heading - static, no client JS */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 leading-[0.9]">
          Building the
          <br />
          <span className="text-accent">Future</span>
        </h1>

        {/* Subheading */}
        <p className="text-sm md:text-lg text-text-secondary max-w-2xl mx-auto mb-12 leading-relaxed">
          Information Systems student crafting immersive, high-performance web
          experiences with modern tech stacks.
        </p>

{/* CTA Buttons - pure HTML links, no client JS */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
          <Link
            href="/projects"
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:px-8 sm:py-4 sm:text-base h-auto rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300 min-h-[48px] min-w-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            View Projects
            <svg className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-accent/50 px-8 py-4 text-base font-medium text-accent transition-all hover:border-accent hover:bg-accent-muted/10 min-h-[48px] min-w-[48px] flex items-center justify-center focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
          >
            <svg className="h-4 w-4 shrink-0 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4V1L8 5l4 4V6a8 8 0 01-9 9m9-9a9 9 0 00-9-9m9 9V12" />
            </svg>
            <span>Let&apos;s Talk</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
