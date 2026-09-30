import { describe, it, expect } from "vitest";
import {
  localizeCertificate,
  localizeExperiences,
  localizeProject,
} from "./localized-content";

const base = {
  title: "Portfolio",
  description: "A Next.js portfolio",
  role: "Fullstack Developer",
  highlights: ["Shipped it"],
};

describe("localizeProject", () => {
  it("memakai override saat locale yang diminta punya isinya", () => {
    const row = {
      ...base,
      translations: {
        id: {
          title: "Portofolio",
          description: "Portofolio Next.js",
          highlights: ["Rilis"],
        },
      },
    };

    expect(localizeProject(row, "id")).toMatchObject({
      title: "Portofolio",
      description: "Portofolio Next.js",
      highlights: ["Rilis"],
    });
  });

  it("FALLBACK: field yang tidak ada di override mewarisi base", () => {
    const row = { ...base, translations: { id: { title: "Portofolio" } } };

    // `role` sengaja tidak ada di override id -> harus tetap base.
    expect(localizeProject(row, "id")).toEqual({ ...base, title: "Portofolio" });
  });

  it("override kosong berarti 'belum diisi', bukan 'hapus copy'", () => {
    const row = {
      ...base,
      translations: { id: { title: "   ", description: "", highlights: [] } },
    };

    expect(localizeProject(row, "id")).toEqual(base);
  });

  it("tidak melempar dan mewarisi base saat kolom JSON rusak", () => {
    const junk = [
      "nope",
      123,
      [],
      { fr: { title: "Bonjour" } },
      { id: { bogus: 1 } },
      { id: { highlights: "bukan array" } },
    ];

    for (const translations of junk) {
      const row = { ...base, translations };
      expect(() => localizeProject(row, "id")).not.toThrow();
      expect(localizeProject(row, "id")).toEqual(base);
    }
  });

  it("mengabaikan override pada DEFAULT_LOCALE karena base sudah EN", () => {
    const row = { ...base, translations: { en: { title: "Harus Diabaikan" } } };
    expect(localizeProject(row, "en")).toEqual(base);
  });

  it("membuang kolom translations dari hasil agar tidak dikirim ke client", () => {
    const row = { ...base, translations: { id: { title: "Portofolio" } } };

    expect(localizeProject(row, "id")).not.toHaveProperty("translations");
    expect(localizeProject(row, "en")).not.toHaveProperty("translations");
  });
});

describe("localizeCertificate", () => {
  it("mengambil summary dari locale yang diminta, title tetap base", () => {
    const row = {
      title: "AWS Certified Cloud Practitioner",
      summary: ["Passed the exam"],
      translations: { id: { summary: ["Lulus ujian"] } },
    };

    const result = localizeCertificate(row, "id");
    expect(result.summary).toEqual(["Lulus ujian"]);
    // Nama sertifikat adalah proper noun, tidak ikut diterjemahkan.
    expect(result.title).toBe("AWS Certified Cloud Practitioner");
  });
});

describe("localizeExperiences", () => {
  it("melokalisasi seluruh array dan mewarisi baris tanpa override", () => {
    const rows = [
      {
        title: "Frontend Intern",
        description: ["Built the UI"],
        translations: { id: { title: "Magang Frontend" } },
      },
      { title: "Committee Chair", description: ["Led the team"], translations: null },
    ];

    expect(localizeExperiences(rows, "id").map((e) => e.title)).toEqual([
      "Magang Frontend",
      "Committee Chair",
    ]);
  });
});
