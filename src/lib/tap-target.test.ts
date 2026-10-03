import { describe, expect, it } from "vitest";

import {
  INLINE_LINK_PADDING,
  MIN_TAP_TARGET,
  TAP_TARGET_HIT_AREA,
} from "./tap-target";

const hitAreaClasses = TAP_TARGET_HIT_AREA.split(" ");

describe("TAP_TARGET_HIT_AREA", () => {
  it("pakai ambang WCAG 2.2 / Lighthouse target-size", () => {
    expect(MIN_TAP_TARGET).toBe(44);
  });

  // Class harus literal: Tailwind v4 memindai source sebagai teks, jadi
  // `h-[${MIN_TAP_TARGET}px]` tidak akan menghasilkan CSS sama sekali.
  it("tinggi pita hardcoded tetap sinkron dengan MIN_TAP_TARGET", () => {
    expect(TAP_TARGET_HIT_AREA).toContain(`before:h-[${MIN_TAP_TARGET}px]`);
    expect(TAP_TARGET_HIT_AREA).not.toContain("${");
  });

  // Pita absolute adalah satu-satunya alasan layout tidak bergeser. Kalau
  // `before:absolute` hilang, `h-[44px]` akan ikut menambah tinggi kontrol.
  it("pita dibuat absolute supaya tidak menambah tinggi layout", () => {
    expect(hitAreaClasses).toContain("before:absolute");
  });

  it("dipusatkan ke kotak asli, bukan menempel ke tepi atas", () => {
    expect(hitAreaClasses).toContain("before:top-1/2");
    expect(hitAreaClasses).toContain("before:-translate-y-1/2");
  });

  // Tanpa `relative` di host, ::before tidak punya containing block dan pita
  // 44px-nya akan diposisikan terhadap ancestor lain.
  it("membuat host jadi containing block untuk pseudo-element-nya", () => {
    expect(hitAreaClasses).toContain("relative");
  });

  it("memakai content:[] supaya pseudo-element benar-benar dirender", () => {
    expect(hitAreaClasses).toContain("before:content-['']");
  });

  it("hanya menutup tinggi, lebar tidak ikut berubah", () => {
    expect(hitAreaClasses).toContain("before:inset-x-0");
    expect(hitAreaClasses).not.toContain("before:inset-x-");
  });
});

describe("INLINE_LINK_PADDING", () => {
  // Padding vertikal pada kotak inline tidak menambah tinggi line box; kalau
  // kelas ini dipakai di elemen blok, ritme `space-y-3` justru ikut rusak.
  it("hanya menambah padding vertikal, tanpa padding horizontal", () => {
    expect(INLINE_LINK_PADDING).toMatch(/^py-\[13px\]$/);
  });

  // 13px menutup tinggi teks yang dipakai di site ini: link lis `text-sm`
  // (19px) dan alamat email default (21px) -> 19 + 13 + 13 = 45 >= 44.
  it("cukup menutup kedua tinggi teks yang dipakai di site ini", () => {
    const paddingPerSide = Number(INLINE_LINK_PADDING.match(/13/)?.[0]);

    expect(paddingPerSide).toBeGreaterThan(0);
    for (const textHeight of [19, 20, 21]) {
      expect(textHeight + paddingPerSide * 2).toBeGreaterThanOrEqual(MIN_TAP_TARGET);
    }
  });
});