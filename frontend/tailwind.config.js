/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Plus Jakarta Sans"', 'sans-serif'],
      },
      colors: {
        brand: {
          bg: '#020617',
          primary: '#0F172A',
          secondary: '#1E293B',
          accent: '#22C55E',
          text: '#F8FAFC',
        },
      },
    },
  },
  plugins: [],
}
