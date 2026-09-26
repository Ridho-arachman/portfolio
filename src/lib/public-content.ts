// lib/public-content.ts
// Lapisan overlay: menimpa copy bundled dengan nilai settings admin.
//
// Dipanggil sekali di layout publik, SETELAH getMessages() dan
// getSiteSettings() selesai, jadi hasil akhirnya tidak pernah masuk cache —
// membatalkan tag "site-settings" atau "translations" langsung berlaku di
// request berikutnya.
//
// Peta overlay sengaja kecil dan eksplisit. Menambah key baru di sini berarti
//kopinya jadi milik admin; key yang tidak disebut di sini tetap murni i18n.
import type { SiteSettings } from "./settings";
import type { Messages } from "./translation-types";

/**
 * Murni (tanpa I/O). Ganti lima field yang sebelumnya hardcode nama author,
 * jabatan, bio, tagline, dan lokasi.
 *
 * `hero.greeting` berubah jadi templat: "Hi, I'm {name}". Nilai templat sama
 * untuk en dan id, jadi penggantian nama cukup `.replace` satu baris — tanpa
 * library interpolasi.
 */
export function composePublicContent(
  messages: Messages,
  settings: SiteSettings,
): Messages {
  return {
    ...messages,
    hero: {
      ...messages.hero,
      greeting: messages.hero.greeting.replace("{name}", settings.fullName),
      title: settings.jobTitle,
      description: settings.bio,
    },
    footer: {
      ...messages.footer,
      tagline: settings.tagline,
    },
    contact: {
      ...messages.contact,
      location: settings.location,
    },
  };
}
