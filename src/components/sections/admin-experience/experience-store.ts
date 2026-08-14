import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SEED_EXPERIENCES,
  type AdminExperience,
} from "./constants";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `exp_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

interface ExperienceStore {
  experiences: AdminExperience[];
  addExperience: (
    data: Omit<AdminExperience, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateExperience: (
    id: string,
    data: Omit<AdminExperience, "id" | "createdAt" | "updatedAt">,
  ) => void;
  deleteExperience: (id: string) => void;
  reset: () => void;
}

export const useExperienceStore = create<ExperienceStore>()(
  persist(
    (set, get) => ({
      experiences: SEED_EXPERIENCES,

      addExperience: (data) => {
        const now = new Date().toISOString();
        const experience: AdminExperience = {
          ...data,
          id: createId(),
          createdAt: now,
          updatedAt: now,
        };
        set({ experiences: [...get().experiences, experience] });
      },

      updateExperience: (id, data) => {
        const now = new Date().toISOString();
        set({
          experiences: get().experiences.map((experience) =>
            experience.id === id
              ? { ...experience, ...data, updatedAt: now }
              : experience,
          ),
        });
      },

      deleteExperience: (id) => {
        set({
          experiences: get().experiences.filter((e) => e.id !== id),
        });
      },

      reset: () => set({ experiences: SEED_EXPERIENCES }),
    }),
    {
      name: "admin-experience",
    },
  ),
);
