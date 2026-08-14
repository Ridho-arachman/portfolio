import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SEED_PROJECTS,
  type AdminProject,
} from "./constants";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `proj_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

interface ProjectStore {
  projects: AdminProject[];
  addProject: (data: Omit<AdminProject, "id" | "createdAt" | "updatedAt">) => void;
  updateProject: (
    id: string,
    data: Omit<AdminProject, "id" | "createdAt" | "updatedAt">,
  ) => void;
  deleteProject: (id: string) => void;
  reset: () => void;
}

export const useProjectStore = create<ProjectStore>()(
  persist(
    (set, get) => ({
      projects: SEED_PROJECTS,

      addProject: (data) => {
        const now = new Date().toISOString();
        const project: AdminProject = {
          ...data,
          id: createId(),
          createdAt: now,
          updatedAt: now,
        };
        set({ projects: [...get().projects, project] });
      },

      updateProject: (id, data) => {
        const now = new Date().toISOString();
        set({
          projects: get().projects.map((project) =>
            project.id === id ? { ...project, ...data, updatedAt: now } : project,
          ),
        });
      },

      deleteProject: (id) => {
        set({ projects: get().projects.filter((p) => p.id !== id) });
      },

      reset: () => set({ projects: SEED_PROJECTS }),
    }),
    {
      name: "admin-projects",
    },
  ),
);
