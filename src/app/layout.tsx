// app/layout.tsx
import { ThemeToggleFloating } from "@/components/ui/theme-toggle-floating";
import { VisitTracker } from "@/components/visit-tracker";
import { Providers } from "@/lib/providers";
import { ThemeProvider } from "@/providers/theme-provider";
import { Geist } from "next/font/google";
import type { Metadata } from "next";
import { getEnv } from "@/lib/env";
import { StructuredData } from "@/components/seo/structured-data";
import "./globals.css";

const geist = Geist({ 
  subsets: ["latin"], 
  variable: "--font-geist",
  display: "swap",
  preload: true,
  adjustFontFallback: true,
  weight: "variable",
});

const env = getEnv();

export const metadata: Metadata = {
  title: {
    default: `${env.NEXT_PUBLIC_SITE_NAME} | ${env.NEXT_PUBLIC_SITE_TAGLINE}`,
    template: `%s | ${env.NEXT_PUBLIC_SITE_NAME}`,
  },
  description: env.NEXT_PUBLIC_SITE_DESCRIPTION,
  keywords: [
    "portfolio",
    "web developer",
    "information systems",
    "next.js",
    "web3",
    "full stack developer",
    "react developer",
    "typescript developer",
  ],
  authors: [{ name: env.NEXT_PUBLIC_AUTHOR_NAME }],
  creator: env.NEXT_PUBLIC_AUTHOR_NAME,
  publisher: env.NEXT_PUBLIC_SITE_NAME,
  metadataBase: new URL(env.NEXT_PUBLIC_SITE_URL),
  icons: {
    icon: [
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
      { url: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
    shortcut: "/favicon-32x32.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/manifest.json",
  robots: {
    index: true,
    follow: true,
  },
  openGraph: {
    type: "website",
    locale: "id_ID",
    url: env.NEXT_PUBLIC_SITE_URL,
    siteName: env.NEXT_PUBLIC_SITE_NAME,
    title: `${env.NEXT_PUBLIC_SITE_NAME} | ${env.NEXT_PUBLIC_SITE_TAGLINE}`,
    description: env.NEXT_PUBLIC_SITE_DESCRIPTION,
    images: [
      {
        url: `${env.NEXT_PUBLIC_SITE_URL}/avatar.png`,
        width: 1200,
        height: 630,
        alt: `${env.NEXT_PUBLIC_AUTHOR_NAME} - ${env.NEXT_PUBLIC_AUTHOR_TITLE}`,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: `${env.NEXT_PUBLIC_SITE_NAME} | ${env.NEXT_PUBLIC_SITE_TAGLINE}`,
    description: env.NEXT_PUBLIC_SITE_DESCRIPTION,
    images: [`${env.NEXT_PUBLIC_SITE_URL}/avatar.png`],
    creator: "@ridho_arachman",
  },
  verification: {
    google: env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || "",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning className={geist.variable}>
      <head>
        {/* Preconnect to critical origins for faster resource loading */}
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://picsum.photos" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://*.supabase.co" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://*.tile.openstreetmap.org" />
        <link rel="dns-prefetch" href="https://*.basemaps.cartocdn.com" />
        <link rel="manifest" href="/manifest.json" />
      </head>
      <body className="relative min-h-screen bg-bg-primary text-text-primary antialiased overflow-x-hidden">
        <StructuredData type="Person" />
        <StructuredData type="WebSite" />
        <Providers>
          <ThemeProvider
            attribute="class"
            defaultTheme="dark"
            enableSystem
            disableTransitionOnChange
          >
              {/* Background grid pattern */}
              <div className="fixed inset-0 bg-grid-elegant opacity-30 pointer-events-none" />

              {/* Radial gradient glow at top */}
              <div className="fixed top-0 left-1/2 -translate-x-1/2 w-200 h-150 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
              <div className="fixed top-20 right-0 w-150 h-100 bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none" />

              {/* Main content wrapper */}
              <div className="relative z-10 flex flex-col min-h-screen">{children}</div>

              <ThemeToggleFloating />
              <VisitTracker />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  );
}