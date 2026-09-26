"use client";

import { SOCIAL_LINKS } from "@/components/layout/footer/constants";
import { GlassCard } from "@/components/ui/glass-card";
import { Clock, Mail, MapPin, type LucideIcon } from "lucide-react";
import Link from "next/link";
import {
  CONTACT_EMAIL,
  getContactLocation,
  getContactResponseTime,
} from "./constants";
import { useTranslation } from "@/hooks/use-translation";

interface InfoItem {
  icon: LucideIcon;
  labelKey: string;
  value: string;
  href?: string;
}

export function ContactInfo() {
  const { t } = useTranslation();
  const INFO_ITEMS: InfoItem[] = [
    {
      icon: Mail,
      labelKey: "email",
      value: CONTACT_EMAIL,
      href: `mailto:${CONTACT_EMAIL}`,
    },
    { icon: MapPin, labelKey: "location", value: getContactLocation(t) },
    {
      icon: Clock,
      labelKey: "responseTime",
      value: getContactResponseTime(t),
    },
  ];
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 animate-fade-in-up delay-100">
      {INFO_ITEMS.map((item) => (
        <GlassCard key={item.labelKey} variant="hover" className="p-6">
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-muted border border-accent/30 text-accent">
              <item.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-1">
                {t.contact.info[item.labelKey as keyof typeof t.contact.info]}
              </p>
              {item.href ? (
                <Link
                  href={item.href}
                  className="text-text-primary font-medium break-all hover:text-accent transition-colors"
                >
                  {item.value}
                </Link>
              ) : (
                <p className="text-text-primary font-medium break-words">
                  {item.value}
                </p>
              )}
            </div>
          </div>
        </GlassCard>
      ))}

      <GlassCard variant="hover" className="p-6 sm:col-span-2">
        <div className="relative z-10">
          <p className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-4">
            {t.contact.social}
          </p>
          <div className="flex flex-wrap gap-3">
            {SOCIAL_LINKS.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={social.href.startsWith("mailto:") ? undefined : "noreferrer"}
                aria-label={social.label}
                className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-bg-secondary/60 px-4 py-2 text-sm text-text-secondary transition-all hover:border-accent/50 hover:text-accent hover:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2"
              >
                <social.icon className="w-4 h-4" aria-hidden="true" />
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </GlassCard>
    </div>
  );
}