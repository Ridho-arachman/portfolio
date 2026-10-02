import { NuqsAdapterLoader } from "@/components/providers/nuqs-adapter-loader";
import { MotionProvider } from "@/components/providers/motion-provider";
import { FloatingSwitcher } from "@/components/ui/floating-switcher";
import { ThemeProvider } from "@/providers/theme-provider";
import { getSiteSettings } from "@/lib/settings";
import { DEFAULT_LOCALE, isValidLocale, OG_LOCALE } from "@/lib/i18n";
import type { Metadata, Viewport } from "next";
import { headers } from "next/headers";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "optional",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "optional",
  preload: true,
  fallback: ["JetBrains Mono", "Fira Code", "monospace"],
});

// `export const metadata` bersifat statis: ia dievaluasi saat build dan tidak
// bisa `await`, jadi domain/title dari admin tidak akan pernah masuk ke tag
// SEO. `generateMetadata` bisa-await, dan `getSiteSettings()` tidak pernah
// melempar error (jatuh ke default env), jadi `next build` tetap aman saat DB mati.
export async function generateMetadata(): Promise<Metadata> {
  const headerList = await headers();
  const headerLocale = headerList.get("x-current-locale");
  const locale = headerLocale && isValidLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;
  const { siteUrl, siteName, siteDescription, fullName, jobTitle, bio, twitterUrl } =
    await getSiteSettings(locale);

  const title = `${fullName} | ${jobTitle}`;
  const description = siteDescription || bio;
  const twitterCreator = twitterUrl.split("/").filter(Boolean).pop();

  return {
    metadataBase: new URL(siteUrl),
    title: {
      default: title,
      template: `%s | ${fullName}`,
    },
    description,
    keywords: [
      "Full Stack Developer",
      "React",
      "Next.js",
      "TypeScript",
      "Information Systems",
      "E-Business",
      "Web Developer",
      "Portfolio",
    ],
    authors: [{ name: fullName, url: siteUrl }],
    creator: fullName,
    publisher: fullName,
    robots: "index, follow",
    openGraph: {
      type: "website",
      locale: OG_LOCALE[locale],
      url: siteUrl,
      siteName,
      title,
      description,
      images: [
        {
          url: "/og-image.png",
          width: 1200,
          height: 630,
          alt: `${fullName} - Portfolio`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: ["/og-image.png"],
      creator: twitterCreator ? `@${twitterCreator}` : undefined,
    },
    verification: {
      google: "google-site-verification-code",
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0f" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Root layout berada di luar segmen [lang], jadi route params tidak pernah
  // berisi locale dan `params` di sini selalu undefined. Proxy memforward locale
  // sebagai request header; itu satu-satunya cara layout terluar tahu bahasa
  // aktif tanpa memindahkan <html>/<body> ke dalam [lang].
  const headerList = await headers();
  const headerLocale = headerList.get("x-current-locale");
  const locale = headerLocale && isValidLocale(headerLocale) ? headerLocale : DEFAULT_LOCALE;

  return (
    <html
      lang={locale}
      className={`scroll-smooth ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preconnect"
          href="https://challenges.cloudflare.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased">
        <ThemeProvider disableTransitionOnChange>
          <MotionProvider>
            <NuqsAdapterLoader>{children}</NuqsAdapterLoader>
          </MotionProvider>
          <FloatingSwitcher />
        </ThemeProvider>
      </body>
    </html>
  );
}
