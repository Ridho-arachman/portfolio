"use client";

import { AlertCircle, CheckCircle2, Loader2, Send } from "lucide-react";
import { useForm } from "react-hook-form";
import { useCallback, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { TurnstileWidget } from "@/components/ui/turnstile";
import { zodResolver } from "@/lib/zod-resolver";
import { contactFormSchema, type ContactFormValues } from "@/schema/contact";
import { CONTACT_FORM_FIELDS } from "./constants";
import { useTranslation } from "@/hooks/use-translation";
import type { Messages } from "@/lib/translation-types";

function translateSubmitError(t: Messages, code?: string, status?: number): string {
  if (status === 429 || code === "RATE_LIMITED") {
    return t.contact.rateLimited;
  }
  if (code === "CAPTCHA_VERIFICATION_FAILED") {
    return t.contact.captchaFailed;
  }
  return t.contact.sendError;
}

export function ContactForm() {
  const { t } = useTranslation();
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
      setSubmitError(t.contact.captchaRequired);
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
        setSubmitError(translateSubmitError(t, data.error, response.status));
        return;
      }

      setIsSuccess(true);
      reset();
      setCaptchaToken("");
      setWidgetKey((k) => k + 1);
    } catch {
      setSubmitError(translateSubmitError(t));
    }
  });

  return (
    <div className="relative rounded-2xl border border-glass-border bg-glass-bg/60 backdrop-blur-xl p-6 md:p-8 overflow-hidden animate-fade-in-up delay-200">
      <div className="absolute -top-24 -right-24 w-48 h-48 bg-accent/10 rounded-full blur-[100px] pointer-events-none" />

      {isSuccess ? (
        <div className="relative z-10 flex flex-col items-center justify-center text-center py-16 animate-scale-in">
          <h2 className="sr-only">{t.contact.title}</h2>
          <div className="mb-6 text-accent animate-bounce-in">
            <CheckCircle2 className="w-16 h-16" />
          </div>
          <h3 className="text-2xl font-bold mb-3">{t.contact.form.success}</h3>
          <p className="text-text-secondary max-w-sm mb-8">
            {t.contact.successDesc}
          </p>
          <Button
            type="button"
            variant="outline"
            onClick={() => setIsSuccess(false)}
            className="rounded-full border-accent/40 text-accent hover:bg-accent/10 hover:border-accent"
          >
            {t.contact.sendAnother}
          </Button>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="relative z-10 space-y-6 animate-fade-in-up" noValidate>
          {submitError && (
            <div className="flex items-start gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-xs text-destructive animate-slide-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {submitError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {CONTACT_FORM_FIELDS.map((field) => (
              <div key={field.name} className="space-y-2">
                <Label htmlFor={field.name}>{t.contact.form[field.labelKey]}</Label>
                <Input
                  id={field.name}
                  type={field.name === "email" ? "email" : "text"}
                  placeholder={t.contact.form[field.placeholderKey]}
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
            <Label htmlFor="content">{t.contact.form.message}</Label>
            <Textarea
              id="content"
              rows={6}
              placeholder={t.contact.form.messagePlaceholder}
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
              className="rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover hover:shadow-[0_0_30px_rgba(167,139,250,0.4)] transition-all duration-300 group min-h-[48px] min-w-[48px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  {t.contact.form.submitting}
                </>
              ) : (
                <>
                  {t.contact.form.submit}
                  <Send className="w-5 h-5 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
}