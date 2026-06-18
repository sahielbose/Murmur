import { Inter, Fraunces } from "next/font/google";

/**
 * Murmur typography (MURMUR_UI.md §4):
 *  - Inter        → UI / headings / body (the workhorse), exposed as --font-sans
 *  - Fraunces     → the `Murmur` wordmark + occasional editorial display,
 *                   exposed as --font-serif (high-contrast variable serif)
 */
export const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const fraunces = Fraunces({
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});
