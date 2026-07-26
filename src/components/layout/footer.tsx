"use client";

import Link from "next/link";
import { LazyMotion, domAnimation } from "motion/react";
import * as m from "motion/react-m";
import { SiGithub, SiX, SiGmail } from "react-icons/si";
import { FaLinkedin } from "react-icons/fa";

const socialLinks = [
  {
    href: "https://github.com/Ridho-arachman",
    icon: SiGithub,
    label: "GitHub",
  },
  {
    href: "https://linkedin.com/in/ridho-arachman",
    icon: FaLinkedin,
    label: "LinkedIn",
  },
  {
    href: "https://twitter.com/ridho_arachman",
    icon: SiX,
    label: "X (Twitter)",
  },
  {
    href: "mailto:ridho@example.com",
    icon: SiGmail,
    label: "Email",
  },
];

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <LazyMotion features={domAnimation}>
      <m.footer
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="relative mt-20 border-t border-border bg-card"
      >
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
            {/* Brand */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
            >
              <h3 className="text-2xl font-bold text-logo mb-3">Ridho.dev</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Information Systems student crafting immersive web experiences
                with modern tech stack.
              </p>
            </m.div>

            {/* Quick Links */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.1 }}
            >
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Quick Links
              </h4>
              <ul className="space-y-2">
                {["Projects", "About", "Contact"].map((item) => (
                  <li key={item}>
                    <Link
                      href={`/${item.toLowerCase()}`}
                      className="text-muted-foreground hover:text-accent-primary transition-colors text-sm"
                    >
                      {item}
                    </Link>
                  </li>
                ))}
              </ul>
            </m.div>

            {/* Social */}
            <m.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: 0.2 }}
            >
              <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider mb-4">
                Connect
              </h4>
              <div className="flex gap-3">
                {socialLinks.map(({ href, icon: Icon, label }, index) => (
                  <m.a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    initial={{ opacity: 0, scale: 0 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ delay: 0.3 + index * 0.1 }}
                    whileHover={{ scale: 1.1, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    className="group relative w-10 h-10 rounded-lg bg-background border border-border flex items-center justify-center hover:border-accent-primary hover:bg-accent-primary/10 transition-all duration-300"
                  >
                    <Icon
                      size={20}
                      className="text-muted-foreground group-hover:text-accent-primary transition-colors"
                    />
                  </m.a>
                ))}
              </div>
            </m.div>
          </div>

          {/* Bottom Bar */}
          <m.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="pt-8 border-t border-border flex flex-col md:flex-row justify-between items-center gap-4"
          >
            <p className="text-muted-foreground text-sm">
              © {currentYear} Ridho Arachman. Built with{" "}
              <span className="text-accent-primary">Next.js</span> &{" "}
              <span className="text-accent-secondary">Tailwind CSS</span>.
            </p>
            <div className="flex items-center gap-2 text-muted-foreground text-xs">
              <span className="w-2 h-2 rounded-full bg-accent-primary animate-pulse" />
              <span>System Online</span>
            </div>
          </m.div>
        </div>
      </m.footer>
    </LazyMotion>
  );
}
