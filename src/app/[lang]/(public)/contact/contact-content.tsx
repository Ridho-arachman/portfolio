"use client";

import { Providers } from "@/lib/providers";
import { ContactSection } from "@/components/sections/contact";

interface ContactPageContentProps {
  locale: string;
}

export function ContactPageContent({ locale }: ContactPageContentProps) {
  return (
    <Providers>
      <main className="min-h-screen pt-20 md:pt-32 bg-bg-primary overflow-x-hidden">
        <ContactSection locale={locale} />
      </main>
    </Providers>
  );
}
