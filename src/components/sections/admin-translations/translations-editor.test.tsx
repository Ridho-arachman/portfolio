import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserEvent } from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  updateOne: vi.fn(),
  createOne: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchOne: mocks.fetchOne,
  updateOne: mocks.updateOne,
  createOne: mocks.createOne,
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

import { renderWithQuery } from "@/test-fixtures/render";
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";
import { TranslationsEditor } from "./translations-editor";

const EN_OVERRIDE = { "nav.home": "Welcome home" };

/** Leaf string saja; array (`hero.typewriter`) dan non-string tidak jadi input. */
const countLeaves = (value: unknown): number =>
  typeof value === "string"
    ? 1
    : Array.isArray(value)
      ? 0
      : typeof value === "object" && value !== null
        ? Object.values(value).reduce<number>((sum, child) => sum + countLeaves(child), 0)
        : 0;

/** Diturunkan dari en.json supaya menambah key tidak membuat test ini merah. */
const EDITABLE = countLeaves(enMessages);

const banner = (overridden: 0 | 1) => new RegExp(`\\d+ editable keys, ${overridden} overridden\\.`);

const payload = [
  {
    locale: "en" as const,
    messages: { ...enMessages, nav: { ...enMessages.nav, home: EN_OVERRIDE["nav.home"] } },
    patch: EN_OVERRIDE,
  },
  { locale: "id" as const, messages: idMessages, patch: {} },
];

const saveButton = () => screen.getByRole("button", { name: /save changes/i });

const loaded = () => screen.findByText(banner(1));

/** Buka semua namespace; grup yang masih tertutup di-collapse via aria-expanded. */
const openAllGroups = async (user: UserEvent) => {
  for (let guard = 0; guard < 40; guard += 1) {
    const collapsed = screen.queryAllByRole("button", { expanded: false });
    if (collapsed.length === 0) return;
    await user.click(collapsed[0]);
  }
  throw new Error("grup tidak juga terbuka");
};

const lastPayload = () => mocks.updateOne.mock.calls.at(-1)?.[1] as { values: Record<string, string> };

