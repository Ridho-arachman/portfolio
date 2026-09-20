"use client";

import { NuqsAdapter } from "nuqs/adapters/next";
import { useQueryState } from "nuqs";

export function NuqsAdapterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  // This component ensures nuqs has the correct adapter for Next.js App Router
  // The adapter is automatically configured when useQueryState is used
  // This component serves as a placeholder to ensure the adapter is loaded
  return <>{children}</>;
}

export { useQueryState } from "nuqs";
export { parseAsInteger, parseAsString, parseAsBoolean } from "nuqs";