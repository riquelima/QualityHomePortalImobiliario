/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
    "./components/**/*.{js,ts,jsx,tsx}",
    "./pages/**/*.{js,ts,jsx,tsx}",
    "./*.{js,ts,jsx,tsx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Plus Jakarta Sans', 'Outfit', 'sans-serif'],
      },
      colors: {
        'brand-red': '#D81B2B',
        'brand-navy': '#0D284F',
        'brand-dark': '#041020',
        'brand-gray': '#5A677D',
        'brand-light-gray': '#F0F2F5',
        'brand-status': {
          'green': '#10B981',
          'orange': '#F59E0B',
        }
      }
    }
  },
  plugins: [
    require('@tailwindcss/typography')
  ],
}