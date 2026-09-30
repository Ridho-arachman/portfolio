import type { Metadata } from "next";

import { PortoBot } from "@/components/faq/porto-bot";
import { PageHero } from "@/components/sections/page-hero";
import { DEFAULT_LOCALE, getAlternatePaths, isValidLocale, type Locale } from "@/lib/i18n";
import { getMessages } from "@/lib/translations";

export const dynamic = "force-dynamic";

interface FaqPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: FaqPageProps): Promise<Metadata> {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);

  return {
    // `absolute`: metaTitle sudah memuat nama, jadi template root tidak
    // perlu menempelkannya lagi.
    title: { absolute: messages.faq.metaTitle },
    description: messages.faq.metaDescription,
    alternates: {
      languages: getAlternatePaths("/faq"),
    },
    openGraph: {
      title: messages.faq.metaTitle,
      description: messages.faq.metaDescription,
      locale: locale === "id" ? "id_ID" : "en_US",
      alternateLocale: locale === "id" ? "en_US" : "id_ID",
    },
  };
}

export default async function FaqPage({ params }: FaqPageProps) {
  const { lang } = await params;
  const locale: Locale = isValidLocale(lang) ? lang : DEFAULT_LOCALE;
  const messages = await getMessages(locale);

  return (
    <div className="flex min-h-screen flex-col overflow-x-hidden">
      <PageHero
        badge="PortoBot"
        title={messages.faq.metaTitle}
        description={messages.faq.metaDescription}
      />

      <section className="container mx-auto w-full max-w-3xl px-4 py-16 md:py-24">
        <PortoBot variant="page" />
      </section>
    </div>
  );
}
