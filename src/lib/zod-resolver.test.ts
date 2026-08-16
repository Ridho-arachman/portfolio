import { describe, expect, it } from "vitest";
import { z } from "zod";
import { zodResolver } from "@/lib/zod-resolver";

const schema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  email: z.string().email("Enter a valid email address"),
});

describe("zodResolver", () => {
  it("returns values when validation passes", () => {
    const resolver = zodResolver(schema);
    const result = resolver({ name: "Ridho", email: "ridho@example.com" });

    expect(result.values).toEqual({
      name: "Ridho",
      email: "ridho@example.com",
    });
    expect(result.errors).toEqual({});
  });

  it("maps field errors to react-hook-form error shape", () => {
    const resolver = zodResolver(schema);
    const result = resolver({ name: "ab", email: "not-an-email" });

    expect(result.errors).toHaveProperty("name");
    expect(result.errors.name?.message).toBe(
      "Name must be at least 3 characters",
    );
    expect(result.errors).toHaveProperty("email");
    expect(result.errors.email?.message).toBe(
      "Enter a valid email address",
    );
  });

  it("keeps the first error per field for nested paths", () => {
    const nested = z.object({
      user: z.object({
        age: z.coerce.number().int().min(18).max(99),
      }),
    });
    const result = zodResolver(nested)({ user: { age: "abc" } });

    expect(result.errors).toHaveProperty("user.age");
  });

  it("collects multiple field errors from one parse", () => {
    const result = zodResolver(schema)({});

    expect(Object.keys(result.errors)).toEqual(
      expect.arrayContaining(["name", "email"]),
    );
    expect(result.values).toEqual({});
  });
});
