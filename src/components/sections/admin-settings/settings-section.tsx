import { cn } from "@/lib/utils";
import { type ReactNode } from "react";

interface SettingsSectionProps {
  title: string;
  subtitle: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export function SettingsSection({
  title,
  subtitle,
  children,
  footer,
  className,
}: SettingsSectionProps) {
  return (
    <section
      className={cn(
        "overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl",
        className,
      )}
    >
      <div className="border-b border-glass-border px-5 py-4 sm:px-6">
        <h2 className="font-semibold text-text-primary">{title}</h2>
        <p className="mt-0.5 text-sm text-text-secondary">{subtitle}</p>
      </div>
      <div className="p-5 sm:p-6">{children}</div>
      {footer && (
        <div className="flex items-center justify-end gap-3 border-t border-glass-border px-5 py-4 sm:px-6">
          {footer}
        </div>
      )}
    </section>
  );
}
