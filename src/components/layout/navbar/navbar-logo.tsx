"use client";

import Image from "next/image";
import Link from "next/link";
import { useSiteSettings } from "@/components/providers/public-content-provider";
import { useTranslation } from "@/hooks/use-translation";

export function NavbarLogo() {
  const { t } = useTranslation();
  const { siteName } = useSiteSettings();
  return (
    <div className="hover:scale-105 active:scale-95 transition-transform duration-200">
<Link
              href="/"
              className="group flex items-center gap-2 min-h-[48px] min-w-[48px] flex items-center justify-center"
              aria-label={t.nav.backHome}
              style={{ textDecoration: "none", color: "inherit" }}
            >
              <Image
                src="/logo-optimized.webp"
                alt={`${siteName} logo`}
                width={48}
                height={48}
                className="w-12 h-12 rounded-sm object-cover shadow-sm"
                priority
                sizes="48px"
                placeholder="blur"
                blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
                aria-hidden="true"
              />
              <span className="text-xl font-bold text-text-primary">
                {siteName}
              </span>
            </Link>
    </div>
  );
}