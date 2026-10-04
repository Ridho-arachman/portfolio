"use client";

import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useEntityId } from "@/hooks/use-entity-id";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { zodResolver } from "@/lib/zod-resolver";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import { EntityMultiSelect } from "@/components/ui/entity-multi-select";
import { useAdminProjects } from "@/hooks/use-projects";
import { useAdminCertificates } from "@/hooks/use-certificates";
import {
  experienceFormSchema,
  type ExperienceFormValues,
} from "@/schema/experience";
import { slugify } from "@/utils/slug";
import { formatExperiencePeriod } from "@/lib/utils/experience-mapper";
import {
  ADMIN_EXPERIENCE,
  EXPERIENCE_TYPES,
  type AdminExperienceWithRelations,
  type ExperienceType,
} from "./constants";

export function ExperienceForm({
  mode,
  initialData,
  onSubmit,
  isLoading = false,
}: {
  mode: "create" | "edit";
  initialData?: AdminExperienceWithRelations;
  onSubmit: (values: ExperienceFormValues) => void;
  isLoading?: boolean;
}) {
  const [slugTouched] = useState(mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ExperienceFormValues>({
    resolver: zodResolver(experienceFormSchema),
    mode: "onTouched",
    defaultValues: initialData
      ? {
          role: initialData.title,
          slug: initialData.slug,
          company: initialData.company,
          type: initialData.type,
          period: formatExperiencePeriod(
            initialData.startDate,
            initialData.endDate,
            initialData.isCurrent,
          ),
          location: initialData.location,
          thumbnail: initialData.thumbnail ?? "",
          gallery: initialData.gallery ?? [],
          description: initialData.description.join("\n"),
          projectIds: initialData.projects.map((p) => p.id),
          certificateIds: initialData.certificates.map((c) => c.id),
          isPublished: initialData.isPublished,
          order: initialData.order,
          idTitle: initialData.translations?.id?.title ?? "",
          idDescription:
            initialData.translations?.id?.description?.join("\n") ?? "",
        }
      : {
          role: "",
          slug: "",
          company: "",
          type: "WORK" as ExperienceType,
          period: "",
          location: "",
          thumbnail: "",
          gallery: [],
          description: "",
          projectIds: [],
          certificateIds: [],
          isPublished: true,
          order: 0,
          idTitle: "",
          idDescription: "",
        },
  });

  const role = useWatch({ control, name: "role" });
  const thumbnail = useWatch({ control, name: "thumbnail" });
  const gallery = useWatch({ control, name: "gallery" }) ?? [];
  const projectIds = useWatch({ control, name: "projectIds" }) ?? [];
  const certificateIds = useWatch({ control, name: "certificateIds" }) ?? [];
  const isPublished = useWatch({ control, name: "isPublished" });

  // `pageSize: 100` adalah batas `parsePagination`; daftar admin ini sudah
  // memfilter baris di-trash, jadi baris trash tidak pernah muncul sebagai
  // opsi yang bisa dipilih.
  const { data: projects } = useAdminProjects({ pageSize: 100 });
  const { data: certificates } = useAdminCertificates({ pageSize: 100 });

  useEffect(() => {
    if (!slugTouched && role) {
      setValue("slug", slugify(role), { shouldValidate: true });
    }
  }, [role, setValue, slugTouched]);

  const entityId = useEntityId(initialData?.id);

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="flex flex-col gap-6 p-4 sm:p-6 lg:p-8"
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
            disabled={slugTouched}
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
          <EntityMultiSelect
            label={ADMIN_EXPERIENCE.form.projectsLabel}
            options={(projects?.data ?? []).map((project) => ({
              id: project.id,
              label: project.title,
            }))}
            value={projectIds}
            onChange={(ids) =>
              setValue("projectIds", ids, { shouldValidate: true })
            }
            searchPlaceholder={ADMIN_EXPERIENCE.form.searchProjects}
            emptyLabel={ADMIN_EXPERIENCE.form.noProjects}
          />
        </div>

        <div className="sm:col-span-2">
          <EntityMultiSelect
            label={ADMIN_EXPERIENCE.form.certificatesLabel}
            options={(certificates?.data ?? []).map((certificate) => ({
              id: certificate.id,
              label: certificate.title,
            }))}
            value={certificateIds}
            onChange={(ids) =>
              setValue("certificateIds", ids, { shouldValidate: true })
            }
            searchPlaceholder={ADMIN_EXPERIENCE.form.searchCertificates}
            emptyLabel={ADMIN_EXPERIENCE.form.noCertificates}
          />
        </div>

        <div className="sm:col-span-2 flex flex-col gap-4 rounded-2xl border border-dashed border-glass-border p-4">
          <div>
            <p className="text-sm font-medium">{ADMIN_EXPERIENCE.form.idSectionLabel}</p>
            <p className="text-sm text-text-muted">
              {ADMIN_EXPERIENCE.form.idSectionNote}
            </p>
          </div>

          <div>
            <Label htmlFor="idTitle">{ADMIN_EXPERIENCE.form.idTitleLabel}</Label>
            <Input
              id="idTitle"
              placeholder={ADMIN_EXPERIENCE.form.idTitlePlaceholder}
              {...register("idTitle")}
            />
          </div>

          <div>
            <Label htmlFor="idDescription">
              {ADMIN_EXPERIENCE.form.idDescriptionLabel}
            </Label>
            <Textarea
              id="idDescription"
              placeholder={ADMIN_EXPERIENCE.form.idDescriptionPlaceholder}
              {...register("idDescription")}
              rows={4}
            />
          </div>
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="isPublished">{ADMIN_EXPERIENCE.form.isPublishedLabel}</Label>
            <Switch
              id="isPublished"
              checked={isPublished}
              onCheckedChange={(checked) =>
                setValue("isPublished", checked, { shouldValidate: true })
              }
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