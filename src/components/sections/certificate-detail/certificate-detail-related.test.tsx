import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  CertificateRelatedExperiences,
  CertificateRelatedProjects,
} from "./certificate-detail-related";
import type { Project } from "@/components/sections/projects/constants";
import type { ExperienceListData } from "@/components/sections/experience-list/constants";

vi.mock("@/hooks/use-translation", async () => {
  const { default: enMessages } = await import("@/messages/en.json");
  return { useTranslation: () => ({ t: enMessages, locale: "en" as const }) };
});

function project(overrides: Partial<Project> = {}): Project {
  return {
    id: Number.NaN,
    slug: "nextjs-portfolio",
    title: "Next.js Portfolio",
    description: "A portfolio built with Next.js.",
    image: "https://picsum.photos/seed/proj/800/600",
    tags: ["Next.js"],
    link: "/projects/nextjs-portfolio",
    ...overrides,
  };
}

function exp(overrides: Partial<ExperienceListData> = {}): ExperienceListData {
  return {
    id: "exp-1",
    slug: "frontend-intern",
    role: "Frontend Developer Intern",
    company: "PT Tech Startup",
    type: "INTERNSHIP",
    period: "Jan 2024 - Present",
    location: "Jakarta, Indonesia",
    thumbnail: null,
    description: ["Built the marketing site."],
    ...overrides,
  };
}

describe("CertificateRelatedProjects", () => {
  it("renders nothing at all when the relation is empty", () => {
    const { container } = render(<CertificateRelatedProjects projects={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("heading", { name: "Related Projects" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the existing ProjectCard per related row", () => {
    render(
      <CertificateRelatedProjects
        projects={[project(), project({ slug: "astro-blog", title: "Astro Blog" })]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Related Projects" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Next.js Portfolio" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Astro Blog" })).toBeInTheDocument();
    expect(screen.getAllByRole("link").map((l) => l.getAttribute("href"))).toEqual([
      "/en/projects/nextjs-portfolio",
      "/en/projects/astro-blog",
    ]);
  });
});

describe("CertificateRelatedExperiences", () => {
  it("renders nothing at all when the relation is empty", () => {
    const { container } = render(<CertificateRelatedExperiences experiences={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("heading", { name: "Related Experience" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the existing ExperienceListItem per related row", () => {
    render(<CertificateRelatedExperiences experiences={[exp()]} />);

    expect(
      screen.getByRole("heading", { name: "Related Experience" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Frontend Developer Intern/ }),
    ).toHaveAttribute("href", "/en/experience/frontend-intern");
  });
});