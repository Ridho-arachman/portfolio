"use client";

import { AlertTriangle, ArrowLeft, Award } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { ADMIN_CERTIFICATES } from "./constants";
import { CertificateForm } from "./certificate-form";
import { useAdminCertificate, useCreateCertificate, useUpdateCertificate } from "@/hooks/use-certificates";
import type { AdminCertificate } from "./constants";

export function CertificateFormPage({
  mode,
  certificateId,
}: {
  mode: "create" | "edit";
  certificateId?: string;
}) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const frame = requestAnimationFrame(() => setMounted(true));
    return () => cancelAnimationFrame(frame);
  }, []);

  const { data: certificate, isLoading: isLoadingCertificate, isError: isCertificateError } = useAdminCertificate(
    mode === "edit" ? certificateId ?? "" : "",
  );
  const createMutation = useCreateCertificate();
  const updateMutation = useUpdateCertificate();

  const isLoading = mode === "edit" && isLoadingCertificate;
  const certificateData = certificate as AdminCertificate | undefined;

  if (!mounted || isLoading) {
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

  if (mode === "edit" && isCertificateError) {
    return (
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-destructive/25 bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">Failed to load certificate</h1>
          <p className="mt-1 text-sm text-text-secondary">
            Please try again later.
          </p>
          <Link
            href="/admin/certificates"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            {ADMIN_CERTIFICATES.backLabel}
          </Link>
        </main>
      </div>
    );
  }

  if (mode === "edit" && !certificateData) {
    return (
      <div className="flex flex-1 flex-col">
        <main className="flex flex-1 flex-col items-center justify-center p-8 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-accent/25 bg-accent/10 text-accent">
            <Award className="h-6 w-6" />
          </div>
          <h1 className="text-xl font-bold">
            {ADMIN_CERTIFICATES.notFoundTitle}
          </h1>
          <p className="mt-1 text-sm text-text-secondary">
            {ADMIN_CERTIFICATES.notFoundNote}
          </p>
          <Link
            href="/admin/certificates"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-glass-border bg-glass-bg px-4 py-2 text-sm text-text-secondary transition-colors hover:border-accent/40 hover:text-accent"
          >
            <ArrowLeft className="h-4 w-4" />
            {ADMIN_CERTIFICATES.backLabel}
          </Link>
        </main>
      </div>
    );
  }

  return (
    <CertificateForm
      key={certificateData?.id ?? "create"}
      mode={mode}
      initialData={certificateData}
      isLoading={createMutation.isPending || updateMutation.isPending}
      onSubmit={
        mode === "edit" && certificateData
          ? (data) => updateMutation.mutate({ id: certificateData.id, data })
          : (data) => createMutation.mutate(data)
      }
    />
  );
}
