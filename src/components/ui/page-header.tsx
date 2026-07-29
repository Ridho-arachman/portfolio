// _components/ui/page-header.tsx
"use client";

import * as m from "motion/react-m";

interface PageHeaderProps {
  title: string;
  subtitle: string;
  breadcrumb: string;
}

export function PageHeader({ title, subtitle, breadcrumb }: PageHeaderProps) {
  return (
    <section className="relative pt-32 pb-16 md:pt-40 md:pb-24 overflow-hidden">
      {/* Background Blob Unik untuk Sub-pages */}
      <m.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
        className="absolute top-0 left-1/2 -translate-x-1/2 w-150 h-100 bg-accent/10 rounded-full blur-[120px] pointer-events-none"
      />

      <div className="container relative z-10 mx-auto px-4 text-center">
        <m.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className="inline-block px-3 py-1 rounded-full bg-accent-muted border border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-6">
            {breadcrumb}
          </span>

          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            {title.split(" ").map((word, i) => (
              <span
                key={i}
                className={
                  i === 1 ? "text-gradient-elegant" : "text-text-primary"
                }
              >
                {word}{" "}
              </span>
            ))}
          </h1>

          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto leading-relaxed">
            {subtitle}
          </p>
        </m.div>
      </div>
    </section>
  );
}
