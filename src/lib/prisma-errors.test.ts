import { describe, expect, it } from "vitest";
import { describePrismaError, handleApiError } from "@/lib/prisma-errors";

/** Fake a Prisma request error by its P-code (duck-typed like the real client). */
function prismaError(code: string): unknown {
  return { code, name: "PrismaClientKnownRequestError" };
}

describe("describePrismaError", () => {
  it("maps P2002 unique constraint to a 409 conflict", () => {
    const result = describePrismaError(prismaError("P2002"), "Project");
    expect(result).toEqual({
      message: "Project with the same value already exists",
      status: 409,
    });
  });

  // Override dipakai route yang nilai uniknya bisa masih dipegang baris
  // soft-deleted, supaya 409-nya menyuruh ke trash.
  it("lets the caller override the P2002 message", () => {
    const result = describePrismaError(
      prismaError("P2002"),
      "Project",
      "This value is still held by a trashed Project.",
    );
    expect(result).toEqual({
      message: "This value is still held by a trashed Project.",
      status: 409,
    });
  });

  it("maps P2025 record-not-found to a 404", () => {
    const result = describePrismaError(prismaError("P2025"), "Category");
    expect(result).toEqual({ message: "Category not found", status: 404 });
  });

  it("maps P2003 foreign-key violation to a 409", () => {
    const result = describePrismaError(prismaError("P2003"), "Skill");
    expect(result).toEqual({
      message: "Skill is referenced by other records",
      status: 409,
    });
  });

  it("returns null for unrecognized Prisma codes", () => {
    expect(describePrismaError(prismaError("P9999"), "Project")).toBeNull();
  });

  it("returns null for non-Prisma errors", () => {
    expect(describePrismaError(new Error("boom"), "Project")).toBeNull();
    expect(describePrismaError(null, "Project")).toBeNull();
    expect(describePrismaError(undefined, "Project")).toBeNull();
  });
});

describe("handleApiError", () => {
  it("maps Unauthorized errors to 401", () => {
    const result = handleApiError(new Error("Unauthorized"));
    expect(result).toEqual({ message: "Unauthorized", status: 401 });
  });

  it("uses the entity label for Prisma code errors", () => {
    const result = handleApiError(prismaError("P2025"), "Operation failed", "Experience");
    expect(result).toEqual({ message: "Experience not found", status: 404 });
  });

  it("falls back to a generic 500 that hides internal details", () => {
    const leaky = new Error(
      "Invalid `prisma.project.update()` invocation at db://secret-host:5432",
    );
    const result = handleApiError(leaky, "Project operation failed", "Project");
    expect(result).toEqual({ message: "Project operation failed", status: 500 });
  });

  it("handles non-Error throwables safely", () => {
    const result = handleApiError("string failure", "Request failed");
    expect(result).toEqual({ message: "Request failed", status: 500 });
  });
});
