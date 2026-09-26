import { describe, expect, it } from "vitest";

import { formatMonthYear, mapCertificateToData } from "./constants";

const LABELS = { issued: "Issued on", expires: "Expires on" };
const ISO_ISSUE = "2024-03-15T00:00:00.000Z";
const ISO_EXPIRY = "2026-03-15T00:00:00.000Z";

// unstable_cache persists query results as JSON, so Date columns come back as
// ISO strings on a cache hit even though Prisma types them as Date.
function cachedCert(issueDate: string, expiryDate: string | null = null) {
  return {
    id: "c1",
    slug: "aws-cloud",
    title: "AWS Certified",
    issuer: "Amazon Web Services",
    credentialId: null,
    credentialUrl: null,
    logoUrl: null,
    thumbnail: null,
    gallery: [],
    skills: [],
    summary: [],
    issueDate,
    expiryDate,
    order: 0,
    isPublished: true,
    createdAt: ISO_ISSUE,
    updatedAt: ISO_ISSUE,
  };
}

describe("formatMonthYear", () => {
  it("formats an ISO string as returned by a warm unstable_cache", () => {
    expect(formatMonthYear(ISO_ISSUE, "en")).toBe("Mar 2024");
  });

  it("still formats a live Date from a cold cache", () => {
    expect(formatMonthYear(new Date(ISO_ISSUE), "en")).toBe("Mar 2024");
  });
});

describe("mapCertificateToData with warm cache dates", () => {
  it("maps a certificate whose issueDate is a string instead of throwing", () => {
    const data = mapCertificateToData(cachedCert(ISO_ISSUE), "en", LABELS);

    expect(data.issueDate).toBe("Mar 2024");
    expect(data.period).toBe("Issued on Mar 2024");
  });

  it("maps a live Date certificate unchanged", () => {
    const cert = cachedCert(ISO_ISSUE);
    const data = mapCertificateToData(
      { ...cert, issueDate: new Date(ISO_ISSUE) },
      "en",
      LABELS,
    );

    expect(data.issueDate).toBe("Mar 2024");
  });

  it("formats both dates when expiryDate is also a string", () => {
    const data = mapCertificateToData(
      cachedCert(ISO_ISSUE, ISO_EXPIRY),
      "en",
      LABELS,
    );

    expect(data.period).toBe("Issued on Mar 2024 · Expires on Mar 2026");
  });

  it("localises the month name for the id locale", () => {
    const data = mapCertificateToData(cachedCert(ISO_ISSUE), "id", LABELS);

    expect(data.issueDate).toBe("Mar 2024");
  });
});
