import { AboutSection } from "@/components/sections/about";
import { CertificatesSection } from "@/components/sections/certificates";
import { mapCertificateToData } from "@/components/sections/certificates/constants";
import { ContactSection } from "@/components/sections/contact";
import { HeroSection } from "@/components/sections/hero";
import { ProjectsSection } from "@/components/sections/projects";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import prisma from "@/lib/prisma";

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
