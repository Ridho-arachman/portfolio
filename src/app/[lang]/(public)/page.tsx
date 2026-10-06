import { HomePageContent } from "./home-content";
import { HeroSection } from "@/components/sections/hero";
import { mapDbProjectToProject } from "@/components/sections/projects/map-project";
import { mapCertificateToData } from "@/components/sections/certificates/constants";
import prisma from "@/lib/prisma";
import { notDeleted } from "@/lib/soft-delete";
import {
  PLANET_GLB,
  PLANET_LIGHTS_GLB,
  PLANET_CLOUDS_PNG,
  DRACO_DECODER_PATH,
} from "@/lib/planet/assets";
import { getMessages } from "@/lib/translations";
import { getPublicContent } from "@/lib/public-content";
import { Locale, isValidLocale, DEFAULT_LOCALE, getAlternatePaths } from "@/lib/i18n";
import { unstable_cache } from "next/cache";
import { Metadata } from "next";

interface HomePageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const { messages } = await getPublicContent(isValidLocale(locale) ? locale : DEFAULT_LOCALE);
  const alternates = getAlternatePaths('/');

  return {
    title: messages.seo.defaultTitle,
    description: messages.seo.defaultDescription,
    keywords: messages.seo.keywords,
    alternates: {
      languages: alternates,
    },
    openGraph: {
      locale: locale === 'id' ? 'id_ID' : 'en_US',
      alternateLocale: locale === 'id' ? 'en_US' : 'id_ID',
    },
  };
}

export const dynamic = 'force-dynamic';

export const revalidate = 60;

const getCertificates = unstable_cache(
  async () =>
    prisma.certificate.findMany({
      where: { isPublished: true, ...notDeleted },
      orderBy: { order: "asc" },
      take: 6,
    }),
  ["home-certificates"],
  { revalidate: 60, tags: ["certificates"] }
);

const getCounts = unstable_cache(
  async () => {
    const [projects, certificates, experience, skills] = await Promise.all([
      prisma.project.count({ where: { isPublished: true, ...notDeleted } }),
      prisma.certificate.count({ where: { isPublished: true, ...notDeleted } }),
      prisma.experience.count({ where: { isPublished: true, ...notDeleted } }),
      prisma.skill.count({ where: notDeleted }),
    ]);
    return { projects, certificates, experience, skills };
  },
  ["home-counts"],
  { revalidate: 60, tags: ["projects", "certificates"] }
);

const getProjects = unstable_cache(
  async () =>
    prisma.project.findMany({
      where: { isPublished: true, ...notDeleted },
      orderBy: { order: "asc" },
      take: 6,
    }),
  ["home-projects"],
  { revalidate: 60, tags: ["projects"] }
);

// Above the fold, so skills are fetched server-side like every other home-page
// datum. Do NOT move this to `usePublicSkills`: the home page renders inside
// `PublicProviders` (no QueryClientProvider) to keep react-query off the
// critical path. See public-providers.tsx.
const getSkills = unstable_cache(
  async () =>
    prisma.skill.findMany({
      where: notDeleted,
      orderBy: [{ category: "asc" }, { order: "asc" }],
      select: { id: true, name: true, iconName: true },
    }),
  ["home-skills"],
  { revalidate: 3600, tags: ["skills"] }
);

export default async function Home({ params }: HomePageProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const validLocale = isValidLocale(locale) ? locale : DEFAULT_LOCALE;
  const messages = await getMessages(validLocale);
  const [certificates, projects, counts, skills] = await Promise.all([
    getCertificates(),
    getProjects(),
    getCounts(),
    getSkills(),
  ]);

// Preload: home-content.tsx defers the canvas until after `load`, so the 1.84MB would
  // otherwise not start downloading until the hero has painted. Scene build still waits for
  // idle, so LCP/TBT are untouched. The DRACO decoder belongs here because GLTFLoader only
  // discovers it on the first loadAsync, which measured 6.6s in. Must stay literal <link> —
  // react-dom's `preload()` emits nothing from a server component, and without `crossOrigin`
  // the preload never matches the loaders' CORS fetches.
  const planetAssets = [
    PLANET_GLB,
    PLANET_LIGHTS_GLB,
    PLANET_CLOUDS_PNG,
    `${DRACO_DECODER_PATH}draco_wasm_wrapper.js`,
    `${DRACO_DECODER_PATH}draco_decoder.wasm`,
  ];

  return (
    <>
      {planetAssets.map((href) => (
        <link key={href} rel="preload" as="fetch" href={href} crossOrigin="anonymous" />
      ))}
      <HomePageContent
        counts={counts}
        projects={projects.map((p) => mapDbProjectToProject(p, validLocale))}
        certificates={certificates.map((c) =>
          mapCertificateToData(c, validLocale, {
            issued: messages.certificates.issuedOn,
            expires: messages.certificates.expiresOn,
          }),
        )}
      >
        <HeroSection locale={validLocale} skills={skills} />
      </HomePageContent>
    </>
  );
}
