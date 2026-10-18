/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
        heading: ['Outfit', 'Inter', 'sans-serif'],
      },
      colors: {
        netflix: {
          red: '#E50914',
          darkRed: '#B81D24',
        },
      },
      boxShadow: {
        'glow': '0 0 25px -5px rgba(229, 9, 20, 0.4)',
        'glow-lg': '0 0 35px -5px rgba(229, 9, 20, 0.6)',
      },
    },
  },
  plugins: [],
};
