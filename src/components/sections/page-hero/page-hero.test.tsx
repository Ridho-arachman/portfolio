import { render, screen } from "@testing-library/react";
import { LazyMotion, domAnimation } from "motion/react";
import { describe, expect, it } from "vitest";

import { PageHero } from "./page-hero";

function renderHero(props?: Partial<Parameters<typeof PageHero>[0]>) {
  return render(
    <LazyMotion features={domAnimation}>
      <PageHero
        badge="Credentials"
        title="My"
        titleAccent="Certificates"
        description="Validating expertise across disciplines."
        {...props}
      />
    </LazyMotion>,
  );
}

describe("PageHero", () => {
  it("renders badge, gradient heading, and description", () => {
    renderHero();

    expect(screen.getByText("Credentials")).toBeInTheDocument();

    const heading = screen.getByRole("heading", { level: 1 });
    expect(heading).toHaveTextContent("My");
    expect(heading).toHaveTextContent("Certificates");

    const accentSpan = heading.querySelector(".text-gradient-elegant");
    expect(accentSpan).not.toBeNull();
    expect(accentSpan).toHaveTextContent("Certificates");

    expect(
      screen.getByText("Validating expertise across disciplines."),
    ).toBeInTheDocument();
  });

  it("renders up to three floating icons when iconSet is provided", () => {
    const { container } = renderHero({ iconSet: "certificates" });

    // Set certificates = [Award, ShieldCheck, Database]
    expect(container.querySelectorAll("svg.lucide-award").length).toBe(1);
    expect(container.querySelectorAll("svg.lucide-shield-check").length).toBe(
      1,
    );
    expect(container.querySelectorAll("svg.lucide-database").length).toBe(1);
  });
});
