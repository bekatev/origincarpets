import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{js,ts,jsx,tsx}', './components/**/*.{js,ts,jsx,tsx}'],
  darkMode: ['class'],
  theme: {
    extend: {
      screens: {
        xs: '480px',
        '3xl': '1800px'
      },
      fontFamily: {
        display: ['"Playfair Display"', 'serif'],
        sans: ['"Inter"', 'system-ui', 'sans-serif']
      },
      colors: {
        luxury: {
          bg: '#c5ae8e',
          secondary: '#b89f7c',
          paper: '#d2bea0',
          ink: '#342827',
          muted: '#5c4a42',
          line: '#a89272',
          terracotta: '#8f4a32',
          olive: '#4a3c34'
        },
        brand: {
          500: '#8f4a32',
          600: '#6e5848',
          700: '#4a3c34'
        },
        ink: {
          50: '#c5ae8e',
          100: '#b89f7c',
          500: '#5c4a42',
          900: '#342827'
        }
      },
      boxShadow: {
        luxury: 'var(--oc-shadow-lift)',
        soft: 'var(--oc-shadow)'
      },
      borderRadius: {
        luxury: '1.5rem'
      },
      transitionTimingFunction: {
        luxury: 'cubic-bezier(0.22, 1, 0.36, 1)'
      },
      letterSpacing: {
        editorial: '0.12em'
      }
    }
  },
  plugins: []
};

export default config;
