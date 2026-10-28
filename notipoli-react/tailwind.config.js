/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#1a2f5a',
        secondary: '#4a90d9',
        accent: '#4a90d9',
      },
    },
  },
  plugins: [],
}