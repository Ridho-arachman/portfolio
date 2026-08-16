import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

import { AdminLoginForm } from "./admin-login-form";

describe("AdminLoginForm", () => {
  const passwordInput = () => screen.getByLabelText(/^password$/i);

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

    await user.click(screen.getByRole("button", { name: /forgot password/i }));

    expect(screen.getByText(/fitur lupa password/i)).toBeInTheDocument();
  });

  it("shows success state after valid credentials", async () => {
    const user = userEvent.setup();
    render(<AdminLoginForm />);

    await user.type(screen.getByLabelText(/email/i), "admin@ridho.dev");
    await user.type(passwordInput(), "supersecret");

    await user.click(screen.getByRole("button", { name: /sign in/i }));

    await waitFor(
      () => {
        expect(screen.getByText("Login berhasil!")).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
  });
});
