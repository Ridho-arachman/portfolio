"use client";

import "nuqs/adapters/next";
import { NuqsAdapter } from "nuqs/adapters/next";

export function NuqsAdapterLoader() {
  // Ensure the nuqs adapter is registered for Next.js App Router
  // The import above + NuqsAdapter reference ensures the adapter is registered
  NuqsAdapter;
  return null;
}