import { Anton } from "next/font/google";

/**
 * Condensed display grotesque for the About page's cinematic headings only.
 * One weight (400) so it costs a single woff2, and `swap` so text is readable
 * before the face lands. Body copy stays on the site sans -- DESIGN.md 3.
 */
export const displayFont = Anton({
  subsets: ["latin"],
  weight: "400",
  display: "swap",
  variable: "--font-display",
});