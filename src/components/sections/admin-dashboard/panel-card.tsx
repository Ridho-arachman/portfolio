import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import * as m from "motion/react-m";
import Link from "next/link";
import type { RecentItem } from "./constants";

export function PanelCard({
  title,
  icon: Icon,
  items,
  emptyNote,
  children,
}: {
  title: string;
  icon: LucideIcon;
  items?: RecentItem[];
  emptyNote?: string;
  children?: ReactNode;
}) {
  return (
    <m.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      transition={{ duration: 0.5 }}
      whileHover={{ y: -2 }}
      className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl"
    >
      <header className="flex items-center gap-2.5 border-b border-glass-border px-5 py-4">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-accent/25 bg-accent/10 text-accent">
          <Icon className="h-4 w-4" />
        </div>
        <h2 className="font-semibold">{title}</h2>
      </header>

      {items && items.length > 0 ? (
        <ul className="divide-y divide-glass-border/60">
          {items.map((item) => {
            const content = (
              <>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium">{item.title}</p>
                  <p className="truncate text-xs text-text-muted">
                    {item.subtitle}
                  </p>
                </div>
                <span className="shrink-0 rounded-full border border-glass-border bg-white/5 px-2.5 py-1 text-xs text-accent">
                  {item.badge}
                </span>
              </>
            );

            return (
              <li key={item.title}>
                {item.href ? (
                  <m.div whileHover={{ x: 3 }} transition={{ duration: 0.15 }}>
                    <Link
                      href={item.href}
                      className="flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-white/5"
                    >
                      {content}
                    </Link>
                  </m.div>
                ) : (
                  <m.div
                    whileHover={{ x: 3 }}
                    transition={{ duration: 0.15 }}
                    className="flex items-center justify-between gap-3 px-5 py-3.5"
                  >
                    {content}
                  </m.div>
                )}
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="p-5">
          {children ?? (
            <p className="text-sm text-text-muted">
              {emptyNote ?? "No items yet."}
            </p>
          )}
        </div>
      )}
    </m.section>
  );
}
