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
import { DangerZone } from "./danger-zone";

const resetAll = () =>
  screen.getByRole("button", { name: /reset all settings/i });

describe("DangerZone", () => {
  beforeEach(() => {
    mocks.fetchOne.mockResolvedValue(testSiteSettings);
    mocks.createOne.mockResolvedValue(testSiteSettings);
    mocks.createOne.mockClear();
  });

  it("tidak memanggil API pada klik pertama (butuh konfirmasi)", async () => {
    const user = userEvent.setup();
    renderWithQuery(<DangerZone />);

    await user.click(screen.getByRole("button", { name: "Reset all settings" }));

    expect(mocks.createOne).not.toHaveBeenCalled();
    expect(
      screen.getByRole("button", { name: /reset all\?/i }),
    ).toBeInTheDocument();
  });

  it("reset per-section mengirim section tersebut", async () => {
    const user = userEvent.setup();
    renderWithQuery(<DangerZone />);

    const resetProfile =
      screen.getByRole("button", { name: "Reset Profile" });
    await user.click(resetProfile);
    await user.click(
      screen.getByRole("button", { name: "Confirm reset: Profile" }),
    );

    await waitFor(() => {
      expect(mocks.createOne).toHaveBeenCalledWith(
        "/admin/settings/reset",
        { section: "profile" },
      );
    });
    expect(mocks.toastSuccess).toHaveBeenCalled();
  });

  it("reset semua mengirim body kosong, bukan section", async () => {
    const user = userEvent.setup();
    renderWithQuery(<DangerZone />);

    await user.click(resetAll());
    await user.click(screen.getByRole("button", { name: /reset all\?/i }));

    await waitFor(() => {
      expect(mocks.createOne).toHaveBeenCalledWith(
        "/admin/settings/reset",
        {},
      );
    });
  });

  it("reset section quickLinks memakai key yang sama dengan schema", async () => {
    const user = userEvent.setup();
    renderWithQuery(<DangerZone />);

    await user.click(
      screen.getByRole("button", { name: "Reset Quick links" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Confirm reset: Quick links" }),
    );

    await waitFor(() => {
      expect(mocks.createOne).toHaveBeenCalledWith(
        "/admin/settings/reset",
        { section: "quickLinks" },
      );
    });
  });

  it("menampilkan pesan error dari API lewat toast", async () => {
    const user = userEvent.setup();
    mocks.createOne.mockRejectedValue(
      new Error("Section must be one of: profile, socials, site, quickLinks"),
    );

    renderWithQuery(<DangerZone />);
    await user.click(resetAll());
    await user.click(screen.getByRole("button", { name: /reset all\?/i }));

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith(
        "Section must be one of: profile, socials, site, quickLinks",
      );
    });
  });

  it("copy menyebutkan fallback ke env, bukan penghapusan", () => {
    renderWithQuery(<DangerZone />);

    expect(
      screen.getByText(/NEXT_PUBLIC_\* environment variables/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/kept, not deleted/i)).toBeInTheDocument();
  });
});
