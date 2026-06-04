/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['DM Sans', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
        display: ['Syne', 'sans-serif'],
      },
      colors: {
        brand: {
          50: '#eef8f6',
          100: '#d5ede8',
          200: '#aedcd3',
          300: '#80c5b9',
          400: '#5ba99d',
          500: '#37877A', // The exact teal from your reference image
          600: '#2c6d62',
          700: '#23574e',
          800: '#1d453f',
          900: '#183834',
        },
        slate: {
          850: '#172033',
          950: '#090e1a',
        }
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-out',
        'slide-up': 'slideUp 0.4s ease-out',
        'slide-in-right': 'slideInRight 0.3s ease-out',
        'pulse-slow': 'pulse 3s ease-in-out infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(12px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        slideInRight: {
          '0%': { opacity: '0', transform: 'translateX(12px)' },
          '100%': { opacity: '1', transform: 'translateX(0)' },
        },
      },
      boxShadow: {
        // Glow shadows updated to match the teal accent color (RGB: 55, 135, 122)
        'glow': '0 0 20px rgba(55, 135, 122, 0.3)',
        'glow-sm': '0 0 10px rgba(55, 135, 122, 0.2)',
        // Card shadows softened to look better on a light background
        'card': '0 1px 3px rgba(0,0,0,0.05), 0 4px 16px rgba(0,0,0,0.03)',
        'card-hover': '0 4px 12px rgba(0,0,0,0.08), 0 8px 32px rgba(0,0,0,0.05)',
      }
    },
  },
  plugins: [],
}