"use client";

import { ArrowLeft, FolderKanban, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef } from "react";
import { useForm, useWatch } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@/lib/zod-resolver";
import { cn } from "@/lib/utils";
import { ImageUpload } from "@/components/ui/image-upload";
import { MultiImageUpload } from "@/components/ui/multi-image-upload";
import {
  ADMIN_PROJECTS,
  projectFormSchema,
  type AdminProject,
  type ProjectFormValues,
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

export function ProjectForm({
  mode,
  initialData,
  isLoading,
  onSubmit,
}: {
  mode: "create" | "edit";
  initialData?: AdminProject;
  isLoading: boolean;
  onSubmit: (data: Omit<AdminProject, "id" | "createdAt" | "updatedAt">) => void;
}) {
  const router = useRouter();
  const slugTouched = useRef(mode === "edit");
  const tempIdRef = useRef(generateTempId());

  const {
    register,
    handleSubmit,
    control,
    setValue,
    formState: { errors },
  } = useForm<ProjectFormValues>({
    resolver: zodResolver(projectFormSchema),
    mode: "onTouched",
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          description: initialData.description,
          thumbnail: initialData.thumbnail,
          gallery: initialData.gallery ?? [],
          liveUrl: initialData.liveUrl ?? "",
          repoUrl: initialData.repoUrl ?? "",
          technologies: initialData.technologies.join(", "),
          isPublished: initialData.isPublished,
          order: initialData.order,
        }
      : {
          title: "",
          slug: "",
          description: "",
          thumbnail: "",
          gallery: [],
          liveUrl: "",
          repoUrl: "",
          technologies: "",
          isPublished: true,
          order: 0,
        },
  });

  const titleValue = useWatch({ control, name: "title" });
  const isPublished = useWatch({ control, name: "isPublished" });
  const thumbnail = useWatch({ control, name: "thumbnail" });
  const gallery = useWatch({ control, name: "gallery" }) ?? [];

  useEffect(() => {
    if (!slugTouched.current) {
      setValue("slug", slugify(titleValue), { shouldValidate: false });
    }
  }, [titleValue, setValue]);

  const entityId = useMemo(
    () => initialData?.id ?? generateTempId(),
    [initialData?.id],
  );

  const handleFormSubmit = (values: ProjectFormValues) => {
    const payload = {
      slug: values.slug,
      title: values.title,
      description: values.description,
      thumbnail: values.thumbnail,
      gallery: gallery,
      liveUrl: values.liveUrl || undefined,
      repoUrl: values.repoUrl || undefined,
      technologies: values.technologies
        .split(",")
        .map((tag) => tag.trim())
        .filter(Boolean),
      isPublished: values.isPublished,
      order: values.order,
    };

    onSubmit(payload);
    router.push("/admin/projects");
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <FolderKanban className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "edit"
                  ? ADMIN_PROJECTS.editTitle
                  : ADMIN_PROJECTS.addTitle}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_PROJECTS.subtitle}
              </p>
            </div>
          </div>

          <Link
            href="/admin/projects"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3.5 py-2 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {ADMIN_PROJECTS.backLabel}
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
                  <Label htmlFor="title">{ADMIN_PROJECTS.fieldTitle}</Label>
                  <Input
                    id="title"
                    placeholder={ADMIN_PROJECTS.fieldTitlePlaceholder}
                    aria-invalid={errors.title ? true : undefined}
                    {...register("title")}
                  />
                  {errors.title && (
                    <p className="text-xs text-destructive">
                      {errors.title.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="slug">{ADMIN_PROJECTS.fieldSlug}</Label>
                  <Input
                    id="slug"
                    placeholder={ADMIN_PROJECTS.fieldSlugPlaceholder}
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
                  <Label htmlFor="order">{ADMIN_PROJECTS.fieldOrder}</Label>
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
                      {ADMIN_PROJECTS.fieldOrderHint}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="description">
                    {ADMIN_PROJECTS.fieldDescription}
                  </Label>
                  <Textarea
                    id="description"
                    rows={4}
                    placeholder={ADMIN_PROJECTS.fieldDescriptionPlaceholder}
                    aria-invalid={errors.description ? true : undefined}
                    {...register("description")}
                  />
                  {errors.description && (
                    <p className="text-xs text-destructive">
                      {errors.description.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <ImageUpload
                    value={thumbnail}
                    onChange={(url) => setValue("thumbnail", url)}
                    onRemove={() => setValue("thumbnail", "")}
                    entityType="projects"
                    entityId={entityId}
                    label={ADMIN_PROJECTS.fieldThumbnail}
                    placeholder={ADMIN_PROJECTS.fieldThumbnailPlaceholder}
                  />
                  {errors.thumbnail && (
                    <p className="text-xs text-destructive">
                      {errors.thumbnail.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <MultiImageUpload
                    value={gallery}
                    onChange={(urls) => setValue("gallery", urls)}
                    entityType="projects"
                    entityId={entityId}
                    label={ADMIN_PROJECTS.fieldGallery}
                    placeholder={ADMIN_PROJECTS.fieldGalleryPlaceholder}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="liveUrl">{ADMIN_PROJECTS.fieldLiveUrl}</Label>
                  <Input
                    id="liveUrl"
                    type="url"
                    placeholder={ADMIN_PROJECTS.fieldLiveUrlPlaceholder}
                    aria-invalid={errors.liveUrl ? true : undefined}
                    {...register("liveUrl")}
                  />
                  {errors.liveUrl && (
                    <p className="text-xs text-destructive">
                      {errors.liveUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="repoUrl">{ADMIN_PROJECTS.fieldRepoUrl}</Label>
                  <Input
                    id="repoUrl"
                    type="url"
                    placeholder={ADMIN_PROJECTS.fieldRepoUrlPlaceholder}
                    aria-invalid={errors.repoUrl ? true : undefined}
                    {...register("repoUrl")}
                  />
                  {errors.repoUrl && (
                    <p className="text-xs text-destructive">
                      {errors.repoUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="technologies">
                    {ADMIN_PROJECTS.fieldTechnologies}
                  </Label>
                  <Input
                    id="technologies"
                    placeholder={ADMIN_PROJECTS.fieldTechnologiesPlaceholder}
                    {...register("technologies")}
                  />
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
              <div>
                <p className="font-medium">{ADMIN_PROJECTS.fieldIsPublished}</p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {isPublished
                    ? ADMIN_PROJECTS.publishedLabel
                    : ADMIN_PROJECTS.draftLabel}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isPublished}
                aria-label={ADMIN_PROJECTS.fieldIsPublished}
                onClick={() => setValue("isPublished", !isPublished)}
                className={cn(
                  "relative h-6 w-11 shrink-0 rounded-full transition-colors",
                  isPublished
                    ? "bg-accent"
                    : "border border-glass-border bg-white/10",
                )}
              >
                <span
                  className={cn(
                    "absolute left-1 top-1 h-4 w-4 rounded-full bg-white shadow transition-transform",
                    isPublished && "translate-x-5",
                  )}
                />
              </button>
            </div>
          </section>

          <div className="flex items-center justify-end gap-3">
            <Button
              render={<Link href="/admin/projects" />}
              nativeButton={false}
              variant="ghost"
              className="rounded-full"
            >
              {ADMIN_PROJECTS.backLabel}
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="rounded-full bg-accent font-semibold text-bg-primary hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {ADMIN_PROJECTS.savingLabel}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {ADMIN_PROJECTS.saveLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}