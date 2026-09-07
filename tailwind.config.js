/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        // Jewellery Khazana & Ivory Royal Design System
        ivory: "#fdfbf9",
        "ivory-light": "#ffffff",
        "ivory-card": "#ffffff",
        "ivory-card-high": "#f8f5ee",
        "ivory-border": "#ede7dc",
        "ivory-border-subtle": "rgba(212, 175, 55, 0.2)",
        gold: "#d4af37",
        "gold-primary": "#b8860b",
        "gold-light": "#fdf8ed",
        "gold-bright": "#f2ca50",
        "gold-dim": "#8c6b12",
        "gold-banner": "#f6d172",
        charcoal: "#1a160d",
        "charcoal-muted": "#78716c",

        // Semantic bindings for Light Theme
        primary: "#b8860b",
        "primary-container": "#f6d172",
        "on-primary": "#ffffff",
        background: "#fdfbf9",
        "on-background": "#1a160d",
        surface: "#ffffff",
        "on-surface": "#1a160d",
        "surface-container": "#f8f5ee",
        "surface-container-high": "#f3ede2",
        "surface-variant": "#f4efe6",
        "on-surface-variant": "#78716c",
        outline: "#ede7dc",
        "outline-variant": "#e2d9cb",
      },
      borderRadius: {
        DEFAULT: "0.375rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        full: "9999px",
      },
      spacing: {
        gutter: "24px",
        unit: "8px",
        "margin-desktop": "64px",
        "container-max": "1440px",
        "section-gap": "80px",
        "margin-mobile": "16px",
      },
      fontFamily: {
        serif: ["'Playfair Display'", "serif"],
        sans: ["'Montserrat'", "sans-serif"],
        display: ["'Playfair Display'", "serif"],
        body: ["'Montserrat'", "sans-serif"],
      },
      boxShadow: {
        "gold-glow": "0 0 25px -5px rgba(212, 175, 55, 0.25)",
        "gold-sm": "0 2px 10px -2px rgba(212, 175, 55, 0.2)",
        "card-light": "0 4px 20px -2px rgba(0, 0, 0, 0.05)",
        "card-dark": "0 10px 30px -10px rgba(0, 0, 0, 0.08)",
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("@tailwindcss/container-queries"),
  ],
};
