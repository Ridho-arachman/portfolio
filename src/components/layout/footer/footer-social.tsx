// SOCIAL_LINK_CLASS = twMerge(buttonVariants({variant:"outline",size:"icon"}),
// custom classes) resolved statically. Inlining it keeps this file a pure
// Server Component — no @base-ui / cva / cn imports enter the RSC tree.
import Link from "next/link";
import { SOCIAL_LINKS } from "./constants";

const SOCIAL_LINK_CLASS =
  "group/button inline-flex shrink-0 items-center justify-center border bg-clip-padding text-sm font-medium whitespace-nowrap outline-none select-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 active:not-aria-[haspopup]:translate-y-px disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4 aria-expanded:bg-muted aria-expanded:text-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50 size-8 relative w-12 h-12 rounded-lg border-black/10 bg-white dark:bg-gray-950 hover:border-black/30 hover:bg-gray-50 dark:hover:bg-gray-900 transition-all duration-300 group overflow-hidden";

// Repo convention: Link styled as button, no Button wrapping Link.
// A single 44x44 tap target (no nested interactive element) passes
// Lighthouse target-size and keeps the footer socials WCAG-conformant.
export function FooterSocial() {
  return (
    <div className="animate-fade-in-up delay-200">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
        Connect
      </h3>
      <div className="flex gap-3">
        {SOCIAL_LINKS.map(({ href, icon: Icon, label }, index) => (
          <div
            key={label}
            className="animate-fade-in-up"
            style={{ animationDelay: `${300 + index * 100}ms` }}
          >
            <Link
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={label}
              className={SOCIAL_LINK_CLASS}
            >
              <Icon
                size={20}
                aria-hidden="true"
                className="relative z-10 transition-colors duration-300"
              />
              {/* Glow effect on hover */}
              <span className="pointer-events-none absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(167,139,250,0.3)]" />
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}