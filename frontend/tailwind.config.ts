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
          bg: '#faf9f7',
          secondary: '#f3f1ed',
          paper: '#ffffff',
          ink: '#1a1a1a',
          muted: '#5c5c5c',
          line: '#e8e4de',
          terracotta: '#8b5a3c',
          olive: '#3d4a38'
        },
        brand: {
          500: '#8b5a3c',
          600: '#735033',
          700: '#3d4a38'
        },
        ink: {
          50: '#faf9f7',
          100: '#f3f1ed',
          500: '#5c5c5c',
          900: '#1a1a1a'
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
