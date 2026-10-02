import { Navbar } from '@/components/layout/navbar/navbar';
import { Footer } from '@/components/layout/footer/footer';
import { AscendChrome } from '@/components/sections/ascend/ascend-chrome';
import { PublicContentProvider } from '@/components/providers/public-content-provider';
import { FloatingSwitcher } from '@/components/ui/floating-switcher';
import { StructuredData } from '@/components/seo/structured-data';
import { Locale, DEFAULT_LOCALE, isValidLocale } from '@/lib/i18n';
import { getPublicContent } from '@/lib/public-content';

// Tanpa ini payload provider dibekukan saat build: perubahan settings di admin
// tidak akan pernah sampai ke browser sampai deploy berikutnya.
export const dynamic = 'force-dynamic';

export default async function PublicLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  // `lang` berasal dari URL, jadi harus divalidasi sebelum dipakai sebagai Locale.
  const locale: Locale = isValidLocale(lang) ? lang : DEFAULT_LOCALE;

  const { messages, settings } = await getPublicContent(locale);

  return (
    <PublicContentProvider
      messages={messages}
      settings={settings}
    >
      <Navbar />
        <AscendChrome />
        <StructuredData settings={settings} />
      <main id="main-content" role="main" className="min-h-screen pt-20">
        {children}
      </main>
      <Footer />
      <FloatingSwitcher />
    </PublicContentProvider>
  );
}
