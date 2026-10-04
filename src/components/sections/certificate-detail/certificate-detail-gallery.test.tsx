import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { CertificateDetailGallery } from "./certificate-detail-gallery";
import type { CertificateListData } from "./constants";

vi.mock("@/hooks/use-translation", async () => {
  const { default: enMessages } = await import("@/messages/en.json");
  return { useTranslation: () => ({ t: enMessages, locale: "en" as const }) };
});

const IMAGE_A = "https://picsum.photos/seed/cert-a/800/800";
const IMAGE_B = "https://picsum.photos/seed/cert-b/800/800";

function cert(overrides: Partial<CertificateListData> = {}): CertificateListData {
  return {
    slug: "back-end-developer",
    title: "Back End Developer",
    issuer: "Dicoding",
    period: "Issued on Mar 2024",
    thumbnail: "",
    gallery: [],
    skills: [],
    summary: [],
    ...overrides,
  };
}

describe("CertificateDetailGallery", () => {
  it("renders nothing at all when the gallery is empty", () => {
    const { container } = render(<CertificateDetailGallery cert={cert()} />);

    expect(container).toBeEmptyDOMElement();
    expect(screen.queryByRole("heading", { name: "Gallery" })).not.toBeInTheDocument();
    expect(screen.queryByRole("button")).not.toBeInTheDocument();
    expect(screen.queryByRole("img")).not.toBeInTheDocument();
  });

  it("renders one keyboard-reachable tile per image, named like the list card", () => {
    render(
      <CertificateDetailGallery
        cert={cert({ gallery: [IMAGE_A, IMAGE_B] })}
      />,
    );

    expect(screen.getByRole("heading", { name: "Gallery" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Preview 1" })).toHaveAttribute(
      "type",
      "button",
    );
    expect(screen.getByRole("button", { name: "Preview 2" })).toBeInTheDocument();
    expect(screen.getAllByRole("button")).toHaveLength(2);
  });

  it("opens the image in a dialog and closes it again", async () => {
    const user = userEvent.setup();
    render(<CertificateDetailGallery cert={cert({ gallery: [IMAGE_A] })} />);

    await user.click(screen.getByRole("button", { name: "Preview 1" }));

    expect(screen.getByRole("dialog")).toBeInTheDocument();

    await user.keyboard("{Escape}");

    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
  });
});