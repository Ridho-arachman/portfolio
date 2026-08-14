import { create } from "zustand";
import { persist } from "zustand/middleware";
import {
  SEED_CERTIFICATES,
  type AdminCertificate,
} from "./constants";

function createId() {
  return typeof crypto !== "undefined" && "randomUUID" in crypto
    ? crypto.randomUUID()
    : `cert_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

interface CertificateStore {
  certificates: AdminCertificate[];
  addCertificate: (
    data: Omit<AdminCertificate, "id" | "createdAt" | "updatedAt">,
  ) => void;
  updateCertificate: (
    id: string,
    data: Omit<AdminCertificate, "id" | "createdAt" | "updatedAt">,
  ) => void;
  deleteCertificate: (id: string) => void;
  reset: () => void;
}

export const useCertificateStore = create<CertificateStore>()(
  persist(
    (set, get) => ({
      certificates: SEED_CERTIFICATES,

      addCertificate: (data) => {
        const now = new Date().toISOString();
        const certificate: AdminCertificate = {
          ...data,
          id: createId(),
          createdAt: now,
          updatedAt: now,
        };
        set({ certificates: [...get().certificates, certificate] });
      },

      updateCertificate: (id, data) => {
        const now = new Date().toISOString();
        set({
          certificates: get().certificates.map((certificate) =>
            certificate.id === id
              ? { ...certificate, ...data, updatedAt: now }
              : certificate,
          ),
        });
      },

      deleteCertificate: (id) => {
        set({
          certificates: get().certificates.filter((c) => c.id !== id),
        });
      },

      reset: () => set({ certificates: SEED_CERTIFICATES }),
    }),
    {
      name: "admin-certificates",
    },
  ),
);
