/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          light: '#4299e1',
          DEFAULT: '#3182ce',
          dark: '#2c5282',
        },
        secondary: {
          light: '#9ae6b4',
          DEFAULT: '#68d391',
          dark: '#38a169',
        },
        danger: {
          light: '#fc8181',
          DEFAULT: '#f56565',
          dark: '#c53030',
        },
        warning: {
          light: '#fbd38d',
          DEFAULT: '#f6ad55',
          dark: '#dd6b20',
        },
        success: {
          light: '#9ae6b4',
          DEFAULT: '#68d391',
          dark: '#38a169',
        },
      },
    },
  },
  plugins: [],
  darkMode: 'class',
}
