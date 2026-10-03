import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PublicContentProvider } from "@/components/providers/public-content-provider";
import { composePublicContent } from "@/lib/public-content";
import type { SiteSettings } from "@/lib/settings";
import type { Messages } from "@/lib/translation-types";
import enMessages from "@/messages/en.json";
import { testMessages, testSiteSettings } from "@/test-fixtures/public-content";
import { ContactInfo } from "./contact-info";

vi.mock("next/navigation", () => ({
  useParams: () => ({ lang: "en" }),
  usePathname: () => "/en/contact",
}));

function renderInfo(
  settings: SiteSettings = testSiteSettings,
  messages: Messages = testMessages,
) {
  return render(
    <PublicContentProvider messages={messages} settings={settings}>
      <ContactInfo />
    </PublicContentProvider>,
  );
}

describe("ContactInfo", () => {
  // Regresi: /en/contact pernah menampilkan dua mailto berbeda sekaligus —
  // satu dari DB, satu dari konstanta `CONTACT_EMAIL`.
  it("merender tepat satu mailto, dari contactEmail di settings", () => {
    renderInfo();

    const mailtos = document.querySelectorAll('a[href^="mailto:"]');
    expect(mailtos).toHaveLength(2); // kartu email + entri di baris social
    for (const mailto of mailtos) {
      expect(mailto).toHaveAttribute("href", `mailto:${testSiteSettings.contactEmail}`);
    }
  });

  it("menampilkan alamat email dari settings, bukan ridho@example.com sebagai konstanta", () => {
    renderInfo({ ...testSiteSettings, contactEmail: "halo@desde-db.test" });

    expect(
      screen.getByRole("link", { name: "halo@desde-db.test" }),
    ).toHaveAttribute("href", "mailto:halo@desde-db.test");
  });

  it("tidak merender tautan mati saat contactEmail kosong", () => {
    renderInfo({ ...testSiteSettings, contactEmail: "" });

    expect(document.querySelector('a[href^="mailto:"]')).toBeNull();
  });

  it("membaca lokasi dari overlay settings, bukan dari dokumen pesan mentah", () => {
    // Overlay terjadi di server per-request; fixture sudah ter-compose sekali,
    // jadi test ini harus mengulang langkah yang sama seperti layout publik.
    const settings = { ...testSiteSettings, location: "Bandung, Indonesia" };
    renderInfo(settings, composePublicContent(enMessages, settings));

    expect(screen.getByText("Bandung, Indonesia")).toBeInTheDocument();
    expect(screen.queryByText(enMessages.contact.location)).not.toBeInTheDocument();
  });

  it("memetakan social link dari settings dan menyembunyikan yang kosong", () => {
    renderInfo({ ...testSiteSettings, linkedinUrl: "" });

    expect(screen.queryByRole("link", { name: "LinkedIn" })).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "GitHub" })).toHaveAttribute(
      "href",
      testSiteSettings.githubUrl,
    );
    expect(screen.getByRole("link", { name: "Instagram" })).toHaveAttribute(
      "href",
      testSiteSettings.instagramUrl,
    );
  });

  it("memakai padding vertikal pada tautan email agar area hit >= 44px", () => {
    renderInfo();

    expect(screen.getByRole("link", { name: testSiteSettings.contactEmail })).toHaveClass(
      "py-[13px]",
    );
  });

  // Pil social punya border + background, jadi padding akan mengubah yang
  // terlihat; pita `::before`-lah yang memperbesar area hit tanpa bergeser.
  it("memakai pita hit-area di pil social, bukan padding", () => {
    const { container } = renderInfo();

    const pills = Array.from(container.querySelectorAll("a.rounded-full"));
    expect(pills.length).toBeGreaterThan(0);
    for (const pill of pills) {
      expect(pill).toHaveClass("before:h-[44px]");
      expect(pill).toHaveClass("before:absolute");
      expect(pill).toHaveClass("relative");
    }
  });
});
