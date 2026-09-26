import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { GlassCard } from "./glass-card";

describe("GlassCard", () => {
  it("does not pair a CSS hover transform with a framer-motion y animation", () => {
    // framer-motion writes `transform` inline once whileInView settles, and an
    // inline transform outranks any class, so a `hover:-translate-y-*` class
    // would silently never apply. The lift must be driven by whileHover.
    const { container } = render(
      <GlassCard variant="hover">
        <span>Lift me</span>
      </GlassCard>,
    );

    expect(container.firstElementChild?.className).not.toMatch(
      /hover:-?translate-y/,
    );
  });

  it("keeps the non-transform hover affordances on the hover variant", () => {
    const { container } = render(
      <GlassCard variant="hover">
        <span>Hover state</span>
      </GlassCard>,
    );

    const className = container.firstElementChild?.className ?? "";
    expect(className).toContain("hover:border-accent/40");
    expect(className).toContain("hover:shadow-2xl");
  });

  it("renders its children", () => {
    render(
      <GlassCard>
        <span>Visible content</span>
      </GlassCard>,
    );

    expect(screen.getByText("Visible content")).toBeInTheDocument();
  });
});
