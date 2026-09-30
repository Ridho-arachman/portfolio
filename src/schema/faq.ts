import { z } from "zod";

import { DEFAULT_LOCALE, LOCALES } from "@/lib/i18n";

// Body POST /api/faq.
//
// `question` boleh kosong dan itu bukan kesalahan: kosong berarti "sapaan dulu",
// jadi endpoint membalas intro + chip. Batas 280 mengikuti textarea di panel
// PortoBot — pertanyaan lebih panjang itu lebih banyak diketik, bukan lebih tepat, karena
// pencocokan intent di `lib/faq.ts` cuma memungut maksimal dua kata kunci.
export const faqApiSchema = z.object({
  question: z.string().trim().max(280).default(""),
  locale: z.enum(LOCALES).default(DEFAULT_LOCALE),
});

export type FaqApiValues = z.infer<typeof faqApiSchema>;
