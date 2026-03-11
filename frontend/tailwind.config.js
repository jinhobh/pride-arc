/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans:    ['"Plus Jakarta Sans"', 'sans-serif'],
        display: ['"Press Start 2P"', 'monospace'],
        vt:      ['VT323', 'monospace'],
      },
      colors: {
        game: {
          bg:      '#0F0F23',
          surface: '#16162a',
          card:    '#1e1e38',
          border:  '#2a2a4a',
        },
      },
      animation: {
        'pulse-slow':    'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow-green':    'glowGreen 2s ease-in-out infinite alternate',
        'hp-drain':      'hpDrain 1s ease-out forwards',
      },
      keyframes: {
        glowGreen: {
          '0%':   { boxShadow: '0 0 5px rgba(34,197,94,0.2)' },
          '100%': { boxShadow: '0 0 20px rgba(34,197,94,0.5), 0 0 40px rgba(34,197,94,0.1)' },
        },
        hpDrain: {
          '0%':   { width: '100%' },
          '100%': { width: 'var(--hp)' },
        },
      },
      boxShadow: {
        'neon-green':  '0 0 10px rgba(34,197,94,0.4), 0 0 30px rgba(34,197,94,0.1)',
        'neon-red':    '0 0 10px rgba(220,38,38,0.4), 0 0 30px rgba(220,38,38,0.1)',
        'neon-cyan':   '0 0 10px rgba(34,211,238,0.4)',
        'neon-purple': '0 0 10px rgba(167,139,250,0.4)',
      },
    },
  },
  plugins: [],
}
