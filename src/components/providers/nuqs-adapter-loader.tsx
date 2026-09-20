"use client";

import "nuqs/adapters/next";

export function NuqsAdapterLoader() {
  // This component ensures the nuqs adapter is loaded for Next.js App Router
  // The import above registers the adapter automatically
  return null;
}