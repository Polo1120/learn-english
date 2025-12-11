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
        primary: {
          DEFAULT: "#135bec",
          dark: "#0f4bbd",
          hover: "#0e4ac2",
        },
        secondary: "#dbdfe6",
        success: "#22c55e",
        error: "#ef4444",
        background: {
          light: "#f6f6f8",
          dark: "#101622",
        },
        surface: {
          light: "#ffffff",
          dark: "#1e2430",
        },
      },
      fontFamily: {
        display: ["Manrope", "sans-serif"],
        sans: ["Manrope", "sans-serif"],
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
      },
    },
  },
  plugins: [],
}
