import Link from "next/link";
import { QUICK_LINKS } from "./constants";

export function FooterLinks() {
  return (
    <div className="animate-fade-in-up delay-100">
      <h3 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
        Quick Links
      </h3>
      <ul className="space-y-3">
        {QUICK_LINKS.map((item, idx) => (
          <li key={item.label} className="animate-fade-in-up" style={{ animationDelay: `${200 + idx * 80}ms` }}>
            <Link
              href={item.href}
              className="text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-2 group"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
              {item.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}