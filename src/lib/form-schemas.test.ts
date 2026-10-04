import { describe, expect, it } from "vitest";
import { contactFormSchema, createContactFormSchema } from "@/schema/contact";
import enMessages from "@/messages/en.json";
import idMessages from "@/messages/id.json";
import { loginFormSchema } from "@/schema/login";
import { certificateCreateSchema, certificateFormSchema, certificateUpdateSchema } from "@/schema/certificate";
import { experienceFormSchema } from "@/schema/experience";
import {
  categoryCreateSchema,
  categoryFormSchema,
  categoryUpdateSchema,
} from "@/schema/category";
import { projectFormSchema } from "@/schema/project";
import {
  passwordSchema,
  settingsResetSchema,
  settingsUpdateSchema,
  SETTINGS_SECTIONS,
} from "@/schema/settings";

describe("contactFormSchema", () => {
  const valid = {
    name: "Ridho",
    email: "ridho@example.com",
    subject: "Project Inquiry",
    content: "Hello, I have a project for you.",
  };

  it("accepts valid input", () => {
    expect(contactFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects a too-short name", () => {
    const result = contactFormSchema.safeParse({ ...valid, name: "A" });
    expect(result.success).toBe(false);
  });

  it("rejects an invalid email", () => {
    const result = contactFormSchema.safeParse({ ...valid, email: "nope" });
    expect(result.success).toBe(false);
  });

  it("rejects a too-short subject and content", () => {
    expect(
      contactFormSchema.safeParse({ ...valid, subject: "ab" }).success,
    ).toBe(false);
    expect(
      contactFormSchema.safeParse({ ...valid, content: "short" }).success,
    ).toBe(false);
  });

  it("accepts a name with surrounding whitespace as-is", () => {
    const result = contactFormSchema.safeParse({
      ...valid,
      name: "  Ridho  ",
    });
    expect(result.success).toBe(true);
  });
});

describe("createContactFormSchema", () => {
  const valid = {
    name: "Ridho",
    email: "ridho@example.com",
    subject: "Project Inquiry",
    content: "Hello, I have a project for you.",
  };

  it("accepts valid input in both locales", () => {
    expect(
      createContactFormSchema(enMessages.contact.form.validation).safeParse(valid)
        .success,
    ).toBe(true);
    expect(
      createContactFormSchema(idMessages.contact.form.validation).safeParse(valid)
        .success,
    ).toBe(true);
  });

  it("reports the translated strings for each failing field", () => {
    const idValidation = idMessages.contact.form.validation;
    const schema = createContactFormSchema(idValidation);

    const name = schema.safeParse({ ...valid, name: "A" });
    expect(name.success).toBe(false);
    if (!name.success) {
      expect(name.error.issues[0].message).toBe(idValidation.nameRequired);
    }

    const emptyEmail = schema.safeParse({ ...valid, email: "" });
    expect(emptyEmail.success).toBe(false);
    if (!emptyEmail.success) {
      expect(emptyEmail.error.issues[0].message).toBe(idValidation.emailRequired);
    }

    const badEmail = schema.safeParse({ ...valid, email: "nope" });
    expect(badEmail.success).toBe(false);
    if (!badEmail.success) {
      expect(badEmail.error.issues[0].message).toBe(idValidation.emailInvalid);
    }

    const emptyContent = schema.safeParse({ ...valid, content: "" });
    expect(emptyContent.success).toBe(false);
    if (!emptyContent.success) {
      expect(emptyContent.error.issues[0].message).toBe(idValidation.messageRequired);
    }

    const shortContent = schema.safeParse({ ...valid, content: "short" });
    expect(shortContent.success).toBe(false);
    if (!shortContent.success) {
      expect(shortContent.error.issues[0].message).toBe(
        idValidation.messageMinLength,
      );
    }
  });

  it("keeps the English messages byte-identical to the validation namespace", () => {
    const enValidation = enMessages.contact.form.validation;
    const schema = createContactFormSchema(enValidation);

    const badEmail = schema.safeParse({ ...valid, email: "nope" });
    expect(badEmail.success).toBe(false);
    if (!badEmail.success) {
      expect(badEmail.error.issues[0].message).toBe(enValidation.emailInvalid);
    }
  });
});

describe("loginFormSchema", () => {
  it("accepts valid credentials", () => {
    expect(
      loginFormSchema.safeParse({
        email: "admin@ridho.dev",
        password: "supersecret",
      }).success,
    ).toBe(true);
  });

  it("rejects invalid email", () => {
    expect(
      loginFormSchema.safeParse({
        email: "not-an-email",
        password: "supersecret",
      }).success,
    ).toBe(false);
  });

  it("rejects a short password", () => {
    expect(
      loginFormSchema.safeParse({
        email: "admin@ridho.dev",
        password: "short",
      }).success,
    ).toBe(false);
  });
});

describe("certificateFormSchema", () => {
  const valid = {
    title: "AWS Certified Cloud Practitioner",
    slug: "aws-certified-cloud-practitioner",
    issuer: "Amazon Web Services",
    issueDate: "2024-03-15",
    expiryDate: "",
    thumbnail: "https://images.example.com/cover.jpg",
    skills: "Cloud Computing, AWS",
    summary: "Passed the practitioner exam",
    isPublished: true,
    order: 1,
    gallery: [],
    projectIds: ["p1"],
    experienceIds: [],
  };

  it("accepts valid input", () => {
    expect(certificateFormSchema.safeParse(valid).success).toBe(true);
  });

  it("drops a period key instead of pretending to save it", () => {
    const parsed = certificateFormSchema.safeParse({
      ...valid,
      period: "Issued Mar 2024 · No Expiration",
    });

    expect(parsed.success).toBe(true);
    expect(parsed.data).not.toHaveProperty("period");
  });

  it("rejects an invalid slug", () => {
    expect(
      certificateFormSchema.safeParse({ ...valid, slug: "Uppercase Slug!" })
        .success,
    ).toBe(false);
  });

  it("rejects a non-URL thumbnail", () => {
    expect(
      certificateFormSchema.safeParse({ ...valid, thumbnail: "not-a-url" })
        .success,
    ).toBe(false);
  });

  it("accepts empty optional credential fields", () => {
    expect(
      certificateFormSchema.safeParse({ ...valid, credentialId: "", credentialUrl: "" })
        .success,
    ).toBe(true);
  });

  it("rejects a summary without any line", () => {
    expect(
      certificateFormSchema.safeParse({ ...valid, summary: "   \n   " }).success,
    ).toBe(false);
  });

  it("rejects an issueDate the API could not turn into a real date", () => {
    for (const issueDate of ["", "soon", "2024-13-45"]) {
      expect(
        certificateFormSchema.safeParse({ ...valid, issueDate }).success,
      ).toBe(false);
    }
  });

  it("treats an empty expiryDate as never expiring", () => {
    expect(
      certificateFormSchema.safeParse({ ...valid, expiryDate: "" }).success,
    ).toBe(true);
  });

  it("rejects an unparseable expiryDate", () => {
    expect(
      certificateFormSchema.safeParse({ ...valid, expiryDate: "soon" }).success,
    ).toBe(false);
  });

  it("accepts http and https credentialUrl values", () => {
    for (const credentialUrl of [
      "https://aws.amazon.com/certification",
      "http://example.com/verify",
    ]) {
      expect(
        certificateFormSchema.safeParse({ ...valid, credentialUrl }).success,
      ).toBe(true);
    }
  });

  it("rejects javascript: and data: credentialUrl values", () => {
    for (const credentialUrl of [
      "javascript:alert(1)",
      "JavaScript:alert(1)",
      "data:text/html,<script>alert(1)</script>",
    ]) {
      expect(
        certificateFormSchema.safeParse({ ...valid, credentialUrl }).success,
      ).toBe(false);
    }
  });

  it("rejects javascript: and data: thumbnails", () => {
    for (const thumbnail of ["javascript:alert(1)", "data:image/svg+xml,<svg/>"]) {
      expect(
        certificateFormSchema.safeParse({ ...valid, thumbnail }).success,
      ).toBe(false);
    }
  });

  it("guards the server schemas, not just the form", () => {
    for (const credentialUrl of ["javascript:alert(1)", "data:text/html,x"]) {
      expect(
        certificateCreateSchema.safeParse({ ...valid, credentialUrl }).success,
      ).toBe(false);
      expect(
        certificateUpdateSchema.safeParse({ credentialUrl }).success,
      ).toBe(false);
    }
  });

  it("rejects a garbage issueDate on the server too", () => {
    expect(
      certificateCreateSchema.safeParse({
        title: valid.title,
        issuer: valid.issuer,
        issueDate: "soon",
        skills: [],
        summary: [],
        isPublished: true,
        order: 1,
      }).success,
    ).toBe(false);
  });
});

describe("experienceFormSchema", () => {
  const valid = {
    role: "Frontend Developer Intern",
    slug: "frontend-developer-intern",
    company: "PT Tech Startup Indonesia",
    type: "WORK",
    period: "Jan 2024 - Present",
    location: "Jakarta, Indonesia (Remote)",
    thumbnail: "https://images.example.com/cover.jpg",
    gallery: [],
    description: "Built the marketing landing page",
    order: 0,
    projectIds: [],
    certificateIds: ["c1"],
  };

  it("accepts valid input", () => {
    expect(experienceFormSchema.safeParse(valid).success).toBe(true);
  });

  it("rejects an unknown type", () => {
    expect(
      experienceFormSchema.safeParse({ ...valid, type: "Unknown" }).success,
    ).toBe(false);
  });

  it("rejects a gallery entry that is not a string", () => {
    expect(
      experienceFormSchema.safeParse({
        ...valid,
        gallery: [42],
      }).success,
    ).toBe(false);
  });

  it("accepts a gallery of image URLs", () => {
    expect(
      experienceFormSchema.safeParse({
        ...valid,
        gallery: [
          "https://images.example.com/1.jpg",
          "https://images.example.com/2.jpg",
        ],
      }).success,
    ).toBe(true);
  });

  it("rejects a description with no content", () => {
    expect(
      experienceFormSchema.safeParse({ ...valid, description: "   " }).success,
    ).toBe(false);
  });
});

describe("categoryFormSchema", () => {
  const valid = {
    name: "Web Development",
    slug: "web-dev",
    description: "Sites",
    order: 0,
  };

  it("accepts valid input without Indonesian fields", () => {
    expect(categoryFormSchema.safeParse(valid).success).toBe(true);
  });

  it("accepts optional Indonesian name and description", () => {
    expect(
      categoryFormSchema.safeParse({
        ...valid,
        idName: "Pengembangan Web",
        idDescription: "Situs",
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid slug", () => {
    expect(
      categoryFormSchema.safeParse({ ...valid, slug: "Uppercase Slug!" }).success,
    ).toBe(false);
  });
});

describe("categoryCreateSchema/categoryUpdateSchema", () => {
  it("carries the translations payload for the Json column", () => {
    const translations = { id: { name: "Pengembangan Web" } };
    expect(
      categoryCreateSchema.safeParse({
        name: "Web Development",
        order: 0,
        translations,
      }),
    ).toEqual({
      success: true,
      data: { name: "Web Development", order: 0, translations },
    });
    expect(
      categoryUpdateSchema.safeParse({ translations }).success,
    ).toBe(true);
  });

  it("rejects a mistyped translations payload", () => {
    expect(
      categoryUpdateSchema.safeParse({ translations: { id: { name: 42 } } })
        .success,
    ).toBe(false);
  });
});

describe("projectFormSchema", () => {
  const valid = {
    title: "Web3 Portfolio Platform",
    slug: "web3-portfolio",
    description: "A portfolio built with Web3 tooling.",
    thumbnail: "https://images.example.com/cover.jpg",
    technologies: "Next.js, Tailwind",
    gallery: [],
    categoryId: "cat-1",
    certificateIds: [],
    experienceIds: [],
    isPublished: true,
    order: 0,
  };

  it("accepts optional Indonesian role and highlights", () => {
    expect(
      projectFormSchema.safeParse({
        ...valid,
        idRole: "Frontend Developer",
        idHighlights: "Merilis ke produksi",
      }).success,
    ).toBe(true);
  });

  // `categoryId` NOT NULL di DB, jadi form juga harus mewajibkannya — kalau
  // tidak, payload create akan ditolak API dengan pesan yang tidak membantu.
  it("requires a category", () => {
    expect(projectFormSchema.safeParse({ ...valid, categoryId: "" }).success).toBe(
      false,
    );
    expect(
      projectFormSchema.safeParse({ ...valid, categoryId: undefined }).success,
    ).toBe(false);
  });

  it("rejects an empty id inside a relation list", () => {
    expect(
      projectFormSchema.safeParse({ ...valid, certificateIds: [""] }).success,
    ).toBe(false);
  });
});

describe("passwordSchema", () => {
  it("accepts matching passwords of sufficient length", () => {
    expect(
      passwordSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "newpassword123",
        confirmPassword: "newpassword123",
      }).success,
    ).toBe(true);
  });

  it("rejects mismatched confirmation", () => {
    expect(
      passwordSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "newpassword123",
        confirmPassword: "different",
      }).success,
    ).toBe(false);
  });

  it("rejects a new password shorter than 8 characters", () => {
    expect(
      passwordSchema.safeParse({
        currentPassword: "oldpass",
        newPassword: "short",
        confirmPassword: "short",
      }).success,
    ).toBe(false);
  });
});

