"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { CheckCircle2, ExternalLink, GraduationCap, ShieldCheck } from "lucide-react";
import * as m from "motion/react-m";
import type { CertificateListData } from "./constants";
import { CERTIFICATE_DETAIL } from "./constants";

interface CertificateDetailContentProps {
  cert: CertificateListData;
}

export function CertificateDetailContent({
  cert,
}: CertificateDetailContentProps) {
  return (
    <div className="space-y-10">
      {/* Summary */}
      <m.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
      >
        <Card className="border-none bg-transparent shadow-none">
          <CardContent className="p-0">
            <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6">
              <GraduationCap className="w-6 h-6 md:w-8 md:h-8 text-accent" />
              {CERTIFICATE_DETAIL.summaryTitle}
            </h2>
            <ul className="space-y-6">
              {cert.summary.map((point, idx) => (
                <m.li
                  key={idx}
                  initial={{ opacity: 0, x: -20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.1 }}
                  className="flex items-start gap-4 text-text-secondary leading-relaxed text-base md:text-lg"
                >
                  <span className="mt-2.5 w-2 h-2 rounded-full bg-accent shrink-0 shadow-[0_0_10px_rgba(167,139,250,0.5)]" />
                  <span>{point}</span>
                </m.li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </m.div>

      {/* Skills */}
      <m.div
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6, delay: 0.1 }}
      >
        <h2 className="text-2xl md:text-3xl font-bold text-text-primary flex items-center gap-3 mb-6">
          <CheckCircle2 className="w-6 h-6 md:w-8 md:h-8 text-accent" />
          {CERTIFICATE_DETAIL.skillsTitle}
        </h2>
        <div className="flex flex-wrap gap-3">
          {cert.skills.map((skill, idx) => (
            <m.div
              key={skill}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: idx * 0.08 }}
            >
              <Badge
                variant="outline"
                className="px-4 py-2 rounded-full bg-accent-muted/50 text-accent border-accent/20 font-medium text-sm"
              >
                {skill}
              </Badge>
            </m.div>
          ))}
        </div>
      </m.div>

      {/* Verify Credential */}
      {cert.credentialUrl && cert.credentialId && (
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="rounded-2xl border border-glass-border bg-glass-bg overflow-hidden">
            <CardContent className="p-8">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/30">
                  <ShieldCheck className="w-6 h-6 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-text-primary mb-1">
                    {CERTIFICATE_DETAIL.verificationTitle}
                  </h2>
                  <p className="text-sm text-text-secondary">
                    {CERTIFICATE_DETAIL.verificationDescription}
                  </p>
                </div>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-glass-border bg-bg-primary/50 px-4 py-3">
                <div>
                  <p className="text-xs text-text-muted uppercase tracking-wider">
                    Credential ID
                  </p>
                  <p className="text-sm font-semibold text-text-primary font-mono">
                    {cert.credentialId}
                  </p>
                </div>
                <Button
                  nativeButton={false}
                  render={
                    <a
                      href={cert.credentialUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                    />
                  }
                  className="rounded-full bg-accent text-bg-primary font-semibold hover:bg-accent-hover transition-all duration-300 group/btn"
                >
                  {CERTIFICATE_DETAIL.verifyLabel}
                  <ExternalLink className="w-4 h-4 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5 transition-transform" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </m.div>
      )}
    </div>
  );
}
