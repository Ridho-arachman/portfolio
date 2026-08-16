import { beforeEach, describe, expect, it } from "vitest";
import { useSettingsStore } from "./settings-store";
import { SEED_SETTINGS } from "./constants";

describe("settings store", () => {
  beforeEach(() => {
    localStorage.clear();
    useSettingsStore.setState({ settings: SEED_SETTINGS });
  });

  it("seeds settings from constants", () => {
    const settings = useSettingsStore.getState().settings;
    expect(settings.profile.fullName).toBe(SEED_SETTINGS.profile.fullName);
    expect(settings.site.siteName).toBe(SEED_SETTINGS.site.siteName);
  });

  it("updates the profile without touching other sections", () => {
    const profile = {
      ...SEED_SETTINGS.profile,
      title: "Senior Web Developer",
    };
    useSettingsStore.getState().updateProfile(profile);

    const settings = useSettingsStore.getState().settings;
    expect(settings.profile.title).toBe("Senior Web Developer");
    expect(settings.site.tagline).toBe(SEED_SETTINGS.site.tagline);
    expect(settings.socials.github).toBe(SEED_SETTINGS.socials.github);
  });

  it("updates the socials", () => {
    const socials = { ...SEED_SETTINGS.socials, github: "https://github.com/updated" };
    useSettingsStore.getState().updateSocials(socials);

    expect(useSettingsStore.getState().settings.socials.github).toBe(
      "https://github.com/updated",
    );
  });

  it("updates the site settings", () => {
    const site = { siteName: "New Site", tagline: "New Tagline" };
    useSettingsStore.getState().updateSite(site);

    expect(useSettingsStore.getState().settings.site).toEqual(site);
  });

  it("resets to the seed settings", () => {
    useSettingsStore
      .getState()
      .updateProfile({ ...SEED_SETTINGS.profile, title: "Changed" });
    useSettingsStore.getState().reset();

    expect(useSettingsStore.getState().settings).toEqual(SEED_SETTINGS);
  });
});
