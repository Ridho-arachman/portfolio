"use client";

import { useEffect } from "react";
import "nuqs/adapters/next";

export function NuqsAdapterLoader() {
  useEffect(() => {
    // This effect ensures the nuqs adapter is loaded for Next.js App Router
    // The import above ensures the adapter is registered
  }, []);

  return null;
}