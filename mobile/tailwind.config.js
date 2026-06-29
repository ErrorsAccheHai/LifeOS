/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./app/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  presets: [require('nativewind/preset')],
  theme: {
    extend: {
      colors: {
        // Primary brand colors
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
        // Dark theme backgrounds
        dark: {
          50: '#1A1A2E',
          100: '#16213E',
          200: '#0F0F23',
          300: '#0D0D1A',
          400: '#080810',
        },
        // Surface colors
        surface: {
          DEFAULT: '#1E1E3A',
          light: '#252547',
          lighter: '#2D2D5A',
        },
        // Accent colors
        accent: {
          pink: '#EC4899',
          cyan: '#06B6D4',
          emerald: '#10B981',
          amber: '#F59E0B',
          rose: '#F43F5E',
          violet: '#8B5CF6',
          orange: '#F97316',
        },
      },
      fontFamily: {
        sans: ['Inter', 'System'],
        mono: ['JetBrainsMono', 'Courier'],
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },
  plugins: [],
};
