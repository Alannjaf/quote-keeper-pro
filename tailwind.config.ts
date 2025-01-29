import type { Config } from "tailwindcss";

export default {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
    "./src/**/*.{ts,tsx}",
  ],
  prefix: "",
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "#FFFFFF",
        foreground: "#1D1D1F",
        primary: {
          DEFAULT: "#0071E3",
          hover: "#0077ED",
          foreground: "#FFFFFF",
        },
        secondary: {
          DEFAULT: "#F5F5F7",
          foreground: "#1D1D1F",
        },
        destructive: {
          DEFAULT: "#FF3B30",
          foreground: "#FFFFFF",
        },
        muted: {
          DEFAULT: "#F5F5F7",
          foreground: "#86868B",
        },
        accent: {
          DEFAULT: "#F5F5F7",
          foreground: "#1D1D1F",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "#FFFFFF",
          foreground: "#1D1D1F",
        },
        status: {
          draft: "#86868B",
          pending: "#FF9F0A",
          rejected: "#FF3B30",
          approved: "#34C759",
          invoiced: "#5856D6",
        },
      },
      borderRadius: {
        lg: "0.75rem",
        md: "0.625rem",
        sm: "0.5rem",
      },
      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
} satisfies Config;