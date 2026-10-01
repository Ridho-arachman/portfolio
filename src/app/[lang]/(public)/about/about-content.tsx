"use client";

import Link from "next/link";
import { ArrowUpRight } from "lucide-react";

import { useTranslation } from "@/hooks/use-translation";
import { useSiteSettings } from "@/components/providers/public-content-provider";
import { resolveSocialLinks } from "@/components/layout/footer/constants";
import { LazySection } from "@/components/ui/lazy-section";
import { displayFont } from "@/components/sections/about/cinematic/font";
import { CinematicHero } from "@/components/sections/about/cinematic/hero";
import { CinematicMarquee } from "@/components/sections/about/cinematic/marquee";
import { CinematicStory } from "@/components/sections/about/cinematic/story";
import { CinematicVentures } from "@/components/sections/about/cinematic/ventures";
import { CinematicImpact } from "@/components/sections/about/cinematic/impact";
import { CinematicExperience } from "@/components/sections/about/cinematic/experience";
import type { MappedExperience } from "@/lib/utils/experience-mapper";
import type { Project } from "@/components/sections/projects/constants";

interface AboutPageContentProps {
  experiences: MappedExperience[];
  projects: Project[];
  skillNames: string[];
  counts: {
    projects: number;
    certificates: number;
    experience: number;
    skills: number;
  };
}

export function AboutPageContent({
  experiences,
  projects,
  skillNames,
  counts,
}: AboutPageContentProps) {
  const { t } = useTranslation();
  const siteSettings = useSiteSettings();
  const { fullName, bio, contactEmail } = siteSettings;
  const socials = resolveSocialLinks(siteSettings);
  const c = t.about.cinematic;

  const principles = [
    {
      title: t.coreValues.performanceFirst,
      description: t.coreValues.performanceFirstDesc,
    },
    { title: t.coreValues.typeSafe, description: t.coreValues.typeSafeDesc },
    {
      title: t.coreValues.userCentric,
      description: t.coreValues.userCentricDesc,
    },
    {
      title: t.coreValues.continuousLearning,
      description: t.coreValues.continuousLearningDesc,
    },
  ];

  const stats = [
    { value: String(counts.projects), label: t.showcase.statsProjects },
    { value: String(counts.certificates), label: t.showcase.statsCertificates },
    { value: String(counts.experience), label: t.showcase.statsExperience },
    { value: String(counts.skills), label: t.showcase.statsSkills },
  ];

  return (
    <div
      className={`${displayFont.variable} flex min-h-screen flex-col overflow-x-hidden`}
    >
      <CinematicHero
        fullName={fullName}
        roles={c.roles.split("|").map((role) => role.trim())}
        bio={bio}
        scrollCue={c.scrollCue}
      />

      <CinematicMarquee label={t.about.marquee} items={skillNames} />

      <CinematicStory
        eyebrow={c.storyEyebrow}
        title={c.storyTitle}
        body={t.about.description}
        principles={principles}
      />

      <LazySection placeholder={<div className="min-h-[70vh]" aria-hidden />}>
        <CinematicVentures
          eyebrow={c.venturesEyebrow}
          title={c.venturesTitle}
          countLabel={`${String(projects.length).padStart(2, "0")} / ${t.projects.title}`}
          viewLabel={t.projects.viewProject}
          ventures={projects.map((project) => ({
            slug: project.slug,
            title: project.title,
            description: project.description ?? "",
            image: project.image,
            tags: project.tags,
            year: project.year,
          }))}
        />
      </LazySection>

      <CinematicImpact
        eyebrow={c.impactEyebrow}
        title={c.impactTitle}
        stats={stats}
      />

      <section className="px-6 pb-20 md:pb-32 lg:px-12">
        <div className="container mx-auto">
          <Link
            href={`mailto:${contactEmail}`}
            className="inline-flex min-h-12 items-center gap-2 break-all text-2xl font-semibold tracking-tight transition-[color,transform] duration-300 hover:translate-x-3 hover:text-accent sm:gap-3 sm:text-5xl"
          >
            {contactEmail}
            <ArrowUpRight
              aria-hidden
              className="size-[0.7em] shrink-0 text-accent"
            />
          </Link>
          {socials.length > 0 && (
            <div className="mt-8 flex flex-wrap gap-4">
              {socials.map((social) => (
                <Link
                  key={social.key}
                  href={social.href}
                  target={social.key === "email" ? undefined : "_blank"}
                  rel={social.key === "email" ? undefined : "noreferrer"}
                  aria-label={social.label}
                  className="inline-flex min-h-12 min-w-12 items-center justify-center rounded-full border border-glass-border bg-bg-secondary/60 text-text-secondary transition-all duration-300 hover:-translate-y-0.5 hover:border-accent/50 hover:text-accent focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
                >
                  <social.icon aria-hidden="true" className="size-5" />
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>

      <LazySection placeholder={<div className="min-h-[70vh]" aria-hidden />}>
        <CinematicExperience
          eyebrow={c.experienceEyebrow}
          title={c.experienceTitle}
          experiences={experiences}
        />
      </LazySection>
    </div>
  );
}
