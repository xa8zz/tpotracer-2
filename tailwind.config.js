/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        mono: ['Roboto Mono', 'monospace'],
      },
      colors: {
        gray: {
          900: '#121212',
          800: '#1e1e1e',
          700: '#2d2d2d',
          600: '#404040',
          500: '#555555',
          400: '#888888',
          300: '#aaaaaa',
          200: '#cccccc',
          100: '#eeeeee',
        },
        blue: {
          900: '#1e3a8a',
          800: '#1e40af',
          700: '#1d4ed8',
          600: '#2563eb',
          500: '#3b82f6',
          400: '#60a5fa',
        },
        green: {
          400: '#4ade80',
        },
        red: {
          500: '#ef4444',
        },
        amber: {
          900: '#78350f',
          800: '#92400e',
          700: '#b45309',
          600: '#d97706',
          500: '#f59e0b',
        },
      },
      keyframes: {
        blink: {
          '0%, 100%': { opacity: 1 },
          '50%': { opacity: 0 },
        },
      },
      animation: {
        blink: 'blink 1s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};