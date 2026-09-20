import Link from "next/link";

export function HeroContent() {
  return (
    <div className="relative z-10 w-full max-w-5xl mx-auto px-4">
      <div className="text-center">
        {/* Badge - static, no client JS */}
        <div className="mb-8">
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/5 border border-white/8 backdrop-blur-md text-accent font-medium tracking-wider uppercase text-xs">
            <span className="relative flex h-1 w-1">
              <span className="relative inline-flex rounded-full h-1 w-1 bg-accent" />
            </span>
            Available for hire
          </span>
        </div>

        {/* Main Heading - static, no client JS */}
        <h1 className="text-3xl md:text-5xl lg:text-6xl font-bold tracking-tighter mb-8 leading-[0.9] font-[system-ui]">
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
            className="group inline-flex items-center justify-center gap-2 px-6 py-3 text-sm sm:px-8 sm:py-4 sm:text-base h-auto rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300"
          >
            View Projects
            <svg className="w-4 h-4 shrink-0 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
            </svg>
          </Link>

          <Link
            href="/contact"
            className="group inline-flex items-center justify-center gap-2 rounded-full border border-white/8 px-8 py-4 text-base font-medium text-text-primary transition-all hover:bg-white/5 hover:border-accent/50 hover:text-accent"
          >
            <svg className="h-4 w-4 shrink-0 group-hover:rotate-180 transition-transform duration-700" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
            </svg>
            <span>Contact Me</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
