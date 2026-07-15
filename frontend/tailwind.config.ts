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
          bg: '#f7efd8',
          secondary: '#efe3c4',
          paper: '#fbf4e3',
          ink: '#2a2216',
          muted: '#6d5f45',
          line: '#e2d3ad',
          terracotta: '#9a6435',
          olive: '#4a5a3a'
        },
        brand: {
          500: '#9a6435',
          600: '#7f522c',
          700: '#4a5a3a'
        },
        ink: {
          50: '#f7efd8',
          100: '#efe3c4',
          500: '#6d5f45',
          900: '#2a2216'
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
