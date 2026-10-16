/**
 * Shared Arabic font for the health certificate page (header, title and card).
 *
 * Almarai: compact, rounded screen font – the closest free match to the original
 * certificate lettering (Lexend in the root layout has no Arabic glyphs).
 * Almarai only has weights 300/400/700/800, so font-medium (500) falls back to 400.
 */
import { Almarai } from "next/font/google";

export const arabicFont = Almarai({
  subsets: ["arabic"],
  weight: ["400", "700", "800"],
  display: "swap",
});
