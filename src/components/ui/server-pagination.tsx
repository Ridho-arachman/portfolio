import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { cn } from "@/lib/utils";

interface ServerPaginationProps {
  page: number;
  totalPages: number;
  basePath: string;
}

export function ServerPagination({
  page,
  totalPages,
  basePath,
}: ServerPaginationProps) {
  if (totalPages <= 1) return null;

  const pages = generatePageNumbers(page, totalPages);

  function href(p: number) {
    return `${basePath}?page=${p}`;
  }

  const iconBtn = cn(
    buttonVariants({ variant: "outline", size: "icon" }),
    "h-8 w-8",
  );

  return (
    <nav className="flex items-center justify-center gap-1">
      {page > 1 ? (
        <Link href={href(1)} className={iconBtn}>
          <ChevronsLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(iconBtn, "pointer-events-none opacity-50")}>
          <ChevronsLeft className="h-4 w-4" />
        </span>
      )}

      {page > 1 ? (
        <Link href={href(page - 1)} className={iconBtn}>
          <ChevronLeft className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(iconBtn, "pointer-events-none opacity-50")}>
          <ChevronLeft className="h-4 w-4" />
        </span>
      )}

      {pages.map((p, i) =>
        p === "..." ? (
          <span key={`ellipsis-${i}`} className="px-2 text-muted-foreground">
            ...
          </span>
        ) : p === page ? (
          <span
            key={p}
            className={cn(
              buttonVariants({ variant: "default", size: "icon" }),
              "h-8 w-8",
            )}
          >
            {p}
          </span>
        ) : (
          <Link
            key={p}
            href={href(p as number)}
            className={cn(
              buttonVariants({ variant: "outline", size: "icon" }),
              "h-8 w-8",
            )}
          >
            {p}
          </Link>
        ),
      )}

      {page < totalPages ? (
        <Link href={href(page + 1)} className={iconBtn}>
          <ChevronRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(iconBtn, "pointer-events-none opacity-50")}>
          <ChevronRight className="h-4 w-4" />
        </span>
      )}

      {page < totalPages ? (
        <Link href={href(totalPages)} className={iconBtn}>
          <ChevronsRight className="h-4 w-4" />
        </Link>
      ) : (
        <span className={cn(iconBtn, "pointer-events-none opacity-50")}>
          <ChevronsRight className="h-4 w-4" />
        </span>
      )}
    </nav>
  );
}

function generatePageNumbers(
  current: number,
  total: number,
): (number | "...")[] {
  const pages: (number | "...")[] = [];
  const t = total;

  if (t <= 7) {
    for (let i = 1; i <= t; i++) pages.push(i);
    return pages;
  }

  pages.push(1);
  if (current > 3) pages.push("...");

  const start = Math.max(2, current - 1);
  const end = Math.min(t - 1, current + 1);
  for (let i = start; i <= end; i++) pages.push(i);

  if (current < t - 2) pages.push("...");
  pages.push(t);

  return pages;
}
