/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './app/**/*.{js,jsx,ts,tsx}',
    './components/**/*.{js,jsx,ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#6366F1',
          600: '#4F46E5',
          700: '#4338CA',
          800: '#3730A3',
          900: '#312E81',
        },
        dark: {
          50: '#1A1A2E',
          100: '#16213E',
          200: '#0F0F23',
          300: '#0D0D1A',
          400: '#080810',
        },
        surface: {
          DEFAULT: '#1E1E3A',
          light: '#252547',
          lighter: '#2D2D5A',
        },
      },
    },
  },
  plugins: [],
};
