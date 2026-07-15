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
          bg: '#f0e6d8',
          secondary: '#e5d7c6',
          paper: '#f6eee4',
          ink: '#3a2c22',
          muted: '#7a6554',
          line: '#d4c2ae',
          terracotta: '#a85a3a',
          olive: '#5a4f3e'
        },
        brand: {
          500: '#a85a3a',
          600: '#8c4a30',
          700: '#5a4f3e'
        },
        ink: {
          50: '#f0e6d8',
          100: '#e5d7c6',
          500: '#7a6554',
          900: '#3a2c22'
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
