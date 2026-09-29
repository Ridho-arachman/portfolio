import { render as renderUi, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";

import type { AdminSkill } from "@/components/sections/admin-skills/constants";
import { PublicContentProvider } from "@/components/providers/public-content-provider";
import { testMessages, testSiteSettings } from "@/test-fixtures/public-content";
import { SkillsSection } from "./skills-section";

// SkillsSection memanggil useTranslation, jadi harus dirender di dalam provider
// seperti di layout publik.
function render(ui: React.ReactNode) {
  return renderUi(
    <PublicContentProvider messages={testMessages} settings={testSiteSettings}>
      {ui}
    </PublicContentProvider>,
  );
}

const skillsMock = vi.hoisted(() => ({ value: [] as AdminSkill[] }));

vi.mock("next/navigation", () => ({
  useParams: () => ({ lang: "en" }),
  usePathname: () => "/en/about",
}));

vi.mock("@/hooks/use-skills", () => ({
  usePublicSkills: () => ({ data: skillsMock.value }),
}));

function skill(overrides: Partial<AdminSkill> = {}): AdminSkill {
  return {
    id: "skill-1",
    name: "React",
    iconName: null,
    category: "FRONTEND",
    proficiency: 90,
    order: 0,
    createdAt: "2026-01-01",
    updatedAt: "2026-01-01",
    ...overrides,
  };
}

describe("SkillsSection", () => {
  beforeEach(() => {
    skillsMock.value = [];
  });

  it("renders nothing when there are no skills", () => {
    const { container } = render(<SkillsSection />);

    expect(container).toBeEmptyDOMElement();
  });

  it("never renders a proficiency percentage", () => {
    skillsMock.value = [skill({ name: "React", proficiency: 90 })];
    const { container } = render(<SkillsSection />);

    expect(screen.getByText("React")).toBeInTheDocument();
    expect(screen.queryByText("90")).not.toBeInTheDocument();
    expect(container.querySelector("[data-proficiency]")).toBeNull();
  });

  it("labels each group with the translated category name", () => {
    skillsMock.value = [
      skill({ name: "React", category: "FRONTEND" }),
      skill({ id: "skill-2", name: "PostgreSQL", category: "DATABASE" }),
    ];
    render(<SkillsSection />);

    expect(screen.getByRole("heading", { name: "Frontend" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: "Database" })).toBeInTheDocument();
  });

  it("falls back to the skill name when iconName is missing or invalid", () => {
    skillsMock.value = [
      skill({ id: "skill-1", name: "React", iconName: null }),
      skill({ id: "skill-2", name: "Next.js", iconName: null }),
      skill({ id: "skill-3", name: "Unknown Thing", iconName: "NotAnIcon" }),
    ];
    const { container } = render(<SkillsSection />);

    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });
});
