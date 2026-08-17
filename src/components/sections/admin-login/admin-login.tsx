import { AdminLoginBackground } from "./admin-login-background";
import { AdminLoginCard } from "./admin-login-card";
import { ADMIN_LOGIN } from "./constants";

export function AdminLogin({ error }: { error?: string }) {
  return (
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-bg-primary px-4 py-16">
      <AdminLoginBackground />

      <AdminLoginCard error={error} />

      <p className="absolute bottom-6 text-xs text-text-muted">
        © {new Date().getFullYear()} {ADMIN_LOGIN.footerNote}
      </p>
    </main>
  );
}
