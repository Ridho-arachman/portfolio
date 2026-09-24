"use client";

import { Providers } from "@/lib/providers";
import { ContactSection } from "@/components/sections/contact";

export function ContactPageContent() {
  return (
    <Providers>
      <main className="min-h-screen pt-20 md:pt-32 bg-bg-primary overflow-x-hidden">
        <ContactSection />
      </main>
    </Providers>
  );
}
