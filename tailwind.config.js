/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        'deal-green': '#22c55e',
        'deal-gold': '#eab308',
        'deal-red': '#ef4444',
      },
    },
  },
  plugins: [],
}
