/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: [
          "Segoe UI",
          "system-ui",
          "-apple-system",
          "sans-serif",
        ],
      },
      colors: {
        board: {
          header: "#1e3a5f",
          headerText: "#f0f4f8",
          grid: "#f4f6f8",
          line: "#b8c4d0",
          accent: "#c45c26",
        },
      },
      boxShadow: {
        note: "2px 4px 10px rgba(0, 0, 0, 0.15)",
        "note-lift": "4px 8px 18px rgba(0, 0, 0, 0.2)",
      },
    },
  },
  plugins: [],
};
