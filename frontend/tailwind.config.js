/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Inter"', 'sans-serif'],
        display: ['"Crimson Pro"', 'serif'],
        vt:      ['VT323', 'monospace'],
      },
      colors: {
        game: {
          bg:      '#C8E6F5',
          surface: '#FAF3E0',
          card:    '#E8D5A3',
          border:  '#C4A87E',
        },
        ghibli: {
          sky:            '#C8E6F5',
          'sky-deep':     '#8BBDD9',
          forest:         '#4A7C59',
          'forest-light': '#7AAE87',
          cream:          '#FAF3E0',
          sand:           '#E8D5A3',
          earth:          '#8B6F47',
          sunset:         '#E8956D',
          dusk:           '#C47B5A',
          ink:            '#2C2416',
          mist:           '#6B7F6E',
          gold:           '#D4A843',
          spirit:         '#B8A9C9',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'hp-drain':   'hpDrain 1s ease-out forwards',
      },
      keyframes: {
        hpDrain: {
          '0%':   { width: '100%' },
          '100%': { width: 'var(--hp)' },
        },
      },
      boxShadow: {
        'ghibli-card':  '0 2px 12px rgba(44,36,22,0.07)',
        'ghibli-card-hover': '0 4px 20px rgba(44,36,22,0.12)',
        'neon-green':   '0 0 10px rgba(74,124,89,0.3), 0 0 24px rgba(74,124,89,0.1)',
        'neon-amber':   '0 0 10px rgba(212,168,67,0.35)',
        'neon-red':     '0 0 10px rgba(220,38,38,0.3)',
        'neon-cyan':    '0 0 10px rgba(34,211,238,0.3)',
        'neon-purple':  '0 0 10px rgba(167,139,250,0.3)',
      },
    },
  },
  plugins: [],
}
