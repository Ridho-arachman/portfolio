import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { PublicContentProvider } from "@/components/providers/public-content-provider";
import { LOCALE_NATIVE_NAMES } from "@/lib/i18n";
import { testMessages, testSiteSettings } from "@/test-fixtures/public-content";
import { NavCollapseClient } from "./nav-collapse-client";

const push = vi.fn();
let pathname = "/en";

vi.mock("next/navigation", () => ({
  usePathname: () => pathname,
  useParams: () => ({ lang: "en" }),
  useRouter: () => ({ push }),
}));

function renderMenu() {
  return render(
    <PublicContentProvider messages={testMessages} settings={testSiteSettings}>
      <NavCollapseClient />
    </PublicContentProvider>,
  );
}

const toggle = () => screen.getByTestId("mobile-nav-toggle");

describe("NavCollapseClient", () => {
  it("menyembunyikan isi menu sampai hamburger diklik", () => {
    renderMenu();

    expect(toggle()).toHaveAttribute("aria-expanded", "false");
    expect(screen.queryByRole("link", { name: /projects/i })).toBeNull();
  });

  it("menampilkan seluruh link nav setelah hamburger diklik", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(toggle());

    expect(toggle()).toHaveAttribute("aria-expanded", "true");
    for (const name of [/home/i, /about/i, /projects/i, /experience/i, /certificates/i, /contact/i]) {
      expect(screen.getByRole("link", { name })).toBeInTheDocument();
    }
  });

  it("memakai prefix locale pada href link nav", async () => {
    const user = userEvent.setup();
    pathname = "/id/somewhere";
    renderMenu();

    await user.click(toggle());

    expect(screen.getByRole("link", { name: /projects/i })).toHaveAttribute(
      "href",
      "/id/projects",
    );
  });

  // Varian dropdown menyembunyikan nama bahasa di bawah 640px, jadi di menu
  // mobile yang tersisa hanya ikon globe tanpa konteks apa pun.
  it("menampilkan nama bahasa, bukan hanya ikon globe", async () => {
    const user = userEvent.setup();
    renderMenu();

    await user.click(toggle());

    for (const locale of ["en", "id"] as const) {
      const option = screen.getByTestId(`language-option-${locale}`);
      expect(option).toBeInTheDocument();
      expect(option).toHaveTextContent(LOCALE_NATIVE_NAMES[locale]);
      expect(option).toHaveAttribute("aria-pressed", locale === "en" ? "true" : "false");
    }
  });

  it("mengganti locale ke URL yang sama tanpa-prefix", async () => {
    const user = userEvent.setup();
    pathname = "/en/projects";
    renderMenu();

    await user.click(toggle());
    await user.click(screen.getByTestId("language-option-id"));

    expect(push).toHaveBeenCalledWith("/id/projects");
  });

  it("menandai link yang sedang aktif", async () => {
    const user = userEvent.setup();
    pathname = "/en/projects";
    renderMenu();

    await user.click(toggle());

    expect(screen.getByRole("link", { name: /projects/i })).toHaveClass("text-accent");
  });
});