describe("settingsUpdateSchema", () => {
  it("accepts every canonical nav key in a subset, in any order", () => {
    expect(
      settingsUpdateSchema.safeParse({ quickLinks: ["contact", "home"] }).success,
    ).toBe(true);
  });

  it("rejects a nav key outside the canonical six", () => {
    expect(settingsUpdateSchema.safeParse({ quickLinks: ["pricing"] }).success).toBe(false);
  });

  it("rejects a blank value so an empty field can never reach the DB", () => {
    expect(settingsUpdateSchema.safeParse({ profile: { fullName: "   " } }).success).toBe(
      false,
    );
  });

  it("treats every group as optional so one section can be saved alone", () => {
    expect(settingsUpdateSchema.safeParse({}).success).toBe(true);
  });

  it("treats blank optional URLs as unset (NULL) instead of rejecting the form", () => {
    expect(
      settingsUpdateSchema.safeParse({ socials: { githubUrl: "" } }),
    ).toEqual({
      success: true,
      data: { socials: { githubUrl: null } },
    });
    expect(
      settingsUpdateSchema.safeParse({
        socials: { instagramUrl: "https://instagram.com/ada" },
      }).success,
    ).toBe(true);
  });
});

describe("settingsResetSchema", () => {
  it("defaults to resetting every section when section is omitted", () => {
    expect(settingsResetSchema.parse(undefined)).toEqual({});
    expect(settingsResetSchema.parse({})).toEqual({});
  });

  it("accepts each of the four sections", () => {
    for (const section of SETTINGS_SECTIONS) {
      expect(settingsResetSchema.parse({ section })).toEqual({ section });
    }
  });

  it("rejects an unknown section", () => {
    expect(settingsResetSchema.safeParse({ section: "security" }).success).toBe(false);
  });
});

