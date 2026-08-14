"use client";

import { ArrowLeft, Briefcase, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";
import {
  ADMIN_EXPERIENCE,
  EXPERIENCE_TYPES,
  experienceFormSchema,
  type AdminExperience,
  type ExperienceFormValues,
  type ExperienceType,
} from "./constants";
import { useExperienceStore } from "./experience-store";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function ExperienceForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: AdminExperience;
}) {
  const router = useRouter();
  const experiences = useExperienceStore((state) => state.experiences);
  const addExperience = useExperienceStore((state) => state.addExperience);
  const updateExperience = useExperienceStore((state) => state.updateExperience);

  const [isSaving, setIsSaving] = useState(false);
  const slugTouched = useRef(mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    mode: "onTouched",
    defaultValues: initialData
      ? {
          role: initialData.role,
          slug: initialData.slug,
          company: initialData.company,
          type: initialData.type,
          period: initialData.period,
          location: initialData.location,
          thumbnail: initialData.thumbnail,
          gallery: initialData.gallery.join("\n"),
          description: initialData.description.join("\n"),
          order: initialData.order,
        }
      : {
          role: "",
          slug: "",
          company: "",
          type: "Work",
          period: "",
          location: "",
          thumbnail: "",
          gallery: "",
          description: "",
          order: 0,
        },
  });

  const roleValue = useWatch({ control, name: "role" });
  const typeValue = useWatch({ control, name: "type" });

  useEffect(() => {
    if (!slugTouched.current) {
      setValue("slug", slugify(roleValue), { shouldValidate: false });
    }
  }, [roleValue, setValue]);

  const onSubmit = async (values: ExperienceFormValues) => {
    const slugTaken = experiences.some(
      (experience) =>
        experience.slug === values.slug && experience.id !== initialData?.id,
    );
    if (slugTaken) {
      setError("slug", { message: "Slug is already in use by another experience" });
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const payload = {
      slug: values.slug,
      role: values.role,
      company: values.company,
      type: values.type,
      period: values.period,
      location: values.location,
      thumbnail: values.thumbnail,
      gallery: values.gallery
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      description: values.description
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      order: values.order,
    };

    if (mode === "edit" && initialData) {
      updateExperience(initialData.id, payload);
    } else {
      addExperience(payload);
    }

    router.push("/admin/experience");
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Briefcase className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "edit"
                  ? ADMIN_EXPERIENCE.editTitle
                  : ADMIN_EXPERIENCE.addTitle}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_EXPERIENCE.subtitle}
              </p>
            </div>
          </div>

          <Link
            href="/admin/experience"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3.5 py-2 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {ADMIN_EXPERIENCE.backLabel}
          </Link>
        </div>
      </header>

      <main className="p-4 sm:p-6 lg:p-8">
        <form
          onSubmit={handleSubmit(onSubmit)}
          noValidate
          className="mx-auto max-w-3xl space-y-6"
        >
          <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
            <div className="space-y-5 p-5 sm:p-6">
              <div className="grid gap-5 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="role">{ADMIN_EXPERIENCE.fieldRole}</Label>
                  <Input
                    id="role"
                    placeholder={ADMIN_EXPERIENCE.fieldRolePlaceholder}
                    aria-invalid={errors.role ? true : undefined}
                    {...register("role")}
                  />
                  {errors.role && (
                    <p className="text-xs text-destructive">
                      {errors.role.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">{ADMIN_EXPERIENCE.fieldSlug}</Label>
                  <Input
                    id="slug"
                    placeholder={ADMIN_EXPERIENCE.fieldSlugPlaceholder}
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
                  <Label htmlFor="company">
                    {ADMIN_EXPERIENCE.fieldCompany}
                  </Label>
                  <Input
                    id="company"
                    placeholder={ADMIN_EXPERIENCE.fieldCompanyPlaceholder}
                    aria-invalid={errors.company ? true : undefined}
                    {...register("company")}
                  />
                  {errors.company && (
                    <p className="text-xs text-destructive">
                      {errors.company.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>{ADMIN_EXPERIENCE.fieldType}</Label>
                  <div className="flex items-center gap-1.5 rounded-xl border border-glass-border bg-bg-primary/60 p-1.5">
                    {EXPERIENCE_TYPES.map((item) => (
                      <button
                        key={item.value}
                        type="button"
                        aria-pressed={typeValue === item.value}
                        onClick={() =>
                          setValue("type", item.value as ExperienceType)
                        }
                        className={cn(
                          "flex-1 rounded-lg px-3 py-2 text-xs font-semibold transition-colors",
                          typeValue === item.value
                            ? "bg-accent text-bg-primary"
                            : "text-text-secondary hover:text-accent",
                        )}
                      >
                        {item.label}
                      </button>
                    ))}
                  </div>
                  {errors.type && (
                    <p className="text-xs text-destructive">
                      {errors.type.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">{ADMIN_EXPERIENCE.fieldPeriod}</Label>
                  <Input
                    id="period"
                    placeholder={ADMIN_EXPERIENCE.fieldPeriodPlaceholder}
                    aria-invalid={errors.period ? true : undefined}
                    {...register("period")}
                  />
                  {errors.period && (
                    <p className="text-xs text-destructive">
                      {errors.period.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="location">
                    {ADMIN_EXPERIENCE.fieldLocation}
                  </Label>
                  <Input
                    id="location"
                    placeholder={ADMIN_EXPERIENCE.fieldLocationPlaceholder}
                    aria-invalid={errors.location ? true : undefined}
                    {...register("location")}
                  />
                  {errors.location && (
                    <p className="text-xs text-destructive">
                      {errors.location.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="thumbnail">
                    {ADMIN_EXPERIENCE.fieldThumbnail}
                  </Label>
                  <Input
                    id="thumbnail"
                    type="url"
                    placeholder={ADMIN_EXPERIENCE.fieldThumbnailPlaceholder}
                    aria-invalid={errors.thumbnail ? true : undefined}
                    {...register("thumbnail")}
                  />
                  {errors.thumbnail && (
                    <p className="text-xs text-destructive">
                      {errors.thumbnail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="gallery">{ADMIN_EXPERIENCE.fieldGallery}</Label>
                  <Textarea
                    id="gallery"
                    rows={3}
                    placeholder={ADMIN_EXPERIENCE.fieldGalleryPlaceholder}
                    aria-invalid={errors.gallery ? true : undefined}
                    {...register("gallery")}
                  />
                  {errors.gallery ? (
                    <p className="text-xs text-destructive">
                      {errors.gallery.message}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted">
                      {ADMIN_EXPERIENCE.fieldGalleryHint}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">
                    {ADMIN_EXPERIENCE.fieldDescription}
                  </Label>
                  <Textarea
                    id="description"
                    rows={5}
                    placeholder={ADMIN_EXPERIENCE.fieldDescriptionPlaceholder}
                    aria-invalid={errors.description ? true : undefined}
                    {...register("description")}
                  />
                  {errors.description ? (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted">
                      {ADMIN_EXPERIENCE.fieldDescriptionHint}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">{ADMIN_EXPERIENCE.fieldOrder}</Label>
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
                      {ADMIN_EXPERIENCE.fieldOrderHint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <Button
              render={<Link href="/admin/experience" />}
              nativeButton={false}
              variant="ghost"
              className="rounded-full"
            >
              {ADMIN_EXPERIENCE.backLabel}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-accent font-semibold text-bg-primary hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {ADMIN_EXPERIENCE.savingLabel}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {ADMIN_EXPERIENCE.saveLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
