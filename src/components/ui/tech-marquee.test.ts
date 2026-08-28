import { describe, expect, it } from "vitest";
import {
  DEFAULT_MARQUEE_ITEMS,
  buildMarqueeItems,
} from "@/components/ui/tech-marquee";

describe("buildMarqueeItems", () => {
  it("returns two identical halves so the -50% translate loops seamlessly", () => {
    const base = [
      { name: "React" },
      { name: "Vue" },
      { name: "Angular" },
      { name: "Svelte" },
    ];
    const track = buildMarqueeItems(base);

    expect(track.length % 2).toBe(0);
    const half = track.length / 2;
    expect(track.slice(0, half)).toEqual(track.slice(half));
    expect(track[0]).toEqual(base[0]);
    expect(track[half]).toEqual(base[0]);
  });

  it("repeats small datasets until each half covers the minimum track size", () => {
    const base = [{ name: "React" }, { name: "Node.js" }];
    const track = buildMarqueeItems(base, 12);

    const half = track.length / 2;
    expect(half).toBeGreaterThanOrEqual(12);
    expect(half % base.length).toBe(0);
    expect(track.slice(0, half)).toEqual(track.slice(half));
  });

  it("uses at least two copies even when the dataset exceeds the minimum", () => {
    const track = buildMarqueeItems(DEFAULT_MARQUEE_ITEMS, 12);

    // DEFAULT_MARQUEE_ITEMS sudah > 12 item -> tetap digandakan minimal 2x
    const half = track.length / 2;
    expect(half).toBeGreaterThanOrEqual(2 * DEFAULT_MARQUEE_ITEMS.length);
    expect(track.slice(0, half)).toEqual(track.slice(half));
  });

  it("falls back to the hardcoded defaults for empty input", () => {
    const track = buildMarqueeItems([]);

    // Fallback memakai daftar hardcoded lalu digandakan minimal 2x per setengah
    const half = track.length / 2;
    expect(half % DEFAULT_MARQUEE_ITEMS.length).toBe(0);
    expect(half).toBeGreaterThanOrEqual(2 * DEFAULT_MARQUEE_ITEMS.length);
    expect(track.slice(0, half)).toEqual(track.slice(half));
    expect(track[0]).toEqual({ name: DEFAULT_MARQUEE_ITEMS[0].name });
  });
});
