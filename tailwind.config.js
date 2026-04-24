/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#006B3F", // Zambia Green
          dark: "#005a35",
          light: "#32de84", // User's theme color
        },
        secondary: {
          DEFAULT: "#EF7D00", // Zambia Orange
          dark: "#d66f00",
        },
        zambia: {
          green: "#006B3F",
          orange: "#EF7D00",
          red: "#DE2010",
          black: "#000000",
        },
        status: {
          pending: {
            bg: "#FEF9C3",
            text: "#A16207"
          },
          active: {
            bg: "#DCFCE7",
            text: "#15803D"
          },
          suspended: {
            bg: "#FEE2E2",
            text: "#DC2626"
          },
          rejected: {
            bg: "#FEE2E2",
            text: "#B91C1C"
          }
        }
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
      },
      keyframes: {
        'pulse-slow': {
          '0%, 100%': { opacity: '0.8', transform: 'scale(1.05)' },
          '50%': { opacity: '1', transform: 'scale(1)' },
        },
        'shake': {
          '0%, 100%': { transform: 'translateX(0)' },
          '10%, 30%, 50%, 70%, 90%': { transform: 'translateX(-5px)' },
          '20%, 40%, 60%, 80%': { transform: 'translateX(5px)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-in-from-top': {
          '0%': { transform: 'translateY(-10px)' },
          '100%': { transform: 'translateY(0)' },
        }
      },
      animation: {
        'pulse-slow': 'pulse-slow 10s ease-in-out infinite',
        'shake': 'shake 0.5s ease-in-out',
        'in': 'fade-in 0.3s ease-out, slide-in-from-top 0.3s ease-out',
      },
    },
  },
  plugins: [],
}
