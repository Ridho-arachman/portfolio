import { describe, expect, it } from "vitest";
import { contactFormSchema } from "@/schema/contact";
import { loginFormSchema } from "@/schema/login";
import { certificateFormSchema } from "@/schema/certificate";
import { experienceFormSchema } from "@/schema/experience";
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
    issueDate: "March 2024",
    period: "Issued Mar 2024 · No Expiration",
    thumbnail: "https://images.example.com/cover.jpg",
    skills: "Cloud Computing, AWS",
    summary: "Passed the practitioner exam",
    isPublished: true,
    order: 1,
    gallery: [],
  };

  it("accepts valid input", () => {
    expect(certificateFormSchema.safeParse(valid).success).toBe(true);
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
    expect(settingsUpdateSchema.safeParse({ socials: { githubUrl: "" } }).success).toBe(false);
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

