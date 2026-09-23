import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { NuqsAdapterLoader } from "@/components/providers/nuqs-adapter-loader";
import { ThemeProvider } from "@/providers/theme-provider";

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

// Applies the stored theme before first paint. Mirrors the next-themes inline
// script, but rendered in <head> because React 19 rejects scripts in <body>.
const themeInitScript = `(function() {
  var el = document.documentElement;
  function apply(theme) {
    el.classList.remove("light", "dark");
    el.classList.add(theme);
    el.style.colorScheme = theme;
  }
  try {
    var stored = localStorage.getItem("theme");
    apply(stored === "dark" || stored === "light" ? stored : "dark");
  } catch (err) {
    apply("dark");
  }
})();`;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://picsum.photos" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
      </head>
      <ThemeProvider disableTransitionOnChange>
        <NuqsAdapterLoader>
          {children}
        </NuqsAdapterLoader>
      </ThemeProvider>
    </>
  );
}
