import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithQuery } from "@/test-fixtures/render";
import { ConfirmActionDialog } from "./confirm-action-dialog";

const labels = {
  title: "Hapus Project?",
  description: "Project akan dihapus secara permanen.",
  confirmLabel: "Ya, Hapus",
};

function renderDialog(overrides: Partial<Parameters<typeof ConfirmActionDialog>[0]> = {}) {
  return renderWithQuery(
    <ConfirmActionDialog
      title={labels.title}
      description={labels.description}
      confirmLabel={labels.confirmLabel}
      open
      onConfirm={vi.fn()}
      onClose={vi.fn()}
      {...overrides}
    />,
  );
}

describe("ConfirmActionDialog", () => {
  it("tidak merender dialog saat tertutup", () => {
    renderDialog({ open: false });

    expect(screen.queryByText(labels.title)).not.toBeInTheDocument();
  });

  it("merender judul dan deskripsi dari props saat terbuka", () => {
    renderDialog();

    expect(screen.getByText(labels.title)).toBeInTheDocument();
    expect(screen.getByText(labels.description)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: labels.confirmLabel }),
    ).toBeInTheDocument();
  });

  it("konfirmasi memanggil onConfirm lalu onClose", async () => {
    const user = userEvent.setup();
    const calls: string[] = [];

    renderDialog({
      onConfirm: () => calls.push("confirm"),
      onClose: () => calls.push("close"),
    });

    await user.click(
      screen.getByRole("button", { name: labels.confirmLabel }),
    );

    expect(calls).toEqual(["confirm", "close"]);
  });

  it("cancel hanya menutup, tidak memanggil onConfirm", async () => {
    const user = userEvent.setup();
    const onConfirm = vi.fn();
    const onClose = vi.fn();

    renderDialog({ onConfirm, onClose });

    await user.click(screen.getByRole("button", { name: "Cancel" }));

    expect(onConfirm).not.toHaveBeenCalled();
    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it("menampilkan spinner dan menyembunyikan label saat pending", () => {
    renderDialog({ isPending: true });

    expect(
      screen.queryByRole("button", { name: labels.confirmLabel }),
    ).not.toBeInTheDocument();
  });
});
