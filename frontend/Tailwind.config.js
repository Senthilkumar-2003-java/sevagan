/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        primary:            '#0f5238',
        'primary-container':'#2d6a4f',
        secondary:          '#785a00',
        'secondary-container': '#fdcb52',
        'on-primary':       '#ffffff',
        surface:            '#fbf9f8',
        'on-surface':       '#1b1c1c',
      },
      fontFamily: {
        serif: ['Noto Serif', 'serif'],
        sans:  ['Manrope', 'sans-serif'],
      },
    },
  },
  plugins: [],
}