"use client";

import { Badge } from "@/components/ui/badge";
import { useRef } from "react";
import { REPLAY_VIEWPORT } from "./constants";
import { ContactForm } from "./contact-form";
import { ContactInfo } from "./contact-info";

export function ContactSection() {
  const sectionRef = useRef<HTMLElement>(null);

  return (
    <section ref={sectionRef} className="relative overflow-hidden pb-24">
      {/* Parallax Background Elements - CSS animations */}
      <div className="absolute top-0 left-1/4 w-125 h-125 bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-float" />
      <div className="absolute bottom-0 right-1/4 w-100 h-100 bg-accent/5 rounded-full blur-[120px] pointer-events-none animate-float-delayed" />

      <div className="container relative z-10 mx-auto px-4">
        {/* Section Header */}
        <div className="text-center mb-16 md:mb-24 animate-fade-in-up">
          <Badge
            variant="outline"
            className="px-3 py-1 rounded-full border-accent/30 text-accent text-xs font-semibold tracking-wider uppercase mb-4 bg-accent-muted/50"
          >
            Get In Touch
          </Badge>
          <h2 className="text-3xl md:text-5xl font-bold mb-4">
            Let&apos;s Work{" "}
            <span className="text-gradient-elegant">Together</span>
          </h2>
          <p className="text-text-secondary max-w-2xl mx-auto text-lg">
            Have a project in mind or just want to say hi? I&apos;m always open
            to discussing new opportunities, collaborations, and anything
            tech-related.
          </p>
        </div>

        {/* Contact Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
          <ContactInfo />
          <ContactForm />
        </div>
      </div>
    </section>
  );
}