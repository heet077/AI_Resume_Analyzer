/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./app/**/*.{js,ts,jsx,tsx}",
    "./app/components/**/*.{js,ts,jsx,tsx}",
    "./app/routes/**/*.{js,ts,jsx,tsx}",
    "./app/lib/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Mona Sans", "ui-sans-serif", "system-ui", "sans-serif"],
      },
      colors: {
        "dark-200": "#475467",
        "light-blue-100": "#c1d3f81a",
        "light-blue-200": "#a7bff14d",
        "badge-green": "#d5faf1",
        "badge-red": "#f9e3e2",
        "badge-yellow": "#fceed8",
        "badge-green-text": "#254d4a",
        "badge-red-text": "#752522",
        "badge-yellow-text": "#73321b",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      animation: {
        "fade-in": "fadeIn 0.5s ease-in-out",
        "slide-in-from-top": "slideInFromTop 0.3s ease-out",
        "zoom-in": "zoomIn 0.2s ease-out",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        slideInFromTop: {
          "0%": { transform: "translateY(-10px)", opacity: "0" },
          "100%": { transform: "translateY(0)", opacity: "1" },
        },
        zoomIn: {
          "0%": { transform: "scale(0.95)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" },
        },
      },
    },
  },
  plugins: [],
};
