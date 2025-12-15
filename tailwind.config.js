/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        "primary": "#34d399",
        "secondary": "#22d3ee",
        "accent-purple": "#a78bfa",
        "accent-pink": "#f472b6",
        "dark-bg": "#0f172a",
        "light-bg": "#f1f5f9",
        "card-bg": "#1e293b",
        "text-main": "#0f172a",
        "text-sub": "#64748b",

        "primary-legacy": {
          DEFAULT: "#135bec",
          dark: "#0f4bbd",
          hover: "#0e4ac2",
        },

        success: "#22c55e",
        error: "#ef4444",
        background: {
          light: "#f6f6f8",
          dark: "#0f172a",
        },
        surface: {
          light: "#ffffff",
          dark: "#1e293b",
        },
      },
      fontFamily: {
        display: ["Manrope", "Noto Sans", "sans-serif"],
        sans: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        "2xl": "1rem",
        "full": "9999px",
      },
    },
  },
  plugins: [],
}
