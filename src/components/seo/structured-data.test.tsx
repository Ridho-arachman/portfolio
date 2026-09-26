import { describe, expect, it } from "vitest";
import { render } from "@testing-library/react";

import { PublicContentProvider } from "@/components/providers/public-content-provider";
import { testMessages, testSiteSettings } from "@/test-fixtures/public-content";
import { StructuredData } from "./structured-data";

function renderStructuredData(ui: React.ReactNode) {
  return render(
    <PublicContentProvider messages={testMessages} settings={testSiteSettings}>
      {ui}
    </PublicContentProvider>,
  );
}

function readJsonLd(container: HTMLElement) {
  const script = container.querySelector('script[type="application/ld+json"]');
  expect(script).not.toBeNull();
  return JSON.parse(script?.innerHTML ?? "") as Record<string, unknown>;
}

describe("StructuredData", () => {
  it("menanamkan satu script ld+json ke dalam DOM", () => {
    const { container } = renderStructuredData(<StructuredData />);

    expect(
      container.querySelectorAll('script[type="application/ld+json"]'),
    ).toHaveLength(1);
  });

  it("mengisi Person dari site settings, bukan env", () => {
    const { container } = renderStructuredData(<StructuredData />);
    const schema = readJsonLd(container);

    expect(schema["@type"]).toBe("Person");
    expect(schema.name).toBe(testSiteSettings.fullName);
    expect(schema.jobTitle).toBe(testSiteSettings.jobTitle);
    expect(schema.description).toBe(testSiteSettings.bio);
    expect(schema.url).toBe(testSiteSettings.siteUrl);
    expect(schema.image).toBe(`${testSiteSettings.siteUrl}/avatar.png`);
  });

  it("memakai shape yang sama dengan sebelumnya: sameAs, knowsAbout, alumniOf, worksFor", () => {
    const { container } = renderStructuredData(<StructuredData />);
    const schema = readJsonLd(container);

    expect(schema.sameAs).toEqual([
      testSiteSettings.githubUrl,
      testSiteSettings.linkedinUrl,
      testSiteSettings.twitterUrl,
    ]);
    expect(schema.knowsAbout).toContain("Next.js");
    expect(schema.alumniOf).toEqual({
      "@type": "EducationalOrganization",
      name: "Information Systems",
    });
    expect(schema.worksFor).toEqual({
      "@type": "Organization",
      name: "Freelance",
    });
  });

  it("memancarkan WebSite dari prop type", () => {
    const { container } = renderStructuredData(<StructuredData type="WebSite" />);
    const schema = readJsonLd(container);

    expect(schema["@type"]).toBe("WebSite");
    expect(schema.name).toBe(testSiteSettings.siteName);
    expect(schema.alternateName).toBe(testSiteSettings.tagline);
  });

  it("membedak keluar dari nilai settings yang mengandung penutup tag script", () => {
    const hostile = {
      ...testSiteSettings,
      bio: "</script><img src=x onerror=alert(1)>",
    };

    const { container } = render(
      <PublicContentProvider messages={testMessages} settings={hostile}>
        <StructuredData />
      </PublicContentProvider>,
    );

    // `&lt;` di-escape jadi escape sequence JSON, jadi tidak ada tag HTML baru
    // yang muncul dari data.
    expect(container.querySelector("img")).toBeNull();
    expect(readJsonLd(container).description).toBe(hostile.bio);
  });
});
