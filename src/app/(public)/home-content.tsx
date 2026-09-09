"use client";

import dynamic from "next/dynamic";
import { HeroSection } from "@/components/sections/hero";
import { AboutSection } from "@/components/sections/about";
import { Skeleton } from "@/components/ui/skeleton";
import type { Project } from "@/components/sections/projects/constants";
import type { CertificateListData } from "@/components/sections/certificates/constants";

// Lazy-load below-fold sections with skeleton loading
const ProjectsSection = dynamic(
  () => import("@/components/sections/projects").then((mod) => mod.ProjectsSection),
  {
    ssr: false,
    loading: () => (
      <section className="relative overflow-hidden pb-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-24">
            <Skeleton className="h-6 w-32 mx-auto rounded-full mb-4" />
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
          <div className="text-center">
            <Skeleton className="h-12 w-48 mx-auto rounded-full" />
          </div>
        </div>
      </section>
    ),
  }
);

const CertificatesSection = dynamic(
  () => import("@/components/sections/certificates").then((mod) => mod.CertificatesSection),
  {
    ssr: false,
    loading: () => (
      <section className="relative overflow-hidden pb-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-24">
            <Skeleton className="h-6 w-32 mx-auto rounded-full mb-4" />
            <Skeleton className="h-10 w-64 mx-auto" />
            <Skeleton className="h-6 w-80 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl">
                <Skeleton className="h-full w-full" />
              </div>
            ))}
          </div>
          <div className="text-center">
            <Skeleton className="h-12 w-48 mx-auto rounded-full" />
          </div>
        </div>
      </section>
    ),
  }
);

const ContactSection = dynamic(
  () => import("@/components/sections/contact").then((mod) => mod.ContactSection),
  {
    ssr: false,
    loading: () => (
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <Skeleton className="h-6 w-32 rounded-full mb-4" />
              <Skeleton className="h-10 w-80" />
              <Skeleton className="h-6 w-96 mt-4" />
            </div>
            <div className="space-y-4">
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-12 w-full rounded-xl" />
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-12 w-48 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    ),
  }
);

interface HomeContentProps {
  projects: Project[];
  certificates: CertificateListData[];
}

export default function HomeContent({ projects, certificates }: HomeContentProps) {
  return (
    <>
      <HeroSection />
      <AboutSection />
      <ProjectsSection projects={projects} />
      <CertificatesSection certificates={certificates} />
      <ContactSection />
    </>
  );
}