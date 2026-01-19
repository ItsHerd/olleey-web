/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        studio: {
          bg: "#0f0f10",
          panel: "#202124",
          panelAlt: "#1a1b1d",
          border: "#2a2b2f",
          text: "#e8eaed",
          muted: "#9aa0a6",
          accent: "#3ea6ff"
        }
      }
    }
  },
  plugins: []
};
