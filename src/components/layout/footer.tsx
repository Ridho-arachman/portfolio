"use client";

import * as m from "motion/react-m";
import Link from "next/link";
import { FaLinkedin } from "react-icons/fa";
import { SiGithub, SiGmail, SiX } from "react-icons/si";

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
    <m.footer
      initial={{ opacity: 0 }}
      whileInView={{ opacity: 1 }}
      viewport={{ once: true }}
      // FIX: Gunakan bg-bg-secondary/80 dan border-glass-border agar adaptif Light/Dark
      className="relative border-t border-glass-border bg-bg-secondary/80 backdrop-blur-xl"
    >
      {/* FIX: Gunakan bg-gradient-to-r untuk mencegah hydration mismatch */}
      <div className="absolute top-0 left-0 right-0 h-px bg-linear-to-r from-transparent via-accent to-transparent" />

      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          {/* Brand */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            <h3 className="text-2xl font-bold text-gradient-elegant mb-3">
              Ridho.dev
            </h3>
            <p className="text-text-secondary text-sm leading-relaxed max-w-xs">
              Information Systems student crafting immersive web experiences
              with modern tech stacks.
            </p>
          </m.div>

          {/* Quick Links */}
          <m.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ delay: 0.1 }}
          >
            <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
              Quick Links
            </h4>
            <ul className="space-y-3">
              {["Projects", "About", "Contact"].map((item) => (
                <li key={item}>
                  <Link
                    href={`/${item.toLowerCase()}`}
                    className="text-text-secondary hover:text-accent transition-colors text-sm flex items-center gap-2 group"
                  >
                    {/* Indikator titik kecil yang muncul saat hover */}
                    <span className="w-1.5 h-1.5 rounded-full bg-accent/0 group-hover:bg-accent transition-all duration-300" />
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
            <h4 className="text-sm font-semibold text-text-primary uppercase tracking-wider mb-4">
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
                  // FIX: Gunakan bg-glass-bg dan border-glass-border agar adaptif
                  className="group relative w-10 h-10 rounded-lg bg-glass-bg border border-glass-border flex items-center justify-center hover:border-accent/50 hover:bg-accent-muted transition-all duration-300"
                >
                  <Icon
                    size={20}
                    className="text-text-secondary group-hover:text-accent transition-colors duration-300"
                  />
                  {/* Glow effect saat hover */}
                  <span className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 shadow-[0_0_15px_rgba(167,139,250,0.3)]" />
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
          className="pt-8 border-t border-glass-border flex flex-col md:flex-row justify-between items-center gap-4"
        >
          <p className="text-text-muted text-sm text-center md:text-left">
            © {currentYear} Ridho Arachman. Built with{" "}
            <span className="text-accent font-medium">Next.js</span> &{" "}
            <span className="text-accent font-medium">Tailwind v4</span>.
          </p>

          <div className="flex items-center gap-2 text-text-muted text-xs">
            {/* Ping animation yang lebih halus dengan warna accent */}
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
            </span>
            <span>System Online</span>
          </div>
        </m.div>
      </div>
    </m.footer>
  );
}
