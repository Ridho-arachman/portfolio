import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";

import { renderWithQuery } from "@/test-fixtures/render";
import type { AdminCertificateWithRelations } from "./constants";
import { CertificateForm } from "./certificate-form";

const ISO_ISSUE = "2024-03-15T00:00:00.000Z";
const ISO_EXPIRY = "2026-03-15T00:00:00.000Z";

const existing: AdminCertificateWithRelations = {
  id: "c1",
  slug: "aws-certified",
  title: "AWS Certified",
  issuer: "Amazon Web Services",
  thumbnail: "https://images.example.com/cover.jpg",
  gallery: [],
  credentialId: "AWS-1",
  credentialUrl: "https://aws.amazon.com/certification",
  issueDate: ISO_ISSUE,
  expiryDate: null,
  skills: ["AWS"],
  summary: ["Passed the exam"],
  order: 0,
  isPublished: true,
  createdAt: ISO_ISSUE,
  updatedAt: ISO_ISSUE,
  translations: null,
  projects: [],
  experiences: [],
};

const save = () => screen.getByRole("button", { name: /save certificate/i });

describe("CertificateForm in edit mode", () => {
  it("submits without the admin retyping a value the API discards", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithQuery(
      <CertificateForm
        mode="edit"
        initialData={existing}
        isLoading={false}
        onSubmit={onSubmit}
      />,
    );

    await user.click(save());

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    const payload = onSubmit.mock.calls[0][0];
    expect(payload).not.toHaveProperty("period");
    expect(payload.issueDate).toBe("2024-03-15");
    expect(payload.expiryDate).toBe("");
  });

  it("prefills both date inputs in the native YYYY-MM-DD format", () => {
    renderWithQuery(
      <CertificateForm
        mode="edit"
        initialData={{ ...existing, expiryDate: ISO_EXPIRY }}
        isLoading={false}
        onSubmit={vi.fn()}
      />,
    );

    expect(screen.getByLabelText("Issue Date")).toHaveValue("2024-03-15");
    expect(screen.getByLabelText("Expiry Date (optional)")).toHaveValue("2026-03-15");
  });

  it("sends a cleared expiryDate so the API nulls the column", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithQuery(
      <CertificateForm
        mode="edit"
        initialData={{ ...existing, expiryDate: ISO_EXPIRY }}
        isLoading={false}
        onSubmit={onSubmit}
      />,
    );

    await user.clear(screen.getByLabelText("Expiry Date (optional)"));
    await user.click(save());

    await waitFor(() => expect(onSubmit).toHaveBeenCalled());
    expect(onSubmit.mock.calls[0][0].expiryDate).toBe("");
  });

  it("blocks submit when the issue date is missing", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithQuery(<CertificateForm mode="edit" initialData={existing} isLoading={false} onSubmit={onSubmit} />);

    await user.clear(screen.getByLabelText("Issue Date"));
    await user.click(save());

    await waitFor(() =>
      expect(screen.getByText("Enter a valid date")).toBeInTheDocument(),
    );
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it("rejects a javascript: credentialUrl before it can be saved", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();
    renderWithQuery(
      <CertificateForm
        mode="edit"
        initialData={existing}
        isLoading={false}
        onSubmit={onSubmit}
      />,
    );

    const field = screen.getByLabelText("Credential URL (optional)");
    await user.clear(field);
    await user.type(field, "javascript:alert(1)");
    await user.click(save());

    await waitFor(() => expect(onSubmit).not.toHaveBeenCalled());
    expect(screen.getByText("Enter a valid URL")).toBeInTheDocument();
  });
});
