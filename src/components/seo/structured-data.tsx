"use client";

import { useSiteSettings } from "@/components/providers/public-content-provider";

interface StructuredDataProps {
  type?: "Person" | "WebSite";
}

// Inline script, bukan `next/script`: `lazyOnload` menyuntik JSON-LD lewat
// efek client saat `window.load`, jadi tag-nya tidak pernah ada di HTML awal
// dan crawler yang cuma mengambil respons pertama tidak melihatnya sama sekali.
// React tetap merender `<script dangerouslySetInnerHTML>` ini di HTML server
// meski komponennya client, jadi structured data ikut masuk respons pertama.
//
// `<` di-escape ke `<` karena nilainya berasal dari settings yang bisa
// diisi admin; tanpa itu nilai `</script>` bisa menutup tag dan membocorkan
// markup.
const escapeJsonLd = (schema: object) =>
  JSON.stringify(schema).replace(/</g, "\\u003c");

export function StructuredData({ type = "Person" }: StructuredDataProps) {
  const settings = useSiteSettings();

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: settings.fullName,
    alternateName: settings.siteName,
    jobTitle: settings.jobTitle,
    description: settings.bio,
    url: settings.siteUrl,
    image: `${settings.siteUrl}/avatar.png`,
    sameAs: [
      settings.githubUrl,
      settings.linkedinUrl,
      settings.twitterUrl,
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
    name: settings.siteName,
    alternateName: settings.tagline,
    url: settings.siteUrl,
    description: settings.siteDescription,
    author: {
      "@type": "Person",
      name: settings.fullName,
    },
    publisher: {
      "@type": "Person",
      name: settings.fullName,
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${settings.siteUrl}/search?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };

  const schema = type === "Person" ? personSchema : websiteSchema;

  return (
    <script
      id={`structured-data-${type.toLowerCase()}`}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapeJsonLd(schema) }}
    />
  );
}
