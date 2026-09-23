"use client";

import dynamic from "next/dynamic";
import type { ReactNode } from "react";
import { LazySection } from "@/components/ui/lazy-section";
import { PublicProviders } from "@/lib/public-providers";
import type { Project } from "@/components/sections/projects/constants";
import type { CertificateListData } from "@/components/sections/certificates/constants";

// CSS-only skeleton (mimics ui/skeleton) so the shared zustand/lucide chunk
// that Skeleton pulls in never loads on the home critical path.
function SkeletonBar({ className }: { className: string }) {
  return (
    <div
      aria-hidden
      className={`animate-pulse rounded-md bg-muted ${className}`}
    />
  );
}

function BelowFoldSkeleton() {
  return (
    <>
      <section className="relative overflow-hidden pb-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-24">
            <SkeletonBar className="h-6 w-32 mx-auto rounded-full mb-4" />
            <SkeletonBar className="h-10 w-64 mx-auto" />
            <SkeletonBar className="h-6 w-80 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-3xl">
                <SkeletonBar className="h-full w-full" />
              </div>
            ))}
          </div>
          <div className="text-center">
            <SkeletonBar className="h-12 w-48 mx-auto rounded-full" />
          </div>
        </div>
      </section>
      <section className="relative overflow-hidden pb-14">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 md:mb-24">
            <SkeletonBar className="h-6 w-32 mx-auto rounded-full mb-4" />
            <SkeletonBar className="h-10 w-64 mx-auto" />
            <SkeletonBar className="h-6 w-80 mx-auto mt-4" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-16">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-80 rounded-2xl">
                <SkeletonBar className="h-full w-full" />
              </div>
            ))}
          </div>
          <div className="text-center">
            <SkeletonBar className="h-12 w-48 mx-auto rounded-full" />
          </div>
        </div>
      </section>
      <section className="relative py-20 overflow-hidden">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            <div>
              <SkeletonBar className="h-6 w-32 rounded-full mb-4" />
              <SkeletonBar className="h-10 w-80" />
              <SkeletonBar className="h-6 w-96 mt-4" />
            </div>
            <div className="space-y-4">
              <SkeletonBar className="h-12 w-full rounded-xl" />
              <SkeletonBar className="h-12 w-full rounded-xl" />
              <SkeletonBar className="h-32 w-full rounded-xl" />
              <SkeletonBar className="h-12 w-48 rounded-xl" />
            </div>
          </div>
        </div>
      </section>
    </>
  );
}

// One lazy bundle for everything below the fold: react-query + nuqs providers
// + projects/certificates/contact sections (incl. zod, turnstile) are
// code-split here so they never load or execute on the home page's critical
// path. LazySection gates mounting until the section approaches the viewport.
const BelowFoldSections = dynamic(
  () => import("./below-fold-sections").then((m) => m.BelowFoldSections),
  { ssr: false, loading: BelowFoldSkeleton }
);

interface HomePageContentProps {
  children: ReactNode;
  projects: Project[];
  certificates: CertificateListData[];
}

export function HomePageContent({
  children,
  projects,
  certificates,
}: HomePageContentProps) {
  return (
    <PublicProviders>
      {children}
      <LazySection placeholder={<BelowFoldSkeleton />} rootMargin="0px 0px -200px 0px">
        <BelowFoldSections projects={projects} certificates={certificates} />
      </LazySection>
    </PublicProviders>
  );
}