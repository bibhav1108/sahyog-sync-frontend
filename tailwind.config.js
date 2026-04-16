/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],

  theme: {
    extend: {
      colors: {
        primary: "#0D7377",
        primary_container: "#14919B",
        azure: "#14919B",

        surface: "#FFF8F1",
        surface_low: "#F9F3EB",
        surface_lowest: "#FFFFFF",
        surface_high: "#EEE7DF",
        surface_highest: "#E8E1DA",

        on_surface: "#1E1B17",
        on_surface_variant: "#5C4A3A",
      },

      fontFamily: {
        outfit: ["Outfit", "sans-serif"],
        inter: ["Inter", "sans-serif"],
      },

      borderRadius: {
        lg: "1rem",
        xl: "1.25rem",
      },

      backdropBlur: {
        glass: "20px",
      },

      boxShadow: {
        soft: "0 20px 60px rgba(0,0,0,0.05)",
      },

      backgroundImage: {
        primaryGradient: "linear-gradient(135deg, #0D7377 0%, #14919B 100%)",

        shimmer:
          "linear-gradient(90deg, transparent 0%, rgba(232,225,218,0.6) 50%, transparent 100%)",
      },

      keyframes: {
        shimmer: {
          "0%": { transform: "translateX(-150%)" },
          "100%": { transform: "translateX(150%)" },
        },

        fadeIn: {
          "0%": {
            opacity: "0",
            transform: "translateY(6px)",
          },
          "100%": {
            opacity: "1",
            transform: "translateY(0)",
          },
        },
      },

      animation: {
        shimmer: "shimmer 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",

        fadeIn: "fadeIn 0.4s ease-out forwards",
      },
    },
  },

  plugins: [],
};
