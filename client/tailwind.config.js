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
        navy: {
          900: '#0B1120',
          800: '#0F172A',
          700: '#1E293B',
          600: '#334155',
        },
        waygo: {
          blue: '#2563EB',
          indigo: '#3730A3',
          fastest: '#1677FF',
          cheapest: '#059669',
          shortest: '#E11D48',
          lightBg: '#F8FAFC',
          cardBg: '#FFFFFF',
          textMain: '#0F172A',
          textSec: '#64748B',
          error: '#DC2626',
          warning: '#D97706',
          success: '#059669',
        },
      },
      animation: {
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' },
        }
      }
    },
  },
  plugins: [],
}
