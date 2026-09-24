"use client";

import { AlertCircle, ArrowLeft, Wrench } from "lucide-react";
import Link from "next/link";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_SKILLS } from "./constants";
import { SkillForm } from "./skill-form";
import { useAdminSkill, useCreateSkill, useUpdateSkill } from "@/hooks/use-skills";
import type { AdminSkill } from "./constants";
import type { SkillCreateValues, SkillUpdateValues } from "@/schema/skill";

function mapFormToCreate(data: Omit<AdminSkill, "id" | "createdAt" | "updatedAt">): SkillCreateValues {
  return {
    name: data.name,
    iconName: data.iconName ?? undefined,
    category: data.category,
    proficiency: data.proficiency,
    order: data.order,
  };
}

function mapFormToUpdate(data: Omit<AdminSkill, "id" | "createdAt" | "updatedAt">): SkillUpdateValues {
  return {
    name: data.name,
    iconName: data.iconName ?? undefined,
    category: data.category,
    proficiency: data.proficiency,
    order: data.order,
  };
}

export function SkillFormPage({
  mode,
  skillId,
}: {
  mode: "create" | "edit";
  skillId?: string;
}) {
  const createMutation = useCreateSkill();
  const updateMutation = useUpdateSkill();

  const { data: skillData, isLoading, isError } = useAdminSkill(
    mode === "edit" ? (skillId ?? "") : "",
  );

  const skill = skillData as AdminSkill | undefined;

  if (mode === "edit" && isLoading) {
    return (
      <div className="flex flex-1 flex-col">
        <header className="border-b border-glass-border bg-bg-primary/80 px-4 py-5 sm:px-8">
          <Skeleton className="h-8 w-52 rounded-lg" />
          <Skeleton className="mt-2 h-4 w-64 rounded-lg" />
        </header>
        <main className="p-4 sm:p-8">
          <Skeleton className="h-80 rounded-2xl" />
        </main>
      </div>
    );
  }

  if (mode === "edit" && (isError || !skill)) {
    return (
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            {isError ? (
              <AlertCircle className="h-6 w-6 text-destructive" />
            ) : (
              <Wrench className="h-6 w-6" />
            )}
          </div>
          <h1 className="text-xl font-bold">{ADMIN_SKILLS.notFoundTitle}</h1>
          <p className="mt-1 text-sm text-text-secondary">
            {ADMIN_SKILLS.notFoundNote}
          </p>
          <Link
            href="/admin/skills"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            {ADMIN_SKILLS.backLabel}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <SkillForm
      key={skill?.id ?? "create"}
      mode={mode}
      initialData={skill}
      isLoading={createMutation.isPending || updateMutation.isPending}
      onSubmit={
        mode === "edit" && skill
          ? (data) =>
              updateMutation.mutate(
                { id: skill.id, data: mapFormToUpdate(data) },
                { onSuccess: () => {} },
              )
          : (data) => createMutation.mutate(mapFormToCreate(data))
      }
    />
  );
}
