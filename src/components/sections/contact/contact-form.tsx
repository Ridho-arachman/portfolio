"use client";

import { AnimatePresence, motion } from "motion/react";
import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileWidget } from "@/components/ui/turnstile";
import { zodResolver } from "@/lib/zod-resolver";
import {
  CONTACT_FORM_FIELDS,
  contactFormSchema,
  type ContactFormValues,
} from "./constants";

function translateSubmitError(code?: string, status?: number): string {
  if (status === 429 || code === "RATE_LIMITED") {
    return "Terlalu banyak pesan dalam waktu singkat. Coba lagi beberapa saat.";
  }
  if (code === "CAPTCHA_VERIFICATION_FAILED") {
    return "Verifikasi CAPTCHA gagal. Coba lagi.";
  }
  return "Gagal mengirim pesan. Coba lagi.";
}

export function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    mode: "onTouched",
  });

  const [isSuccess, setIsSuccess] = useState(false);
  const [captchaToken, setCaptchaToken] = useState("");
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [widgetKey, setWidgetKey] = useState(0);

  const hasTurnstile = Boolean(process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY);

  const handleCaptchaToken = useCallback((token: string) => {
    setCaptchaToken(token);
    setSubmitError(null);
  }, []);

  const onSubmit = handleSubmit(async (values) => {
    setSubmitError(null);

    if (hasTurnstile && !captchaToken) {
      setSubmitError("Selesaikan verifikasi CAPTCHA terlebih dahulu.");
      return;
    }

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...values, captchaToken: captchaToken || undefined }),
      });

      if (!response.ok) {
        const data = (await response.json().catch(() => ({}))) as {
          error?: string;
        };
        setSubmitError(translateSubmitError(data.error, response.status));
        return;
      }

      setIsSuccess(true);
      reset();
      setCaptchaToken("");
      setWidgetKey((k) => k + 1);
    } catch {
      setSubmitError(translateSubmitError());
    }
  });

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative rounded-2xl border border-glass-border bg-glass-bg/60 backdrop-blur-xl p-6 md:p-8 overflow-hidden"
    >
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      <AnimatePresence mode="wait">
        {isSuccess ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.4 }}
            className="relative z-10 flex flex-col items-center justify-center text-center py-16"
          >
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 200, damping: 15, delay: 0.1 }}
              className="mb-6 text-accent"
            >
              <CheckCircle2 className="w-16 h-16" />
            </motion.div>
            <h3 className="text-2xl font-bold mb-3">Message sent!</h3>
            <p className="text-text-secondary max-w-sm mb-8">
              Thank you for reaching out. I&apos;ll get back to you as soon as
              possible.
            </p>
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsSuccess(false)}
              className="rounded-full border-accent/40 text-accent hover:bg-accent/10 hover:border-accent"
            >
              Send Another Message
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.3 }}
            onSubmit={onSubmit}
            className="relative z-10 space-y-6"
            noValidate
          >
            {submitError && (
              <motion.div
                initial={{ opacity: 0, y: -6 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive"
              >
                <AlertCircle className="w-4 h-4 shrink-0" />
                {submitError}
              </motion.div>
            )}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {CONTACT_FORM_FIELDS.map((field) => (
                <div key={field.name} className="space-y-2">
                  <Label htmlFor={field.name}>{field.label}</Label>
                  <Input
                    id={field.name}
                    type={field.name === "email" ? "email" : "text"}
                    placeholder={field.placeholder}
                    aria-invalid={errors[field.name] ? true : undefined}
                    {...register(field.name)}
                  />
                  {errors[field.name] && (
                    <p className="text-xs text-destructive">
                      {errors[field.name]?.message}
                    </p>
                  )}
                </div>
              ))}
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Message</Label>
              <Textarea
                id="content"
                rows={6}
                placeholder="Tell me about your project or just say hi..."
                aria-invalid={errors.content ? true : undefined}
                {...register("content")}
              />
              {errors.content && (
                <p className="text-xs text-destructive">
                  {errors.content.message}
                </p>
              )}
            </div>

            {hasTurnstile && (
              <div className="flex justify-center">
                <TurnstileWidget key={widgetKey} onToken={handleCaptchaToken} />
              </div>
            )}

            <div className="flex justify-end pt-2">
              <Button
                type="submit"
                disabled={isSubmitting}
                size="lg"
                className="rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300 group"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    Send Message
                    <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                  </>
                )}
              </Button>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
