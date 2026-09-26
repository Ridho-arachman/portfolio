import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  changePassword: vi.fn(),
  toastSuccess: vi.fn(),
  toastError: vi.fn(),
}));

vi.mock("sonner", () => ({
  toast: { success: mocks.toastSuccess, error: mocks.toastError },
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: { changePassword: mocks.changePassword },
}));

import { renderWithQuery } from "@/test-fixtures/render";
import { PasswordForm } from "./password-form";

const fill = async (user: ReturnType<typeof userEvent.setup>) => {
  await user.type(screen.getByLabelText(/current password/i), "old-secret");
  await user.type(screen.getByLabelText(/^new password$/i), "new-secret-1");
  await user.type(
    screen.getByLabelText(/confirm new password/i),
    "new-secret-1",
  );
};

const submit = () =>
  screen.getByRole("button", { name: /save changes/i });

describe("PasswordForm", () => {
  beforeEach(() => {
    mocks.changePassword.mockResolvedValue({ data: null, error: null });
  });

  it("memanggil changePassword tanpa confirmPassword", async () => {
    const user = userEvent.setup();
    renderWithQuery(<PasswordForm />);
    await fill(user);

    await user.click(submit());

    await waitFor(() => {
      expect(mocks.changePassword).toHaveBeenCalledWith({
        currentPassword: "old-secret",
        newPassword: "new-secret-1",
        // Sesi lain dicabut, sesi browser ini diterbitkan ulang.
        revokeOtherSessions: true,
      });
    });
    const payload = mocks.changePassword.mock.calls[0][0];
    expect(payload).not.toHaveProperty("confirmPassword");
    expect(mocks.toastSuccess).toHaveBeenCalled();
  });

  it("mengosongkan form dan menampilkan toast sukses", async () => {
    const user = userEvent.setup();
    renderWithQuery(<PasswordForm />);
    await fill(user);
    await user.click(submit());

    await waitFor(() => {
      expect(screen.getByLabelText(/current password/i)).toHaveValue("");
    });
    expect(screen.getByLabelText(/^new password$/i)).toHaveValue("");
  });

  it("menampilkan pesan error dari better-auth", async () => {
    const user = userEvent.setup();
    mocks.changePassword.mockResolvedValue({
      data: null,
      error: { message: "Invalid password" },
    });

    renderWithQuery(<PasswordForm />);
    await fill(user);
    await user.click(submit());

    await waitFor(() => {
      expect(mocks.toastError).toHaveBeenCalledWith("Invalid password");
    });
    expect(mocks.toastSuccess).not.toHaveBeenCalled();
    // Field tidak dikosongkan supaya admin bisa memperbaiki password lama.
    expect(screen.getByLabelText(/current password/i)).toHaveValue(
      "old-secret",
    );
  });

  it("tidak memanggil API saat confirmasi tidak cocok", async () => {
    const user = userEvent.setup();
    renderWithQuery(<PasswordForm />);

    await user.type(screen.getByLabelText(/current password/i), "old-secret");
    await user.type(screen.getByLabelText(/^new password$/i), "new-secret-1");
    await user.type(
      screen.getByLabelText(/confirm new password/i),
      "different-one",
    );
    await user.click(submit());

    expect(await screen.findByText(/passwords do not match/i)).toBeInTheDocument();
    expect(mocks.changePassword).not.toHaveBeenCalled();
  });

  it("tidak ada catatan mockup di copy security", () => {
    renderWithQuery(<PasswordForm />);

    expect(
      screen.getByText(/other sessions are signed out/i),
    ).toBeInTheDocument();
    expect(screen.queryByText(/mockup/i)).not.toBeInTheDocument();
  });
});
