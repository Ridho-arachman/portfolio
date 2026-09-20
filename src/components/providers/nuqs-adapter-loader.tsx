"use client";

import { useEffect } from "react";
import { setAdapter } from "nuqs/adapters/next";

export function NuqsAdapterLoader() {
  useEffect(() => {
    // Ensure the nuqs adapter is registered for Next.js App Router
    setAdapter("next");
  }, []);

  return null;
}