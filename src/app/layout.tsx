// app/layout.tsx
import { Footer } from "@/components/layout/footer";
import { Navbar } from "@/components/layout/navbar";
import { ThemeToggleFloating } from "@/components/ui/theme-toggle-floating";
import { ThemeProvider } from "@/providers/theme-provider";
import { LazyMotion, domAnimation } from "motion/react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Ridho.dev | Web3 Portfolio",
    template: "%s | Ridho.dev",
  },
  description:
    "Information Systems student crafting immersive web experiences with modern tech stack.",
  keywords: [
    "portfolio",
    "web developer",
    "information systems",
    "next.js",
    "web3",
  ],
  authors: [{ name: "Ridho Arachman" }],
  openGraph: {
    type: "website",
    locale: "id_ID",
    siteName: "Ridho.dev",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className="relative min-h-screen bg-bg-primary text-text-primary antialiased overflow-x-hidden">
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <LazyMotion features={domAnimation}>
            {/* Background grid pattern */}
            <div className="fixed inset-0 bg-grid-web3 opacity-30 pointer-events-none" />

            {/* Radial gradient glow at top */}
            <div className="fixed top-0 left-1/2 -translate-x-1/2 w-200 h-150 bg-neon-purple/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="fixed top-20 right-0 w-150 h-100 bg-neon-cyan/10 rounded-full blur-[100px] pointer-events-none" />

            {/* Main content wrapper */}
            <div className="relative z-10 flex flex-col min-h-screen">
              <Navbar />

              <main className="flex-1 pt-20">{children}</main>

              <Footer />
            </div>

            <ThemeToggleFloating />
          </LazyMotion>
        </ThemeProvider>
      </body>
    </html>
  );
}
