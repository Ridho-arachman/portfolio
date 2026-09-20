"use client";

import { ThemeProvider } from "@/providers/theme-provider";
import { Toaster } from "@/components/ui/sonner";

// Minimal providers for the home page critical path (theme + toaster only).
// Deliberately separate from lazy-providers so @tanstack/react-query and nuqs
// are never pulled into the home page's initial client bundle.
export function PublicProviders({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
    >
      {children}
      <Toaster richColors position="top-right" />
    </ThemeProvider>
  );
}