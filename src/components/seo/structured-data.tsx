"use client";

import { getClientEnv } from "@/lib/env";
import Script from "next/script";

interface StructuredDataProps {
  type?: "Person" | "WebSite";
}

export function StructuredData({ type = "Person" }: StructuredDataProps) {
  const env = getClientEnv();

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: env.NEXT_PUBLIC_AUTHOR_NAME,
    alternateName: "Ridho Arachman",
    jobTitle: env.NEXT_PUBLIC_AUTHOR_TITLE,
    description: env.NEXT_PUBLIC_AUTHOR_BIO,
    url: env.NEXT_PUBLIC_SITE_URL,
    image: `${env.NEXT_PUBLIC_SITE_URL}/avatar.png`,
    sameAs: [
      env.NEXT_PUBLIC_GITHUB_URL,
      env.NEXT_PUBLIC_LINKEDIN_URL,
      env.NEXT_PUBLIC_TWITTER_URL,
    ].filter(Boolean),
    knowsAbout: [
      "React",
      "Next.js",
      "TypeScript",
      "Tailwind CSS",
      "PostgreSQL",
      "Prisma",
      "Supabase",
      "Docker",
      "GitHub Actions",
      "Web Development",
      "Full Stack Development",
    ],
    alumniOf: {
      "@type": "EducationalOrganization",
      name: "Information Systems",
    },
    worksFor: {
      "@type": "Organization",
      name: "Freelance",
    },
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: env.NEXT_PUBLIC_SITE_NAME,
    alternateName: env.NEXT_PUBLIC_SITE_TAGLINE,
    url: env.NEXT_PUBLIC_SITE_URL,
    description: env.NEXT_PUBLIC_SITE_DESCRIPTION,
    author: {
      "@type": "Person",
      name: env.NEXT_PUBLIC_AUTHOR_NAME,
    },
    publisher: {
      "@type": "Person",
      name: env.NEXT_PUBLIC_AUTHOR_NAME,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${env.NEXT_PUBLIC_SITE_URL}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const schema = type === "Person" ? personSchema : websiteSchema;

  return (
    <Script
      id="structured-data"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      strategy="lazyOnload"
    />
  );
}