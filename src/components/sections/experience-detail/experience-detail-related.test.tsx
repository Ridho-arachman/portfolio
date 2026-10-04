import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ExperienceRelatedCertificates,
  ExperienceRelatedProjects,
} from "./experience-detail-related";
import type { Project } from "@/components/sections/projects/constants";
import type { CertificateListData } from "@/components/sections/certificates/constants";

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

function cert(overrides: Partial<CertificateListData> = {}): CertificateListData {
  return {
    slug: "aws-cloud-practitioner",
    title: "AWS Certified Cloud Practitioner",
    issuer: "Amazon Web Services",
    period: "Issued on Mar 2024",
    thumbnail: "",
    gallery: [],
    skills: [],
    summary: [],
    ...overrides,
  };
}

describe("ExperienceRelatedProjects", () => {
  it("renders nothing at all when the relation is empty", () => {
    const { container } = render(<ExperienceRelatedProjects projects={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("heading", { name: "Related Projects" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the existing ProjectCard per related row", () => {
    render(<ExperienceRelatedProjects projects={[project()]} />);

    expect(
      screen.getByRole("heading", { name: "Related Projects" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Next.js Portfolio" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("link").map((l) => l.getAttribute("href"))).toEqual([
      "/en/projects/nextjs-portfolio",
    ]);
  });
});

describe("ExperienceRelatedCertificates", () => {
  it("renders nothing at all when the relation is empty", () => {
    const { container } = render(<ExperienceRelatedCertificates certificates={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("heading", { name: "Related Certificates" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the existing CertificateCard per related row", () => {
    render(<ExperienceRelatedCertificates certificates={[cert()]} />);

    expect(
      screen.getByRole("heading", { name: "Related Certificates" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /AWS Certified Cloud Practitioner/ }),
    ).toHaveAttribute("href", "/en/certificates/aws-cloud-practitioner");
  });
});