import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

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
import { testSiteSettings } from "@/test-fixtures/public-content";
import { DEFAULT_QUICK_LINK_KEYS } from "@/lib/quick-links";
import { SiteForm } from "./site-form";

const saveButton = () => screen.getByRole("button", { name: /save changes/i });
const switchFor = (label: string) => screen.getByRole("switch", { name: label });

const loaded = async () => {
  await screen.findByDisplayValue(testSiteSettings.siteName);
};

const lastPayload = () => mocks.updateOne.mock.calls.at(-1)?.[1];

describe("SiteForm", () => {
  beforeEach(() => {
    mocks.fetchOne.mockResolvedValue(testSiteSettings);
    mocks.updateOne.mockResolvedValue(testSiteSettings);
    mocks.updateOne.mockClear();
  });

  it("merender branding dan quick links dari query", async () => {
    renderWithQuery(<SiteForm />);
    await loaded();

    expect(screen.getByLabelText(/site name/i)).toHaveValue(
      testSiteSettings.siteName,
    );
    expect(screen.getByLabelText(/tagline/i)).toHaveValue(
      testSiteSettings.tagline,
    );
    // Fixture hanya mengaktifkan home + about, jadi empat sisanya harus mati.
    expect(switchFor("Home")).toHaveAttribute("aria-checked", "true");
    expect(switchFor("About")).toHaveAttribute("aria-checked", "true");
    expect(switchFor("Projects")).toHaveAttribute("aria-checked", "false");
  });

  it("bisa mengaktifkan quick link yang belum aktif", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SiteForm />);
    await loaded();

    await user.click(switchFor("Projects"));
    await user.click(saveButton());

    await waitFor(() => expect(mocks.updateOne).toHaveBeenCalled());
    expect(lastPayload()).toMatchObject({
      quickLinks: ["home", "about", "projects"],
    });
  });

  it("bisa menonaktifkan quick link yang aktif", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SiteForm />);
    await loaded();

    await user.click(switchFor("About"));
    await user.click(saveButton());

    await waitFor(() => expect(mocks.updateOne).toHaveBeenCalled());
    expect(lastPayload()).toMatchObject({ quickLinks: ["home"] });
  });

  it("menyimpan quick links dalam urutan yang ditampilkan, bukan urutan default", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SiteForm />);
    await loaded();

    await user.click(switchFor("Projects"));
    await user.click(screen.getByRole("button", { name: "Move Projects up" }));
    await user.click(saveButton());

    await waitFor(() => expect(mocks.updateOne).toHaveBeenCalled());
    expect(lastPayload()).toMatchObject({
      site: {
        siteName: testSiteSettings.siteName,
        tagline: testSiteSettings.tagline,
      },
      quickLinks: ["home", "projects", "about"],
    });
    // Urutan tidak boleh diam-diam kembali ke DEFAULT_QUICK_LINK_KEYS.
    expect(lastPayload().quickLinks).not.toEqual([...DEFAULT_QUICK_LINK_KEYS]);
  });

  it("menonaktifkan tombol pindah di ujung daftar", async () => {
    renderWithQuery(<SiteForm />);
    await loaded();

    expect(screen.getByRole("button", { name: "Move Home up" })).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move About down" }),
    ).toBeDisabled();
    expect(
      screen.getByRole("button", { name: "Move About up" }),
    ).toBeEnabled();
  });

  it("menampilkan pesan error dari API lewat toast", async () => {
    const user = userEvent.setup();
    mocks.updateOne.mockRejectedValue(
      new Error("Quick links cannot be empty"),
    );

    renderWithQuery(<SiteForm />);
    await loaded();
    await user.click(saveButton());

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith("Quick links cannot be empty");
    });
  });
});
