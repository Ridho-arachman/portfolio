"use client";

import * as m from "motion/react-m";
import { CORE_VALUES, REPLAY_VIEWPORT } from "./core-values/constants";
import { ValueCard } from "./core-values/value-card";

export function CoreValuesSection() {
  return (
    <section className="relative ">
      <div className="container mx-auto px-4">
        {/* Header Section */}
        <m.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={REPLAY_VIEWPORT}
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

        {/* Grid Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {CORE_VALUES.map((value, index) => (
            <ValueCard key={value.title} value={value} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}
