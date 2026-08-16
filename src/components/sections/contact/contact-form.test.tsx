import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import { ContactForm } from "./contact-form";

describe("ContactForm", () => {
  it("renders the form fields", () => {
    render(<ContactForm />);

    expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/subject/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/message/i)).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /send message/i }),
    ).toBeInTheDocument();
  });

  it("shows validation errors for an invalid submission", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText("Name must be at least 2 characters", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Please enter a valid email address"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Subject must be at least 3 characters"),
    ).toBeInTheDocument();
    expect(
      screen.getByText("Message must be at least 10 characters"),
    ).toBeInTheDocument();
  });

  it("flags invalid email while valid fields pass", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "Ridho Arachman");
    await user.type(screen.getByLabelText(/subject/i), "Project Inquiry");
    await user.type(
      screen.getByLabelText(/message/i),
      "Hello, I have a project for you.",
    );
    await user.type(screen.getByLabelText(/email/i), "not-an-email");

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText("Please enter a valid email address", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(
      screen.queryByText("Name must be at least 2 characters"),
    ).not.toBeInTheDocument();
  });

  it("shows a success message after a valid submission", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "Ridho Arachman");
    await user.type(screen.getByLabelText(/email/i), "ridho@example.com");
    await user.type(screen.getByLabelText(/subject/i), "Project Inquiry");
    await user.type(
      screen.getByLabelText(/message/i),
      "Hello, I have a project for you.",
    );

    await user.click(screen.getByRole("button", { name: /send message/i }));

    expect(
      await screen.findByText("Message sent!", {}, { timeout: 5000 }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/thank you for reaching out/i),
    ).toBeInTheDocument();
  });

  it("resets the form after sending another message", async () => {
    const user = userEvent.setup();
    render(<ContactForm />);

    await user.type(screen.getByLabelText(/name/i), "Ridho Arachman");
    await user.type(screen.getByLabelText(/email/i), "ridho@example.com");
    await user.type(screen.getByLabelText(/subject/i), "Project Inquiry");
    await user.type(
      screen.getByLabelText(/message/i),
      "Hello, I have a project for you.",
    );
    await user.click(screen.getByRole("button", { name: /send message/i }));

    await user.click(
      await screen.findByRole(
        "button",
        { name: /send another message/i },
        { timeout: 5000 },
      ),
    );

    await waitFor(
      () => {
        expect(
          screen.getByRole("button", { name: /send message/i }),
        ).toBeInTheDocument();
      },
      { timeout: 5000 },
    );
    expect(screen.getByLabelText<HTMLInputElement>(/name/i).value).toBe("");
  });
});
