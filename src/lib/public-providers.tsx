"use client";

import { Toaster } from "@/components/ui/sonner";

export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <>
      {children}
      <Toaster richColors position="top-right" />
    </>
  );
}