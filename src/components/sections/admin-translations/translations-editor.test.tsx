import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { UserEvent } from "@testing-library/user-event";

const mocks = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  updateOne: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchOne: mocks.fetchOne,
  updateOne: mocks.updateOne,
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

import { renderWithQuery } from "@/test-fixtures/render";
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";
import { TranslationsEditor } from "./translations-editor";

const EN_OVERRIDE = { "hero.greeting": "Hey {name}, welcome" };
/** Jumlah leaf string di en.json. `hero.typewriter` (array) tidak ikut dihitung. */
const EDITABLE = 266;

const payload = [
  {
    locale: "en" as const,
    messages: { ...enMessages, hero: { ...enMessages.hero, greeting: EN_OVERRIDE["hero.greeting"] } },
    patch: EN_OVERRIDE,
  },
  { locale: "id" as const, messages: idMessages, patch: {} },
];

const saveButton = () => screen.getByRole("button", { name: /save changes/i });

const loaded = async () => {
  await screen.findByText(`${EDITABLE} editable keys, 1 overridden.`);
};

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

  // Timeout dinaikkan: membuka 18 namespace berarti merender 266 input bertahap,
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
    expect(screen.getByLabelText("hero.greeting")).toHaveValue(EN_OVERRIDE["hero.greeting"]);
    expect(screen.queryByLabelText("hero.title")).toBeNull();
  });

  it("berpindah locale menampilkan override locale itu tanpa fetch ulang", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    expect(screen.getByText(`${EDITABLE} editable keys, 1 overridden.`)).toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /ID/ }));

    await waitFor(() =>
      expect(screen.getByText(`${EDITABLE} editable keys, 0 overridden.`)).toBeInTheDocument(),
    );
    // `id` belum punya override, jadi grup hero menutup sendiri (tidak ada key
    // yang perlu dilihat) — cari key-nya agar group kebuka lagi.
    await user.type(screen.getByRole("searchbox", { name: "Search keys" }), "hero.greeting");
    expect(screen.getByLabelText("hero.greeting")).toHaveValue(idMessages.hero.greeting);

    // GET /admin/translations mengembalikan SEMUA locale dalam satu respons, jadi
    // pindah bahasa tidak boleh memicu request kedua.
    expect(mocks.fetchOne).toHaveBeenCalledTimes(1);
  });

  it("membedakan field yang diwarisi dari field yang di-override", async () => {
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    const overridden = screen.getByLabelText("hero.greeting").closest("li");
    const inherited = screen.getByLabelText("hero.title").closest("li");
    expect(overridden).not.toBeNull();
    expect(inherited).not.toBeNull();

    expect(within(overridden as HTMLElement).getByText("Override")).toBeInTheDocument();
    expect(
      within(overridden as HTMLElement).getByRole("button", { name: /Reset hero.greeting/ }),
    ).toBeInTheDocument();

    expect(within(inherited as HTMLElement).getByText("Inherited")).toBeInTheDocument();
    // Tidak ada tombol reset untuk field yang belum tersimpan.
    expect(
      within(inherited as HTMLElement).queryByRole("button", { name: /Reset/ }),
    ).toBeNull();
  });

  it("menyimpan patch datar keyed dotted, bukan dokumen bersarang", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    await user.clear(screen.getByLabelText("hero.title"));
    await user.type(screen.getByLabelText("hero.title"), "Engineer");
    await user.click(saveButton());

    await waitFor(() => expect(mocks.updateOne).toHaveBeenCalled());
    expect(mocks.updateOne.mock.calls.at(-1)?.[0]).toBe("/admin/translations?locale=en");
    // Kontrak yang ditegakkan server: key datar -> string, locale di query param.
    expect(lastPayload()).toEqual({
      values: { "hero.greeting": EN_OVERRIDE["hero.greeting"], "hero.title": "Engineer" },
    });
    expect(Object.values(lastPayload().values).every((value) => typeof value === "string")).toBe(true);
  });

  it("menghapus override dari patch, bukan mengirim string kosong", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TranslationsEditor />);
    await loaded();

    await user.click(screen.getByRole("button", { name: /Reset hero.greeting/ }));
    await user.click(saveButton());

    await waitFor(() => expect(mocks.updateOne).toHaveBeenCalled());
    expect(lastPayload()).toEqual({ values: {} });
    expect(lastPayload().values).not.toHaveProperty("hero.greeting");
  });

  it("menampilkan pesan 400 dari server, bukan error generik", async () => {
    const user = userEvent.setup();
    mocks.updateOne.mockRejectedValue(new Error("hero.nonexistent: unrecognized key"));

    renderWithQuery(<TranslationsEditor />);
    await loaded();

    await user.clear(screen.getByLabelText("hero.title"));
    await user.type(screen.getByLabelText("hero.title"), "x");
    await user.click(saveButton());

    await waitFor(() =>
      expect(mocks.toastError).toHaveBeenCalledWith("hero.nonexistent: unrecognized key"),
    );
  });

  it("menampilkan alert saat query gagal", async () => {
    mocks.fetchOne.mockRejectedValue(new Error("Translation operation failed"));

    renderWithQuery(<TranslationsEditor />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Translation operation failed");
  });
});
