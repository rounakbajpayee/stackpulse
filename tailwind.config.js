/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        background: '#0B0F19',
        surface: '#111827',
        'surface-hover': '#1F2937',
        border: '#1F2937',
        supabase: {
          DEFAULT: '#3ECF8E',
          dark: '#24B47E',
          light: '#6EE7B7'
        },
        firebase: {
          DEFAULT: '#F59E0B',
          dark: '#D97706'
        }
      }
    },
  },
  plugins: [],
}
