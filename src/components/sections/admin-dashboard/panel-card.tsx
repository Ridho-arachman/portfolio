import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";
import type { RecentItem } from "./constants";

export function PanelCard({
  title,
  icon: Icon,
  items,
  children,
}: {
  title: string;
  icon: LucideIcon;
  items?: RecentItem[];
  children?: ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl overflow-hidden">
      <header className="flex items-center gap-2.5 border-b border-glass-border px-5 py-4">
        <div className="w-8 h-8 rounded-lg bg-accent/10 border border-accent/25 flex items-center justify-center text-accent">
          <Icon className="w-4 h-4" />
        </div>
        <h2 className="font-semibold">{title}</h2>
      </header>

      {items ? (
        <ul className="divide-y divide-glass-border/60">
          {items.map((item) => (
            <li key={item.title}>
              <div className="group flex items-center justify-between gap-3 px-5 py-3.5 transition-colors hover:bg-white/5">
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate">{item.title}</p>
                  <p className="text-xs text-text-muted truncate">
                    {item.subtitle}
                  </p>
                </div>
                <span className="shrink-0 rounded-full bg-white/5 border border-glass-border px-2.5 py-1 text-xs text-accent">
                  {item.badge}
                </span>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <div className="p-5">{children}</div>
      )}
    </section>
  );
}
