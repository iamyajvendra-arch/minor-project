/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Government Portal Professional Color Palette (National Portal of India Styling)
        'gov-navy': {
          DEFAULT: '#0F2942',
          dark: '#0A1C2E',
          light: '#1B3F63',
        },
        'gov-blue': {
          DEFAULT: '#005A9C',
          light: '#EBF3FA',
          hover: '#004780',
        },
        'gov-saffron': {
          DEFAULT: '#E65100',
          light: '#FFF3E0',
        },
        'gov-green': {
          DEFAULT: '#1B5E20',
          light: '#E8F5E9',
          border: '#C8E6C9',
        },
        'gov-red': {
          DEFAULT: '#C62828',
          light: '#FFEBEE',
          border: '#FFCDD2',
        },
        'gov-orange': {
          DEFAULT: '#EF6C00',
          light: '#FFF8E1',
          border: '#FFE082',
        },
        'gov-border': '#E2E8F0',
        'gov-card': '#FFFFFF',
        'gov-bg': '#F4F6F9',
        'gov-text': {
          DEFAULT: '#1E293B',
          secondary: '#64748B',
          muted: '#94A3B8',
        },
      },
      fontFamily: {
        sans: ['Inter', 'Roboto', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'sans-serif'],
      },
      boxShadow: {
        'gov': '0 1px 3px rgba(0,0,0,0.06), 0 1px 2px rgba(0,0,0,0.04)',
        'gov-md': '0 4px 6px -1px rgba(0,0,0,0.08), 0 2px 4px -1px rgba(0,0,0,0.04)',
        'gov-lg': '0 10px 15px -3px rgba(0,0,0,0.08), 0 4px 6px -2px rgba(0,0,0,0.03)',
      },
    },
  },
  plugins: [],
}
