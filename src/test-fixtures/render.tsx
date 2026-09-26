// Wrapper render bersama untuk test komponen yang memakai TanStack Query.
// Sengaja di `src/test-fixtures/`, bukan di `vitest.setup.ts`: hanya test
// yang butuh cache yang Paying QueryClient-nya, dan tiap test dapat instance
// sendiri supaya cache tidak bocor antar test.
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  render,
  type RenderOptions,
  type RenderResult,
} from "@testing-library/react";
import type { ReactElement, ReactNode } from "react";

export function renderWithQuery(
  ui: ReactElement,
  options?: Omit<RenderOptions, "wrapper">,
): RenderResult {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        // Tanpa ini error API akan di-retry dan test menggantung sampai timeout.
        retry: false,
        gcTime: 0,
        staleTime: 0,
      },
    },
  });

  function Wrapper({ children }: { children: ReactNode }) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
  }

  return render(ui, { ...options, wrapper: Wrapper });
}
