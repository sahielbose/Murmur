import type { Config } from "tailwindcss";

/**
 * Murmur design-token mapping (MURMUR_UI.md §3). Colors, radii, fonts, shadows,
 * and motion all resolve to the CSS variables defined in `app/globals.css`.
 *
 * The palette exposes two layers:
 *  - Murmur semantic tokens (`bg`, `fg`, `fg-muted`, `border`, `primary`, `rec`, …)
 *    used by hand-written marketing/app composites.
 *  - shadcn/ui aliases (`background`, `foreground`, `card`, `popover`, `muted`,
 *    `accent`, `destructive`, `input`, `ring`, …) mapped onto the same tokens so
 *    generated primitives inherit the Murmur look. The optional indigo accent is
 *    exposed as `brand` to avoid colliding with shadcn's subtle `accent` surface.
 */
const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{ts,tsx,mdx}",
    "./components/**/*.{ts,tsx,mdx}",
    "./lib/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // ── Murmur semantic tokens ──────────────────────────────────────────
        bg: "var(--bg)",
        "bg-subtle": "var(--bg-subtle)",
        "bg-elevated": "var(--bg-elevated)",
        "bg-inverse": "var(--bg-inverse)",
        fg: {
          DEFAULT: "var(--fg)",
          strong: "var(--fg-strong)",
          muted: "var(--fg-muted)",
          subtle: "var(--fg-subtle)",
          inverse: "var(--fg-inverse)",
          "inverse-muted": "var(--fg-inverse-muted)",
        },
        "border-strong": "var(--border-strong)",
        success: "var(--success)",
        warning: "var(--warning)",
        danger: "var(--danger)",
        rec: "var(--rec)",
        brand: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          foreground: "var(--accent-fg)",
        },

        // ── shadcn/ui aliases (mapped onto Murmur tokens) ───────────────────
        border: "var(--border)",
        input: "var(--border)",
        ring: "var(--ring)",
        background: "var(--bg)",
        foreground: "var(--fg)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-fg)",
        },
        secondary: {
          DEFAULT: "var(--bg-subtle)",
          foreground: "var(--fg)",
        },
        muted: {
          DEFAULT: "var(--bg-subtle)",
          foreground: "var(--fg-muted)",
        },
        accent: {
          DEFAULT: "var(--bg-subtle)",
          foreground: "var(--fg)",
        },
        destructive: {
          DEFAULT: "var(--danger)",
          foreground: "#ffffff",
        },
        card: {
          DEFAULT: "var(--bg-elevated)",
          foreground: "var(--fg)",
        },
        popover: {
          DEFAULT: "var(--bg)",
          foreground: "var(--fg)",
        },
      },
      borderRadius: {
        none: "0",
        sm: "calc(var(--radius) - 4px)",
        md: "calc(var(--radius) - 2px)",
        lg: "var(--radius)",
        xl: "var(--radius-lg)",
        "2xl": "var(--radius-xl)",
        "3xl": "var(--radius-2xl)",
        full: "var(--radius-pill)",
      },
      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "Segoe UI",
          "Roboto",
          "Helvetica",
          "Arial",
          "sans-serif",
        ],
        serif: ["var(--font-serif)", "ui-serif", "Georgia", "serif"],
      },
      boxShadow: {
        sm: "var(--shadow-sm)",
        DEFAULT: "var(--shadow)",
        lg: "var(--shadow-lg)",
      },
      maxWidth: {
        container: "var(--container)",
        "container-narrow": "var(--container-narrow)",
      },
      spacing: {
        nav: "var(--nav-h)",
      },
      transitionTimingFunction: {
        ease: "var(--ease)",
      },
      transitionDuration: {
        1: "var(--dur-1)",
        2: "var(--dur-2)",
        3: "var(--dur-3)",
      },
      ringColor: {
        DEFAULT: "var(--ring)",
      },
    },
  },
  plugins: [],
};

export default config;
