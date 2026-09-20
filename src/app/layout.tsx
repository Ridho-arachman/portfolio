import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Navbar } from "@/components/layout/navbar/navbar";
import { Footer } from "@/components/layout/footer/footer";

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
      "Information Systems graduate specializing in E-Business. Building immersive, high-performance web experiences.",
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
      "Information Systems graduate specializing in E-Business. Building immersive, high-performance web experiences.",
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

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://picsum.photos" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://challenges.cloudflare.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://*.supabase.co" />
      </head>
      <body className="bg-bg-primary text-text-primary antialiased">
        <Navbar />
        <main id="main-content" className="min-h-screen">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
