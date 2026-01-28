/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}", "./components/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      animation: {
        "shimmer-slide":
          "shimmer-slide var(--speed) ease-in-out infinite alternate",
        "spin-around": "spin-around calc(var(--speed) * 2) infinite linear",
        "element": "fadeSlideIn 0.6s ease-out forwards",
        "slide-right": "slideRightIn 0.8s ease-out forwards",
        "testimonial": "testimonialIn 0.6s ease-out forwards",
      },
      keyframes: {
        "spin-around": {
          "0%": {
            transform: "translateZ(0) rotate(0)",
          },
          "15%, 35%": {
            transform: "translateZ(0) rotate(90deg)",
          },
          "65%, 85%": {
            transform: "translateZ(0) rotate(270deg)",
          },
          "100%": {
            transform: "translateZ(0) rotate(360deg)",
          },
        },
        "shimmer-slide": {
          to: {
            transform: "translate(calc(100cqw - 100%), 0)",
          },
        },
        "fadeSlideIn": {
          "0%": {
            opacity: "0",
            filter: "blur(10px)",
            transform: "translateY(20px)",
          },
          "100%": {
            opacity: "1",
            filter: "blur(0px)",
            transform: "translateY(0px)",
          },
        },
        "slideRightIn": {
          "0%": {
            opacity: "0",
            filter: "blur(10px)",
            transform: "translateX(40px)",
          },
          "100%": {
            opacity: "1",
            filter: "blur(0px)",
            transform: "translateX(0px)",
          },
        },
        "testimonialIn": {
          "0%": {
            opacity: "0",
            filter: "blur(10px)",
            transform: "translateY(20px) scale(0.9)",
          },
          "100%": {
            opacity: "1",
            filter: "blur(0px)",
            transform: "translateY(0px) scale(1)",
          },
        },
      },
      colors: {
        // Light Theme
        light: {
          bg: "#F9FAFB",
          bgAlt: "#F3F4F6",
          card: "#ffffff",
          cardAlt: "#F9FAFB",
          text: "#000000",
          textSecondary: "#4a5568",
          accent: "#F05D5E",
          accentAlt: "#F05D5E",
          accentSecondary: "#e4b363",
          accentSecondaryAlt: "#d4a353",
          border: "#e2e8f0",
          borderAlt: "#cbd5e1",
        },
        // Dark Theme
        dark: {
          bg: "#0A0A0A",
          bgAlt: "#0F0F0F",
          card: "#141414",
          cardAlt: "#1A1A1A",
          text: "#f0f2f5",
          textSecondary: "#a0a8b0",
          accent: "#f28a80",
          accentAlt: "#f0807b",
          accentSecondary: "#f0c674",
          accentSecondaryAlt: "#edc667",
          border: "#1c1c1c",
        },
        // Olleey Theme Colors
        olleey: {
          black: "#272932",
          white: "#FFFFFF",
          yellow: "#EEB868",
        },
        // Legacy colors for backward compatibility
        sheaperd: {
          black: "#000000",
          graphite: "#2E2E2E",
          snow: "#FAFAFA",
          lavender: "#8D99AE"
        },
        studio: {
          bg: "#0f0f10",
          panel: "#202124",
          panelAlt: "#1a1b1d",
          border: "#2a2b2f",
          text: "#e8eaed",
          muted: "#9aa0a6",
          accent: "#3ea6ff"
        },
        border: "var(--theme-border)",
        input: "var(--theme-border)",
        ring: "var(--theme-accent)",
        background: "var(--theme-bg)",
        foreground: "var(--theme-text)",
        primary: {
          DEFAULT: "var(--theme-accent)",
          foreground: "#ffffff",
        },
        secondary: {
          DEFAULT: "var(--theme-accent-secondary)",
          foreground: "#ffffff",
        },
        destructive: {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "var(--theme-bg-alt)",
          foreground: "var(--theme-text-secondary)",
        },
        accent: {
          DEFAULT: "var(--theme-accent)",
          foreground: "#ffffff",
        },
        popover: {
          DEFAULT: "var(--theme-card)",
          foreground: "var(--theme-text)",
        },
        card: {
          DEFAULT: "var(--theme-card)",
          foreground: "var(--theme-text)",
        },
      },
    }
  },
  plugins: []
};
