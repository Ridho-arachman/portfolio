"use client";

import { ArrowLeft } from "lucide-react";

export function NotFoundButton() {
  return (
    <button
      onClick={() => window.history.back()}
      className="group inline-flex items-center gap-2 px-8 py-4 rounded-full border border-glass-border bg-glass-bg backdrop-blur-xl text-text-primary font-semibold hover:border-accent/50 hover:bg-accent-muted transition-all duration-300"
    >
      <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
      Go Back
    </button>
  );
}
