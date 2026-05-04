import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        // Warm ivory/cream palette — inspired by Function Health
        cream: {
          50:  "#FDFBF7",
          100: "#F9F5EE",
          200: "#F3EDE3",
          300: "#E8E0D4",
          400: "#D4C9BB",
          500: "#B8ADA0",
        },
        // Copper / terracotta accent — replaces blue
        copper: {
          DEFAULT: "#B8906F",
          light:   "#D4B896",
          dark:    "#9A7458",
          50:      "#FAF5F0",
          100:     "#F0E4D6",
          200:     "#E4CFBA",
          500:     "#B8906F",
          600:     "#9A7458",
          700:     "#7D5E47",
        },
        // Warm neutral text scale
        stone: {
          50:  "#FAF9F7",
          100: "#F3F1ED",
          200: "#E8E4DE",
          300: "#D4CFC7",
          400: "#9B958E",
          500: "#7A756F",
          600: "#5E5A55",
          700: "#45423E",
          800: "#2D2A26",
          900: "#1A1815",
        },
        // Muted semantic colors — restrained, not neon
        sage:    { DEFAULT: "#6B8F71", light: "#EBF2EC", dark: "#4A6E50" },
        amber:   { DEFAULT: "#C4956A", light: "#FBF3EB", dark: "#A07A52" },
        rose:    { DEFAULT: "#B07070", light: "#F8EDEC", dark: "#8F5555" },
        slate:   { DEFAULT: "#7B8FA4", light: "#EDF1F5", dark: "#5D7389" },
        plum:    { DEFAULT: "#8B7FA4", light: "#F0EDF5", dark: "#6E6388" },
      },
      fontFamily: {
        serif:  ["Playfair Display", "Georgia", "Times New Roman", "serif"],
        sans:   ["Inter", "system-ui", "-apple-system", "sans-serif"],
        mono:   ["JetBrains Mono", "Fira Code", "monospace"],
      },
      fontSize: {
        "display": ["2.25rem", { lineHeight: "1.15", letterSpacing: "-0.03em", fontWeight: "600" }],
        "heading": ["1.5rem",  { lineHeight: "1.25", letterSpacing: "-0.02em", fontWeight: "600" }],
        "title":   ["1.125rem", { lineHeight: "1.35", letterSpacing: "-0.015em", fontWeight: "600" }],
        "body":    ["0.875rem", { lineHeight: "1.6" }],
        "caption": ["0.75rem",  { lineHeight: "1.5" }],
        "micro":   ["0.6875rem", { lineHeight: "1.45" }],
      },
      borderRadius: {
        "xl":  "12px",
        "2xl": "16px",
        "3xl": "20px",
      },
      boxShadow: {
        "subtle":   "0 1px 2px rgba(0,0,0,0.03)",
        "card":     "0 1px 3px rgba(0,0,0,0.04)",
        "elevated": "0 4px 12px rgba(0,0,0,0.06)",
        "none":     "none",
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
      },
    },
  },
  plugins: [require("@tailwindcss/forms")],
};

export default config;
