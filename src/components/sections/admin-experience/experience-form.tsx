"use client";

import { ArrowLeft, Briefcase, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import {
  ADMIN_EXPERIENCE,
  EXPERIENCE_TYPES,
  experienceFormSchema,
  type AdminExperience,
  type ExperienceFormValues,
  type ExperienceType,
} from "./constants";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function generateTempId(): string {
  return `temp-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export function ExperienceForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false,
}: {
  mode: "create" | "edit";
  initialData?: AdminExperience;
  onSubmit: (values: ExperienceFormValues) => void;
  isLoading?: boolean;
}) {
  const slugTouched = useRef(mode === "edit");
  const tempIdRef = useRef(generateTempId());

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
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
          logoUrl: initialData.logoUrl,
          gallery: initialData.gallery ?? [],
          description: initialData.description.join("\n"),
          isPublished: initialData.isPublished,
          order: initialData.order,
        }
      : {
          role: "",
          slug: "",
          company: "",
          type: "Work" as ExperienceType,
          period: "",
          location: "",
          thumbnail: "",
          logoUrl: "",
          gallery: [],
          description: "",
          isPublished: true,
          order: 0,
        },
  });

  const role = watch("role");
  const thumbnail = watch("thumbnail");
  const logoUrl = watch("logoUrl") ?? "";
  const gallery = watch("gallery") ?? [];

  useEffect(() => {
    if (!slugTouched.current && role) {
      setValue("slug", slugify(role), { shouldValidate: true });
    }
  }, [role, setValue]);

  const entityId = initialData?.id ?? tempIdRef.current;

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 max-w-3xl mx-auto"
    >
      <div className="flex items-center justify-between gap-4">
        <Link
          href="/admin/experience"
          className="flex items-center gap-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
          {ADMIN_EXPERIENCE.form.backToList}
        </Link>
        <h1 className="text-2xl font-bold">
          {mode === "create"
            ? ADMIN_EXPERIENCE.form.submitCreate
            : ADMIN_EXPERIENCE.form.submitUpdate}
        </h1>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="role">{ADMIN_EXPERIENCE.form.roleLabel}</Label>
          <Input
            id="role"
            placeholder={ADMIN_EXPERIENCE.form.rolePlaceholder}
            {...register("role")}
            aria-invalid={errors.role ? "true" : "false"}
          />
          {errors.role && (
            <p className="mt-1 text-sm text-destructive">{errors.role.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="slug">{ADMIN_EXPERIENCE.form.slugLabel}</Label>
          <Input
            id="slug"
            placeholder={ADMIN_EXPERIENCE.form.slugPlaceholder}
            {...register("slug")}
            aria-invalid={errors.slug ? "true" : "false"}
            disabled={slugTouched.current}
          />
          {errors.slug && (
            <p className="mt-1 text-sm text-destructive">{errors.slug.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="company">{ADMIN_EXPERIENCE.form.companyLabel}</Label>
          <Input
            id="company"
            placeholder={ADMIN_EXPERIENCE.form.companyPlaceholder}
            {...register("company")}
            aria-invalid={errors.company ? "true" : "false"}
          />
          {errors.company && (
            <p className="mt-1 text-sm text-destructive">{errors.company.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="type">{ADMIN_EXPERIENCE.form.typeLabel}</Label>
          <select
            id="type"
            {...register("type")}
            className="mt-1.5 flex w-full rounded-md border border-input bg-background px-3 py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
            aria-invalid={errors.type ? "true" : "false"}
          >
            {EXPERIENCE_TYPES.map((t) => (
              <option key={t.value} value={t.value}>
                {t.label}
              </option>
            ))}
          </select>
          {errors.type && (
            <p className="mt-1 text-sm text-destructive">{errors.type.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="period">{ADMIN_EXPERIENCE.form.periodLabel}</Label>
          <Input
            id="period"
            placeholder={ADMIN_EXPERIENCE.form.periodPlaceholder}
            {...register("period")}
            aria-invalid={errors.period ? "true" : "false"}
          />
          {errors.period && (
            <p className="mt-1 text-sm text-destructive">{errors.period.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="location">{ADMIN_EXPERIENCE.form.locationLabel}</Label>
          <Input
            id="location"
            placeholder={ADMIN_EXPERIENCE.form.locationPlaceholder}
            {...register("location")}
            aria-invalid={errors.location ? "true" : "false"}
          />
          {errors.location && (
            <p className="mt-1 text-sm text-destructive">{errors.location.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <ImageUpload
            value={thumbnail}
            onChange={(url) => setValue("thumbnail", url)}
            onRemove={() => setValue("thumbnail", "")}
            entityType="experience"
            entityId={entityId}
            label={ADMIN_EXPERIENCE.form.thumbnailLabel}
            placeholder={ADMIN_EXPERIENCE.form.thumbnailPlaceholder}
          />
          {errors.thumbnail && (
            <p className="mt-1 text-sm text-destructive">{errors.thumbnail.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="logoUrl">{ADMIN_EXPERIENCE.form.logoUrlLabel}</Label>
          <ImageUpload
            value={logoUrl}
            onChange={(url) => setValue("logoUrl", url)}
            onRemove={() => setValue("logoUrl", "")}
            entityType="experience"
            entityId={entityId}
            label={ADMIN_EXPERIENCE.form.logoUrlLabel}
            placeholder={ADMIN_EXPERIENCE.form.logoUrlPlaceholder}
          />
          {errors.logoUrl && (
            <p className="mt-1 text-sm text-destructive">{errors.logoUrl.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <MultiImageUpload
            value={gallery}
            onChange={(urls) => setValue("gallery", urls)}
            entityType="experience"
            entityId={entityId}
            label={ADMIN_EXPERIENCE.form.galleryLabel}
            placeholder={ADMIN_EXPERIENCE.form.galleryPlaceholder}
          />
        </div>

        <div className="sm:col-span-2">
          <Label htmlFor="description">{ADMIN_EXPERIENCE.form.descriptionLabel}</Label>
          <Textarea
            id="description"
            placeholder={ADMIN_EXPERIENCE.form.descriptionPlaceholder}
            {...register("description")}
            rows={4}
            aria-invalid={errors.description ? "true" : "false"}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-destructive">{errors.description.message}</p>
          )}
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="isPublished">{ADMIN_EXPERIENCE.form.isPublishedLabel}</Label>
            <Switch
              id="isPublished"
              {...register("isPublished")}
              aria-invalid={errors.isPublished ? "true" : "false"}
            />
          </div>
          <p className="mt-1 text-sm text-text-muted">
            {ADMIN_EXPERIENCE.form.isPublishedDescription}
          </p>
          {errors.isPublished && (
            <p className="mt-1 text-sm text-destructive">{errors.isPublished.message}</p>
          )}
        </div>

        <div>
          <Label htmlFor="order">{ADMIN_EXPERIENCE.form.orderLabel}</Label>
          <Input
            id="order"
            type="number"
            placeholder={ADMIN_EXPERIENCE.form.orderPlaceholder}
            {...register("order", { valueAsNumber: true })}
            aria-invalid={errors.order ? "true" : "false"}
          />
          {errors.order && (
            <p className="mt-1 text-sm text-destructive">{errors.order.message}</p>
          )}
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-glass-border">
        <Link
          href="/admin/experience"
          className="px-4 py-2 text-sm font-medium text-text-secondary hover:text-text-primary transition-colors"
        >
          Cancel
        </Link>
        <Button
          type="submit"
          disabled={isLoading}
          className="gap-2"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Save className="h-4 w-4" />
          )}
          {mode === "create"
            ? ADMIN_EXPERIENCE.form.submitCreate
            : ADMIN_EXPERIENCE.form.submitUpdate}
        </Button>
      </div>
    </form>
  );
}