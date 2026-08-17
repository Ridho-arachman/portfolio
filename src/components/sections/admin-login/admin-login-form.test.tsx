import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";

const mocks = vi.hoisted(() => ({
  push: vi.fn(),
  refresh: vi.fn(),
  signInEmail: vi.fn(),
  signInSocial: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: mocks.push, refresh: mocks.refresh }),
}));

vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: mocks.signInEmail,
      social: mocks.signInSocial,
    },
  },
}));

import { AdminLoginForm } from "./admin-login-form";

describe("AdminLoginForm", () => {
  const passwordInput = () => screen.getByLabelText(/^password$/i);

  beforeEach(() => {
    mocks.push.mockClear();
    mocks.refresh.mockClear();
    mocks.signInEmail.mockReset();
    mocks.signInSocial.mockReset();
  });

  it("renders the login fields", () => {
    render(<AdminLoginForm />);

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(passwordInput()).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /sign in/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for an invalid submission", async () => {
    const user = userEvent.setup();
    render(<AdminLoginForm />);

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText("Please enter a valid email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Password must be at least 8 characters"),
    ).toBeInTheDocument();
  });

  it("toggles password visibility", async () => {
    const user = userEvent.setup();
    render(<AdminLoginForm />);

    expect(passwordInput()).toHaveAttribute("type", "password");

    await user.click(screen.getByRole("button", { name: /show password/i }));
    expect(passwordInput()).toHaveAttribute("type", "text");

    await user.click(screen.getByRole("button", { name: /hide password/i }));
    expect(passwordInput()).toHaveAttribute("type", "password");
  });

  it("toggles the forgot password note", async () => {
    const user = userEvent.setup();
    render(<AdminLoginForm />);

    expect(screen.queryByText(/fitur lupa password/i)).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: /lupa password/i }));

    expect(screen.getByText(/fitur lupa password/i)).toBeInTheDocument();
  });

  it("signs in and redirects to /admin on valid credentials", async () => {
    const user = userEvent.setup();
    mocks.signInEmail.mockResolvedValue({ data: null, error: null });

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText(/email/i), "admin@ridho.dev");
    await user.type(passwordInput(), "supersecret");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(() => {
      expect(mocks.signInEmail).toHaveBeenCalledWith(
        expect.objectContaining({
          email: "admin@ridho.dev",
          password: "supersecret",
        }),
      );
    });
    expect(mocks.push).toHaveBeenCalledWith("/admin");
  });

  it("shows an error message when sign-in fails", async () => {
    const user = userEvent.setup();
    mocks.signInEmail.mockResolvedValue({
      data: null,
      error: { message: "Invalid email or password" },
    });

    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText(/email/i), "admin@ridho.dev");
    await user.type(passwordInput(), "supersecret");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    expect(
      await screen.findByText(/email atau password salah/i),
    ).toBeInTheDocument();
    expect(mocks.push).not.toHaveBeenCalled();
  });

  it("triggers google social sign-in", async () => {
    const user = userEvent.setup();
    mocks.signInSocial.mockResolvedValue({});

    render(<AdminLoginForm />);

    await user.click(screen.getByRole("button", { name: /google/i }));

    await waitFor(() => {
      expect(mocks.signInSocial).toHaveBeenCalledWith({
        provider: "google",
        callbackURL: "/admin",
      });
    });
  });
});
