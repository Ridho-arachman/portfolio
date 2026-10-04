import { describe, expect, it } from "vitest";

import { formatCertificatePeriod, toDateInputValue } from "./constants";

const ISO_ISSUE = "2024-03-15T00:00:00.000Z";
const ISO_EXPIRY = "2026-03-15T00:00:00.000Z";

describe("toDateInputValue", () => {
  it("trims a Prisma ISO timestamp to the native date format", () => {
    expect(toDateInputValue(ISO_ISSUE)).toBe("2024-03-15");
  });

  it("returns an empty string for a null date so the input clears", () => {
    expect(toDateInputValue(null)).toBe("");
  });
});

describe("formatCertificatePeriod", () => {
  it("shows only the issue date when the certificate never expires", () => {
    expect(formatCertificatePeriod(ISO_ISSUE, null)).toBe("Issued on Mar 2024");
  });

  it("shows both dates when the certificate expires", () => {
    expect(formatCertificatePeriod(ISO_ISSUE, ISO_EXPIRY)).toBe(
      "Issued on Mar 2024 · Expires on Mar 2026",
    );
  });

  it("accepts a bare YYYY-MM-DD date from the admin API", () => {
    expect(formatCertificatePeriod(ISO_ISSUE.slice(0, 10), null)).toBe(
      "Issued on Mar 2024",
    );
  });
});
