import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  fetchPaginated: vi.fn(),
  createOne: vi.fn(),
  deleteOne: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
  resetPage: vi.fn(),
}));

vi.mock("@/lib/api-client", async (importOriginal) => ({
  ...(await importOriginal<typeof import("@/lib/api-client")>()),
  fetchPaginated: mocks.fetchPaginated,
  createOne: mocks.createOne,
  deleteOne: mocks.deleteOne,
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

// `usePagination` menyentuh router Next.js lewat nuqs. Yang diuji di sini adalah
// aliran data trash, jadi parameternya dikunci supaya query key bisa diamati.
vi.mock("@/hooks/use-pagination", () => ({
  usePagination: () => ({
    page: 1,
    pageSize: 10,
    search: "",
    setSearch: vi.fn(),
    goToPage: vi.fn(),
    nextPage: vi.fn(),
    prevPage: vi.fn(),
    resetPage: mocks.resetPage,
    paginationParams: { page: 1, pageSize: 10, search: undefined },
  }),
}));

import { renderWithQuery } from "@/test-fixtures/render";
import { TrashList } from "./trash-list";

const trashedProject = {
  id: "p1",
  deletedAt: "2026-09-20T04:12:33.481Z",
  createdAt: "2026-01-02T00:00:00.000Z",
  title: "Deleted Project",
  slug: "deleted-project",
};

function page(rows: unknown[]) {
  return { data: rows, pagination: { page: 1, pageSize: 10, total: rows.length, totalPages: 1 } };
}

describe("TrashList", () => {
  beforeEach(() => {
    mocks.fetchPaginated.mockResolvedValue(page([trashedProject]));
    mocks.createOne.mockResolvedValue({ data: trashedProject });
    mocks.deleteOne.mockResolvedValue(undefined);
  });

  it("me-render baris yang dikembalikan query", async () => {
    renderWithQuery(<TrashList />);

    expect(await screen.findByText("Deleted Project")).toBeInTheDocument();
    expect(screen.getByText("/deleted-project")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Restore" }),
    ).toBeInTheDocument();
  });

  it("meminta endpoint trash dengan trashed=true", async () => {
    renderWithQuery(<TrashList />);

    await waitFor(() => {
      expect(mocks.fetchPaginated).toHaveBeenCalledWith(
        "/admin/projects?trashed=true",
        { page: 1, pageSize: 10, search: undefined },
      );
    });
  });

  it("ganti tab entitas mengubah query key", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TrashList />);

    await screen.findByText("Deleted Project");
    await user.click(screen.getByRole("button", { name: "Skills" }));

    await waitFor(() => {
      expect(mocks.fetchPaginated).toHaveBeenCalledWith(
        "/admin/skills?trashed=true",
        expect.anything(),
      );
    });
    expect(mocks.resetPage).toHaveBeenCalled();
  });

  it("restore memanggil endpoint restore dan menampilkan toast sukses", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TrashList />);

    await user.click(await screen.findByRole("button", { name: "Restore" }));

    await waitFor(() => {
      expect(mocks.createOne).toHaveBeenCalledWith(
        "/admin/projects/p1/restore",
        {},
      );
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Restored to its list");
  });

  it("purge tidak jalan sebelum dikonfirmasi", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TrashList />);

    await user.click(await screen.findByRole("button", { name: "Delete forever" }));

    expect(await screen.findByText("Delete forever?")).toBeInTheDocument();
    expect(mocks.deleteOne).not.toHaveBeenCalled();
  });

  it("purge berjalan setelah dikonfirmasi", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TrashList />);

    await user.click(await screen.findByRole("button", { name: "Delete forever" }));
    await user.click(
      await screen.findByRole("button", { name: "Yes, delete forever" }),
    );

    await waitFor(() => {
      expect(mocks.deleteOne).toHaveBeenCalledWith(
        "/admin/projects/p1/purge?confirm=true",
      );
    });
    expect(mocks.toastSuccess).toHaveBeenCalledWith("Deleted forever");
  });

  it("cancel pada dialog purge tidak memanggil purge", async () => {
    const user = userEvent.setup();
    renderWithQuery(<TrashList />);

    await user.click(await screen.findByRole("button", { name: "Delete forever" }));
    await user.click(await screen.findByRole("button", { name: "Cancel" }));

    await waitFor(() => {
      expect(
        screen.queryByText("Delete forever?"),
      ).not.toBeInTheDocument();
    });
    expect(mocks.deleteOne).not.toHaveBeenCalled();
  });

  it("menampilkan empty state saat trash kosong", async () => {
    mocks.fetchPaginated.mockResolvedValue(page([]));
    renderWithQuery(<TrashList />);

    expect(await screen.findByText("Trash is empty")).toBeInTheDocument();
  });
});
