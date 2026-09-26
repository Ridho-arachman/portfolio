import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { PublicContentProvider } from "@/components/providers/public-content-provider";
import type { SiteSettings } from "@/lib/settings";
import { testMessages, testSiteSettings } from "@/test-fixtures/public-content";
import { FooterLinks } from "./footer-links";

vi.mock("next/navigation", () => ({
  useParams: () => ({ lang: "en" }),
  usePathname: () => "/en/about",
}));

function renderLinks(settings: SiteSettings = testSiteSettings) {
  return render(
    <PublicContentProvider messages={testMessages} settings={settings}>
      <FooterLinks />
    </PublicContentProvider>,
  );
}

const labels = () => screen.getAllByRole("listitem").map((li) => li.textContent);
const hrefs = () =>
  screen.getAllByRole("listitem").map((li) => li.querySelector("a")?.getAttribute("href"));

describe("FooterLinks", () => {
  it("mengikuti isi dan urutan quickLinks dari settings", () => {
    renderLinks({ ...testSiteSettings, quickLinks: ["contact", "home"] });

    expect(labels()).toEqual(["Contact", "Home"]);
    expect(hrefs()).toEqual(["/en/contact", "/en"]);
  });

  it("membalas urutan default admin, bukan urutan konstanta lokal", () => {
    renderLinks({
      ...testSiteSettings,
      quickLinks: ["projects", "about", "contact", "home"],
    });

    expect(labels()).toEqual(["Projects", "About", "Contact", "Home"]);
  });

  it("menerjemahkan label dari katalog pesan sesuai locale aktif", () => {
    renderLinks({ ...testSiteSettings, quickLinks: ["certificates"] });

    expect(screen.getByRole("link", { name: "Certificates" })).toHaveAttribute(
      "href",
      "/en/certificates",
    );
  });

  it("menerlewati key yang bukan nav key kanonik tanpa crash", () => {
    renderLinks({ ...testSiteSettings, quickLinks: ["contact", "pricing", "home"] });

    expect(labels()).toEqual(["Contact", "Home"]);
  });

  it("menandai halaman yang sedang aktif dengan aria-current", () => {
    // `next/navigation` di-mock ke /en/about
    renderLinks({ ...testSiteSettings, quickLinks: ["about", "contact"] });

    expect(screen.getByRole("link", { name: "About" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("link", { name: "Contact" })).not.toHaveAttribute(
      "aria-current",
    );
  });
});
