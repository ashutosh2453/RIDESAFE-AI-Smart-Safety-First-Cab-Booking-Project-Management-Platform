/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          navy: '#0B132B',
          dark: '#111827',
          card: '#1F2937',
          cardSoft: '#374151',
          accent: '#00D2FF',
          accentHover: '#00B4D8',
          safetyAmber: '#F59E0B',
          sosRed: '#EF4444',
          successGreen: '#10B981',
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
