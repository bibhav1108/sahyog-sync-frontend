/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      keyframes: {
        // 🔥 modal / elements entry
        "slide-in": {
          "0%": {
            opacity: "0",
            transform: "translateY(-10px) scale(0.95)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0) scale(1)",
          },
        },

        // 🔥 fade overlay (background dim)
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },

        // 🔥 loading bar (for feedback)
        progress: {
          "0%": { width: "100%" },
          "100%": { width: "0%" },
        },

        // 🔥 spinner (optional if you want custom)
        spinSlow: {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
      },

      animation: {
        // modal animation
        "slide-in": "slide-in 0.25s ease-out",

        // overlay fade
        "fade-in": "fade-in 0.2s ease-out",

        // loading bar
        progress: "progress 3s linear forwards",

        // custom slow spin (optional)
        "spin-slow": "spinSlow 1s linear infinite",
      },
    },
  },

  plugins: [],
};
