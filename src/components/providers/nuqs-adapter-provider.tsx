"use client";

import { NuqsAdapter } from "nuqs/adapters/next/app";

export function NuqsAdapterProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return <NuqsAdapter>{children}</NuqsAdapter>;
}