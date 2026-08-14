"use client";

import { ArrowLeft, Award, Loader2, Save } from "lucide-react";
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
  ADMIN_CERTIFICATES,
  certificateFormSchema,
  type AdminCertificate,
  type CertificateFormValues,
} from "./constants";
import { useCertificateStore } from "./certificate-store";

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export function CertificateForm({
  mode,
  initialData,
}: {
  mode: "create" | "edit";
  initialData?: AdminCertificate;
}) {
  const router = useRouter();
  const certificates = useCertificateStore((state) => state.certificates);
  const addCertificate = useCertificateStore((state) => state.addCertificate);
  const updateCertificate = useCertificateStore(
    (state) => state.updateCertificate,
  );

  const [isSaving, setIsSaving] = useState(false);
  const slugTouched = useRef(mode === "edit");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    setError,
    formState: { errors },
  } = useForm<CertificateFormValues>({
    resolver: zodResolver(certificateFormSchema),
    mode: "onTouched",
    defaultValues: initialData
      ? {
          title: initialData.title,
          slug: initialData.slug,
          issuer: initialData.issuer,
          issueDate: initialData.issueDate,
          period: initialData.period,
          credentialId: initialData.credentialId ?? "",
          credentialUrl: initialData.credentialUrl ?? "",
          thumbnail: initialData.thumbnail,
          skills: initialData.skills.join(", "),
          summary: initialData.summary.join("\n"),
          isPublished: initialData.isPublished,
          order: initialData.order,
        }
      : {
          title: "",
          slug: "",
          issuer: "",
          issueDate: "",
          period: "",
          credentialId: "",
          credentialUrl: "",
          thumbnail: "",
          skills: "",
          summary: "",
          isPublished: true,
          order: 0,
        },
  });

  const titleValue = useWatch({ control, name: "title" });
  const isPublished = useWatch({ control, name: "isPublished" });

  useEffect(() => {
    if (!slugTouched.current) {
      setValue("slug", slugify(titleValue), { shouldValidate: false });
    }
  }, [titleValue, setValue]);

  const onSubmit = async (values: CertificateFormValues) => {
    const slugTaken = certificates.some(
      (certificate) =>
        certificate.slug === values.slug && certificate.id !== initialData?.id,
    );
    if (slugTaken) {
      setError("slug", {
        message: "Slug is already in use by another certificate",
      });
      return;
    }

    setIsSaving(true);
    await new Promise((resolve) => setTimeout(resolve, 500));

    const payload = {
      slug: values.slug,
      title: values.title,
      issuer: values.issuer,
      issueDate: values.issueDate,
      period: values.period,
      credentialId: values.credentialId || undefined,
      credentialUrl: values.credentialUrl || undefined,
      thumbnail: values.thumbnail,
      skills: values.skills
        .split(",")
        .map((skill) => skill.trim())
        .filter(Boolean),
      summary: values.summary
        .split("\n")
        .map((line) => line.trim())
        .filter(Boolean),
      isPublished: values.isPublished,
      order: values.order,
    };

    if (mode === "edit" && initialData) {
      updateCertificate(initialData.id, payload);
    } else {
      addCertificate(payload);
    }

    router.push("/admin/certificates");
  };

  return (
    <div className="flex flex-1 flex-col">
      <header className="sticky top-0 z-20 border-b border-glass-border bg-bg-primary/80 backdrop-blur-xl">
        <div className="flex flex-col gap-4 px-4 py-5 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-8">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-accent/25 bg-accent/10 text-accent">
              <Award className="h-5 w-5" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                {mode === "edit"
                  ? ADMIN_CERTIFICATES.editTitle
                  : ADMIN_CERTIFICATES.addTitle}
              </h1>
              <p className="mt-0.5 text-sm text-text-secondary">
                {ADMIN_CERTIFICATES.subtitle}
              </p>
            </div>
          </div>

          <Link
            href="/admin/certificates"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-3.5 py-2 text-xs text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            {ADMIN_CERTIFICATES.backLabel}
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
                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="title">{ADMIN_CERTIFICATES.fieldTitle}</Label>
                  <Input
                    id="title"
                    placeholder={ADMIN_CERTIFICATES.fieldTitlePlaceholder}
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
                  <Label htmlFor="slug">{ADMIN_CERTIFICATES.fieldSlug}</Label>
                  <Input
                    id="slug"
                    placeholder={ADMIN_CERTIFICATES.fieldSlugPlaceholder}
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
                  <Label htmlFor="issuer">
                    {ADMIN_CERTIFICATES.fieldIssuer}
                  </Label>
                  <Input
                    id="issuer"
                    placeholder={ADMIN_CERTIFICATES.fieldIssuerPlaceholder}
                    aria-invalid={errors.issuer ? true : undefined}
                    {...register("issuer")}
                  />
                  {errors.issuer && (
                    <p className="text-xs text-destructive">
                      {errors.issuer.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="issueDate">
                    {ADMIN_CERTIFICATES.fieldIssueDate}
                  </Label>
                  <Input
                    id="issueDate"
                    placeholder={ADMIN_CERTIFICATES.fieldIssueDatePlaceholder}
                    aria-invalid={errors.issueDate ? true : undefined}
                    {...register("issueDate")}
                  />
                  {errors.issueDate && (
                    <p className="text-xs text-destructive">
                      {errors.issueDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="period">{ADMIN_CERTIFICATES.fieldPeriod}</Label>
                  <Input
                    id="period"
                    placeholder={ADMIN_CERTIFICATES.fieldPeriodPlaceholder}
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
                  <Label htmlFor="credentialId">
                    {ADMIN_CERTIFICATES.fieldCredentialId}
                  </Label>
                  <Input
                    id="credentialId"
                    placeholder={ADMIN_CERTIFICATES.fieldCredentialIdPlaceholder}
                    {...register("credentialId")}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="credentialUrl">
                    {ADMIN_CERTIFICATES.fieldCredentialUrl}
                  </Label>
                  <Input
                    id="credentialUrl"
                    type="url"
                    placeholder={ADMIN_CERTIFICATES.fieldCredentialUrlPlaceholder}
                    aria-invalid={errors.credentialUrl ? true : undefined}
                    {...register("credentialUrl")}
                  />
                  {errors.credentialUrl && (
                    <p className="text-xs text-destructive">
                      {errors.credentialUrl.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="thumbnail">
                    {ADMIN_CERTIFICATES.fieldThumbnail}
                  </Label>
                  <Input
                    id="thumbnail"
                    type="url"
                    placeholder={ADMIN_CERTIFICATES.fieldThumbnailPlaceholder}
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
                  <Label htmlFor="skills">{ADMIN_CERTIFICATES.fieldSkills}</Label>
                  <Input
                    id="skills"
                    placeholder={ADMIN_CERTIFICATES.fieldSkillsPlaceholder}
                    {...register("skills")}
                  />
                </div>

                <div className="space-y-2 sm:col-span-2">
                  <Label htmlFor="summary">
                    {ADMIN_CERTIFICATES.fieldSummary}
                  </Label>
                  <Textarea
                    id="summary"
                    rows={4}
                    placeholder={ADMIN_CERTIFICATES.fieldSummaryPlaceholder}
                    aria-invalid={errors.summary ? true : undefined}
                    {...register("summary")}
                  />
                  {errors.summary ? (
                    <p className="text-xs text-destructive">
                      {errors.summary.message}
                    </p>
                  ) : (
                    <p className="text-xs text-text-muted">
                      {ADMIN_CERTIFICATES.fieldSummaryHint}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="order">{ADMIN_CERTIFICATES.fieldOrder}</Label>
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
                      {ADMIN_CERTIFICATES.fieldOrderHint}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>

          <section className="overflow-hidden rounded-2xl border border-glass-border bg-glass-bg/80 backdrop-blur-xl">
            <div className="flex items-center justify-between gap-4 p-5 sm:p-6">
              <div>
                <p className="font-medium">
                  {ADMIN_CERTIFICATES.fieldIsPublished}
                </p>
                <p className="mt-0.5 text-xs text-text-muted">
                  {isPublished
                    ? ADMIN_CERTIFICATES.publishedLabel
                    : ADMIN_CERTIFICATES.draftLabel}
                </p>
              </div>
              <button
                type="button"
                role="switch"
                aria-checked={isPublished}
                aria-label={ADMIN_CERTIFICATES.fieldIsPublished}
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
              render={<Link href="/admin/certificates" />}
              nativeButton={false}
              variant="ghost"
              className="rounded-full"
            >
              {ADMIN_CERTIFICATES.backLabel}
            </Button>
            <Button
              type="submit"
              disabled={isSaving}
              className="rounded-full bg-accent font-semibold text-bg-primary hover:bg-accent-hover hover:shadow-[0_0_24px_rgba(167,139,250,0.4)]"
            >
              {isSaving ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {ADMIN_CERTIFICATES.savingLabel}
                </>
              ) : (
                <>
                  <Save className="h-4 w-4" />
                  {ADMIN_CERTIFICATES.saveLabel}
                </>
              )}
            </Button>
          </div>
        </form>
      </main>
    </div>
  );
}
