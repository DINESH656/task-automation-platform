/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        glow: "0 0 35px rgba(34, 211, 238, 0.22)",
        purpleGlow: "0 0 35px rgba(168, 85, 247, 0.2)",
      },
    },
  },
  plugins: [],
};
