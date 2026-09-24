import { NuqsAdapterLoader } from "@/components/providers/nuqs-adapter-loader";
import { ThemeToggleFloating } from "@/components/ui/theme-toggle-floating";
import { ThemeProvider } from "@/providers/theme-provider";
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

export const metadata: Metadata = {
  metadataBase: new URL("https://ridhoarachman.dev"),
  title: {
    default: "Ridho Arachman | Full Stack Developer",
    template: "%s | Ridho Arachman",
  },
  description:
    "Information Systems graduate specializing in E-Business. Building immersive, high-performance web experiences with React, Next.js, TypeScript, and modern tech stacks.",
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
  authors: [{ name: "Ridho Arachman", url: "https://ridhoarachman.dev" }],
  creator: "Ridho Arachman",
  publisher: "Ridho Arachman",
  robots: "index, follow",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://ridhoarachman.dev",
    siteName: "Ridho Arachman | Portfolio",
    title: "Ridho Arachman | Full Stack Developer",
    description:
      "Information Systems graduate specializing in E-Business. Building immersive, high-performance web experiences with React, Next.js, TypeScript, and modern tech stacks.",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Ridho Arachman - Portfolio",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Ridho Arachman | Full Stack Developer",
    description:
      "Information Systems graduate specializing in E-Business. Building immersive, high-performance web experiences with React, Next.js, TypeScript, and modern tech stacks.",
    images: ["/og-image.png"],
    creator: "@ridhoarachman",
  },
  verification: {
    google: "google-site-verification-code",
  },
};

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
    <html lang={locale} className="scroll-smooth" suppressHydrationWarning>
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
          <NuqsAdapterLoader>{children}</NuqsAdapterLoader>
          <ThemeToggleFloating />
        </ThemeProvider>
      </body>
    </html>
  );
}
