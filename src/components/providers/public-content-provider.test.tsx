import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import type { Messages } from "@/lib/translation-types";
import {
  PublicContentProvider,
  useMessages,
  usePublicContent,
  useSiteSettings,
} from "./public-content-provider";
import { testMessages, testSiteSettings } from "@/test-fixtures/public-content";

function Probe() {
  const { messages, settings } = usePublicContent();
  const t = useMessages();
  const s = useSiteSettings();

  return (
    <div>
      <span data-testid="hero-title">{t.hero.title}</span>
      <span data-testid="hero-greeting">{t.hero.greeting}</span>
      <span data-testid="footer-tagline">{t.footer.tagline}</span>
      <span data-testid="settings-job-title">{s.jobTitle}</span>
      <span data-testid="settings-quick-links">{s.quickLinks.join(",")}</span>
      <span data-testid="same-messages">{String(messages === t)}</span>
      <span data-testid="same-settings">{String(settings === s)}</span>
    </div>
  );
}

function renderInsideProvider(ui: React.ReactNode) {
  return render(
    <PublicContentProvider messages={testMessages} settings={testSiteSettings}>
      {ui}
    </PublicContentProvider>,
  );
}

describe("PublicContentProvider", () => {
  it("menyediakan messages dan settings ke consumer", () => {
    renderInsideProvider(<Probe />);

    expect(screen.getByTestId("hero-title")).toHaveTextContent(
      testSiteSettings.jobTitle,
    );
    expect(screen.getByTestId("hero-greeting")).toHaveTextContent(
      "Hi, I'm Ridho Arachman",
    );
    expect(screen.getByTestId("footer-tagline")).toHaveTextContent(
      testSiteSettings.tagline,
    );
    expect(screen.getByTestId("settings-job-title")).toHaveTextContent(
      testSiteSettings.jobTitle,
    );
  });

  it("ketiga hook membaca object context yang sama", () => {
    renderInsideProvider(<Probe />);

    expect(screen.getByTestId("same-messages")).toHaveTextContent("true");
    expect(screen.getByTestId("same-settings")).toHaveTextContent("true");
  });

  it("useSiteSettings mengembalikan nilai persis yang diberikan", () => {
    renderInsideProvider(<Probe />);

    expect(screen.getByTestId("settings-job-title")).toHaveTextContent(
      testSiteSettings.jobTitle,
    );
    expect(screen.getByTestId("settings-quick-links")).toHaveTextContent(
      testSiteSettings.quickLinks.join(","),
    );
  });

  it("useMessages passthrough: tidak merge ulang dari settings", () => {
    // Field di sini sengaja BERBEDA dari settings. Kalau provider sempat merge
    // ulang, nilai settings yang akan menang dan test ini gagal.
    const overlaid: Messages = {
      ...testMessages,
      hero: { ...testMessages.hero, title: "Judul dari server" },
      footer: { ...testMessages.footer, tagline: "Tagline dari server" },
    };

    render(
      <PublicContentProvider messages={overlaid} settings={testSiteSettings}>
        <Probe />
      </PublicContentProvider>,
    );

    expect(screen.getByTestId("hero-title")).toHaveTextContent("Judul dari server");
    expect(screen.getByTestId("footer-tagline")).toHaveTextContent(
      "Tagline dari server",
    );
    expect(screen.getByTestId("hero-title")).not.toHaveTextContent(
      testSiteSettings.jobTitle,
    );
    expect(screen.getByTestId("footer-tagline")).not.toHaveTextContent(
      testSiteSettings.tagline,
    );
  });

  it("useMessages lempar di luar provider", () => {
    function Bare() {
      return <span>{useMessages().seo.defaultTitle}</span>;
    }

    expect(() => render(<Bare />)).toThrow(
      "usePublicContent must be used within <PublicContentProvider>",
    );
  });

  it("useSiteSettings lempar di luar provider", () => {
    function Bare() {
      return <span>{useSiteSettings().siteName}</span>;
    }

    expect(() => render(<Bare />)).toThrow(
      "usePublicContent must be used within <PublicContentProvider>",
    );
  });
});
