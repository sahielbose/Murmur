import type { Config } from "tailwindcss";

/**
 * Base Tailwind configuration. The Murmur design-token mapping
 * (colors, radii, fonts, motion) is layered on in Phase 2 —
 * see MURMUR_UI.md §3.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};

export default config;
