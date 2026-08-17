"use client";

import { motion } from "motion/react";
import { AlertCircle, Eye, EyeOff, Info, Loader2, LogIn } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { SiGithub, SiGoogle } from "react-icons/si";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { MagneticButton } from "@/components/ui/magnetic-button";
import { TurnstileWidget } from "@/components/ui/turnstile";
import { authClient } from "@/lib/auth-client";
import { zodResolver } from "@/lib/zod-resolver";
import { ADMIN_LOGIN, loginFormSchema, type LoginFormValues } from "./constants";
import type { Variants } from "framer-motion";

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

function translateAuthError(message?: string): string {
  if (!message) return ADMIN_LOGIN.errorGeneric;
  if (message.includes("CAPTCHA")) return ADMIN_LOGIN.errorCaptcha;
  if (message.includes("Too many requests")) return ADMIN_LOGIN.errorRateLimit;
  if (message.includes("Invalid email or password")) {
    return ADMIN_LOGIN.errorInvalidCredentials;
  }
  return message;
}

export function AdminLoginForm({ error }: { error?: string }) {
  const router = useRouter();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    mode: "onTouched",
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showForgotNote, setShowForgotNote] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [urlError] = useState<string | null>(
    error === "forbidden" ? ADMIN_LOGIN.errorForbidden : null,
  );
  const [socialLoading, setSocialLoading] = useState<"google" | "github" | null>(
    null,
  );

  const displayedError = authError ?? urlError;

  const hasTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const handleCaptchaToken = useCallback((token: string) => {
    setCaptchaToken(token);
    setAuthError(null);
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setAuthError(null);

    if (hasTurnstile && !captchaToken) {
      setAuthError(ADMIN_LOGIN.errorCaptchaRequired);
      return;
    }

    const { error } = await authClient.signIn.email({
      email: values.email,
      password: values.password,
      captchaToken: captchaToken || undefined,
    } as unknown as Parameters<typeof authClient.signIn.email>[0]);

    if (error) {
      setAuthError(translateAuthError(error.message));
      return;
    }

    router.push("/admin");
    router.refresh();
  });

  const handleSocial = async (provider: "google" | "github") => {
    setAuthError(null);
    setSocialLoading(provider);
    try {
      await authClient.signIn.social({ provider, callbackURL: "/admin" });
    } catch {
      setAuthError(ADMIN_LOGIN.errorSocial);
      setSocialLoading(null);
    }
  };

  return (
    <motion.form
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      onSubmit={onSubmit}
      className="space-y-6"
      noValidate
    >
      {displayedError && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive"
        >
          <AlertCircle className="w-4 h-4 shrink-0" />
          {displayedError}
        </motion.div>
      )}

      <motion.div variants={itemVariants} className="space-y-3">
        <div className="grid grid-cols-2 gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocial("google")}
            disabled={socialLoading !== null}
            className="w-full"
          >
            {socialLoading === "google" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SiGoogle className="w-4 h-4" />
            )}
            {ADMIN_LOGIN.googleLabel}
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => handleSocial("github")}
            disabled={socialLoading !== null}
            className="w-full"
          >
            {socialLoading === "github" ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <SiGithub className="w-4 h-4" />
            )}
            {ADMIN_LOGIN.githubLabel}
          </Button>
        </div>
        <div className="flex items-center gap-3 text-xs text-text-muted">
          <span className="h-px flex-1 bg-white/10" />
          {ADMIN_LOGIN.orLabel}
          <span className="h-px flex-1 bg-white/10" />
        </div>
      </motion.div>

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

      {hasTurnstile && (
        <motion.div variants={itemVariants} className="space-y-2">
          <TurnstileWidget onToken={handleCaptchaToken} />
        </motion.div>
      )}

      <motion.div
        variants={itemVariants}
        className="flex items-center justify-between gap-4"
      >
        <button
          type="button"
          onClick={() => setShowForgotNote((v) => !v)}
          className="text-sm font-medium text-accent hover:text-accent-hover transition-colors ml-auto"
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
          disabled={isSubmitting || socialLoading !== null}
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
  );
}
