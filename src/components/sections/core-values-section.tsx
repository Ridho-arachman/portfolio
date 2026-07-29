// _components/sections/core-values-section.tsx
"use client";

import { Lightbulb, Shield, Users, Zap } from "lucide-react";
import * as m from "motion/react-m";

const values = [
  {
    icon: Zap,
    title: "Performance First",
    desc: "Saya percaya website yang cepat adalah hak pengguna, bukan fitur tambahan. Optimasi adalah prioritas.",
  },
  {
    icon: Shield,
    title: "Type-Safe & Reliable",
    desc: "Menggunakan TypeScript dan testing untuk memastikan kode yang scalable dan minim bug di production.",
  },
  {
    icon: Users,
    title: "User-Centric Design",
    desc: "Teknologi yang hebat tidak ada artinya jika tidak mudah digunakan. UX selalu menjadi panduan utama.",
  },
  {
    icon: Lightbulb,
    title: "Continuous Learning",
    desc: "Dunia tech bergerak cepat. Saya selalu meluangkan waktu untuk mempelajari arsitektur dan tools terbaru.",
  },
];

export function CoreValuesSection() {
  return (
    <section className="relative py-20 md:py-24">
      <div className="container mx-auto px-4">
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: false, amount: 0.2 }}
          className="text-center mb-12"
        >
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            My Core <span className="text-gradient-elegant">Philosophy</span>
          </h2>
          <p className="text-text-secondary max-w-xl mx-auto">
            Prinsip yang memandu setiap baris kode dan keputusan desain yang
            saya buat.
          </p>
        </m.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {values.map((value, index) => (
            <m.div
              key={value.title}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: false, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -8 }}
              className="group p-6 rounded-2xl border border-glass-border bg-glass-bg backdrop-blur-xl hover:border-accent/40 hover:bg-accent-muted/10 transition-all duration-300"
            >
              <div className="w-12 h-12 rounded-xl bg-accent/10 flex items-center justify-center mb-4 group-hover:bg-accent/20 transition-colors">
                <value.icon className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2 group-hover:text-accent transition-colors">
                {value.title}
              </h3>
              <p className="text-sm text-text-secondary leading-relaxed">
                {value.desc}
              </p>
            </m.div>
          ))}
        </div>
      </div>
    </section>
  );
}
