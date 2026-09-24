import { ShieldCheck } from "lucide-react";
import { AdminLoginForm } from "./admin-login-form";
import { ADMIN_LOGIN } from "./constants";

export function AdminLoginCard({ error }: { error?: string }) {
  return (
    <div className="animate-fade-in-up relative z-10 w-full max-w-md">
      <div className="rounded-3xl border border-white/10 bg-glass-bg/90 backdrop-blur-xl shadow-[0_20px_60px_-15px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.1)]">
        <div className="px-8 py-10 sm:px-10">
          <div
            className="animate-fade-in-up flex flex-col items-center text-center space-y-4 mb-8"
            style={{ animationDelay: "120ms" }}
          >
            <div className="relative w-20 h-20 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shadow-[0_0_30px_rgba(167,139,250,0.25)]">
              <ShieldCheck className="w-9 h-9" />
            </div>

            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-glass-bg border-glass-border backdrop-blur-md text-accent text-xs font-semibold tracking-widest uppercase">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
              </span>
              {ADMIN_LOGIN.badgeLabel}
            </div>

            <h1 className="text-3xl font-bold">
              <span className="text-gradient-elegant relative inline-block">
                {ADMIN_LOGIN.title}
                <span className="absolute inset-0 blur-3xl bg-accent/20 -z-10 scale-150 rounded-full" />
              </span>
            </h1>

            <p className="text-sm text-text-secondary max-w-xs">
              {ADMIN_LOGIN.subtitle}
            </p>
          </div>

          <AdminLoginForm error={error} />
        </div>
      </div>
    </div>
  );
}
