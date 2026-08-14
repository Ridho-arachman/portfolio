import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  type AdminProfile,
  type AdminSite,
  type AdminSocials,
  type AdminSettings,
  SEED_SETTINGS,
} from "./constants";

interface SettingsStore {
  settings: AdminSettings;
  updateProfile: (profile: AdminProfile) => void;
  updateSocials: (socials: AdminSocials) => void;
  updateSite: (site: AdminSite) => void;
  reset: () => void;
}

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      settings: SEED_SETTINGS,

      updateProfile: (profile) =>
        set((state) => ({ settings: { ...state.settings, profile } })),

      updateSocials: (socials) =>
        set((state) => ({ settings: { ...state.settings, socials } })),

      updateSite: (site) =>
        set((state) => ({ settings: { ...state.settings, site } })),

      reset: () => set({ settings: SEED_SETTINGS }),
    }),
    {
      name: "admin-settings",
    },
  ),
);
