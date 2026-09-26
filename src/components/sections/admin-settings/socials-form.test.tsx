import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchOne: vi.fn(),
  updateOne: vi.fn(),
  createOne: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  changePassword: vi.fn(),
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

vi.mock("@/lib/auth-client", () => ({
  authClient: { changePassword: mocks.changePassword },
}));

import { renderWithQuery } from "@/test-fixtures/render";
import { testSiteSettings } from "@/test-fixtures/public-content";
import { SocialsForm } from "./socials-form";

const loaded = async () => {
  await screen.findByDisplayValue(testSiteSettings.githubUrl);
};

describe("SocialsForm", () => {
  beforeEach(() => {
    mocks.fetchOne.mockResolvedValue(testSiteSettings);
    mocks.updateOne.mockResolvedValue(testSiteSettings);
    mocks.updateOne.mockClear();
  });

  it("merender link dari query", async () => {
    renderWithQuery(<SocialsForm />);
    await loaded();

    expect(screen.getByLabelText(/github url/i)).toHaveValue(
      testSiteSettings.githubUrl,
    );
    expect(screen.getByLabelText(/linkedin url/i)).toHaveValue(
      testSiteSettings.linkedinUrl,
    );
    expect(screen.getByLabelText(/x \(twitter\) url/i)).toHaveValue(
      testSiteSettings.twitterUrl,
    );
  });

  it("mengirim kolom URL dengan nama kolom DB", async () => {
    const user = userEvent.setup();
    renderWithQuery(<SocialsForm />);
    await loaded();

    const github = screen.getByLabelText(/github url/i);
    await user.clear(github);
    await user.type(github, "https://github.com/ada");
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mocks.updateOne).toHaveBeenCalledWith("/admin/settings", {
        socials: {
          githubUrl: "https://github.com/ada",
          linkedinUrl: testSiteSettings.linkedinUrl,
          twitterUrl: testSiteSettings.twitterUrl,
        },
        // `contactEmail` ada di grup profile, bukan socials.
        profile: { contactEmail: testSiteSettings.contactEmail },
      });
    });
  });

  it("menampilkan pesan error dari API lewat toast", async () => {
    const user = userEvent.setup();
    mocks.updateOne.mockRejectedValue(new Error("Enter a valid URL"));

    renderWithQuery(<SocialsForm />);
    await loaded();
    await user.click(screen.getByRole("button", { name: /save changes/i }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith("Enter a valid URL");
    });
  });
});
