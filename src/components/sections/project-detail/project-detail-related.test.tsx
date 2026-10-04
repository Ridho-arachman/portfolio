import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import {
  ProjectRelatedCertificates,
  ProjectRelatedExperiences,
} from "./project-detail-related";
import type { CertificateListData } from "@/components/sections/certificates/constants";
import type { ExperienceListData } from "@/components/sections/experience-list/constants";

vi.mock("@/hooks/use-translation", async () => {
  const { default: enMessages } = await import("@/messages/en.json");
  return { useTranslation: () => ({ t: enMessages, locale: "en" as const }) };
});

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

describe("ProjectRelatedCertificates", () => {
  it("renders nothing at all when the relation is empty", () => {
    const { container } = render(<ProjectRelatedCertificates certificates={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("heading", { name: "Related Certificates" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the existing CertificateCard per related row", () => {
    render(
      <ProjectRelatedCertificates
        certificates={[cert(), cert({ slug: "aws-solutions-architect", title: "SAA" })]}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Related Certificates" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /AWS Certified Cloud Practitioner/ }),
    ).toHaveAttribute("href", "/en/certificates/aws-cloud-practitioner");
    expect(screen.getByRole("link", { name: /SAA/ })).toHaveAttribute(
      "href",
      "/en/certificates/aws-solutions-architect",
    );
  });
});

describe("ProjectRelatedExperiences", () => {
  it("renders nothing at all when the relation is empty", () => {
    const { container } = render(<ProjectRelatedExperiences experiences={[]} />);

    expect(container).toBeEmptyDOMElement();
    expect(
      screen.queryByRole("heading", { name: "Related Experience" }),
    ).not.toBeInTheDocument();
    expect(screen.queryByRole("link")).not.toBeInTheDocument();
  });

  it("renders the existing ExperienceListItem per related row", () => {
    render(<ProjectRelatedExperiences experiences={[exp()]} />);

    expect(
      screen.getByRole("heading", { name: "Related Experience" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: /Frontend Developer Intern/ }),
    ).toHaveAttribute("href", "/en/experience/frontend-intern");
  });
});