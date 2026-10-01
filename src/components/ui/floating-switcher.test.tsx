import { act, render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

import { Navbar } from "@/components/layout/navbar/navbar";
import { PublicContentProvider } from "@/components/providers/public-content-provider";
import { FloatingSwitcher } from "./floating-switcher";
import { testMessages, testSiteSettings } from "@/test-fixtures/public-content";

const mockPathname = vi.hoisted(() => ({ current: "/en/projects" }));

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname.current,
  useParams: () => ({ lang: "en" }),
  useRouter: () => ({ push: vi.fn() }),
}));

const toggleTheme = vi.fn();

vi.mock("@/providers/theme-provider", () => ({
  useTheme: () => ({ toggleTheme, resolvedTheme: "dark" }),
}));

// `PortoBot` melakukan fetch sapaan saat panel dibuka. Stub di sini, bukan
// `msw`, karena yang diuji adalah kontrak tombolnya, bukan jalur HTTP-nya.
vi.stubGlobal(
  "fetch",
  vi.fn().mockResolvedValue({
    ok: true,
    json: async () => ({ intro: "Halo, saya PortoBot.", suggestions: [] }),
  }),
);

// jsdom tidak memuat CSS Tailwind, jadi z-index dibaca dari nama kelas. Yang
// dikunci kontrak lapisannya, bukan angka spesifiknya: navbar di atas kontrol
// mengambang, kontrol mengambang di atas isi halaman.
function zOf(el: Element): number {
  const cls = String(el.className);
  const bracket = cls.match(/z-\[(\d+)\]/);
  if (bracket) return Number(bracket[1]);
  const plain = cls.match(/\bz-(\d+)\b/);
  return plain ? Number(plain[1]) : 0;
}

beforeEach(() => {
  mockPathname.current = "/en/projects";
  toggleTheme.mockClear();
});

async function renderSwitcher() {
  const result = render(
    <PublicContentProvider messages={testMessages} settings={testSiteSettings}>
      <Navbar />
      <FloatingSwitcher />
    </PublicContentProvider>,
  );

  // `FloatingSwitcher` menunggu satu frame sebelum merender tombol sungguhan,
  // supaya markup server sama dengan render pertama.
  await screen.findByRole("radiogroup", { name: "Site controls" });

  return result;
}

describe("lapisan z-index navbar vs kontrol mengambang", () => {
  it("kontrol mengambang tidak menutupi navbar saat panel mobile terbuka", async () => {
    const { container } = await renderSwitcher();

    const header = container.querySelector('header[role="banner"]');
    const floating = container.querySelector("div.fixed.right-6.bottom-6");

    expect(header).not.toBeNull();
    expect(floating).not.toBeNull();
    // Dulu keduanya z-50, dan header lebih dulu di DOM, jadi kontrol mengambang
    // yang menutupi panel menu mobile di sudut kanan bawahnya.
    expect(zOf(floating!)).toBeLessThan(zOf(header!));
  });
});

describe("dua segmen pada kontrol mengambang", () => {
  it("segmen tema dan PortoBot punya accessible name yang bisa dicari", async () => {
    await renderSwitcher();

    expect(await screen.findByRole("radio", { name: "Toggle theme" })).toBeInTheDocument();
    expect(await screen.findByRole("radio", { name: "PortoBot" })).toBeInTheDocument();
  });

  it("klik segmen PortoBot membuka panel dan menandai segmen itu terpilih", async () => {
    const user = userEvent.setup();
    await renderSwitcher();

    const bot = screen.getByRole("radio", { name: "PortoBot" });
    const theme = screen.getByRole("radio", { name: "Toggle theme" });

    expect(bot).toHaveAttribute("aria-checked", "false");
    await user.click(bot);

    expect(bot).toHaveAttribute("aria-checked", "true");
    expect(theme).toHaveAttribute("aria-checked", "false");
    // Panel sapaan = teks yang di-fetch, bukan teks hardcode.
    expect(await screen.findByText("Halo, saya PortoBot.")).toBeInTheDocument();
  });

  it("klik segmen tema memanggil toggleTheme tanpa membuka panel", async () => {
    const user = userEvent.setup();
    await renderSwitcher();

    await user.click(screen.getByRole("radio", { name: "Toggle theme" }));

    expect(toggleTheme).toHaveBeenCalledTimes(1);
    expect(screen.getByRole("radio", { name: "PortoBot" })).toHaveAttribute(
      "aria-checked",
      "false",
    );
  });

  it("fokus pindah antar segmen dengan panah, tapi panah tidak mengaktifkan", async () => {
    const user = userEvent.setup();
    await renderSwitcher();

    const theme = screen.getByRole("radio", { name: "Toggle theme" });
    const bot = screen.getByRole("radio", { name: "PortoBot" });

    await user.click(bot);
    bot.focus();
    await user.keyboard("{ArrowLeft}");

    await waitFor(() => expect(theme).toHaveFocus());
    // Memindahkan fokus bukan memilih: menyorot tombol Tema tidak boleh
    // mengganti tema tanpa sengaja.
    expect(toggleTheme).not.toHaveBeenCalled();
    expect(bot).toHaveAttribute("aria-checked", "true");
  });
});

describe("home yang fixed-dark", () => {
  it("tidak merender kontrol tema maupun PortoBot di sana", async () => {
    mockPathname.current = "/en";

    const { container } = render(
      <PublicContentProvider messages={testMessages} settings={testSiteSettings}>
        <Navbar />
        <FloatingSwitcher />
      </PublicContentProvider>,
    );

    await act(async () => {
      await new Promise((resolve) =>
        requestAnimationFrame(() => resolve(undefined)),
      );
    });

    expect(container.querySelector("div.fixed.right-6.bottom-6")).toBeNull();
    expect(
      screen.queryByRole("radiogroup", { name: "Site controls" }),
    ).not.toBeInTheDocument();
  });
});
