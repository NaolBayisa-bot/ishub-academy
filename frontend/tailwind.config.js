/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#ecfeff',
          100: '#cffafe',
          200: '#a5f3fc',
          300: '#67e8f9',
          400: '#22d3ee',
          500: '#06b6d4',
          600: '#0891b2',
          700: '#0e7490',
          800: '#155e75',
          900: '#164e63',
          950: '#083344',
        },
        tech: {
          surface: '#0a0a0f',
          card: '#12121a',
          border: '#1e1e2e',
          glow: 'rgba(6, 182, 212, 0.15)',
        },
      },
      fontFamily: {
        mono: ['"JetBrains Mono"', '"Fira Code"', 'Menlo', 'monospace'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      backgroundImage: {
        'tech-grid': 'linear-gradient(rgba(6, 182, 212, 0.03) 1px, transparent 1px), linear-gradient(90deg, rgba(6, 182, 212, 0.03) 1px, transparent 1px)',
        'hero-glow': 'radial-gradient(ellipse at 50% 0%, rgba(6, 182, 212, 0.25) 0%, transparent 60%)',
      },
      backgroundSize: {
        'tech-grid': '40px 40px',
      },
      boxShadow: {
        'tech': '0 0 0 1px rgba(6, 182, 212, 0.1), 0 4px 24px rgba(0, 0, 0, 0.3)',
        'tech-glow': '0 0 20px rgba(6, 182, 212, 0.08)',
      },
      borderRadius: {
        'tech': '6px',
      },
    },
  },
  plugins: [],
};
