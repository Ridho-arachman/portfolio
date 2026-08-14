"use client";

import { AnimatePresence, motion } from "motion/react";
import { CheckCircle2, Eye, EyeOff, Info, Loader2, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { zodResolver } from "@/lib/zod-resolver";
import { ADMIN_LOGIN, loginFormSchema, type LoginFormValues } from "./constants";
import type { Variants } from "framer-motion";
import Link from "next/link";

const containerVariants: Variants = {
  hidden: {},
  visible: {
    transition: { staggerChildren: 0.08, delayChildren: 0.1 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 12 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4, ease: "easeOut" },
  },
};

export function AdminLoginForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotNote, setShowForgotNote] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  const onSubmit = async () => {
    await new Promise((resolve) => setTimeout(resolve, 900));
    setIsSuccess(true);
    reset();
  };

  return (
    <AnimatePresence mode="wait">
      {isSuccess ? (
        <motion.div
          key="success"
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          transition={{ duration: 0.4 }}
          className="flex flex-col items-center justify-center text-center py-16"
        >
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
            className="mb-6 text-accent"
          >
            <CheckCircle2 className="w-16 h-16" />
          </motion.div>
          <h3 className="text-2xl font-bold mb-3">{ADMIN_LOGIN.successTitle}</h3>
          <p className="text-text-secondary max-w-sm mb-8">
            {ADMIN_LOGIN.successNote}
          </p>
          <Button
            render={<Link href="/" />}
            nativeButton={false}
            className="rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300"
          >
            {ADMIN_LOGIN.successBackLabel}
          </Button>
        </motion.div>
      ) : (
        <motion.form
          key="form"
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          exit={{ opacity: 0, y: -8, transition: { duration: 0.25 } }}
          onSubmit={handleSubmit(onSubmit)}
          className="space-y-6"
          noValidate
        >
          <motion.div variants={itemVariants} className="space-y-2 rounded-lg transition-shadow focus-within:shadow-[0_0_24px_rgba(167,139,250,0.12)]">
            <Label htmlFor="email">{ADMIN_LOGIN.emailLabel}</Label>
            <Input
              id="email"
              type="email"
              placeholder={ADMIN_LOGIN.emailPlaceholder}
              autoComplete="email"
              aria-invalid={errors.email ? true : undefined}
              {...register("email")}
            />
            {errors.email && (
              <p className="text-xs text-destructive">{errors.email.message}</p>
            )}
          </motion.div>

          <motion.div variants={itemVariants} className="space-y-2 rounded-lg transition-shadow focus-within:shadow-[0_0_24px_rgba(167,139,250,0.12)]">
            <Label htmlFor="password">{ADMIN_LOGIN.passwordLabel}</Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                placeholder={ADMIN_LOGIN.passwordPlaceholder}
                autoComplete="current-password"
                aria-invalid={errors.password ? true : undefined}
                className="pr-10"
                {...register("password")}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-accent transition-colors"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-destructive">
                {errors.password.message}
              </p>
            )}
          </motion.div>

          <motion.div
            variants={itemVariants}
            className="flex items-center justify-between gap-4"
          >
            <label className="flex items-center gap-2 text-sm text-text-secondary cursor-pointer select-none">
              <input
                type="checkbox"
                className="w-4 h-4 rounded accent-[var(--color-accent)]"
              />
              {ADMIN_LOGIN.rememberLabel}
            </label>
            <button
              type="button"
              onClick={() => setShowForgotNote((v) => !v)}
              className="text-sm font-medium text-accent hover:text-accent-hover transition-colors"
            >
              {ADMIN_LOGIN.forgotLabel}
            </button>
          </motion.div>

          {showForgotNote && (
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="flex items-start gap-2 rounded-xl border border-accent/20 bg-accent-muted/50 px-4 py-3 text-xs text-text-secondary"
            >
              <Info className="w-4 h-4 shrink-0 text-accent" />
              {ADMIN_LOGIN.forgotNote}
            </motion.div>
          )}

          <motion.div variants={itemVariants} className="group">
            <MagneticButton
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-full bg-accent border-transparent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {ADMIN_LOGIN.signingInLabel}
                </>
              ) : (
                <>
                  {ADMIN_LOGIN.signInLabel}
                  <LogIn className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                </>
              )}
            </MagneticButton>
          </motion.div>
        </motion.form>
      )}
    </AnimatePresence>
  );
}
