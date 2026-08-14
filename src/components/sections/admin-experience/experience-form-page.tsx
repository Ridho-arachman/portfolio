"use client";

import { ArrowLeft, Briefcase } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ADMIN_EXPERIENCE } from "./constants";
import { ExperienceForm } from "./experience-form";
import { useExperienceStore } from "./experience-store";

export function ExperienceFormPage({
  mode,
  experienceId,
}: {
  mode: "create" | "edit";
  experienceId?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const experiences = useExperienceStore((state) => state.experiences);
  const experience = experienceId
    ? experiences.find((item) => item.id === experienceId)
    : undefined;

  if (!mounted) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-glass-border bg-bg-primary/80 px-4 py-5 sm:px-8">
          <div className="h-8 w-52 animate-pulse rounded-lg bg-white/5" />
          <div className="mt-2 h-4 w-64 animate-pulse rounded-lg bg-white/5" />
        </header>
        <main className="p-4 sm:p-8">
          <div className="h-80 animate-pulse rounded-2xl bg-white/5" />
        </main>
      </div>
    );
  }

  if (mode === "edit" && !experience) {
    return (
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <Briefcase className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">{ADMIN_EXPERIENCE.notFoundTitle}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {ADMIN_EXPERIENCE.notFoundNote}
          </p>
          <Link
            href="/admin/experience"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            {ADMIN_EXPERIENCE.backLabel}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <ExperienceForm
      key={experience?.id ?? "create"}
      mode={mode}
      initialData={experience}
    />
  );
}
