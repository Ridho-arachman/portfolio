"use client";

import { ArrowLeft, FolderTree, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@/lib/zod-resolver";
import {
  ADMIN_CATEGORIES,
  categoryFormSchema,
  type AdminCategory,
  type CategoryFormValues,
} from "./constants";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CategoryForm({
  mode,
  initialData,
  isLoading,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialData?: AdminCategory;
  isLoading: boolean;
  onSubmit: (data: Record<string, unknown>) => void;
}) {
  const slugTouched = useRef(mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<CategoryFormValues>({
    resolver: zodResolver(categoryFormSchema),
    mode: "onTouched",
    defaultValues: initialData
      ? {
          name: initialData.name,
          slug: initialData.slug,
          description: initialData.description ?? "",
          order: initialData.order,
        }
      : {
          name: "",
          slug: "",
          description: "",
          order: 0,
        },
  });

  const nameValue = useWatch({ control, name: "name" });

  useEffect(() => {
    if (!slugTouched.current) {
      setValue("slug", slugify(nameValue), { shouldValidate: false });
    }
  }, [nameValue, control, setValue]);

  const handleFormSubmit = (values: CategoryFormValues) => {
    const payload = {
      name: values.name,
      slug: values.slug,
      description: values.description || null,
      order: values.order,
    };

    onSubmit(payload);
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <FolderTree className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "edit"
                  ? ADMIN_CATEGORIES.editTitle
                  : ADMIN_CATEGORIES.addTitle}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_CATEGORIES.subtitle}
              </p>
            </div>
          </div>

          <Link
            href="/admin/categories"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3.5 py-2 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {ADMIN_CATEGORIES.backLabel}
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
                  <Label htmlFor="name">{ADMIN_CATEGORIES.fieldName}</Label>
                  <Input
                    id="name"
                    placeholder={ADMIN_CATEGORIES.fieldNamePlaceholder}
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
                  <Label htmlFor="slug">{ADMIN_CATEGORIES.fieldSlug}</Label>
                  <Input
                    id="slug"
                    placeholder={ADMIN_CATEGORIES.fieldSlugPlaceholder}
                    aria-invalid={errors.slug ? true : undefined}
                    onInput={() => {
                      slugTouched.current = true;
                    }}
                    {...register("slug")}
                  />
                  {errors.slug && (
                    <p className="text-xs text-destructive">
                      {errors.slug.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">{ADMIN_CATEGORIES.fieldOrder}</Label>
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
                      {ADMIN_CATEGORIES.fieldOrderHint}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">
                    {ADMIN_CATEGORIES.fieldDescription}
                  </Label>
                  <Textarea
                    id="description"
                    rows={3}
                    placeholder={ADMIN_CATEGORIES.fieldDescriptionPlaceholder}
                    {...register("description")}
                  />
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <Button
              render={<Link href="/admin/categories" />}
              nativeButton={false}
              variant="ghost"
              className="rounded-full"
            >
              {ADMIN_CATEGORIES.backLabel}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-accent font-semibold text-bg-primary hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {ADMIN_CATEGORIES.savingLabel}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {ADMIN_CATEGORIES.saveLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
