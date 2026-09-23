import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Locale, LOCALES, DEFAULT_LOCALE, isValidLocale, getAlternatePaths } from '@/lib/i18n';
import { getMessages } from '@/lib/translations';

interface LangLayoutProps {
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}

export async function generateStaticParams() {
  return LOCALES.map((locale) => ({ lang: locale }));
}

export async function generateMetadata({ params }: LangLayoutProps): Promise<Metadata> {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;
  const messages = await getMessages(isValidLocale(locale) ? locale : DEFAULT_LOCALE);
  
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

export default async function LangLayout({ children, params }: LangLayoutProps) {
  const resolvedParams = await params;
  const locale = resolvedParams.lang as Locale;

  if (!isValidLocale(locale)) {
    notFound();
  }

  return (
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
      <body className="bg-bg-primary text-text-primary antialiased">
        {children}
      </body>
    </html>
  );
}