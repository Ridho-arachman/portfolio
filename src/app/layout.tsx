import { NuqsAdapterLoader } from "@/components/providers/nuqs-adapter-loader";
import { MotionProvider } from "@/components/providers/motion-provider";
import { ThemeToggleFloating } from "@/components/ui/theme-toggle-floating";
import { ThemeProvider } from "@/providers/theme-provider";
import { getSiteSettings } from "@/lib/settings";
import type { Metadata, Viewport } from "next";
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
  const { siteUrl, siteName, siteDescription, fullName, jobTitle, bio, twitterUrl } =
    await getSiteSettings();

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
      locale: "en_US",
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
  params,
}: {
  children: React.ReactNode;
  params?: Promise<{ lang?: string }>;
}) {
  const resolvedParams = params ? await params : undefined;
  const lang = resolvedParams?.lang;
  const locale = lang === "id" || lang === "en" ? lang : "en";

  return (
    <html
      lang={locale}
      className={`scroll-smooth ${geistSans.variable} ${geistMono.variable}`}
      suppressHydrationWarning
    >
      <head>
        <link
          rel="preconnect"
          href="https://images.unsplash.com"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://picsum.photos"
          crossOrigin="anonymous"
        />
        <link
          rel="preconnect"
          href="https://challenges.cloudflare.com"
          crossOrigin="anonymous"
        />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased">
        <ThemeProvider disableTransitionOnChange>
          <MotionProvider>
            <NuqsAdapterLoader>{children}</NuqsAdapterLoader>
          </MotionProvider>
          <ThemeToggleFloating />
        </ThemeProvider>
      </body>
    </html>
  );
}
