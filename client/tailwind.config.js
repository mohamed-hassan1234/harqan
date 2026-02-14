/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,jsx}'
  ],
  theme: {
    extend: {
      colors: {
        ink: '#1B1F24',
        sand: '#F6F0E6',
        clay: '#D9B08C',
        ember: '#D72638',
        moss: '#2C5F2D',
        slate: '#3D4C5C'
      },
      fontFamily: {
        display: ['"DM Serif Display"', 'serif'],
        body: ['"Manrope"', 'sans-serif']
      },
      boxShadow: {
        soft: '0 10px 30px rgba(27,31,36,0.12)'
      }
    }
  },
  plugins: []
};
