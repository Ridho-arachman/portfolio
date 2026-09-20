import Link from "next/link";
import { Home, ArrowLeft } from "lucide-react";
import type { Metadata } from "next";
import { NotFoundButton } from "@/components/ui/not-found-button";

export const metadata: Metadata = {
  title: "Page Not Found",
  description: "The page you're looking for doesn't exist or has been moved.",
  robots: { index: false, follow: false },
};

export default function NotFound() {
  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-bg-primary">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-accent/5 to-transparent pointer-events-none" />

      {/* Main Content */}
      <div className="relative z-10 text-center px-4 max-w-2xl mx-auto space-y-8">
        {/* 404 Text */}
        <div className="relative mb-8">
          <h1 className="text-[12rem] md:text-[16rem] font-bold leading-none text-gradient-elegant select-none">
            404
          </h1>
          <div className="absolute inset-0 blur-3xl bg-accent/20 -z-10 scale-110" />
        </div>

        {/* Error Message */}
        <div>
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-4">
            Page Not Found
          </h2>
          <p className="text-text-secondary text-lg mb-8 leading-relaxed">
            Oops! The page you&apos;re looking for doesn&apos;t exist or has
            been moved.
            <br />
            Let&apos;s get you back on track.
          </p>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/"
            className="group inline-flex items-center gap-2 px-8 py-4 rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.5)] transition-all duration-300"
          >
            <Home className="w-5 h-5 group-hover:scale-110 transition-transform" />
            Back to Home
          </Link>

          <NotFoundButton />
        </div>
      </div>

      {/* Floating Grid (Bottom) */}
      <div className="absolute bottom-0 left-0 right-0 h-[40vh] bg-grid-elegant opacity-20 pointer-events-none" />
    </div>
  );
}
