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
          bg: '#f8f4eb',
          secondary: '#f0eae0',
          paper: '#faf6ef',
          ink: '#1c1916',
          muted: '#5c564c',
          line: '#e4dbd0',
          terracotta: '#8b5a3c',
          olive: '#3d4a38'
        },
        brand: {
          500: '#8b5a3c',
          600: '#735033',
          700: '#3d4a38'
        },
        ink: {
          50: '#f8f4eb',
          100: '#f0eae0',
          500: '#5c564c',
          900: '#1c1916'
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
