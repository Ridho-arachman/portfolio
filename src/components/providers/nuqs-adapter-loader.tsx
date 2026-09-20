"use client";

import "nuqs/adapters/next";

export function NuqsAdapterLoader({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}