import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";

import { Navbar } from "@/components/layout/navbar/navbar";
import { PublicContentProvider } from "@/components/providers/public-content-provider";
import { ThemeToggleFloating } from "./theme-toggle-floating";
import { testMessages, testSiteSettings } from "@/test-fixtures/public-content";

vi.mock("next/navigation", () => ({
  usePathname: () => "/en",
  useParams: () => ({ lang: "en" }),
  useRouter: () => ({ push: vi.fn() }),
}));

vi.mock("@/providers/theme-provider", () => ({
  useTheme: () => ({ toggleTheme: vi.fn(), resolvedTheme: "dark" }),
}));

// jsdom tidak memuat CSS Tailwind, jadi z-index dibaca dari nama kelas. Yang
// dikunci kontrak lapisannya, bukan angka spesifiknya: navbar di atas tombol
// mengambang, tombol mengambang di atas isi halaman.
function zOf(el: Element): number {
  const cls = String(el.className);
  const bracket = cls.match(/z-\[(\d+)\]/);
  if (bracket) return Number(bracket[1]);
  const plain = cls.match(/\bz-(\d+)\b/);
  return plain ? Number(plain[1]) : 0;
}

describe("lapisan z-index navbar vs tombol tema mengambang", () => {
  it("tombol tema mengambang tidak menutupi navbar saat panel mobile terbuka", () => {
    const { container } = render(
      <PublicContentProvider messages={testMessages} settings={testSiteSettings}>
        <Navbar />
        <ThemeToggleFloating />
      </PublicContentProvider>,
    );

    const header = container.querySelector('header[role="banner"]');
    const toggleBox = container.querySelector("div.fixed.right-6.bottom-6");

    expect(header).not.toBeNull();
    expect(toggleBox).not.toBeNull();
    // Dulu keduanya z-50, dan header lebih dulu di DOM, jadi tombol mengambang
    // yang menutupi panel menu mobile di sudut kanan bawahnya.
    expect(zOf(toggleBox!)).toBeLessThan(zOf(header!));
  });
});
