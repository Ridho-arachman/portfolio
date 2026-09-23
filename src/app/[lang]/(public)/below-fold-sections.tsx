"use client";

import { LazyProviders } from "@/lib/lazy-providers";
import { ProjectsSection } from "@/components/sections/projects";
import { CertificatesSection } from "@/components/sections/certificates";
import { ContactSection } from "@/components/sections/contact";
import type { Project } from "@/components/sections/projects/constants";
import type { CertificateListData } from "@/components/sections/certificates/constants";
import { useTranslation } from "@/hooks/use-translation";

interface BelowFoldSectionsProps {
  projects: Project[];
  certificates: CertificateListData[];
}

/**
 * Below-the-fold chunk for the home page. Imported dynamically (ssr:false) and
 * mounted by `LazySection` only when scrolled near, so react-query, nuqs, zod,
 * the contact form and turnstile never touch the initial critical path.
 */
export function BelowFoldSections({ projects, certificates }: BelowFoldSectionsProps) {
  const { locale } = useTranslation();
  return (
    <LazyProviders>
      <ProjectsSection projects={projects} />
      <CertificatesSection certificates={certificates} />
      <ContactSection locale={locale} />
    </LazyProviders>
  );
}