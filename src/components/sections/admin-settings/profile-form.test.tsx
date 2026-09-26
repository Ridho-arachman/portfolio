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
import { ProfileForm } from "./profile-form";

const saveButton = () => screen.getByRole("button", { name: /save changes/i });

// Form mounting sebelum query selesai, jadi interaksi baru aman setelah nilai
// efektif benar-benar terpakai di input.
const loadedFullName = () =>
  screen.findByDisplayValue(testSiteSettings.fullName);

describe("ProfileForm", () => {
  beforeEach(() => {
    mocks.fetchOne.mockResolvedValue(testSiteSettings);
    mocks.updateOne.mockResolvedValue(testSiteSettings);
    mocks.updateOne.mockClear();
  });

  it("merender nilai efektif yang dikembalikan query", async () => {
    renderWithQuery(<ProfileForm />);

    expect(await loadedFullName()).toBeInTheDocument();
    expect(screen.getByLabelText(/title \/ role/i)).toHaveValue(
      testSiteSettings.jobTitle,
    );
    expect(screen.getByLabelText(/^email$/i)).toHaveValue(
      testSiteSettings.contactEmail,
    );
    expect(screen.getByLabelText(/location/i)).toHaveValue(
      testSiteSettings.location,
    );
    expect(screen.getByLabelText(/bio/i)).toHaveValue(testSiteSettings.bio);
  });

  it("mengirim grup profile dengan nama kolom yang dipakai API", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileForm />);

    const fullName = await loadedFullName();
    await user.clear(fullName);
    await user.type(fullName, "Ada Lovelace");
    await user.click(saveButton());

    await waitFor(() => {
      expect(mocks.updateOne).toHaveBeenCalledWith("/admin/settings", {
        profile: {
          fullName: "Ada Lovelace",
          jobTitle: testSiteSettings.jobTitle,
          bio: testSiteSettings.bio,
          location: testSiteSettings.location,
          contactEmail: testSiteSettings.contactEmail,
        },
      });
    });
    expect(mocks.toastSuccess).toHaveBeenCalled();
  });

  it("menampilkan pesan error dari API lewat toast", async () => {
    const user = userEvent.setup();
    mocks.updateOne.mockRejectedValue(new Error("Bio cannot be empty"));

    renderWithQuery(<ProfileForm />);
    await loadedFullName();
    await user.click(saveButton());

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith("Bio cannot be empty");
    });
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
  });

  it("tidak mengirim apa pun saat validasi client gagal", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileForm />);

    await user.clear(await loadedFullName());
    await user.click(saveButton());

    expect(
      await screen.findByText(/at least 2 characters/i),
    ).toBeInTheDocument();
    expect(mocks.updateOne).not.toHaveBeenCalled();
  });

  it("menampilkan indikator tersimpan lalu kembali ke Save saat diedit", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProfileForm />);

    await user.click(await screen.findByRole("button", { name: /save changes/i }));
    expect(await screen.findByRole("button", { name: /^saved$/i })).toBeInTheDocument();

    await user.type(screen.getByLabelText(/bio/i), " tambahan");
    expect(saveButton()).toBeInTheDocument();
  });
});
