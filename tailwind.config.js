/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["Fraunces", "Georgia", "serif"]
      },
      colors: {
        pantry: {
          paper: "#f8f3ea",
          ink: "#2d2926",
          saffron: "#d97706",
          mint: "#0f766e",
          berry: "#9f1239",
          leaf: "#3f6212",
          china: "#dc2626",
          indigo: "#4338ca"
        }
      },
      boxShadow: {
        soft: "0 18px 60px rgba(45, 41, 38, 0.12)",
        stamp: "0 12px 30px rgba(15, 118, 110, 0.2)"
      },
      animation: {
        pop: "pop 450ms cubic-bezier(.2,1,.3,1)",
        shimmer: "shimmer 1.8s linear infinite",
        float: "float 4s ease-in-out infinite",
        confetti: "confetti 900ms ease-out forwards"
      },
      keyframes: {
        pop: {
          "0%": { transform: "scale(.94)", opacity: "0" },
          "100%": { transform: "scale(1)", opacity: "1" }
        },
        shimmer: {
          "0%": { backgroundPosition: "0% 50%" },
          "100%": { backgroundPosition: "200% 50%" }
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" }
        },
        confetti: {
          "0%": { transform: "translateY(0) rotate(0deg)", opacity: "1" },
          "100%": { transform: "translateY(90vh) rotate(520deg)", opacity: "0" }
        }
      }
    }
  },
  plugins: []
};
