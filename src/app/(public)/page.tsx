import { AboutSection } from "@/components/sections/about";
import { CertificatesSection } from "@/components/sections/certificates";
import { mapCertificateToData } from "@/components/sections/certificates/constants";
import { ContactSection } from "@/components/sections/contact";
import { HeroSection } from "@/components/sections/hero";
import { ProjectsSection } from "@/components/sections/projects";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import prisma from "@/lib/prisma";
import { getClientEnv } from "@/lib/env";
import { buildMetadata } from "@/lib/seo";

const env = getClientEnv();

export const metadata = buildMetadata({
  title: `${env.NEXT_PUBLIC_SITE_NAME} | ${env.NEXT_PUBLIC_SITE_TAGLINE}`,
  description: env.NEXT_PUBLIC_SITE_DESCRIPTION,
  path: "/",
  absolute: true,
});

export default async function Home() {
  const [certificates, projects] = await Promise.all([
    prisma.certificate.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
    prisma.project.findMany({
      where: { isPublished: true },
      orderBy: { order: "asc" },
      take: 6,
    }),
  ]);

  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProjectsSection projects={projects.map(mapDbProjectToProject)} />
      <CertificatesSection certificates={certificates.map(mapCertificateToData)} />
      <ContactSection />
    </>
  );
}
