/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#f0f7ff',
          100: '#e0effe',
          200: '#bae2fd',
          300: '#7ccbfd',
          400: '#38b0fa',
          500: '#0ea0ea', // JEE brand-like blue
          600: '#027ebd',
          700: '#036599',
          800: '#07567f',
          900: '#0c486a',
          950: '#082d47',
        },
        jee: {
          // Actual JEE theme colors
          header: '#002B49',
          accent: '#FF7F00', // Orange buttons
          answered: '#2D8A4E', // Green
          notAnswered: '#B83232', // Red
          markedReview: '#563D7C', // Purple
          markedAnsweredReview: '#9F5EB8', // violet/purple with check mark
          notVisited: '#E8ECF1', // Light grey
        }
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
      },
      boxShadow: {
        'premium': '0 4px 20px -2px rgba(12, 72, 106, 0.08), 0 2px 8px -1px rgba(12, 72, 106, 0.04)',
      },
    },
  },
  plugins: [],
}
