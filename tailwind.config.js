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
          bg: "#F5F7FA",
          bgAlt: "#ffffff",
          card: "#ffffff",
          cardAlt: "#f0f2f5",
          text: "#000000",
          textSecondary: "#4a5568",
          accent: "#F05D5E",
          accentAlt: "#F05D5E",
          accentSecondary: "#e4b363",
          accentSecondaryAlt: "#d4a353",
          border: "#343a40",
          borderAlt: "#3a4149",
        },
        // Dark Theme
        dark: {
          bg: "#1a1c20",
          bgAlt: "#17191e",
          card: "#22262b",
          cardAlt: "#25292f",
          text: "#f0f2f5",
          textSecondary: "#a0a8b0",
          accent: "#f28a80",
          accentAlt: "#f0807b",
          accentSecondary: "#f0c674",
          accentSecondaryAlt: "#edc667",
          border: "#343a40",
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
        border: "hsl(214.3 31.8% 91.4%)",
        input: "hsl(214.3 31.8% 91.4%)",
        ring: "hsl(221.2 83.2% 53.3%)",
        background: "hsl(0 0% 100%)",
        foreground: "hsl(222.2 84% 4.9%)",
        primary: {
          DEFAULT: "hsl(221.2 83.2% 53.3%)",
          foreground: "hsl(210 40% 98%)",
        },
        secondary: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        destructive: {
          DEFAULT: "hsl(0 84.2% 60.2%)",
          foreground: "hsl(210 40% 98%)",
        },
        muted: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(215.4 16.3% 46.9%)",
        },
        accent: {
          DEFAULT: "hsl(210 40% 96.1%)",
          foreground: "hsl(222.2 47.4% 11.2%)",
        },
        popover: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
        card: {
          DEFAULT: "hsl(0 0% 100%)",
          foreground: "hsl(222.2 84% 4.9%)",
        },
      },
    }
  },
  plugins: []
};
