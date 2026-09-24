import { ContactPageContent } from "./contact-content";
import { getMessages } from "@/lib/translations";
import { Locale, isValidLocale, DEFAULT_LOCALE, getAlternatePaths } from "@/lib/i18n";
import { Metadata } from "next";

interface ContactPageProps {
  params: Promise<{ lang: string }>;
}

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const messages = await getMessages(isValidLocale(locale) ? locale : DEFAULT_LOCALE);
  const alternates = getAlternatePaths('/contact');

  return {
    title: messages.contact.title,
    description: messages.contact.subtitle,
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

export default function ContactPage() {
  return <ContactPageContent />;
}
