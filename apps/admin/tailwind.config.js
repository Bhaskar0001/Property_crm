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
          DEFAULT: '#004274',
          accent: '#6fabca',
        },
        dark: {
          DEFAULT: '#0b1329',
        }
      }
    },
  },
  plugins: [],
}
