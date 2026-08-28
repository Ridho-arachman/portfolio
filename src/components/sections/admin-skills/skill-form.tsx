"use client";

import { ArrowLeft, Loader2, Save, Wrench } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { zodResolver } from "@/lib/zod-resolver";
import { skillFormSchema, type SkillFormValues } from "@/schema/skill";
import { ADMIN_SKILLS, SKILL_CATEGORIES, type AdminSkill } from "./constants";

export function SkillForm({
  mode,
  initialData,
  isLoading,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialData?: AdminSkill;
  isLoading: boolean;
  onSubmit: (data: Omit<AdminSkill, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const router = useRouter();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<SkillFormValues>({
    resolver: zodResolver(skillFormSchema),
    mode: "onTouched",
    defaultValues: initialData
      ? {
          name: initialData.name,
          iconName: initialData.iconName ?? "",
          category: initialData.category,
          proficiency: initialData.proficiency,
          order: initialData.order,
        }
      : {
          name: "",
          iconName: "",
          category: "FRONTEND",
          proficiency: 80,
          order: 0,
        },
  });

  const handleFormSubmit = (values: SkillFormValues) => {
    const payload = {
      name: values.name,
      // Kirim "" (bukan undefined) agar update route mengosongkan icon
      // saat field dibersihkan (API memetakan "" -> null).
      iconName: values.iconName ?? "",
      category: values.category,
      proficiency: values.proficiency,
      order: values.order,
    };

    onSubmit(payload);
    router.push("/admin/skills");
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Wrench className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "edit"
                  ? ADMIN_SKILLS.editTitle
                  : ADMIN_SKILLS.addTitle}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_SKILLS.subtitle}
              </p>
            </div>
          </div>

          <Link
            href="/admin/skills"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3.5 py-2 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {ADMIN_SKILLS.backLabel}
          </Link>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <form
          onSubmit={handleSubmit(handleFormSubmit)}
          noValidate
          className="mx-auto max-w-3xl space-y-6"
        >
          <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="name">{ADMIN_SKILLS.fieldName}</Label>
                  <Input
                    id="name"
                    placeholder={ADMIN_SKILLS.fieldNamePlaceholder}
                    aria-invalid={errors.name ? true : undefined}
                    {...register("name")}
                  />
                  {errors.name && (
                    <p className="text-xs text-destructive">
                      {errors.name.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="category">{ADMIN_SKILLS.fieldCategory}</Label>
                  <select
                    id="category"
                    {...register("category")}
                    aria-invalid={errors.category ? true : undefined}
                    className="flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {SKILL_CATEGORIES.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="text-xs text-destructive">
                      {errors.category.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proficiency">
                    {ADMIN_SKILLS.fieldProficiency}
                  </Label>
                  <Input
                    id="proficiency"
                    type="number"
                    min={1}
                    max={100}
                    aria-invalid={errors.proficiency ? true : undefined}
                    {...register("proficiency")}
                  />
                  {errors.proficiency ? (
                    <p className="text-xs text-destructive">
                      {errors.proficiency.message}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted">
                      {ADMIN_SKILLS.fieldProficiencyHint}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="iconName">{ADMIN_SKILLS.fieldIconName}</Label>
                  <Input
                    id="iconName"
                    type="text"
                    placeholder={ADMIN_SKILLS.fieldIconNamePlaceholder}
                    aria-invalid={errors.iconName ? true : undefined}
                    {...register("iconName")}
                  />
                  {errors.iconName && (
                    <p className="text-xs text-destructive">
                      {errors.iconName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">{ADMIN_SKILLS.fieldOrder}</Label>
                  <Input
                    id="order"
                    type="number"
                    min={0}
                    aria-invalid={errors.order ? true : undefined}
                    {...register("order")}
                  />
                  {errors.order ? (
                    <p className="text-xs text-destructive">
                      {errors.order.message}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted">
                      {ADMIN_SKILLS.fieldOrderHint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <Button
              render={<Link href="/admin/skills" />}
              nativeButton={false}
              variant="ghost"
              className="rounded-full"
            >
              {ADMIN_SKILLS.backLabel}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-accent font-semibold text-bg-primary hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {ADMIN_SKILLS.savingLabel}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {ADMIN_SKILLS.saveLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
