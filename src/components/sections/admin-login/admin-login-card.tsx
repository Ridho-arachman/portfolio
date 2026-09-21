"use client";

import { ShieldCheck } from "lucide-react";
import * as m from "motion/react-m";
import { useReducedMotion } from "motion/react";
import { AdminLoginForm } from "./admin-login-form";
import { ADMIN_LOGIN } from "./constants";
import { useAdminLoginAnimations } from "./use-admin-login-animations";

export function AdminLoginCard({ error }: { error?: string }) {
  const { rotateX, rotateY, handleMouseMove, handleMouseLeave, containerVariants, itemVariants } =
    useAdminLoginAnimations();
  const prefersReducedMotion = useReducedMotion();

  return (
    <m.div
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{ rotateX, rotateY, transformStyle: "preserve-3d" }}
      className="relative z-10 w-full max-w-md"
    >
      <m.div
        variants={containerVariants}
        initial={prefersReducedMotion ? undefined : "hidden"}
        animate={prefersReducedMotion ? undefined : "visible"}
        style={{ transformStyle: "preserve-3d" }}
        className="rounded-3xl p-[1px] bg-gradient-to-br from-accent/50 via-white/15 to-white/5"
      >
        <div
          className="rounded-[calc(1.5rem-1px)] bg-glass-bg/90 backdrop-blur-xl shadow-[0_0_60px_rgba(167,139,250,0.15)]"
          style={{ transformStyle: "preserve-3d" }}
        >
          <div className="px-8 py-12 sm:px-10">
            {/* Header */}
            <m.div
              variants={itemVariants}
              initial={prefersReducedMotion ? undefined : "hidden"}
              animate={prefersReducedMotion ? undefined : "visible"}
              style={{ transform: "translateZ(40px)" }}
              className="flex flex-col items-center text-center space-y-5 mb-10"
            >
              {/* Logo */}
              <div className="relative">
                <div className="relative w-20 h-20 rounded-2xl bg-accent/10 border border-accent/30 flex items-center justify-center text-accent shadow-[0_0_30px_rgba(167,139,250,0.25)]">
                  <ShieldCheck className="w-9 h-9" />
                </div>
              </div>

              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-glass-bg border-glass-border backdrop-blur-md shadow-[0_0_20px_rgba(124,58,237,0.05)] text-accent text-xs font-semibold tracking-widest uppercase">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-accent" />
                </span>
                {ADMIN_LOGIN.badgeLabel}
              </div>

              {/* Title */}
              <h1 className="text-3xl font-bold">
                <span className="text-gradient-elegant relative inline-block">
                  {ADMIN_LOGIN.title}
                  <span className="absolute inset-0 blur-3xl bg-accent/20 -z-10 scale-150 rounded-full" />
                </span>
              </h1>

              <p className="text-sm text-text-secondary max-w-xs">
                {ADMIN_LOGIN.subtitle}
              </p>
            </m.div>

            {/* Form */}
            <div style={{ transform: "translateZ(20px)" }}>
              <AdminLoginForm error={error} />
            </div>
          </div>
        </div>
      </m.div>
    </m.div>
  );
}
