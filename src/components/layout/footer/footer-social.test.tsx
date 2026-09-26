import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PublicContentProvider } from "@/components/providers/public-content-provider";
import type { SiteSettings } from "@/lib/settings";
import { testMessages, testSiteSettings } from "@/test-fixtures/public-content";
import { FooterSocial } from "./footer-social";

vi.mock("next/navigation", () => ({
  useParams: () => ({ lang: "en" }),
  usePathname: () => "/en",
}));

function renderSocial(settings: SiteSettings = testSiteSettings) {
  return render(
    <PublicContentProvider messages={testMessages} settings={settings}>
      <FooterSocial />
    </PublicContentProvider>,
  );
}

const hrefOf = (label: string) => screen.getByRole("link", { name: label });

describe("FooterSocial", () => {
  it("mengambil setiap href dari settings, bukan dari konstanta hardcoded", () => {
    renderSocial();

    expect(hrefOf("GitHub")).toHaveAttribute("href", testSiteSettings.githubUrl);
    expect(hrefOf("LinkedIn")).toHaveAttribute("href", testSiteSettings.linkedinUrl);
    expect(hrefOf("X (Twitter)")).toHaveAttribute("href", testSiteSettings.twitterUrl);
    expect(hrefOf("Email Ridho")).toHaveAttribute(
      "href",
      `mailto:${testSiteSettings.contactEmail}`,
    );
  });

  it("mengikuti URL yang baru diisi admin, bukan fallback lama", () => {
    renderSocial({
      ...testSiteSettings,
      githubUrl: "https://github.com/desde-db",
      contactEmail: "baru@desde-db.test",
    });

    expect(hrefOf("GitHub")).toHaveAttribute("href", "https://github.com/desde-db");
    expect(hrefOf("Email Ridho")).toHaveAttribute("href", "mailto:baru@desde-db.test");
  });

  it("menyembunyikan entri yang URL-nya kosong, bukan merender tautan mati", () => {
    renderSocial({ ...testSiteSettings, twitterUrl: "" });

    expect(screen.queryByRole("link", { name: "X (Twitter)" })).not.toBeInTheDocument();
    expect(hrefOf("GitHub")).toBeInTheDocument();
  });

  it("menyembunyikan tautan email saat contactEmail kosong", () => {
    renderSocial({ ...testSiteSettings, contactEmail: "   " });

    expect(screen.queryByRole("link", { name: "Email Ridho" })).not.toBeInTheDocument();
    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("tidak pernah memuat URL hardcoded lama di mana pun", () => {
    renderSocial();

    const hrefs = Array.from(document.querySelectorAll("a"), (a) =>
      a.getAttribute("href"),
    );

    for (const stale of [
      "https://github.com/Ridho-arachman",
      "https://linkedin.com/in/ridho-arachman",
      "https://twitter.com/ridho_arachman",
    ]) {
      expect(hrefs).not.toContain(stale);
    }
  });
});
