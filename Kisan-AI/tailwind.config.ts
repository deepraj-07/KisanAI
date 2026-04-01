/**
 * tailwind.config.ts
 * Extended Tailwind configuration for Kisan AI design system.
 */

import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./core/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      // Font families
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "monospace"],
      },

      // Custom color palette
      colors: {
        "kisan": {
          bg:          "#0F0F0F",
          surface:     "#1A1A1A",
          elevated:    "#242424",
          hover:       "#2D2621",
          border:      "#3A332C",
          text:        "#F5F0E8",
          muted:       "#B8A99A",
          faint:       "#9F9386",
          primary:     "#E86B2E",
          secondary:   "#2D5016",
          accent:      "#F4C430",
          success:     "#4CAF50",
          warning:     "#FF9800",
          danger:      "#F44336",
          amber:       "#f59e0b",
        },
      },

      // Background images
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "kisan-grid":
          "linear-gradient(rgba(58, 51, 44, 0.35) 1px, transparent 1px), linear-gradient(90deg, rgba(58, 51, 44, 0.35) 1px, transparent 1px)",
      },

      // Custom shadows
      boxShadow: {
        "green-sm":  "0 0 10px rgba(232, 107, 46, 0.18)",
        "green-md":  "0 0 20px rgba(232, 107, 46, 0.25)",
        "green-lg":  "0 0 40px rgba(244, 196, 48, 0.22)",
        "card":      "0 1px 3px rgba(0,0,0,0.4), 0 1px 2px rgba(0,0,0,0.3)",
        "card-hover":"0 4px 12px rgba(0,0,0,0.5), 0 2px 4px rgba(0,0,0,0.3)",
      },

      // Animations
      keyframes: {
        "fade-in-up": {
          "0%":   { opacity: "0", transform: "translateY(12px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        "fade-in": {
          "0%":   { opacity: "0" },
          "100%": { opacity: "1" },
        },
        shimmer: {
          "0%":   { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 0.4s ease forwards",
        "fade-in":    "fade-in 0.3s ease forwards",
        "shimmer":    "shimmer 1.5s infinite",
      },

      // Border radius
      borderRadius: {
        "2xl": "1rem",
        "3xl": "1.5rem",
      },
    },
  },
  plugins: [],
};

export default config;