import { beforeEach, describe, expect, it } from "vitest";
import { useCertificateStore } from "./certificate-store";
import { SEED_CERTIFICATES } from "./constants";

const newCertificate = {
  slug: "test-certificate",
  title: "Test Certificate",
  issuer: "Test Org",
  issueDate: "March 2026",
  period: "Issued Mar 2026",
  thumbnail: "https://images.example.com/cover.jpg",
  skills: ["Testing"],
  summary: ["A certificate created during a unit test."],
  isPublished: true,
  order: 0,
};

describe("certificate store", () => {
  beforeEach(() => {
    localStorage.clear();
    useCertificateStore.setState({ certificates: SEED_CERTIFICATES });
  });

  it("seeds certificates from constants", () => {
    expect(useCertificateStore.getState().certificates).toHaveLength(
      SEED_CERTIFICATES.length,
    );
  });

  it("adds a certificate", () => {
    useCertificateStore.getState().addCertificate(newCertificate);

    const added = useCertificateStore
      .getState()
      .certificates.find((c) => c.slug === newCertificate.slug);
    expect(added).toBeDefined();
    expect(added?.id).toBeTruthy();
    expect(added?.createdAt).toBeTruthy();
  });

  it("updates a certificate", () => {
    const id = useCertificateStore.getState().certificates[0].id;
    useCertificateStore.getState().updateCertificate(id, {
      ...newCertificate,
      title: "Updated Certificate",
    });

    expect(
      useCertificateStore
        .getState()
        .certificates.find((c) => c.id === id)?.title,
    ).toBe("Updated Certificate");
  });

  it("deletes a certificate", () => {
    const id = useCertificateStore.getState().certificates[0].id;
    useCertificateStore.getState().deleteCertificate(id);

    expect(
      useCertificateStore.getState().certificates.find((c) => c.id === id),
    ).toBeUndefined();
  });

  it("resets to the seed list", () => {
    useCertificateStore.getState().addCertificate(newCertificate);
    useCertificateStore.getState().reset();

    expect(useCertificateStore.getState().certificates).toHaveLength(
      SEED_CERTIFICATES.length,
    );
  });
});
