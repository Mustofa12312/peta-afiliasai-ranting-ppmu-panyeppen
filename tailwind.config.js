/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        pondok: {
          light: '#e0f2fe',
          DEFAULT: '#16a34a', // Emerald green
          dark: '#14532d',
        }
      }
    },
  },
  plugins: [],
}
