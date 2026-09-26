import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchPaginated: vi.fn(),
  deleteOne: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchPaginated: mocks.fetchPaginated,
  deleteOne: mocks.deleteOne,
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

// `usePagination` menyentuh router Next.js lewat nuqs; diuji di sini perilaku
// daftar, bukan integrasi URL-nya.
vi.mock("@/hooks/use-pagination", () => ({
  usePagination: () => ({
    page: 1,
    pageSize: 10,
    search: "",
    setSearch: vi.fn(),
    goToPage: vi.fn(),
    nextPage: vi.fn(),
    prevPage: vi.fn(),
    resetPage: vi.fn(),
    paginationParams: { page: 1, pageSize: 10, search: undefined },
  }),
}));

import { renderWithQuery } from "@/test-fixtures/render";
import { ProjectsList } from "./projects-list";

const project = {
  id: "p1",
  title: "Live Project",
  slug: "live-project",
  thumbnail: "/thumb.png",
  isPublished: true,
  order: 0,
  technologies: ["Next.js"],
  createdAt: "2026-01-02T00:00:00.000Z",
};

describe("ProjectsList setelah migrasi ke ConfirmActionDialog", () => {
  beforeEach(() => {
    mocks.fetchPaginated.mockResolvedValue({
      data: [project],
      pagination: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    });
    mocks.deleteOne.mockResolvedValue(undefined);
  });

  it("tetap merender baris dari query", async () => {
    renderWithQuery(<ProjectsList />);

    expect(await screen.findByText("Live Project")).toBeInTheDocument();
    expect(screen.getByText("/live-project")).toBeInTheDocument();
  });

  it("klik Delete membuka dialog konfirmasi tanpa langsung menghapus", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProjectsList />);

    await user.click(await screen.findByRole("button", { name: "Delete" }));

    expect(screen.getByText("Hapus Project?")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Project akan dihapus secara permanen. Tindakan ini tidak dapat dibatalkan.",
      ),
    ).toBeInTheDocument();
    expect(mocks.deleteOne).not.toHaveBeenCalled();
  });

  it("konfirmasi menghapus lewat endpoint yang sama dan menampilkan toast", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProjectsList />);

    await user.click(await screen.findByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Ya, Hapus" }));

    await waitFor(() => {
      expect(mocks.deleteOne).toHaveBeenCalledWith("/admin/projects/p1");
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith(
      "Project deleted successfully",
    );
  });

  it("cancel menutup dialog tanpa menghapus", async () => {
    const user = userEvent.setup();
    renderWithQuery(<ProjectsList />);

    await user.click(await screen.findByRole("button", { name: "Delete" }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(screen.queryByText("Hapus Project?")).not.toBeInTheDocument();
    });
    expect(mocks.deleteOne).not.toHaveBeenCalled();
  });
});
