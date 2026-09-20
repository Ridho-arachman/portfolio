"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { useState } from "react";
import { PublicProviders } from "./public-providers";

// Heavy providers for below-fold lazy sections (react-query + nuqs). Kept in
// its own module so importing it only happens from the dynamically-loaded
// below-fold bundle, never from the home page's initial client graph.
export function LazyProviders({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 2 * 60 * 1000,
            gcTime: 10 * 60 * 1000,
            refetchOnWindowFocus: false,
            retry: 2,
          },
        },
      }),
  );

  return (
    <QueryClientProvider client={queryClient}>
      <NuqsAdapter>{children}</NuqsAdapter>
    </QueryClientProvider>
  );
}

// Combined providers for non-home routes (admin/content pages may still use
// this single entry point).
export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <LazyProviders>
      <PublicProviders>{children}</PublicProviders>
    </LazyProviders>
  );
}