"use client";

import Image from "next/image";
import { useSiteSettings } from "@/components/providers/public-content-provider";
import { useTranslation } from "@/hooks/use-translation";

export function FooterBrand() {
  const { t } = useTranslation();
  const { siteName } = useSiteSettings();
  return (
    <div className="animate-fade-in-up">
      <div className="flex items-center gap-3 mb-3">
        <Image
          src="/logo-optimized.webp"
          alt={`${siteName} Logo`}
          width={80}
          height={100}
          className="w-10 h-10 rounded-sm object-cover shadow-sm"
          priority
          sizes="40px"
          placeholder="blur"
          blurDataURL="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=="
        />
        <h2 className="text-2xl font-bold text-gradient-elegant mb-3">
          {siteName}
        </h2>
      </div>
      <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
        {t.footer.tagline}
      </p>
    </div>
  );
}