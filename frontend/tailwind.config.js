/** @type {import("tailwindcss").Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        "th-bg":        "var(--th-bg)",
        "th-surface":   "var(--th-surface)",
        "th-elevated":  "var(--th-elevated)",
        "th-hover":     "var(--th-hover)",
        "th-sidebar":   "var(--th-sidebar)",
        "th-text":      "var(--th-text)",
        "th-secondary": "var(--th-secondary)",
        "th-muted":     "var(--th-muted)",
        "th-border":    "var(--th-border)",
        "th-input":     "var(--th-input)",
        accent:         "#1DB954",
        "accent-bright":"#3DDC84",
      },
      fontFamily: {
        sans: ["Inter", "-apple-system", "BlinkMacSystemFont", "Segoe UI", "sans-serif"],
      },
      boxShadow: {
        card:     "var(--th-shadow-card)",
        "card-lg":"var(--th-shadow-card-hover)",
        dropdown: "var(--th-shadow-dropdown)",
        "accent-sm": "0 0 16px rgba(29,185,84,0.25)",
        glow:        "0 0 40px rgba(29,185,84,0.2)",
      },
    },
  },
  plugins: [],
};
