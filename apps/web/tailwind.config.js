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
          hover: '#00335a',
          light: '#0a5996',
          accent: '#6fabca',
        },
        dark: {
          DEFAULT: '#0b192c',
          navy: '#002544',
          surface: '#122238',
        },
        surface: {
          DEFAULT: '#f8f9fa',
          muted: '#eef2f6',
        }
      },
      fontFamily: {
        sans: ['Jost', 'Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
