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
    thumbnail: null,
    gallery: [],
    skills: [],
    summary: [],
    issueDate,
    expiryDate,
    order: 0,
    isPublished: true,
    deletedAt: null,
    createdAt: ISO_ISSUE,
    updatedAt: ISO_ISSUE,
    translations: null,
  };
}

describe("formatMonthYear", () => {
  it("formats an ISO string as returned by a warm unstable_cache", () => {
    expect(formatMonthYear(ISO_ISSUE, "en")).toBe("Mar 2024");
  });

  it("still formats a live Date from a cold cache", () => {
    expect(formatMonthYear(new Date(ISO_ISSUE), "en")).toBe("Mar 2024");
  });

  it("stays in UTC when the server runs behind UTC", () => {
    const original = process.env.TZ;
    process.env.TZ = "America/New_York";
    try {
      expect(formatMonthYear(ISO_ISSUE, "en")).toBe("Mar 2024");
      expect(formatMonthYear("2024-01-01T00:00:00.000Z", "en")).toBe("Jan 2024");
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });
});

describe("mapCertificateToData", () => {
  it("maps a certificate whose issueDate is a string instead of throwing", () => {
    const data = mapCertificateToData(cachedCert(ISO_ISSUE), "en", LABELS);

    expect(data.period).toBe("Issued on Mar 2024");
  });

  it("maps a live Date certificate unchanged", () => {
    const cert = cachedCert(ISO_ISSUE);
    const data = mapCertificateToData(
      { ...cert, issueDate: new Date(ISO_ISSUE) },
      "en",
      LABELS,
    );

    expect(data.period).toBe("Issued on Mar 2024");
  });

  it("formats both dates when expiryDate is also a string", () => {
    const data = mapCertificateToData(
      cachedCert(ISO_ISSUE, ISO_EXPIRY),
      "en",
      LABELS,
    );

    expect(data.period).toBe("Issued on Mar 2024 · Expires on Mar 2026");
  });

  it("formats the period in UTC when the server runs behind UTC", () => {
    const original = process.env.TZ;
    process.env.TZ = "America/New_York";
    try {
      const data = mapCertificateToData(
        cachedCert("2024-01-01T00:00:00.000Z"),
        "en",
        LABELS,
      );

      expect(data.period).toBe("Issued on Jan 2024");
    } finally {
      if (original === undefined) delete process.env.TZ;
      else process.env.TZ = original;
    }
  });

  it("localises the month name for the id locale", () => {
    const data = mapCertificateToData(cachedCert(ISO_ISSUE), "id", LABELS);

    expect(data.period).toBe("Issued on Mar 2024");
  });

  it("gives two cuids distinct identities", () => {
    const a = mapCertificateToData(cachedCert(ISO_ISSUE), "en", LABELS);
    const b = mapCertificateToData(
      { ...cachedCert(ISO_ISSUE), id: "c2", slug: "gcp-cloud" },
      "en",
      LABELS,
    );

    expect(a.slug).toBe("aws-cloud");
    expect(b.slug).toBe("gcp-cloud");
    expect(new Set([a.slug, b.slug]).size).toBe(2);
  });

  it("carries credentialUrl through, so no caller has to re-add it", () => {
    const data = mapCertificateToData(
      { ...cachedCert(ISO_ISSUE), credentialUrl: "https://verify.example/aws" },
      "en",
      LABELS,
    );

    expect(data.credentialUrl).toBe("https://verify.example/aws");
  });
});
