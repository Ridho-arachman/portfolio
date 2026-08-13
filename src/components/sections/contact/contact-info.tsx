"use client";

import { SOCIAL_LINKS } from "@/components/layout/footer/constants";
import { GlassCard } from "@/components/ui/glass-card";
import { Clock, Mail, MapPin, type LucideIcon } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import {
  CONTACT_EMAIL,
  CONTACT_LOCATION,
  CONTACT_RESPONSE_TIME,
} from "./constants";

interface InfoItem {
  icon: LucideIcon;
  label: string;
  value: string;
  href?: string;
}

const INFO_ITEMS: InfoItem[] = [
  {
    icon: Mail,
    label: "Email",
    value: CONTACT_EMAIL,
    href: `mailto:${CONTACT_EMAIL}`,
  },
  { icon: MapPin, label: "Location", value: CONTACT_LOCATION },
  { icon: Clock, label: "Response Time", value: CONTACT_RESPONSE_TIME },
];

export function ContactInfo() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: false, amount: 0.2 }}
      transition={{ duration: 0.6 }}
      className="grid grid-cols-1 sm:grid-cols-2 gap-6"
    >
      {INFO_ITEMS.map((item) => (
        <GlassCard key={item.label} variant="hover" className="p-6">
          <div className="relative z-10 flex items-start gap-4">
            <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-accent-muted border border-accent/30 text-accent">
              <item.icon className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold tracking-wider uppercase text-text-muted mb-1">
                {item.label}
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
            Or find me on
          </p>
          <div className="flex flex-wrap gap-3">
            {SOCIAL_LINKS.map((social) => (
              <Link
                key={social.label}
                href={social.href}
                target={social.href.startsWith("mailto:") ? undefined : "_blank"}
                rel={social.href.startsWith("mailto:") ? undefined : "noreferrer"}
                aria-label={social.label}
                className="inline-flex items-center gap-2 rounded-full border border-glass-border bg-bg-secondary/60 px-4 py-2 text-sm text-text-secondary transition-all hover:border-accent/50 hover:text-accent hover:-translate-y-0.5"
              >
                <social.icon className="w-4 h-4" />
                {social.label}
              </Link>
            ))}
          </div>
        </div>
      </GlassCard>
    </motion.div>
  );
}
