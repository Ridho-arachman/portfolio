import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  className?: string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center py-16 text-center",
        className,
      )}
    >
      <div className="mb-4 rounded-full border border-glass-border bg-glass-bg p-4">
        <Icon className="h-8 w-8 text-text-muted" />
      </div>
      <h3 className="mb-1 text-lg font-semibold text-text-primary">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-text-muted">{description}</p>
    </div>
  );
}