describe("TranslationsEditor", () => {
  beforeEach(() => {
    mocks.fetchOne.mockResolvedValue(payload);
    mocks.updateOne.mockResolvedValue(payload[0]);
    mocks.updateOne.mockClear();
  });

  // Timeout dinaikkan: membuka 18 namespace berarti merender ratusan input bertahap,
  // dan jsdom jauh lebih lambat dari browser untuk itu.
  it("merender satu field per leaf string dan melewati key berbentuk array", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    await openAllGroups(user);

    // `hero.typewriter` punya zod `z.never()` di server, jadi tidak boleh punya input.
    expect(screen.getAllByRole("textbox")).toHaveLength(EDITABLE);
    expect(screen.queryByLabelText("hero.typewriter")).toBeNull();
    // Key yang dilewati tetap diberi tahu, bukan diam-diam hilang.
    expect(screen.getByText(/hero\.typewriter is a JSON array, not a string/)).toBeInTheDocument();
  }, 30_000);

  it("mencari berdasarkan path key maupun nilai yang sedang tampil", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    const search = () => screen.getByRole("searchbox", { name: "Search keys" });

    await user.type(search(), "DEVOPS_TOOLS");
    expect(screen.getByLabelText("skills.categories.DEVOPS_TOOLS")).toBeInTheDocument();
    expect(screen.queryByLabelText("skills.categories.SOFT_SKILL")).toBeNull();

    // Pencarian nilai: teks override yang diketik admin, bukan teks path.
    await user.clear(search());
    await user.type(search(), "welcome");
    expect(screen.getByLabelText("nav.home")).toHaveValue(EN_OVERRIDE["nav.home"]);
    expect(screen.queryByLabelText("hero.title")).toBeNull();
  });

  it("berpindah locale menampilkan override locale itu tanpa fetch ulang", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    expect(screen.getByText(banner(1))).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ID/ }));

    await waitFor(() => expect(screen.getByText(banner(0))).toBeInTheDocument());
    // `id` belum punya override, jadi grup hero menutup sendiri (tidak ada key
    // yang perlu dilihat) — cari key-nya agar group kebuka lagi.
    await user.type(screen.getByRole("searchbox", { name: "Search keys" }), "hero.greeting");
    expect(screen.getByLabelText("hero.greeting")).toHaveValue(idMessages.hero.greeting);

    // GET /admin/translations mengembalikan SEMUA locale dalam satu respons, jadi
    // pindah bahasa tidak boleh memicu request kedua.
    expect(mocks.fetchOne).toHaveBeenCalledTimes(1);
  });

  it("membedakan field yang diwarisi dari field yang di-override", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    await openAllGroups(user);

    const overridden = screen.getByLabelText("nav.home").closest("li");
    const inherited = screen.getByLabelText("hero.ctaPrimary").closest("li");
    expect(overridden).not.toBeNull();
    expect(inherited).not.toBeNull();

    expect(within(overridden as HTMLElement).getByText("Override")).toBeInTheDocument();
    expect(
      within(overridden as HTMLElement).getByRole("button", { name: /Reset nav\.home/ }),
    ).toBeInTheDocument();

    expect(within(inherited as HTMLElement).getByText("Inherited")).toBeInTheDocument();
    // Tidak ada tombol reset untuk field yang belum tersimpan.
    expect(
      within(inherited as HTMLElement).queryByRole("button", { name: /Reset/ }),
    ).toBeNull();
  }, 30_000);

  it("menandai 5 key milik Settings sebagai read-only", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    await openAllGroups(user);

    for (const path of [
      "hero.greeting",
      "hero.title",
      "hero.description",
      "footer.tagline",
      "contact.location",
    ]) {
      const row = screen.getByLabelText(path).closest("li");
      expect(row).not.toBeNull();
      expect(screen.getByLabelText(path)).toBeDisabled();
      expect(
        within(row as HTMLElement).getByText("Managed in Admin → Settings"),
      ).toBeInTheDocument();
      // Tidak ada tombol reset per-key untuk key milik Settings.
      expect(
        within(row as HTMLElement).queryByRole("button", { name: /Reset/ }),
      ).toBeNull();
    }
  }, 30_000);

  it("menyimpan patch datar keyed dotted, bukan dokumen bersarang", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    await user.type(screen.getByRole("searchbox", { name: "Search keys" }), "ctaPrimary");
    await user.clear(screen.getByLabelText("hero.ctaPrimary"));
    await user.type(screen.getByLabelText("hero.ctaPrimary"), "Engineer");
    await user.click(saveButton());

    await waitFor(() => expect(mocks.updateOne).toHaveBeenCalled());
    expect(mocks.updateOne.mock.calls.at(-1)?.[0]).toBe("/admin/translations?locale=en");
    // Kontrak yang ditegakkan server: key datar -> string, locale di query param.
    expect(lastPayload()).toEqual({
      values: { "nav.home": EN_OVERRIDE["nav.home"], "hero.ctaPrimary": "Engineer" },
    });
    expect(Object.values(lastPayload().values).every((value) => typeof value === "string")).toBe(true);
  });

  it("menghapus override dari patch, bukan mengirim string kosong", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    await user.click(screen.getByRole("button", { name: /Reset nav\.home/ }));
    await user.click(saveButton());

    await waitFor(() => expect(mocks.updateOne).toHaveBeenCalled());
    expect(lastPayload()).toEqual({ values: {} });
    expect(lastPayload().values).not.toHaveProperty("nav.home");
  });

  it("menampilkan jumlah perubahan live di sebelah tombol simpan", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    expect(screen.getByText("0 diubah")).toBeInTheDocument();

    await user.type(screen.getByRole("searchbox", { name: "Search keys" }), "ctaPrimary");
    await user.clear(screen.getByLabelText("hero.ctaPrimary"));
    await user.type(screen.getByLabelText("hero.ctaPrimary"), "Engineer");

    expect(await screen.findByText("1 diubah")).toBeInTheDocument();
  });

  it("menampilkan pesan 400 dari server, bukan error generik", async () => {
    const user = userEvent.setup();
    mocks.updateOne.mockRejectedValue(new Error("hero.nonexistent: unrecognized key"));

    renderWithQuery(<TranslationsEditor />);
    await loaded();

    await user.type(screen.getByRole("searchbox", { name: "Search keys" }), "ctaPrimary");
    await user.clear(screen.getByLabelText("hero.ctaPrimary"));
    await user.type(screen.getByLabelText("hero.ctaPrimary"), "x");
    await user.click(saveButton());

    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith("hero.nonexistent: unrecognized key"),
    );
    // Error persist inline di editor, dan indikator Saved tidak nyangkut.
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "hero.nonexistent: unrecognized key",
    );
    expect(saveButton()).toHaveTextContent(/save changes/i);
  });

  it("mengirim expectedUpdatedAt dan memuat ulang saat 409", async () => {
    const user = userEvent.setup();
    const updatedAt = "2026-10-01T00:00:00.000Z";
    mocks.fetchOne.mockResolvedValue([
      {
        locale: "en" as const,
        messages: { ...enMessages, nav: { ...enMessages.nav, home: EN_OVERRIDE["nav.home"] } },
        patch: EN_OVERRIDE,
        updatedAt,
      },
      { locale: "id" as const, messages: idMessages, patch: {}, updatedAt: null },
    ]);
    mocks.updateOne.mockRejectedValueOnce(
      new Error("Translation changed since you loaded it, reload and try again"),
    );

    const fetchCallsBefore = mocks.fetchOne.mock.calls.length;
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    await user.type(screen.getByRole("searchbox", { name: "Search keys" }), "ctaPrimary");
    await user.clear(screen.getByLabelText("hero.ctaPrimary"));
    await user.type(screen.getByLabelText("hero.ctaPrimary"), "Engineer");
    await user.click(saveButton());

    await waitFor(() => expect(mocks.updateOne).toHaveBeenCalled());
    expect(mocks.updateOne.mock.calls.at(-1)?.[1]).toEqual({
      values: { "nav.home": EN_OVERRIDE["nav.home"], "hero.ctaPrimary": "Engineer" },
      expectedUpdatedAt: updatedAt,
    });
    // 409: toast "changed, reload" + refetch sehingga draft basi tidak nyangkut.
    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith(
        "Translation changed since you loaded it, reload and try again",
      ),
    );
    await waitFor(() =>
      expect(mocks.fetchOne.mock.calls.length).toBeGreaterThan(fetchCallsBefore),
    );
  });

  it("mereset locale ke bundled dengan dua klik konfirmasi", async () => {
    const user = userEvent.setup();
    mocks.createOne.mockResolvedValue({ reset: "en" });
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    const resetButton = screen.getByRole("button", { name: /reset locale to bundled/i });
    await user.click(resetButton);

    // Klik pertama hanya armed, belum memanggil API.
    expect(mocks.createOne).not.toHaveBeenCalled();
    await user.click(
      screen.getByRole("button", { name: /click again to confirm reset/i }),
    );

    await waitFor(() => expect(mocks.createOne).toHaveBeenCalledWith(
      "/admin/translations/reset",
      { locale: "en" },
    ));
  });

  it("menampilkan alert saat query gagal", async () => {
    mocks.fetchOne.mockRejectedValue(new Error("Translation operation failed"));

    renderWithQuery(<TranslationsEditor />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Translation operation failed");
  });

  it("mengulang fetch saat Retry diklik", async () => {
    const user = userEvent.setup();
    mocks.fetchOne.mockRejectedValueOnce(new Error("Translation operation failed"));

    renderWithQuery(<TranslationsEditor />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Translation operation failed");
    await user.click(screen.getByRole("button", { name: /retry/i }));

    await loaded();
    expect(mocks.fetchOne).toHaveBeenCalledTimes(2);
  });
});
