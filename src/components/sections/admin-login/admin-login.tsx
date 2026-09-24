import Link from "next/link";
import { ArrowLeft, BarChart3, Inbox, KeyRound } from "lucide-react";
import { AdminLoginBackground } from "./admin-login-background";
import { AdminLoginCard } from "./admin-login-card";
import { ADMIN_LOGIN } from "./constants";

const PANEL_FEATURES = [
  {
    icon: KeyRound,
    title: "Password + OAuth",
    desc: "Sign in with email or a linked Google / GitHub account.",
  },
  {
    icon: Inbox,
    title: "Message inbox",
    desc: "Read and manage every contact-form submission.",
  },
  {
    icon: BarChart3,
    title: "Visitor analytics",
    desc: "Traffic, top pages, and a live visitor map.",
  },
] as const;

export function AdminLogin({ error }: { error?: string }) {
  return (
    <main className="relative flex min-h-[100dvh] items-center justify-center overflow-hidden bg-bg-primary px-4 py-16">
      <AdminLoginBackground />

      <Link
        href="/"
        className="absolute top-6 left-4 sm:left-6 z-20 inline-flex items-center gap-1.5 rounded-full border border-glass-border bg-glass-bg/60 backdrop-blur-md px-4 py-2 text-xs font-medium text-text-muted transition-colors hover:border-accent/50 hover:text-accent min-h-[44px]"
      >
        <ArrowLeft className="w-3.5 h-3.5" />
        Back
      </Link>

      <div className="relative z-10 w-full max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-[1.05fr_1fr] gap-10 lg:gap-6 items-center">
        <section aria-label="About this console" className="hidden lg:block pr-10">
          <div className="animate-fade-in-up">
            <p className="text-xs font-semibold tracking-[0.25em] uppercase text-accent mb-5">
              Ridho.dev — Console
            </p>
            <h1 className="text-4xl xl:text-5xl font-bold tracking-tighter leading-[1.05] text-text-primary mb-5">
              Mission control
              <br />
              for your portfolio.
            </h1>
            <p className="text-base text-text-secondary leading-relaxed max-w-[45ch] mb-10">
              Review messages, publish work, and track visitors — all from one
              secure session.
            </p>
          </div>

          <ul className="space-y-2">
            {PANEL_FEATURES.map((feature, index) => (
              <li
                key={feature.title}
                className="animate-fade-in-up flex items-start gap-4 rounded-2xl border border-transparent px-4 py-4 transition-colors hover:border-glass-border hover:bg-glass-bg/60"
                style={{ animationDelay: `${150 + index * 100}ms` }}
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 border border-accent/30 text-accent">
                  <feature.icon className="w-5 h-5" />
                </span>
                <span>
                  <span className="block text-sm font-semibold text-text-primary">
                    {feature.title}
                  </span>
                  <span className="block text-sm text-text-secondary mt-0.5">
                    {feature.desc}
                  </span>
                </span>
              </li>
            ))}
          </ul>

          <div className="mt-10 flex items-center gap-3 text-xs text-text-muted">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
            </span>
            <span className="font-mono">TLS enforced · Rate-limited</span>
          </div>
        </section>

        <section aria-label="Sign in" className="w-full">
          <p className="mb-6 text-xs font-semibold tracking-[0.25em] uppercase text-accent lg:hidden">
            Ridho.dev — Console
          </p>

          <div className="flex justify-center lg:justify-end">
            <AdminLoginCard error={error} />
          </div>
        </section>
      </div>

      <p className="absolute bottom-6 text-xs text-text-muted">
        © {new Date().getFullYear()} {ADMIN_LOGIN.footerNote}
      </p>
    </main>
  );
}
