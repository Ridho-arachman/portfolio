"use client";

import { createContext, useContext, type ReactNode } from "react";
import type { SiteSettings } from "@/lib/settings";
import type { Messages } from "@/lib/translation-types";

export interface PublicContentValue {
  messages: Messages;
  settings: SiteSettings;
}

const PublicContentContext = createContext<PublicContentValue | null>(null);

/**
 * Satu context untuk dua nilai sekaligus: payload RSC lalu direbut satu kali
 * di batas serialisasi, dan hanya satu tingkat nesting.
 *
 * `messages` harus sudah dioverlay di server (lihat `composePublicContent`) —
 * provider ini passthrough murni, tidak pernah merge ulang.
 */
export function PublicContentProvider({
  messages,
  settings,
  children,
}: PublicContentValue & { children: ReactNode }) {
  return (
    <PublicContentContext.Provider value={{ messages, settings }}>
      {children}
    </PublicContentContext.Provider>
  );
}

/**
 * Throw, bukan fallback ke dokumen bawaan. Halaman publik selalu punya settings
 * dari server, jadi context null berarti provider tidak terpasang — fallback
 * diam-diam akan mengirim English di halaman yang harusnya Indonesia, tanpa
 * satu pun sinyal di console.
 */
export function usePublicContent(): PublicContentValue {
  const context = useContext(PublicContentContext);
  if (!context) {
    throw new Error("usePublicContent must be used within <PublicContentProvider>");
  }
  return context;
}

export function useMessages(): Messages {
  return usePublicContent().messages;
}

export function useSiteSettings(): SiteSettings {
  return usePublicContent().settings;
}
